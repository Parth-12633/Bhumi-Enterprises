import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  employeeId: mongoose.Types.ObjectId;
  amount: number; // in paise
  type: 'ADVANCE' | 'PAYMENT' | 'OTHER';
  paymentMethod: 'CASH' | 'UPI' | 'BANK' | 'OTHER';
  date: string; // YYYY-MM-DD
  note?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'VOIDED';
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['ADVANCE', 'PAYMENT', 'OTHER'], required: true },
    paymentMethod: { type: String, enum: ['CASH', 'UPI', 'BANK', 'OTHER'], required: true },
    date: { type: String, required: true },
    note: { type: String },
    status: { type: String, enum: ['ACTIVE', 'VOIDED'], default: 'ACTIVE' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: 'version'
  }
);

paymentSchema.index({ employeeId: 1, date: 1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);
