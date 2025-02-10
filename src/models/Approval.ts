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
  },
  iidNumber: {
    type: String,
    required: [true, 'IID numarası gereklidir'],
    trim: true,
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
  },
}, {
  timestamps: true,
  collection: 'approvals',
  strict: true,
  strictQuery: true,
});

// Tekil indeks yerine bileşik indeks kullanıyoruz
approvalSchema.index({ userId: 1, iidNumber: 1 });
approvalSchema.index({ createdAt: -1 });
approvalSchema.index({ status: 1 });

// Model oluşturulmadan önce koleksiyonu temizle
delete mongoose.models.Approval;

const Approval = mongoose.model<IApproval>('Approval', approvalSchema);

export default Approval; 