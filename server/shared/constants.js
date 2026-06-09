export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  KITCHEN_STAFF: 'kitchen_staff',
  DELIVERY_DRIVER: 'delivery_driver',
  CASHIER: 'cashier',
  WAITER: 'waiter'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  ON_WAY: 'on_the_way',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const PAYMENT_METHOD = {
  CARD: 'card',
  CASH: 'cash',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  BANK: 'bank',
  BANK_TRANSFER: 'bank_transfer',
  CHAPA: 'chapa'
};

export const ORDER_TYPE = {
  DINE_IN: 'dine_in',
  DELIVERY: 'delivery',
  TAKEAWAY: 'takeaway'
};

export const JWT_SECRET = process.env.JWT_SECRET || 'nile-food-default-secret-key';
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nilefood';

export const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || '';
export const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';

export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

export const SOCKET_EVENTS = {
  JOIN_ORDER: 'join_order',
  LEAVE_ORDER: 'leave_order',
  ORDER_UPDATE: 'order_update',
  NEW_ORDER: 'new_order',
  NEW_MESSAGE: 'new_message',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  NOTIFICATION: 'notification'
};

export const CATEGORIES = [
  'Fast Food',
  'Burgers',
  'Pizza',
  'Chicken',
  'Traditional',
  'Desserts',
  'Drinks',
  'Healthy',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Vegan',
  'Seafood',
  'BBQ & Grill',
  'Hotel Specials',
  'Beverages',
  'Snacks',
  'Coffee'
];

export const FOOD_SIZES = ['Small', 'Medium', 'Large'];
export const SPICE_LEVELS = ['Not Spicy', 'Mild', 'Medium', 'Hot', 'Extra Hot'];

export const ATTENDANCE_STATUS = {
  CLOCKED_IN: 'clocked_in',
  ON_BREAK: 'on_break',
  CLOCKED_OUT: 'clocked_out'
};

export const SHIFT_TYPES = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  NIGHT: 'night',
  CUSTOM: 'custom'
};

export const LEAVE_TYPES = {
  SICK: 'sick',
  ANNUAL: 'annual',
  EMERGENCY: 'emergency',
  UNPAID: 'unpaid'
};

export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const VERIFICATION_METHOD = {
  NONE: 'none',
  QR: 'qr',
  GPS: 'gps',
  FACE: 'face'
};

export const GPS_RADIUS = [50, 100, 200];

export const STAFF_ROLES = [
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
  ROLES.KITCHEN_STAFF,
  ROLES.DELIVERY_DRIVER,
  ROLES.CASHIER,
  ROLES.WAITER
];

export const ATTENDANCE_SOCKET_EVENTS = {
  ATTENDANCE_UPDATE: 'attendance_update',
  EMPLOYEE_STATUS: 'employee_status',
  SHIFT_NOTIFICATION: 'shift_notification',
  LEAVE_UPDATE: 'leave_update'
};

export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  BILLING: 'billing',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance'
};

export const CASH_DRAWER_EVENTS = {
  OPEN: 'open',
  CLOSE: 'close',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  PAYMENT_IN: 'payment_in',
  REFUND_OUT: 'refund_out'
};

export const CHAT_CHANNELS = {
  CUSTOMER_CASHIER: 'customer_cashier',
  CUSTOMER_ADMIN: 'customer_admin',
  CASHIER_KITCHEN: 'cashier_kitchen',
  ADMIN_KITCHEN: 'admin_kitchen',
  ADMIN_DRIVER: 'admin_driver',
  CASHIER_ADMIN: 'cashier_admin'
};

export const POS_SOCKET_EVENTS = {
  POS_ORDER_UPDATE: 'pos_order_update',
  CASH_DRAWER_UPDATE: 'cash_drawer_update',
  TABLE_UPDATE: 'table_update',
  CHAT_MESSAGE: 'chat_message',
  CHAT_TYPING: 'chat_typing'
};
