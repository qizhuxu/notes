'use client';

import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/stores/theme-store';

export function ThemeInitializer() {
  const init = useThemeStore((s) => s.init);
  const initialized = useThemeStore((s) => s.initialized);
  const mode = useThemeStore((s) => s.mode);
  const style = useThemeStore((s) => s.style);
  const initRef = useRef(false);

  // Only run init once on mount
  if (!initRef.current && !initialized) {
    initRef.current = true;
    init();
  }

  // Sync attributes when values change after init
  useEffect(() => {
    if (!initialized) return;
    const root = document.documentElement;
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-theme', style);
  }, [initialized, mode, style]);

  return null;
}
