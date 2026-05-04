'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore, type User } from '@/stores/auth-store';
import { ThemeInitializer } from '@/components/theme-initializer';

export default function AuthCallbackPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    // Mock OAuth callback — simulate a 2-second verification delay
    const timer = setTimeout(() => {
      // Create a mock user from OAuth
      const mockUser: User = {
        id: crypto.randomUUID(),
        username: 'OAuth User',
        email: 'oauth@example.com',
        avatarUrl: undefined,
        authMethod: 'oauth',
      };
      setUser(mockUser);
      router.replace('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, setUser]);

  return (
    <>
      <ThemeInitializer />
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-bg-primary)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4"
        >
          {/* Spinner */}
          <div
            className="w-10 h-10 border-[3px] border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
          />

          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl">📦</span>
            <span
              className="text-lg font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              NoteVault
            </span>
          </div>

          {/* Message */}
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            正在验证登录信息...
          </p>

          {/* Subtitle */}
          <p
            className="text-xs"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            请稍候，正在获取您的账号信息
          </p>
        </motion.div>
      </div>
    </>
  );
}
