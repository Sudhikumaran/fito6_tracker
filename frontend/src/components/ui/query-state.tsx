'use client';

import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/ui/table-skeleton';

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  hasData: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function QueryState({ isLoading, isError, error, hasData, onRetry, children }: QueryStateProps) {
  if (isLoading && !hasData) {
    return (
      <div className="space-y-2">
        <TableSkeleton />
        <p className="px-4 pb-4 text-xs text-muted-foreground text-center">
          First load may take up to 30 seconds if the server was idle.
        </p>
      </div>
    );
  }

  if (isError && !hasData) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-destructive">{error?.message || 'Failed to load data'}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
