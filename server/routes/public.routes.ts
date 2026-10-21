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
  getPublicThemes,
  recordPublicInvitationVisit,
  handleVisitorHeartbeat,
  handleVisitorLeave,
  getLiveVisitors,
} from "../controllers/public.controller";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";

const router = Router();

router.get("/themes", rateLimitMiddleware("get_themes", 60, 60), getPublicThemes);
router.get("/invitations/:slug", getPublicInvitation);
router.post("/invitations/:slug/visit", rateLimitMiddleware("record_visit", 30, 60), recordPublicInvitationVisit);
router.post("/invitations/:slug/heartbeat", handleVisitorHeartbeat);
router.post("/invitations/:slug/leave", handleVisitorLeave);
router.get("/invitations/:slug/live", getLiveVisitors);
router.post("/rsvp", rateLimitMiddleware("submit_rsvp", 10, 300), submitRsvp);
router.get("/wishes", rateLimitMiddleware("get_wishes", 60, 60), getWishes);
router.post("/wishes", rateLimitMiddleware("submit_wish", 5, 60), submitWish);
router.get("/settings", getPublicSystemSettings);
router.get("/download-file", rateLimitMiddleware("download_file", 60, 60), downloadPublicFile);
router.get("/showcase", rateLimitMiddleware("get_showcase", 60, 60), getPublicShowcase);
router.get("/testimonials", rateLimitMiddleware("get_testimonials", 60, 60), getPublicTestimonials);
router.get("/theme-stats", rateLimitMiddleware("get_theme_stats", 60, 60), getPublicThemeStats);

export default router;
