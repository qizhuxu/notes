'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText } from 'lucide-react';
import { useNoteStore } from '@/stores/note-store';

// ============================================================
// Types
// ============================================================

interface WikiLinkSearchProps {
  /** Controlled open state */
  open: boolean;
  /** Callback when closed */
  onClose: () => void;
  /** Callback when a note is selected */
  onSelect: (noteId: string, noteTitle: string) => void;
  /** Position of the popup (anchor point) */
  anchorPosition?: { top: number; left: number };
}

// ============================================================
// Component
// ============================================================

export function WikiLinkSearch({
  open,
  onClose,
  onSelect,
  anchorPosition,
}: WikiLinkSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const notes = useNoteStore((s) => s.notes);
  const folders = useNoteStore((s) => s.folders);

  // Reset state when open changes (derived, not in effect)
  if (open && !prevOpen) {
    setQuery('');
    setSelectedIndex(0);
    setPrevOpen(open);
  } else if (!open && prevOpen) {
    setPrevOpen(open);
  }

  // Derive selected index from query (sync computation, not state-in-effect)
  const computedSelectedIndex = query === '' ? 0 : selectedIndex;

  // Focus input when opened (DOM side-effect, OK in effect)
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Filter notes based on query
  const filteredNotes = notes
    .filter((n) => !n.isTrashed)
    .filter((n) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return n.title.toLowerCase().includes(q);
    })
    .slice(0, 8);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredNotes.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredNotes[computedSelectedIndex]) {
            onSelect(filteredNotes[computedSelectedIndex].id, filteredNotes[computedSelectedIndex].title);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredNotes, computedSelectedIndex, onSelect, onClose]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.children[computedSelectedIndex] as HTMLElement;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [computedSelectedIndex]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className="fixed z-[101] w-72 rounded-xl overflow-hidden"
        style={{
          top: anchorPosition ? anchorPosition.top : '50%',
          left: anchorPosition ? anchorPosition.left : '50%',
          transform: anchorPosition ? 'translateY(4px)' : 'translate(-50%, -50%)',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 8px 32px var(--color-shadow), 0 2px 8px var(--color-shadow)',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2.5"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <Search size={14} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索笔记以插入链接..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            onClick={onClose}
            className="flex items-center justify-center w-5 h-5 rounded"
            style={{ color: 'var(--color-text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="关闭"
          >
            <X size={12} />
          </button>
        </div>

        {/* Results list */}
        <div ref={listRef} className="max-h-60 overflow-y-auto nv-scrollbar py-1">
          {filteredNotes.length === 0 ? (
            <div
              className="px-3 py-4 text-center text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              没有找到匹配的笔记
            </div>
          ) : (
            filteredNotes.map((note, index) => {
              const folder = folders.find((f) => f.id === note.folderId);
              const isSelected = index === computedSelectedIndex;

              return (
                <button
                  key={note.id}
                  onClick={() => onSelect(note.id, note.title)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm nv-transition"
                  style={{
                    background: isSelected
                      ? 'var(--color-bg-active)'
                      : 'transparent',
                    color: isSelected
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'var(--color-bg-hover)';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }
                    setSelectedIndex(index);
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }
                  }}
                >
                  <FileText
                    size={14}
                    style={{
                      color: isSelected
                        ? 'var(--color-accent)'
                        : 'var(--color-text-tertiary)',
                      flexShrink: 0,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{note.title}</div>
                  </div>
                  {folder && (
                    <span
                      className="text-[10px] flex-shrink-0"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {folder.icon}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div
          className="px-3 py-1.5 text-[10px] flex items-center justify-between"
          style={{
            borderTop: '1px solid var(--color-border)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          <span>
            <kbd
              className="px-1 py-0.5 rounded text-[10px]"
              style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
              }}
            >
              ↑↓
            </kbd>{' '}
            导航
          </span>
          <span>
            <kbd
              className="px-1 py-0.5 rounded text-[10px]"
              style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
              }}
            >
              ↵
            </kbd>{' '}
            选择
          </span>
          <span>
            <kbd
              className="px-1 py-0.5 rounded text-[10px]"
              style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
              }}
            >
              Esc
            </kbd>{' '}
            关闭
          </span>
        </div>
      </div>
    </>
  );
}

// ============================================================
// Demo / Standalone Preview
// ============================================================

export function WikiLinkSearchDemo() {
  const [open, setOpen] = useState(false);
  const [lastSelected, setLastSelected] = useState<string | null>(null);

  return (
    <div className="p-6">
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg text-sm font-medium"
        style={{
          background: 'var(--color-accent)',
          color: 'var(--color-accent-foreground)',
        }}
      >
        输入 [[ 打开 WikiLink 搜索
      </button>

      {lastSelected && (
        <div
          className="mt-3 px-3 py-2 rounded-lg text-sm"
          style={{
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-secondary)',
          }}
        >
          已选择: <strong>{lastSelected}</strong>
        </div>
      )}

      <WikiLinkSearch
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(id, title) => {
          setLastSelected(`[[${title}]] (ID: ${id})`);
          setOpen(false);
        }}
      />
    </div>
  );
}
