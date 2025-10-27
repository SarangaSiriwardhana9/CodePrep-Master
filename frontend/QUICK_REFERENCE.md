# Quick Reference - Frontend Integration

## 🚀 Installation

```bash
npm install axios
```

## 📦 Import Paths

```typescript
// Auth
import { useAuth } from '@/features/auth/hooks';
import { authService } from '@/features/auth/services';
import { validateEmail, validatePassword } from '@/features/auth/utils';
import type { User, AuthResponse, LoginRequest, SignupRequest } from '@/features/auth/types';

// User
import { useUser } from '@/features/user/hooks';
import { userService } from '@/features/user/services';
import type { UserProfile, UpdateUserInput } from '@/features/user/types';

// Constants
import { API_ENDPOINTS, HTTP_STATUS } from '@/shared/constants/api.constants';
import { VALIDATION_PATTERNS, VALIDATION_MESSAGES } from '@/shared/constants/validation.constants';
```

## 🎣 Hooks Usage

### useAuth Hook
```typescript
const {
  user,           // Current user or null
  isLoading,      // Loading state
  error,          // Error message or null
  signup,         // (data: SignupRequest) => Promise<AuthResponse | null>
  login,          // (data: LoginRequest) => Promise<AuthResponse | null>
  logout,         // () => Promise<void>
  forgotPassword, // (data: ForgotPasswordRequest) => Promise<boolean>
  resetPassword,  // (data: ResetPasswordRequest) => Promise<boolean>
  getProfile,     // () => Promise<User | null>
  clearError,     // () => void
} = useAuth();
```

### useUser Hook
```typescript
const {
  profile,        // User profile or null
  isLoading,      // Loading state
  error,          // Error message or null
  getUserProfile, // () => Promise<UserProfile | null>
  updateProfile,  // (data: UpdateUserInput) => Promise<UserProfile | null>
  deleteAccount,  // () => Promise<boolean>
  clearError,     // () => void
} = useUser();
```

## 🔌 API Services

### Auth Service
```typescript
// Direct API calls (without React state)
authService.signup(data)           // Register
authService.login(data)            // Login
authService.logout()               // Logout
authService.refreshToken()         // Refresh token
authService.getProfile()           // Get profile
authService.forgotPassword(data)   // Forgot password
authService.resetPassword(data)    // Reset password
authService.isAuthenticated()      // Check if authenticated
authService.getAccessToken()       // Get token from localStorage
```

### User Service
```typescript
userService.getUserProfile()       // Get profile
userService.updateUserProfile(data) // Update profile
userService.deleteUserAccount()    // Delete account
```

## ✅ Validation Functions

```typescript
// Individual field validation
validateEmail(email)               // Returns { isValid: boolean, error?: string }
validatePassword(password)         // Returns { isValid: boolean, error?: string }
validateName(name)                 // Returns { isValid: boolean, error?: string }
validatePasswordMatch(pass, confirm) // Returns { isValid: boolean, error?: string }

// Form validation
validateSignupForm(data)           // Returns { isValid: boolean, errors: Record<string, string> }
validateLoginForm(data)            // Returns { isValid: boolean, errors: Record<string, string> }
```

## 📝 Type Definitions

### Auth Types
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  lastLogin?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: User;
}
```

### User Types
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

interface UpdateUserInput {
  name?: string;
  email?: string;
}
```

## 🌐 API Endpoints

```typescript
// Auth
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/profile

// User
GET    /user/profile
PATCH  /user/profile
DELETE /user/account
```

## 💡 Common Patterns

### Login Component
```typescript
'use client';
import { useAuth } from '@/features/auth/hooks';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const response = await login({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });

    if (response?.success) {
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {error && <p>{error}</p>}
      <button disabled={isLoading}>Login</button>
    </form>
  );
}
```

### Protected Route
```typescript
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/features/auth/services';

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return <div>Protected Content</div>;
}
```

### Profile Update
```typescript
'use client';
import { useUser } from '@/features/user/hooks';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { profile, getUserProfile, updateProfile, isLoading } = useUser();

  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  const handleUpdate = async (data: { name: string }) => {
    const updated = await updateProfile(data);
    if (updated) {
      alert('Profile updated!');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{profile?.name}</h1>
      {/* Update form */}
    </div>
  );
}
```

### Form Validation
```typescript
import { validateSignupForm } from '@/features/auth/utils';

const handleSubmit = (data: SignupRequest) => {
  const validation = validateSignupForm(data);
  
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }
  
  // Proceed with signup
  signup(data);
};
```

## 🔑 Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## 📋 Checklist

- [ ] Install axios: `npm install axios`
- [ ] Set `NEXT_PUBLIC_API_URL` in `.env.local`
- [ ] Import hooks in components
- [ ] Add error handling
- [ ] Add loading states
- [ ] Implement protected routes
- [ ] Add form validation
- [ ] Style with brown theme

## 🎨 Integration with shadcn/ui

```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks';

export default function LoginForm() {
  const { login, isLoading, error } = useAuth();

  return (
    <form>
      <Input name="email" type="email" />
      <Input name="password" type="password" />
      {error && <Alert variant="destructive">{error}</Alert>}
      <Button disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </Button>
    </form>
  );
}
```

## 📚 Full Documentation

- [Integration Guide](./INTEGRATION_GUIDE.md)
- [Auth Module](./features/auth/README.md)
- [User Module](./features/user/README.md)
- [Features Summary](./features/FEATURES_SUMMARY.md)
