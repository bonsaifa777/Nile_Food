let ctx = null;
let lastPlayedAt = 0;

function getContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!ctx) ctx = new Ctx();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function unlockNotificationSound() {
  getContext();
}

export function playNotificationSound() {
  const now = Date.now();
  if (now - lastPlayedAt < 1500) return;
  lastPlayedAt = now;
  try {
    const c = getContext();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, c.currentTime);
    osc.frequency.setValueAtTime(1100, c.currentTime + 0.1);
    osc.frequency.setValueAtTime(1320, c.currentTime + 0.2);
    gain.gain.setValueAtTime(0.08, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.45);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.45);
  } catch {}
}

if (typeof window !== 'undefined') {
  const unlock = () => unlockNotificationSound();
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}