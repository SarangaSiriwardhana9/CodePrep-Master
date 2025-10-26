import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserAnalytics extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  problemsSolved: number;
  submissionsCount: number;
  acceptanceRate: number;
  timeSpent: number;
  levelPoints: number;
  conceptsMastered: string[];
  createdAt?: Date;
}

export interface IPlatformAnalytics extends Document {
  _id: Types.ObjectId;
  date: Date;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalProblems: number;
  totalSubmissions: number;
  averageAcceptanceRate: number;
  totalContests: number;
  contestParticipants: number;
  createdAt?: Date;
}

export interface IProblemAnalytics extends Document {
  _id: Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  date: Date;
  totalAttempts: number;
  totalAccepted: number;
  acceptanceRate: number;
  averageTimeSpent: number;
  uniqueUsers: number;
  languageStats: {
    language: string;
    count: number;
  }[];
  createdAt?: Date;
}

export interface IConceptAnalytics extends Document {
  _id: Types.ObjectId;
  concept: string;
  date: Date;
  totalUsers: number;
  usersMastered: number;
  averageMasteryScore: number;
  problemsSolved: number;
  createdAt?: Date;
}

export interface IAnalyticsReport extends Document {
  _id: Types.ObjectId;
  title: string;
  reportType: 'user' | 'platform' | 'problem' | 'concept' | 'contest';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  data: any;
  format: 'json' | 'csv' | 'pdf';
  generatedBy: mongoose.Types.ObjectId;
  createdAt?: Date;
}

const userAnalyticsSchema = new Schema<IUserAnalytics>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    problemsSolved: {
      type: Number,
      default: 0,
    },
    submissionsCount: {
      type: Number,
      default: 0,
    },
    acceptanceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    levelPoints: {
      type: Number,
      default: 0,
    },
    conceptsMastered: [String],
  },
  {
    timestamps: true,
  }
);

userAnalyticsSchema.index({ userId: 1, date: -1 });

const platformAnalyticsSchema = new Schema<IPlatformAnalytics>(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    totalUsers: {
      type: Number,
      default: 0,
    },
    activeUsers: {
      type: Number,
      default: 0,
    },
    newUsers: {
      type: Number,
      default: 0,
    },
    totalProblems: {
      type: Number,
      default: 0,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    averageAcceptanceRate: {
      type: Number,
      default: 0,
    },
    totalContests: {
      type: Number,
      default: 0,
    },
    contestParticipants: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const problemAnalyticsSchema = new Schema<IProblemAnalytics>(
  {
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    totalAccepted: {
      type: Number,
      default: 0,
    },
    acceptanceRate: {
      type: Number,
      default: 0,
    },
    averageTimeSpent: {
      type: Number,
      default: 0,
    },
    uniqueUsers: {
      type: Number,
      default: 0,
    },
    languageStats: [
      {
        language: String,
        count: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

problemAnalyticsSchema.index({ problemId: 1, date: -1 });

const conceptAnalyticsSchema = new Schema<IConceptAnalytics>(
  {
    concept: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    totalUsers: {
      type: Number,
      default: 0,
    },
    usersMastered: {
      type: Number,
      default: 0,
    },
    averageMasteryScore: {
      type: Number,
      default: 0,
    },
    problemsSolved: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

conceptAnalyticsSchema.index({ concept: 1, date: -1 });

const analyticsReportSchema = new Schema<IAnalyticsReport>(
  {
    title: {
      type: String,
      required: true,
    },
    reportType: {
      type: String,
      enum: ['user', 'platform', 'problem', 'concept', 'contest'],
      required: true,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    format: {
      type: String,
      enum: ['json', 'csv', 'pdf'],
      default: 'json',
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

analyticsReportSchema.index({ reportType: 1, createdAt: -1 });
analyticsReportSchema.index({ generatedBy: 1, createdAt: -1 });

export const UserAnalytics = mongoose.model<IUserAnalytics>('UserAnalytics', userAnalyticsSchema);
export const PlatformAnalytics = mongoose.model<IPlatformAnalytics>(
  'PlatformAnalytics',
  platformAnalyticsSchema
);
export const ProblemAnalytics = mongoose.model<IProblemAnalytics>(
  'ProblemAnalytics',
  problemAnalyticsSchema
);
export const ConceptAnalytics = mongoose.model<IConceptAnalytics>(
  'ConceptAnalytics',
  conceptAnalyticsSchema
);
export const AnalyticsReport = mongoose.model<IAnalyticsReport>(
  'AnalyticsReport',
  analyticsReportSchema
);