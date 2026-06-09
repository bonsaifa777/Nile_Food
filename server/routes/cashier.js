import express from 'express';
import Order from '../models/Order.js';
import Food from '../models/Food.js';
import Table from '../models/Table.js';
import User from '../models/User.js';
import CashDrawer from '../models/CashDrawer.js';
import Category from '../models/Category.js';
import { apiResponse, generateOrderId } from '../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES, ORDER_STATUS, ORDER_TYPE, PAYMENT_STATUS, PAYMENT_METHOD, POS_SOCKET_EVENTS } from '../shared/constants.js';

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.CASHIER));

router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    const [activeOrders, todayOrders, openDrawer, tables, recentOrders] = await Promise.all([
      Order.countDocuments({ status: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING] } }),
      Order.find({ createdAt: { $gte: today } }).sort({ createdAt: -1 }),
      CashDrawer.findOne({ status: 'open' }).sort({ openedAt: -1 }),
      Table.find({ isActive: true }),
      Order.find()
        .populate('table', 'tableNumber')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const totalSales = todayOrders.reduce((sum, o) => sum + (o.paymentStatus === PAYMENT_STATUS.PAID ? o.total : 0), 0);
    const totalOrders = todayOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    const tableStats = {
      total: tables.length,
      available: tables.filter(t => t.status === 'available').length,
      occupied: tables.filter(t => t.status === 'occupied').length,
      reserved: tables.filter(t => t.status === 'reserved').length
    };

    res.json(apiResponse(true, '', {
      totalSales,
      totalOrders,
      avgOrderValue,
      activeOrders,
      tableStats,
      drawerStatus: openDrawer ? { id: openDrawer._id, balance: openDrawer.calculateExpected(), openedAt: openDrawer.openedAt } : null,
      recentOrders
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch dashboard data'));
  }
});

router.get('/foods', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    const foods = await Food.find(query)
      .populate('category', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ name: 1 });
    const total = await Food.countDocuments(query);
    res.json(apiResponse(true, '', { foods, total }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch foods'));
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(apiResponse(true, '', categories));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch categories'));
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { items, type, tableId, guestName, guestPhone, paymentMethod, discount } = req.body;
    let orderType = type || ORDER_TYPE.DINE_IN;
    let table = null;

    if (orderType === ORDER_TYPE.DINE_IN && tableId) {
      table = await Table.findById(tableId);
      if (!table) return res.status(404).json(apiResponse(false, 'Table not found'));
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const food = await Food.findById(item.food);
      if (!food) return res.status(404).json(apiResponse(false, `Food ${item.food} not found`));
      let price = food.price;
      if (item.size) {
        const size = food.sizes.find(s => s.name === item.size);
        if (size) price = size.price;
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
        price,
        size: item.size,
        extras: item.extras,
        specialInstructions: item.specialInstructions
      });
      subtotal += price * item.quantity;
    }

    const discountAmount = discount || 0;
    const total = subtotal - discountAmount;

    const order = new Order({
      orderId: await generateOrderId(),
      items: orderItems,
      type: orderType,
      table: table?._id,
      guestName,
      guestPhone,
      subtotal,
      discount: discountAmount,
      tax: 0,
      total,
      paymentMethod: paymentMethod || PAYMENT_METHOD.CASH,
      paymentStatus: PAYMENT_STATUS.PAID,
      status: ORDER_STATUS.CONFIRMED
    });

    await order.save();

    if (table) {
      table.status = 'occupied';
      table.currentOrder = order._id;
      await table.save();
    }

    if (req.io) {
      req.io.emit(POS_SOCKET_EVENTS.POS_ORDER_UPDATE, order);
      req.io.emit('new_order', order);
    }

    res.status(201).json(apiResponse(true, 'Order created', order));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to create order'));
  }
});

router.get('/orders', async (req, res) => {
  try {
    const { status, table, type, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (table) query.table = table;
    if (type) query.type = type;

    const orders = await Order.find(query)
      .populate('items.food', 'name image price')
      .populate('table', 'tableNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);
    res.json(apiResponse(true, '', { orders, total }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch orders'));
  }
});

router.put('/orders/:id/payment', async (req, res) => {
  try {
    const { paymentMethod, amount } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json(apiResponse(false, 'Order not found'));

    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.paymentStatus = PAYMENT_STATUS.PAID;

    if (order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'billing' });
    }

    await order.save();

    if (req.io) {
      req.io.emit(POS_SOCKET_EVENTS.POS_ORDER_UPDATE, order);
    }

    res.json(apiResponse(true, 'Payment processed', order));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to process payment'));
  }
});

router.put('/orders/:id/void', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json(apiResponse(false, 'Order not found'));

    order.status = ORDER_STATUS.CANCELLED;
    await order.save();

    if (order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: null });
    }

    if (req.io) {
      req.io.emit(POS_SOCKET_EVENTS.POS_ORDER_UPDATE, order);
    }

    res.json(apiResponse(true, 'Order voided', order));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to void order'));
  }
});

router.get('/tables', async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true })
      .populate('currentOrder')
      .sort({ tableNumber: 1 });
    res.json(apiResponse(true, '', tables));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch tables'));
  }
});

router.put('/tables/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'occupied', 'reserved', 'billing', 'cleaning', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(apiResponse(false, 'Invalid status'));
    }
    const table = await Table.findByIdAndUpdate(req.params.id, {
      status,
      ...(status === 'available' ? { currentOrder: null } : {})
    }, { new: true });
    if (!table) return res.status(404).json(apiResponse(false, 'Table not found'));
    if (req.io) req.io.emit(POS_SOCKET_EVENTS.TABLE_UPDATE, table);
    res.json(apiResponse(true, 'Table status updated', table));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update table'));
  }
});

router.put('/tables/:id/merge', async (req, res) => {
  try {
    const { targetTableId } = req.body;
    const sourceTable = await Table.findById(req.params.id);
    const targetTable = await Table.findById(targetTableId);
    if (!sourceTable || !targetTable) {
      return res.status(404).json(apiResponse(false, 'Table not found'));
    }
    res.json(apiResponse(true, 'Tables merged', { source: sourceTable, target: targetTable }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to merge tables'));
  }
});

router.get('/customers', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: ROLES.CUSTOMER };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    const customers = await User.find(query)
      .select('name email phone loyaltyPoints createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json(apiResponse(true, '', { customers, total }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch customers'));
  }
});

router.post('/customers', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name) return res.status(400).json(apiResponse(false, 'Name is required'));

    let customer = await User.findOne({ email });
    if (!customer) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('walkin@123', 10);
      customer = new User({
        name,
        email: email || `${Date.now()}@walkin.nilefood`,
        phone: phone || '',
        password: hashedPassword,
        role: ROLES.CUSTOMER
      });
      await customer.save();
    }

    res.status(201).json(apiResponse(true, 'Customer created', customer));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to create customer'));
  }
});

router.get('/customers/:id/orders', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id })
      .populate('items.food', 'name')
      .populate('table', 'tableNumber')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(apiResponse(true, '', orders));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch customer orders'));
  }
});

router.get('/tables/:id/orders', async (req, res) => {
  try {
    const orders = await Order.find({ table: req.params.id, status: { $ne: ORDER_STATUS.CANCELLED } })
      .populate('items.food', 'name image price')
      .sort({ createdAt: -1 });
    res.json(apiResponse(true, '', orders));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch table orders'));
  }
});

export default router;
