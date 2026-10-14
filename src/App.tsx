import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ThemesPage from "@/pages/ThemesPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import OrderPage from "@/pages/OrderPage";
import PaymentStatusPage from "@/pages/PaymentStatusPage";
import AdminPage from "@/pages/AdminPage";
import AdminVerificationPage from "@/pages/AdminVerificationPage";
import InvitationPage from "@/pages/InvitationPage";
import ReceptionPage from "@/pages/ReceptionPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useBrandSync } from "@/utils/useBrandSync";

export default function App() {
  useBrandSync();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/themes" element={<ThemesPage />} />
        <Route path="/tema" element={<ThemesPage />} />

        {/* Authentication Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Onboarding & Package Selection Route */}
        <Route
          path="/order"
          element={
            <ProtectedRoute allowUnpaidOnly>
              <OrderPage />
            </ProtectedRoute>
          }
        />

        {/* Payment & Verification Status Routes */}
        <Route
          path="/payment-status"
          element={
            <ProtectedRoute allowPaymentStatus>
              <PaymentStatusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/status"
          element={
            <ProtectedRoute allowPaymentStatus>
              <PaymentStatusPage />
            </ProtectedRoute>
          }
        />

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

        {/* Isolated Receptionist & Pagar Ayu Scanning Routes */}
        <Route path="/reception/:slug" element={<ReceptionPage />} />
        <Route path="/scan/:slug" element={<ReceptionPage />} />

        {/* Public Invitation Routes */}
        <Route path="/invitation/:slug" element={<InvitationPage />} />
        <Route path="/:slug" element={<InvitationPage />} />
      </Routes>
    </BrowserRouter>
  );
}
