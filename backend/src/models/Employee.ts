import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  mobile?: string;
  address?: string;
  dailyRate: number;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String },
    address: { type: String },
    dailyRate: { type: Number, required: true }, // Store as integer paise e.g. 80000 for 800
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEmployee>('Employee', employeeSchema);
