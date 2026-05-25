import { io } from 'socket.io-client';
import { DataService } from './dataService';
import { EventBus, Events } from './eventBus';

let socket = null;
let prevOrderCount = 0;

export function connectKitchenSocket(token) {
  if (socket?.connected) return socket;

  try {
    const isDev = import.meta.env.DEV;
    const serverUrl = isDev ? 'http://localhost:5001' : window.location.origin;

    socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      DataService.addNotification('Real-time connection established', 'system');
    });

    socket.on('new_order', (orderData) => {
      DataService.addNotification(
        orderData?.orderId
          ? `New order #${orderData.orderId} received`
          : 'New order received',
        'new',
        true
      );
      EventBus.emit(Events.ORDER_CREATED, { source: 'socket' });
      DataService.syncFromApi?.();
    });

    socket.on('order_update', (order) => {
      DataService.addNotification(
        order?.orderId
          ? `Order #${order.orderId} updated to ${order.status.replace(/_/g, ' ')}`
          : 'Order status updated',
        'order',
        true
      );
      const orders = DataService.getOrders();
      const exists = orders.findIndex(o => o.id === order.orderId || o.id === order._id || o.id === order.id);
      if (exists >= 0) {
        const mappedStatus = {
          confirmed: 'pending',
          preparing: 'preparing',
          ready: 'ready',
          delivered: 'served'
        }[order.status] || order.status;
        orders[exists].status = mappedStatus;
        DataService.saveOrders(orders);
      } else {
        DataService.syncFromApi?.();
      }
    });

    socket.on('notification', (notif) => {
      DataService.addNotification(notif.message || 'Order update received', notif.type || 'order', true);
    });

    socket.on('disconnect', () => {
      DataService.addNotification('Real-time connection lost', 'system');
    });

    socket.on('connect_error', () => {});
  } catch {}

  return socket;
}

export function disconnectKitchenSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
