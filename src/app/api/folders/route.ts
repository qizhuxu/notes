/**
 * Folders API — List & Create
 *
 * GET  /api/folders  → 获取文件夹列表
 * POST /api/folders  → 创建文件夹
 */

import { NextRequest } from 'next/server';
import { success, error, parseBody } from '@/lib/api-response';
import { mockFolders, genId, type MockFolder } from '@/lib/mock-data';

/** GET /api/folders */
export async function GET() {
  try {
    return success(mockFolders);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '获取文件夹列表失败';
    return error(msg, 1, 500);
  }
}

/** POST /api/folders — create a new folder */
export async function POST(req: NextRequest) {
  try {
    const body = await parseBody<{
      name?: string;
      icon?: string;
    }>(req);

    if (!body) return error('请求体格式错误');
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return error('请提供文件夹名称');
    }

    const folder: MockFolder = {
      id: genId('folder'),
      name: body.name.trim(),
      icon: body.icon ?? '📁',
      count: 0,
      type: 'custom',
    };

    mockFolders.push(folder);

    return success(folder, '文件夹创建成功');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '创建文件夹失败';
    return error(msg, 1, 500);
  }
}
