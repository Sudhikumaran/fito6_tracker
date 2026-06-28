import { Router } from 'express';
import { z } from 'zod';
import { CategoryType } from '../types/enums';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth';
import { requireBusiness, BusinessRequest } from '../middleware/business';
import { auditLog } from '../middleware/auditLog';
import { categoryService } from '../services/category.service';
import { asyncHandler, sendSuccess } from '../utils/response';

const router = Router();
router.use(authenticate);
router.use(requireBusiness);

router.get(
  '/',
  asyncHandler(async (req: BusinessRequest, res) => {
    const type = req.query.type as CategoryType | undefined;
    const categories = await categoryService.list(req.businessId!, type);
    sendSuccess(res, categories);
  })
);

router.post(
  '/',
  auditLog('CREATE_CATEGORY', 'Category'),
  asyncHandler(async (req: BusinessRequest, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2, 'Category name must be at least 2 characters'),
        type: z.nativeEnum(CategoryType),
        parentId: z.string().optional(),
      })
      .parse(req.body);
    const category = await categoryService.create({ ...data, businessId: req.businessId! });
    sendSuccess(res, category, 201);
  })
);

router.put(
  '/:id',
  auditLog('UPDATE_CATEGORY', 'Category'),
  asyncHandler(async (req: AuthRequest & BusinessRequest, res) => {
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

    const category = await categoryService.update(req.businessId!, String(req.params.id), updateData);
    sendSuccess(res, category);
  })
);

router.delete(
  '/:id',
  adminOnly,
  auditLog('DELETE_CATEGORY', 'Category'),
  asyncHandler(async (req: BusinessRequest, res) => {
    const category = await categoryService.delete(req.businessId!, String(req.params.id));
    sendSuccess(res, category);
  })
);

export default router;
