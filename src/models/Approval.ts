import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  iidNumber: {
    type: String,
    required: true,
    trim: true,
  },
  confirmationNumber: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success',
  },
}, {
  timestamps: true,
});

// İndexler
approvalSchema.index({ createdAt: -1 });

const Approval = mongoose.models.Approval || mongoose.model('Approval', approvalSchema);

export default Approval; 