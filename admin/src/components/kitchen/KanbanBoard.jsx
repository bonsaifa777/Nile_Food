import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiBell, FiClock, FiGrid, FiCheckCircle, FiTruck, FiAlertTriangle, FiArrowUp, FiArrowDown, FiCheck, FiPackage } from 'react-icons/fi';
import OrderCard from './OrderCard';

const statusFlow = ['pending', 'preparing', 'ready', 'served', 'on_the_way', 'delivered', 'delivery-pickup'];

const columnConfig = [
  { key: 'pending', label: 'Pending', icon: FiClock, color: '#f59e0b' },
  { key: 'preparing', label: 'Preparing', icon: FiGrid, color: '#f97316' },
  { key: 'ready', label: 'Ready', icon: FiCheckCircle, color: '#10b981' },
  { key: 'served', label: 'Served', icon: FiPackage, color: '#06b6d4' },
  { key: 'on_the_way', label: 'On the Way', icon: FiTruck, color: '#8b5cf6' },
  { key: 'delivered', label: 'Delivered', icon: FiCheck, color: '#22c55e' },
  { key: 'delivery-pickup', label: 'Delivery Pickup', icon: FiTruck, color: '#a855f7' },
];

export default function KanbanBoard({ orders, onAccept, onReject, onComplete, onAssign, onPrint, onStatusChange, sortByTime = false }) {
  const [draggedOrder, setDraggedOrder] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const prevOrderIds = useRef(new Set());

  useEffect(() => {
    const currentIds = new Set(orders.map(o => o.id));
    const added = new Set([...currentIds].filter(id => !prevOrderIds.current.has(id)));
    if (added.size > 0) {
      setNewOrderIds(prev => new Set([...prev, ...added]));
      setTimeout(() => setNewOrderIds(prev => {
        const next = new Set(prev);
        added.forEach(id => next.delete(id));
        return next;
      }), 3000);
    }
    prevOrderIds.current = currentIds;
  }, [orders]);

  const grouped = {};
  columnConfig.forEach(col => { grouped[col.key] = []; });
  orders.forEach(order => {
    if (grouped[order.status]) grouped[order.status].push(order);
  });

  if (sortByTime) {
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => (b.timeElapsed || 0) - (a.timeElapsed || 0));
    });
  } else {
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (b.priority === 'high' && a.priority !== 'high') return 1;
        if (a.priority === 'medium' && b.priority === 'low') return -1;
        if (b.priority === 'medium' && a.priority === 'low') return 1;
        return (b.timeElapsed || 0) - (a.timeElapsed || 0);
      });
    });
  }

  const isValidDrop = (order, targetColumnKey) => {
    if (!order) return false;
    if (order.status === targetColumnKey) return false;
    return true;
  };

  const handleDragStart = (e, order) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', order.id);
    setDraggedOrder(order);
  };

  const handleDragOver = (e, columnKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey);
      if (draggedOrder && isValidDrop(draggedOrder, columnKey)) {
        setDropTarget(columnKey);
      }
    }
  };

  const handleDrop = (e, columnKey) => {
    e.preventDefault();
    if (draggedOrder && draggedOrder.status !== columnKey) {
      onStatusChange?.(draggedOrder.id, columnKey);
    }
    setDraggedOrder(null);
    setDragOverColumn(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedOrder(null);
    setDragOverColumn(null);
    setDropTarget(null);
  };

  const getTransitionInfo = (order, targetKey) => {
    if (!order || !targetKey || order.status === targetKey) return null;
    const oldIdx = statusFlow.indexOf(order.status);
    const newIdx = statusFlow.indexOf(targetKey);
    const isForward = newIdx > oldIdx;
    const isBackward = newIdx < oldIdx;
    const skipCount = Math.abs(newIdx - oldIdx) - 1;
    return { isForward, isBackward, skipCount, skippedStatuses: skipCount > 0 ? statusFlow.slice(Math.min(oldIdx, newIdx) + 1, Math.max(oldIdx, newIdx)) : [] };
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
      {columnConfig.map(col => {
        const hasDragOver = dragOverColumn === col.key;
        const validDrop = dropTarget === col.key;
        const transition = draggedOrder ? getTransitionInfo(draggedOrder, col.key) : null;
        const colOrders = grouped[col.key] || [];

        return (
          <div
            key={col.key}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDrop={(e) => handleDrop(e, col.key)}
            onDragLeave={() => { setDragOverColumn(null); setDropTarget(null); }}
            className="flex-shrink-0"
            style={{ width: '320px', minWidth: '320px' }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <col.icon size={16} style={{ color: col.color }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{col.label}</h3>
              </div>
              <motion.span
                key={colOrders.length}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="text-xs font-bold px-2.5 py-1 rounded-lg"
                style={{
                  background: `${col.color}18`,
                  color: col.color,
                  border: `1px solid ${col.color}30`,
                }}
              >
                {colOrders.length}
              </motion.span>
            </div>

            <div
              className="space-y-3 min-h-[200px] rounded-2xl p-2 transition-all duration-200 relative"
              style={{
                background: validDrop ? `${col.color}12` : hasDragOver ? `${col.color}06` : 'transparent',
                border: `2px dashed ${validDrop ? col.color : hasDragOver ? `${col.color}25` : 'transparent'}`,
              }}
            >
              {validDrop && draggedOrder && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-xs font-semibold px-4 py-2 rounded-lg"
                      style={{
                        background: `${col.color}20`,
                        color: col.color,
                        border: `1px solid ${col.color}40`,
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {transition?.isBackward
                        ? '← Move backward'
                        : transition?.skipCount > 0
                          ? `→ Skip: ${transition.skippedStatuses.join(', ')}`
                          : '→ Drop to move'}
                    </motion.span>
                  </motion.div>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {colOrders.length === 0 && !hasDragOver ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 rounded-2xl"
                    style={{ border: '1px dashed var(--border-color)', background: 'var(--glass-bg)' }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--input-bg)' }}>
                      <FiPlus size={20} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No orders</p>
                  </motion.div>
                ) : (
                  colOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      layout
                      draggable
                      onDragStart={(e) => handleDragStart(e, order)}
                      onDragEnd={handleDragEnd}
                      initial={newOrderIds.has(order.id) ? { opacity: 0, scale: 0.8, y: -30 } : { opacity: 1, scale: 1, y: 0 }}
                      animate={newOrderIds.has(order.id)
                        ? { opacity: 1, scale: 1, y: 0, boxShadow: ['0 0 30px rgba(59,130,246,0.5)', '0 0 0px rgba(59,130,246,0)'] }
                        : { opacity: 1, scale: 1, y: 0 }
                      }
                      transition={{ type: 'spring', stiffness: 300, damping: 25, duration: newOrderIds.has(order.id) ? 2 : 0.3 }}
                      style={{
                        opacity: draggedOrder?.id === order.id ? 0.4 : 1,
                      }}
                    >
                      <OrderCard
                        order={order}
                        index={i}
                        onAccept={onAccept}
                        onReject={onReject}
                        onComplete={onComplete}
                        onAssign={onAssign}
                        onPrint={onPrint}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
