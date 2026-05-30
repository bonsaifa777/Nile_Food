import { EventBus, Events } from './eventBus';

const STORAGE_PREFIX = 'nf_';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, data) {
  try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data)); } catch {}
}

function nextId(prefix) {
  const n = Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${n}`;
}

let apiPollTimer = null;
let deliveryPollTimer = null;

const INITIAL_MENU = [
  { id: 'M1', name: 'Grilled Salmon', category: 'Main Course', price: 450, prepTime: 15, popular: true },
  { id: 'M2', name: 'Beef Tenderloin', category: 'Main Course', price: 650, prepTime: 20, popular: true },
  { id: 'M3', name: 'Lobster Bisque', category: 'Appetizer', price: 350, prepTime: 10, popular: true },
  { id: 'M4', name: 'Caesar Salad', category: 'Appetizer', price: 250, prepTime: 8, popular: true },
  { id: 'M5', name: 'Truffle Pasta', category: 'Main Course', price: 550, prepTime: 12, popular: false },
  { id: 'M6', name: 'Lamb Chops', category: 'Main Course', price: 750, prepTime: 22, popular: false },
  { id: 'M7', name: 'Chocolate Lava Cake', category: 'Dessert', price: 280, prepTime: 12, popular: true },
  { id: 'M8', name: 'Tiramisu', category: 'Dessert', price: 220, prepTime: 5, popular: false },
  { id: 'M9', name: 'Mixed Grill Platter', category: 'Main Course', price: 850, prepTime: 25, popular: false },
  { id: 'M10', name: 'Seafood Pasta', category: 'Main Course', price: 520, prepTime: 18, popular: true },
  { id: 'M11', name: 'Bruschetta', category: 'Appetizer', price: 180, prepTime: 7, popular: false },
  { id: 'M12', name: 'Crème Brûlée', category: 'Dessert', price: 240, prepTime: 15, popular: true },
];

const HOTELS = ['Sheraton Hotel', 'Hilton Hotel', 'Marriott Hotel', 'Radisson Blu', 'Skylight Hotel'];
const STREETS = ['Bole Road', 'Congo Street', 'CMC Road', 'Meskel Square', 'Kazanchis', 'Sarbet', 'Hayahulet', 'Gergesen'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function resolveAddress(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  if (addr.address) return `${addr.address}${addr.city ? ', ' + addr.city : ''}`;
  if (addr.label) return addr.label;
  return '';
}

function generateOrder() {
  const itemCount = rand(1, 4);
  const items = [];
  for (let i = 0; i < itemCount; i++) {
    const menuItem = pick(INITIAL_MENU);
    items.push({
      name: menuItem.name,
      quantity: rand(1, 3),
      price: menuItem.price,
      notes: Math.random() > 0.7 ? pick(['Medium rare', 'Extra sauce', 'No onions', 'Well done', 'Spicy']) : null,
      size: Math.random() > 0.5 ? 'Regular' : 'Large',
    });
  }
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const isHotel = Math.random() > 0.55;
  const isDineIn = !isHotel && Math.random() > 0.45;
  const names = ['Ahmed H.', 'Sarah W.', 'Mohamed A.', 'David C.', 'Fatima N.', 'James W.', 'Lina P.', 'Robert K.', 'Yara A.', 'Priya S.', 'Alex T.', 'Omar F.', 'Nadia K.', 'Hassan M.'];
  const customer = pick(names);
  return {
    id: nextId('ORD'),
    customer,
    phone: `+251-91${rand(0, 9)}-${rand(100, 999)}-${rand(1000, 9999)}`,
    table: isDineIn ? `T-${rand(1, 20)}` : null,
    room: isHotel && !isDineIn ? `${rand(1, 12)}${String(rand(1, 15)).padStart(2, '0')}` : null,
    type: isHotel ? 'room-service' : isDineIn ? 'dine-in' : 'delivery',
    total,
    items,
    status: 'pending',
    priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
    createdAt: new Date().toISOString(),
    timeElapsed: 0,
    estimatedCompletion: null,
    chef: null,
    paymentStatus: Math.random() > 0.2 ? 'paid' : 'pending',
    allergens: Math.random() > 0.8 ? [pick(['Dairy', 'Nuts', 'Shellfish', 'Gluten', 'Eggs'])] : [],
    specialInstructions: Math.random() > 0.75 ? pick(['No onions please', 'Lactose intolerant', 'Extra napkins', 'Well done steak', 'Spicy please']) : null,
    assignedAt: null,
    delayed: false,
    deliveryAddress: isHotel ? `${pick(HOTELS)} - Room ${rand(1, 12)}${String(rand(1, 15)).padStart(2, '0')}` : `${pick(STREETS)}, House ${rand(1, 100)}`,
  };
}

export function createMenuItems() { return INITIAL_MENU; }
export function createNextOrder() { return generateOrder(); }

const ORDERS_KEY = 'kitchen_orders';
const DELIVERIES_KEY = 'delivery_orders';
const INVENTORY_KEY = 'inventory';
const CHAT_KEY = 'chat_messages';
const DRIVER_CHAT_KEY = 'driver_chat';
const NOTIF_KEY = 'notifications';
const EARNINGS_KEY = 'earnings';
const METRICS_KEY = 'metrics';

const INITIAL_INVENTORY = [
  { id: 'I1', name: 'Salmon Fillet', stock: 18, unit: 'kg', threshold: 10, status: 'good', expiry: '2 days', category: 'Seafood' },
  { id: 'I2', name: 'Beef Tenderloin', stock: 8, unit: 'kg', threshold: 10, status: 'low', expiry: '4 days', category: 'Meat' },
  { id: 'I3', name: 'Chicken Breast', stock: 22, unit: 'kg', threshold: 15, status: 'good', expiry: '3 days', category: 'Meat' },
  { id: 'I4', name: 'Lobster', stock: 4, unit: 'pcs', threshold: 8, status: 'critical', expiry: '1 day', category: 'Seafood' },
  { id: 'I5', name: 'Mixed Vegetables', stock: 15, unit: 'kg', threshold: 10, status: 'good', expiry: '5 days', category: 'Produce' },
  { id: 'I6', name: 'Truffle Oil', stock: 3, unit: 'bottles', threshold: 5, status: 'low', expiry: '30 days', category: 'Condiments' },
  { id: 'I7', name: 'Heavy Cream', stock: 6, unit: 'liters', threshold: 8, status: 'low', expiry: '7 days', category: 'Dairy' },
  { id: 'I8', name: 'Parmesan', stock: 12, unit: 'kg', threshold: 8, status: 'good', expiry: '14 days', category: 'Dairy' },
  { id: 'I9', name: 'Olive Oil', stock: 20, unit: 'liters', threshold: 10, status: 'good', expiry: '60 days', category: 'Condiments' },
  { id: 'I10', name: 'Fresh Herbs', stock: 5, unit: 'bundles', threshold: 8, status: 'low', expiry: '2 days', category: 'Produce' },
  { id: 'I11', name: 'Butter', stock: 15, unit: 'kg', threshold: 10, status: 'good', expiry: '10 days', category: 'Dairy' },
  { id: 'I12', name: 'Shrimp', stock: 7, unit: 'kg', threshold: 10, status: 'low', expiry: '2 days', category: 'Seafood' },
];

export class DataService {
  static apiConnected = false;
  static deliveryApiConnected = false;

  static hasToken() {
    return !!localStorage.getItem('adminToken');
  }

  static async init() {
    // Only fetch from API if authenticated
    if (this.hasToken()) {
      // Kitchen orders
      try {
        const { fetchKitchenOrders } = await import('./kitchenApi');
        const apiOrders = await fetchKitchenOrders();
        if (apiOrders) {
          this.apiConnected = true;
          save(ORDERS_KEY, apiOrders);
          EventBus.emit(Events.ORDER_UPDATED, apiOrders);
          this.recalcMetrics();
          this.setupApiPolling();
        }
      } catch (e) {
        console.warn('[DataService] Kitchen init fetch failed:', e?.message);
        this.apiConnected = false;
      }
      // Delivery orders
      try {
        const { fetchDeliveryOrders } = await import('./deliveryApi');
        const apiDeliveries = await fetchDeliveryOrders();
        if (apiDeliveries) {
          this.deliveryApiConnected = true;
          save(DELIVERIES_KEY, apiDeliveries);
          this.setupDeliveryPolling();
        }
      } catch (e) {
        console.warn('[DataService] Delivery init fetch failed:', e?.message);
        this.deliveryApiConnected = false;
      }
    }
    if (!localStorage.getItem(STORAGE_PREFIX + ORDERS_KEY)) {
      save(ORDERS_KEY, []);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + DELIVERIES_KEY)) {
      save(DELIVERIES_KEY, []);
    }

    if (!localStorage.getItem(STORAGE_PREFIX + INVENTORY_KEY)) {
      save(INVENTORY_KEY, INITIAL_INVENTORY);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + CHAT_KEY)) {
      save(CHAT_KEY, [
        { id: 1, user: 'System', role: '', message: 'Kitchen is now live', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'system' },
      ]);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + NOTIF_KEY)) {
      save(NOTIF_KEY, [{ id: 1, type: 'system', message: 'Connected to live order system', time: 'Just now', urgent: false }]);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + EARNINGS_KEY)) {
      save(EARNINGS_KEY, { total: 0, deliveries: 0, tips: 0, bonus: 0, hotelService: 0, weekly: [0, 0, 0, 0, 0, 0, 0] });
    }
    if (!localStorage.getItem(STORAGE_PREFIX + METRICS_KEY)) {
      save(METRICS_KEY, { totalOrders: 0, pendingOrders: 0, cookingOrders: 0, readyToServe: 0, delayedOrders: 0, deliveryRequests: 0, roomServiceOrders: 0, todayRevenue: 0, customerSatisfaction: 100, avgPrepTime: 0 });
    }

    if (!this.apiConnected) this.setupApiPolling();
    if (!this.deliveryApiConnected) this.setupDeliveryPolling();
  }

  static setupApiPolling() {
    if (apiPollTimer) clearInterval(apiPollTimer);
    apiPollTimer = setInterval(async () => {
      if (!this.hasToken()) return;
      try {
        const { fetchKitchenOrders } = await import('./kitchenApi');
        const apiOrders = await fetchKitchenOrders();
        if (apiOrders) {
          if (!this.apiConnected) this.apiConnected = true;
          save(ORDERS_KEY, apiOrders);
          EventBus.emit(Events.ORDER_UPDATED, apiOrders);
          this.recalcMetrics();
        }
      } catch (e) {
        console.warn('[DataService] Polling fetch failed:', e?.message);
      }
    }, 15000);
  }

  static async syncFromApi() {
    if (!this.hasToken()) return;
    try {
      const { fetchKitchenOrders } = await import('./kitchenApi');
      const apiOrders = await fetchKitchenOrders();
      if (apiOrders) {
        if (!this.apiConnected) {
          this.apiConnected = true;
          this.setupApiPolling();
        }
        save(ORDERS_KEY, apiOrders);
        EventBus.emit(Events.ORDER_UPDATED, apiOrders);
        this.recalcMetrics();
      }
    } catch (e) {
      console.warn('[DataService] syncFromApi failed:', e?.message);
    }
  }

  static stopApiPolling() {
    if (apiPollTimer) {
      clearInterval(apiPollTimer);
      apiPollTimer = null;
    }
    this.apiConnected = false;
  }

  static setupDeliveryPolling() {
    if (deliveryPollTimer) clearInterval(deliveryPollTimer);
    deliveryPollTimer = setInterval(async () => {
      if (!this.hasToken()) return;
      try {
        const { fetchDeliveryOrders } = await import('./deliveryApi');
        const apiDeliveries = await fetchDeliveryOrders();
        if (apiDeliveries) {
          if (!this.deliveryApiConnected) this.deliveryApiConnected = true;
          save(DELIVERIES_KEY, apiDeliveries);
          EventBus.emit(Events.DELIVERY_UPDATED, apiDeliveries);
        }
        } catch (e) {
          console.warn('[DataService] Delivery polling failed:', e?.message);
        }
    }, 15000);
  }

  static stopDeliveryPolling() {
    if (deliveryPollTimer) {
      clearInterval(deliveryPollTimer);
      deliveryPollTimer = null;
    }
    this.deliveryApiConnected = false;
  }

  static async syncDeliveriesFromApi() {
    if (!this.hasToken()) return;
    try {
      const { fetchDeliveryOrders } = await import('./deliveryApi');
      const apiDeliveries = await fetchDeliveryOrders();
      if (apiDeliveries) {
        if (!this.deliveryApiConnected) {
          this.deliveryApiConnected = true;
          this.setupDeliveryPolling();
        }
        save(DELIVERIES_KEY, apiDeliveries);
        EventBus.emit(Events.DELIVERY_UPDATED, apiDeliveries);
      }
    } catch {}
  }

  static async syncOrderToApi(orderId, status, mongoId) {
    if (!mongoId) return;
    try {
      const { updateOrderStatus } = await import('./kitchenApi');
      await updateOrderStatus(orderId, status, mongoId);
    } catch {}
  }

  static getOrders() { return load(ORDERS_KEY, []); }
  static getDeliveries() { return load(DELIVERIES_KEY, []); }
  static getInventory() { return load(INVENTORY_KEY, INITIAL_INVENTORY); }
  static getChatMessages() { return load(CHAT_KEY, []); }
  static getDriverChat() { return load(DRIVER_CHAT_KEY, []); }
  static getNotifications() { return load(NOTIF_KEY, []); }
  static getEarnings() { return load(EARNINGS_KEY, { total: 0, deliveries: 0, tips: 0, bonus: 0, hotelService: 0, weekly: [0, 0, 0, 0, 0, 0, 0] }); }
  static getMetrics() { return load(METRICS_KEY, { totalOrders: 0, pendingOrders: 0, cookingOrders: 0, readyToServe: 0, delayedOrders: 0, deliveryRequests: 0, roomServiceOrders: 0, todayRevenue: 0, customerSatisfaction: 100, avgPrepTime: 0 }); }

  static saveOrders(orders) {
    save(ORDERS_KEY, orders);
    EventBus.emit(Events.ORDER_UPDATED, orders);
    this.recalcMetrics();
  }

  static saveDeliveries(deliveries) {
    save(DELIVERIES_KEY, deliveries);
    EventBus.emit(Events.DELIVERY_UPDATED, deliveries);
  }

  static saveInventory(inv) {
    save(INVENTORY_KEY, inv);
    EventBus.emit(Events.INVENTORY_UPDATED, inv);
  }

  static saveChat(msgs) {
    save(CHAT_KEY, msgs);
    EventBus.emit(Events.CHAT_MESSAGE, msgs);
  }

  static saveDriverChat(msgs) {
    save(DRIVER_CHAT_KEY, msgs);
    EventBus.emit(Events.DRIVER_CHAT, msgs);
  }

  static saveNotifications(notifs) {
    save(NOTIF_KEY, notifs);
    EventBus.emit(Events.NOTIFICATION_SENT, notifs);
  }

  static saveEarnings(e) {
    save(EARNINGS_KEY, e);
    EventBus.emit(Events.EARNINGS_UPDATED, e);
  }

  static addNotification(message, type = 'order', urgent = false) {
    const notifs = this.getNotifications();
    const id = Date.now();
    notifs.unshift({ id, type, message, time: 'Just now', urgent });
    if (notifs.length > 50) notifs.length = 50;
    this.saveNotifications(notifs);
    return id;
  }

  static addChatMessage(user, role, message, type = 'text') {
    const msgs = this.getChatMessages();
    msgs.push({
      id: Date.now(), user, role, message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
    });
    this.saveChat(msgs);
  }

  static addDriverChatMessage(from, name, message, type = 'text') {
    const msgs = this.getDriverChat();
    msgs.push({
      id: Date.now(), from, name, message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
    });
    this.saveDriverChat(msgs);
  }

  static shareETA(delId, etaMinutes) {
    const deliveries = this.getDeliveries();
    const idx = deliveries.findIndex(d => d.id === delId);
    if (idx === -1) return;
    const del = deliveries[idx];
    const etaMsg = `🚗 ${del.customer}, your driver is ${etaMinutes <= 2 ? 'arriving now' : etaMinutes <= 5 ? 'very close' : 'on the way'} · ETA ~${etaMinutes} min`;
    this.addDriverChatMessage('system', '', etaMsg, 'system');
    this.addDriverChatMessage('driver', 'You', `Hi ${del.customer}, I'm on my way! ETA ${etaMinutes} min. I'll notify you when I arrive. 🚗`, 'text');
    this.addNotification(`📍 ETA shared with ${del.customer}: ${etaMinutes} min`, 'new');
  }

  static addCustomerStatusEvent(customerName, eventType) {
    const eventMessages = {
      'preparing': `⏳ ${customerName}'s order is being prepared in the kitchen`,
      'picked_up': `📦 ${customerName}'s order has been picked up! On the way now`,
      'arrived': `✅ ${customerName}, your driver has arrived!`,
      'delivered': `🎉 ${customerName}'s delivery completed! Enjoy your meal`,
      'delayed': `⚠️ ${customerName}, there's a slight delay. Apologies for the wait`,
    };
    const msg = eventMessages[eventType];
    if (!msg) return;
    this.addDriverChatMessage('system', '', msg, 'system');
    this.addNotification(msg, 'order', eventType === 'delayed');
  }

  static recalcMetrics() {
    const orders = this.getOrders();
    const metrics = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      cookingOrders: orders.filter(o => o.status === 'preparing').length,
      readyToServe: orders.filter(o => o.status === 'ready').length,
      delayedOrders: orders.filter(o => o.delayed || o.timeElapsed > 20).length,
      deliveryRequests: orders.filter(o => o.type === 'delivery').length,
      roomServiceOrders: orders.filter(o => o.type === 'room-service').length,
      todayRevenue: orders.reduce((s, o) => s + (o.total || 0), 0),
      customerSatisfaction: 92 + Math.floor(Math.random() * 7),
      avgPrepTime: orders.filter(o => o.chef).length > 0
        ? Math.round(orders.filter(o => o.chef).reduce((s, o) => s + o.timeElapsed, 0) / orders.filter(o => o.chef).length)
        : 0,
    };
    save(METRICS_KEY, metrics);
    EventBus.emit(Events.METRICS_UPDATED, metrics);
    return metrics;
  }

  static acceptOrder(orderId, chefName) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;
    const mongoId = orders[idx]._id;
    orders[idx] = {
      ...orders[idx],
      status: 'preparing',
      chef: chefName,
      assignedAt: new Date().toISOString(),
      timeElapsed: 0,
      estimatedCompletion: new Date(Date.now() + rand(15, 30) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    this.saveOrders(orders);
    this.addNotification(`👨‍🍳 ${chefName} started preparing ${orders[idx].customer}'s order`, 'order');
    if (this.apiConnected && mongoId) {
      this.syncOrderToApi(orderId, 'preparing', mongoId);
    }
    return orders[idx];
  }

  static completeOrder(orderId) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;
    const order = orders[idx];
    const oldStatus = order.status;

    if (oldStatus === 'preparing' || oldStatus === 'cooking' || oldStatus === 'confirmed') {
      orders[idx].status = 'ready';
      this.addNotification(`✅ ${order.customer}'s order is ready`, 'order');
    } else if (order.status === 'ready') {
      if (order.type === 'delivery') {
        orders[idx].status = 'delivered';
        this.addNotification(`📦 ${order.customer}'s order delivered`, 'order');
      } else if (order.type === 'room-service') {
        orders[idx].status = 'delivery-pickup';
        this.addNotification(`📦 ${order.customer}'s order ready for delivery pickup`, 'order');

        const deliveries = this.getDeliveries();
        deliveries.push({
          id: 'DEL-' + Date.now().toString(36).toUpperCase(),
          orderId: order.id,
          customer: order.customer,
          phone: order.phone || '+251-911-000-000',
          pickup: 'Nile Food Kitchen',
          pickupAddress: 'Bole Road',
          deliveryAddress: resolveAddress(order.deliveryAddress) || `${pick(STREETS)}, Addis Ababa`,
          deliveryType: order.type,
          items: order.items,
          status: 'pickup_ready',
          priority: order.priority,
          distance: parseFloat((Math.random() * 5 + 1).toFixed(1)),
          duration: rand(8, 20),
          estimatedDelivery: new Date(Date.now() + 20 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          paymentStatus: order.paymentStatus,
          instructions: order.specialInstructions,
          specialNotes: null,
          restaurant: 'Nile Food Main Kitchen',
          assignedAt: new Date().toISOString(),
        });
        this.saveDeliveries(deliveries);
        this.addNotification(`🚚 New delivery: ${order.customer} - ${resolveAddress(order.deliveryAddress) || 'Address TBD'}`, 'new', true);
      } else {
        orders[idx].status = 'served';
        this.addNotification(`✅ ${order.customer}'s order served`, 'order');
      }
    } else if (order.status === 'on_the_way') {
      orders[idx].status = 'delivered';
      this.addNotification(`📦 ${order.customer}'s order delivered`, 'order');
    } else if (order.status === 'served') {
      return null;
    } else {
      return null;
    }

    this.saveOrders(orders);

    const oldBackend = this.#BACKEND_STATUS[oldStatus] || oldStatus;
    const newBackend = this.#BACKEND_STATUS[orders[idx].status] || orders[idx].status;
    if (this.apiConnected && order._id && oldBackend !== newBackend) {
      this.syncOrderToApi(orderId, orders[idx].status, order._id);
    }

    const inv = this.getInventory();
    order.items.forEach(item => {
      const invItem = inv.find(i => item.name.toLowerCase().includes(i.name.split(' ')[0].toLowerCase()));
      if (invItem) {
        invItem.stock = Math.max(0, invItem.stock - item.quantity * 0.5);
        if (invItem.stock <= invItem.threshold * 0.5) invItem.status = 'critical';
        else if (invItem.stock <= invItem.threshold) invItem.status = 'low';
        else invItem.status = 'good';
      }
    });
    this.saveInventory(inv);
    this.addNotification(`📦 Inventory updated after completing ${order.id}`, 'stock', inv.filter(i => i.status === 'critical').length > 0);

    return orders[idx];
  }

  static rejectOrder(orderId) {
    const orders = this.getOrders().filter(o => o.id !== orderId);
    this.saveOrders(orders);
    this.addNotification(`❌ Order ${orderId} was rejected`, 'order');
  }

  static assignChef(orderId, chefName) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;
    orders[idx].chef = chefName;
    this.saveOrders(orders);
  }

  static #BACKEND_STATUS = {
    pending: 'pending',
    preparing: 'preparing',
    cooking: 'preparing',
    ready: 'ready',
    served: 'delivered',
    'on_the_way': 'delivered',
    'delivery-pickup': 'delivered',
  };

  static updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;
    const mongoId = orders[idx]._id;
    const oldStatus = orders[idx].status;
    if (oldStatus === newStatus) return orders[idx];
    orders[idx].status = newStatus;
    if (newStatus === 'preparing' && !orders[idx].chef) {
      const chefs = ['Omar', 'Layla', 'Karim', 'Nadia', 'Hassan'];
      orders[idx].chef = chefs[Math.floor(Math.random() * chefs.length)];
      orders[idx].assignedAt = new Date().toISOString();
      orders[idx].estimatedCompletion = new Date(Date.now() + 20 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    this.saveOrders(orders);
    const oldBackend = this.#BACKEND_STATUS[oldStatus] || oldStatus;
    const newBackend = this.#BACKEND_STATUS[newStatus] || newStatus;
    if (this.apiConnected && oldBackend !== newBackend) {
      this.syncOrderToApi(orderId, newStatus, mongoId);
    }
    const direction = ['pending', 'preparing', 'cooking', 'ready', 'served', 'delivery-pickup'].indexOf(newStatus) > ['pending', 'preparing', 'cooking', 'ready', 'served', 'delivery-pickup'].indexOf(oldStatus) ? 'progressed' : 'reverted';
    this.addNotification(`Order ${orderId} moved from ${oldStatus} → ${newStatus}`, 'order', newStatus === 'delivery-pickup');
    return orders[idx];
  }

  static acceptDelivery(delId) {
    const deliveries = this.getDeliveries();
    const idx = deliveries.findIndex(d => d.id === delId);
    if (idx === -1) return;
    deliveries[idx].status = 'picked_up';
    if (this.deliveryApiConnected && deliveries[idx]._mongoId) {
      this.syncDeliveryToApi(deliveries[idx]._mongoId, 'on_the_way');
    }
    this.saveDeliveries(deliveries);
    this.addNotification(`🚚 Driver accepted delivery ${delId}`, 'new', true);
  }

  static completeDelivery(delId) {
    const deliveries = this.getDeliveries();
    const idx = deliveries.findIndex(d => d.id === delId);
    if (idx === -1) return;
    deliveries[idx].status = 'delivered';

    if (this.deliveryApiConnected && deliveries[idx]._mongoId) {
      this.syncDeliveryToApi(deliveries[idx]._mongoId, 'delivered');
    }

    const earnings = this.getEarnings();
    const fee = rand(50, 200);
    const tip = Math.random() > 0.6 ? rand(20, 80) : 0;
    earnings.total += fee + tip;
    earnings.deliveries += 1;
    earnings.tips += tip;
    if (deliveries[idx].deliveryType === 'room-service') earnings.hotelService += fee;

    const dayIdx = new Date().getDay();
    if (earnings.weekly[dayIdx] !== undefined) earnings.weekly[dayIdx] += fee + tip;
    this.saveEarnings(earnings);
    this.saveDeliveries(deliveries);
    this.addNotification(`💰 Delivery ${delId} completed! +ETB ${fee + tip}`, 'earning');
  }

  static rejectDelivery(delId) {
    this.saveDeliveries(this.getDeliveries().filter(d => d.id !== delId));
    this.addNotification(`❌ Delivery ${delId} was declined`, 'order');
  }

  static async syncDeliveryToApi(mongoId, status) {
    try {
      const { updateDeliveryStatus } = await import('./deliveryApi');
      await updateDeliveryStatus(mongoId, status);
      this.syncDeliveriesFromApi();
    } catch {}
  }

  static addOrder() {
    const order = generateOrder();
    const orders = this.getOrders();
    orders.unshift(order);
    this.saveOrders(orders);
    this.addNotification(`🆕 New order from ${order.customer} - ${order.items.length} items`, 'new', order.priority === 'high');
    return order;
  }
}

DataService.init();
