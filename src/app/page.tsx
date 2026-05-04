import { AppLayout } from '@/components/notevault/app-layout';
import { ThemeInitializer } from '@/components/theme-initializer';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function Home() {
  return (
    <>
      <ThemeInitializer />
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    </>
  );
}
