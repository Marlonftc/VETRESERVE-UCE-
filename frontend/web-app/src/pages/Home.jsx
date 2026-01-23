import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listOwners, createOwner } from "../services/ownerService";
import { listPetsByOwner, createPet } from "../services/petService";
import { createAppointment } from "../services/appointmentService";
import {
  listRecordsByPet,
  createRecord,
  updateRecord,
  deleteRecord,
  getRecordById,
} from "../services/clinicalService";

export default function Home() {
  const { user, token, logout } = useAuth();
  const [owners, setOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(true);
  const [ownersError, setOwnersError] = useState(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [petsError, setPetsError] = useState(null);
  const [appointmentMessage, setAppointmentMessage] = useState(null);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState(null);
  const [recordMessage, setRecordMessage] = useState(null);
  const [recordEditMessage, setRecordEditMessage] = useState(null);
  const [activeSection, setActiveSection] = useState("");

  const [ownerForm, setOwnerForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [petForm, setPetForm] = useState({
    owner_id: "",
    name: "",
    species: "",
    breed: "",
    age: "",
  });

  const [appointmentForm, setAppointmentForm] = useState({
    vet_id: "",
    day: "",
    start_time: "",
    end_time: "",
  });

  const [recordsPetId, setRecordsPetId] = useState("");

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

  useEffect(() => {
    if (!token) return;
    setOwnersLoading(true);
    setOwnersError(null);
    listOwners(token)
      .then((data) => {
        setOwners(data);
      })
      .catch((err) => {
        setOwnersError(err.message);
      })
      .finally(() => setOwnersLoading(false));
  }, [token]);

  const handleOwnerCreate = async (e) => {
    e.preventDefault();
    setOwnersError(null);
    try {
      const created = await createOwner(ownerForm, token);
      setOwners((prev) => [created, ...prev]);
      setOwnerForm({ first_name: "", last_name: "", email: "", phone: "" });
    } catch (err) {
      setOwnersError(err.message);
    }
  };

  const handleOwnerSelect = async (ownerId) => {
    setSelectedOwnerId(ownerId);
    setPetForm((prev) => ({ ...prev, owner_id: ownerId }));
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

  const handlePetCreate = async (e) => {
    e.preventDefault();
    setPetsError(null);
    try {
      const payload = {
        ...petForm,
        owner_id: Number(petForm.owner_id),
        age: petForm.age ? Number(petForm.age) : null,
      };
      const created = await createPet(payload, token);
      setPets((prev) => [created, ...prev]);
      setPetForm({ owner_id: petForm.owner_id, name: "", species: "", breed: "", age: "" });
    } catch (err) {
      setPetsError(err.message);
    }
  };

  const handleAppointmentCreate = async (e) => {
    e.preventDefault();
    setAppointmentMessage(null);
    try {
      const payload = {
        vet_id: Number(appointmentForm.vet_id),
        day: appointmentForm.day,
        start_time: appointmentForm.start_time,
        end_time: appointmentForm.end_time,
      };
      await createAppointment(payload, token);
      setAppointmentMessage("Appointment created successfully.");
      setAppointmentForm({ vet_id: "", day: "", start_time: "", end_time: "" });
    } catch (err) {
      setAppointmentMessage(err.message);
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

  const actionCards = [
    {
      key: "owners",
      title: "Owners",
      description: "Create and select owners.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
          <circle cx="8" cy="8" r="3"></circle>
          <circle cx="16" cy="9" r="2.5"></circle>
          <path d="M3.5 19a4.5 4.5 0 0 1 9 0"></path>
          <path d="M13.5 19a3.5 3.5 0 0 1 7 0"></path>
        </svg>
      ),
    },
    {
      key: "pets",
      title: "Pets",
      description: "Register pets for an owner.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
          <circle cx="7.5" cy="8" r="2"></circle>
          <circle cx="16.5" cy="8" r="2"></circle>
          <circle cx="6" cy="14" r="2"></circle>
          <circle cx="18" cy="14" r="2"></circle>
          <path d="M12 12c2.6 0 4.5 2.3 4.5 4.5S14.6 21 12 21s-4.5-1.8-4.5-4.5S9.4 12 12 12Z"></path>
        </svg>
      ),
    },
    {
      key: "appointment",
      title: "Appointments",
      description: "Schedule a visit.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="16" rx="2"></rect>
          <path d="M7 3v4M17 3v4M3 10h18"></path>
        </svg>
      ),
    },
    {
      key: "records",
      title: "Clinical records",
      description: "Search by pet ID.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
          <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"></path>
          <path d="M14 3v6h6"></path>
        </svg>
      ),
    },
    {
      key: "createRecord",
      title: "New record",
      description: "Add a clinical record.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
          <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"></path>
          <path d="M14 3v6h6"></path>
          <path d="M12 12v6M9 15h6"></path>
        </svg>
      ),
    },
    {
      key: "editRecord",
      title: "Edit record",
      description: "Update or delete.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
          <path d="M4 20h4l11-11a2.2 2.2 0 0 0-4-4L4 16v4Z"></path>
          <path d="M13 6l4 4"></path>
        </svg>
      ),
    },
  ];

  return (
    <main className="page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Client dashboard</span>
          <h1>Hello, {user.email}</h1>
          <p className="muted">Manage owners, pets, and appointments from one place.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="action-grid" aria-label="Client sections">
        {actionCards.map((card) => (
          <button
            key={card.key}
            type="button"
            className={`action-card ${activeSection === card.key ? "active" : ""}`}
            onClick={() => setActiveSection((prev) => (prev === card.key ? "" : card.key))}
            aria-pressed={activeSection === card.key}
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

      {activeSection && (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Client control center</h3>
              <p className="muted">Work on one task at a time to keep things simple.</p>
            </div>
          </div>

          <div className="admin-content">
            {activeSection === "owners" && (
              <>
                <div className="section-header">
                  <div>
                    <h4>Owners</h4>
                    <p className="muted">Create and select an owner to manage pets.</p>
                  </div>
                </div>

                {ownersLoading && <p className="muted">Loading owners...</p>}
                {ownersError && <div className="error">{ownersError}</div>}

                <div className="list">
                  {owners.map((owner) => (
                    <div key={owner.id} className="list-item">
                      <div>
                        <strong>
                          {owner.first_name} {owner.last_name}
                        </strong>
                        <div className="muted">{owner.email}</div>
                      </div>
                      <button
                        className="btn secondary"
                        type="button"
                        onClick={() => {
                          handleOwnerSelect(String(owner.id));
                          setActiveSection("pets");
                        }}
                      >
                        Select
                      </button>
                    </div>
                  ))}
                  {!ownersLoading && owners.length === 0 && <p className="muted">No owners yet.</p>}
                </div>

                <form className="form" onSubmit={handleOwnerCreate}>
                  <div className="form-row">
                    <label htmlFor="firstName">First name</label>
                    <input
                      id="firstName"
                      className="input"
                      value={ownerForm.first_name}
                      onChange={(e) =>
                        setOwnerForm((prev) => ({ ...prev, first_name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="lastName">Last name</label>
                    <input
                      id="lastName"
                      className="input"
                      value={ownerForm.last_name}
                      onChange={(e) =>
                        setOwnerForm((prev) => ({ ...prev, last_name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="ownerEmail">Email</label>
                    <input
                      id="ownerEmail"
                      className="input"
                      type="email"
                      value={ownerForm.email}
                      onChange={(e) => setOwnerForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="ownerPhone">Phone</label>
                    <input
                      id="ownerPhone"
                      className="input"
                      value={ownerForm.phone}
                      onChange={(e) => setOwnerForm((prev) => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <button className="btn primary" type="submit">
                    Create owner
                  </button>
                </form>
              </>
            )}

            {activeSection === "pets" && (
              <>
                <div className="section-header">
                  <div>
                    <h4>Pets</h4>
                    <p className="muted">Select an owner and register their pets.</p>
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="ownerSelect">Owner</label>
                  <select
                    id="ownerSelect"
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

                {petsLoading && <p className="muted">Loading pets...</p>}
                {petsError && <div className="error">{petsError}</div>}

                <div className="list">
                  {pets.map((pet) => (
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
                </div>

                <form className="form" onSubmit={handlePetCreate}>
                  <div className="form-row">
                    <label htmlFor="petName">Pet name</label>
                    <input
                      id="petName"
                      className="input"
                      value={petForm.name}
                      onChange={(e) => setPetForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="petSpecies">Species</label>
                    <input
                      id="petSpecies"
                      className="input"
                      value={petForm.species}
                      onChange={(e) => setPetForm((prev) => ({ ...prev, species: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="petBreed">Breed</label>
                    <input
                      id="petBreed"
                      className="input"
                      value={petForm.breed}
                      onChange={(e) => setPetForm((prev) => ({ ...prev, breed: e.target.value }))}
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="petAge">Age</label>
                    <input
                      id="petAge"
                      className="input"
                      type="number"
                      min="0"
                      value={petForm.age}
                      onChange={(e) => setPetForm((prev) => ({ ...prev, age: e.target.value }))}
                    />
                  </div>
                  <button className="btn primary" type="submit" disabled={!selectedOwnerId}>
                    Create pet
                  </button>
                </form>
              </>
            )}

            {activeSection === "appointment" && (
              <>
                <div className="section-header">
                  <div>
                    <h4>Create appointment</h4>
                    <p className="muted">Schedule a visit with a veterinarian.</p>
                  </div>
                </div>

                <form className="form" onSubmit={handleAppointmentCreate}>
                  <div className="form-row">
                    <label htmlFor="vetId">Vet ID</label>
                    <input
                      id="vetId"
                      className="input"
                      type="number"
                      min="1"
                      value={appointmentForm.vet_id}
                      onChange={(e) =>
                        setAppointmentForm((prev) => ({ ...prev, vet_id: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="appointmentDay">Day</label>
                    <input
                      id="appointmentDay"
                      className="input"
                      type="date"
                      value={appointmentForm.day}
                      onChange={(e) =>
                        setAppointmentForm((prev) => ({ ...prev, day: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="startTime">Start time</label>
                    <input
                      id="startTime"
                      className="input"
                      type="time"
                      value={appointmentForm.start_time}
                      onChange={(e) =>
                        setAppointmentForm((prev) => ({ ...prev, start_time: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="endTime">End time</label>
                    <input
                      id="endTime"
                      className="input"
                      type="time"
                      value={appointmentForm.end_time}
                      onChange={(e) =>
                        setAppointmentForm((prev) => ({ ...prev, end_time: e.target.value }))
                      }
                      required
                    />
                  </div>
                  {appointmentMessage && <p className="helper">{appointmentMessage}</p>}
                  <button className="btn primary" type="submit">
                    Create appointment
                  </button>
                </form>
              </>
            )}

            {activeSection === "records" && (
              <>
                <div className="section-header">
                  <div>
                    <h4>Clinical records</h4>
                    <p className="muted">Search records by pet ID.</p>
                  </div>
                </div>

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

                {recordsLoading && <p className="muted">Loading records...</p>}
                {recordsError && <div className="error">{recordsError}</div>}

                <div className="list">
                  {records.map((record) => (
                    <div key={record.id} className="list-item">
                      <div>
                        <strong>{record.diagnosis || "Clinical record"}</strong>
                        <div className="muted">{record.summary || "No summary provided."}</div>
                      </div>
                      <span className="badge">{record.created_at?.slice(0, 10) || "n/a"}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === "createRecord" && (
              <>
                <div className="section-header">
                  <div>
                    <h4>Create clinical record</h4>
                    <p className="muted">Add a new record for a pet.</p>
                  </div>
                </div>

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
              </>
            )}

            {activeSection === "editRecord" && (
              <>
                <div className="section-header">
                  <div>
                    <h4>Edit clinical record</h4>
                    <p className="muted">Load a record by ID and update or delete it.</p>
                  </div>
                </div>

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
              </>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
