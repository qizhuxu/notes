'use client';

import { useNoteStore, type Note } from '@/stores/note-store';
import { useState, useCallback, useRef, useEffect } from 'react';
import { TipTapEditor } from '@/components/editor/TipTapEditor';

/* ============================================================
   Helpers
   ============================================================ */

function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${day} ${h}:${min}`;
}

/* ============================================================
   BackLinks mock
   ============================================================ */

const BACK_LINKS = [
  {
    id: 'bl1',
    title: 'Zustand 状态管理最佳实践',
    excerpt: '在使用 Zustand 进行状态管理时，有几个最佳实践值得注意...',
  },
  {
    id: 'bl2',
    title: '组件设计系统搭建思路',
    excerpt: '构建一套完整的组件设计系统需要从设计令牌开始...',
  },
];

/* ============================================================
   NoteEditor — inner component with local edit state
   Remounts when note.id changes (via key prop)
   ============================================================ */

function NoteEditor({
  note,
  folders,
  tags,
  moveToTrash,
  restoreNote,
  toggleStar,
}: {
  note: Note;
  folders: { id: string; name: string; icon: string }[];
  tags: { id: string; name: string; color: string }[];
  moveToTrash: (id: string) => void;
  restoreNote: (id: string) => void;
  toggleStar: (id: string) => void;
}) {
  const updateNoteContent = useNoteStore((s) => s.updateNoteContent);
  const showPreview = useNoteStore((s) => s.showPreview);
  const togglePreview = useNoteStore((s) => s.togglePreview);
  const [showMenu, setShowMenu] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [wordCount, setWordCount] = useState(note.wordCount);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentNoteRef = useRef(note.id);

  const folder = folders.find((f) => f.id === note.folderId);
  const noteTags = note.tags
    .map((tid) => tags.find((t) => t.id === tid))
    .filter(Boolean);

  // Handle TipTap editor content updates with auto-save
  const handleEditorUpdate = useCallback(
    (html: string, text: string, wc: number) => {
      setWordCount(wc);
      setSaveStatus('unsaved');

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        setSaveStatus('saving');
        setTimeout(() => {
          updateNoteContent(currentNoteRef.current, text, html);
          setSaveStatus('saved');
        }, 300);
      }, 800);
    },
    [updateNoteContent]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return (
    <main className="hidden md:flex flex-1 flex-col h-full overflow-hidden">
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        {/* Breadcrumb + Tags */}
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {folder && (
            <span
              className="text-xs px-2 py-1 rounded-md flex items-center gap-1"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <span className="text-xs">{folder.icon}</span>
              {folder.name}
            </span>
          )}
          {note.isStarred && (
            <span className="text-xs" style={{ color: 'var(--color-star)' }}>
              ★ 已收藏
            </span>
          )}
          {noteTags.map((tag) =>
            tag ? (
              <span
                key={tag.id}
                className="text-xs px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer"
                style={{
                  background: tag.color + '18',
                  color: tag.color,
                }}
              >
                {tag.name}
                <span className="ml-0.5 opacity-60 hover:opacity-100">✕</span>
              </span>
            ) : null,
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Toggle Preview */}
          <button
            onClick={togglePreview}
            className="w-8 h-8 flex items-center justify-center rounded-lg nv-transition"
            style={{
              color: showPreview
                ? 'var(--color-accent)'
                : 'var(--color-text-tertiary)',
              background: showPreview
                ? 'var(--color-accent-light)'
                : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!showPreview)
                e.currentTarget.style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              if (!showPreview)
                e.currentTarget.style.background = 'transparent';
            }}
            aria-label={showPreview ? '隐藏预览' : '显示预览'}
            title={showPreview ? '隐藏预览 (Ctrl+P)' : '显示预览 (Ctrl+P)'}
          >
            <span className="text-sm">{showPreview ? '👁' : '👁‍🗨'}</span>
          </button>

          {/* Star */}
          <button
            onClick={() => toggleStar(note.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg nv-transition"
            style={{
              color: note.isStarred
                ? 'var(--color-star)'
                : 'var(--color-text-tertiary)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label={note.isStarred ? '取消收藏' : '收藏'}
          >
            <span className="text-sm">{note.isStarred ? '★' : '☆'}</span>
          </button>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 flex items-center justify-center rounded-lg nv-transition"
              style={{
                color: 'var(--color-text-tertiary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              aria-label="更多操作"
            >
              <span className="text-sm">⋯</span>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div
                  className="absolute right-0 top-full mt-1 z-50 w-40 rounded-lg py-1 shadow-lg"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 16px var(--color-shadow)',
                  }}
                >
                  {note.isTrashed ? (
                    <button
                      onClick={() => {
                        restoreNote(note.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm nv-transition flex items-center gap-2"
                      style={{ color: 'var(--color-text-primary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'var(--color-bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      🔄 恢复笔记
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        moveToTrash(note.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm nv-transition flex items-center gap-2"
                      style={{ color: 'var(--color-danger)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'var(--color-bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      🗑️ 删除笔记
                    </button>
                  )}
                  <button
                    className="w-full text-left px-3 py-2 text-sm nv-transition flex items-center gap-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        'var(--color-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    🔗 分享
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm nv-transition flex items-center gap-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        'var(--color-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    📜 历史版本
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Title + TipTap Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Title */}
        <div className="px-6 pt-4 flex-shrink-0">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="无标题"
            className="w-full text-2xl font-bold bg-transparent outline-none placeholder:opacity-30"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        {/* Trashed notice */}
        {note.isTrashed && (
          <div
            className="mx-6 mt-2 px-4 py-2 rounded-lg text-sm flex items-center gap-2 flex-shrink-0"
            style={{
              background: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
            }}
          >
            <span>⚠️</span>
            <span>此笔记在回收站中</span>
            <button
              onClick={() => restoreNote(note.id)}
              className="ml-auto text-xs underline opacity-80 hover:opacity-100"
            >
              恢复
            </button>
          </div>
        )}

        {/* TipTap Editor — fills remaining space */}
        <div className="flex-1 min-h-0 mt-1">
          <TipTapEditor
            content={note.content}
            onUpdate={handleEditorUpdate}
          />
        </div>

        {/* Back links */}
        <div
          className="mx-6 mb-4 p-4 rounded-lg flex-shrink-0"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4
            className="text-xs font-semibold mb-3 flex items-center gap-1.5"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            🔗 反向链接 ({BACK_LINKS.length})
          </h4>
          <div className="flex flex-col gap-2">
            {BACK_LINKS.map((bl) => (
              <div
                key={bl.id}
                className="px-3 py-2 rounded-md cursor-pointer nv-transition"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-light)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-hover)';
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-card)';
                  e.currentTarget.style.borderColor =
                    'var(--color-border-light)';
                }}
              >
                <p
                  className="text-xs font-medium mb-0.5"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {bl.title}
                </p>
                <p
                  className="text-[11px] truncate"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {bl.excerpt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between px-6 py-2 flex-shrink-0 text-[11px]"
        style={{
          borderTop: '1px solid var(--color-border)',
          color: 'var(--color-text-tertiary)',
        }}
      >
        <div className="flex items-center gap-4">
          <span>{wordCount} 字</span>
          <span className="flex items-center gap-1">
            {saveStatus === 'saved' && (
              <>
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: 'var(--color-success)' }}
                />
                已保存
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
                  style={{ background: 'var(--color-accent)' }}
                />
                保存中...
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: 'var(--color-star)' }}
                />
                未保存
              </>
            )}
          </span>
        </div>
        <span>最后编辑：{formatDateTime(note.updatedAt)}</span>
      </div>
    </main>
  );
}

/* ============================================================
   EditorPanel — outer wrapper
   ============================================================ */

export function EditorPanel() {
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const notes = useNoteStore((s) => s.notes);
  const folders = useNoteStore((s) => s.folders);
  const tags = useNoteStore((s) => s.tags);
  const moveToTrash = useNoteStore((s) => s.moveToTrash);
  const restoreNote = useNoteStore((s) => s.restoreNote);
  const toggleStar = useNoteStore((s) => s.toggleStar);

  const note = activeNoteId ? notes.find((n) => n.id === activeNoteId) : null;

  if (!note) {
    return (
      <main className="hidden md:flex flex-1 flex-col items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-bg-tertiary)' }}
          >
            <span className="text-3xl">📝</span>
          </div>
          <h2
            className="text-lg font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            选择笔记开始编辑
          </h2>
          <p
            className="text-sm text-center max-w-xs"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            从左侧列表选择一条笔记，或点击 &quot;新建笔记&quot; 开始创作
          </p>
        </div>
      </main>
    );
  }

  return (
    <NoteEditor
      key={note.id}
      note={note}
      folders={folders}
      tags={tags}
      moveToTrash={moveToTrash}
      restoreNote={restoreNote}
      toggleStar={toggleStar}
    />
  );
}
