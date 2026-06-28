'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Landmark, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAccounts } from '@/hooks/use-api-query';
import type { AccountType } from '@/types';
import { formatCurrency } from '@/lib/utils';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  BANK: 'Bank',
  CASH: 'Cash',
  UPI: 'UPI',
  CARD: 'Card',
  OTHER: 'Other',
};

export function AccountsWalletMenu() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { data: accounts = [], isLoading } = useAccounts();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-xl"
        onClick={() => setOpen((v) => !v)}
        title="Payment accounts"
      >
        <Wallet className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">Payment Accounts</p>
            <p className="text-xs text-muted-foreground">Cash, bank, UPI & more</p>
          </div>

          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {isLoading && (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">Loading accounts...</p>
            )}
            {!isLoading && accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Landmark className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{account.name}</p>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {ACCOUNT_TYPE_LABELS[account.type]}
                    </Badge>
                  </div>
                  {account.bankName && (
                    <p className="text-xs text-muted-foreground truncate">{account.bankName}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Opening: {formatCurrency(account.openingBalance ?? 0)}
                  </p>
                </div>
              </div>
            ))}
            {!isLoading && !accounts.length && (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">No accounts yet</p>
            )}
          </div>

          <div className="border-t border-border p-2">
            <Button asChild variant="ghost" size="sm" className="w-full justify-start">
              <Link href="/entry-fields?tab=payment-modes">Manage payment modes</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
