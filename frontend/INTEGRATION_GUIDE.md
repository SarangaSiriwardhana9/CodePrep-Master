# Frontend Integration Guide

This guide explains how to integrate the backend API with the frontend application.

## Prerequisites

1. Install axios (if not already installed):
```bash
npm install axios
```

2. Set up environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Project Structure

```
frontend/
├── features/              # Feature-based modules
│   ├── auth/             # Authentication module
│   │   ├── hooks/        # useAuth hook
│   │   ├── services/     # Auth API calls
│   │   ├── types/        # Auth TypeScript types
│   │   └── utils/        # Validation utilities
│   │
│   └── user/             # User profile module
│       ├── hooks/        # useUser hook
│       ├── services/     # User API calls
│       └── types/        # User TypeScript types
│
├── shared/               # Shared resources
│   ├── constants/        # API endpoints, validation patterns
│   └── ...
│
└── core/                 # Core application logic
    └── api/              # Axios configuration
```

## Quick Start

### 1. Authentication Flow

```typescript
'use client';

import { useAuth } from '@/features/auth/hooks';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const response = await login({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });

    if (response?.success) {
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

### 2. User Profile Management

```typescript
'use client';

import { useUser } from '@/features/user/hooks';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { profile, getUserProfile, updateProfile, isLoading } = useUser();

  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  const handleUpdate = async (data: { name: string; email: string }) => {
    const updated = await updateProfile(data);
    if (updated) {
      alert('Profile updated successfully!');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div>
      <h1>{profile.name}</h1>
      <p>{profile.email}</p>
      {/* Update form here */}
    </div>
  );
}
```

### 3. Protected Routes

Create a middleware or HOC to protect routes:

```typescript
// middleware.ts or useProtectedRoute.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/features/auth/services';

export function useProtectedRoute() {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);
}
```

Usage:
```typescript
export default function DashboardPage() {
  useProtectedRoute();
  
  return <div>Protected Dashboard Content</div>;
}
```

## Available Modules

### Auth Module (`features/auth`)

**Hooks:**
- `useAuth()` - Main authentication hook

**Services:**
- `authService.signup(data)` - Register new user
- `authService.login(data)` - Login user
- `authService.logout()` - Logout user
- `authService.getProfile()` - Get current user
- `authService.forgotPassword(data)` - Request password reset
- `authService.resetPassword(data)` - Reset password
- `authService.isAuthenticated()` - Check auth status

**Types:**
- `User` - User object
- `SignupRequest` - Signup form data
- `LoginRequest` - Login form data
- `AuthResponse` - API response

**Utils:**
- `validateEmail(email)` - Validate email format
- `validatePassword(password)` - Validate password strength
- `validateSignupForm(data)` - Validate entire signup form
- `validateLoginForm(data)` - Validate login form

### User Module (`features/user`)

**Hooks:**
- `useUser()` - Main user profile hook

**Services:**
- `userService.getUserProfile()` - Get user profile
- `userService.updateUserProfile(data)` - Update profile
- `userService.deleteUserAccount()` - Delete account

**Types:**
- `UserProfile` - User profile object
- `UpdateUserInput` - Update profile data

## API Configuration

The axios client is configured in `core/api/axios.config.ts` with:

- Base URL from environment variables
- Automatic token attachment to requests
- Automatic token refresh on 401 errors
- Cookie support for httpOnly cookies
- Request/response interceptors

## Constants

All constants are centralized in `shared/constants/`:

- **API Endpoints** (`api.constants.ts`)
- **Validation Patterns** (`validation.constants.ts`)
- **Error Messages** (`validation.constants.ts`)
- **HTTP Status Codes** (`api.constants.ts`)

## Error Handling

All hooks provide consistent error handling:

```typescript
const { login, error, clearError } = useAuth();

// After API call
if (error) {
  // Display error
  toast.error(error);
  // Clear error when needed
  clearError();
}
```

## Backend API Endpoints

### Auth Endpoints
- `POST /auth/signup` - Register
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh-token` - Refresh token
- `POST /auth/forgot-password` - Forgot password
- `POST /auth/reset-password` - Reset password
- `GET /auth/profile` - Get profile

### User Endpoints
- `GET /user/profile` - Get user profile
- `PATCH /user/profile` - Update profile
- `DELETE /user/account` - Delete account

## Token Management

Tokens are managed automatically:

1. **Storage**: Tokens stored in localStorage
2. **Attachment**: Automatically attached to requests via interceptor
3. **Refresh**: Auto-refresh on 401 responses
4. **Cleanup**: Cleared on logout or account deletion

## Best Practices

1. **Always use hooks** in components for state management
2. **Use services directly** only in non-React contexts
3. **Validate forms** before API calls using validation utils
4. **Handle errors** gracefully with user-friendly messages
5. **Clear errors** when user corrects input
6. **Protect routes** that require authentication
7. **Check authentication** status on app load

## Example: Complete Auth Flow

```typescript
// app/login/page.tsx
'use client';

import { useAuth } from '@/features/auth/hooks';
import { validateLoginForm } from '@/features/auth/utils';
import { useState } from 'react';

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    // Client-side validation
    const validation = validateLoginForm(data);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    // API call
    const response = await login(data);
    
    if (response?.success) {
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input name="email" type="email" />
        {formErrors.email && <span>{formErrors.email}</span>}
      </div>
      
      <div>
        <input name="password" type="password" />
        {formErrors.password && <span>{formErrors.password}</span>}
      </div>

      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## Next Steps

1. Install axios: `npm install axios`
2. Set up environment variables
3. Import and use hooks in your components
4. Implement protected routes
5. Add error handling and loading states
6. Style your components with the brown theme

For detailed module documentation, see:
- [Auth Module README](./features/auth/README.md)
- [User Module README](./features/user/README.md)
