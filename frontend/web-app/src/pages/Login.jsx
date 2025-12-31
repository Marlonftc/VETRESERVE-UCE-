import { useState } from "react";
import { loginRequest } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
      const { access_token } = await loginRequest(email, password);
      const user = await login(access_token);

      if (user.role === "admin") navigate("/admin");
      else if (user.role === "vet_student") navigate("/vet");
      else navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button>Login</button>
      {error && <p>{error}</p>}
    </form>
  );
}
