'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAIStore } from '@/stores/ai-store';
import { AIMessageBubble } from './ai-message';
import { AIQuickActions } from './ai-quick-actions';
import { AISettings } from './ai-settings';

// ============================================================
// Animation variants
// ============================================================

const sidebarVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// ============================================================
// Conversation History Item
// ============================================================

function ConversationItem({
  id,
  title,
  isActive,
  onSelect,
  onDelete,
}: {
  id: string;
  title: string;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group nv-transition"
      style={{
        background: isActive ? 'var(--color-accent-light)' : 'transparent',
        color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
      }}
      onClick={onSelect}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'var(--color-bg-hover)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      <MessageSquare size={13} className="flex-shrink-0" />
      <span className="text-xs truncate flex-1">{title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 rounded nv-transition"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-tertiary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-danger)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-tertiary)';
        }}
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

// ============================================================
// Main AI Sidebar
// ============================================================

export function AISidebar() {
  const {
    isOpen,
    isStreaming,
    conversations,
    activeConversationId,
    settings,
    toggleSidebar,
    closeSidebar,
    sendMessage,
    createConversation,
    deleteConversation,
    setActiveConversation,
  } = useAIStore();

  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const storeLoaded = useRef(false);

  // Load settings on first render
  useEffect(() => {
    if (!storeLoaded.current && typeof window !== 'undefined') {
      useAIStore.getState().loadSettings();
      storeLoaded.current = true;
    }
  }, []);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSidebar]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversationId]);

  // Auto-grow textarea
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, []);

  // Send message
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(trimmed);
  }, [input, isStreaming, sendMessage]);

  // Handle quick action
  const handleQuickAction = useCallback(
    async (prompt: string) => {
      if (isStreaming) return;
      await sendMessage(prompt);
    },
    [isStreaming, sendMessage]
  );

  // Handle key press in textarea
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Active conversation messages
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const messages = activeConversation?.messages || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="ai-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'var(--color-bg-overlay)',
              zIndex: 200,
            }}
            onClick={closeSidebar}
          />

          {/* Sidebar Panel */}
          <motion.div
            key="ai-sidebar"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '380px',
              maxWidth: '100vw',
              background: 'var(--color-bg-secondary)',
              zIndex: 201,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 24px var(--color-shadow)',
            }}
          >
            {showSettings ? (
              <AISettings onClose={() => setShowSettings(false)} />
            ) : (
              <>
                {/* ===== Header ===== */}
                <div
                  className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={16}
                      style={{ color: 'var(--color-accent)' }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      AI 助手
                    </span>
                    <select
                      value={settings.model}
                      onChange={(e) => useAIStore.getState().setModel(e.target.value)}
                      className="text-[11px] px-2 py-0.5 rounded-md outline-none"
                      style={{
                        background: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border)',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="gpt-4o-mini">GPT-4o-mini</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-3.5-turbo">GPT-3.5</option>
                      <option value="claude-3-haiku">Claude Haiku</option>
                      <option value="claude-3-sonnet">Claude Sonnet</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg nv-transition"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-tertiary)',
                      }}
                      title="AI 设置"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-hover)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-tertiary)';
                      }}
                    >
                      <Settings size={14} />
                    </button>
                    <button
                      onClick={closeSidebar}
                      className="w-7 h-7 flex items-center justify-center rounded-lg nv-transition"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-tertiary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-hover)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-tertiary)';
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* ===== Conversation History (collapsible) ===== */}
                <div
                  className="flex-shrink-0"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs nv-transition"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      {showHistory ? (
                        <ChevronDown size={12} />
                      ) : (
                        <ChevronRight size={12} />
                      )}
                      对话历史 ({conversations.length})
                    </span>
                    <Plus
                      size={12}
                      className="p-0.5 rounded nv-transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        createConversation();
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--color-accent)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '';
                      }}
                    />
                  </button>
                  <AnimatePresence>
                    {showHistory && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          className="px-2 pb-2 flex flex-col gap-0.5 max-h-48 overflow-y-auto nv-scrollbar"
                        >
                          {conversations.length === 0 ? (
                            <p
                              className="text-[11px] text-center py-2"
                              style={{ color: 'var(--color-text-tertiary)' }}
                            >
                              暂无对话
                            </p>
                          ) : (
                            conversations.map((conv) => (
                              <ConversationItem
                                key={conv.id}
                                id={conv.id}
                                title={conv.title}
                                isActive={conv.id === activeConversationId}
                                onSelect={() => setActiveConversation(conv.id)}
                                onDelete={() => deleteConversation(conv.id)}
                              />
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ===== Messages Area ===== */}
                <div
                  className="flex-1 overflow-y-auto nv-scrollbar px-4 py-3"
                  style={{ minHeight: 0 }}
                >
                  {messages.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center h-full gap-3"
                      style={{ opacity: 0.6 }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: 'var(--color-bg-tertiary)' }}
                      >
                        <Sparkles
                          size={24}
                          style={{ color: 'var(--color-accent)' }}
                        />
                      </div>
                      <p
                        className="text-sm text-center"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        AI 写作助手
                      </p>
                      <p
                        className="text-xs text-center max-w-[240px]"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        我可以帮助你续写、摘要、润色和翻译内容。试试下方的快捷操作吧！
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <AIMessageBubble key={msg.id} message={msg} />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* ===== Quick Actions ===== */}
                <div
                  className="px-4 py-2 flex-shrink-0"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <AIQuickActions
                    onAction={handleQuickAction}
                    disabled={isStreaming}
                  />
                </div>

                {/* ===== Input Area ===== */}
                <div
                  className="px-4 py-3 flex-shrink-0"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <div
                    className="flex items-end gap-2 rounded-xl px-3 py-2"
                    style={{
                      background: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="输入消息... (Shift+Enter 换行)"
                      rows={1}
                      className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
                      style={{
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-sans)',
                        maxHeight: '120px',
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isStreaming}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg nv-transition"
                      style={{
                        background:
                          input.trim() && !isStreaming
                            ? 'var(--color-accent)'
                            : 'var(--color-bg-primary)',
                        color:
                          input.trim() && !isStreaming
                            ? 'var(--color-accent-foreground)'
                            : 'var(--color-text-tertiary)',
                        border: 'none',
                        cursor:
                          input.trim() && !isStreaming
                            ? 'pointer'
                            : 'not-allowed',
                        opacity:
                          input.trim() && !isStreaming ? 1 : 0.5,
                      }}
                    >
                      {isStreaming ? (
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{
                            border: '2px solid var(--color-accent-foreground)',
                            borderTopColor: 'transparent',
                            animation: 'spin 1s linear infinite',
                          }}
                        />
                      ) : (
                        <Send size={14} />
                      )}
                    </button>
                  </div>
                  <p
                    className="text-[10px] mt-1.5 text-center"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    按 Ctrl+J 切换 AI 面板 · Shift+Enter 换行
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
