import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import VetHome from "./pages/VetHome";
import AdminHome from "./pages/AdminHome";
import { useAuth } from "./context/AuthContext";

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<PrivateRoute role="client"><Home /></PrivateRoute>} />
        <Route path="/vet" element={<PrivateRoute role="vet_student"><VetHome /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminHome /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
