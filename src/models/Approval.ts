import mongoose from 'mongoose';

export interface IApproval {
  userId: mongoose.Types.ObjectId;
  iidNumber: string;
  confirmationNumber: string;
  status: 'success' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const approvalSchema = new mongoose.Schema<IApproval>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Kullanıcı ID gereklidir'],
    index: true,
  },
  iidNumber: {
    type: String,
    required: [true, 'IID numarası gereklidir'],
    trim: true,
    index: true,
  },
  confirmationNumber: {
    type: String,
    required: [true, 'Onay numarası gereklidir'],
    trim: true,
  },
  status: {
    type: String,
    enum: {
      values: ['success', 'failed'],
      message: 'Geçersiz durum değeri',
    },
    default: 'success',
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// İndexler
approvalSchema.index({ createdAt: -1 });
approvalSchema.index({ userId: 1, iidNumber: 1 }, { unique: true });

const Approval = mongoose.models.Approval || mongoose.model<IApproval>('Approval', approvalSchema);

export default Approval; 