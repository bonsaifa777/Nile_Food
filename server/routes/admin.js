import express from 'express';
import User from '../models/User.js';
import Food from '../models/Food.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Table from '../models/Table.js';
import Coupon from '../models/Coupon.js';
import { apiResponse, hashPassword, generateToken, comparePassword } from '../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES, ORDER_STATUS } from '../shared/constants.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.KITCHEN_STAFF, ROLES.DELIVERY_DRIVER, ROLES.CASHIER, ROLES.WAITER] } });
    if (!user) {
      return res.status(401).json(apiResponse(false, 'Invalid staff credentials'));
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json(apiResponse(false, 'Invalid staff credentials'));
    }
    const token = generateToken(user);
    res.json(apiResponse(true, 'Login successful', { user, token }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Login failed'));
  }
});

router.get('/dashboard', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalUsers,
      totalOrders,
      totalRevenueArr,
      todayOrders,
      todayRevenueArr,
      pendingOrders,
      totalFoods,
      totalCategories,
      popularFoods
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
      Food.countDocuments({ isActive: true }),
      Category.countDocuments(),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.food', name: { $first: '$items.name' }, count: { $sum: '$items.quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name')
      .populate('items.food', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(apiResponse(true, '', {
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenueArr[0]?.total || 0,
        todayOrders,
        todayRevenue: todayRevenueArr[0]?.total || 0,
        pendingOrders,
        totalFoods,
        totalCategories
      },
      popularFoods,
      recentOrders
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch dashboard data'));
  }
});

router.get('/orders', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
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

async function findOrder(id) {
  try {
    const byId = await Order.findById(id);
    if (byId) return byId;
  } catch {}
  return Order.findOne({ orderId: id });
}

async function findOrderPopulated(id) {
  try {
    const byId = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.food', 'name image')
      .populate('table', 'tableNumber');
    if (byId) return byId;
  } catch {}
  return Order.findOne({ orderId: id })
    .populate('user', 'name email phone')
    .populate('items.food', 'name image')
    .populate('table', 'tableNumber');
}

router.get('/orders/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const order = await findOrderPopulated(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, 'Order not found'));
    }
    res.json(apiResponse(true, '', order));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch order'));
  }
});

router.put('/orders/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await findOrder(req.params.id);
    if (!order) {
      return res.status(404).json(apiResponse(false, 'Order not found'));
    }
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    if (req.io) {
      req.io.to(order.orderId).emit('order_update', order);
      req.io.emit('order_update', order);
      req.io.emit('notification', {
        type: 'order_status',
        title: 'Order Update',
        message: `Order #${order.orderId} was updated by admin`,
        orderId: order.orderId,
        status: order.status,
        timestamp: new Date()
      });
    }

    res.json(apiResponse(true, 'Order updated', order));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update order'));
  }
});

router.get('/users', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: ROLES.CUSTOMER };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    res.json(apiResponse(true, '', { users, total, page: parseInt(page), limit: parseInt(limit) }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch users'));
  }
});

router.get('/stats/sales', authenticate, authorize(ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const sales = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(apiResponse(true, '', sales));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch sales data'));
  }
});

router.post('/admins', authenticate, authorize(ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { name, email, password, role = ROLES.ADMIN } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json(apiResponse(false, 'Email already exists'));
    }
    const hashedPassword = await hashPassword(password);
    const admin = new User({ name, email, password: hashedPassword, role });
    await admin.save();
    res.status(201).json(apiResponse(true, 'Admin created', { ...admin.toObject(), password: undefined }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to create admin'));
  }
});

router.get('/coupons', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(apiResponse(true, '', coupons));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch coupons'));
  }
});

router.post('/coupons', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(apiResponse(true, 'Coupon created', coupon));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to create coupon'));
  }
});

router.put('/coupons/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) {
      return res.status(404).json(apiResponse(false, 'Coupon not found'));
    }
    res.json(apiResponse(true, 'Coupon updated', coupon));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update coupon'));
  }
});

router.delete('/coupons/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!coupon) {
      return res.status(404).json(apiResponse(false, 'Coupon not found'));
    }
    res.json(apiResponse(true, 'Coupon deleted'));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to delete coupon'));
  }
});

router.get('/profile', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.KITCHEN_STAFF, ROLES.DELIVERY_DRIVER, ROLES.CASHIER, ROLES.WAITER), async (req, res) => {
  res.json(apiResponse(true, '', req.user));
});

router.get('/analytics', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { range = '7days' } = req.query;
    let days = 7;
    if (range === '30days') days = 30;
    if (range === '90days') days = 90;
    if (range === 'year') days = 365;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const [salesByDay, byCategoryData, topFoodsData, newUsers, totalStats] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'foods',
            localField: 'items.food',
            foreignField: '_id',
            as: 'foodDoc'
          }
        },
        { $unwind: '$foodDoc' },
        {
          $lookup: {
            from: 'categories',
            localField: 'foodDoc.category',
            foreignField: '_id',
            as: 'categoryDoc'
          }
        },
        { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$categoryDoc.name',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'foods',
            localField: 'items.food',
            foreignField: '_id',
            as: 'foodDoc'
          }
        },
        { $unwind: '$foodDoc' },
        {
          $group: {
            _id: '$foodDoc._id',
            name: { $first: '$foodDoc.name' },
            orders: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { orders: -1 } },
        { $limit: 5 }
      ]),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' }
          }
        }
      ])
    ]);
    
    const byCategory = byCategoryData.map(c => ({ name: c._id || 'Uncategorized', value: c.count }));
    const topFoods = topFoodsData.map(f => ({ name: f.name, orders: f.orders, revenue: f.revenue }));
    const stats = totalStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    
    res.json(apiResponse(true, '', { salesByDay, byCategory, topFoods, newUsers, stats, range: days }));
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json(apiResponse(false, 'Failed to fetch analytics data'));
  }
});

router.put('/users/:id/role', authenticate, authorize(ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json(apiResponse(false, 'User not found'));
    }
    res.json(apiResponse(true, 'User role updated', user));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update user role'));
  }
});

export default router;