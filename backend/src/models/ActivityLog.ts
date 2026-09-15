import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: 'CREATE' | 'UPDATE' | 'VOID' | 'PAYMENT_CREATE' | 'PAYMENT_UPDATE';
  entityType: 'Employee' | 'Site' | 'WorkRecord' | 'Payment';
  entityId: mongoose.Types.ObjectId;
  employeeId?: mongoose.Types.ObjectId;
  siteId?: mongoose.Types.ObjectId;
  before?: any;
  after?: any;
  reason?: string;
  timestamp: Date;
}

const activityLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site' },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    reason: { type: String },
    timestamp: { type: Date, default: Date.now }
  }
);

activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ employeeId: 1, timestamp: -1 });

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
