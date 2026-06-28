'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Plus, Search, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBusinessStore } from '@/stores/business.store';
import { cn } from '@/lib/utils';

export function BusinessSwitcher() {
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const {
    businesses,
    activeBusinessId,
    isLoading,
    setActiveBusiness,
    createBusiness,
  } = useBusinessStore();

  const activeBusiness = businesses.find((b) => b.id === activeBusinessId);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setShowAdd(false);
        setError('');
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return businesses;
    const q = search.toLowerCase();
    return businesses.filter((b) => b.name.toLowerCase().includes(q));
  }, [businesses, search]);

  const switchBusiness = (id: string) => {
    if (id === activeBusinessId) {
      setOpen(false);
      return;
    }
    setActiveBusiness(id);
    queryClient.clear();
    setOpen(false);
    setSearch('');
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (trimmed.length < 2) {
      setError('Business name must be at least 2 characters');
      return;
    }
    setCreating(true);
    setError('');
    try {
      await createBusiness(trimmed);
      queryClient.clear();
      setNewName('');
      setShowAdd(false);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create business');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent/50 transition-colors max-w-[280px]"
      >
        <span className="truncate uppercase tracking-wide">
          {isLoading ? 'Loading...' : activeBusiness?.name || 'Select Business'}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[320px] rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Business"
                className="pl-9"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.map((business) => {
              const selected = business.id === activeBusinessId;
              return (
                <button
                  key={business.id}
                  type="button"
                  onClick={() => switchBusiness(business.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-accent/50',
                    selected && 'bg-primary/10'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-full border',
                      selected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                    )}
                  >
                    {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </span>
                  <span className="truncate uppercase">{business.name}</span>
                </button>
              );
            })}
            {!filtered.length && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No businesses found</p>
            )}
          </div>

          <div className="border-t border-border p-3 space-y-3">
            {showAdd ? (
              <div className="space-y-2">
                <Label className="text-xs">Business Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. FITO6 FITNESS STUDIO"
                  autoFocus
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreate} disabled={creating} className="flex-1">
                    {creating ? 'Creating...' : 'Create Business'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowAdd(false);
                      setNewName('');
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button className="w-full" onClick={() => setShowAdd(true)}>
                <Plus className="h-4 w-4" />
                Add New Business
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
