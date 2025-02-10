import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['purchase', 'coupon', 'refund', 'usage'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'coupon'],
    required: function() {
      return this.type === 'purchase';
    },
  },
  couponCode: {
    type: String,
    required: function() {
      return this.type === 'coupon';
    },
  },
  description: {
    type: String,
    trim: true,
  },
  metadata: {
    type: Map,
    of: String,
    default: {},
  },
}, {
  timestamps: true,
});

// İndexler
creditTransactionSchema.index({ userId: 1, createdAt: -1 });
creditTransactionSchema.index({ status: 1 });
creditTransactionSchema.index({ type: 1 });

const CreditTransaction = mongoose.models.CreditTransaction || mongoose.model('CreditTransaction', creditTransactionSchema);

export default CreditTransaction; 