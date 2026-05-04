/**
 * Auth — Login
 *
 * POST /api/auth/login  → 登录 { email, password }
 *
 * Mock implementation:
 * - Validates email & password format
 * - Simulates 1 s delay
 * - Returns mock JWT token + user info
 * - admin@example.com → admin role regardless of password
 */

import { NextRequest } from 'next/server';
import { success, error, parseBody } from '@/lib/api-response';
import { nanoid } from '@/lib/mock-data';

/** Simulate network latency */
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = await parseBody<{ email?: string; password?: string }>(req);
    if (!body) return error('请求体格式错误');

    const { email, password } = body;

    // Validate fields
    if (!email || typeof email !== 'string') return error('请输入邮箱地址');
    if (!password || typeof password !== 'string') return error('请输入密码');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return error('邮箱格式不正确');
    if (password.length < 6) return error('密码长度至少为 6 位');

    // Simulate network latency
    await delay(1000);

    // Admin shortcut
    const isAdmin = email.toLowerCase() === 'admin@example.com';

    const token = `nv_${nanoid(48)}`;
    const user = {
      id: nanoid(16),
      username: isAdmin ? 'Admin' : email.split('@')[0],
      email,
      avatarUrl: undefined,
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };

    return success({ token, user }, '登录成功');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '登录失败';
    return error(msg, 1, 500);
  }
}
