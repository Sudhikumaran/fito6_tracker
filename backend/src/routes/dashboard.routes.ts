import { Router } from 'express';
import { Role } from '../types/enums';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireBusiness, BusinessRequest } from '../middleware/business';
import { authService } from '../services/auth.service';
import { dashboardService } from '../services/dashboard.service';
import { asyncHandler, sendSuccess } from '../utils/response';

const router = Router();

router.use(authenticate);

router.get(
  '/me',
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await authService.getProfile(req.user!.userId);
    sendSuccess(res, user);
  })
);

router.get(
  '/dashboard',
  requireBusiness,
  asyncHandler(async (req: BusinessRequest, res) => {
    if (req.user!.role === Role.ADMIN) {
      const data = await dashboardService.getAdminDashboard(req.businessId!);
      sendSuccess(res, data);
    } else {
      const data = await dashboardService.getStaffDashboard(req.businessId!, req.user!.userId);
      sendSuccess(res, data);
    }
  })
);

export default router;
