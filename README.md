# Fasaro Wedding Platform (Invity) — Monolithic Project

Platform undangan pernikahan digital modern & manajemen tamu terintegrasi (Express.js REST API + React 19 / Vite UI) siap dideploy ke **Vercel Serverless** dalam 1 project tunggal.

---

## 📁 Struktur Direktori

```
invity/
├── api/                       # Vercel Serverless Function entrypoint (index.ts)
├── server/                    # Backend REST API Express.js
│   ├── config/                # Prisma singleton client & constants
│   ├── controllers/           # Auth, Public, Dashboard, Admin, Payment, Upload
│   ├── middleware/            # Auth JWT, Rate Limit, Error Handler
│   ├── routes/                # Express Route Definitions
│   ├── services/              # Supabase, Midtrans, Google Auth, Sanity
│   ├── utils/                 # Validations & Helpers
│   ├── app.ts                 # Express Application instance (tanpa app.listen)
│   └── dev.ts                 # Dev server runner lokal (Port 5001)
├── prisma/                    # PostgreSQL Prisma ORM, migrations, seed
├── src/                       # Frontend UI (React 19 + Vite + Tailwind CSS)
├── public/                    # Static assets (audio music, favicon, manifest PWA)
├── index.html                 # Single Page Entrypoint Vite
├── vite.config.ts             # Vite build & local dev proxy (/api -> Port 5001)
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel deployment & serverless rewrites
├── package.json               # Dependensi & skrip aplikasi
├── .env.example               # Template environment variables
└── .env                       # Local environment variables
```

---

## 🚀 Panduan Menjalankan di Lokal (Development)

1. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan Aplikasi (Server + Client)**:
   ```bash
   npm run dev
   ```
   - **Frontend UI (Vite)**: `http://localhost:3001`
   - **Backend API (Express)**: `http://localhost:5001` (di-proxy otomatis oleh Vite untuk endpoint `/api` dan `/uploads`)

---

## ☁️ Deployment ke Vercel (1 Project Tunggal)

Ketika repositori ini dihubungkan ke Vercel:
- **Framework Preset**: Vite
- **Build Command**: `npm run build` *(menjalankan `prisma generate && vite build`)*
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Variabel Lingkungan (Environment Variables):
Tambahkan variabel dari file `.env.example` ke menu **Project Settings > Environment Variables** di Vercel:
- `DATABASE_URL` (Koneksi Supabase/Neon PostgreSQL)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (URL Vercel Anda, misal: `https://your-domain.vercel.app`)
- `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_VERSION`, `SANITY_API_TOKEN`
- `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`, `VITE_SANITY_API_VERSION`

---

## 🛠️ Perintah Berguna

```bash
# Validasi TypeScript
npm run typecheck

# Build bundle produksi
npm run build

# Push skema database Prisma
npm run db:push

# Migrasi database Prisma
npm run db:migrate

# Seed data awal
npm run db:seed

# Prisma Studio
npm run db:studio
```
