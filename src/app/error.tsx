'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div className="text-center max-w-md">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'var(--color-danger-light)',
          }}
        >
          <AlertTriangle
            className="w-8 h-8"
            style={{ color: 'var(--color-danger)' }}
          />
        </div>

        {/* Title */}
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          出错了
        </h1>

        {/* Description */}
        <p
          className="text-sm mb-6"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          抱歉，应用遇到了一个意外错误。请尝试重新加载页面，如果问题仍然存在，请稍后再试。
        </p>

        {/* Error detail (development) */}
        {error.message && (
          <div
            className="text-xs p-3 rounded-lg mb-6 text-left"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {error.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium nv-transition"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-accent-foreground)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <RotateCcw className="w-4 h-4" />
            重试
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium nv-transition"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-tertiary)';
            }}
          >
            <Home className="w-4 h-4" />
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
