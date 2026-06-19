'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import type { Account, AccountType } from '@/types';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  BANK: 'Bank',
  CASH: 'Cash',
  UPI: 'UPI',
  CARD: 'Card',
  OTHER: 'Other',
};

interface AccountSelectFieldProps {
  value?: string;
  onChange: (accountId: string) => void;
  accounts: Account[];
  onAccountAdded: () => void;
  error?: string;
}

export function AccountSelectField({
  value,
  onChange,
  accounts,
  onAccountAdded,
  error,
}: AccountSelectFieldProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AccountType>('CASH');
  const [bankName, setBankName] = useState('');
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState('');

  const handleAddAccount = async () => {
    const name = newName.trim();
    if (name.length < 2) {
      setAddError('Name must be at least 2 characters');
      return;
    }

    setSaving(true);
    setAddError('');
    try {
      const created = await api.post<Account>('/accounts', {
        name,
        type: newType,
        ...(newType === 'BANK' && bankName.trim() ? { bankName: bankName.trim() } : {}),
      });
      onAccountAdded();
      onChange(created.id);
      setNewName('');
      setBankName('');
      setShowAdd(false);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Failed to add account');
    } finally {
      setSaving(false);
    }
  };

  if (showAdd) {
    return (
      <div className="space-y-2 rounded-lg border border-border p-3 bg-muted/30">
        <Label className="text-xs text-muted-foreground">New payment account</Label>
        <Select value={newType} onValueChange={(v) => setNewType(v as AccountType)}>
          <SelectTrigger>
            <SelectValue placeholder="Account type" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]).map((type) => (
              <SelectItem key={type} value={type}>
                {ACCOUNT_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Account name (e.g. HDFC Current, Petty Cash)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        {newType === 'BANK' && (
          <Input
            placeholder="Bank name (optional)"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
        )}
        {addError && <p className="text-xs text-destructive">{addError}</p>}
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={handleAddAccount} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save account'}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select account (bank, cash, UPI...)" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {ACCOUNT_TYPE_LABELS[account.type]} · {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-primary" onClick={() => setShowAdd(true)}>
        <Plus className="h-3 w-3" /> Add account
      </Button>
    </div>
  );
}

export { ACCOUNT_TYPE_LABELS };
