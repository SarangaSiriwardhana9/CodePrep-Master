export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  lastLogin?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}
