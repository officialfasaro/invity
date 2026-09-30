import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import AdminPage from "@/pages/AdminPage";
import AdminVerificationPage from "@/pages/AdminVerificationPage";
import InvitationPage from "@/pages/InvitationPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PwaInstallBanner from "@/components/pwa/PwaInstallBanner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing Route */}
        <Route path="/" element={<HomePage />} />

        {/* Authentication Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* User Dashboard Protected Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Master Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verifikasi-manual"
          element={
            <ProtectedRoute requireAdmin>
              <AdminVerificationPage />
            </ProtectedRoute>
          }
        />

        {/* Public Invitation Routes */}
        <Route path="/invitation/:slug" element={<InvitationPage />} />
        <Route path="/:slug" element={<InvitationPage />} />
      </Routes>
      <PwaInstallBanner />
    </BrowserRouter>
  );
}
