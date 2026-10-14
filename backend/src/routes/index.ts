import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import invitationRoutes from "./invitation.routes";
import publicRoutes from "./public.routes";
import dashboardRoutes from "./dashboard.routes";
import adminRoutes from "./admin.routes";
import uploadRoutes from "./upload.routes";
import paymentRoutes from "./payment.routes";
import receptionRoutes from "./reception.routes";
import prisma from "../config/prisma";

const apiRouter = Router();

// Health Check Endpoint
apiRouter.get("/health", async (_req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;

    res.json({
      status: "ok",
      service: "fasaro-backend-api",
      timestamp: new Date().toISOString(),
      database: "connected",
      latencyMs: latency,
    });
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      service: "fasaro-backend-api",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Database connection failed",
    });
  }
});

apiRouter.use("/auth", authRoutes);
apiRouter.use("/invitations", invitationRoutes);
apiRouter.use("/public", publicRoutes);
apiRouter.use("/dashboard", dashboardRoutes);
apiRouter.use("/reception", receptionRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/upload", uploadRoutes);
apiRouter.use("/payment", paymentRoutes);

export default apiRouter;
