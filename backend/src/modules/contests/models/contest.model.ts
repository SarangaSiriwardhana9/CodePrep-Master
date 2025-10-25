import mongoose, { Schema, Document } from 'mongoose';

export interface IContest extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'ongoing' | 'ended';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  totalProblems: number;
  problemIds: mongoose.Types.ObjectId[];
  maxParticipants?: number;
  currentParticipants: number;
  rules?: string;
  rewards?: string;
  createdAt?: Date;
  updatedAt?: Date;
  getStatus(): 'upcoming' | 'ongoing' | 'ended';
}

export interface IContestParticipation extends Document {
  contestId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  joinedAt: Date;
  score: number;
  rank: number;
  solutionsSubmitted: number;
  timeSpent: number;
  totalScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IContestSubmission extends Document {
  contestId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  code: string;
  language: 'javascript' | 'python' | 'java' | 'cpp';
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'pending';
  score: number;
  testCasesPassed: number;
  totalTestCases: number;
  executionTime: number;
  memoryUsed: number;
  submittedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const contestSchema = new Schema<IContest>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'ended'],
      default: 'upcoming',
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      required: true,
    },
    totalProblems: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    problemIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
      },
    ],
    maxParticipants: {
      type: Number,
      default: null,
      min: 1,
    },
    currentParticipants: {
      type: Number,
      default: 0,
      index: true,
    },
    rules: {
      type: String,
      default: null,
      maxlength: 5000,
    },
    rewards: {
      type: String,
      default: null,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

// Instance method to get current status
contestSchema.methods.getStatus = function (): 'upcoming' | 'ongoing' | 'ended' {
  const now = new Date();
  if (now < this.startTime) {
    return 'upcoming';
  } else if (now >= this.startTime && now < this.endTime) {
    return 'ongoing';
  } else {
    return 'ended';
  }
};

// Compound index for status and date range queries
contestSchema.index({ status: 1, startTime: -1 });
contestSchema.index({ createdBy: 1, createdAt: -1 });
contestSchema.index({ difficulty: 1, startTime: -1 });

const contestParticipationSchema = new Schema<IContestParticipation>(
  {
    contestId: {
      type: Schema.Types.ObjectId,
      ref: 'Contest',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    solutionsSubmitted: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for contest and user
contestParticipationSchema.index(
  { contestId: 1, userId: 1 },
  { unique: true }
);

// Leaderboard query index
contestParticipationSchema.index(
  { contestId: 1, score: -1, rank: 1 }
);

const contestSubmissionSchema = new Schema<IContestSubmission>(
  {
    contestId: {
      type: Schema.Types.ObjectId,
      ref: 'Contest',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp'],
      required: true,
    },
    status: {
      type: String,
      enum: ['accepted', 'wrong_answer', 'runtime_error', 'time_limit_exceeded', 'memory_limit_exceeded', 'pending'],
      default: 'pending',
      index: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    executionTime: {
      type: Number,
      default: 0,
    },
    memoryUsed: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for contest submissions
contestSubmissionSchema.index({
  contestId: 1,
  userId: 1,
  submittedAt: -1,
});

// Index for finding unique submissions per problem during contest
contestSubmissionSchema.index({
  contestId: 1,
  userId: 1,
  problemId: 1,
});

export const Contest = mongoose.model<IContest>('Contest', contestSchema);
export const ContestParticipation = mongoose.model<IContestParticipation>(
  'ContestParticipation',
  contestParticipationSchema
);
export const ContestSubmission = mongoose.model<IContestSubmission>(
  'ContestSubmission',
  contestSubmissionSchema
);