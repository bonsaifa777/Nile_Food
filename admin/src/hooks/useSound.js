import { useState, useCallback, useEffect, useRef } from 'react';
import { EventBus, Events } from '../services/eventBus';

const STORAGE_KEY = 'nf_sound_enabled';

let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
  }
  return audioCtx;
}

function playTone(frequency, duration, type = 'sine', volume = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playNewOrder() {
  playTone(523, 0.08, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.08, 'sine', 0.12), 100);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 200);
}

function playUrgent() {
  playTone(440, 0.15, 'square', 0.08);
  setTimeout(() => playTone(440, 0.15, 'square', 0.08), 300);
  setTimeout(() => playTone(440, 0.15, 'square', 0.08), 600);
  setTimeout(() => playTone(880, 0.3, 'square', 0.08), 900);
}

function playComplete() {
  playTone(784, 0.1, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.12), 100);
  setTimeout(() => playTone(523, 0.1, 'sine', 0.10), 200);
  setTimeout(() => playTone(1047, 0.25, 'sine', 0.14), 300);
}

function playChatMessage() {
  playTone(880, 0.05, 'sine', 0.06);
  setTimeout(() => playTone(1100, 0.08, 'sine', 0.06), 60);
}

function playEarning() {
  playTone(523, 0.08, 'triangle', 0.10);
  setTimeout(() => playTone(659, 0.08, 'triangle', 0.10), 80);
  setTimeout(() => playTone(784, 0.08, 'triangle', 0.10), 160);
  setTimeout(() => playTone(1047, 0.2, 'triangle', 0.12), 240);
}

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) !== 'false'; } catch { return true; }
  });

  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  const play = useCallback((type) => {
    if (!soundRef.current) return;
    switch (type) {
      case 'newOrder': playNewOrder(); break;
      case 'urgent': playUrgent(); break;
      case 'complete': playComplete(); break;
      case 'chat': playChatMessage(); break;
      case 'earning': playEarning(); break;
    }
  }, []);

  useEffect(() => {
    const unsubOrder = EventBus.on(Events.ORDER_UPDATED, (orders) => {
      if (!soundRef.current) return;
      if (orders?.length > 0) {
        const newOrders = orders.filter(o => o.status === 'pending' && (Date.now() - new Date(o.createdAt).getTime()) < 30000);
        if (newOrders.length > 0) play('newOrder');
      }
    });
    const unsubNotif = EventBus.on(Events.NOTIFICATION_SENT, (notifs) => {
      if (!soundRef.current || !notifs?.length) return;
      const latest = notifs[0];
      if (latest?.urgent) play('urgent');
      else if (latest?.type === 'earning') play('earning');
    });
    const unsubDelivery = EventBus.on(Events.DELIVERY_UPDATED, (deliveries) => {
      if (!soundRef.current || !deliveries?.length) return;
      const completed = deliveries.filter(d => d.status === 'delivered');
      if (completed.length > 0) play('complete');
    });
    const unsubChat = EventBus.on(Events.DRIVER_CHAT, (msgs) => {
      if (!soundRef.current || !msgs?.length) return;
      const last = msgs[msgs.length - 1];
      if (last?.from === 'customer' && soundRef.current) play('chat');
    });

    return () => {
      unsubOrder();
      unsubNotif();
      unsubDelivery();
      unsubChat();
    };
  }, [play]);

  return { soundEnabled, toggleSound, play };
}
