import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDiscussion extends Document {
  _id: Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags?: string[];
  isPinned: boolean;
  views: number;
  likes: number;
  commentCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IComment extends Document {
  _id: Types.ObjectId;
  discussionId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  parentCommentId?: mongoose.Types.ObjectId;
  likes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILike extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  likeType: 'discussion' | 'comment';
  targetId: mongoose.Types.ObjectId;
  createdAt?: Date;
}

export interface IDiscussionReport extends Document {
  _id: Types.ObjectId;
  discussionId: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  reason: string;
  description?: string;
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const discussionSchema = new Schema<IDiscussion>(
  {
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 5000,
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
      index: true,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

discussionSchema.index({ problemId: 1, createdAt: -1 });
discussionSchema.index({ authorId: 1, createdAt: -1 });
discussionSchema.index({ tags: 1 });
discussionSchema.index({ isPinned: 1, createdAt: -1 });

const commentSchema = new Schema<IComment>(
  {
    discussionId: {
      type: Schema.Types.ObjectId,
      ref: 'Discussion',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 2000,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ discussionId: 1, createdAt: -1 });
commentSchema.index({ authorId: 1, createdAt: -1 });
commentSchema.index({ discussionId: 1, parentCommentId: 1 });

const likeSchema = new Schema<ILike>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    likeType: {
      type: String,
      enum: ['discussion', 'comment'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for user + target
likeSchema.index({ userId: 1, targetId: 1, likeType: 1 }, { unique: true });

const discussionReportSchema = new Schema<IDiscussionReport>(
  {
    discussionId: {
      type: Schema.Types.ObjectId,
      ref: 'Discussion',
      required: true,
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: [
        'spam',
        'offensive',
        'irrelevant',
        'duplicate',
        'misinformation',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000,
      default: null,
    },
    isResolved: {
      type: Boolean,
      default: false,
      index: true,
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

discussionReportSchema.index({ isResolved: 1, createdAt: -1 });

export const Discussion = mongoose.model<IDiscussion>('Discussion', discussionSchema);
export const Comment = mongoose.model<IComment>('Comment', commentSchema);
export const Like = mongoose.model<ILike>('Like', likeSchema);
export const DiscussionReport = mongoose.model<IDiscussionReport>(
  'DiscussionReport',
  discussionReportSchema
);