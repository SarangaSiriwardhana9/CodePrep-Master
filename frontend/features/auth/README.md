# Auth Module

This module handles all authentication-related functionality for the frontend application.

## Structure

```
auth/
├── components/     # Auth UI components (Login, Signup, etc.)
├── hooks/          # React hooks for auth operations
├── services/       # API service functions
├── types/          # TypeScript type definitions
├── utils/          # Utility functions (validation, etc.)
└── constants/      # Auth-specific constants
```

## Usage

### 1. Using the useAuth Hook

```typescript
import { useAuth } from '@/features/auth/hooks';

function LoginComponent() {
  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    const response = await login({ email, password });
    
    if (response?.success) {
      // Redirect to dashboard
      router.push('/dashboard');
    }
  };

  return (
    // Your JSX
  );
}
```

### 2. Available Auth Operations

#### Signup
```typescript
const { signup } = useAuth();

const response = await signup({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123'
});
```

#### Login
```typescript
const { login } = useAuth();

const response = await login({
  email: 'john@example.com',
  password: 'SecurePass123'
});
```

#### Logout
```typescript
const { logout } = useAuth();

await logout();
```

#### Get Profile
```typescript
const { getProfile } = useAuth();

const user = await getProfile();
```

#### Forgot Password
```typescript
const { forgotPassword } = useAuth();

const success = await forgotPassword({
  email: 'john@example.com'
});
```

#### Reset Password
```typescript
const { resetPassword } = useAuth();

const success = await resetPassword({
  token: 'reset-token-from-email',
  newPassword: 'NewSecurePass123',
  confirmPassword: 'NewSecurePass123'
});
```

### 3. Using Auth Service Directly

```typescript
import { authService } from '@/features/auth/services';

// Check if user is authenticated
const isAuth = authService.isAuthenticated();

// Get access token
const token = authService.getAccessToken();

// Login
const response = await authService.login({ email, password });
```

### 4. Validation Utilities

```typescript
import {
  validateEmail,
  validatePassword,
  validateSignupForm,
  validateLoginForm
} from '@/features/auth/utils';

// Validate email
const emailValidation = validateEmail('test@example.com');
if (!emailValidation.isValid) {
  console.error(emailValidation.error);
}

// Validate entire signup form
const formValidation = validateSignupForm({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123'
});

if (!formValidation.isValid) {
  console.error(formValidation.errors);
}
```

## API Endpoints

All endpoints are defined in `@/shared/constants/api.constants.ts`:

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/profile` - Get current user profile

## Types

### User
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
```

### AuthResponse
```typescript
interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: User;
}
```

## Error Handling

All hooks return an `error` state that contains error messages from the API:

```typescript
const { login, error } = useAuth();

await login({ email, password });

if (error) {
  // Display error to user
  toast.error(error);
}
```

## Token Management

Tokens are automatically:
- Stored in localStorage after login/signup
- Attached to API requests via axios interceptor
- Refreshed automatically when expired
- Cleared on logout

## Notes

- All API calls use the axios client configured in `@/core/api/axios.config.ts`
- Cookies are used for additional security (httpOnly cookies from backend)
- Token refresh happens automatically on 401 responses
