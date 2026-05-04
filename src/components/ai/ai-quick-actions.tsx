'use client';

import { PenLine, FileText, Sparkles, Languages } from 'lucide-react';

interface AIQuickActionsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

const ACTIONS = [
  {
    id: 'continue',
    label: '续写',
    icon: PenLine,
    buildPrompt: (text: string) => `请续写以下内容，保持相同的风格和语调：\n\n${text}`,
  },
  {
    id: 'summary',
    label: '摘要',
    icon: FileText,
    buildPrompt: (text: string) => `请总结以下内容的要点，使用清晰的列表形式：\n\n${text}`,
  },
  {
    id: 'polish',
    label: '润色',
    icon: Sparkles,
    buildPrompt: (text: string) => `请润色以下文本，使其更加流畅专业，保持原意不变：\n\n${text}`,
  },
  {
    id: 'translate',
    label: '翻译',
    icon: Languages,
    buildPrompt: (text: string) => `请将以下内容翻译为英文，保持原文的语义和风格：\n\n${text}`,
  },
];

export function AIQuickActions({ onAction, disabled }: AIQuickActionsProps) {
  const handleAction = (action: (typeof ACTIONS)[number]) => {
    // Try to get selected text from the editor textarea
    const selection = window.getSelection()?.toString();
    let content = selection || '';

    // Fallback: try to get content from the editor textarea
    if (!content) {
      const textareas = document.querySelectorAll('textarea');
      for (const ta of textareas) {
        if (ta.value && ta.closest('main')) {
          content =
            ta.value.substring(
              ta.selectionStart,
              ta.selectionEnd
            ) || ta.value.slice(0, 500);
          break;
        }
      }
    }

    // Final fallback: get first 500 chars of any textarea
    if (!content) {
      const textareas = document.querySelectorAll('textarea');
      for (const ta of textareas) {
        if (ta.value) {
          content = ta.value.slice(0, 500);
          break;
        }
      }
    }

    if (!content.trim()) {
      onAction(action.buildPrompt('（未找到可操作的内容）'));
      return;
    }

    // Limit to 500 characters
    const trimmed = content.length > 500 ? content.slice(0, 500) + '...' : content;
    onAction(action.buildPrompt(trimmed));
  };

  return (
    <div
      className="flex items-center gap-1 flex-shrink-0"
      style={{
        padding: '0 4px',
      }}
    >
      {ACTIONS.map((action) => (
        <button
          key={action.id}
          onClick={() => handleAction(action)}
          disabled={disabled}
          title={action.label}
          className="flex items-center gap-1 px-2 py-1 rounded-lg nv-transition text-xs"
          style={{
            background: 'var(--color-bg-tertiary)',
            color: disabled
              ? 'var(--color-text-tertiary)'
              : 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.background = 'var(--color-accent-light)';
              e.currentTarget.style.color = 'var(--color-accent)';
              e.currentTarget.style.borderColor = 'var(--color-accent)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-tertiary)';
            e.currentTarget.style.color = disabled
              ? 'var(--color-text-tertiary)'
              : 'var(--color-text-secondary)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <action.icon size={12} />
          {action.label}
        </button>
      ))}
    </div>
  );
}
