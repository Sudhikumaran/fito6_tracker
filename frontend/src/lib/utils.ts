import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: 'INR' | string = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatPeriodMonth(periodMonth: string) {
  const [year, month] = periodMonth.split('-').map(Number);
  if (!year || !month) return periodMonth;
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(
    new Date(year, month - 1, 1)
  );
}

export function currentPeriodMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function suggestExpensePeriodMonth(paymentDate: string, categoryName?: string): string {
  const pay = new Date(paymentDate);
  const deferred =
    !!categoryName && /rent|salary|payroll|wage/i.test(categoryName);
  if (deferred) {
    pay.setDate(1);
    pay.setMonth(pay.getMonth() - 1);
  }
  return `${pay.getFullYear()}-${String(pay.getMonth() + 1).padStart(2, '0')}`;
}
