import { CategoryType } from '../types/enums';
import { Category } from '../types/models';
import { COL, create, findMany, getById, sortBy, update } from '../lib/firestore';
import { AppError } from '../utils/response';

export const categoryService = {
  async list(type?: CategoryType) {
    const categories = await findMany<Category>(
      COL.categories,
      (c) => c.isActive && (!type || c.type === type)
    );
    const sorted = sortBy(categories, 'name', 'asc');
    const byId = new Map(sorted.map((c) => [c.id, c]));

    return sorted.map((cat) => ({
      ...cat,
      parent: cat.parentId ? byId.get(cat.parentId) || null : null,
      children: sorted.filter((c) => c.parentId === cat.id),
    }));
  },

  async create(data: { name: string; type: CategoryType; parentId?: string }) {
    const existing = (await findMany<Category>(COL.categories)).find(
      (c) => c.name === data.name && c.type === data.type && (c.parentId || null) === (data.parentId || null)
    );
    if (existing) return existing;
    return create<Category>(COL.categories, { ...data, isActive: true });
  },

  async update(
    id: string,
    data: { name?: string; isActive?: boolean; parentId?: string | null }
  ) {
    const cat = await getById<Category>(COL.categories, id);
    if (!cat) throw new AppError(404, 'Category not found');

    const nextParentId =
      data.parentId !== undefined ? data.parentId || null : cat.parentId || null;

    if (cat.type === CategoryType.INCOME && nextParentId) {
      throw new AppError(400, 'Income categories cannot have a parent group');
    }

    if (data.parentId && cat.type === CategoryType.EXPENSE) {
      const parent = await getById<Category>(COL.categories, data.parentId);
      if (!parent || parent.type !== CategoryType.EXPENSE || parent.parentId) {
        throw new AppError(400, 'Invalid expense category group');
      }
    }

    if (data.name !== undefined) {
      const name = data.name.trim();
      if (name.length < 2) {
        throw new AppError(400, 'Category name must be at least 2 characters');
      }

      const duplicate = (await findMany<Category>(COL.categories)).find(
        (c) =>
          c.id !== id &&
          c.isActive &&
          c.name === name &&
          c.type === cat.type &&
          (c.parentId || null) === nextParentId
      );
      if (duplicate) throw new AppError(409, 'Category already exists');

      data.name = name;
    }

    return update<Category>(COL.categories, id, {
      ...data,
      ...(data.parentId !== undefined ? { parentId: nextParentId ?? undefined } : {}),
    });
  },

  async delete(id: string) {
    const cat = await getById<Category>(COL.categories, id);
    if (!cat) throw new AppError(404, 'Category not found');
    return update<Category>(COL.categories, id, { isActive: false });
  },
};
