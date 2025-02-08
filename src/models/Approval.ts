import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  iidNumber: {
    type: String,
    required: true,
  },
  confirmationNumber: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
  creditUsed: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true,
  },
}, {
  timestamps: true,
});

// İndexler
approvalSchema.index({ userId: 1, createdAt: -1 });
approvalSchema.index({ iidNumber: 1 });

const Approval = mongoose.models.Approval || mongoose.model('Approval', approvalSchema);

export default Approval; 