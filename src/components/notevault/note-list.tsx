'use client';

import { useNoteStore, type Note } from '@/stores/note-store';
import { useState } from 'react';

/* ============================================================
   Helpers
   ============================================================ */

function relativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  const date = new Date(isoString);
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return date.getFullYear() === new Date().getFullYear()
    ? `${m}月${d}日`
    : `${date.getFullYear()}年${m}月${d}日`;
}

/* ============================================================
   NoteCard
   ============================================================ */

function NoteCard({ note }: { note: Note }) {
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const setActiveNote = useNoteStore((s) => s.setActiveNote);
  const toggleStar = useNoteStore((s) => s.toggleStar);
  const tags = useNoteStore((s) => s.tags);

  const isActive = activeNoteId === note.id;

  return (
    <div
      onClick={() => setActiveNote(note.id)}
      className="group px-3 py-3 rounded-lg cursor-pointer nv-transition"
      style={{
        background: isActive
          ? 'var(--color-bg-active)'
          : 'var(--color-bg-card)',
        borderLeft: isActive
          ? '3px solid var(--color-accent)'
          : '3px solid transparent',
        marginBottom: '4px',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--color-bg-hover)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 2px 8px var(--color-shadow)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--color-bg-card)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Title row */}
      <div className="flex items-start gap-2 mb-1">
        <h3
          className="flex-1 text-sm font-semibold truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {note.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(note.id);
          }}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 nv-transition"
          style={{ color: note.isStarred ? 'var(--color-star)' : 'var(--color-text-tertiary)' }}
          aria-label={note.isStarred ? '取消收藏' : '收藏'}
        >
          <span className="text-xs">
            {note.isStarred ? '★' : '☆'}
          </span>
        </button>
      </div>

      {/* Always show star if starred */}
      {note.isStarred && (
        <div className="absolute top-3 right-3 text-xs" style={{ color: 'var(--color-star)' }}>
          ★
        </div>
      )}

      {/* Content preview */}
      <p
        className="text-xs leading-relaxed mb-2"
        style={{
          color: 'var(--color-text-secondary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {note.content}
      </p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {note.tags.slice(0, 3).map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <span
                key={tag.id}
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: tag.color + '18',
                  color: tag.color,
                }}
              >
                {tag.name}
              </span>
            );
          })}
          {note.tags.length > 3 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-tertiary)',
              }}
            >
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px]"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {relativeTime(note.updatedAt)}
        </span>
        <span
          className="text-[10px]"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {note.wordCount} 字
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   NoteList
   ============================================================ */

export function NoteList() {
  const filteredNotes = useNoteStore((s) => s.filteredNotes());
  const activeFolder = useNoteStore((s) => s.activeFolder);
  const folders = useNoteStore((s) => s.folders);
  const sidebarCollapsed = useNoteStore((s) => s.sidebarCollapsed);
  const setSidebarMobileOpen = useNoteStore((s) => s.setSidebarMobileOpen);

  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'words'>('updated');

  const currentFolder = folders.find((f) => f.id === activeFolder) ?? {
    name: '全部笔记',
    icon: '📝',
  };

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title, 'zh-CN');
    if (sortBy === 'words') return b.wordCount - a.wordCount;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <aside
      className="hidden md:flex flex-col flex-shrink-0 h-full"
      style={{
        width: 'var(--list-width)',
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-bg-primary)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: 'var(--color-bg-hover)' }}
            onClick={() => setSidebarMobileOpen(true)}
            aria-label="打开侧边栏"
          >
            <span className="text-sm">☰</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base">{currentFolder.icon}</span>
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {currentFolder.name}
            </h2>
          </div>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            {filteredNotes.length}
          </span>
        </div>

        {/* New Note button */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium nv-transition"
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-accent-foreground)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.85';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <span className="text-sm">+</span>
          新建笔记
        </button>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-1 px-4 pb-2">
        {[
          { key: 'updated' as const, label: '最近更新' },
          { key: 'title' as const, label: '标题' },
          { key: 'words' as const, label: '字数' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            className="px-2 py-1 rounded text-[11px] nv-transition"
            style={{
              color:
                sortBy === s.key
                  ? 'var(--color-accent)'
                  : 'var(--color-text-tertiary)',
              background:
                sortBy === s.key ? 'var(--color-accent-light)' : 'transparent',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Note list */}
      <div
        className="flex-1 overflow-y-auto nv-scrollbar px-2 pb-4"
      >
        {sortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-2xl opacity-40">📭</span>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              暂无笔记
            </p>
          </div>
        ) : (
          sortedNotes.map((note) => <NoteCard key={note.id} note={note} />)
        )}
      </div>
    </aside>
  );
}
