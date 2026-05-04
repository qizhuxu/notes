/**
 * Notes API — List & Create
 *
 * GET  /api/notes  → 获取笔记列表（支持分页、文件夹筛选、标签筛选、搜索）
 * POST /api/notes  → 创建笔记
 */

import { NextRequest } from 'next/server';
import { success, error, paginated, parseBody, getPagination } from '@/lib/api-response';
import { mockNotes, genId, type MockNote } from '@/lib/mock-data';

export const runtime = 'edge';

/** GET /api/notes */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit } = getPagination(searchParams);

    const folder = searchParams.get('folder');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const includeTrashed = searchParams.get('trashed') === 'true';

    let filtered = mockNotes.filter((n) => {
      // Exclude trashed unless explicitly requested
      if (!includeTrashed && n.isTrashed) return false;

      // Folder filter
      if (folder === 'favorites') {
        if (!n.isStarred) return false;
      } else if (folder && folder !== 'all') {
        if (n.folderId !== folder) return false;
      }

      // Tag filter
      if (tag && !n.tags.includes(tag)) return false;

      // Search
      if (search) {
        if (
          !n.title.toLowerCase().includes(search) &&
          !n.content.toLowerCase().includes(search)
        )
          return false;
      }

      return true;
    });

    // Sort by updatedAt descending
    filtered.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return paginated(items, page, limit, total);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '获取笔记列表失败';
    return error(msg, 1, 500);
  }
}

/** POST /api/notes — create a new note */
export async function POST(req: NextRequest) {
  try {
    const body = await parseBody<{
      title?: string;
      content?: string;
      folderId?: string | null;
      tags?: string[];
    }>(req);

    if (!body) {
      return error('请求体格式错误');
    }

    const { title = '无标题笔记', content = '', folderId = null, tags = [] } = body;

    const now = new Date().toISOString();
    const note: MockNote = {
      id: genId('n'),
      title: String(title),
      content: String(content),
      folderId,
      tags,
      isStarred: false,
      isTrashed: false,
      updatedAt: now,
      createdAt: now,
      wordCount: content.replace(/\s+/g, '').length,
    };

    mockNotes.unshift(note);

    return success(note, '笔记创建成功');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '创建笔记失败';
    return error(msg, 1, 500);
  }
}
