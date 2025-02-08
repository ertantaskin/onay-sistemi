import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  creditAmount: {
    type: Number,
    required: true,
    min: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usageLimit: {
    type: Number,
    required: true,
    min: 1,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// İndexler
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ expiresAt: 1 });
couponSchema.index({ isActive: 1 });

// Kupon kullanılabilir mi kontrolü
couponSchema.methods.isValid = function() {
  return (
    this.isActive &&
    this.usedCount < this.usageLimit &&
    new Date() < this.expiresAt
  );
};

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

export default Coupon; 