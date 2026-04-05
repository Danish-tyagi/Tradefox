import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import DashboardPage from '../pages/DashboardPage';
import TradePage from '../pages/TradePage';
import PortfolioPage from '../pages/PortfolioPage';
import AppLayout from '../layouts/AppLayout';
import ResetPasswordPage from '../pages/ResetPasswordPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />

    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/trade"     element={<TradePage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
    </Route>

    {/* Any unknown route → landing */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
