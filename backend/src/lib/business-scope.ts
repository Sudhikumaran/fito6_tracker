import { AppError } from '../utils/response';

export function assertBusinessAccess<T extends { businessId?: string | null }>(
  item: T | null,
  businessId: string,
  label = 'Record'
): T {
  if (!item || item.businessId !== businessId) {
    throw new AppError(404, `${label} not found`);
  }
  return item;
}
