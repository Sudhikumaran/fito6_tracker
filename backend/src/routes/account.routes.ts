import { Router } from 'express';
import { z } from 'zod';
import { AccountType } from '../types/enums';
import { authenticate, adminOnly, AuthRequest } from '../middleware/auth';
import { requireBusiness, BusinessRequest } from '../middleware/business';
import { auditLog } from '../middleware/auditLog';
import { accountService } from '../services/account.service';
import { asyncHandler, sendSuccess } from '../utils/response';

const router = Router();
router.use(authenticate);
router.use(requireBusiness);

router.get(
  '/',
  asyncHandler(async (req: BusinessRequest, res) => {
    const type = req.query.type as AccountType | undefined;
    const accounts = await accountService.list(req.businessId!, type);
    sendSuccess(res, accounts);
  })
);

router.post(
  '/',
  auditLog('CREATE_ACCOUNT', 'Account'),
  asyncHandler(async (req: BusinessRequest, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2, 'Account name must be at least 2 characters'),
        type: z.nativeEnum(AccountType),
        bankName: z.string().trim().optional(),
        lastFour: z.string().trim().max(4).optional(),
        openingBalance: z.coerce.number().optional(),
      })
      .parse(req.body);
    const account = await accountService.create({ ...data, businessId: req.businessId! });
    sendSuccess(res, account, 201);
  })
);

router.put(
  '/:id',
  auditLog('UPDATE_ACCOUNT', 'Account'),
  asyncHandler(async (req: AuthRequest & BusinessRequest, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2).optional(),
        type: z.nativeEnum(AccountType).optional(),
        bankName: z.string().trim().nullable().optional(),
        lastFour: z.string().trim().max(4).nullable().optional(),
        openingBalance: z.coerce.number().optional(),
        isActive: z.boolean().optional(),
      })
      .parse(req.body);

    const { isActive, ...rest } = data;
    const updateData = req.user?.role === 'ADMIN' && isActive !== undefined ? data : rest;

    const account = await accountService.update(req.businessId!, String(req.params.id), updateData);
    sendSuccess(res, account);
  })
);

router.delete(
  '/:id',
  adminOnly,
  auditLog('DELETE_ACCOUNT', 'Account'),
  asyncHandler(async (req: BusinessRequest, res) => {
    const account = await accountService.delete(req.businessId!, String(req.params.id));
    sendSuccess(res, account);
  })
);

export default router;
