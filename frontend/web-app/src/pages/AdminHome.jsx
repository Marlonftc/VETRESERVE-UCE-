import { useEffect, useState } from "react";
import { getPendingVets, approveVet } from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function AdminHome() {
  const { token, logout, user } = useAuth();
  const [vets, setVets] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openPanels, setOpenPanels] = useState({ pending: true });

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

  const togglePanel = () => {
    setOpenPanels((prev) => ({ ...prev, pending: !prev.pending }));
  };

  const actionCards = [
    {
      key: "pending",
      title: "Pending requests",
      description: "Approve new veterinary profiles.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="16" rx="2"></rect>
          <path d="M7 12h10M7 8h6"></path>
        </svg>
      ),
    },
  ];

  return (
    <main className="page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Admin panel</span>
          <h1>Approval center</h1>
          <p className="muted">Manage requests and enable new profiles.</p>
        </div>
        <div className="dashboard-actions">
          <span className="badge">{user?.email}</span>
          <button className="btn secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="action-grid" aria-label="Quick actions">
        {actionCards.map((card) => (
          <button
            key={card.key}
            type="button"
            className={`action-card ${openPanels.pending ? "active" : ""}`}
            onClick={togglePanel}
            aria-pressed={openPanels.pending}
          >
            <span className="action-icon" aria-hidden="true">
              {card.icon}
            </span>
            <div>
              <h4>{card.title}</h4>
              <p className="muted">{card.description}</p>
            </div>
          </button>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Pending requests</h3>
            <p className="muted">Review and approve veterinary students.</p>
          </div>
          <button
            className="btn secondary small"
            type="button"
            onClick={togglePanel}
            aria-expanded={openPanels.pending}
            aria-controls="panel-pending"
          >
            {openPanels.pending ? "Hide" : "Show"}
          </button>
        </div>

        {openPanels.pending && (
          <div className="panel-body" id="panel-pending">
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
          </div>
        )}
      </section>
    </main>
  );
}
