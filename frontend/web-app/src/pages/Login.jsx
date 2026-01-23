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
      const { access_token } = await loginRequest(email, password);
      const user = await login(access_token);

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
    <main className="page auth-page">
      <div className="auth-grid">
        <section className="auth-card">
          <header className="auth-header">
            <div className="brand-row">
              <img className="brand-logo" src="/uce-logo.png" alt="UCE logo" />
              <div className="brand-text">
                <span className="eyebrow">VetReserve</span>
                <strong>Central University of Ecuador</strong>
              </div>
            </div>
            <h1>Welcome back</h1>
            <p>Access your veterinary platform to manage patients, appointments, and approvals.</p>
          </header>

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button className="btn primary" type="submit">
              Sign in
            </button>
          </form>

          <p className="helper">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </section>

        <aside className="auth-hero">
          <div className="hero-card">
            <span className="badge">Warm care</span>
            <h2 className="hero-title">Your clinic and patients, in one place.</h2>
            <div className="hero-list">
              <div className="hero-item">
                <span className="badge">PAW</span>
                <div>
                  <strong>Simple flows</strong>
                  <span className="muted">Fast onboarding for clients and students.</span>
                </div>
              </div>
              <div className="hero-item">
                <span className="badge">VET</span>
                <div>
                  <strong>Reliable tracking</strong>
                  <span className="muted">Keep approvals and tasks in view.</span>
                </div>
              </div>
              <div className="hero-item">
                <span className="badge">CLIN</span>
                <div>
                  <strong>All organized</strong>
                  <span className="muted">Centralized data for your team.</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
