import { Category, Expense, Income } from '../types/models';
import { COL, findManyForBusiness, getCategoryMap, inDateRange, sumAmounts } from '../lib/firestore';
import {
  periodMonthFromDate,
  periodMonthInRange,
  periodMonthToDateRange,
  resolveExpensePeriodMonth,
} from '../utils/period';

export interface ProfitLossFilters {
  periodMonth?: string;
  periodFrom?: string;
  periodTo?: string;
}

function defaultPeriodMonth(): string {
  return periodMonthFromDate(new Date());
}

export const profitLossService = {
  async getStatement(businessId: string, filters: ProfitLossFilters = {}) {
    const periodMonth = filters.periodMonth || defaultPeriodMonth();
    const periodFrom = filters.periodFrom || periodMonth;
    const periodTo = filters.periodTo || periodMonth;

    const { start: incomeStart, end: incomeEnd } = periodMonthToDateRange(periodFrom);
    const incomeEndRange = periodMonthToDateRange(periodTo).end;

    const [incomes, expenses, categories] = await Promise.all([
      findManyForBusiness<Income>(COL.income, businessId),
      findManyForBusiness<Expense>(COL.expenses, businessId),
      findManyForBusiness<Category>(COL.categories, businessId),
    ]);

    const categoryMap = await getCategoryMap(categories.map((c) => c.id));

    const filteredIncomes = incomes.filter((i) =>
      inDateRange(i.date, incomeStart, incomeEndRange)
    );

    const filteredExpenses = expenses.filter((e) =>
      periodMonthInRange(resolveExpensePeriodMonth(e), periodFrom, periodTo)
    );

    const incomeByCategory = new Map<string, number>();
    for (const income of filteredIncomes) {
      incomeByCategory.set(
        income.categoryId,
        (incomeByCategory.get(income.categoryId) || 0) + Number(income.amount)
      );
    }

    const expenseByCategory = new Map<string, number>();
    for (const expense of filteredExpenses) {
      expenseByCategory.set(
        expense.categoryId,
        (expenseByCategory.get(expense.categoryId) || 0) + Number(expense.amount)
      );
    }

    const totalIncome = sumAmounts(filteredIncomes);
    const totalExpense = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 10000) / 100 : 0;

    const toBreakdown = (map: Map<string, number>) =>
      [...map.entries()]
        .map(([categoryId, total]) => ({
          categoryId,
          categoryName: categoryMap.get(categoryId)?.name || 'Unknown',
          total,
        }))
        .sort((a, b) => b.total - a.total);

    return {
      periodFrom,
      periodTo,
      basis: 'accrual' as const,
      note: 'Income by payment date. Expenses by bill-for month (periodMonth).',
      summary: {
        totalIncome,
        totalExpense,
        netProfit,
        profitMargin,
      },
      income: {
        total: totalIncome,
        byCategory: toBreakdown(incomeByCategory),
      },
      expenses: {
        total: totalExpense,
        byCategory: toBreakdown(expenseByCategory),
      },
    };
  },
};
