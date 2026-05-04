'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Typography } from '@tiptap/extension-typography';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { CharacterCount } from '@tiptap/extension-character-count';
import { createLowlight } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { useCallback, useEffect, useState } from 'react';

import { Toolbar } from './Toolbar';
import { SlashCommandMenu, useSlashCommand } from './SlashCommand';
import './editor.css';

// Import KaTeX CSS
import 'katex/dist/katex.min.css';

const lowlight = createLowlight();

/* ============================================================
   Markdown ↔ HTML converters (simple)
   ============================================================ */

function markdownToHtml(md: string): string {
  let html = md
    // Code blocks (must be first)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold + Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr>')
    // Unordered list
    .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
    // Task list
    .replace(/^- \[x\] (.+)$/gm, '<li data-checked="true"><p>$1</p></li>')
    .replace(/^- \[ \] (.+)$/gm, '<li data-checked="false"><p>$1</p></li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return `<p>${html}</p>`;
}

function htmlToMarkdown(html: string): string {
  let md = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n')
    .replace(/<hr\s*\/?>/gi, '---\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

  return md;
}

/* ============================================================
   TipTapEditor Props
   ============================================================ */

interface TipTapEditorProps {
  content: string;
  onUpdate?: (html: string, text: string, wordCount: number) => void;
  placeholder?: string;
  editable?: boolean;
}

/* ============================================================
   TipTapEditor Component
   ============================================================ */

export function TipTapEditor({
  content,
  onUpdate,
  placeholder = '开始书写... 输入 / 弹出命令菜单',
  editable = true,
}: TipTapEditorProps) {
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');

  // Create editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false, // Replaced by CodeBlockLowlight
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: { class: 'editor-image' },
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder }),
      Typography,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: false }),
      CharacterCount,
    ],
    content: content || '<p></p>',
    editable,
    editorProps: {
      attributes: {
        class: 'prose-editor',
      },
    },
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        const html = editor.getHTML();
        const text = editor.getText();
        // Count words (Chinese + English)
        const wordCount = text
          .replace(/\s/g, '')
          .replace(/[\u4e00-\u9fa5]/g, (c) => c + ' ') // each CJK char = 1 word
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;
        onUpdate(html, text, wordCount);
      }
    },
  });

  // Slash command hook
  const { isOpen: isSlashOpen, query: slashQuery, close: closeSlash } = useSlashCommand(editor);

  // Sync content from props (when note changes)
  useEffect(() => {
    if (editor && content && !editor.isFocused) {
      const currentHtml = editor.getHTML();
      if (currentHtml !== content && content !== '<p></p>') {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  // Toggle mode
  const toggleMode = useCallback(() => {
    if (isMarkdownMode) {
      // Markdown → WYSIWYG: convert markdown to HTML and set content
      if (editor && markdownContent) {
        const html = markdownToHtml(markdownContent);
        editor.commands.setContent(html);
      }
      setIsMarkdownMode(false);
    } else {
      // WYSIWYG → Markdown: convert HTML to markdown
      if (editor) {
        const html = editor.getHTML();
        const md = htmlToMarkdown(html);
        setMarkdownContent(md);
      }
      setIsMarkdownMode(true);
    }
  }, [isMarkdownMode, editor, markdownContent]);

  return (
    <div className="tiptap-editor flex flex-col h-full">
      {/* Toolbar (only in WYSIWYG mode) */}
      <Toolbar
        editor={editor}
        onToggleMode={toggleMode}
        isMarkdownMode={isMarkdownMode}
      />

      {/* Markdown mode toolbar */}
      {isMarkdownMode && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0"
          style={{
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{
              background: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
            }}
          >
            Markdown
          </span>
          <div className="flex-1" />
          <button
            onClick={toggleMode}
            className="text-xs px-2 py-1 rounded-md transition-colors"
            style={{
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            切换到富文本
          </button>
        </div>
      )}

      {/* Editor content area */}
      <div className="flex-1 overflow-y-auto nv-scrollbar px-6 py-4">
        {isMarkdownMode ? (
          <textarea
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            className="markdown-source-editor"
            placeholder="# 标题&#10;&#10;在这里编写 Markdown..."
          />
        ) : (
          <>
            <EditorContent editor={editor} />
            {/* Slash command menu */}
            <SlashCommandMenu
              editor={editor!}
              isOpen={isSlashOpen}
              onClose={closeSlash}
              query={slashQuery}
            />
          </>
        )}
      </div>
    </div>
  );
}
