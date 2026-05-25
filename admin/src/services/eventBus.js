const listeners = {};

export const EventBus = {
  on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
    const handler = (e) => fn(e.detail);
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  },

  emit(event, data) {
    if (listeners[event]) listeners[event].forEach(fn => fn(data));
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  },

  off(event, fn) {
    if (listeners[event]) listeners[event] = listeners[event].filter(f => f !== fn);
  },
};

export const Events = {
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  DELIVERY_ASSIGNED: 'delivery:assigned',
  DELIVERY_UPDATED: 'delivery:updated',
  NOTIFICATION_SENT: 'notification:sent',
  INVENTORY_UPDATED: 'inventory:updated',
  CHAT_MESSAGE: 'chat:message',
  DRIVER_CHAT: 'driver:chat',
  EARNINGS_UPDATED: 'earnings:updated',
  STAFF_UPDATED: 'staff:updated',
  METRICS_UPDATED: 'metrics:updated',
};
