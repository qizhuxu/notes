/**
 * Auth — Register
 *
 * POST /api/auth/register  → 注册 { username, email, password }
 *
 * Mock implementation:
 * - Validates all fields
 * - Simulates 1 s delay
 * - Returns mock token + user info
 */

import { NextRequest } from 'next/server';
import { success, error, parseBody } from '@/lib/api-response';
import { nanoid } from '@/lib/mock-data';

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = await parseBody<{
      username?: string;
      email?: string;
      password?: string;
    }>(req);

    if (!body) return error('请求体格式错误');

    const { username, email, password } = body;

    // Validate
    if (!username || typeof username !== 'string' || username.trim().length < 2) {
      return error('用户名至少需要 2 个字符');
    }
    if (!email || typeof email !== 'string') return error('请输入邮箱地址');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return error('邮箱格式不正确');

    if (!password || typeof password !== 'string') return error('请输入密码');
    if (password.length < 6) return error('密码长度至少为 6 位');

    // Simulate latency
    await delay(1000);

    const token = `nv_${nanoid(48)}`;
    const user = {
      id: nanoid(16),
      username: username.trim(),
      email,
      avatarUrl: undefined,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    };

    return success({ token, user }, '注册成功');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '注册失败';
    return error(msg, 1, 500);
  }
}
