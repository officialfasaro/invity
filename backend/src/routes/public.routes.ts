import { Router } from "express";
import {
  getPublicInvitation,
  submitRsvp,
  getWishes,
  submitWish,
  getPublicSystemSettings,
  downloadPublicFile,
  getPublicShowcase,
  getPublicTestimonials,
  getPublicThemeStats,
} from "../controllers/public.controller";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";

const router = Router();

router.get("/invitations/:slug", getPublicInvitation);
router.post("/rsvp", rateLimitMiddleware("submit_rsvp", 10, 300), submitRsvp);
router.get("/wishes", rateLimitMiddleware("get_wishes", 60, 60), getWishes);
router.post("/wishes", rateLimitMiddleware("submit_wish", 5, 60), submitWish);
router.get("/settings", getPublicSystemSettings);
router.get("/download-file", rateLimitMiddleware("download_file", 60, 60), downloadPublicFile);
router.get("/showcase", rateLimitMiddleware("get_showcase", 60, 60), getPublicShowcase);
router.get("/testimonials", rateLimitMiddleware("get_testimonials", 60, 60), getPublicTestimonials);
router.get("/theme-stats", rateLimitMiddleware("get_theme_stats", 60, 60), getPublicThemeStats);

export default router;
