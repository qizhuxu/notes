/**
 * Auth — Logout
 *
 * POST /api/auth/logout  → 登出
 *
 * Mock implementation — simply returns success.
 * In production the server would invalidate the token / session.
 */

import { success } from '@/lib/api-response';

export async function POST() {
  // In a real implementation, you would:
  // 1. Extract the token from Authorization header
  // 2. Add it to a blacklist or delete the session
  // 3. Clear any httpOnly cookies

  return success(null, '已成功登出');
}
