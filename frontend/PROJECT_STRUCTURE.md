# Project Structure - Clean & Organized ✅

## Overview
The project now has a clean, intuitive folder structure separating student and admin functionalities properly.

## Folder Structure

```
frontend/app/
├── (auth)/                          ← Authentication pages (public)
│   ├── layout.tsx                   Split-screen layout with banner
│   ├── login/page.tsx               Login page
│   ├── signup/page.tsx              Signup page
│   ├── forgot-password/page.tsx     Password recovery
│   └── reset-password/page.tsx      Password reset
│
├── (student)/                       ← Student dashboard & features
│   ├── layout.tsx                   Layout with Navbar
│   ├── dashboard/page.tsx           Student dashboard
│   ├── problems/page.tsx            Browse & solve problems
│   ├── leaderboard/page.tsx         View rankings
│   ├── profile/page.tsx             User profile
│   └── settings/page.tsx            Account settings
│
├── (admin)/                         ← Admin panel & management
│   ├── layout.tsx                   Layout with AdminSidebar
│   ├── dashboard/page.tsx           Admin overview
│   ├── users/page.tsx               User management
│   ├── problems/page.tsx            Problem management
│   ├── reports/page.tsx             Moderation reports
│   ├── logs/page.tsx                Action logs
│   ├── config/page.tsx              System configuration
│   └── analytics/page.tsx           Analytics dashboard
│
├── layout.tsx                       Root layout with Providers
├── page.tsx                         Landing page (public)
└── globals.css                      Global styles
```

## Route Structure

### Public Routes (No Authentication Required)
```
/                    → Landing page
/login               → Login page
/signup              → Signup page
/forgot-password     → Password recovery
/reset-password      → Password reset with token
```

### Student Routes (Requires Authentication)
```
/dashboard           → Student dashboard
/problems            → Browse problems
/leaderboard         → View leaderboard
/profile             → User profile
/settings            → Account settings
```

### Admin Routes (Requires Admin Role)
```
/dashboard           → Admin overview (same route, different layout)
/users               → User management
/problems            → Problem management (admin CRUD)
/reports             → Moderation reports
/logs                → Action logs
/config              → System configuration
/analytics           → Analytics dashboard
```

## User Roles & Access

### Student User
- **Can Access:**
  - `/dashboard` - Student dashboard with progress
  - `/problems` - Browse and solve problems
  - `/leaderboard` - View rankings
  - `/profile` - View/edit profile
  - `/settings` - Account settings

- **Navigation:**
  - Sees **Navbar** at top
  - Logo, Profile dropdown, Logout

### Admin User
- **Can Access:**
  - All student routes (with student layout)
  - `/users` - Manage all users
  - `/problems` - Manage all problems
  - `/reports` - Handle reports
  - `/logs` - View action logs
  - `/config` - System settings
  - `/analytics` - Platform analytics

- **Navigation:**
  - **In Student Routes:** Sees Navbar with "Admin Panel" button
  - **In Admin Routes:** Sees AdminSidebar (no navbar)

## How It Works

### 1. Route Groups (Parentheses)
Next.js route groups `(folder)` organize files without affecting URLs:
- `(auth)` → Auth pages don't show `auth` in URL
- `(student)` → Student pages don't show `student` in URL  
- `(admin)` → Admin pages don't show `admin` in URL

### 2. Layouts
Each route group has its own layout:

#### Auth Layout (`(auth)/layout.tsx`)
- Split-screen design
- No authentication required
- Banner image on left

#### Student Layout (`(student)/layout.tsx`)
- Navbar at top
- Protected (requires authentication)
- Container for content
- Accessible by all logged-in users

#### Admin Layout (`(admin)/layout.tsx`)
- AdminSidebar on left
- Protected (requires admin role)
- No navbar
- Full-width content area
- Only accessible by admins

### 3. Access Control

#### Middleware (`middleware.ts`)
Protects routes at the edge:
```typescript
// Student routes - Need authentication
/dashboard, /problems, /leaderboard, /profile, /settings

// Admin routes - Need authentication + admin role
/users, /reports, /logs, /config, /analytics
```

#### Layout-Level Protection
Each layout also checks authentication:
- **Student Layout:** Redirects to `/login` if not authenticated
- **Admin Layout:** Redirects to `/dashboard` if not admin

## Navigation Components

### Navbar (`components/common/Navbar.tsx`)
Used in student routes:
- Logo (links to `/dashboard` if authenticated)
- Profile dropdown with:
  - User name & email
  - "Administrator" badge (if admin)
  - Profile
  - Settings
  - **Admin Panel** button (if admin) → Goes to `/users`
  - Logout

### AdminSidebar (`components/admin/AdminSidebar.tsx`)
Used in admin routes:
- Admin Panel branding
- Navigation menu:
  - Overview → `/dashboard`
  - User Management → `/users`
  - Problem Management → `/problems`
  - Moderation Reports → `/reports`
  - Action Logs → `/logs`
  - System Config → `/config`
  - Analytics → `/analytics`
- User info section
- Back to Dashboard button → `/dashboard` (student view)
- Logout button

## Example User Journeys

### Student Journey
1. Visit site → Landing page `/`
2. Click "Get Started" → `/signup`
3. Create account → Auto redirect to `/dashboard` (student dashboard)
4. Click Problems → `/problems`
5. Solve a problem
6. Check Leaderboard → `/leaderboard`
7. View Profile → `/profile`

### Admin Journey (First-Time User)
1. Visit site → Landing page `/`
2. Login with admin credentials → `/login`
3. Redirect to `/dashboard` (admin sees student dashboard with navbar)
4. Click profile dropdown → See "Admin Panel" option
5. Click "Admin Panel" → Redirect to `/users`
6. Now in admin mode with sidebar
7. Navigate between admin sections using sidebar
8. Click "Back to Dashboard" → Return to `/dashboard` (student view)

### Admin Journey (Direct Access)
1. Admin already logged in
2. Visit `/users` directly
3. Admin layout loads with sidebar
4. Can navigate to any admin section
5. Or go back to student dashboard

## Key Features

### 1. Shared `/dashboard` Route
Both students and admins use `/dashboard`, but:
- **Students:** See `(student)/dashboard/page.tsx` with student stats
- **Admins:** Can see both - student dashboard when in student mode, admin overview in sidebar

### 2. Shared `/problems` Route  
Both students and admins use `/problems`, but:
- **Students:** See `(student)/problems/page.tsx` to browse/solve
- **Admins:** See `(admin)/problems/page.tsx` for CRUD management

### 3. Smart Navigation
- Landing page logo → `/` (public)
- Navbar logo → `/dashboard` (authenticated)
- Admin Panel button → `/users` (first admin page)
- Back to Dashboard → `/dashboard` (from admin mode)

### 4. Automatic Redirects
- Login while authenticated → `/dashboard`
- Access `/users` without admin role → `/dashboard`
- Access `/dashboard` without auth → `/login?redirect=/dashboard`

## Development Guidelines

### Adding a New Student Page
1. Create file in `app/(student)/[pagename]/page.tsx`
2. No need to update layout (uses `(student)/layout.tsx`)
3. Add route to navbar if needed
4. Update middleware matcher if needed

### Adding a New Admin Page
1. Create file in `app/(admin)/[pagename]/page.tsx`
2. No need to update layout (uses `(admin)/layout.tsx`)
3. Add to `AdminSidebar` menu items
4. Update middleware matcher

### Route Protection
All routes in `(student)` and `(admin)` are automatically protected by their layouts. Additional middleware protection available for specific routes.

## Benefits of This Structure

1. **✅ Clear Separation** - Student vs Admin functionality
2. **✅ Easy to Navigate** - Logical folder structure
3. **✅ Scalable** - Easy to add new pages
4. **✅ Maintainable** - Each section independent
5. **✅ Flexible Layouts** - Different UI for different roles
6. **✅ Secure** - Multiple layers of protection
7. **✅ Clean URLs** - No unnecessary path segments
8. **✅ DRY Principle** - Shared layouts, no repetition

## URLs vs Folder Structure

| Folder Path | Actual URL | Who Can Access |
|-------------|------------|----------------|
| `(auth)/login/page.tsx` | `/login` | Everyone |
| `(student)/dashboard/page.tsx` | `/dashboard` | Authenticated users |
| `(student)/problems/page.tsx` | `/problems` | Authenticated users |
| `(admin)/users/page.tsx` | `/users` | Admin only |
| `(admin)/dashboard/page.tsx` | `/dashboard` | Admin only (via sidebar) |

Note: The parentheses folders don't appear in URLs!

## Testing Checklist

### As Student
- [ ] Login → Redirects to `/dashboard`
- [ ] See student dashboard with stats
- [ ] Navbar visible at top
- [ ] Can navigate to Problems, Leaderboard, Profile, Settings
- [ ] No "Admin Panel" button in profile dropdown
- [ ] Cannot access `/users`, `/reports`, etc.

### As Admin
- [ ] Login → Redirects to `/dashboard`
- [ ] See "Administrator" badge in profile
- [ ] See "Admin Panel" button in dropdown
- [ ] Click "Admin Panel" → Goes to `/users`
- [ ] AdminSidebar appears on left
- [ ] No navbar in admin sections
- [ ] Can navigate between admin pages
- [ ] Can click "Back to Dashboard" to return to student view
- [ ] Can access both student AND admin routes

## Summary

The project now has a **clean, professional folder structure** that:
- ✅ Separates concerns (student vs admin)
- ✅ Uses Next.js route groups properly
- ✅ Has clear, consistent navigation
- ✅ Provides proper access control
- ✅ Is easy to understand and maintain
- ✅ Follows Next.js best practices

**No more messy routes!** 🎉

