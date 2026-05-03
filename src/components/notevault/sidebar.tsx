'use client';

import { useNoteStore } from '@/stores/note-store';
import { ThemeSwitcher } from '@/components/theme-switcher';

export function Sidebar() {
  const {
    folders,
    tags,
    notes,
    activeFolder,
    searchQuery,
    sidebarCollapsed,
    sidebarMobileOpen,
    setActiveFolder,
    setSearchQuery,
    toggleSidebar,
    toggleTag,
    setSidebarMobileOpen,
  } = useNoteStore();

  const activeNotesCount = useNoteStore((s) => s.filteredNotes().length);
  const totalNotes = notes.filter((n) => !n.isTrashed).length;

  const selectedTags = useNoteStore((s) => s.selectedTags);

  const systemFolders = folders.filter((f) => f.type === 'system');
  const customFolders = folders.filter((f) => f.type === 'custom');

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'var(--color-bg-overlay)' }}
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full flex flex-col nv-transition-shrink-0
          ${sidebarCollapsed ? 'md:w-0 md:overflow-hidden md:opacity-0' : 'md:w-[var(--sidebar-width)]'}
          ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          transition-all duration-200 ease-in-out
        `}
        style={{
          background: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          {!sidebarCollapsed && (
            <h1
              className="text-lg font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              📦 NoteVault
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-8 h-8 rounded-lg nv-transition hover:opacity-80"
            style={{ background: 'var(--color-bg-hover)' }}
            aria-label={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            <span className="text-sm">{sidebarCollapsed ? '→' : '←'}</span>
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            {/* Search */}
            <div className="px-3 pb-3">
              <input
                type="text"
                placeholder="搜索笔记..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none nv-transition"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto nv-scrollbar px-2">
              {/* System Folders */}
              <div className="mb-4">
                <div
                  className="px-2 py-1 text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  文件夹
                </div>
                {systemFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setActiveFolder(folder.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm nv-transition text-left"
                    style={{
                      background:
                        activeFolder === folder.id
                          ? 'var(--color-bg-active)'
                          : 'transparent',
                      color:
                        activeFolder === folder.id
                          ? 'var(--color-text-primary)'
                          : 'var(--color-text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      if (activeFolder !== folder.id)
                        e.currentTarget.style.background =
                          'var(--color-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (activeFolder !== folder.id)
                        e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span className="text-base flex-shrink-0">{folder.icon}</span>
                    <span className="flex-1 truncate">{folder.name}</span>
                    <span
                      className="text-xs tabular-nums"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {folder.id === 'all'
                        ? totalNotes
                        : folder.id === 'favorites'
                        ? notes.filter((n) => n.isStarred && !n.isTrashed).length
                        : notes.filter(
                            (n) =>
                              n.folderId === folder.id && !n.isTrashed
                          ).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Folders */}
              <div className="mb-4">
                <div
                  className="px-2 py-1 text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  自定义
                </div>
                {customFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setActiveFolder(folder.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm nv-transition text-left"
                    style={{
                      background:
                        activeFolder === folder.id
                          ? 'var(--color-bg-active)'
                          : 'transparent',
                      color:
                        activeFolder === folder.id
                          ? 'var(--color-text-primary)'
                          : 'var(--color-text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      if (activeFolder !== folder.id)
                        e.currentTarget.style.background =
                          'var(--color-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (activeFolder !== folder.id)
                        e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span className="text-base flex-shrink-0">{folder.icon}</span>
                    <span className="flex-1 truncate">{folder.name}</span>
                    <span
                      className="text-xs tabular-nums"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {notes.filter(
                        (n) => n.folderId === folder.id && !n.isTrashed
                      ).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tags */}
              <div className="mb-4">
                <div
                  className="px-2 py-1 text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  标签
                </div>
                {tags.map((tag) => {
                  const tagNoteCount = notes.filter(
                    (n) => n.tags.includes(tag.id) && !n.isTrashed
                  ).length;
                  const isSelected = selectedTags.includes(tag.id);

                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm nv-transition text-left"
                      style={{
                        background: isSelected
                          ? 'var(--color-bg-active)'
                          : 'transparent',
                        color: isSelected
                          ? 'var(--color-text-primary)'
                          : 'var(--color-text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background =
                            'var(--color-bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: tag.color }}
                      />
                      <span className="flex-1 truncate">{tag.name}</span>
                      <span
                        className="text-xs tabular-nums"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        {tagNoteCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div
              className="p-3 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <span
                className="text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                共 {totalNotes} 条笔记
              </span>
              <ThemeSwitcher />
            </div>
          </>
        )}

        {/* Collapsed state: just expand button visible */}
        {sidebarCollapsed && (
          <div className="flex flex-col items-center pt-4">
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-8 h-8 rounded-lg nv-transition hover:opacity-80"
              style={{ background: 'var(--color-bg-hover)' }}
              aria-label="展开侧边栏"
            >
              <span className="text-sm">→</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
