'use client';

import { useEffect, useCallback } from 'react';
import { useAIStore } from '@/stores/ai-store';
import { useNoteStore } from '@/stores/note-store';
import { useThemeStore } from '@/stores/theme-store';
import { useRouter } from 'next/navigation';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const toggleAISidebar = useAIStore((s) => s.toggleSidebar);
  const setSearchQuery = useNoteStore((s) => s.setSearchQuery);
  const createNote = useNoteStore((s) => s.createNote);
  const toggleMode = useThemeStore((s) => s.toggleMode);

  const focusSearch = useCallback(() => {
    // Find the search input in the sidebar and focus it
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[placeholder="搜索笔记..."]'
    );
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  const openSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'j',
      ctrlKey: true,
      description: '切换 AI 侧边栏',
      action: toggleAISidebar,
    },
    {
      key: 'k',
      ctrlKey: true,
      description: '聚焦搜索框',
      action: focusSearch,
    },
    {
      key: 'n',
      ctrlKey: true,
      description: '新建笔记',
      action: () => {
        const newId = createNote();
        // Clear search when creating a note
        setSearchQuery('');
      },
    },
    {
      key: ',',
      ctrlKey: true,
      description: '打开设置',
      action: openSettings,
    },
    {
      key: 't',
      ctrlKey: true,
      shiftKey: true,
      description: '切换主题亮/暗模式',
      action: toggleMode,
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip when typing in input/textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;

        if (e.key === shortcut.key && ctrlMatch && shiftMatch) {
          // Allow Ctrl+K to work even when in an input (to focus search)
          if (isInput && !(shortcut.key === 'k' && shortcut.ctrlKey)) {
            continue;
          }
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return shortcuts;
}

// Export shortcut list for display in settings
export const SHORTCUT_LIST = [
  {
    name: 'AI 助手',
    keys: ['Ctrl', 'J'],
    description: '打开/关闭 AI 助手侧边栏',
  },
  {
    name: '搜索',
    keys: ['Ctrl', 'K'],
    description: '聚焦到搜索输入框',
  },
  {
    name: '新建笔记',
    keys: ['Ctrl', 'N'],
    description: '快速创建一条新笔记',
  },
  {
    name: '设置',
    keys: ['Ctrl', ','],
    description: '打开设置页面',
  },
  {
    name: '切换主题',
    keys: ['Ctrl', 'Shift', 'T'],
    description: '在亮色/暗色模式之间切换',
  },
];
