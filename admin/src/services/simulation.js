import { DataService } from './dataService';
import { EventBus, Events } from './eventBus';

class SimulationEngine {
  constructor() {
    this.intervals = [];
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;

    // Spawn new orders every 20-35 seconds (was 25-45)
    this.intervals.push(setInterval(() => {
      const order = DataService.addOrder();
      EventBus.emit(Events.ORDER_CREATED, order);
    }, rand(20000, 35000)));

    // Tick elapsed time on active orders every 15s (was 30s)
    this.intervals.push(setInterval(() => {
      const orders = DataService.getOrders();
      let changed = false;
      orders.forEach((o, i) => {
        if (['pending', 'preparing', 'cooking'].includes(o.status)) {
          orders[i].timeElapsed = (o.timeElapsed || 0) + 0.25;
          if (orders[i].timeElapsed > 20) orders[i].delayed = true;
          changed = true;
        }
      });
      if (changed) {
        DataService.saveOrders(orders);
      }
    }, 15000));

    // Auto-assign chefs to ALL stale new orders (was 1 at a time)
    this.intervals.push(setInterval(() => {
      const orders = DataService.getOrders();
      const stale = orders.filter(o => o.status === 'pending' && (o.timeElapsed || 0) > 2);
      if (stale.length > 0) {
        const chefs = ['Omar', 'Layla', 'Karim', 'Nadia', 'Hassan'];
        stale.forEach(order => {
          if (order.status === 'pending') {
            const chef = chefs[Math.floor(Math.random() * chefs.length)];
            DataService.acceptOrder(order.id, chef);
          }
        });
      }
    }, 25000));

    // Auto-promote preparing → ready
    this.intervals.push(setInterval(() => {
      const orders = DataService.getOrders();
      let changed = false;
      orders.forEach((o, i) => {
        if ((o.status === 'preparing' || o.status === 'cooking') && (o.timeElapsed || 0) > 10) {
          orders[i].status = 'ready';
          changed = true;
          DataService.addNotification(`${o.customer}'s order is ready to serve`, 'order');
        }
      });
      if (changed) DataService.saveOrders(orders);
    }, 20000));

    // Recalculate metrics more frequently
    this.intervals.push(setInterval(() => {
      DataService.recalcMetrics();
    }, 10000));

    // Random traffic/weather notifications
    this.intervals.push(setInterval(() => {
      if (Math.random() > 0.6) {
        const msgs = [
          'Traffic update: Bole Road moderate congestion',
          'Weather clear for next 2 hours',
          'Peak lunch hour - prepare for high volume',
          'Kitchen performance: 94% efficiency this hour',
          'Grill station at 80% capacity',
        ];
        DataService.addNotification(msgs[Math.floor(Math.random() * msgs.length)], 'system', false);
      }
    }, 120000));

    // Simulate driver accepting deliveries
    this.intervals.push(setInterval(() => {
      const deliveries = DataService.getDeliveries();
      const pending = deliveries.filter(d => d.status === 'pickup_ready');
      if (pending.length > 0) {
        const del = pending[0];
        DataService.acceptDelivery(del.id);
        DataService.addCustomerStatusEvent(del.customer, 'picked_up');
        setTimeout(() => {
          const dels = DataService.getDeliveries();
          const idx = dels.findIndex(d => d.id === del.id);
          if (idx !== -1 && dels[idx].status === 'picked_up') {
            dels[idx].status = 'on_the_way';
            DataService.saveDeliveries(dels);
            DataService.addNotification(`${del.customer}'s delivery is on the way`, 'new', true);
            DataService.addCustomerStatusEvent(del.customer, 'arrived');
          }
        }, 8000);
        setTimeout(() => {
          DataService.completeDelivery(del.id);
          DataService.addCustomerStatusEvent(del.customer, 'delivered');
        }, 25000);
      }
    }, 30000));

    // Simulate customer chat replies
    const customerReplies = [
      'Perfect, thank you!',
      'Great, I\'ll be waiting outside',
      'Please use the side entrance',
      'Call me when you\'re 5 min away',
      'Gate code is #4521',
      'Thanks for the update!',
      'Can you add extra napkins?',
      'I\'m in room 304, just knock',
      'Excellent service as always!',
      'Is there a delay?',
      'Almost there? Hungry!',
      'Leave it at the front desk please',
    ];
    this.intervals.push(setInterval(() => {
      if (Math.random() > 0.5) return;
      const driverChat = DataService.getDriverChat();
      const recentDriverMsg = [...driverChat].reverse().find(m => m.from === 'driver');
      if (!recentDriverMsg || recentDriverMsg.from === 'driver') {
        const deliveries = DataService.getDeliveries();
        const active = deliveries.filter(d => d.status !== 'delivered');
        if (active.length > 0 && Math.random() > 0.4) {
          const del = active[Math.floor(Math.random() * active.length)];
          const reply = customerReplies[Math.floor(Math.random() * customerReplies.length)];
          DataService.addDriverChatMessage('customer', del.customer, reply, 'text');
        }
      }
    }, 45000));

    // Simulate customer sending proactive messages
    this.intervals.push(setInterval(() => {
      if (Math.random() > 0.45) return;
      const deliveries = DataService.getDeliveries();
      const active = deliveries.filter(d => d.status !== 'delivered');
      if (active.length > 0) {
        const del = active[Math.floor(Math.random() * active.length)];
        const proactiveMsgs = [
          'Hi, just checking on my order!',
          'ETA update please?',
          'Will you call when arriving?',
          'Hey, I\'m in a meeting - just leave at reception',
          'Running late? No worries!',
          'Can\'t wait for the food!',
        ];
        const msg = proactiveMsgs[Math.floor(Math.random() * proactiveMsgs.length)];
        DataService.addDriverChatMessage('customer', del.customer, msg, 'text');
      }
    }, 70000));

    // Simulate revenue/bonus earnings occasionally
    this.intervals.push(setInterval(() => {
      if (Math.random() > 0.7) {
        const earnings = DataService.getEarnings();
        earnings.bonus += rand(10, 50);
        earnings.total += earnings.bonus;
        DataService.saveEarnings(earnings);
        DataService.addNotification(`Bonus earned! +ETB ${earnings.bonus}`, 'earning');
      }
    }, 90000));
  }

  stop() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    this.running = false;
  }
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const simulation = new SimulationEngine();
