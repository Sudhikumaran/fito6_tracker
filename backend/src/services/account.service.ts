import { AccountType } from '../types/enums';
import { Account } from '../types/models';
import { COL, create, findMany, getById, sortBy, update } from '../lib/firestore';
import { AppError } from '../utils/response';

export const accountService = {
  async list(type?: AccountType) {
    const accounts = await findMany<Account>(
      COL.accounts,
      (a) => a.isActive && (!type || a.type === type)
    );
    return sortBy(accounts, 'name', 'asc').map((account) => ({
      ...account,
      openingBalance: account.openingBalance != null ? Number(account.openingBalance) : 0,
    }));
  },

  async create(data: {
    name: string;
    type: AccountType;
    bankName?: string;
    lastFour?: string;
    openingBalance?: number;
  }) {
    const existing = (await findMany<Account>(COL.accounts)).find(
      (a) => a.name.toLowerCase() === data.name.trim().toLowerCase() && a.type === data.type && a.isActive
    );
    if (existing) return existing;

    return create<Account>(COL.accounts, {
      name: data.name.trim(),
      type: data.type,
      bankName: data.bankName?.trim() || null,
      lastFour: data.lastFour?.trim() || null,
      openingBalance: data.openingBalance ?? 0,
      isActive: true,
    });
  },

  async update(
    id: string,
    data: {
      name?: string;
      type?: AccountType;
      bankName?: string | null;
      lastFour?: string | null;
      openingBalance?: number;
      isActive?: boolean;
    }
  ) {
    const account = await getById<Account>(COL.accounts, id);
    if (!account) throw new AppError(404, 'Account not found');
    return update<Account>(COL.accounts, id, {
      ...data,
      name: data.name?.trim(),
      bankName: data.bankName === undefined ? undefined : data.bankName?.trim() || null,
      lastFour: data.lastFour === undefined ? undefined : data.lastFour?.trim() || null,
    });
  },

  async delete(id: string) {
    const account = await getById<Account>(COL.accounts, id);
    if (!account) throw new AppError(404, 'Account not found');
    return update<Account>(COL.accounts, id, { isActive: false });
  },
};
