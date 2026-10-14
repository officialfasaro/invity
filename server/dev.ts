import app from "./app";
import prisma from "./config/prisma";

const PORT = Number(process.env.PORT || process.env.BACKEND_PORT || 5001);

const server = app.listen(PORT, () => {
  console.log(`🚀 [Fasaro Server] Express dev server running at http://localhost:${PORT}`);
  console.log(`📡 [Fasaro Server] Environment: ${process.env.NODE_ENV || "development"}`);
});

async function gracefulShutdown(signal: string) {
  console.log(`\n[Fasaro Server] Sinyal ${signal} diterima, menutup koneksi server...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("[Fasaro Server] Koneksi database ditutup. Server berhenti.");
    process.exit(0);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
