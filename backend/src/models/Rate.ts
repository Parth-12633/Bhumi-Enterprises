import mongoose, { Schema, Document } from 'mongoose';

export interface IRate extends Document {
  siteId: mongoose.Types.ObjectId;
  workName: string;
  rate: number;
  effectiveFrom: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
}

const RateSchema = new Schema({
  siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
  workName: { type: String, required: true },
  rate: { type: Number, required: true },
  effectiveFrom: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

export default mongoose.model<IRate>('Rate', RateSchema);
