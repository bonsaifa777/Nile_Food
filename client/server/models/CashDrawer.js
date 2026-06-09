import mongoose from 'mongoose';
import { CASH_DRAWER_EVENTS } from '../shared/constants.js';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(CASH_DRAWER_EVENTS),
    required: true
  },
  amount: { type: Number, required: true },
  reason: { type: String },
  reference: { type: String },
  orderId: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const cashDrawerSchema = new mongoose.Schema({
  openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  openingBalance: { type: Number, required: true, default: 0 },
  closingBalance: { type: Number, default: 0 },
  expectedBalance: { type: Number, default: 0 },
  difference: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  transactions: [transactionSchema],
  notes: { type: String },
  openedAt: { type: Date, default: Date.now },
  closedAt: { type: Date }
}, { timestamps: true });

cashDrawerSchema.methods.calculateExpected = function () {
  let balance = this.openingBalance;
  for (const tx of this.transactions) {
    if (tx.type === CASH_DRAWER_EVENTS.DEPOSIT || tx.type === CASH_DRAWER_EVENTS.PAYMENT_IN) {
      balance += tx.amount;
    } else if (tx.type === CASH_DRAWER_EVENTS.WITHDRAWAL || tx.type === CASH_DRAWER_EVENTS.REFUND_OUT) {
      balance -= tx.amount;
    }
  }
  return balance;
};

export default mongoose.model('CashDrawer', cashDrawerSchema);
