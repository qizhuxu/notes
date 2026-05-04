/**
 * API Keys — List, Add, Delete
 *
 * GET    /api/settings/api-keys         → 获取 API keys 列表
 * POST   /api/settings/api-keys         → 添加 API key
 * DELETE /api/settings/api-keys/:id     → 删除 API key
 *
 * Mock implementation using in-memory array.
 */

import { NextRequest } from 'next/server';
import { success, error, parseBody } from '@/lib/api-response';
import { mockApiKeys, genId, type MockApiKey } from '@/lib/mock-data';

type DeleteContext = { params: Promise<{ id: string }> };

/** GET /api/settings/api-keys */
export async function GET() {
  try {
    // Mask the keys before returning (keep only last 4 chars visible)
    const masked = mockApiKeys.map((k) => ({
      ...k,
      key: k.key.slice(0, 6) + '...' + k.key.slice(-4),
    }));
    return success(masked);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '获取 API Keys 失败';
    return error(msg, 1, 500);
  }
}

/** POST /api/settings/api-keys — add a new key */
export async function POST(req: NextRequest) {
  try {
    const body = await parseBody<{
      name?: string;
      provider?: string;
      key?: string;
    }>(req);

    if (!body) return error('请求体格式错误');
    if (!body.name || typeof body.name !== 'string')
      return error('请提供 API Key 名称');
    if (!body.provider || typeof body.provider !== 'string')
      return error('请提供服务商名称');
    if (!body.key || typeof body.key !== 'string')
      return error('请提供 API Key');

    const entry: MockApiKey = {
      id: genId('ak'),
      name: body.name.trim(),
      provider: body.provider.trim(),
      key: body.key.trim(),
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    };

    mockApiKeys.push(entry);

    return success(
      {
        id: entry.id,
        name: entry.name,
        provider: entry.provider,
        key: entry.key.slice(0, 6) + '...' + entry.key.slice(-4),
        createdAt: entry.createdAt,
        lastUsedAt: entry.lastUsedAt,
      },
      'API Key 添加成功',
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '添加 API Key 失败';
    return error(msg, 1, 500);
  }
}

/** DELETE /api/settings/api-keys/:id */
export async function DELETE(_req: NextRequest, ctx: DeleteContext) {
  try {
    const { id } = await ctx.params;
    const idx = mockApiKeys.findIndex((k) => k.id === id);
    if (idx === -1) return error('API Key 不存在', 404, 404);

    mockApiKeys.splice(idx, 1);

    return success(null, 'API Key 已删除');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '删除 API Key 失败';
    return error(msg, 1, 500);
  }
}
