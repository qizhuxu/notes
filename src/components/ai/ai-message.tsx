'use client';

import { useCallback, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { AIMessage } from '@/stores/ai-store';

// ============================================================
// Simple Markdown Renderer
// ============================================================

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Pattern: bold (**...**), inline code (`...`), or plain text
  const regex = /(\*\*(.+?)\*\*)|(`([^`]+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Bold
      parts.push(
        <strong key={key++} style={{ fontWeight: 600 }}>
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Inline code
      parts.push(
        <code
          key={key++}
          style={{
            background: 'var(--color-bg-tertiary)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '0.85em',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {match[4]}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function parseMarkdown(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block (```lang ... ```)
    if (line.trimStart().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      nodes.push(
        <CodeBlock key={key++} language={lang} code={codeLines.join('\n')} />
      );
      continue;
    }

    // Unordered list (- item)
    if (line.trimStart().startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('- ')) {
        items.push(lines[i].trimStart().slice(2));
        i++;
      }
      nodes.push(
        <ul
          key={key++}
          style={{
            paddingLeft: '1.25rem',
            margin: '6px 0',
            listStyleType: 'disc',
          }}
        >
          {items.map((item, idx) => (
            <li
              key={idx}
              style={{ marginBottom: '3px' }}
            >
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list (1. item)
    if (/^\d+\.\s/.test(line.trimStart())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trimStart())) {
        items.push(lines[i].trimStart().replace(/^\d+\.\s/, ''));
        i++;
      }
      nodes.push(
        <ol
          key={key++}
          style={{
            paddingLeft: '1.25rem',
            margin: '6px 0',
            listStyleType: 'decimal',
          }}
        >
          {items.map((item, idx) => (
            <li
              key={idx}
              style={{ marginBottom: '3px' }}
            >
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Heading (### ...)
    if (line.startsWith('### ')) {
      nodes.push(
        <h4 key={key++} style={{ fontWeight: 700, fontSize: '1rem', margin: '10px 0 4px 0' }}>
          {renderInlineMarkdown(line.slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      nodes.push(
        <h3 key={key++} style={{ fontWeight: 700, fontSize: '1.1rem', margin: '10px 0 4px 0' }}>
          {renderInlineMarkdown(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      nodes.push(
        <h2 key={key++} style={{ fontWeight: 700, fontSize: '1.2rem', margin: '10px 0 4px 0' }}>
          {renderInlineMarkdown(line.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    // Empty line → paragraph break
    if (line.trim() === '') {
      nodes.push(<div key={key++} style={{ height: '8px' }} />);
      i++;
      continue;
    }

    // Normal paragraph line
    nodes.push(
      <p key={key++} style={{ margin: '2px 0', lineHeight: 1.6 }}>
        {renderInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return nodes;
}

// ============================================================
// Code Block with Copy
// ============================================================

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div
      style={{
        background: 'var(--color-bg-primary)',
        borderRadius: '8px',
        margin: '8px 0',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 12px',
          background: 'var(--color-bg-tertiary)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-tertiary)',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-hover)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'var(--color-text-tertiary)';
          }}
        >
          {copied ? (
            <>
              <Check size={12} /> 已复制
            </>
          ) : (
            <>
              <Copy size={12} /> 复制
            </>
          )}
        </button>
      </div>
      {/* Code content */}
      <pre
        style={{
          padding: '12px 16px',
          margin: 0,
          overflowX: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          lineHeight: 1.5,
          color: 'var(--color-text-primary)',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ============================================================
// Streaming Cursor
// ============================================================

function StreamingCursor() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '8px',
        height: '16px',
        background: 'var(--color-accent)',
        marginLeft: '2px',
        verticalAlign: 'text-bottom',
        animation: 'blink 1s step-end infinite',
        borderRadius: '1px',
      }}
    />
  );
}

// ============================================================
// AI Message Component
// ============================================================

interface AIMessageProps {
  message: AIMessage;
}

export function AIMessageBubble({ message }: AIMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const renderedContent = useMemo(() => {
    if (isUser) return message.content;
    return parseMarkdown(message.content);
  }, [message.content, isUser]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message.content]);

  const timeStr = useMemo(() => {
    const d = new Date(message.createdAt);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }, [message.createdAt]);

  if (isSystem) return null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
        padding: '0 4px',
      }}
    >
      <div
        style={{
          maxWidth: isUser ? '85%' : '95%',
          position: 'relative',
        }}
      >
        {/* Message bubble */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: isUser ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
            color: isUser ? 'var(--color-accent-foreground)' : 'var(--color-text-primary)',
            fontSize: '13px',
            lineHeight: 1.6,
            wordBreak: 'break-word',
            boxShadow: '0 1px 2px var(--color-shadow)',
          }}
        >
          {isUser ? (
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message.content}</p>
          ) : (
            <>
              {renderedContent}
              {message.isStreaming && <StreamingCursor />}
            </>
          )}
        </div>

        {/* Bottom row: time + copy */}
        {!message.isStreaming && message.content && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
              gap: '6px',
              marginTop: '4px',
              padding: '0 4px',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                color: 'var(--color-text-tertiary)',
              }}
            >
              {timeStr}
            </span>
            {!isUser && (
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '10px',
                  padding: '1px 4px',
                  borderRadius: '3px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-tertiary)';
                }}
              >
                {copied ? <Check size={10} /> : <Copy size={10} />}
                {copied ? '已复制' : '复制'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
