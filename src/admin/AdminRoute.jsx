import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/admin-login" replace />;
    let payload = null;
    try {
      payload = jwtDecode(token);
    } catch {
      return <Navigate to="/admin-login" replace />;
    }
    return children;
};
export default AdminRoute;
