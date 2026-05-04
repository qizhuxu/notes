'use client';

import { ThemeInitializer } from '@/components/theme-initializer';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <>
      <ThemeInitializer />
      <AuthGuard>
        <div
          className="min-h-screen"
          style={{
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {/* Top bar */}
          <header
            className="sticky top-0 z-50 flex items-center gap-4 px-6 py-3"
            style={{
              background: 'var(--color-bg-secondary)',
              borderBottom: '1px solid var(--color-border)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm nv-transition"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-hover)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回笔记</span>
            </button>
            <h1
              className="text-lg font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              ⚙️ 设置
            </h1>
          </header>

          {/* Content */}
          <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>
        </div>
      </AuthGuard>
    </>
  );
}
