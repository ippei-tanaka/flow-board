'use client';

import type { ReactNode } from 'react';
import { UiProvider } from '@/lib/stores/ui-store';

export function Providers({ children }: { children: ReactNode }) {
	return <UiProvider>{children}</UiProvider>;
}