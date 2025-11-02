'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store';

export function Providers({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
