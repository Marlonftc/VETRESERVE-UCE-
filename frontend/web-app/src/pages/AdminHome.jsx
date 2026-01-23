import { useEffect, useState } from "react";
import { getPendingVets, approveVet } from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function AdminHome() {
  const { token, logout, user } = useAuth();
  const [vets, setVets] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadVets = async () => {
    try {
      const data = await getPendingVets(token);
      setVets(data);
    } catch (err) {
      console.error(err);
      setError("Could not load pending students.");
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await approveVet(id, token);
      setVets((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
      setError("Could not approve the student.");
    }
  };

  useEffect(() => {
    if (token) {
      loadVets();
    }
  }, [token]);

  return (
    <main className="page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Admin panel</span>
          <h1>Approval center</h1>
          <p className="muted">Manage requests and enable new profiles.</p>
        </div>
        <div>
          <span className="badge">{user?.email}</span>{" "}
          <button className="btn secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="panel">
        <h3>Pending requests</h3>
        <p className="muted">Review and approve veterinary students.</p>

        {loading && <p className="muted">Loading requests...</p>}
        {error && <div className="error">{error}</div>}
        {!loading && vets.length === 0 && <p className="muted">No pending requests.</p>}

        <div className="list">
          {vets.map((v) => (
            <div key={v.id} className="list-item">
              <span>{v.email}</span>
              <button className="btn primary" onClick={() => approve(v.id)}>
                Approve
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
