import { Router } from "express";
import {
  createOrder,
  getOnboardingState,
  midtransWebhook,
  onboardingSetup,
} from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";

const router = Router();

router.get("/onboarding-state", authMiddleware, getOnboardingState);
router.post("/onboarding-setup", authMiddleware, onboardingSetup);
router.post("/create-order", authMiddleware, rateLimitMiddleware("payment_order", 10, 60), createOrder);
router.post("/webhook", midtransWebhook);

export default router;
