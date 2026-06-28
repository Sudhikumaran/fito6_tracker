'use client';

import { BusinessSwitcher } from '@/components/layout/business-switcher';
import { useAuthStore } from '@/stores/auth.store';

export function AppTopBar() {
  const { user } = useAuthStore();

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border glass-strong px-6">
      <BusinessSwitcher />
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium leading-none">{user?.name}</p>
          <p className="text-xs text-muted-foreground capitalize mt-0.5">{user?.role?.toLowerCase()}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </div>
  );
}
