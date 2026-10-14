import { Router } from "express";
import {
  uploadImage,
  uploadMusic,
  uploadPaymentProof,
  getPresignedUrl,
  uploadMemory,
} from "../controllers/upload.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";

const router = Router();

router.post(
  "/image",
  authMiddleware,
  rateLimitMiddleware("upload_image", 20, 60),
  uploadMemory.single("file"),
  uploadImage
);

router.post(
  "/music",
  authMiddleware,
  rateLimitMiddleware("upload_music", 10, 60),
  uploadMemory.single("file"),
  uploadMusic
);

router.post(
  "/payment-proof",
  rateLimitMiddleware("upload_proof", 10, 60),
  uploadMemory.single("file"),
  uploadPaymentProof
);

router.get(
  "/presigned-url",
  authMiddleware,
  rateLimitMiddleware("upload_presigned", 20, 3600),
  getPresignedUrl
);

export default router;
