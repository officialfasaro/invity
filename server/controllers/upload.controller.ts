import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";
import multer from "multer";
import { z } from "zod";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  MAX_IMAGE_SIZE,
  ALLOWED_FOLDERS,
  ALLOWED_MUSIC_MIME_TYPES,
  ALLOWED_MUSIC_EXTENSIONS,
  MAX_MUSIC_SIZE,
} from "../config/constants";
import {
  getSupabaseAdminClient,
  getPublicStorageUrl,
  generateSignedUploadUrl,
  SUPABASE_STORAGE_BUCKET,
} from "../services/supabase.service";

export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max buffer
});

export async function uploadImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const file = req.file;
    const folderParam = (req.body.folder as string) || "couples";
    const folder = ALLOWED_FOLDERS.has(folderParam) ? folderParam : "couples";

    if (!file) {
      res.status(400).json({ success: false, error: "File gambar wajib dipilih" });
      return;
    }

    const originalExt = path.extname(file.originalname).toLowerCase();
    const isValidType =
      ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype) ||
      ALLOWED_IMAGE_EXTENSIONS.has(originalExt);

    if (!isValidType) {
      res.status(400).json({
        success: false,
        error: "Format gambar tidak didukung. Harap gunakan format JPG, PNG, atau WebP.",
      });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      res.status(400).json({
        success: false,
        error: "Ukuran gambar terlalu besar. Maksimal 10MB.",
      });
      return;
    }

    if (
      (folder === "couples" || folder === "galleries") &&
      file.size > 1.15 * 1024 * 1024
    ) {
      res.status(400).json({
        success: false,
        error: "Ukuran foto galeri dan foto mempelai maksimal 1MB.",
      });
      return;
    }

    const cleanBaseName = path
      .basename(file.originalname, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);
    const safeExt = originalExt || ".jpg";
    const uniqueFilename = `${folder}-${Date.now()}-${cleanBaseName}${safeExt}`;
    const buffer = file.buffer;

    let publicUrl: string | null = null;

    // 1. Try Supabase Storage
    try {
      const storageKey = `${folder}/${user.userId}/${uniqueFilename}`;
      const supabase = getSupabaseAdminClient();
      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(storageKey, buffer, {
          contentType: file.mimetype || "image/jpeg",
          upsert: true,
        });

      if (!uploadError) {
        publicUrl = getPublicStorageUrl(storageKey);
      }
    } catch {
      publicUrl = null;
    }

    // 2. Fallback to local storage (both in backend and frontend public if available)
    if (!publicUrl) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
      await fs.mkdir(uploadDir, { recursive: true });
      const localFilePath = path.join(uploadDir, uniqueFilename);
      await fs.writeFile(localFilePath, buffer);
      publicUrl = `/uploads/${folder}/${uniqueFilename}`;
    }

    res.json({
      success: true,
      url: publicUrl,
      fileName: file.originalname,
      size: file.size,
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadMusic(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, error: "File audio wajib dipilih" });
      return;
    }

    const originalExt = path.extname(file.originalname).toLowerCase();
    const isValidType =
      ALLOWED_MUSIC_MIME_TYPES.has(file.mimetype) ||
      ALLOWED_MUSIC_EXTENSIONS.has(originalExt);

    if (!isValidType) {
      res.status(400).json({
        success: false,
        error: "Format audio tidak didukung. Harap gunakan format MP3, M4A, WAV, atau OGG.",
      });
      return;
    }

    if (file.size > MAX_MUSIC_SIZE) {
      res.status(400).json({
        success: false,
        error: "Ukuran audio terlalu besar. Maksimal ukuran 15MB.",
      });
      return;
    }

    const cleanBaseName = path
      .basename(file.originalname, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);
    const safeExt = originalExt || ".mp3";
    const uniqueFilename = `music-${Date.now()}-${cleanBaseName}${safeExt}`;
    const buffer = file.buffer;

    let publicUrl: string | null = null;

    try {
      const storageKey = `music/${user.userId}/${uniqueFilename}`;
      const supabase = getSupabaseAdminClient();
      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(storageKey, buffer, {
          contentType: file.mimetype || "audio/mpeg",
          upsert: true,
        });

      if (!uploadError) {
        publicUrl = getPublicStorageUrl(storageKey);
      }
    } catch {
      publicUrl = null;
    }

    if (!publicUrl) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "music");
      await fs.mkdir(uploadDir, { recursive: true });
      const localFilePath = path.join(uploadDir, uniqueFilename);
      await fs.writeFile(localFilePath, buffer);
      publicUrl = `/uploads/music/${uniqueFilename}`;
    }

    res.json({
      success: true,
      url: publicUrl,
      fileName: file.originalname,
      size: file.size,
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadPaymentProof(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, error: "File bukti transfer wajib dipilih" });
      return;
    }

    const originalExt = path.extname(file.originalname).toLowerCase() || ".jpg";
    const cleanBaseName = path
      .basename(file.originalname, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 25);
    const uniqueFilename = `proof-${Date.now()}-${cleanBaseName}${originalExt}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "proofs");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, uniqueFilename);
    await fs.writeFile(filePath, file.buffer);

    const publicUrl = `/uploads/proofs/${uniqueFilename}`;

    res.json({
      success: true,
      url: publicUrl,
      fileName: file.originalname,
      size: file.size,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPresignedUrl(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const schema = z.object({
      filename: z.string().min(1, "Filename wajib disertakan"),
      contentType: z
        .string()
        .regex(/^image\/(jpeg|jpg|png|webp|gif)$/, "Tipe file harus berupa gambar"),
      folder: z.enum(["galleries", "couples", "qris", "proofs"]).default("galleries"),
    });

    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: "Parameter tidak valid",
        details: parsed.error.format(),
      });
      return;
    }

    const cleanFilename = parsed.data.filename
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "-")
      .replace(/-+/g, "-");

    const key = `${parsed.data.folder}/${user.userId}/${Date.now()}-${cleanFilename}`;
    const { signedUrl, token } = await generateSignedUploadUrl(key, { upsert: true });
    const fileUrl = getPublicStorageUrl(key);

    res.json({
      uploadUrl: signedUrl,
      fileUrl,
      key,
      token,
      expiresIn: 300,
    });
  } catch (error) {
    next(error);
  }
}
