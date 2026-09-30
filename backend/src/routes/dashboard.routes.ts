import { Router } from "express";
import {
  getDashboardInvitation,
  updateDashboardInvitation,
  patchDashboardInvitation,
  getGuests,
  addGuest,
  updateGuest,
  deleteGuest,
  toggleGuestCheckin,
  scanGuestQr,
  getGuestCheckinStats,
  getRsvpRecap,
  getDashboardPayments,
} from "../controllers/dashboard.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/invitation", getDashboardInvitation);
router.put("/invitation", updateDashboardInvitation);
router.patch("/invitation", patchDashboardInvitation);

router.get("/guests", getGuests);
router.post("/guests", addGuest);
router.put("/guests", updateGuest);
router.delete("/guests", deleteGuest);
router.post("/guests/checkin", toggleGuestCheckin);
router.post("/guests/scan", scanGuestQr);
router.get("/guests/checkin-stats", getGuestCheckinStats);

router.get("/rsvp-recap", getRsvpRecap);
router.get("/payments", getDashboardPayments);

export default router;
