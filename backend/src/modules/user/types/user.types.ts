export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  lastLogin?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}
