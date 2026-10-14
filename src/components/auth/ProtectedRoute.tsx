import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";

interface LatestTransaction {
  orderId: string;
  paymentStatus: "WAITING_VERIFICATION" | "SETTLEMENT" | "PENDING" | "CANCELLED";
  tier?: string;
  amount?: number;
  paymentType?: string;
  proofImageUrl?: string | null;
  createdAt?: string;
}

interface AuthUser {
  id: string;
  name?: string | null;
  email: string;
  role: "USER" | "ADMIN";
  hasActivePackage?: boolean;
  latestTransaction?: LatestTransaction | null;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowUnpaidOnly?: boolean;
  allowPaymentStatus?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  allowUnpaidOnly = false,
  allowPaymentStatus = false,
}: ProtectedRouteProps) {
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setUser(data.user || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F6FB] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Memeriksa sesi autentikasi...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireAdmin && user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  const isPendingVerification =
    !user.hasActivePackage &&
    user.latestTransaction &&
    ["WAITING_VERIFICATION", "PENDING"].includes(user.latestTransaction.paymentStatus);

  // If page is payment status page
  if (allowPaymentStatus) {
    return <>{children}</>;
  }

  // If page is only for choosing/buying a package (/order)
  if (allowUnpaidOnly) {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    if (user.hasActivePackage) {
      return <Navigate to="/dashboard" replace />;
    }
    // If user has a pending verification, redirect to payment status
    if (isPendingVerification && user.latestTransaction) {
      return <Navigate to={`/payment-status?orderId=${user.latestTransaction.orderId}`} replace />;
    }
    return <>{children}</>;
  }

  // Non-admin users without active package
  if (!requireAdmin && user.role !== "ADMIN" && !user.hasActivePackage) {
    // If waiting verification, redirect to payment status
    if (isPendingVerification && user.latestTransaction) {
      return <Navigate to={`/payment-status?orderId=${user.latestTransaction.orderId}`} replace />;
    }
    // Otherwise redirect to /order
    return <Navigate to="/order" replace />;
  }

  if (requireAdmin) {
    return <AdminShell sessionUser={user}>{children}</AdminShell>;
  }

  return <>{children}</>;
}
