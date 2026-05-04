'use client';

import { useState } from 'react';
import { useThemeStore, type ThemeStyle } from '@/stores/theme-store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeOption {
  name: ThemeStyle;
  labelZh: string;
  labelEn: string;
  description: string;
  colors: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
    border: string;
  };
  colorsDark: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
    border: string;
  };
}

const themes: ThemeOption[] = [
  {
    name: 'minimal',
    labelZh: '极简',
    labelEn: 'Minimal',
    description: '灵感来自 Notion / Linear',
    colors: {
      bg: '#ffffff',
      surface: '#fafafa',
      accent: '#1a1a1a',
      text: '#1a1a1a',
      border: '#f0f0f0',
    },
    colorsDark: {
      bg: '#0a0a0a',
      surface: '#141414',
      accent: '#fafafa',
      text: '#fafafa',
      border: '#262626',
    },
  },
  {
    name: 'cozy',
    labelZh: '温馨',
    labelEn: 'Cozy',
    description: '灵感来自 Bear / Craft',
    colors: {
      bg: '#faf7f2',
      surface: '#f3ede4',
      accent: '#c17f4e',
      text: '#3d2c1e',
      border: '#e2d5c3',
    },
    colorsDark: {
      bg: '#1a1410',
      surface: '#252019',
      accent: '#d4945f',
      text: '#e8ddd0',
      border: '#3a3329',
    },
  },
  {
    name: 'dense',
    labelZh: '紧凑',
    labelEn: 'Dense',
    description: '灵感来自 Obsidian / VS Code',
    colors: {
      bg: '#f8f9fa',
      surface: '#e9ecef',
      accent: '#4263a0',
      text: '#212529',
      border: '#dee2e6',
    },
    colorsDark: {
      bg: '#1e1e2e',
      surface: '#181825',
      accent: '#89b4fa',
      text: '#cdd6f4',
      border: '#313244',
    },
  },
];

function ThemeCard({
  option,
  isActive,
  isDark,
  onSelect,
}: {
  option: ThemeOption;
  isActive: boolean;
  isDark: boolean;
  onSelect: () => void;
}) {
  const palette = isDark ? option.colorsDark : option.colors;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200',
        'hover:scale-[1.02] active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isActive
          ? 'ring-2 shadow-md'
          : 'hover:shadow-sm opacity-80 hover:opacity-100'
      )}
      style={{
        backgroundColor: palette.bg,
        border: `1.5px solid ${isActive ? palette.accent : palette.border}`,
        color: palette.text,
        borderRadius: 'var(--radius-md, 8px)',
      }}
    >
      {/* Color palette preview */}
      <div className="flex gap-1.5 shrink-0">
        <div
          className="w-5 h-5 rounded-full ring-1 ring-black/10"
          style={{ backgroundColor: palette.bg }}
          title="Background"
        />
        <div
          className="w-5 h-5 rounded-full ring-1 ring-black/10"
          style={{ backgroundColor: palette.surface }}
          title="Surface"
        />
        <div
          className="w-5 h-5 rounded-full ring-1 ring-black/10"
          style={{ backgroundColor: palette.accent }}
          title="Accent"
        />
      </div>

      {/* Theme info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold leading-tight">
            {option.labelZh}
          </span>
          <span
            className="text-xs leading-tight"
            style={{ color: palette.text + '99' }}
          >
            {option.labelEn}
          </span>
        </div>
        <p
          className="text-[11px] mt-0.5 truncate"
          style={{ color: palette.text + '80' }}
        >
          {option.description}
        </p>
      </div>

      {/* Active checkmark */}
      {isActive && (
        <div
          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: palette.accent, color: palette.bg }}
        >
          <Check className="w-3 h-3" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

export function ThemeSwitcher() {
  const { style, mode, setStyle, toggleMode } = useThemeStore();
  const [open, setOpen] = useState(false);
  const isDark = mode === 'dark';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg"
          aria-label="切换主题"
        >
          <Palette className="h-[1.15rem] w-[1.15rem]" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[300px] p-0 overflow-hidden"
        style={{
          borderRadius: 'var(--radius-lg, 12px)',
          backgroundColor: 'var(--color-bg-primary, #ffffff)',
          border: '1px solid var(--color-border, #e0e0e0)',
          color: 'var(--color-text-primary, #1a1a1a)',
        }}
        sideOffset={8}
        align="end"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--color-border, #e0e0e0)' }}
        >
          <div className="flex items-center gap-2">
            <Palette
              className="h-4 w-4"
              style={{ color: 'var(--color-accent, #1a1a1a)' }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--color-text-primary, #1a1a1a)' }}
            >
              主题外观
            </span>
          </div>

          {/* Dark/Light Toggle */}
          <button
            onClick={toggleMode}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
              'hover:scale-105 active:scale-95'
            )}
            style={{
              backgroundColor: 'var(--color-bg-tertiary, #f5f5f5)',
              color: 'var(--color-text-secondary, #737373)',
              border: '1px solid var(--color-border, #e0e0e0)',
            }}
            aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5" />
                <span>浅色</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" />
                <span>深色</span>
              </>
            )}
          </button>
        </div>

        {/* Theme cards */}
        <div className="flex flex-col gap-2 p-3">
          {themes.map((option) => (
            <ThemeCard
              key={option.name}
              option={option}
              isActive={style === option.name}
              isDark={isDark}
              onSelect={() => setStyle(option.name)}
            />
          ))}
        </div>

        {/* Footer info */}
        <div
          className="px-4 py-2.5 text-center"
          style={{
            borderTop: '1px solid var(--color-border, #e0e0e0)',
            color: 'var(--color-text-tertiary, #a3a3a3)',
          }}
        >
          <p className="text-[11px]">
            {isDark ? '🌙' : '☀️'} 当前：{themes.find((t) => t.name === style)?.labelZh}{' '}
            {isDark ? '深色' : '浅色'}模式
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
