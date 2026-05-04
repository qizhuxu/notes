'use client';

import { Sidebar } from './sidebar';
import { NoteList } from './note-list';
import { EditorPanel } from './editor-panel';
import { useNoteStore } from '@/stores/note-store';
import { AISidebar } from '@/components/ai/ai-sidebar';
import { useEffect } from 'react';
import { useAIStore } from '@/stores/ai-store';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export function AppLayout() {
  const sidebarCollapsed = useNoteStore((s) => s.sidebarCollapsed);

  // Register global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <Sidebar />
      <NoteList />
      <EditorPanel />
      <AISidebar />

      {/* Mobile navigation */}
      <MobileNav />
    </div>
  );
}

/* ============================================================
   Mobile bottom navigation (shown on small screens)
   ============================================================ */

function MobileNav() {
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const setSidebarMobileOpen = useNoteStore((s) => s.setSidebarMobileOpen);
  const setActiveNote = useNoteStore((s) => s.setActiveNote);

  // Show mobile nav only when on small screens
  // We use a fixed bottom bar that lets users toggle between sidebar / list / editor
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-around py-2"
      style={{
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <button
        onClick={() => setSidebarMobileOpen(true)}
        className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg nv-transition"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <span className="text-base">📁</span>
        <span className="text-[10px]">文件夹</span>
      </button>

      <button
        onClick={() => {
          setSidebarMobileOpen(false);
          if (activeNoteId) setActiveNote(null);
        }}
        className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg nv-transition"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <span className="text-base">📋</span>
        <span className="text-[10px]">笔记列表</span>
      </button>

      <button
        className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg nv-transition"
        style={{
          color: activeNoteId
            ? 'var(--color-accent)'
            : 'var(--color-text-tertiary)',
        }}
        disabled={!activeNoteId}
      >
        <span className="text-base">✏️</span>
        <span className="text-[10px]">编辑</span>
      </button>
    </nav>
  );
}
