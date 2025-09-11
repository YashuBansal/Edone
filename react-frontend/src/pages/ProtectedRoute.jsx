import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentRole = currentUser?.role;

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If a role is required, enforce it
  if (role && role !== currentRole) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;