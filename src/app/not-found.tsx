'use client';

import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
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
            background: 'var(--color-accent-light)',
          }}
        >
          <FileQuestion
            className="w-8 h-8"
            style={{ color: 'var(--color-accent)' }}
          />
        </div>

        {/* Title */}
        <h1
          className="text-6xl font-bold mb-2"
          style={{ color: 'var(--color-text-primary)', opacity: 0.15 }}
        >
          404
        </h1>

        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          页面未找到
        </h2>

        {/* Description */}
        <p
          className="text-sm mb-8"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          抱歉，您访问的页面不存在或已被移除。
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium nv-transition"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-accent-foreground)',
            }}
          >
            <Home className="w-4 h-4" />
            返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
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
            <ArrowLeft className="w-4 h-4" />
            返回上页
          </button>
        </div>
      </div>
    </div>
  );
}
