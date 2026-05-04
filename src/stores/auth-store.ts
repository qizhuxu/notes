'use client';

import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  authMethod: 'oauth' | 'password' | 'cf_access';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrated: boolean;

  // Actions
  init: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithOAuth: (provider: 'github' | 'google' | 'wechat') => void;
  setUser: (user: User | null) => void;
}

const STORAGE_KEY = 'nv-auth';

function loadFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function saveToStorage(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/** Simulate API latency */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Mock user database */
const MOCK_USERS: Record<string, { password: string; username: string }> = {
  'demo@notevault.com': { password: '123456', username: 'Demo User' },
  'test@example.com': { password: 'password', username: 'Test User' },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hydrated: false,

  init: () => {
    const saved = loadFromStorage();
    if (saved) {
      set({ user: saved, isAuthenticated: true, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Simulate network latency
      await delay(1200);

      const mockUser = MOCK_USERS[email];
      if (mockUser && mockUser.password === password) {
        const user: User = {
          id: crypto.randomUUID(),
          username: mockUser.username,
          email,
          authMethod: 'password',
        };
        saveToStorage(user);
        set({ user, isAuthenticated: true, isLoading: false });
        return;
      }

      // For demo purposes, accept any valid-looking credentials
      if (email.includes('@') && password.length >= 6) {
        const user: User = {
          id: crypto.randomUUID(),
          username: email.split('@')[0],
          email,
          authMethod: 'password',
        };
        saveToStorage(user);
        set({ user, isAuthenticated: true, isLoading: false });
        return;
      }

      throw new Error('邮箱或密码不正确');
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Simulate network latency
      await delay(1500);

      // Check if email already exists
      if (MOCK_USERS[email]) {
        throw new Error('该邮箱已被注册');
      }

      // Create user
      const user: User = {
        id: crypto.randomUUID(),
        username,
        email,
        authMethod: 'password',
      };
      MOCK_USERS[email] = { password, username };

      saveToStorage(user);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    saveToStorage(null);
    set({ user: null, isAuthenticated: false, isLoading: false, hydrated: true });
  },

  loginWithOAuth: (provider: 'github' | 'google' | 'wechat') => {
    const providerNames: Record<string, string> = {
      github: 'GitHub',
      google: 'Google',
      wechat: '微信',
    };
    console.log(`即将跳转到 ${providerNames[provider]} 授权...`);
    // In production, this would redirect to the OAuth provider
    // window.location.href = `/api/auth/${provider}`;
  },

  setUser: (user: User | null) => {
    saveToStorage(user);
    set({
      user,
      isAuthenticated: !!user,
    });
  },
}));
