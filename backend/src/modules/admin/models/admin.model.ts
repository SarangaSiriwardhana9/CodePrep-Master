import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAdminActionLog extends Document {
  _id: Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  action: string;
  targetType: string;
  targetId: mongoose.Types.ObjectId;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
  createdAt?: Date;
}

export interface ISystemConfig extends Document {
  _id: Types.ObjectId;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  rateLimitEnabled: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number;
  maxFileSize: number;
  allowedLanguages: string[];
  allowedImageFormats: string[];
  lastUpdatedBy: mongoose.Types.ObjectId;
  updatedAt?: Date;
}

export interface IModerationQueue extends Document {
  _id: Types.ObjectId;
  reportType: 'discussion' | 'comment' | 'problem' | 'user';
  reason: string;
  reportedContent?: string;
  reportedBy: mongoose.Types.ObjectId;
  reportedItem: mongoose.Types.ObjectId;
  status: 'pending' | 'reviewing' | 'resolved';
  assignedTo?: mongoose.Types.ObjectId;
  resolution?: string;
  action?: 'approve' | 'reject' | 'delete' | 'warn';
  createdAt?: Date;
  resolvedAt?: Date;
}

const adminActionLogSchema = new Schema<IAdminActionLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'user_banned',
        'user_suspended',
        'user_activated',
        'problem_published',
        'problem_archived',
        'discussion_deleted',
        'comment_deleted',
        'system_config_updated',
        'bulk_action',
      ],
    },
    targetType: {
      type: String,
      required: true,
      enum: ['user', 'problem', 'discussion', 'comment', 'system'],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    oldValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    reason: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

adminActionLogSchema.index({ adminId: 1, createdAt: -1 });
adminActionLogSchema.index({ targetType: 1, action: 1 });

const systemConfigSchema = new Schema<ISystemConfig>(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: 'System is under maintenance. Please try again later.',
    },
    rateLimitEnabled: {
      type: Boolean,
      default: true,
    },
    rateLimitRequests: {
      type: Number,
      default: 100,
    },
    rateLimitWindow: {
      type: Number,
      default: 3600, // 1 hour in seconds
    },
    maxFileSize: {
      type: Number,
      default: 50 * 1024 * 1024, // 50MB
    },
    allowedLanguages: [
      {
        type: String,
        enum: ['javascript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust', 'kotlin'],
      },
    ],
    allowedImageFormats: [
      {
        type: String,
        enum: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      },
    ],
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const moderationQueueSchema = new Schema<IModerationQueue>(
  {
    reportType: {
      type: String,
      enum: ['discussion', 'comment', 'problem', 'user'],
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['spam', 'offensive', 'irrelevant', 'duplicate', 'misinformation', 'other'],
    },
    reportedContent: {
      type: String,
      default: null,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedItem: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved'],
      default: 'pending',
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    resolution: {
      type: String,
      default: null,
    },
    action: {
      type: String,
      enum: ['approve', 'reject', 'delete', 'warn'],
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

moderationQueueSchema.index({ status: 1, createdAt: -1 });
moderationQueueSchema.index({ assignedTo: 1, status: 1 });

export const AdminActionLog = mongoose.model<IAdminActionLog>(
  'AdminActionLog',
  adminActionLogSchema
);
export const SystemConfig = mongoose.model<ISystemConfig>('SystemConfig', systemConfigSchema);
export const ModerationQueue = mongoose.model<IModerationQueue>(
  'ModerationQueue',
  moderationQueueSchema
);