import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  // Можно добавить decode токена (jwt-decode) для проверки is_staff если надо
  if (!token) return <Navigate to="/admin-login" replace />;
  return children;
}
