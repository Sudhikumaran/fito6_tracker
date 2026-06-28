import { Router } from 'express';
import { z } from 'zod';
import { CategoryType } from '../types/enums';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth';
import { auditLog } from '../middleware/auditLog';
import { categoryService } from '../services/category.service';
import { asyncHandler, sendSuccess } from '../utils/response';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const type = req.query.type as CategoryType | undefined;
    const categories = await categoryService.list(type);
    sendSuccess(res, categories);
  })
);

router.post(
  '/',
  auditLog('CREATE_CATEGORY', 'Category'),
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2, 'Category name must be at least 2 characters'),
        type: z.nativeEnum(CategoryType),
        parentId: z.string().optional(),
      })
      .parse(req.body);
    const category = await categoryService.create(data);
    sendSuccess(res, category, 201);
  })
);

router.put(
  '/:id',
  auditLog('UPDATE_CATEGORY', 'Category'),
  asyncHandler(async (req: AuthRequest, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2, 'Category name must be at least 2 characters').optional(),
        parentId: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
      })
      .parse(req.body);

    const { isActive, ...rest } = data;
    const updateData =
      req.user?.role === 'ADMIN' && isActive !== undefined ? data : rest;

    const category = await categoryService.update(String(req.params.id), updateData);
    sendSuccess(res, category);
  })
);

router.delete(
  '/:id',
  adminOnly,
  auditLog('DELETE_CATEGORY', 'Category'),
  asyncHandler(async (req, res) => {
    const category = await categoryService.delete(req.params.id);
    sendSuccess(res, category);
  })
);

export default router;
