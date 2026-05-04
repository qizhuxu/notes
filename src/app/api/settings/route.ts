/**
 * Settings API — Get & Update user settings
 *
 * GET /api/settings  → 获取用户设置
 * PUT /api/settings  → 更新用户设置
 *
 * Mock implementation using in-memory store.
 */

import { NextRequest } from 'next/server';
import { success, error, parseBody } from '@/lib/api-response';
import {
  currentSettings,
  defaultSettings,
  type MockSettings,
} from '@/lib/mock-data';

/** GET /api/settings */
export async function GET() {
  try {
    return success(currentSettings);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '获取设置失败';
    return error(msg, 1, 500);
  }
}

/** PUT /api/settings — partial update */
export async function PUT(req: NextRequest) {
  try {
    const body = await parseBody<Partial<MockSettings>>(req);
    if (!body) return error('请求体格式错误');

    // Merge allowed keys into current settings
    const allowedKeys = Object.keys(defaultSettings) as (keyof MockSettings)[];
    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        (currentSettings as Record<string, unknown>)[key] = body[key];
      }
    }

    return success(currentSettings, '设置已更新');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '更新设置失败';
    return error(msg, 1, 500);
  }
}
