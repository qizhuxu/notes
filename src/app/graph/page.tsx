'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, RotateCcw, X, Info } from 'lucide-react';
import { KnowledgeGraph } from '@/components/graph/KnowledgeGraph';
import { useNoteStore } from '@/stores/note-store';

export default function GraphPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const notes = useNoteStore((s) => s.notes);
  const getLinkedNotes = useNoteStore((s) => s.getLinkedNotes);
  const folders = useNoteStore((s) => s.folders);
  const setActiveNote = useNoteStore((s) => s.setActiveNote);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const linkedNotes = selectedNoteId ? getLinkedNotes(selectedNoteId) : null;

  const handleNodeClick = useCallback((noteId: string) => {
    setSelectedNoteId(noteId);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleBack = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleNoteSelect = useCallback(
    (noteId: string) => {
      setActiveNote(noteId);
      router.push('/');
    },
    [setActiveNote, router]
  );

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Top toolbar */}
      <header
        className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
        style={{
          background: 'var(--color-bg-secondary)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm nv-transition"
          style={{
            color: 'var(--color-text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-hover)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          aria-label="返回笔记列表"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">返回</span>
        </button>

        {/* Title */}
        <h2 className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--color-text-primary)' }}>
          🗺️ 知识图谱
        </h2>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-tertiary)' }}
          />
          <input
            type="text"
            placeholder="搜索节点..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 text-sm rounded-lg outline-none nv-transition"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="flex items-center justify-center w-8 h-8 rounded-lg nv-transition"
          style={{
            color: 'var(--color-text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-hover)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          title="刷新布局"
          aria-label="刷新图谱布局"
        >
          <RotateCcw size={16} />
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Graph area */}
        <div className="flex-1 relative">
          <KnowledgeGraph
            key={refreshKey}
            highlightNodeId={null}
            onNodeClick={handleNodeClick}
            searchQuery={searchQuery}
          />

          {/* Help hint */}
          <div
            className="absolute bottom-4 left-4 px-3 py-2 rounded-lg text-xs flex items-center gap-2"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-tertiary)',
              boxShadow: '0 2px 8px var(--color-shadow)',
            }}
          >
            <Info size={12} />
            <span>拖拽节点 · 滚轮缩放 · 双击空白重置</span>
          </div>
        </div>

        {/* Info panel */}
        {selectedNote && linkedNotes && (
          <aside
            className="w-72 flex-shrink-0 flex flex-col overflow-hidden"
            style={{
              background: 'var(--color-bg-secondary)',
              borderLeft: '1px solid var(--color-border)',
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <span className="text-sm font-semibold">笔记详情</span>
              <button
                onClick={() => setSelectedNoteId(null)}
                className="flex items-center justify-center w-6 h-6 rounded"
                style={{ color: 'var(--color-text-tertiary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                aria-label="关闭详情面板"
              >
                <X size={14} />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto nv-scrollbar p-4">
              {/* Note title */}
              <h3
                className="text-sm font-semibold mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {selectedNote.title}
              </h3>

              {/* Folder */}
              <div
                className="text-xs mb-3 flex items-center gap-1"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                <span>
                  {folders.find((f) => f.id === selectedNote.folderId)?.icon ?? '📄'}
                </span>
                <span>
                  {folders.find((f) => f.id === selectedNote.folderId)?.name ?? '未分类'}
                </span>
              </div>

              {/* Open note button */}
              <button
                onClick={() => handleNoteSelect(selectedNote.id)}
                className="w-full py-2 px-3 rounded-lg text-xs font-medium mb-4 nv-transition"
                style={{
                  background: 'var(--color-accent)',
                  color: 'var(--color-accent-foreground)',
                }}
              >
                打开笔记
              </button>

              {/* Outbound links */}
              {linkedNotes.outbound.length > 0 && (
                <div className="mb-4">
                  <div
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    引用 →
                  </div>
                  <div className="space-y-1">
                    {linkedNotes.outbound.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => setSelectedNoteId(note.id)}
                        className="w-full text-left px-2.5 py-1.5 rounded text-xs nv-transition"
                        style={{
                          color: 'var(--color-text-secondary)',
                          background: 'transparent',
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
                        <span className="block truncate">{note.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inbound links */}
              {linkedNotes.inbound.length > 0 && (
                <div className="mb-4">
                  <div
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    ← 被引用
                  </div>
                  <div className="space-y-1">
                    {linkedNotes.inbound.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => setSelectedNoteId(note.id)}
                        className="w-full text-left px-2.5 py-1.5 rounded text-xs nv-transition"
                        style={{
                          color: 'var(--color-text-secondary)',
                          background: 'transparent',
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
                        <span className="block truncate">{note.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No links message */}
              {linkedNotes.outbound.length === 0 && linkedNotes.inbound.length === 0 && (
                <div
                  className="text-xs text-center py-4"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  暂无双向链接
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
