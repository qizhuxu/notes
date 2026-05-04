'use client';

import { create } from 'zustand';

// ============================================================
// Interfaces
// ============================================================

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  tokensUsed?: number;
  createdAt: string;
  isStreaming?: boolean;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  noteId?: string;
  createdAt: string;
}

interface AISettings {
  model: string;
  systemPrompt: string;
  apiEndpoint: string;
}

interface AIState {
  isOpen: boolean;
  isStreaming: boolean;
  conversations: AIConversation[];
  activeConversationId: string | null;
  settings: AISettings;

  // Getters
  activeConversation: () => AIConversation | undefined;

  // Actions
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  setModel: (model: string) => void;
  setSystemPrompt: (prompt: string) => void;
  sendMessage: (content: string) => Promise<void>;
  createConversation: (noteId?: string) => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
  clearAllConversations: () => void;
  loadSettings: () => void;
  saveSettings: (settings: Partial<AISettings>) => void;
}

// ============================================================
// Helpers
// ============================================================

function generateId(): string {
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getConversationTitle(content: string): string {
  const clean = content.replace(/[\n\r]/g, ' ').trim();
  return clean.length > 20 ? clean.slice(0, 20) + '...' : clean;
}

const DEFAULT_SETTINGS: AISettings = {
  model: 'gpt-4o-mini',
  systemPrompt: '你是 NoteVault 的 AI 写作助手，帮助用户进行写作、编辑、总结和翻译。请用中文回答。回答要简洁、专业、有帮助。',
  apiEndpoint: '/api/ai/chat',
};

// ============================================================
// Store
// ============================================================

export const useAIStore = create<AIState>((set, get) => ({
  isOpen: false,
  isStreaming: false,
  conversations: [],
  activeConversationId: null,
  settings: DEFAULT_SETTINGS,

  activeConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find((c) => c.id === activeConversationId);
  },

  toggleSidebar: () => set((s) => ({ isOpen: !s.isOpen })),
  openSidebar: () => set({ isOpen: true }),
  closeSidebar: () => set({ isOpen: false }),

  setModel: (model) => {
    set((s) => ({ settings: { ...s.settings, model } }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('nv-ai-settings', JSON.stringify(get().settings));
    }
  },

  setSystemPrompt: (prompt) => {
    set((s) => ({ settings: { ...s.settings, systemPrompt: prompt } }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('nv-ai-settings', JSON.stringify(get().settings));
    }
  },

  loadSettings: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('nv-ai-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ settings: { ...DEFAULT_SETTINGS, ...parsed } });
      }
    } catch {
      // ignore
    }
  },

  saveSettings: (newSettings) => {
    set((s) => {
      const updated = { ...s.settings, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('nv-ai-settings', JSON.stringify(updated));
      }
      return { settings: updated };
    });
  },

  createConversation: (noteId?: string) => {
    const id = generateId();
    const now = new Date().toISOString();
    const conversation: AIConversation = {
      id,
      title: '新对话',
      messages: [],
      noteId,
      createdAt: now,
    };
    set((s) => ({
      conversations: [conversation, ...s.conversations],
      activeConversationId: id,
    }));
    return id;
  },

  deleteConversation: (id) => {
    set((s) => {
      const filtered = s.conversations.filter((c) => c.id !== id);
      const newActiveId =
        s.activeConversationId === id
          ? filtered.length > 0
            ? filtered[0].id
            : null
          : s.activeConversationId;
      return {
        conversations: filtered,
        activeConversationId: newActiveId,
      };
    });
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  clearAllConversations: () => {
    set({ conversations: [], activeConversationId: null });
  },

  sendMessage: async (content: string) => {
    const state = get();

    // Ensure there's an active conversation
    let convId = state.activeConversationId;
    if (!convId) {
      convId = get().createConversation();
    }

    const userMessage: AIMessage = {
      id: generateId(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    // Add user message and update title if it's the first message
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== convId) return c;
        const isFirst = c.messages.length === 0;
        return {
          ...c,
          title: isFirst ? getConversationTitle(content) : c.title,
          messages: [...c.messages, userMessage],
        };
      }),
    }));

    // Create placeholder for assistant message
    const assistantId = generateId();
    const assistantMessage: AIMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    set((s) => ({
      isStreaming: true,
      conversations: s.conversations.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          messages: [...c.messages, assistantMessage],
        };
      }),
    }));

    // Build message history for API
    const currentConv = get().conversations.find((c) => c.id === convId);
    const historyMessages = (currentConv?.messages || [])
      .filter((m) => m.role !== 'system' && !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch(state.settings.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyMessages,
          model: state.settings.model,
          systemPrompt: state.settings.systemPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `请求失败 (${response.status})`
        );
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        // Handle SSE streaming
        const reader = response.body?.getReader();
        if (!reader) throw new Error('无法读取响应流');

        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  accumulated += parsed.content;

                  set((s) => ({
                    conversations: s.conversations.map((c) => {
                      if (c.id !== convId) return c;
                      return {
                        ...c,
                        messages: c.messages.map((m) => {
                          if (m.id !== assistantId) return m;
                          return { ...m, content: accumulated };
                        }),
                      };
                    }),
                  }));
                }
              } catch {
                // skip malformed SSE data
              }
            }
          }
        }

        // Finalize the assistant message
        set((s) => ({
          isStreaming: false,
          conversations: s.conversations.map((c) => {
            if (c.id !== convId) return c;
            return {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id !== assistantId) return m;
                return { ...m, isStreaming: false };
              }),
            };
          }),
        }));
      } else {
        // Handle JSON response (non-streaming fallback)
        const data = await response.json();
        const replyContent = data.content || '抱歉，我无法生成回复。';

        set((s) => ({
          isStreaming: false,
          conversations: s.conversations.map((c) => {
            if (c.id !== convId) return c;
            return {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id !== assistantId) return m;
                return {
                  ...m,
                  content: replyContent,
                  model: data.model,
                  tokensUsed: data.tokensUsed,
                  isStreaming: false,
                };
              }),
            };
          }),
        }));
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || 'AI 服务暂时不可用，请稍后再试。';

      set((s) => ({
        isStreaming: false,
        conversations: s.conversations.map((c) => {
          if (c.id !== convId) return c;
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id !== assistantId) return m;
              return {
                ...m,
                content: `⚠️ 错误：${errorMessage}`,
                isStreaming: false,
              };
            }),
          };
        }),
      }));
    }
  },
}));
