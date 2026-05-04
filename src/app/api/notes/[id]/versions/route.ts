/**
 * Note Versions API — History snapshots
 *
 * GET  /api/notes/:id/versions  → 获取版本历史
 * POST /api/notes/:id/versions  → 创建版本快照
 */

import { NextRequest } from 'next/server';
import { success, error, parseBody } from '@/lib/api-response';
import { mockNotes, mockNoteVersions, genId, type MockNoteVersion } from '@/lib/mock-data';

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/notes/:id/versions */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const note = mockNotes.find((n) => n.id === id);
    if (!note) return error('笔记不存在', 404, 404);

    const versions = mockNoteVersions
      .filter((v) => v.noteId === id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return success(versions);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '获取版本历史失败';
    return error(msg, 1, 500);
  }
}

/** POST /api/notes/:id/versions — create a snapshot */
export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const note = mockNotes.find((n) => n.id === id);
    if (!note) return error('笔记不存在', 404, 404);

    const body = await parseBody<{ title?: string; content?: string }>(req);
    const title = body?.title ?? note.title;
    const content = body?.content ?? note.content;

    const version: MockNoteVersion = {
      id: genId('v'),
      noteId: id,
      title: String(title),
      content: String(content),
      createdAt: new Date().toISOString(),
      wordCount: String(content).replace(/\s+/g, '').length,
    };

    mockNoteVersions.push(version);

    return success(version, '版本快照已创建');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '创建版本快照失败';
    return error(msg, 1, 500);
  }
}
