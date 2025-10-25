export interface BookmarkInput {
  problemId: string;
  folderId?: string;
  notes?: string;
  tags?: string[];
}

export interface BookmarkResponse {
  _id: string;
  userId: string;
  problemId: string;
  problemTitle: string;
  problemDifficulty: string;
  folderId?: string;
  notes?: string;
  tags?: string[];
  savedAt: Date;
  updatedAt: Date;
}

export interface BookmarkFolderInput {
  folderName: string;
  description?: string;
  color?: string;
  isPublic?: boolean;
}

export interface BookmarkFolderResponse {
  _id: string;
  userId: string;
  folderName: string;
  description?: string;
  color?: string;
  isPublic: boolean;
  problemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookmarkCollectionResponse {
  _id: string;
  folderName: string;
  description?: string;
  color?: string;
  problemCount: number;
  problems: BookmarkResponse[];
}

export interface BookmarkStatsResponse {
  totalBookmarks: number;
  totalFolders: number;
  recentBookmarks: BookmarkResponse[];
  popularTags: string[];
  bookmarksByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface UpdateBookmarkInput {
  notes?: string;
  tags?: string[];
  folderId?: string;
}

export interface UpdateFolderInput {
  folderName?: string;
  description?: string;
  color?: string;
  isPublic?: boolean;
}

export interface BookmarkSearchResponse {
  bookmarks: BookmarkResponse[];
  total: number;
  matchedCount: number;
}

export interface SharedFolderResponse {
  _id: string;
  folderName: string;
  description?: string;
  sharedBy: string;
  sharedByName: string;
  color?: string;
  problemCount: number;
  sharedAt: Date;
}