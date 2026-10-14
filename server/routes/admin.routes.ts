import { Router } from "express";
import {
  getMetrics,
  getClients,
  patchClient,
  impersonate,
  getThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  getAdminSettings,
  updateAdminSettings,
  getAdminPayments,
  getVerifyPayments,
  actionVerifyPayment,
  getUserRoles,
  patchUserRole,
  getMaintenance,
  actionMaintenance,
  adminUpload,
  adminScanGuestCheckin,
} from "../controllers/admin.controller";
import { adminMiddleware } from "../middleware/auth.middleware";
import { uploadMemory } from "../controllers/upload.controller";

const router = Router();

router.use(adminMiddleware);

router.get("/metrics", getMetrics);
router.get("/clients", getClients);
router.patch("/clients", patchClient);
router.post("/impersonate", impersonate);

router.get("/themes", getThemes);
router.post("/themes", createTheme);
router.put("/themes", updateTheme);
router.delete("/themes", deleteTheme);

router.get("/settings", getAdminSettings);
router.put("/settings", updateAdminSettings);

router.get("/payments", getAdminPayments);
router.get("/verify-payment", getVerifyPayments);
router.post("/verify-payment", actionVerifyPayment);

router.get("/users/role", getUserRoles);
router.patch("/users/role", patchUserRole);

router.get("/maintenance", getMaintenance);
router.post("/maintenance", actionMaintenance);

router.post("/upload", uploadMemory.single("file"), adminUpload);
router.post("/guests/scan", adminScanGuestCheckin);

export default router;
