import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import { requireBusiness, BusinessRequest } from '../middleware/business';
import { analyticsService } from '../services/analytics.service';
import { asyncHandler, sendSuccess } from '../utils/response';

const router = Router();
router.use(authenticate);
router.use(requireBusiness);
router.use(adminOnly);

router.get(
  '/revenue',
  asyncHandler(async (req: BusinessRequest, res) => {
    const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'monthly';
    const data = await analyticsService.getRevenueAnalytics(req.businessId!, {
      period,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    });
    sendSuccess(res, data);
  })
);

router.get(
  '/expense',
  asyncHandler(async (req: BusinessRequest, res) => {
    const data = await analyticsService.getExpenseAnalytics(req.businessId!, {
      period: (req.query.period as 'daily' | 'weekly' | 'monthly') || 'monthly',
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    });
    sendSuccess(res, data);
  })
);

router.get(
  '/profit',
  asyncHandler(async (req: BusinessRequest, res) => {
    const data = await analyticsService.getProfitAnalytics(req.businessId!, {
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    });
    sendSuccess(res, data);
  })
);

router.get(
  '/cash-flow',
  asyncHandler(async (req: BusinessRequest, res) => {
    const data = await analyticsService.getCashFlowAnalytics(req.businessId!, {
      period: (req.query.period as 'daily' | 'weekly' | 'monthly') || 'monthly',
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    });
    sendSuccess(res, data);
  })
);

export default router;
