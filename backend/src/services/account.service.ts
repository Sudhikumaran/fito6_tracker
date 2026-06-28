import { AccountType } from '../types/enums';
import { Account } from '../types/models';
import {
  COL,
  create,
  findManyForBusiness,
  getById,
  sortBy,
  update,
} from '../lib/firestore';
import { assertBusinessAccess } from '../lib/business-scope';

export const accountService = {
  async list(businessId: string, type?: AccountType) {
    const accounts = await findManyForBusiness<Account>(
      COL.accounts,
      businessId,
      (a) => a.isActive && (!type || a.type === type)
    );
    return sortBy(accounts, 'name', 'asc').map((account) => ({
      ...account,
      openingBalance: account.openingBalance != null ? Number(account.openingBalance) : 0,
    }));
  },

  async create(data: {
    businessId: string;
    name: string;
    type: AccountType;
    bankName?: string;
    lastFour?: string;
    openingBalance?: number;
  }) {
    const existing = (await findManyForBusiness<Account>(COL.accounts, data.businessId)).find(
      (a) =>
        a.name.toLowerCase() === data.name.trim().toLowerCase() &&
        a.type === data.type &&
        a.isActive
    );
    if (existing) return existing;

    return create<Account>(COL.accounts, {
      businessId: data.businessId,
      name: data.name.trim(),
      type: data.type,
      bankName: data.bankName?.trim() || null,
      lastFour: data.lastFour?.trim() || null,
      openingBalance: data.openingBalance ?? 0,
      isActive: true,
    });
  },

  async update(
    businessId: string,
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
    assertBusinessAccess(await getById<Account>(COL.accounts, id), businessId, 'Account');
    return update<Account>(COL.accounts, id, {
      ...data,
      name: data.name?.trim(),
      bankName: data.bankName === undefined ? undefined : data.bankName?.trim() || null,
      lastFour: data.lastFour === undefined ? undefined : data.lastFour?.trim() || null,
    });
  },

  async delete(businessId: string, id: string) {
    assertBusinessAccess(await getById<Account>(COL.accounts, id), businessId, 'Account');
    return update<Account>(COL.accounts, id, { isActive: false });
  },
};
