import { Router } from "express";
import {
  login,
  register,
  logout,
  googleAuth,
  googleCallback,
  googleAuthStatus,
  getMe,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";

const router = Router();

router.post("/login", rateLimitMiddleware("login", 10, 60), login);
router.post("/register", rateLimitMiddleware("register", 5, 60), register);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

router.get("/google/status", googleAuthStatus);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

export default router;
