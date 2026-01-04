import { useEffect, useState } from "react";
import { getPendingVets, approveVet } from "../services/userService";
import { useAuth } from "../context/AuthContext";

export default function AdminHome() {
  const { token } = useAuth();
  const [vets, setVets] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadVets = async () => {
    try {
      const data = await getPendingVets(token);
      setVets(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load pending vets");
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
      setError("Failed to approve vet");
    }
  };

  useEffect(() => {
    if (token) {
      loadVets();
    }
  }, [token]);

  return (
    <div>
      <h2>Pending Vets</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && vets.length === 0 && <p>No pending vets</p>}

      {vets.map((v) => (
        <div key={v.id}>
          <span>{v.email}</span>
          <button onClick={() => approve(v.id)}>Approve</button>
        </div>
      ))}
    </div>
  );
}
