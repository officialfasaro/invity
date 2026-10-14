import { z } from "zod";

export const eventScheduleSchema = z.object({
  eventName: z.string().min(1, "Nama acara wajib diisi").max(100),
  date: z.string().min(1, "Tanggal acara wajib diisi"),
  startTime: z.string().min(1, "Waktu mulai wajib diisi").max(50),
  endTime: z.string().max(50).optional().nullable(),
  venueName: z.string().min(1, "Nama tempat wajib diisi").max(200),
  address: z.string().min(1, "Alamat wajib diisi").max(500),
  mapsUrl: z
    .string()
    .refine(
      (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val) || val.includes("maps"),
      "Format link Google Maps tidak valid"
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export const galleryItemSchema = z.object({
  imageUrl: z
    .string()
    .min(1, "URL atau file gambar wajib diisi")
    .refine(
      (val) => val.startsWith("/") || /^https?:\/\//.test(val) || val.startsWith("blob:"),
      "Format URL atau path gambar tidak valid"
    ),
  caption: z.string().max(300).optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const bankAccountSchema = z.object({
  bankName: z.string().min(1, "Nama bank/e-wallet wajib diisi").max(50),
  accountNumber: z.string().min(1, "Nomor rekening wajib diisi").max(50),
  accountHolder: z.string().min(1, "Nama pemilik rekening wajib diisi").max(100),
  qrisImageUrl: z
    .string()
    .refine(
      (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val),
      "Format URL atau file QRIS tidak valid"
    )
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type EventScheduleInput = z.infer<typeof eventScheduleSchema>;
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;
export type BankAccountInput = z.infer<typeof bankAccountSchema>;
export type CoupleInfoInput = z.infer<typeof coupleInfoSchema>;


export const coupleInfoSchema = z.object({
  groomName: z.string().min(1, "Nama pengantin pria wajib diisi").max(100),
  groomNickname: z.string().min(1, "Nama panggilan mempelai pria wajib diisi").max(50),
  groomFather: z.string().max(100).optional().nullable(),
  groomMother: z.string().max(100).optional().nullable(),
  groomInstagram: z.string().max(50).optional().nullable(),
  groomPhoto: z
    .string()
    .refine(
      (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val),
      "Format URL atau file foto tidak valid"
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  brideName: z.string().min(1, "Nama pengantin wanita wajib diisi").max(100),
  brideNickname: z.string().min(1, "Nama panggilan mempelai wanita wajib diisi").max(50),
  brideFather: z.string().max(100).optional().nullable(),
  brideMother: z.string().max(100).optional().nullable(),
  brideInstagram: z.string().max(50).optional().nullable(),
  bridePhoto: z
    .string()
    .refine(
      (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val),
      "Format URL atau file foto tidak valid"
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  greetingMessage: z.string().max(3000).optional().nullable(),
  musicUrl: z.string().optional().nullable(),
  youtubeVideoUrl: z.string().optional().nullable(),
  desktopCoverImage: z
    .string()
    .refine(
      (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val),
      "Format URL atau file foto cover desktop tidak valid"
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  useVideoAsDesktopCover: z.boolean().optional().nullable(),
  backgroundImage: z
    .string()
    .refine(
      (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val) || val.startsWith("data:"),
      "Format URL atau file background tidak valid"
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  floralOrnament: z.string().max(50).optional().nullable(),
  giftAddress: z.string().max(500).optional().nullable(),
  giftReceiver: z.string().max(100).optional().nullable(),
  giftPhone: z.string().max(50).optional().nullable(),
  stories: z
    .array(
      z.object({
        date: z.string(),
        title: z.string(),
        story: z.string(),
        imageUrl: z
          .string()
          .refine(
            (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val),
            "Format URL atau file foto kisah cinta tidak valid"
          )
          .optional()
          .nullable()
          .or(z.literal("")),
      })
    )
    .optional()
    .nullable(),
  receptionPin: z
    .string()
    .min(4, "PIN Meja Tamu minimal 4 karakter")
    .max(12, "PIN Meja Tamu maksimal 12 karakter")
    .optional()
    .nullable(),
});

export const invitationSchema = z.object({
  title: z.string().min(1, "Judul undangan minimal 1 karakter").max(150),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda strip"),
  themeId: z.string().min(1, "Tema wajib dipilih").max(50),
  coupleInfo: coupleInfoSchema,
  musicUrl: z.string().optional().nullable(),
  youtubeVideoUrl: z.string().optional().nullable(),
  activeUntil: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
  schedules: z.array(eventScheduleSchema).default([]),
  galleries: z.array(galleryItemSchema).default([]),
  bankAccounts: z.array(bankAccountSchema).default([]),
});

export const updateInvitationSchema = invitationSchema.partial().extend({
  title: z.string().min(3).max(150).optional(),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  themeId: z.string().min(1).max(50).optional(),
  coupleInfo: coupleInfoSchema.partial().optional(),
  selectedTier: z.enum(["STARTER", "ELEGANT", "ULTIMATE"]).optional().nullable(),
});

export const rsvpSchema = z.object({
  invitationId: z.string().min(1, "ID undangan wajib diisi"),
  guestName: z.string().min(1, "Nama tamu wajib diisi").max(100),
  status: z.enum(["ATTENDING", "NOT_ATTENDING", "UNCERTAIN"], {
    message: "Status kehadiran tidak valid",
  }),
  attendeeCount: z.number().int().min(1, "Jumlah tamu minimal 1").max(10, "Jumlah tamu maksimal 10").default(1),
  sessionChosen: z.string().max(50).optional().nullable(),
});

export const wishSchema = z.object({
  invitationId: z.string().min(1, "ID undangan wajib diisi"),
  senderName: z.string().min(1, "Nama pengirim wajib diisi").max(100),
  message: z.string().min(1, "Pesan doa wajib diisi").max(500, "Pesan maksimal 500 karakter"),
  reaction: z.string().max(20).optional().nullable(),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().min(1, "Email wajib diisi").email("Format email tidak valid").toLowerCase(),
  password: z.string().min(6, "Password minimal 6 karakter").max(100),
  plan: z.enum(["STARTER", "ELEGANT", "ULTIMATE"]).optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi").email("Format email tidak valid").toLowerCase(),
  password: z.string().min(1, "Password wajib diisi"),
});

export const createOrderSchema = z.object({
  invitationId: z.string().min(1, "ID undangan wajib diisi").optional().nullable(),
  tier: z.enum(["STARTER", "ELEGANT", "ULTIMATE"]),
  amount: z.number().positive("Nominal harus lebih dari 0"),
  paymentType: z.enum(["GATEWAY", "MANUAL_QRIS", "MANUAL_BANK", "MANUAL"]).default("MANUAL_BANK"),
  proofImageUrl: z
    .string()
    .refine(
      (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val),
      "Format URL atau path bukti transfer tidak valid"
    )
    .optional()
    .nullable(),
});

export type InvitationInput = z.infer<typeof invitationSchema>;
export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
export type WishInput = z.infer<typeof wishSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
