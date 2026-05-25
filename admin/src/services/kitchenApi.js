import axios from 'axios';

function authHeaders() {
  const token = localStorage.getItem('adminToken');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

const STATUS_MAP = {
  pending: 'pending',
  confirmed: 'confirmed',
  preparing: 'preparing',
  ready: 'ready',
};

const SYNC_STATUS_MAP = {
  'pending': 'pending',
  'preparing': 'preparing',
  'cooking': 'preparing',
  'ready': 'ready',
  'served': 'delivered',
  'on_the_way': 'delivered',
  'delivery-pickup': 'delivered',
};

const TYPE_MAP = {
  dine_in: 'dine-in',
  delivery: 'delivery',
  takeaway: 'takeaway',
};

function normalizeOrder(o) {
  const elapsed = Math.floor((Date.now() - new Date(o.createdAt || Date.now()).getTime()) / 60000);
  const total = o.items?.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0) || o.total || 0;
  return {
    id: o.orderId || o._id,
    _id: o._id,
    customer: o.guestName || o.user?.name || o.user?.email || 'Guest',
    phone: o.guestPhone || '',
    table: o.table?.tableNumber ? `T-${o.table.tableNumber}` : null,
    room: null,
    type: TYPE_MAP[o.type] || 'dine-in',
    total,
    items: (o.items || []).map(item => ({
      name: item.name || 'Item',
      quantity: item.quantity || 1,
      price: item.price || 0,
      notes: item.specialInstructions || null,
      size: item.size || 'Regular',
    })),
    status: STATUS_MAP[o.status] || o.status,
    priority: total > 1000 ? 'high' : total > 500 ? 'medium' : 'low',
    createdAt: o.createdAt,
    timeElapsed: elapsed,
    estimatedCompletion: null,
    chef: null,
    paymentStatus: o.paymentStatus === 'paid' ? 'paid' : 'pending',
    allergens: [],
    specialInstructions: o.deliveryNotes || null,
    assignedAt: null,
    delayed: elapsed > 20,
    deliveryAddress: o.deliveryAddress?.address || null,
  };
}

export async function fetchKitchenOrders() {
  const { data } = await axios.get('/api/staff/kitchen/orders', { headers: authHeaders() });
  if (!data.success) return [];
  const orders = Array.isArray(data.data) ? data.data : [];
  return orders.map(normalizeOrder);
}

export async function fetchKitchenDashboard() {
  const { data } = await axios.get('/api/staff/kitchen/dashboard', { headers: authHeaders() });
  if (!data.success) return null;
  return data.data.stats;
}

export async function updateOrderStatus(orderId, newStatus, mongoId) {
  const backendStatus = SYNC_STATUS_MAP[newStatus] || newStatus;
  const id = mongoId || orderId;
  const { data } = await axios.put(`/api/staff/kitchen/orders/${id}/status`, { status: backendStatus }, { headers: authHeaders() });
  return data;
}
