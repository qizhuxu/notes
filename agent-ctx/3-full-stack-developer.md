# Task ID: 3 — 认证系统 (登录/注册页面 + Auth Store)

## Agent: full-stack-developer

## Summary

Complete authentication system for NoteVault 2.0, including:

### Files Created
1. **src/stores/auth-store.ts** — Zustand auth state management
   - User interface with id, username, email, avatarUrl, authMethod
   - Mock login/register with simulated API latency (1-2s)
   - localStorage persistence with `hydrated` flag for SSR safety
   - Demo mode: accepts any email + 6+ char password
   - OAuth stub methods (console.log + toast)

2. **src/app/login/page.tsx** — Login page
   - Centered card layout (max-width 420px) with theme CSS variables
   - React Hook Form + Zod validation
   - Email/password fields with icons, error messages, password toggle
   - "Forgot password?" link, "Register" link
   - OAuth buttons (GitHub, Google, WeChat) with toast notifications
   - Framer Motion staggered entry animations
   - Demo hint banner

3. **src/app/register/page.tsx** — Registration page
   - Username, email, password, confirm password fields
   - Password strength indicator (weak/medium/strong) with animated progress bar
   - Zod refine validation for password matching
   - Consistent layout and OAuth buttons matching login page

4. **src/app/auth/callback/page.tsx** — OAuth callback page
   - Loading spinner with brand identity
   - Mock: 2-second delay, then sets OAuth user and redirects to `/`

5. **src/components/auth/auth-guard.tsx** — Route guard
   - Wraps protected pages, redirects unauthenticated users to `/login`
   - Uses store `hydrated` state (avoids React setState-in-effect lint error)
   - Loading spinner while checking auth status

### Files Modified
6. **src/app/page.tsx** — Main page now wraps AppLayout with AuthGuard
7. **src/app/layout.tsx** — Added Sonner Toaster alongside existing Shadcn Toaster
8. **worklog.md** — Appended Phase 3 work log

### Lint Results
- 0 errors, 1 warning (React Hook Form `watch()` incompatible-library — known limitation)
