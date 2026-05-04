'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Eye, EyeOff, Github, Loader2, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { ThemeInitializer } from '@/components/theme-initializer';

/* ============================================================
   Validation Schema
   ============================================================ */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱地址')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(6, '密码至少6位'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/* ============================================================
   Animation Variants
   ============================================================ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/* ============================================================
   OAuth Provider Button
   ============================================================ */
function OAuthButton({
  provider,
  label,
  icon,
}: {
  provider: 'github' | 'google' | 'wechat';
  label: string;
  icon: React.ReactNode;
}) {
  const loginWithOAuth = useAuthStore((s) => s.loginWithOAuth);

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 gap-2.5 text-sm font-medium cursor-pointer"
      style={{
        borderColor: 'var(--color-border)',
        background: 'transparent',
        color: 'var(--color-text-primary)',
      }}
      onClick={() => {
        loginWithOAuth(provider);
        toast.info(`即将跳转到 ${label} 授权页面...`);
      }}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}

/* ============================================================
   Login Page
   ============================================================ */
export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      toast.success('登录成功！');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '登录失败，请重试');
    }
  };

  return (
    <>
      <ThemeInitializer />
      <div
        className="min-h-screen flex items-center justify-center px-4 py-8"
        style={{ background: 'var(--color-bg-primary)' }}
      >
        <motion.div
          className="w-full"
          style={{ maxWidth: 420 }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Card */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl p-8"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 24px var(--color-shadow)',
            }}
          >
            {/* Logo / Brand */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
                style={{ background: 'var(--color-accent-light)' }}
              >
                <span className="text-2xl">📦</span>
              </div>
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ color: 'var(--color-text-primary)' }}
              >
                NoteVault
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                登录到你的笔记空间
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  邮箱
                </Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-11 pl-10 text-sm"
                    style={{
                      background: 'var(--color-bg-secondary)',
                      borderColor: errors.email
                        ? 'var(--color-danger)'
                        : 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    密码
                  </Label>
                  <button
                    type="button"
                    className="text-xs font-medium hover:underline"
                    style={{ color: 'var(--color-accent)' }}
                    onClick={() => toast.info('密码重置功能即将上线')}
                  >
                    忘记密码?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="至少6位密码"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="h-11 pl-10 pr-10 text-sm"
                    style={{
                      background: 'var(--color-bg-secondary)',
                      borderColor: errors.password
                        ? 'var(--color-danger)'
                        : 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                    style={{ color: 'var(--color-text-tertiary)' }}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-semibold gap-2 cursor-pointer"
                style={{
                  background: 'var(--color-accent)',
                  color: 'var(--color-accent-foreground)',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <Separator
                style={{ background: 'var(--color-border)' }}
              />
              <span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs"
                style={{
                  background: 'var(--color-bg-card)',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                或使用以下方式登录
              </span>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <OAuthButton
                provider="github"
                label="GitHub"
                icon={<Github className="size-4" />}
              />
              <OAuthButton
                provider="google"
                label="Google"
                icon={
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                }
              />
              <OAuthButton
                provider="wechat"
                label="微信"
                icon={
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zM14.033 13.33c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
                  </svg>
                }
              />
            </div>

            {/* Footer Link */}
            <p
              className="text-center text-sm mt-6"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              没有账号？{' '}
              <Link
                href="/register"
                className="font-semibold hover:underline"
                style={{ color: 'var(--color-accent)' }}
              >
                注册
              </Link>
            </p>

            {/* Demo Hint */}
            <div
              className="mt-5 p-3 rounded-lg text-xs"
              style={{
                background: 'var(--color-accent-light)',
                color: 'var(--color-accent)',
              }}
            >
              💡 体验提示：输入任意邮箱和 6 位以上密码即可登录
            </div>
          </motion.div>

          {/* Bottom credit */}
          <motion.p
            variants={itemVariants}
            className="text-center text-xs mt-6"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            NoteVault v2.0 — 安全可靠的笔记管理
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
