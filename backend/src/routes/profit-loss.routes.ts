import { Router } from 'express';
import { z } from 'zod';
import { authenticate, adminOnly } from '../middleware/auth';
import { requireBusiness, BusinessRequest } from '../middleware/business';
import { profitLossService } from '../services/profit-loss.service';
import { isValidPeriodMonth } from '../utils/period';
import { asyncHandler, sendSuccess } from '../utils/response';

const router = Router();
router.use(authenticate);
router.use(requireBusiness);
router.use(adminOnly);

const periodMonthSchema = z
  .string()
  .refine(isValidPeriodMonth, { message: 'Use YYYY-MM format' })
  .optional();

router.get(
  '/',
  asyncHandler(async (req: BusinessRequest, res) => {
    const filters = z
      .object({
        periodMonth: periodMonthSchema,
        periodFrom: periodMonthSchema,
        periodTo: periodMonthSchema,
      })
      .parse({
        periodMonth: req.query.periodMonth as string | undefined,
        periodFrom: req.query.periodFrom as string | undefined,
        periodTo: req.query.periodTo as string | undefined,
      });

    const result = await profitLossService.getStatement(req.businessId!, filters);
    sendSuccess(res, result);
  })
);

export default router;
