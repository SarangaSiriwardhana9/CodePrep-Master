import mongoose, { Schema, Document } from 'mongoose';
import { IProblem } from '../types/problem.types';

interface ProblemDocument extends Document, IProblem {
  _id: mongoose.Types.ObjectId;
}

const problemSchema = new Schema<ProblemDocument>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a problem title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title must not exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Please provide a slug'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: 'Difficulty must be Easy, Medium, or Hard',
      },
      required: [true, 'Please specify difficulty level'],
    },
    concepts: [
      {
        type: String,
        lowercase: true,
      },
    ],
    description: {
      type: String,
      required: [true, 'Please provide problem description'],
    },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    constraints: [String],
    starterCode: {
      javascript: {
        type: String,
        default: 'function solution() {\n  // Your code here\n}',
      },
      python: {
        type: String,
        default: 'def solution():\n    # Your code here\n    pass',
      },
      java: {
        type: String,
        default: 'class Solution {\n    public void solution() {\n        // Your code here\n    }\n}',
      },
      cpp: {
        type: String,
        default: '#include <iostream>\nusing namespace std;\n\nvoid solution() {\n    // Your code here\n}',
      },
    },
    testCases: [
      {
        input: Schema.Types.Mixed,
        expectedOutput: Schema.Types.Mixed,
        isHidden: {
          type: Boolean,
          default: false,
        },
      },
    ],
    hints: [String],
    solution: {
      approach: String,
      explanation: String,
      timeComplexity: String,
      spaceComplexity: String,
      code: String,
    },
    relatedProblems: [String],
    companyTags: [String],
    acceptanceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    totalSolves: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

 
problemSchema.index({ slug: 1 });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ concepts: 1 });
problemSchema.index({ title: 'text', description: 'text' });

export const Problem = mongoose.model<ProblemDocument>('Problem', problemSchema);
