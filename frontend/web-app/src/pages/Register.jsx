import { useState } from "react";
import { registerUser } from "../services/userService";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CLIENT");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await registerUser({ email, password, role });
      navigate("/");
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
            <h1>Create your account</h1>
            <p>Join the platform to manage patients or support as a veterinary student.</p>
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
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="role">Account type</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="CLIENT">Client</option>
                <option value="VET">Veterinary student</option>
              </select>
            </div>

            {error && <div className="error">{error}</div>}

            <button className="btn primary" type="submit">
              Create account
            </button>
          </form>

          <p className="helper">
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </section>

        <aside className="auth-hero">
          <div className="hero-card">
            <span className="badge">Vet community</span>
            <h2 className="hero-title">Connect with pets, caretakers, and professionals.</h2>
            <div className="hero-list">
              <div className="hero-item">
                <span className="badge">DOG</span>
                <div>
                  <strong>Complete histories</strong>
                  <span className="muted">Everything needed for daily care.</span>
                </div>
              </div>
              <div className="hero-item">
                <span className="badge">CAT</span>
                <div>
                  <strong>Unified team</strong>
                  <span className="muted">Secure access for clinics and students.</span>
                </div>
              </div>
              <div className="hero-item">
                <span className="badge">AGENDA</span>
                <div>
                  <strong>Always updated</strong>
                  <span className="muted">Alerts and follow-ups in one platform.</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
