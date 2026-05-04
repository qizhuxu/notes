'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Eye, EyeOff, Github, Loader2, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { ThemeInitializer } from '@/components/theme-initializer';

/* ============================================================
   Validation Schema
   ============================================================ */
const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, '请输入用户名')
      .min(2, '用户名至少2个字符')
      .max(20, '用户名最多20个字符'),
    email: z
      .string()
      .min(1, '请输入邮箱地址')
      .email('请输入有效的邮箱地址'),
    password: z
      .string()
      .min(1, '请输入密码')
      .min(6, '密码至少6位'),
    confirmPassword: z
      .string()
      .min(1, '请确认密码'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

/* ============================================================
   Password Strength
   ============================================================ */
type PasswordStrength = 'weak' | 'medium' | 'strong';

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 6) return 'weak';
  if (password.length >= 10 && /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password)) return 'strong';
  if (password.length >= 6 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)) return 'medium';
  if (password.length >= 6) return 'weak';
  return 'weak';
}

const strengthConfig: Record<PasswordStrength, { label: string; color: string; width: string }> = {
  weak: { label: '弱', color: 'var(--color-danger)', width: '33%' },
  medium: { label: '中', color: '#f59e0b', width: '66%' },
  strong: { label: '强', color: 'var(--color-success)', width: '100%' },
};

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const config = strengthConfig[strength];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-1.5"
    >
      <div
        className="h-1.5 w-full rounded-full overflow-hidden"
        style={{ background: 'var(--color-bg-tertiary)' }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: config.width }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ background: config.color }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          密码强度
        </span>
        <span className="text-xs font-medium" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Animation Variants
   ============================================================ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
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
   Register Page
   ============================================================ */
export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(data.username, data.email, data.password);
      toast.success('注册成功！');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '注册失败，请重试');
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
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
                style={{ background: 'var(--color-accent-light)' }}
              >
                <span className="text-2xl">📦</span>
              </div>
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ color: 'var(--color-text-primary)' }}
              >
                创建 NoteVault 账号
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                开始你的高效笔记之旅
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  用户名
                </Label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  />
                  <Input
                    id="username"
                    type="text"
                    placeholder="你的昵称"
                    autoComplete="username"
                    disabled={isLoading}
                    className="h-11 pl-10 text-sm"
                    style={{
                      background: 'var(--color-bg-secondary)',
                      borderColor: errors.username
                        ? 'var(--color-danger)'
                        : 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    {...register('username')}
                  />
                </div>
                {errors.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    {errors.username.message}
                  </motion.p>
                )}
              </div>

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
                <Label
                  htmlFor="password"
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  密码
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="至少6位密码"
                    autoComplete="new-password"
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
                <PasswordStrengthIndicator password={passwordValue} />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  确认密码
                </Label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="再次输入密码"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-11 pl-10 pr-10 text-sm"
                    style={{
                      background: 'var(--color-bg-secondary)',
                      borderColor: errors.confirmPassword
                        ? 'var(--color-danger)'
                        : 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                    style={{ color: 'var(--color-text-tertiary)' }}
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    {errors.confirmPassword.message}
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
                    注册中...
                  </>
                ) : (
                  '创建账号'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <Separator style={{ background: 'var(--color-border)' }} />
              <span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs"
                style={{
                  background: 'var(--color-bg-card)',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                或使用以下方式注册
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
              已有账号？{' '}
              <Link
                href="/login"
                className="font-semibold hover:underline"
                style={{ color: 'var(--color-accent)' }}
              >
                登录
              </Link>
            </p>
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
