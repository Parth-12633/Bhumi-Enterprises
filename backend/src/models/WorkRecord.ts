import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkRecord extends Document {
  employeeId: mongoose.Types.ObjectId;
  siteId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  hajri: number; // 0, 0.5, 1, 1.5, 2, 2.5, 3
  rate: number; // Snapshot of rate in paise
  amount: number; // Calculated: hajri * rate
  workDescription?: string;
  notes?: string;
  status: 'ACTIVE' | 'VOIDED';
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const workRecordSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
    date: { type: String, required: true },
    hajri: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
    workDescription: { type: String },
    notes: { type: String },
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

// Indexes
workRecordSchema.index({ employeeId: 1, date: 1 });
workRecordSchema.index({ siteId: 1, date: 1 });
workRecordSchema.index({ date: 1 });
workRecordSchema.index({ employeeId: 1, siteId: 1, date: 1 });

export default mongoose.model<IWorkRecord>('WorkRecord', workRecordSchema);
