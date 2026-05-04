/**
 * Tags API — List & Create
 *
 * GET  /api/tags  → 获取标签列表
 * POST /api/tags  → 创建标签
 */

import { NextRequest } from 'next/server';
import { success, error, parseBody } from '@/lib/api-response';
import { mockTags, genId, type MockTag } from '@/lib/mock-data';

export const runtime = 'edge';

/** GET /api/tags */
export async function GET() {
  try {
    return success(mockTags);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '获取标签列表失败';
    return error(msg, 1, 500);
  }
}

/** POST /api/tags — create a new tag */
export async function POST(req: NextRequest) {
  try {
    const body = await parseBody<{
      name?: string;
      color?: string;
    }>(req);

    if (!body) return error('请求体格式错误');
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return error('请提供标签名称');
    }

    const name = body.name.trim();

    // Prevent duplicates
    if (mockTags.some((t) => t.name === name)) {
      return error('标签名称已存在');
    }

    const tag: MockTag = {
      id: genId('tag'),
      name,
      color: body.color ?? '#6366f1',
    };

    mockTags.push(tag);

    return success(tag, '标签创建成功');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '创建标签失败';
    return error(msg, 1, 500);
  }
}
