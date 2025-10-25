import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserStats extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  totalProblemsSolved: number;
  totalProblemsAttempted: number;
  acceptanceRate: number;
  totalTimeSpent: number;
  lastActiveAt: Date;
  bestContestRank: number;
  totalContestScore: number;
  currentStreak: number;
  longestStreak: number;
  achievementsUnlocked: number;
  levelPoints: number;
  currentLevel: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserProfile extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  profilePicture?: string;
  bio?: string;
  location?: string;
  company?: string;
  languages: string[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAchievement extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'contest' | 'problem' | 'concept' | 'milestone';
  progress: number;
  progressMax: number;
  unlockedAt?: Date;
  isUnlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IConceptMastery extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  concept: string;
  masteryScore: number;
  problemsSolved: number;
  problemsTotal: number;
  timeSpent: number;
  averageAccuracy: number;
  lastPracticedAt: Date;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDailyActivity extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  problemsSolved: number;
  attemptsMade: number;
  timeSpent: number;
  streak: boolean;
  submissions: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const userStatsSchema = new Schema<IUserStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalProblemsSolved: {
      type: Number,
      default: 0,
      index: true,
    },
    totalProblemsAttempted: {
      type: Number,
      default: 0,
    },
    acceptanceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    bestContestRank: {
      type: Number,
      default: 0,
    },
    totalContestScore: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    achievementsUnlocked: {
      type: Number,
      default: 0,
    },
    levelPoints: {
      type: Number,
      default: 0,
      index: true,
    },
    currentLevel: {
      type: String,
      default: 'Beginner',
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Legend'],
    },
  },
  {
    timestamps: true,
  }
);

const userProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: null,
    },
    location: {
      type: String,
      maxlength: 100,
      default: null,
    },
    company: {
      type: String,
      maxlength: 100,
      default: null,
    },
    languages: [
      {
        type: String,
        enum: ['javascript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust', 'kotlin'],
      },
    ],
    skillLevel: {
      type: String,
      default: 'Beginner',
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
  },
  {
    timestamps: true,
  }
);

const achievementSchema = new Schema<IAchievement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    achievementId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '🏆',
    },
    category: {
      type: String,
      enum: ['streak', 'contest', 'problem', 'concept', 'milestone'],
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    progressMax: {
      type: Number,
      required: true,
    },
    unlockedAt: {
      type: Date,
      default: null,
    },
    isUnlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for achievements
achievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
achievementSchema.index({ userId: 1, isUnlocked: 1 });

const conceptMasterySchema = new Schema<IConceptMastery>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    concept: {
      type: String,
      required: true,
    },
    masteryScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    problemsSolved: {
      type: Number,
      default: 0,
    },
    problemsTotal: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    averageAccuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastPracticedAt: {
      type: Date,
      default: Date.now,
    },
    level: {
      type: String,
      default: 'Beginner',
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for user + concept
conceptMasterySchema.index({ userId: 1, concept: 1 }, { unique: true });
conceptMasterySchema.index({ userId: 1, masteryScore: -1 });

const dailyActivitySchema = new Schema<IDailyActivity>(
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
    attemptsMade: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Boolean,
      default: false,
    },
    submissions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for user + date
dailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });
dailyActivitySchema.index({ userId: 1, date: -1 });

export const UserStats = mongoose.model<IUserStats>('UserStats', userStatsSchema);
export const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema);
export const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);
export const ConceptMastery = mongoose.model<IConceptMastery>('ConceptMastery', conceptMasterySchema);
export const DailyActivity = mongoose.model<IDailyActivity>('DailyActivity', dailyActivitySchema);