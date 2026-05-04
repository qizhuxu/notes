'use client';

import { useNoteStore } from '@/stores/note-store';
import { useRef, useEffect, useMemo } from 'react';

/* ============================================================
   RightPanel — rendered preview of the active note
   ============================================================ */

export function RightPanel() {
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const notes = useNoteStore((s) => s.notes);
  const showPreview = useNoteStore((s) => s.showPreview);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);

  const note = activeNoteId ? notes.find((n) => n.id === activeNoteId) : null;
  const htmlContent = note?.contentHtml || note?.content || '';

  // Extract headings for Table of Contents
  const headings = useMemo(() => {
    if (!htmlContent) return [];
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;
    const els = temp.querySelectorAll('h1, h2, h3');
    return Array.from(els).map((el, i) => ({
      id: `heading-${i}`,
      text: el.textContent || '',
      level: parseInt(el.tagName[1]),
    }));
  }, [htmlContent]);

  // Inject IDs into headings after render
  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current.querySelector('.preview-content');
    if (!container) return;
    const headingEls = container.querySelectorAll('h1, h2, h3');
    headingEls.forEach((el, i) => {
      el.id = `heading-${i}`;
    });
  }, [htmlContent]);

  if (!showPreview) return null;

  if (!note) {
    return (
      <aside
        className="hidden lg:flex flex-col w-[380px] xl:w-[440px] h-full flex-shrink-0"
        style={{
          borderLeft: '1px solid var(--color-border)',
          background: 'var(--color-bg-primary)',
        }}
      >
        <div className="flex-1 flex items-center justify-center">
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            选择笔记以预览
          </p>
        </div>
      </aside>
    );
  }

  const handleTocClick = (id: string) => {
    const el = scrollRef.current?.querySelector(`#${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside
      className="hidden lg:flex flex-col w-[380px] xl:w-[440px] h-full flex-shrink-0"
      style={{
        borderLeft: '1px solid var(--color-border)',
        background: 'var(--color-bg-primary)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            预览
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            只读
          </span>
        </div>
        {headings.length > 0 && (
          <button
            onClick={() => {
              if (tocRef.current) {
                tocRef.current.classList.toggle('hidden');
              }
            }}
            className="text-xs px-2 py-1 rounded-md nv-transition"
            style={{ color: 'var(--color-text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            目录
          </button>
        )}
      </div>

      {/* Table of Contents (collapsible) */}
      <div
        ref={tocRef}
        className="hidden px-4 py-2 flex-shrink-0"
        style={{
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
        }}
      >
        <div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto nv-scrollbar">
          {headings.map((h) => (
            <button
              key={h.id}
              onClick={() => handleTocClick(h.id)}
              className="text-left text-xs truncate rounded px-2 py-1 nv-transition"
              style={{
                color: 'var(--color-text-secondary)',
                paddingLeft: `${(h.level - 1) * 12 + 8}px`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-hover)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              {h.text}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto nv-scrollbar"
      >
        <div className="preview-content px-6 py-5">
          {/* Title */}
          <h1
            className="text-xl font-bold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {note.title}
          </h1>

          {/* Metadata */}
          <div
            className="flex items-center gap-3 mb-5 pb-4 text-[11px]"
            style={{
              borderBottom: '1px solid var(--color-border-light)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            <span>{note.wordCount} 字</span>
            <span>
              {new Date(note.updatedAt).toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {note.isStarred && (
              <span style={{ color: 'var(--color-star)' }}>★ 已收藏</span>
            )}
          </div>

          {/* HTML Content */}
          <div
            className="prose-preview"
            style={{ color: 'var(--color-text-primary)' }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Empty state */}
          {!htmlContent.trim() && (
            <div className="flex flex-col items-center gap-2 py-12">
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                暂无内容
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--color-text-quaternary)' }}
              >
                在左侧编辑器中开始书写
              </p>
            </div>
          )}

          {/* Back Links section */}
          <BackLinks noteId={note.id} />
        </div>
      </div>
    </aside>
  );
}

/* ============================================================
   BackLinks
   ============================================================ */

function BackLinks({ noteId }: { noteId: string }) {
  const { inbound } = useNoteStore((s) => s.getLinkedNotes(noteId));
  const setActiveNote = useNoteStore((s) => s.setActiveNote);

  if (inbound.length === 0) return null;

  return (
    <div
      className="mt-6 pt-4"
      style={{ borderTop: '1px solid var(--color-border-light)' }}
    >
      <h4
        className="text-xs font-semibold mb-3 flex items-center gap-1.5"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        🔗 反向链接 ({inbound.length})
      </h4>
      <div className="flex flex-col gap-2">
        {inbound.map((n) => (
          <button
            key={n.id}
            onClick={() => setActiveNote(n.id)}
            className="text-left px-3 py-2 rounded-lg nv-transition"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-light)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-light)';
              e.currentTarget.style.background = 'var(--color-bg-secondary)';
            }}
          >
            <p
              className="text-xs font-medium mb-0.5"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {n.title}
            </p>
            <p
              className="text-[11px] line-clamp-2"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {n.content.slice(0, 80)}...
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
