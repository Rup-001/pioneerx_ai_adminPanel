import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardPage from "@/pages/DashboardPage";
import UserListPage from "@/pages/UserListPage";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import CreditConfigsPage from "@/pages/CreditConfigsPage";
import PromoCodesPage from "@/pages/PromoCodesPage";
import ReviewsPage from "@/pages/ReviewsPage";
import BroadcastPage from "@/pages/BroadcastPage";
import SitePagesPage from "@/pages/SitePagesPage";
import BillingPage from "@/pages/BillingPage";
import AiConfigsPage from "@/pages/AiConfigsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UserListPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="credits" element={<CreditConfigsPage />} />
            <Route path="ai-configs" element={<AiConfigsPage />} />
            <Route path="promos" element={<PromoCodesPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="broadcast" element={<BroadcastPage />} />
            <Route path="site-pages" element={<SitePagesPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="quotas" element={<Navigate to="/credits" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
