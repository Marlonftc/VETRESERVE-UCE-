import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminHome from "./pages/AdminHome";
import VetHome from "./pages/VetHome";
import VetPending from "./pages/VetPending";

/**
 * Protected route component based on authentication, role and status.
 */
function ProtectedRoute({ children, role, status }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  if (status && user.status !== status) {
    return <Navigate to="/vet/pending" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Client routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute role="CLIENT">
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminHome />
              </ProtectedRoute>
            }
          />

          {/* Vet routes */}
          <Route
            path="/vet"
            element={
              <ProtectedRoute role="VET" status="ACTIVE">
                <VetHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vet/pending"
            element={
              <ProtectedRoute role="VET">
                <VetPending />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
