import { round2 } from './utils.js';

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const parseDayInput = (value) => {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfWeek = (date) => {
  const d = startOfDay(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return startOfDay(d);
};

export const getPeriodStart = (period, reference = new Date()) => {
  const ref = startOfDay(reference);
  if (period === 'day') return ref;
  if (period === 'week') return startOfWeek(ref);
  if (period === 'month') return new Date(ref.getFullYear(), ref.getMonth(), 1);
  if (period === 'year') return new Date(ref.getFullYear(), 0, 1);
  return null;
};

export const getPeriodEnd = (period, reference = new Date()) => {
  const ref = startOfDay(reference);
  if (period === 'day') return endOfDay(ref);
  if (period === 'week') {
    const d = startOfWeek(ref);
    d.setDate(d.getDate() + 6);
    return endOfDay(d);
  }
  if (period === 'month') return endOfDay(new Date(ref.getFullYear(), ref.getMonth() + 1, 0));
  if (period === 'year') return endOfDay(new Date(ref.getFullYear(), 11, 31));
  return null;
};

export const resolveReportRange = (period, query = {}) => {
  const now = new Date();

  const from = parseDayInput(query.start);
  const to = parseDayInput(query.end);
  if (from || to) {
    const start = from ? startOfDay(from) : null;
    const periodEnd = to ? endOfDay(to) : now;
    const end = periodEnd > now ? now : periodEnd;
    return { start, end, periodEnd, anchor: start, asOf: end, source: 'range' };
  }

  const anchor = parseDayInput(query.date) || now;
  const resolvedPeriod = period || (query.date ? 'day' : null);
  const start = resolvedPeriod ? getPeriodStart(resolvedPeriod, anchor) : null;
  const periodEnd = (resolvedPeriod ? getPeriodEnd(resolvedPeriod, anchor) : null) || now;
  const end = periodEnd > now ? now : periodEnd;

  return {
    start,
    end,
    periodEnd,
    anchor,
    asOf: end,
    source: query.date ? 'date' : 'period'
  };
};

export const buildMovementQuery = ({ start, end }) => {
  const query = {};
  if (end) query.createdAt = { $lte: end };
  if (start) query.createdAt = { ...(query.createdAt || {}), $gte: start };
  return query;
};

const movementValue = (m, priceByItem) => {
  const unitPrice = Number(priceByItem.get(String(m.item)) || 0);
  return round2(Math.abs(Number(m.change || 0)) * unitPrice);
};

export const summarizeMovements = (movements, priceByItem = new Map()) => {
  const stockMovements = movements.filter((m) => m.type !== 'deleted');
  const ins = stockMovements.filter((m) => m.change > 0);
  const outs = stockMovements.filter((m) => m.change < 0);

  const addedUnits = ins.reduce((s, m) => s + m.change, 0);
  const consumedUnits = Math.abs(outs.reduce((s, m) => s + m.change, 0));
  const addedValue = ins.reduce((s, m) => s + movementValue(m, priceByItem), 0);
  const consumedValue = outs.reduce((s, m) => s + movementValue(m, priceByItem), 0);

  return {
    count: movements.length,
    stockCount: stockMovements.length,
    addedUnits: round2(addedUnits),
    consumedUnits: round2(consumedUnits),
    netChange: round2(addedUnits - consumedUnits),
    addedValue: round2(addedValue),
    consumedValue: round2(consumedValue),
    periodValue: round2(addedValue + consumedValue),
    netValue: round2(addedValue - consumedValue)
  };
};

export const priceMovements = (movements, priceByItem = new Map()) =>
  movements.map((m) => {
    const unitPrice = Number(priceByItem.get(String(m.item)) || 0);
    return {
      _id: m._id,
      item: m.item,
      itemName: m.itemName,
      type: m.type,
      qtyBefore: Number(m.qtyBefore || 0),
      qtyAfter: Number(m.qtyAfter || 0),
      change: Number(m.change || 0),
      reason: m.reason || '',
      createdBy: m.createdBy || 'System',
      createdAt: m.createdAt,
      unitPrice,
      totalPrice: round2(Math.abs(Number(m.change || 0)) * unitPrice)
    };
  });

export const buildStockSnapshot = async ({ Item, Movement, asOf }) => {
  const [items, ledger] = await Promise.all([
    Item.find({}).sort({ category: 1, name: 1 }),
    Movement.aggregate([
      { $match: { item: { $exists: true, $ne: null }, createdAt: { $lte: asOf } } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: '$item',
          qtyAfter: { $last: '$qtyAfter' },
          type: { $last: '$type' }
        }
      }
    ])
  ]);

  const ledgerByItem = new Map(ledger.map((entry) => [String(entry._id), entry]));
  const rows = [];

  for (const item of items) {
    const entry = ledgerByItem.get(String(item._id));
    let quantity;

    if (entry) {
      if (entry.type === 'deleted') continue;
      quantity = Number(entry.qtyAfter || 0);
    } else if (item.createdAt && new Date(item.createdAt) > asOf) {
      continue;
    } else {
      quantity = Number(item.quantity || 0);
    }

    const pricePerUnit = Number(item.pricePerUnit || 0);
    rows.push({
      _id: item._id,
      name: item.name,
      category: item.category || 'Other',
      unit: item.unit || 'pcs',
      quantity,
      minStockLevel: Number(item.minStockLevel || 0),
      pricePerUnit,
      value: round2(quantity * pricePerUnit)
    });
  }

  const byCategory = rows.reduce((acc, row) => {
    const existing = acc.find((c) => c.name === row.category);
    if (existing) {
      existing.count += 1;
      existing.units += row.quantity;
      existing.value = round2(existing.value + row.value);
    } else {
      acc.push({ name: row.category, count: 1, units: row.quantity, value: row.value });
    }
    return acc;
  }, []);

  return {
    rows,
    totals: {
      itemCount: rows.length,
      totalUnits: round2(rows.reduce((s, r) => s + r.quantity, 0)),
      totalValue: round2(rows.reduce((s, r) => s + r.value, 0)),
      lowStockCount: rows.filter((r) => r.quantity <= r.minStockLevel).length,
      byCategory
    }
  };
};
