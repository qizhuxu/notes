'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore, type ThemeStyle } from '@/stores/theme-store';
import { useAIStore } from '@/stores/ai-store';
import { useAuthStore } from '@/stores/auth-store';
import { SHORTCUT_LIST } from '@/hooks/use-keyboard-shortcuts';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sun,
  Moon,
  Palette,
  Sparkles,
  User,
  Keyboard,
  Check,
  Trash2,
  LogOut,
  Github,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ============================================================
   Tab definitions
   ============================================================ */

const TABS = [
  { id: 'appearance', label: '外观', icon: Palette },
  { id: 'ai', label: 'AI 助手', icon: Sparkles },
  { id: 'account', label: '账号', icon: User },
  { id: 'shortcuts', label: '快捷键', icon: Keyboard },
] as const;

type TabId = (typeof TABS)[number]['id'];

/* ============================================================
   Theme card data
   ============================================================ */

interface ThemeOption {
  name: ThemeStyle;
  labelZh: string;
  labelEn: string;
  description: string;
  colorsLight: { bg: string; surface: string; accent: string; text: string; border: string };
  colorsDark: { bg: string; surface: string; accent: string; text: string; border: string };
}

const THEMES: ThemeOption[] = [
  {
    name: 'minimal',
    labelZh: '极简',
    labelEn: 'Minimal',
    description: '灵感来自 Notion / Linear',
    colorsLight: { bg: '#ffffff', surface: '#fafafa', accent: '#1a1a1a', text: '#1a1a1a', border: '#f0f0f0' },
    colorsDark: { bg: '#0a0a0a', surface: '#141414', accent: '#fafafa', text: '#fafafa', border: '#262626' },
  },
  {
    name: 'cozy',
    labelZh: '温馨',
    labelEn: 'Cozy',
    description: '灵感来自 Bear / Craft',
    colorsLight: { bg: '#faf7f2', surface: '#f3ede4', accent: '#c17f4e', text: '#3d2c1e', border: '#e2d5c3' },
    colorsDark: { bg: '#1a1410', surface: '#252019', accent: '#d4945f', text: '#e8ddd0', border: '#3a3329' },
  },
  {
    name: 'dense',
    labelZh: '紧凑',
    labelEn: 'Dense',
    description: '灵感来自 Obsidian / VS Code',
    colorsLight: { bg: '#f8f9fa', surface: '#e9ecef', accent: '#4263a0', text: '#212529', border: '#dee2e6' },
    colorsDark: { bg: '#1e1e2e', surface: '#181825', accent: '#89b4fa', text: '#cdd6f4', border: '#313244' },
  },
];

const AI_MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: '快速、经济' },
  { value: 'gpt-4o', label: 'GPT-4o', desc: '强推理能力' },
  { value: 'claude-haiku', label: 'Claude Haiku', desc: '轻量快速' },
  { value: 'claude-sonnet', label: 'Claude Sonnet', desc: '平衡性能' },
];

/* ============================================================
   Sub-components
   ============================================================ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-sm font-semibold mb-3"
      style={{ color: 'var(--color-text-primary)' }}
    >
      {children}
    </h3>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('rounded-lg p-4', className)}
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      {children}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 text-sm rounded-lg outline-none nv-transition"
        style={{
          background: 'var(--color-bg-tertiary)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }}
      />
    </div>
  );
}

function DangerButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium nv-transition"
      style={{
        background: 'var(--color-danger-light)',
        color: 'var(--color-danger)',
        border: '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-danger)';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--color-danger-light)';
        e.currentTarget.style.color = 'var(--color-danger)';
      }}
    >
      {children}
    </button>
  );
}

/* ============================================================
   Appearance Tab
   ============================================================ */

function AppearanceTab() {
  const { style, mode, setStyle, toggleMode } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <div className="flex flex-col gap-6">
      {/* Theme Style */}
      <div>
        <SectionTitle>主题风格</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEMES.map((theme) => {
            const palette = isDark ? theme.colorsDark : theme.colorsLight;
            const isActive = style === theme.name;

            return (
              <button
                key={theme.name}
                onClick={() => setStyle(theme.name)}
                className={cn(
                  'flex flex-col items-center gap-3 p-4 rounded-lg text-left transition-all duration-200',
                  'hover:scale-[1.02] active:scale-[0.98]',
                  isActive && 'ring-2 shadow-md'
                )}
                style={{
                  backgroundColor: palette.bg,
                  border: `1.5px solid ${isActive ? palette.accent : palette.border}`,
                  color: palette.text,
                  borderRadius: '8px',
                }}
              >
                {/* Mini color palette */}
                <div className="flex gap-2">
                  <div
                    className="w-6 h-6 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: palette.bg }}
                  />
                  <div
                    className="w-6 h-6 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: palette.surface }}
                  />
                  <div
                    className="w-6 h-6 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: palette.accent }}
                  />
                  <div
                    className="w-6 h-6 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: palette.text }}
                  />
                  <div
                    className="w-6 h-6 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: palette.border }}
                  />
                </div>

                {/* Theme name */}
                <div className="text-center">
                  <div className="text-sm font-semibold">{theme.labelZh}</div>
                  <div
                    className="text-[11px] mt-0.5"
                    style={{ color: palette.text + '80' }}
                  >
                    {theme.labelEn} · {theme.description}
                  </div>
                </div>

                {isActive && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: palette.accent, color: palette.bg }}
                  >
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dark mode toggle */}
      <div>
        <SectionTitle>显示模式</SectionTitle>
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            ) : (
              <Sun className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            )}
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {isDark ? '暗色模式' : '亮色模式'}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {isDark ? '适合夜间使用，减少眼睛疲劳' : '适合日间使用，清晰明亮'}
              </div>
            </div>
          </div>
          <Switch checked={isDark} onCheckedChange={toggleMode} />
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   AI Settings Tab
   ============================================================ */

function AISettingsTab() {
  const { settings, setModel, setSystemPrompt, clearAllConversations, conversations } = useAIStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Model selection */}
      <div>
        <SectionTitle>AI 模型</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AI_MODELS.map((model) => {
            const isActive = settings.model === model.value;
            return (
              <button
                key={model.value}
                onClick={() => setModel(model.value)}
                className="flex items-center gap-3 p-3 rounded-lg text-left nv-transition"
                style={{
                  background: isActive ? 'var(--color-accent-light)' : 'var(--color-bg-card)',
                  border: `1.5px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: '8px',
                }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    background: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                />
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {model.label}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    {model.desc}
                  </div>
                </div>
                {isActive && (
                  <Check className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* System Prompt */}
      <div>
        <SectionTitle>系统提示词 (System Prompt)</SectionTitle>
        <Card className="flex flex-col gap-2 p-0 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={settings.systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 text-sm resize-none outline-none"
            style={{
              background: 'transparent',
              color: 'var(--color-text-primary)',
              border: 'none',
              fontFamily: 'var(--font-mono)',
            }}
            placeholder="输入系统提示词..."
          />
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{
              borderTop: '1px solid var(--color-border)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            <span className="text-[11px]">{settings.systemPrompt.length} 字符</span>
            <button
              onClick={() => setSystemPrompt('')}
              className="text-[11px] px-2 py-1 rounded nv-transition"
              style={{ color: 'var(--color-text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-tertiary)';
              }}
            >
              重置
            </button>
          </div>
        </Card>
      </div>

      {/* Shortcut info */}
      <div>
        <SectionTitle>快捷操作</SectionTitle>
        <Card className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              AI 助手快捷键
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
              使用 <kbd className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)' }}>Ctrl+J</kbd> 随时打开 AI 助手
            </div>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
        </Card>
      </div>

      {/* Clear conversations */}
      <div>
        <SectionTitle>对话历史</SectionTitle>
        <Card className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              管理对话
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
              当前有 {conversations.length} 个对话
            </div>
          </div>
          {!showClearConfirm ? (
            <DangerButton onClick={() => setShowClearConfirm(true)}>
              <Trash2 className="w-4 h-4" />
              清除全部
            </DangerButton>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--color-danger)' }}>
                确认清除？
              </span>
              <button
                onClick={() => {
                  clearAllConversations();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: 'var(--color-danger)',
                  color: '#fff',
                }}
              >
                确认
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs nv-transition"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                取消
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   Account Tab
   ============================================================ */

function AccountTab() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!user) return null;

  const oauthBindings = [
    { provider: 'GitHub', icon: Github, bound: user.authMethod === 'oauth' },
    { provider: 'Google', icon: () => <span className="text-base">G</span>, bound: false },
    { provider: '微信', icon: () => <span className="text-base">微</span>, bound: false },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Profile */}
      <div>
        <SectionTitle>个人信息</SectionTitle>
        <Card>
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-accent-foreground)',
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <InputField
                label="用户名"
                value={username}
                onChange={setUsername}
                placeholder="输入用户名"
              />
              <InputField
                label="邮箱"
                value={email}
                onChange={setEmail}
                type="email"
                placeholder="输入邮箱地址"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* OAuth */}
      <div>
        <SectionTitle>第三方账号绑定</SectionTitle>
        <div className="flex flex-col gap-2">
          {oauthBindings.map((binding) => {
            const IconComp = binding.icon as React.ComponentType<{ className?: string }>;
            return (
              <Card key={binding.provider} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <IconComp className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {binding.provider}
                  </span>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: binding.bound
                      ? 'var(--color-success-light)'
                      : 'var(--color-bg-tertiary)',
                    color: binding.bound
                      ? 'var(--color-success)'
                      : 'var(--color-text-tertiary)',
                  }}
                >
                  {binding.bound ? '已绑定' : '未绑定'}
                </span>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Change password */}
      <div>
        <SectionTitle>安全</SectionTitle>
        <Card className="flex flex-col gap-3">
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="flex items-center justify-between w-full text-sm nv-transition"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <span>修改密码</span>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <InputField
                label="当前密码"
                value={oldPassword}
                onChange={setOldPassword}
                type="password"
                placeholder="输入当前密码"
              />
              <InputField
                label="新密码"
                value={newPassword}
                onChange={setNewPassword}
                type="password"
                placeholder="输入新密码 (至少6位)"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setOldPassword('');
                    setNewPassword('');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs nv-transition"
                  style={{
                    background: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setOldPassword('');
                    setNewPassword('');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background: 'var(--color-accent)',
                    color: 'var(--color-accent-foreground)',
                  }}
                >
                  保存
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Logout */}
      <div>
        <Card className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              退出登录
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
              退出当前账号，返回登录页面
            </div>
          </div>
          <DangerButton
            onClick={() => {
              logout();
              router.push('/login');
            }}
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </DangerButton>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   Shortcuts Tab
   ============================================================ */

function ShortcutsTab() {
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle>键盘快捷键</SectionTitle>
      <Card className="p-0 overflow-hidden">
        <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {SHORTCUT_LIST.map((shortcut, index) => (
            <div
              key={shortcut.name}
              className="flex items-center justify-between px-4 py-3"
              style={{
                borderBottom:
                  index < SHORTCUT_LIST.length - 1
                    ? '1px solid var(--color-border)'
                    : 'none',
              }}
            >
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {shortcut.name}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                  {shortcut.description}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, ki) => (
                  <span key={ki}>
                    <kbd
                      className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md text-xs font-medium"
                      style={{
                        background: 'var(--color-bg-tertiary)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                        boxShadow: '0 1px 2px var(--color-shadow)',
                      }}
                    >
                      {key}
                    </kbd>
                    {ki < shortcut.keys.length - 1 && (
                      <span className="mx-0.5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div
        className="text-xs p-3 rounded-lg"
        style={{
          background: 'var(--color-bg-tertiary)',
          color: 'var(--color-text-tertiary)',
        }}
      >
        💡 提示：在输入框中部分快捷键可能不会触发。Mac 用户可使用 <kbd className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>⌘</kbd> 键代替 <kbd className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>Ctrl</kbd> 键。
      </div>
    </div>
  );
}

/* ============================================================
   Settings Page
   ============================================================ */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('appearance');

  return (
    <div className="flex gap-6">
      {/* Sidebar tabs */}
      <nav
        className="hidden sm:flex flex-col w-[200px] flex-shrink-0 sticky top-[60px] self-start"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '8px',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-left nv-transition',
                'hover:scale-[1.01]'
              )}
              style={{
                background: isActive ? 'var(--color-accent-light)' : 'transparent',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = 'var(--color-bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile tabs */}
      <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 w-full">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium flex-shrink-0 nv-transition whitespace-nowrap"
              style={{
                background: isActive ? 'var(--color-accent)' : 'var(--color-bg-card)',
                color: isActive ? 'var(--color-accent-foreground)' : 'var(--color-text-secondary)',
                border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'ai' && <AISettingsTab />}
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'shortcuts' && <ShortcutsTab />}
      </div>
    </div>
  );
}
