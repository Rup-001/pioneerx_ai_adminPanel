import { Navigate, Outlet } from "react-router-dom";
import { getAdminToken } from "@/lib/api";

export default function ProtectedRoute() {
  const token = getAdminToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
