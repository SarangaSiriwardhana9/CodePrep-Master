export interface DiscussionInput {
  problemId: string;
  title: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface DiscussionResponse {
  _id: string;
  problemId: string;
  authorId: string;
  authorName: string;
  authorProfilePicture?: string;
  title: string;
  content: string;
  tags?: string[];
  isPinned: boolean;
  views: number;
  likes: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentInput {
  content: string;
  parentCommentId?: string;
}

export interface CommentResponse {
  _id: string;
  discussionId: string;
  authorId: string;
  authorName: string;
  authorProfilePicture?: string;
  content: string;
  likes: number;
  replies: CommentResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscussionThreadResponse {
  discussion: DiscussionResponse;
  comments: CommentResponse[];
  totalComments: number;
}

export interface UpdateDiscussionInput {
  title?: string;
  content?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface UpdateCommentInput {
  content: string;
}

export interface DiscussionStatsResponse {
  totalDiscussions: number;
  totalComments: number;
  recentDiscussions: DiscussionResponse[];
  trending: DiscussionResponse[];
  mostLiked: DiscussionResponse[];
}

export interface UserDiscussionStatsResponse {
  userId: string;
  userName: string;
  discussionsCreated: number;
  commentsPosted: number;
  likesSent: number;
  reputationScore: number;
}

export interface LikeInput {
  likeType: 'discussion' | 'comment';
  targetId: string;
}

export interface SearchDiscussionsResponse {
  discussions: DiscussionResponse[];
  total: number;
  matchedCount: number;
}