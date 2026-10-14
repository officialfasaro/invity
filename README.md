# Fasaro Wedding Platform — Monorepo

Arsitektur aplikasi terpisah sejajar menjadi **Backend (Express.js)** dan **Frontend (Next.js 16)** di bawah root folder `fasaro`.

## 📁 Struktur Monorepo

```
fasaro/
├── backend/                  # Dedicated Express.js REST API
│   ├── prisma/               # Prisma schema, migrations & seed
│   ├── src/
│   │   ├── config/           # Prisma client, constants
│   │   ├── controllers/      # REST API Controllers (Auth, Public, Dashboard, Admin, Payment, Upload)
│   │   ├── middleware/       # Auth JWT, rate limit, error handler
│   │   ├── routes/           # Express Route definitions
│   │   ├── services/         # Supabase, Midtrans, Google Auth, Settings
│   │   ├── utils/            # Validations, Quotes
│   │   └── server.ts         # Express server (Port 5000)
│   ├── .env                  # Backend Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # React 19 + Vite UI
│   ├── src/                  # React components, pages & routes (Port 3001)
│   ├── public/               # Static assets & PWA manifest
│   ├── vite.config.ts        # Vite proxy rewrites (/api & /uploads -> Port 5001)
│   ├── .env                  # Frontend Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── package.json              # Monorepo workspace orchestrator
└── README.md
```

## 🚀 Menjalankan Server Pengembangan (Dev)

Jalankan kedua service (Backend & Frontend) secara bersamaan dari root folder:

```bash
npm run dev
```

Atau jalankan masing-masing service secara terpisah:

```bash
# Terminal 1: Backend Express (Port 5001)
npm run dev:backend

# Terminal 2: Frontend Vite (Port 3001)
npm run dev:frontend
```


## 🛠️ Perintah Berguna Lainnya

```bash
# Typecheck seluruh monorepo (Frontend + Backend)
npm run typecheck

# Build seluruh monorepo
npm run build

# Database commands (di folder backend)
cd backend
npm run db:push      # Push schema ke database
npm run db:seed      # Seed initial demo data
npm run db:studio    # Buka Prisma Studio GUI
```

