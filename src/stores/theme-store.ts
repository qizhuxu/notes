'use client';

import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';
export type ThemeStyle = 'minimal' | 'cozy' | 'dense';

interface ThemeState {
  mode: ThemeMode;
  style: ThemeStyle;
  initialized: boolean;
  init: () => void;
  setMode: (mode: ThemeMode) => void;
  setStyle: (style: ThemeStyle) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  style: 'minimal',
  initialized: false,

  init: () => {
    if (typeof window === 'undefined') return;
    const savedMode = (localStorage.getItem('nv-mode') as ThemeMode) || 'light';
    const savedStyle = (localStorage.getItem('nv-style') as ThemeStyle) || 'minimal';
    const root = document.documentElement;
    root.setAttribute('data-mode', savedMode);
    root.setAttribute('data-theme', savedStyle);
    set({ mode: savedMode, style: savedStyle, initialized: true });
  },

  setMode: (mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nv-mode', mode);
      document.documentElement.setAttribute('data-mode', mode);
    }
    set({ mode });
  },

  setStyle: (style) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nv-style', style);
      document.documentElement.setAttribute('data-theme', style);
    }
    set({ style });
  },

  toggleMode: () => {
    const newMode = get().mode === 'light' ? 'dark' : 'light';
    get().setMode(newMode);
  },
}));
