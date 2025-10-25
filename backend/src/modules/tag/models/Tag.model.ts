import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITag extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  category?: 'algorithm' | 'data-structure' | 'pattern' | 'technique';
  difficulty?: 'easy' | 'medium' | 'hard';
  problemCount: number;
  usersMastered: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserTag extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tagId: mongoose.Types.ObjectId;
  masteryLevel: number;
  problemsSolved: number;
  problemsTotal: number;
  averageAccuracy: number;
  averageTime: number;
  lastPracticedAt: Date;
  proficiencyLevel: 'Novice' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProblemTag extends Document {
  _id: Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  tagIds: mongoose.Types.ObjectId[];
  difficulty: string;
  frequency: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILearningPath extends Document {
  _id: Types.ObjectId;
  pathName: string;
  description: string;
  tagIds: mongoose.Types.ObjectId[];
  recommendedOrder: string[];
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completedBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 500,
      default: null,
    },
    category: {
      type: String,
      enum: ['algorithm', 'data-structure', 'pattern', 'technique'],
      default: 'algorithm',
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    problemCount: {
      type: Number,
      default: 0,
      index: true,
    },
    usersMastered: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const userTagSchema = new Schema<IUserTag>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tagId: {
      type: Schema.Types.ObjectId,
      ref: 'Tag',
      required: true,
      index: true,
    },
    masteryLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },
    problemsSolved: {
      type: Number,
      default: 0,
    },
    problemsTotal: {
      type: Number,
      default: 0,
    },
    averageAccuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    averageTime: {
      type: Number,
      default: 0,
    },
    lastPracticedAt: {
      type: Date,
      default: Date.now,
    },
    proficiencyLevel: {
      type: String,
      enum: ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Novice',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for user + tag
userTagSchema.index({ userId: 1, tagId: 1 }, { unique: true });
// Index for sorting by mastery
userTagSchema.index({ userId: 1, masteryLevel: -1 });

const problemTagSchema = new Schema<IProblemTag>(
  {
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      unique: true,
      index: true,
    },
    tagIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
        required: true,
      },
    ],
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    frequency: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding problems by tags
problemTagSchema.index({ tagIds: 1 });

const learningPathSchema = new Schema<ILearningPath>(
  {
    pathName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    tagIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
        required: true,
      },
    ],
    recommendedOrder: [
      {
        type: String,
        required: true,
      },
    ],
    estimatedHours: {
      type: Number,
      required: true,
      min: 1,
      max: 500,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      index: true,
    },
    completedBy: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Tag = mongoose.model<ITag>('Tag', tagSchema);
export const UserTag = mongoose.model<IUserTag>('UserTag', userTagSchema);
export const ProblemTag = mongoose.model<IProblemTag>('ProblemTag', problemTagSchema);
export const LearningPath = mongoose.model<ILearningPath>('LearningPath', learningPathSchema);