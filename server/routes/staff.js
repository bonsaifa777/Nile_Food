import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Table from '../models/Table.js';
import { apiResponse } from '../../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES, ORDER_STATUS, SOCKET_EVENTS } from '../../shared/constants.js';

const router = express.Router();

const STAFF_MANAGER_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.KITCHEN_STAFF];
const STAFF_DELIVERY_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.DELIVERY_DRIVER];

const VALID_KITCHEN_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: ORDER_STATUS.PREPARING,
  [ORDER_STATUS.CONFIRMED]: ORDER_STATUS.PREPARING,
  [ORDER_STATUS.PREPARING]: ORDER_STATUS.READY,
  [ORDER_STATUS.READY]: ORDER_STATUS.DELIVERED
};

const VALID_DELIVERY_TRANSITIONS = {
  [ORDER_STATUS.READY]: ORDER_STATUS.ON_WAY,
  [ORDER_STATUS.ON_WAY]: ORDER_STATUS.DELIVERED
};

router.get('/kitchen/dashboard', authenticate, authorize(...STAFF_MANAGER_ROLES), async (req, res) => {
  try {
    const [
      pendingOrders,
      preparingOrders,
      completedToday
    ] = await Promise.all([
      Order.countDocuments({ status: ORDER_STATUS.CONFIRMED }),
      Order.countDocuments({ status: ORDER_STATUS.PREPARING }),
      Order.countDocuments({
        status: ORDER_STATUS.READY,
        updatedAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      })
    ]);

    res.json(apiResponse(true, '', {
      stats: {
        pendingOrders,
        preparingOrders,
        completedToday
      }
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch kitchen dashboard'));
  }
});

router.get('/kitchen/orders', authenticate, authorize(...STAFF_MANAGER_ROLES), async (req, res) => {
  try {
    const { status } = req.query;
    const query = {
      status: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY] }
    };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.food', 'name image')
      .populate('table', 'tableNumber')
      .sort({ createdAt: 1 });

    res.json(apiResponse(true, '', orders));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch orders'));
  }
});

async function findOrder(id) {
  try {
    const byId = await Order.findById(id);
    if (byId) return byId;
  } catch {}
  return Order.findOne({ orderId: id });
}

router.put('/kitchen/orders/:id/status', authenticate, authorize(...STAFF_MANAGER_ROLES), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await findOrder(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, 'Order not found'));
    }

    const allowedNext = VALID_KITCHEN_TRANSITIONS[order.status];
    if (!allowedNext || status !== allowedNext) {
      return res.status(400).json(apiResponse(false, `Invalid transition from ${order.status} to ${status}`));
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

    res.json(apiResponse(true, 'Order status updated', order));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update order status'));
  }
});

router.get('/delivery/dashboard', authenticate, authorize(...STAFF_DELIVERY_ROLES), async (req, res) => {
  try {
    const [
      readyOrders,
      onWayOrders,
      deliveredToday
    ] = await Promise.all([
      Order.countDocuments({ status: ORDER_STATUS.READY }),
      Order.countDocuments({ status: ORDER_STATUS.ON_WAY }),
      Order.countDocuments({
        status: ORDER_STATUS.DELIVERED,
        updatedAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      })
    ]);

    const myDeliveries = await Order.countDocuments({
      status: ORDER_STATUS.ON_WAY,
      'deliveryDriver': req.user._id
    });

    res.json(apiResponse(true, '', {
      stats: {
        readyOrders,
        onWayOrders,
        deliveredToday,
        myDeliveries
      }
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch delivery dashboard'));
  }
});

router.get('/delivery/orders', authenticate, authorize(...STAFF_DELIVERY_ROLES), async (req, res) => {
  try {
    const { status } = req.query;
    const query = {
      status: { $in: [ORDER_STATUS.READY, ORDER_STATUS.ON_WAY, ORDER_STATUS.DELIVERED] }
    };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.food', 'name image')
      .sort({ createdAt: 1 });

    res.json(apiResponse(true, '', orders));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch orders'));
  }
});

router.put('/delivery/orders/:id/status', authenticate, authorize(...STAFF_DELIVERY_ROLES), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await findOrder(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, 'Order not found'));
    }

    const allowedNext = VALID_DELIVERY_TRANSITIONS[order.status];
    if (!allowedNext || status !== allowedNext) {
      return res.status(400).json(apiResponse(false, `Invalid transition from ${order.status} to ${status}`));
    }

    if (status === ORDER_STATUS.ON_WAY) {
      if (order.status !== ORDER_STATUS.READY) {
        return res.status(400).json(apiResponse(false, 'Order must be ready before delivery'));
      }
      if (order.deliveryDriver) {
        return res.status(409).json(apiResponse(false, 'This order is already claimed by another driver'));
      }
      order.deliveryDriver = req.user._id;
    }
    order.status = status;
    await order.save();

    if (status === ORDER_STATUS.DELIVERED && order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: null });
    }

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

    res.json(apiResponse(true, 'Order status updated', order));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update delivery status'));
  }
});

export default router;
