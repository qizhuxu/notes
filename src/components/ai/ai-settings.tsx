'use client';

import { useState, useCallback } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { useAIStore } from '@/stores/ai-store';

const MODEL_OPTIONS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o-mini' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
];

interface AISettingsProps {
  onClose: () => void;
}

export function AISettings({ onClose }: AISettingsProps) {
  const settings = useAIStore((s) => s.settings);
  const saveSettings = useAIStore((s) => s.saveSettings);

  const [model, setModel] = useState(settings.model);
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt);

  const handleSave = useCallback(() => {
    saveSettings({ model, systemPrompt });
    onClose();
  }, [model, systemPrompt, saveSettings, onClose]);

  const handleReset = useCallback(() => {
    const defaults = useAIStore.getState().settings;
    // Reset to defaults stored in the store
    setModel('gpt-4o-mini');
    setSystemPrompt(
      '你是 NoteVault 的 AI 写作助手，帮助用户进行写作、编辑、总结和翻译。请用中文回答。回答要简洁、专业、有帮助。'
    );
  }, []);

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: 'var(--color-bg-secondary)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <Settings size={16} style={{ color: 'var(--color-accent)' }} />
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            AI 设置
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-xs px-2 py-1 rounded-md nv-transition"
          style={{
            color: 'var(--color-text-tertiary)',
            background: 'transparent',
            cursor: 'pointer',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          ✕
        </button>
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-y-auto nv-scrollbar px-4 py-4 flex flex-col gap-5">
        {/* Model selection */}
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            默认模型
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* API Key (mock) */}
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            API Key
          </label>
          <input
            type="password"
            value="sk-••••••••••••••••"
            readOnly
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-tertiary)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <p
            className="text-[11px]"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            API Key 已通过服务端安全处理，无需在客户端配置。
          </p>
        </div>

        {/* System Prompt */}
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            System Prompt
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.5,
            }}
            placeholder="输入系统提示词..."
          />
          <p
            className="text-[11px]"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            定义 AI 助手的行为和回答风格。修改后立即生效。
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs nv-transition"
          style={{
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <RotateCcw size={12} />
          恢复默认
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium nv-transition"
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-accent-foreground)',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <Save size={12} />
          保存
        </button>
      </div>
    </div>
  );
}
