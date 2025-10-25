import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubmission extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  code: string;
  language: 'javascript' | 'python' | 'java' | 'cpp';
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'pending';
  testCasesPassed: number;
  totalTestCases: number;
  executionTime: number;
  memoryUsed: number;
  feedback?: string;
  submittedAt: Date;
  updatedAt?: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
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
    feedback: {
      type: String,
      default: null,
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

// Compound index for user and problem
submissionSchema.index({ userId: 1, problemId: 1 });

// Index for status queries
submissionSchema.index({ status: 1, submittedAt: -1 });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);