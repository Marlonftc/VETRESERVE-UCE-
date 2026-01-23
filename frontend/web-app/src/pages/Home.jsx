import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listOwners, createOwner } from "../services/ownerService";
import { listPetsByOwner, createPet } from "../services/petService";
import { createAppointment } from "../services/appointmentService";
import { getActiveVets } from "../services/userService";

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
  const [vets, setVets] = useState([]);
  const [vetsLoading, setVetsLoading] = useState(false);
  const [vetsError, setVetsError] = useState(null);
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

  useEffect(() => {
    if (!token || !user) return;
    if (user.role !== "CLIENT") return;
    setVetsLoading(true);
    setVetsError(null);
    getActiveVets(token)
      .then((data) => setVets(data))
      .catch((err) => setVetsError(err.message))
      .finally(() => setVetsLoading(false));
  }, [token, user]);

  const handleOwnerCreate = async (e) => {
    e.preventDefault();

    if (
      !ownerForm.first_name ||
      !ownerForm.last_name ||
      !ownerForm.email ||
      !ownerForm.phone
    ) {
      setOwnersError("All fields are required");
      return;
    }

    const userId = user?.id ?? user?.user_id;
    if (!userId) {
      setOwnersError("Missing user id. Please sign in again.");
      return;
    }

    try {
      const payload = {
        ...ownerForm,
        user_id: Number(userId),
      };
      await createOwner(payload, token);

      const data = await listOwners(token);
      setOwners(data);

      setOwnerForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
      });
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
                    <label htmlFor="vetSelect">Veterinarian</label>
                    <select
                      id="vetSelect"
                      value={appointmentForm.vet_id}
                      onChange={(e) =>
                        setAppointmentForm((prev) => ({ ...prev, vet_id: e.target.value }))
                      }
                      required
                    >
                      <option value="">Select veterinarian</option>
                      {vets.map((vet) => (
                        <option key={vet.id} value={vet.id}>
                          {vet.email}
                        </option>
                      ))}
                    </select>
                    {vetsLoading && <p className="muted">Loading veterinarians...</p>}
                    {vetsError && <div className="error">{vetsError}</div>}
                    {!vetsLoading && vets.length === 0 && !vetsError && (
                      <p className="muted">No approved veterinarians available.</p>
                    )}
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

          </div>
        </section>
      )}
    </main>
  );
}
