'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';

/* ============================================================
   Slash command definitions
   ============================================================ */

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (editor: Editor) => void;
  category?: string;
}

export const SLASH_COMMANDS: SlashCommandItem[] = [
  // Headings
  { title: '标题 1', description: '大标题', icon: 'H1', command: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { title: '标题 2', description: '中标题', icon: 'H2', command: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { title: '标题 3', description: '小标题', icon: 'H3', command: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },

  // Text formatting
  { title: '粗体', description: '加粗文字', icon: 'B', command: (e) => e.chain().focus().toggleBold().run() },
  { title: '斜体', description: '斜体文字', icon: 'I', command: (e) => e.chain().focus().toggleItalic().run() },
  { title: '下划线', description: '下划线文字', icon: 'U', command: (e) => e.chain().focus().toggleUnderline().run() },
  { title: '删除线', description: '划掉文字', icon: 'S', command: (e) => e.chain().focus().toggleStrike().run() },

  // Lists
  { title: '无序列表', description: '创建无序列表', icon: '\u2022', command: (e) => e.chain().focus().toggleBulletList().run() },
  { title: '有序列表', description: '创建有序列表', icon: '1.', command: (e) => e.chain().focus().toggleOrderedList().run() },
  { title: '待办事项', description: '创建任务清单', icon: '\u2611', command: (e) => e.chain().focus().toggleTaskList().run() },

  // Insert
  { title: '引用', description: '插入引用块', icon: '\u275D', command: (e) => e.chain().focus().toggleBlockquote().run() },
  { title: '代码块', description: '插入代码块', icon: '</>', command: (e) => e.chain().focus().toggleCodeBlock().run() },
  { title: '分割线', description: '插入水平线', icon: '\u2500', command: (e) => e.chain().focus().setHorizontalRule().run() },
  { title: '链接', description: '插入链接', icon: '\u{1F517}', command: (e) => {
    const url = window.prompt('输入 URL:');
    if (url) e.chain().focus().setLink({ href: url }).run();
  }},
  { title: '表格', description: '插入 3x3 表格', icon: '\u2637', command: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },

  // Text alignment
  { title: '居中对齐', description: '文字居中', icon: '\u{1F53C}', command: (e) => e.chain().focus().setTextAlign('center').run() },

  // AI commands
  { title: 'AI 续写', description: '让 AI 继续写作', icon: '\u2728', command: () => { /* AI integration placeholder */ } },
  { title: 'AI 摘要', description: '让 AI 生成摘要', icon: '\u{1F4DD}', command: () => { /* AI integration placeholder */ } },
  { title: 'AI 润色', description: '让 AI 润色文字', icon: '\u{1F48E}', command: () => { /* AI integration placeholder */ } },
];

/* ============================================================
   Slash Command Menu Component
   ============================================================ */

interface SlashCommandMenuProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  query: string;
}

export function SlashCommandMenu({ editor, isOpen, onClose, query }: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);

  const filteredItems = SLASH_COMMANDS.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  // Reset selection when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Position menu near cursor
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const { from } = editor.state.selection;
    const coords = editor.view.coordsAtPos(from);

    const editorRect = editor.view.dom.parentElement?.getBoundingClientRect();
    if (editorRect) {
      setMenuStyle({
        position: 'fixed',
        top: `${coords.bottom + 8}px`,
        left: `${Math.min(coords.left, editorRect.right - 260)}px`,
        zIndex: 100,
      });
    }
  }, [isOpen, editor]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].command(editor);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, editor, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    itemsRef.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  if (!isOpen || filteredItems.length === 0) return null;

  return (
    <div ref={menuRef} className="slash-command-menu" style={menuStyle}>
      {filteredItems.map((item, index) => (
        <div
          key={item.title}
          ref={(el) => { if (el) itemsRef.current[index] = el; }}
          className={`slash-command-item ${index === selectedIndex ? 'is-selected' : ''}`}
          onMouseEnter={() => setSelectedIndex(index)}
          onMouseDown={(e) => {
            e.preventDefault();
            item.command(editor);
            onClose();
          }}
        >
          <div className="slash-command-icon">{item.icon}</div>
          <div className="slash-command-info">
            <span className="slash-command-label">{item.title}</span>
            <span className="slash-command-desc">{item.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Hook: useSlashCommand
   ============================================================ */

export function useSlashCommand(editor: Editor | null) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 32),
        from,
        '\n'
      );

      // Check if we're in a slash command
      const match = textBefore.match(/\/([^\s]*)$/);
      if (match) {
        setIsOpen(true);
        setQuery(match[1]);
      } else {
        close();
      }
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);
    editor.on('blur', close);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
      editor.off('blur', close);
    };
  }, [editor, close]);

  return { isOpen, query, close };
}
