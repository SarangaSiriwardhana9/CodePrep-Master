# User Module

This module handles all user profile-related functionality for the frontend application.

## Structure

```
user/
├── components/     # User UI components (Profile, Settings, etc.)
├── hooks/          # React hooks for user operations
├── services/       # API service functions
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── constants/      # User-specific constants
```

## Usage

### 1. Using the useUser Hook

```typescript
import { useUser } from '@/features/user/hooks';

function ProfileComponent() {
  const { profile, getUserProfile, updateProfile, isLoading, error } = useUser();

  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  const handleUpdate = async (data: UpdateUserInput) => {
    const updated = await updateProfile(data);
    
    if (updated) {
      toast.success('Profile updated successfully');
    }
  };

  return (
    // Your JSX
  );
}
```

### 2. Available User Operations

#### Get User Profile
```typescript
const { getUserProfile } = useUser();

const profile = await getUserProfile();
```

#### Update Profile
```typescript
const { updateProfile } = useUser();

const updatedProfile = await updateProfile({
  name: 'John Updated',
  email: 'john.updated@example.com'
});
```

#### Delete Account
```typescript
const { deleteAccount } = useUser();

const success = await deleteAccount();

if (success) {
  // Redirect to home page
  router.push('/');
}
```

### 3. Using User Service Directly

```typescript
import { userService } from '@/features/user/services';

// Get profile
const response = await userService.getUserProfile();

// Update profile
const updated = await userService.updateUserProfile({
  name: 'New Name'
});

// Delete account
await userService.deleteUserAccount();
```

## API Endpoints

All endpoints are defined in `@/shared/constants/api.constants.ts`:

- `GET /user/profile` - Get user profile
- `PATCH /user/profile` - Update user profile
- `DELETE /user/account` - Delete user account

## Types

### UserProfile
```typescript
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  lastLogin?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
```

### UpdateUserInput
```typescript
interface UpdateUserInput {
  name?: string;
  email?: string;
}
```

## Error Handling

All hooks return an `error` state:

```typescript
const { updateProfile, error, clearError } = useUser();

await updateProfile({ name: 'New Name' });

if (error) {
  toast.error(error);
  clearError();
}
```

## Notes

- All operations require authentication (token in localStorage)
- Profile updates are validated on the backend
- Account deletion clears all tokens and logs out the user
- Email uniqueness is checked during profile updates
