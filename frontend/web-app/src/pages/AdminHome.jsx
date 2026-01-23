import { useEffect, useState } from "react";
import { getPendingVets, approveVet } from "../services/userService";
import { listOwners } from "../services/ownerService";
import { listPetsByOwner } from "../services/petService";
import {
  listRecordsByPet,
  createRecord,
  updateRecord,
  deleteRecord,
  getRecordById,
} from "../services/clinicalService";
import { useAuth } from "../context/AuthContext";

export default function AdminHome() {
  const { token, logout, user } = useAuth();
  const [vets, setVets] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("pending");
  const [owners, setOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [ownersError, setOwnersError] = useState(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [petsError, setPetsError] = useState(null);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState(null);
  const [recordMessage, setRecordMessage] = useState(null);
  const [recordEditMessage, setRecordEditMessage] = useState(null);
  const [recordsPetId, setRecordsPetId] = useState("");
  const [pendingFilter, setPendingFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [petFilter, setPetFilter] = useState("");
  const [recordFilter, setRecordFilter] = useState("");

  const [recordForm, setRecordForm] = useState({
    pet_id: "",
    vet_id: "",
    summary: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  });

  const [recordEditForm, setRecordEditForm] = useState({
    record_id: "",
    summary: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  });

  const normalizedPendingFilter = pendingFilter.trim().toLowerCase();
  const normalizedOwnerFilter = ownerFilter.trim().toLowerCase();
  const normalizedPetFilter = petFilter.trim().toLowerCase();
  const normalizedRecordFilter = recordFilter.trim().toLowerCase();

  const filteredVets = vets.filter((vet) =>
    vet.email?.toLowerCase().includes(normalizedPendingFilter)
  );

  const filteredOwners = owners.filter((owner) => {
    const fullName = `${owner.first_name || ""} ${owner.last_name || ""}`.trim();
    return (
      fullName.toLowerCase().includes(normalizedOwnerFilter) ||
      owner.email?.toLowerCase().includes(normalizedOwnerFilter)
    );
  });

  const filteredPets = pets.filter((pet) => {
    const haystack = `${pet.name || ""} ${pet.species || ""} ${pet.breed || ""}`.toLowerCase();
    return haystack.includes(normalizedPetFilter);
  });

  const filteredRecords = records.filter((record) => {
    const haystack = `${record.diagnosis || ""} ${record.summary || ""}`.toLowerCase();
    return haystack.includes(normalizedRecordFilter);
  });

  const loadVets = async () => {
    setLoading(true);
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

  const loadOwners = async () => {
    setOwnersLoading(true);
    setOwnersError(null);
    try {
      const data = await listOwners(token);
      setOwners(data);
    } catch (err) {
      setOwnersError(err.message);
    } finally {
      setOwnersLoading(false);
    }
  };

  const handleOwnerSelect = async (ownerId) => {
    setSelectedOwnerId(ownerId);
    if (!ownerId) {
      setPets([]);
      return;
    }
    setPetsLoading(true);
    setPetsError(null);
    try {
      const data = await listPetsByOwner(ownerId);
      setPets(data);
    } catch (err) {
      setPetsError(err.message);
    } finally {
      setPetsLoading(false);
    }
  };

  const handleRecordsFetch = async (e) => {
    e.preventDefault();
    setRecords([]);
    setRecordsError(null);
    if (!recordsPetId) return;
    setRecordsLoading(true);
    try {
      const data = await listRecordsByPet(recordsPetId);
      setRecords(data);
    } catch (err) {
      setRecordsError(err.message);
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleRecordCreate = async (e) => {
    e.preventDefault();
    setRecordMessage(null);
    try {
      const payload = {
        ...recordForm,
        pet_id: Number(recordForm.pet_id),
        vet_id: recordForm.vet_id ? Number(recordForm.vet_id) : null,
      };
      const created = await createRecord(payload);
      setRecordMessage("Clinical record created.");
      setRecords((prev) => [created, ...prev]);
      setRecordForm({
        pet_id: "",
        vet_id: "",
        summary: "",
        diagnosis: "",
        treatment: "",
        notes: "",
      });
    } catch (err) {
      setRecordMessage(err.message);
    }
  };

  const handleRecordLookup = async () => {
    setRecordEditMessage(null);
    if (!recordEditForm.record_id) return;
    try {
      const record = await getRecordById(recordEditForm.record_id);
      setRecordEditForm((prev) => ({
        ...prev,
        summary: record.summary || "",
        diagnosis: record.diagnosis || "",
        treatment: record.treatment || "",
        notes: record.notes || "",
      }));
    } catch (err) {
      setRecordEditMessage(err.message);
    }
  };

  const handleRecordUpdate = async (e) => {
    e.preventDefault();
    setRecordEditMessage(null);
    try {
      const updated = await updateRecord(recordEditForm.record_id, {
        summary: recordEditForm.summary || null,
        diagnosis: recordEditForm.diagnosis || null,
        treatment: recordEditForm.treatment || null,
        notes: recordEditForm.notes || null,
      });
      setRecordEditMessage("Clinical record updated.");
      setRecords((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setRecordEditMessage(err.message);
    }
  };

  const handleRecordDelete = async () => {
    setRecordEditMessage(null);
    if (!recordEditForm.record_id) return;
    try {
      await deleteRecord(recordEditForm.record_id);
      setRecordEditMessage("Clinical record deleted.");
      setRecords((prev) => prev.filter((item) => item.id !== recordEditForm.record_id));
      setRecordEditForm({ record_id: "", summary: "", diagnosis: "", treatment: "", notes: "" });
    } catch (err) {
      setRecordEditMessage(err.message);
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
      loadOwners();
    }
  }, [token]);

  useEffect(() => {
    setPendingFilter("");
    setOwnerFilter("");
    setPetFilter("");
    setRecordFilter("");
  }, [activeSection]);

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

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Admin control center</h3>
            <p className="muted">Manage data that already has API access.</p>
          </div>
        </div>

        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
          <button
            className={`admin-tab ${activeSection === "pending" ? "active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeSection === "pending"}
            onClick={() => setActiveSection("pending")}
          >
            Pending vets
          </button>
          <button
            className={`admin-tab ${activeSection === "owners" ? "active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeSection === "owners"}
            onClick={() => setActiveSection("owners")}
          >
            Owners
          </button>
          <button
            className={`admin-tab ${activeSection === "pets" ? "active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeSection === "pets"}
            onClick={() => setActiveSection("pets")}
          >
            Pets
          </button>
          <button
            className={`admin-tab ${activeSection === "records" ? "active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeSection === "records"}
            onClick={() => setActiveSection("records")}
          >
            Clinical records
          </button>
        </div>

        <div className="admin-content">
          {activeSection === "pending" && (
            <>
              <div className="panel-title">
                <span className="action-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                    <path d="M7 12h10M7 8h6"></path>
                  </svg>
                </span>
                <div>
                  <h4>Pending requests</h4>
                  <p className="muted">Review and approve veterinary students.</p>
                </div>
                <button className="btn secondary small" type="button" onClick={loadVets}>
                  Refresh
                </button>
              </div>

              <div className="admin-filter">
                <input
                  className="input"
                  placeholder="Filter by email"
                  value={pendingFilter}
                  onChange={(e) => setPendingFilter(e.target.value)}
                />
                {pendingFilter && (
                  <button
                    className="btn secondary small"
                    type="button"
                    onClick={() => setPendingFilter("")}
                  >
                    Clear
                  </button>
                )}
              </div>

              {loading && <p className="muted">Loading requests...</p>}
              {error && <div className="error">{error}</div>}
              {!loading && vets.length === 0 && <p className="muted">No pending requests.</p>}
              {!loading && vets.length > 0 && filteredVets.length === 0 && (
                <p className="muted">No matches found.</p>
              )}

              <div className="list">
                {filteredVets.map((v) => (
                  <div key={v.id} className="list-item">
                    <span>{v.email}</span>
                    <button className="btn primary" onClick={() => approve(v.id)}>
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === "owners" && (
            <>
              <div className="panel-title">
                <span className="action-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                    <circle cx="8" cy="8" r="3"></circle>
                    <circle cx="16" cy="9" r="2.5"></circle>
                    <path d="M3.5 19a4.5 4.5 0 0 1 9 0"></path>
                    <path d="M13.5 19a3.5 3.5 0 0 1 7 0"></path>
                  </svg>
                </span>
                <div>
                  <h4>Owners</h4>
                  <p className="muted">Browse owners and inspect their pets.</p>
                </div>
                <button className="btn secondary small" type="button" onClick={loadOwners}>
                  Refresh
                </button>
              </div>

              <div className="admin-filter">
                <input
                  className="input"
                  placeholder="Filter by name or email"
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                />
                {ownerFilter && (
                  <button
                    className="btn secondary small"
                    type="button"
                    onClick={() => setOwnerFilter("")}
                  >
                    Clear
                  </button>
                )}
              </div>

              {ownersLoading && <p className="muted">Loading owners...</p>}
              {ownersError && <div className="error">{ownersError}</div>}

              <div className="list">
                {filteredOwners.map((owner) => (
                  <div key={owner.id} className="list-item">
                    <div>
                      <strong>
                        {owner.first_name} {owner.last_name}
                      </strong>
                      <div className="muted">{owner.email}</div>
                    </div>
                    <button
                      className="btn secondary small"
                      type="button"
                      onClick={() => {
                        setActiveSection("pets");
                        handleOwnerSelect(String(owner.id));
                      }}
                    >
                      View pets
                    </button>
                  </div>
                ))}
                {!ownersLoading && owners.length > 0 && filteredOwners.length === 0 && (
                  <p className="muted">No matches found.</p>
                )}
              </div>
            </>
          )}

          {activeSection === "pets" && (
            <>
              <div className="panel-title">
                <span className="action-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                    <circle cx="7.5" cy="8" r="2"></circle>
                    <circle cx="16.5" cy="8" r="2"></circle>
                    <circle cx="6" cy="14" r="2"></circle>
                    <circle cx="18" cy="14" r="2"></circle>
                    <path d="M12 12c2.6 0 4.5 2.3 4.5 4.5S14.6 21 12 21s-4.5-1.8-4.5-4.5S9.4 12 12 12Z"></path>
                  </svg>
                </span>
                <div>
                  <h4>Pets</h4>
                  <p className="muted">Select an owner to list their pets.</p>
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="adminOwnerSelect">Owner</label>
                <select
                  id="adminOwnerSelect"
                  value={selectedOwnerId}
                  onChange={(e) => handleOwnerSelect(e.target.value)}
                >
                  <option value="">Select owner</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.first_name} {owner.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-filter">
                <input
                  className="input"
                  placeholder="Filter by pet name, species, or breed"
                  value={petFilter}
                  onChange={(e) => setPetFilter(e.target.value)}
                  disabled={!selectedOwnerId}
                />
                {petFilter && (
                  <button
                    className="btn secondary small"
                    type="button"
                    onClick={() => setPetFilter("")}
                  >
                    Clear
                  </button>
                )}
              </div>

              {petsLoading && <p className="muted">Loading pets...</p>}
              {petsError && <div className="error">{petsError}</div>}

              <div className="list">
                {filteredPets.map((pet) => (
                  <div key={pet.id} className="list-item">
                    <div>
                      <strong>{pet.name}</strong>
                      <div className="muted">
                        {pet.species} {pet.breed ? `- ${pet.breed}` : ""}
                      </div>
                    </div>
                    <span className="badge">{pet.age ? `${pet.age}y` : "n/a"}</span>
                  </div>
                ))}
                {!petsLoading && selectedOwnerId && pets.length === 0 && (
                  <p className="muted">No pets for this owner.</p>
                )}
                {!petsLoading && selectedOwnerId && pets.length > 0 && filteredPets.length === 0 && (
                  <p className="muted">No matches found.</p>
                )}
              </div>
            </>
          )}

          {activeSection === "records" && (
            <>
              <div className="panel-title">
                <span className="action-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                    <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"></path>
                    <path d="M14 3v6h6"></path>
                  </svg>
                </span>
                <div>
                  <h4>Clinical records</h4>
                  <p className="muted">Search, create, update, or delete records.</p>
                </div>
              </div>

              <div className="admin-split">
                <div>
                  <form className="form" onSubmit={handleRecordsFetch}>
                    <div className="form-row">
                      <label htmlFor="recordPetId">Pet ID</label>
                      <input
                        id="recordPetId"
                        className="input"
                        type="number"
                        min="1"
                        value={recordsPetId}
                        onChange={(e) => setRecordsPetId(e.target.value)}
                        required
                      />
                    </div>
                    <button className="btn primary" type="submit">
                      Load records
                    </button>
                  </form>

                  <div className="admin-filter">
                    <input
                      className="input"
                      placeholder="Filter by diagnosis or summary"
                      value={recordFilter}
                      onChange={(e) => setRecordFilter(e.target.value)}
                      disabled={records.length === 0}
                    />
                    {recordFilter && (
                      <button
                        className="btn secondary small"
                        type="button"
                        onClick={() => setRecordFilter("")}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {recordsLoading && <p className="muted">Loading records...</p>}
                  {recordsError && <div className="error">{recordsError}</div>}

                  <div className="list">
                    {filteredRecords.map((record) => (
                      <div key={record.id} className="list-item">
                        <div>
                          <strong>{record.diagnosis || "Clinical record"}</strong>
                          <div className="muted">{record.summary || "No summary provided."}</div>
                        </div>
                        <span className="badge">{record.created_at?.slice(0, 10) || "n/a"}</span>
                      </div>
                    ))}
                  </div>
                  {!recordsLoading && records.length > 0 && filteredRecords.length === 0 && (
                    <p className="muted">No matches found.</p>
                  )}
                </div>

                <div className="form">
                  <form className="form" onSubmit={handleRecordCreate}>
                    <div className="form-row">
                      <label htmlFor="newPetId">Pet ID</label>
                      <input
                        id="newPetId"
                        className="input"
                        type="number"
                        min="1"
                        value={recordForm.pet_id}
                        onChange={(e) =>
                          setRecordForm((prev) => ({ ...prev, pet_id: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="newVetId">Vet ID (optional)</label>
                      <input
                        id="newVetId"
                        className="input"
                        type="number"
                        min="1"
                        value={recordForm.vet_id}
                        onChange={(e) =>
                          setRecordForm((prev) => ({ ...prev, vet_id: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="newSummary">Summary</label>
                      <input
                        id="newSummary"
                        className="input"
                        value={recordForm.summary}
                        onChange={(e) =>
                          setRecordForm((prev) => ({ ...prev, summary: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="newDiagnosis">Diagnosis</label>
                      <input
                        id="newDiagnosis"
                        className="input"
                        value={recordForm.diagnosis}
                        onChange={(e) =>
                          setRecordForm((prev) => ({ ...prev, diagnosis: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="newTreatment">Treatment</label>
                      <input
                        id="newTreatment"
                        className="input"
                        value={recordForm.treatment}
                        onChange={(e) =>
                          setRecordForm((prev) => ({ ...prev, treatment: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="newNotes">Notes</label>
                      <textarea
                        id="newNotes"
                        className="input"
                        rows="3"
                        value={recordForm.notes}
                        onChange={(e) =>
                          setRecordForm((prev) => ({ ...prev, notes: e.target.value }))
                        }
                      />
                    </div>
                    {recordMessage && <p className="helper">{recordMessage}</p>}
                    <button className="btn primary" type="submit">
                      Create record
                    </button>
                  </form>

                  <div className="form-row inline">
                    <label htmlFor="editRecordId">Record ID</label>
                    <input
                      id="editRecordId"
                      className="input"
                      value={recordEditForm.record_id}
                      onChange={(e) =>
                        setRecordEditForm((prev) => ({ ...prev, record_id: e.target.value }))
                      }
                    />
                    <button className="btn secondary" type="button" onClick={handleRecordLookup}>
                      Load
                    </button>
                  </div>

                  <form className="form" onSubmit={handleRecordUpdate}>
                    <div className="form-row">
                      <label htmlFor="editSummary">Summary</label>
                      <input
                        id="editSummary"
                        className="input"
                        value={recordEditForm.summary}
                        onChange={(e) =>
                          setRecordEditForm((prev) => ({ ...prev, summary: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="editDiagnosis">Diagnosis</label>
                      <input
                        id="editDiagnosis"
                        className="input"
                        value={recordEditForm.diagnosis}
                        onChange={(e) =>
                          setRecordEditForm((prev) => ({ ...prev, diagnosis: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="editTreatment">Treatment</label>
                      <input
                        id="editTreatment"
                        className="input"
                        value={recordEditForm.treatment}
                        onChange={(e) =>
                          setRecordEditForm((prev) => ({ ...prev, treatment: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="editNotes">Notes</label>
                      <textarea
                        id="editNotes"
                        className="input"
                        rows="3"
                        value={recordEditForm.notes}
                        onChange={(e) =>
                          setRecordEditForm((prev) => ({ ...prev, notes: e.target.value }))
                        }
                      />
                    </div>
                    {recordEditMessage && <p className="helper">{recordEditMessage}</p>}
                    <div className="button-row">
                      <button className="btn primary" type="submit">
                        Update record
                      </button>
                      <button className="btn secondary" type="button" onClick={handleRecordDelete}>
                        Delete record
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}

        </div>
      </section>
    </main>
  );
}
