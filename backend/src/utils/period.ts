const PERIOD_MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidPeriodMonth(value: string): boolean {
  return PERIOD_MONTH_RE.test(value);
}

export function periodMonthFromDate(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function resolveExpensePeriodMonth(expense: {
  periodMonth?: string | null;
  date: Date;
}): string {
  if (expense.periodMonth && isValidPeriodMonth(expense.periodMonth)) {
    return expense.periodMonth;
  }
  return periodMonthFromDate(expense.date);
}

export function previousPeriodMonth(date: Date | string): string {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return periodMonthFromDate(d);
}

export function periodMonthInRange(
  periodMonth: string,
  from?: string,
  to?: string
): boolean {
  if (from && periodMonth < from) return false;
  if (to && periodMonth > to) return false;
  return true;
}

export function periodMonthToDateRange(periodMonth: string): { start: Date; end: Date } {
  const [year, month] = periodMonth.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}
