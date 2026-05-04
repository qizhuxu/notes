import { AppLayout } from '@/components/notevault/app-layout';
import { ThemeInitializer } from '@/components/theme-initializer';

export default function Home() {
  return (
    <>
      <ThemeInitializer />
      <AppLayout />
    </>
  );
}
