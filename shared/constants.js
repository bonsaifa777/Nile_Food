export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  KITCHEN_STAFF: 'kitchen_staff',
  DELIVERY_DRIVER: 'delivery_driver'
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

export const JWT_SECRET = process.env.JWT_SECRET;
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
