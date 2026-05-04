/**
 * Folder Detail API — Update & Delete
 *
 * PUT    /api/folders/:id  → 更新文件夹
 * DELETE /api/folders/:id  → 删除文件夹
 */

import { NextRequest } from 'next/server';
import { success, error, parseBody } from '@/lib/api-response';
import { mockFolders } from '@/lib/mock-data';

type RouteContext = { params: Promise<{ id: string }> };

/** Find a folder by id */
function findFolder(id: string) {
  return mockFolders.find((f) => f.id === id) ?? null;
}

/** PUT /api/folders/:id — update folder name or icon */
export async function PUT(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const folder = findFolder(id);
    if (!folder) return error('文件夹不存在', 404, 404);
    if (folder.type === 'system') return error('系统文件夹不可编辑');

    const body = await parseBody<{ name?: string; icon?: string }>(req);
    if (!body) return error('请求体格式错误');

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return error('文件夹名称不能为空');
      }
      folder.name = body.name.trim();
    }
    if (body.icon !== undefined) {
      folder.icon = String(body.icon);
    }

    return success(folder, '文件夹已更新');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '更新文件夹失败';
    return error(msg, 1, 500);
  }
}

/** DELETE /api/folders/:id — remove a custom folder */
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const folder = findFolder(id);
    if (!folder) return error('文件夹不存在', 404, 404);
    if (folder.type === 'system') return error('系统文件夹不可删除');

    const idx = mockFolders.findIndex((f) => f.id === id);
    mockFolders.splice(idx, 1);

    return success(null, '文件夹已删除');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '删除文件夹失败';
    return error(msg, 1, 500);
  }
}
