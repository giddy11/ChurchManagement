import { Router } from "express";
import type { RequestHandler } from "express";
import {
  listAllCustomDomains,
  approveCustomDomain,
  rejectCustomDomain,
  deactivateCustomDomain,
  reactivateCustomDomain,
  resolvePublicCustomDomain,
  resolveSelfCustomDomain,
} from "../controllers/custom-domain.controller";
import { authMiddleware, superAdminMiddleware } from "../middleware/auth.middleware";
import { UserService } from "../services/user.service";

const router = Router();
const auth = authMiddleware(new UserService()) as RequestHandler;

// Public resolvers — used by the sign-in page to fetch branding.
router.get("/resolve", resolveSelfCustomDomain);
router.get("/resolve/:host", resolvePublicCustomDomain);

// Super admin management
router.get("/", auth, superAdminMiddleware, listAllCustomDomains);
router.post("/:id/approve", auth, superAdminMiddleware, approveCustomDomain);
router.post("/:id/reject", auth, superAdminMiddleware, rejectCustomDomain);
router.post("/:id/deactivate", auth, superAdminMiddleware, deactivateCustomDomain);
router.post("/:id/reactivate", auth, superAdminMiddleware, reactivateCustomDomain);

export default router;
