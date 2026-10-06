import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, RoleProtectedRoute } from './ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { TicketPage } from '@/pages/TicketPage';
import { AdminPage } from '@/pages/AdminPage';
import { ScannerPage } from '@/pages/ScannerPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Student Routes */}
      <Route
        path="/register"
        element={
          <ProtectedRoute>
            <RegisterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ticket"
        element={
          <ProtectedRoute>
            <TicketPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminPage />
          </RoleProtectedRoute>
        }
      />

      {/* Scanner Routes */}
      <Route
        path="/scanner"
        element={
          <RoleProtectedRoute allowedRoles={['scanner', 'admin', 'super_admin']}>
            <ScannerPage />
          </RoleProtectedRoute>
        }
      />

      {/* Fallback to Home */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};
