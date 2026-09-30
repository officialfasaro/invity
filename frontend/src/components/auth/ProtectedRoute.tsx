import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";

interface AuthUser {
  id: string;
  name?: string | null;
  email: string;
  role: "USER" | "ADMIN";
  hasActivePackage?: boolean;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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
  }, []);

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

  // Non-admin users without an active package cannot access dashboard
  if (!requireAdmin && user.role !== "ADMIN" && !user.hasActivePackage) {
    return <Navigate to="/login?error=no_active_package" replace />;
  }

  if (requireAdmin) {
    return <AdminShell sessionUser={user}>{children}</AdminShell>;
  }

  return <>{children}</>;
}
