import { useState, useEffect, useCallback } from 'react';
import { DataService } from '../services/dataService';
import { EventBus, Events } from '../services/eventBus';

function useStore(getter, eventNames) {
  const [data, setData] = useState(() => getter());

  useEffect(() => {
    const handlers = eventNames.map(ev => EventBus.on(ev, () => {
      setData(getter());
    }));
    return () => handlers.forEach(fn => fn());
  }, []);

  return data;
}

export function useOrders() {
  return useStore(() => DataService.getOrders(), [Events.ORDER_UPDATED, Events.ORDER_CREATED, Events.METRICS_UPDATED]);
}

export function useDeliveries() {
  return useStore(() => DataService.getDeliveries(), [Events.DELIVERY_UPDATED, Events.DELIVERY_ASSIGNED]);
}

export function useInventory() {
  return useStore(() => DataService.getInventory(), [Events.INVENTORY_UPDATED]);
}

export function useNotifications() {
  return useStore(() => DataService.getNotifications(), [Events.NOTIFICATION_SENT]);
}

export function useChat() {
  return useStore(() => DataService.getChatMessages(), [Events.CHAT_MESSAGE]);
}

export function useDriverChat() {
  return useStore(() => DataService.getDriverChat(), [Events.DRIVER_CHAT]);
}

export function useEarnings() {
  return useStore(() => DataService.getEarnings(), [Events.EARNINGS_UPDATED]);
}

export function useMetrics() {
  return useStore(() => DataService.getMetrics(), [Events.METRICS_UPDATED, Events.ORDER_UPDATED, Events.ORDER_CREATED]);
}

export function useDataService() {
  return DataService;
}
