import { PrismaClient, UserRole, SubscriptionTier } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // 1. Seed Super Admin
  const adminPasswordHash = await bcrypt.hash("An1357@$", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: { role: UserRole.ADMIN, passwordHash: adminPasswordHash },
    create: {
      email: "admin@admin.com",
      name: "Super Administrator",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });
  console.log(`✓ Super Admin seeded: ${admin.email}`);

  // 2. Seed Client Pengantin
  const clientPasswordHash = await bcrypt.hash("Pengantin123!", 10);
  const client = await prisma.user.upsert({
    where: { email: "pengantin@fasaro.id" },
    update: {},
    create: {
      email: "pengantin@fasaro.id",
      name: "Rian Pratama",
      passwordHash: clientPasswordHash,
      role: UserRole.USER,
    },
  });
  console.log(`✓ Client seeded: ${client.email}`);

  // 3. Seed Invitation for Client
  const invitation = await prisma.invitation.upsert({
    where: { slug: "rian-sinta" },
    update: {},
    create: {
      slug: "rian-sinta",
      title: "Pernikahan Rian & Sinta",
      userId: client.id,
      themeId: "botanical",
      musicUrl: "/music/wedding-romance.mp3",
      activeUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      coupleInfo: {
        groomName: "Rian Pratama, S.Kom",
        groomNickname: "Rian",
        groomFather: "Bpk. Bambang Wijaya",
        groomMother: "Ibu Sri Wahyuni",
        groomInstagram: "rian.pratama",
        groomPhoto:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        brideName: "Sinta Anggraini, S.E",
        brideNickname: "Sinta",
        brideFather: "Bpk. Herman Santoso",
        brideMother: "Ibu Dewi Lestari",
        brideInstagram: "sinta.anggraini",
        bridePhoto:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        greetingMessage:
          "Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Dengan memohon rahmat dan ridho-Nya, kami mengundang Anda untuk merayakan hari bahagia pernikahan kami.",
        stories: [
          {
            date: "12 Januari 2024",
            title: "Pertama Berjumpa",
            story: "Dipertemukan dalam kegiatan komunitas, senyum dan tutur katanya berkesan mendalam.",
          },
          {
            date: "18 Agustus 2025",
            title: "Lamaran Resmi",
            story: "Mengikat komitmen suci di hadapan keluarga besar menuju jenjang pernikahan.",
          },
        ],
      },
      eventSchedules: {
        create: [
          {
            eventName: "Akad Nikah",
            date: new Date("2026-10-24T08:00:00.000Z"),
            startTime: "08:00",
            endTime: "10:00",
            venueName: "Masjid Agung Al-Falah",
            address: "Jl. Diponegoro No. 12, Surabaya",
            mapsUrl: "https://maps.google.com",
          },
          {
            eventName: "Resepsi Pernikahan",
            date: new Date("2026-10-24T11:00:00.000Z"),
            startTime: "11:00",
            endTime: "14:00",
            venueName: "Grand Ballroom Hotel Sahid",
            address: "Jl. Kusuma Bangsa No. 88, Surabaya",
            mapsUrl: "https://maps.google.com",
          },
        ],
      },
      bankAccounts: {
        create: [
          {
            bankName: "BCA",
            accountNumber: "8291039481",
            accountHolder: "Rian Pratama",
          },
          {
            bankName: "Bank Mandiri",
            accountNumber: "1420019283741",
            accountHolder: "Sinta Anggraini",
          },
        ],
      },
      galleries: {
        create: [
          {
            imageUrl:
              "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
            caption: "Prewedding Outdoor",
            sortOrder: 0,
          },
          {
            imageUrl:
              "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
            caption: "Prewedding Studio",
            sortOrder: 1,
          },
        ],
      },
      guests: {
        create: [
          {
            name: "Budi & Ani",
            slugCode: "budi-ani",
            phoneNumber: "081234567890",
            quota: 2,
          },
          {
            name: "Keluarga Besar Bpk. Hendra",
            slugCode: "keluarga-hendra",
            phoneNumber: "081987654321",
            quota: 4,
          },
          {
            name: "Dinda & Pasangan",
            slugCode: "dinda-pasangan",
            phoneNumber: "082133445566",
            quota: 2,
          },
        ],
      },
    },
  });
  console.log(`✓ Invitation seeded: ${invitation.slug}`);

  // 4. Seed Theme Catalog (1 Active Theme)
  const themes = [
    {
      themeKey: "botanical",
      name: "Botanical Tema 01",
      category: "Botanical",
      thumbnail: "/templates/botanical/cover.jpg",
      previewUrl: "/invitation/demo-botanical",
      isPremium: false,
      isActive: true,
    },
    {
      themeKey: "editorial",
      name: "Editorial Tema 01",
      category: "Editorial",
      thumbnail: "/templates/editorial/cover.jpg",
      previewUrl: "/invitation/demo-editorial",
      isPremium: false,
      isActive: true,
    },
    {
      themeKey: "gothic",
      name: "Gothic Tema 01",
      category: "Gothic",
      thumbnail: "/templates/gothic/cover.jpg",
      previewUrl: "/invitation/demo-gothic",
      isPremium: false,
      isActive: true,
    },
    {
      themeKey: "raka-ayu",
      name: "Royal Tema 01",
      category: "Royal",
      thumbnail: "/templates/raka-ayu/cover.jpg",
      previewUrl: "/invitation/demo-raka-ayu",
      isPremium: false,
      isActive: true,
    },
    {
      themeKey: "wedding-3d",
      name: "3D Tema 01",
      category: "3D",
      thumbnail: "/templates/wedding-3d/cover.jpg",
      previewUrl: "/invitation/demo-wedding-3d",
      isPremium: false,
      isActive: true,
    },
  ];

  for (const t of themes) {
    await prisma.themeCatalog.upsert({
      where: { themeKey: t.themeKey },
      update: t,
      create: t,
    });
  }
  console.log(`✓ ${themes.length} themes seeded`);

  // 5. Seed System Settings
  const defaultSettings = [
    {
      key: "midtrans_server_key",
      value: "SB-Mid-server-YOUR_SANDBOX_SERVER_KEY",
      description: "Server key untuk Midtrans Payment Sandbox",
    },
    {
      key: "manual_qris_bank_info",
      value: "BCA 8291039481 a/n PT Fasaro Digital",
      description: "Nomor rekening tujuan transfer manual",
    },
    {
      key: "manual_qris_image_url",
      value: "",
      description: "URL gambar QRIS manual toko",
    },
    {
      key: "max_photo_upload",
      value: "20",
      description: "Batas maksimum foto galeri per undangan",
    },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: s,
      create: s,
    });
  }
  console.log(`✓ ${defaultSettings.length} system settings seeded`);

  console.log("Database seed completed successfully! 🎉");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
