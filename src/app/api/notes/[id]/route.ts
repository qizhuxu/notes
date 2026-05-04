/**
 * Note Detail API — Get, Update, Delete (soft)
 *
 * GET    /api/notes/:id  → 获取笔记详情
 * PUT    /api/notes/:id  → 更新笔记
 * DELETE /api/notes/:id  → 软删除笔记
 */

import { NextRequest } from 'next/server';
import { success, error, parseBody } from '@/lib/api-response';
import { mockNotes } from '@/lib/mock-data';

type RouteContext = { params: Promise<{ id: string }> };

/** Find a note by id, or return null */
function findNote(id: string) {
  return mockNotes.find((n) => n.id === id) ?? null;
}

/** GET /api/notes/:id */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const note = findNote(id);
    if (!note) return error('笔记不存在', 404, 404);
    return success(note);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '获取笔记详情失败';
    return error(msg, 1, 500);
  }
}

/** PUT /api/notes/:id — update fields */
export async function PUT(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const note = findNote(id);
    if (!note) return error('笔记不存在', 404, 404);

    const body = await parseBody<{
      title?: string;
      content?: string;
      folderId?: string | null;
      tags?: string[];
      isStarred?: boolean;
    }>(req);

    if (!body) return error('请求体格式错误');

    // Apply partial updates
    if (body.title !== undefined) note.title = String(body.title);
    if (body.content !== undefined) {
      note.content = String(body.content);
      note.wordCount = body.content.replace(/\s+/g, '').length;
    }
    if (body.folderId !== undefined) note.folderId = body.folderId;
    if (body.tags !== undefined) note.tags = body.tags;
    if (body.isStarred !== undefined) note.isStarred = body.isStarred;

    note.updatedAt = new Date().toISOString();

    return success(note, '笔记更新成功');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '更新笔记失败';
    return error(msg, 1, 500);
  }
}

/** DELETE /api/notes/:id — soft delete */
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const note = findNote(id);
    if (!note) return error('笔记不存在', 404, 404);

    note.isTrashed = true;
    note.updatedAt = new Date().toISOString();

    return success(note, '笔记已移至回收站');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '删除笔记失败';
    return error(msg, 1, 500);
  }
}
