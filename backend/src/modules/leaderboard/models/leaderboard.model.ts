import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILeaderboardSnapshot extends Document {
  _id: Types.ObjectId;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  leaderboard: Array<{
    userId: mongoose.Types.ObjectId;
    rank: number;
    score: number;
    problemsSolved: number;
    submissions: number;
  }>;
  totalUsers: number;
  generatedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserRankHistory extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  globalRank: number;
  levelPoints: number;
  problemsSolved: number;
  acceptanceRate: number;
  levelChange?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IConceptLeaderboard extends Document {
  _id: Types.ObjectId;
  concept: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'allTime';
  startDate?: Date;
  endDate?: Date;
  leaderboard: Array<{
    userId: mongoose.Types.ObjectId;
    rank: number;
    masteryScore: number;
    problemsSolved: number;
  }>;
  totalParticipants: number;
  updatedAt?: Date;
}

export interface IFriendRanking extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  friendId: mongoose.Types.ObjectId;
  friendRank: number;
  userRank: number;
  rankDifference: number;
  updatedAt?: Date;
}

const leaderboardSnapshotSchema = new Schema<ILeaderboardSnapshot>(
  {
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    leaderboard: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        rank: Number,
        score: Number,
        problemsSolved: Number,
        submissions: Number,
      },
    ],
    totalUsers: {
      type: Number,
      default: 0,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

leaderboardSnapshotSchema.index({ period: 1, startDate: -1 });
leaderboardSnapshotSchema.index({ 'leaderboard.userId': 1 });

const userRankHistorySchema = new Schema<IUserRankHistory>(
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
    globalRank: {
      type: Number,
      required: true,
      index: true,
    },
    levelPoints: {
      type: Number,
      required: true,
    },
    problemsSolved: {
      type: Number,
      required: true,
    },
    acceptanceRate: {
      type: Number,
      required: true,
    },
    levelChange: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userRankHistorySchema.index({ userId: 1, date: -1 });

const conceptLeaderboardSchema = new Schema<IConceptLeaderboard>(
  {
    concept: {
      type: String,
      required: true,
      index: true,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'allTime'],
      default: 'allTime',
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    leaderboard: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        rank: Number,
        masteryScore: Number,
        problemsSolved: Number,
      },
    ],
    totalParticipants: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

conceptLeaderboardSchema.index({ concept: 1, period: 1 });
conceptLeaderboardSchema.index({ 'leaderboard.userId': 1 });

const friendRankingSchema = new Schema<IFriendRanking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    friendId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    friendRank: {
      type: Number,
      required: true,
    },
    userRank: {
      type: Number,
      required: true,
    },
    rankDifference: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

friendRankingSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export const LeaderboardSnapshot = mongoose.model<ILeaderboardSnapshot>(
  'LeaderboardSnapshot',
  leaderboardSnapshotSchema
);
export const UserRankHistory = mongoose.model<IUserRankHistory>(
  'UserRankHistory',
  userRankHistorySchema
);
export const ConceptLeaderboard = mongoose.model<IConceptLeaderboard>(
  'ConceptLeaderboard',
  conceptLeaderboardSchema
);
export const FriendRanking = mongoose.model<IFriendRanking>('FriendRanking', friendRankingSchema);