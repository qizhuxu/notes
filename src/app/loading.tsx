'use client';

export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'var(--color-bg-primary)',
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-10 h-10">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid var(--color-border)',
              borderTopColor: 'var(--color-accent)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
        {/* Pulsing dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--color-accent)',
                animation: 'pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          加载中...
        </p>
      </div>
    </div>
  );
}
