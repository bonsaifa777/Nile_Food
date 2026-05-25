import axios from 'axios';

function authHeaders() {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const STATUS_MAP = {
  'ready': 'assigned',
  'on_the_way': 'on_the_way',
  'delivered': 'delivered',
};

const SYNC_STATUS_MAP = {
  'assigned': 'on_the_way',
  'picked_up': 'on_the_way',
  'on_the_way': 'delivered',
};

function normalizeOrderToDelivery(o) {
  const rawAddr = o.deliveryAddress;
  let addressStr = '';
  if (typeof rawAddr === 'string') {
    addressStr = rawAddr;
  } else if (rawAddr) {
    addressStr = rawAddr.address || rawAddr.label || '';
  }
  const isHotel = /hotel/i.test(addressStr) || /room/i.test(addressStr);

  let deliveryAddress = 'Address not specified';
  if (typeof rawAddr === 'string') {
    deliveryAddress = rawAddr;
  } else if (rawAddr) {
    deliveryAddress = rawAddr.address
      ? `${rawAddr.address}${rawAddr.city ? ', ' + rawAddr.city : ''}`
      : rawAddr.label || 'Address not specified';
  }

  const customerName = o.guestName || o.user?.name || 'Guest';
  const customerPhone = o.guestPhone || o.user?.phone || '';

  const total = o.items?.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0) || o.total || 0;

  return {
    id: 'DEL-' + (o.orderId || o._id).toString().replace(/^(ORD-)?/i, ''),
    orderId: o.orderId || o._id,
    _mongoId: o._id,
    customer: customerName,
    phone: customerPhone,
    pickup: 'Nile Food Kitchen',
    pickupAddress: 'Bole Road, Addis Ababa',
    deliveryAddress,
    deliveryType: isHotel ? 'room-service' : 'food-delivery',
    items: (o.items || []).map(item => ({
      name: item.name || 'Item',
      quantity: item.quantity || 1,
    })),
    status: STATUS_MAP[o.status] || 'assigned',
    priority: total > 1000 ? 'high' : total > 500 ? 'medium' : 'low',
    distance: parseFloat((Math.random() * 5 + 1).toFixed(1)),
    duration: Math.floor(Math.random() * 15 + 8),
    estimatedDelivery: new Date(Date.now() + 20 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    paymentStatus: o.paymentStatus || 'pending',
    paymentMethod: o.paymentMethod || 'cash',
    instructions: o.deliveryNotes || null,
    specialNotes: null,
    restaurant: 'Nile Food Main Kitchen',
    assignedAt: o.updatedAt || o.createdAt,
    satisfaction: null,
  };
}

export async function fetchDeliveryOrders() {
  const { data } = await axios.get('/api/staff/delivery/orders', { headers: authHeaders() });
  if (!data.success) return null;
  const orders = Array.isArray(data.data) ? data.data : [];
  return orders.map(normalizeOrderToDelivery);
}

export async function fetchDeliveryDashboard() {
  const { data } = await axios.get('/api/staff/delivery/dashboard', { headers: authHeaders() });
  if (!data.success) return null;
  return data.data.stats;
}

export async function updateDeliveryStatus(mongoId, status) {
  const backendStatus = SYNC_STATUS_MAP[status] || status;
  const { data } = await axios.put(`/api/staff/delivery/orders/${mongoId}/status`, { status: backendStatus }, { headers: authHeaders() });
  return data;
}
