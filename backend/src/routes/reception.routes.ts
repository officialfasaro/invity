import { Router } from "express";
import {
  verifyReceptionPin,
  getReceptionStats,
  getReceptionGuests,
  scanReceptionGuest,
  toggleReceptionCheckin,
} from "../controllers/reception.controller";
import { receptionAuthMiddleware } from "../middleware/auth.middleware";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";

const router = Router();

// Public verification for PIN: Rate limit 10 requests per 60 seconds to prevent brute force
router.post(
  "/:slug/verify-pin",
  rateLimitMiddleware("reception_verify_pin", 10, 60),
  verifyReceptionPin
);

// Protected receptionist endpoints (Requires valid JWT or correct PIN)
router.get("/:slug/stats", receptionAuthMiddleware, getReceptionStats);
router.get("/:slug/guests", receptionAuthMiddleware, getReceptionGuests);
router.post("/:slug/scan", receptionAuthMiddleware, scanReceptionGuest);
router.post("/:slug/guests/:guestId/toggle", receptionAuthMiddleware, toggleReceptionCheckin);

export default router;
