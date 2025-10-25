import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBookmark extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  folderId?: mongoose.Types.ObjectId;
  notes?: string;
  tags?: string[];
  savedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBookmarkFolder extends Document {
  _id: Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  folderName: string;
  description?: string;
  color?: string;
  isPublic: boolean;
  problemCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISharedFolder extends Document {
  _id: Types.ObjectId;
  folderId: mongoose.Types.ObjectId;
  sharedBy: mongoose.Types.ObjectId;
  sharedWith: mongoose.Types.ObjectId;
  sharedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
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
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'BookmarkFolder',
      default: null,
      index: true,
    },
    notes: {
      type: String,
      maxlength: 1000,
      default: null,
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    savedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for user + problem
bookmarkSchema.index({ userId: 1, problemId: 1 }, { unique: true });
// Index for finding bookmarks by user and folder
bookmarkSchema.index({ userId: 1, folderId: 1 });
// Index for tags search
bookmarkSchema.index({ tags: 1 });

const bookmarkFolderSchema = new Schema<IBookmarkFolder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    folderName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
      default: null,
    },
    color: {
      type: String,
      default: '#3B82F6',
      match: /^#[0-9A-F]{6}$/i,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    problemCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user + folder name uniqueness
bookmarkFolderSchema.index({ userId: 1, folderName: 1 }, { unique: true });
// Index for public folders
bookmarkFolderSchema.index({ isPublic: 1, createdAt: -1 });

const sharedFolderSchema = new Schema<ISharedFolder>(
  {
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'BookmarkFolder',
      required: true,
      index: true,
    },
    sharedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sharedWith: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for folder + user sharing
sharedFolderSchema.index({ folderId: 1, sharedWith: 1 }, { unique: true });
// Index for finding what's shared with a user
sharedFolderSchema.index({ sharedWith: 1, sharedAt: -1 });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
export const BookmarkFolder = mongoose.model<IBookmarkFolder>('BookmarkFolder', bookmarkFolderSchema);
export const SharedFolder = mongoose.model<ISharedFolder>('SharedFolder', sharedFolderSchema);