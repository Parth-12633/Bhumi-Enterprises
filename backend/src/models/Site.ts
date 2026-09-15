import mongoose, { Schema, Document } from 'mongoose';

export interface ISite extends Document {
  name: string;
  location?: string;
  clientName?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  notes?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const siteSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    clientName: { type: String },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'ON_HOLD'], default: 'ACTIVE' },
    notes: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISite>('Site', siteSchema);
