import { Router } from "express";
import {
  listInvitations,
  createInvitation,
  getInvitationById,
  updateInvitationById,
} from "../controllers/invitation.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", listInvitations);
router.post("/", createInvitation);
router.get("/:id", getInvitationById);
router.put("/:id", updateInvitationById);

export default router;
