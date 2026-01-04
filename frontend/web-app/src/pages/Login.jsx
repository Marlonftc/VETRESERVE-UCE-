import { useState } from "react";
import { loginRequest } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // 1️⃣ Login → JWT
      const { access_token } = await loginRequest(email, password);

      // 2️⃣ /auth/me
      const user = await login(access_token);

      // 3️⃣ Redirect by role + status (ALINEADO AL BACKEND)
      if (user.role === "ADMIN") {
        navigate("/admin");

      } else if (user.role === "VET" && user.status === "PENDING") {
        navigate("/vet/pending");

      } else if (user.role === "VET" && user.status === "ACTIVE") {
        navigate("/vet");

      } else {
        navigate("/home");
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Login</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}
