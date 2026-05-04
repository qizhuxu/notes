/**
 * Auth — Get current user
 *
 * GET /api/auth/me  → 获取当前用户信息
 *
 * Mock implementation:
 * - Checks Authorization header
 * - Returns mock user info
 */

import { NextRequest } from 'next/server';
import { success, error } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return error('未提供认证信息', 401, 401);
    }

    // Accept "Bearer <token>" or just the token directly
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token || token.length < 10) {
      return error('无效的认证令牌', 401, 401);
    }

    // Mock user based on token presence (in production, verify JWT)
    const user = {
      id: 'user_mock_001',
      username: 'Demo User',
      email: 'demo@notevault.com',
      avatarUrl: undefined,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    };

    return success({ user });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '获取用户信息失败';
    return error(msg, 1, 500);
  }
}
