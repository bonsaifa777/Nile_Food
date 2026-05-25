import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiNavigation, FiMapPin, FiTruck, FiHome, FiClock, FiCircle,
  FiChevronRight, FiChevronLeft, FiAlertTriangle, FiCheckCircle,
  FiArrowRight, FiShield, FiBattery,
} from 'react-icons/fi';
import { driverProfile } from './data';

function resolveAddr(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  return addr.address || addr.label || '';
}

function openInMaps(address) {
  const addrStr = resolveAddr(address);
  if (!addrStr || addrStr === 'Address not specified') return;
  const encoded = encodeURIComponent(addrStr);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
  window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
}

const TRAFFIC_CONDITIONS = [
  { label: 'Clear', color: '#10b981', speed: 1.0 },
  { label: 'Moderate', color: '#f59e0b', speed: 0.6 },
  { label: 'Heavy', color: '#ef4444', speed: 0.3 },
];

const STREET_NAMES = [
  'Bole Road', 'Congo Street', 'CMC Avenue', 'Meskel Square',
  'Kazanchis', 'Sarbet Link', 'Hayahulet', 'Gergesen Road',
  'Airport Road', 'Ring Road',
];

const ADDRESS_AREAS = [
  'Bole Atlas', 'Bole Rwanda', 'CMC', 'Kazanchis', 'Sarbet',
  'Hayahulet', 'Meskel', 'Gergesen',
];

function generateRoutePoints(from, to, count = 8) {
  const points = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t + Math.sin(t * Math.PI * 3) * (Math.random() * 4 + 1);
    points.push({ x, y });
  }
  return points;
}

function buildFullPath(deliveries) {
  const kitchen = { x: 10, y: 55, name: 'Kitchen', id: 'start' };
  const stops = [{ ...kitchen, type: 'start' }];
  const active = deliveries.filter(d => d.status !== 'delivered');
  let cx = 12, cy = 52;
  active.forEach((d, i) => {
    const areaSeed = d.deliveryAddress?.length || i * 7;
    const areaIdx = areaSeed % ADDRESS_AREAS.length;
    const angle = (i / Math.max(active.length, 1)) * Math.PI * 1.2 + 0.3;
    const dist = 20 + (d.distance || 3) * 5;
    const nx = Math.min(92, Math.max(5, cx + Math.cos(angle) * dist * 0.15));
    const ny = Math.min(88, Math.max(8, cy + Math.sin(angle) * dist * 0.12));
    stops.push({ x: nx, y: ny, name: d.customer, id: d.id, type: 'delivery', delivery: d, area: ADDRESS_AREAS[areaIdx] });
    cx = nx; cy = ny;
  });
  stops.push({ x: 90, y: 15, name: 'End Shift', id: 'end', type: 'end' });
  return stops;
}

function calculateSegmentTimes(stops, conditions) {
  const segments = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const dx = stops[i + 1].x - stops[i].x;
    const dy = stops[i + 1].y - stops[i].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const cond = conditions[i] || TRAFFIC_CONDITIONS[0];
    const baseTime = dist * 0.4;
    const actualTime = baseTime / cond.speed;
    segments.push({
      from: stops[i], to: stops[i + 1],
      distance: (dist * 0.25).toFixed(1),
      time: actualTime,
      baseTime,
      condition: cond,
      trafficLabel: cond.label,
    });
  }
  return segments;
}

export default function MapView({ selectedDelivery, deliveries }) {
  const [driverProgress, setDriverProgress] = useState(0);
  const [selectedStop, setSelectedStop] = useState(null);
  const [trafficConditions, setTrafficConditions] = useState([]);
  const [showRoute, setShowRoute] = useState(true);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [etaTotal, setEtaTotal] = useState(0);
  const [driverMessage, setDriverMessage] = useState('Heading to next stop');
  const mapRef = useRef(null);

  const stops = useMemo(() => buildFullPath(deliveries || []), [deliveries]);

  const segments = useMemo(() => {
    if (stops.length < 2) return [];
    const conds = trafficConditions.length === stops.length - 1
      ? trafficConditions
      : stops.slice(0, -1).map(() => TRAFFIC_CONDITIONS[Math.floor(Math.random() * 3)]);
    return calculateSegmentTimes(stops, conds);
  }, [stops, trafficConditions]);

  useEffect(() => {
    const conds = stops.slice(0, -1).map(() => {
      const r = Math.random();
      return r < 0.5 ? TRAFFIC_CONDITIONS[0] : r < 0.8 ? TRAFFIC_CONDITIONS[1] : TRAFFIC_CONDITIONS[2];
    });
    setTrafficConditions(conds);
  }, [stops.length]);

  useEffect(() => {
    const totalTime = segments.reduce((s, seg) => s + seg.time, 0);
    setEtaTotal(totalTime);
  }, [segments]);

  useEffect(() => {
    if (segments.length === 0) return;
    const interval = setInterval(() => {
      setDriverProgress(prev => {
        const next = prev + 0.15 + Math.random() * 0.1;
        return next >= 100 ? 0 : next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [segments.length]);

  useEffect(() => {
    if (segments.length === 0) return;
    let accumulated = 0;
    for (let i = 0; i < segments.length; i++) {
      const segPct = (segments[i].time / etaTotal) * 100;
      accumulated += segPct;
      if (driverProgress <= accumulated || i === segments.length - 1) {
        setCurrentSegment(i);
        const seg = segments[i];
        const delivery = stops[i + 1]?.delivery;
        if (delivery) {
          setDriverMessage(`Delivering to ${delivery.customer} · ${delivery.deliveryAddress?.split(',')[0] || delivery.customer}`);
          setEtaTotal(Math.max(2, Math.round(segments.slice(i).reduce((s, seg) => s + seg.time, 0))));
        } else if (stops[i + 1]?.type === 'end') {
          setDriverMessage('Almost done with shift!');
          setEtaTotal(0);
        }
        break;
      }
    }
  }, [driverProgress, segments, etaTotal, stops]);

  const currentPos = useMemo(() => {
    if (segments.length === 0) return { x: 10, y: 55 };
    let accumulated = 0;
    const totalTime = segments.reduce((s, seg) => s + seg.time, 0);
    const progressRatio = driverProgress / 100;
    const targetTime = progressRatio * totalTime;
    for (let i = 0; i < segments.length; i++) {
      if (targetTime <= accumulated + segments[i].time || i === segments.length - 1) {
        const segProgress = (targetTime - accumulated) / segments[i].time;
        const clamped = Math.max(0, Math.min(1, segProgress));
        return {
          x: segments[i].from.x + (segments[i].to.x - segments[i].from.x) * clamped,
          y: segments[i].from.y + (segments[i].to.y - segments[i].from.y) * clamped,
        };
      }
      accumulated += segments[i].time;
    }
    return { x: segments[segments.length - 1]?.to.x || 10, y: segments[segments.length - 1]?.to.y || 55 };
  }, [driverProgress, segments]);

  const getStopStatus = (stopIndex) => {
    let accumulated = 0;
    for (let i = 0; i < stopIndex && i < segments.length; i++) {
      accumulated += segments[i].time;
    }
    const stopPct = (accumulated / (segments.reduce((s, seg) => s + seg.time, 0) || 1)) * 100;
    if (driverProgress > stopPct + 2) return 'completed';
    if (driverProgress >= stopPct - 3 && driverProgress <= stopPct + 2) return 'current';
    return 'pending';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return FiCheckCircle;
      case 'current': return FiTruck;
      default: return FiMapPin;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'current': return '#06b6d4';
      default: return '#f59e0b';
    }
  };

  const driverPosStyle = {
    left: `${currentPos.x}%`,
    top: `${currentPos.y}%`,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Live Route Map</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {driverProfile.name} · {stops.filter(s => s.type === 'delivery').length} deliveries remaining
          </p>
        </div>
        <div className="flex items-center gap-2">
          {etaTotal > 0 && (
            <motion.div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <FiClock size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">ETA ~{Math.round(etaTotal)} min</span>
            </motion.div>
          )}
          <div className="flex items-center gap-2">
            {selectedDelivery && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => openInMaps(selectedDelivery.deliveryAddress)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                }}
              >
                <FiNavigation size={12} /> Navigate
              </motion.button>
            )}
            {!selectedDelivery && (() => {
              const active = (deliveries || []).find(d => d.status !== 'delivered');
              return active ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => openInMaps(active.deliveryAddress)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  }}
                >
                  <FiNavigation size={12} /> Navigate Next
                </motion.button>
              ) : null;
            })()}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowRoute(!showRoute)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{
                background: showRoute ? 'rgba(6,182,212,0.1)' : 'var(--input-bg)',
                color: showRoute ? '#06b6d4' : 'var(--text-secondary)',
                border: `1px solid ${showRoute ? 'rgba(6,182,212,0.2)' : 'var(--border-color)'}`,
              }}
            >
              <FiNavigation size={12} /> Route
            </motion.button>
          </div>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden" style={{
        background: 'linear-gradient(180deg, #0c1929 0%, #0f2847 30%, #1a3a5c 60%, #2d5a3d 100%)',
        border: '1px solid var(--border-color)',
        height: '500px',
      }}>
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.12 }}>
          <defs>
            <pattern id="mgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mgrid)" />
        </svg>

        {/* Streets */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#4a90d9" strokeWidth="2" strokeDasharray="4,8" />
          <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#4a90d9" strokeWidth="1.5" strokeDasharray="3,6" />
          <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#4a90d9" strokeWidth="1.5" strokeDasharray="3,6" />
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#4a90d9" strokeWidth="1" strokeDasharray="2,4" />
          <line x1="0" y1="72%" x2="100%" y2="72%" stroke="#4a90d9" strokeWidth="1" strokeDasharray="2,4" />
          <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#4a90d9" strokeWidth="0.8" strokeDasharray="2,6" />
          <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#4a90d9" strokeWidth="0.8" strokeDasharray="2,6" />
          <line x1="78%" y1="0" x2="78%" y2="100%" stroke="#4a90d9" strokeWidth="0.8" strokeDasharray="2,6" />
        </svg>

        {/* Route path with traffic segments */}
        {showRoute && segments.length > 0 && (
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
            {segments.map((seg, i) => {
              const pts = generateRoutePoints(seg.from, seg.to, 6);
              const d = pts.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ');
              const isCompleted = driverProgress > (segments.slice(0, i + 1).reduce((s, s2) => s + s2.time, 0) / segments.reduce((s, seg) => s + seg.time, 0)) * 100;
              return (
                <g key={i}>
                  <path d={d} fill="none"
                    stroke={isCompleted ? '#10b981' : seg.condition.color}
                    strokeWidth={isCompleted ? 4 : 3}
                    strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray={seg.trafficLabel === 'Heavy' ? '4,3' : 'none'}
                    style={{ opacity: isCompleted ? 0.6 : 0.8, transition: 'stroke 0.5s' }}
                  />
                </g>
              );
            })}
            {/* Animated route pulse */}
            <motion.circle r="4" fill="#06b6d4" style={{ filter: 'blur(2px)' }}
              animate={{
                cx: [`${stops[0]?.x || 10}%`, `${stops[stops.length - 1]?.x || 90}%`],
                cy: [`${stops[0]?.y || 55}%`, `${stops[stops.length - 1]?.y || 15}%`],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
          </svg>
        )}

        {/* Traffic indicators */}
        {segments.map((seg, i) => {
          if (seg.trafficLabel === 'Clear' || i > 3) return null;
          const midX = (seg.from.x + seg.to.x) / 2;
          const midY = (seg.from.y + seg.to.y) / 2;
          return (
            <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute z-10 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-medium"
              style={{
                left: `${midX}%`, top: `${midY - 6}%`,
                background: `${seg.condition.color}20`,
                border: `1px solid ${seg.condition.color}40`,
                color: seg.condition.color,
                backdropFilter: 'blur(4px)',
              }}
            >
              <FiAlertTriangle size={8} />
              {seg.trafficLabel}
            </motion.div>
          );
        })}

        {/* Delivery stops */}
        {stops.map((stop, idx) => {
          if (stop.type === 'start' || stop.type === 'end') return null;
          const status = getStopStatus(idx);
          const StatusIcon = getStatusIcon(status);
          const sColor = getStatusColor(status);
          const isSelected = selectedStop === stop.id;

          return (
            <motion.button
              key={stop.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ scale: 1.15, zIndex: 50 }}
              onClick={() => setSelectedStop(isSelected ? null : stop.id)}
              className="absolute z-10 flex flex-col items-center"
              style={{ left: `${stop.x}%`, top: `${stop.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <motion.div
                animate={status === 'current' ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border-2 relative"
                style={{
                  background: status === 'completed' ? '#10b981' : status === 'current' ? '#06b6d4' : '#f59e0b',
                  borderColor: status === 'current' ? 'rgba(255,255,255,0.6)' : 'transparent',
                  boxShadow: status === 'current' ? '0 0 20px rgba(6,182,212,0.5)' : '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                <StatusIcon size={15} className="text-white" />
                {status === 'current' && (
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                )}
              </motion.div>
              <span className="text-[10px] mt-1 font-medium px-1.5 py-0.5 rounded whitespace-nowrap"
                style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', backdropFilter: 'blur(4px)' }}
              >
                {stop.delivery?.customer || stop.name}
              </span>

              <AnimatePresence>
                {isSelected && stop.delivery && (
                  <motion.div initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
                    style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <div className="p-3 space-y-1.5">
                      <p className="text-xs font-semibold text-white">{stop.delivery.customer}</p>
                      <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#94a3b8' }}>
                        <FiMapPin size={10} className="text-cyan-400" />
                        <span className="truncate">{stop.delivery.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#94a3b8' }}>
                        <FiHome size={10} className="text-amber-400" />
                        <span>{stop.delivery.deliveryType?.replace('-', ' ')}</span>
                      </div>
                      {stop.delivery.instructions && (
                        <div className="flex items-start gap-1.5 text-[10px] mt-1 p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.1)' }}>
                          <FiShield size={10} className="text-amber-400 mt-0.5" />
                          <span style={{ color: '#fbbf24' }}>{stop.delivery.instructions}</span>
                        </div>
                      )}
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); openInMaps(stop.delivery.deliveryAddress); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-2 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5"
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff',
                        }}
                      >
                        <FiNavigation size={12} /> Open in Maps
                      </motion.button>
                      <div className="flex items-center justify-between pt-1 border-t border-white/10 mt-1.5">
                        <span className="text-[10px]" style={{ color: '#64748b' }}>{stop.delivery.items.length} items</span>
                        <span className="text-[10px]" style={{ color: '#64748b' }}>{stop.delivery.distance}km</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        {/* Kitchen start marker */}
        <motion.div className="absolute z-10" style={{ left: '10%', top: '55%', transform: 'translate(-50%, -50%)' }}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/30"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <FiHome size={16} className="text-white" />
          </div>
          <span className="text-[10px] mt-1 font-medium px-1.5 py-0.5 rounded whitespace-nowrap block text-center"
            style={{ background: 'rgba(0,0,0,0.75)', color: '#fff' }}>
            Nile Kitchen
          </span>
        </motion.div>

        {/* Animated Driver Position */}
        <motion.div
          animate={{ x: currentPos.x, y: currentPos.y }}
          transition={{ type: 'spring', stiffness: 35, damping: 15 }}
          className="absolute z-20"
          style={{ left: 0, top: 0, transform: 'translate(-50%, -50%)' }}
        >
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute w-12 h-12 rounded-full"
            style={{ background: 'rgba(6,182,212,0.25)', top: '-6px', left: '-6px' }}
          />
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg relative z-10 border-2 border-white"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
          >
            <FiTruck size={16} className="text-white" />
          </motion.div>
        </motion.div>

        {/* Top-left area info */}
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs z-10"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
        >
          <FiNavigation size={12} className="text-cyan-400" />
          <span style={{ color: '#fff' }}>
            {stops.filter(s => s.type === 'delivery').length} stops · {driverProgress.toFixed(0)}% complete
          </span>
        </div>

        {/* Top-right ETA */}
        <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs z-10"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
        >
          <FiClock size={12} className="text-emerald-400" />
          <span style={{ color: '#fff' }}>ETA: ~{Math.round(etaTotal)} min</span>
        </div>

        {/* Bottom progress bar */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
          >
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#06b6d4', minWidth: 'fit-content' }}>
              <FiTruck size={12} />
              <span className="font-medium whitespace-nowrap">{driverMessage}</span>
            </div>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                animate={{ width: `${driverProgress}%` }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #06b6d4, #10b981)',
                  boxShadow: '0 0 8px rgba(6,182,212,0.5)',
                }}
              />
            </div>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)', minWidth: '35px', textAlign: 'right' }}>
              {driverProgress.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Turn list sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 rounded-2xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FiNavigation size={14} className="text-cyan-400" /> Turn-by-Turn Directions
          </h3>
          <div className="space-y-1">
            {segments.slice(0, 8).map((seg, i) => {
              const isActive = currentSegment === i;
              const isPast = currentSegment > i;
              const fromStop = stops.find(s => s.x === seg.from.x && s.y === seg.from.y);
              const toStop = stops.find(s => s.x === seg.to.x && s.y === seg.to.y);
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    const addr = toStop?.delivery?.deliveryAddress || toStop?.name;
                    if (addr && addr !== 'End Shift') openInMaps(addr);
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive ? 'ring-1' : ''
                  }`}
                  style={{
                    background: isPast ? 'rgba(16,185,129,0.05)' : isActive ? 'rgba(6,182,212,0.08)' : 'transparent',
                    border: `1px solid ${
                      isPast ? 'rgba(16,185,129,0.15)' :
                      isActive ? 'rgba(6,182,212,0.25)' : 'transparent'
                    }`,
                    ringColor: isActive ? 'rgba(6,182,212,0.3)' : 'transparent',
                  }}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isPast ? 'bg-emerald-500/20 text-emerald-400' :
                    isActive ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-gray-500/10'
                  }`}>
                    {isPast ? <FiCheckCircle size={13} /> : <FiArrowRight size={13} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${isPast ? 'line-through' : ''}`}
                      style={{ color: isPast ? 'var(--text-muted)' : 'var(--text-primary)' }}
                    >
                      {toStop?.delivery?.customer || toStop?.name || 'Destination'} {toStop?.area ? `(${toStop.area})` : ''}
                    </p>
                    <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <span>{seg.distance} km</span>
                      <span>·</span>
                      <span style={{ color: seg.condition.color }}>
                        {seg.trafficLabel === 'Clear' ? 'Clear traffic' :
                         seg.trafficLabel === 'Moderate' ? 'Moderate traffic' :
                         'Heavy traffic'}
                      </span>
                      <span>·</span>
                      <span>~{Math.round(seg.time)} min</span>
                    </p>
                  </div>
                  <span style={{ color: seg.condition.color }}>
                    <FiCircle size={8} fill={seg.condition.color} />
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Trip Summary</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Total Distance', value: `${segments.reduce((s, seg) => s + parseFloat(seg.distance), 0).toFixed(1)} km`, color: '#06b6d4' },
                { label: 'Estimated Time', value: `~${Math.round(etaTotal)} min`, color: '#10b981' },
                { label: 'Stops Remaining', value: stops.filter(s => s.type === 'delivery').length.toString(), color: '#f59e0b' },
                { label: 'Deliveries Done', value: stops.filter((s, i) => getStopStatus(i) === 'completed').length.toString(), color: '#6366f1' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span className="text-xs font-semibold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-4" style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(34,211,238,0.03))',
            border: '1px solid rgba(6,182,212,0.15)',
          }}>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <FiBattery size={13} className="text-cyan-400" /> Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Fuel', value: `${driverProfile.fuelLevel || 68}%` },
                { label: 'Covered', value: `${deliveries?.length * 2.5 || 12} km` },
                { label: 'Rating', value: driverProfile.rating },
                { label: 'On Time', value: `${Math.round(Math.random() * 8 + 90)}%` },
              ].map((stat, i) => (
                <div key={i} className="text-center p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <p className="text-[18px] font-bold" style={{ color: '#06b6d4' }}>{stat.value}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
