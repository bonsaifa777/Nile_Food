import express from 'express';
import Order from '../models/Order.js';
import Food from '../models/Food.js';
import Table from '../models/Table.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';
import { apiResponse, generateOrderId } from '../../shared/utils.js';
import { ORDER_STATUS, ORDER_TYPE, PAYMENT_STATUS, SOCKET_EVENTS } from '../../shared/constants.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const query = {};
    if (['admin', 'super_admin', 'kitchen_staff', 'delivery_driver'].includes(req.user.role)) {
      if (status) query.status = status;
      if (type) query.type = type;
    } else {
      query.user = req.user._id;
      if (status) query.status = status;
      if (type) query.type = type;
    }
    const orders = await Order.find(query)
      .populate('items.food', 'name image')
      .populate('table', 'tableNumber')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Order.countDocuments(query);
    res.json(apiResponse(true, '', { orders, total, page: parseInt(page), limit: parseInt(limit) }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch orders'));
  }
});

router.get('/active', optionalAuth, async (req, res) => {
  try {
    const query = { 
      status: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.ON_WAY] } 
    };
    if (req.user) query.user = req.user._id;
    const orders = await Order.find(query)
      .populate('items.food', 'name image')
      .populate('table', 'tableNumber')
      .sort({ createdAt: -1 });
    res.json(apiResponse(true, '', orders));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch active orders'));
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('items.food', 'name image')
      .populate('table', 'tableNumber')
      .populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json(apiResponse(false, 'Order not found'));
    }
    res.json(apiResponse(true, '', order));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch order'));
  }
});

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { 
      items, type, tableId, guestName, guestPhone, deliveryAddress, 
      deliveryNotes, paymentMethod, couponCode, loyaltyPointsUsed 
    } = req.body;
    
    let orderType = type || ORDER_TYPE.DELIVERY;
    let table = null;
    
    if (orderType === ORDER_TYPE.DINE_IN && tableId) {
      table = await Table.findById(tableId);
      if (!table) {
        return res.status(404).json(apiResponse(false, 'Table not found'));
      }
      table.status = 'occupied';
      await table.save();
    }

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const food = await Food.findById(item.food);
      if (!food) {
        return res.status(404).json(apiResponse(false, `Food ${item.food} not found`));
      }
      let price = food.price;
      if (item.size) {
        const size = food.sizes.find(s => s.name === item.size);
        if (size) price += size.price;
      }
      if (item.extras) {
        for (const extra of item.extras) {
          const ext = food.extras.find(e => e.name === extra.name);
          if (ext) price += ext.price;
        }
      }
      orderItems.push({
        food: food._id,
        name: food.name,
        quantity: item.quantity,
        price: price,
        size: item.size,
        extras: item.extras,
        specialInstructions: item.specialInstructions,
        removedIngredients: item.removedIngredients
      });
      subtotal += price * item.quantity;
    }

    let discount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (coupon && new Date() >= coupon.validFrom && new Date() <= coupon.validUntil) {
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          coupon = null;
        } else if (subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * coupon.discountValue) / 100;
          } else {
            discount = coupon.discountValue;
          }
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const settings = await Settings.findOne() || {};
    const taxRate = (settings.taxRate || 15) / 100;
    const baseDeliveryFee = settings.deliveryFee || 50;
    const tax = subtotal * taxRate;
    const deliveryFee = orderType === ORDER_TYPE.DELIVERY ? baseDeliveryFee : 0;
    let loyaltyPointsEarned = Math.floor(subtotal / 10);
    if (loyaltyPointsUsed) loyaltyPointsEarned = Math.max(0, loyaltyPointsEarned - loyaltyPointsUsed);

    const order = new Order({
      orderId: generateOrderId(),
      user: req.user?._id,
      guestName,
      guestPhone,
      items: orderItems,
      type: orderType,
      table: table?._id,
      subtotal,
      deliveryFee,
      discount,
      tax,
      total: subtotal + deliveryFee + tax - discount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING,
      deliveryAddress,
      deliveryNotes,
      coupon: coupon?._id,
      loyaltyPointsEarned,
      loyaltyPointsUsed: loyaltyPointsUsed || 0,
      estimatedDeliveryTime: 45
    });

    await order.save();

    if (req.io) {
      req.io.emit('new_order', order);
      req.io.emit(SOCKET_EVENTS.NOTIFICATION, {
        type: 'new_order',
        title: 'New Order',
        message: `New order #${order.orderId} received - ETB ${order.total}`,
        orderId: order.orderId,
        status: order.status,
        timestamp: new Date()
      });
    }

    if (req.user) {
      const user = await User.findById(req.user._id);
      user.loyaltyPoints = (user.loyaltyPoints || 0) + loyaltyPointsEarned - (loyaltyPointsUsed || 0);
      await user.save();
    }

    res.status(201).json(apiResponse(true, 'Order placed successfully', order));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to place order'));
  }
});

router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, 'Order not found'));
    }
    order.status = status;
    await order.save();

    if (req.io) {
      req.io.to(order.orderId).emit(SOCKET_EVENTS.ORDER_UPDATE, order);
      req.io.emit('order_update', order);

      if (order.user) {
        req.io.to(`user_${order.user}`).emit(SOCKET_EVENTS.ORDER_UPDATE, order);
        req.io.to(`user_${order.user}`).emit(SOCKET_EVENTS.NOTIFICATION, {
          type: 'order_status',
          title: 'Order Update',
          message: `Your order #${order.orderId} is now ${status.replace(/_/g, ' ')}`,
          orderId: order.orderId,
          status,
          timestamp: new Date()
        });
      }
      req.io.emit(SOCKET_EVENTS.NOTIFICATION, {
        type: 'order_status',
        title: 'Order Update',
        message: `Order #${order.orderId} is now ${status.replace(/_/g, ' ')}`,
        orderId: order.orderId,
        status,
        timestamp: new Date()
      });
    }

    if (order.table && status === ORDER_STATUS.DELIVERED) {
      await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: null });
    }

    res.json(apiResponse(true, 'Order status updated', order));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update order status'));
  }
});

router.put('/:id/review', optionalAuth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, 'Order not found'));
    }
    order.rating = rating;
    order.review = review;
    await order.save();

    for (const item of order.items) {
      const food = await Food.findById(item.food);
      if (food) {
        const totalRating = food.rating * food.reviewCount + rating;
        food.reviewCount += 1;
        food.rating = totalRating / food.reviewCount;
        await food.save();
      }
    }

    res.json(apiResponse(true, 'Review submitted', order));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to submit review'));
  }
});

export default router;