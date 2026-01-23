import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getVetAppointments } from "../services/appointmentService";
import { createSchedule } from "../services/scheduleService";
import {
  listRecordsByPet,
  createRecord,
  updateRecord,
  deleteRecord,
  getRecordById,
} from "../services/clinicalService";

export default function VetHome() {
  const { user, token, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState(null);
  const [scheduleMessage, setScheduleMessage] = useState(null);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState(null);
  const [recordMessage, setRecordMessage] = useState(null);
  const [recordEditMessage, setRecordEditMessage] = useState(null);
  const [activeSection, setActiveSection] = useState("appointments");

  const [scheduleForm, setScheduleForm] = useState({
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

  const loadAppointments = () => {
    if (!token) return;
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    getVetAppointments(token)
      .then((data) => setAppointments(data))
      .catch((err) => setAppointmentsError(err.message))
      .finally(() => setAppointmentsLoading(false));
  };

  useEffect(() => {
    loadAppointments();
  }, [token]);

  const handleScheduleCreate = async (e) => {
    e.preventDefault();
    setScheduleMessage(null);
    try {
      await createSchedule(scheduleForm, token);
      setScheduleMessage("Schedule created successfully.");
      setScheduleForm({ day: "", start_time: "", end_time: "" });
    } catch (err) {
      setScheduleMessage(err.message);
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

  return (
    <main className="page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Vet dashboard</span>
          <h1>Welcome, {user?.email}</h1>
          <p className="muted">Review appointments and manage your availability.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Vet control center</h3>
            <p className="muted">Keep your day organized and your records up to date.</p>
          </div>
        </div>

        <div className="admin-tabs" role="tablist" aria-label="Vet sections">
          <button
            className={`admin-tab ${activeSection === "appointments" ? "active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeSection === "appointments"}
            onClick={() => setActiveSection("appointments")}
          >
            Assigned cases
          </button>
          <button
            className={`admin-tab ${activeSection === "availability" ? "active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeSection === "availability"}
            onClick={() => setActiveSection("availability")}
          >
            Availability
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
          {activeSection === "appointments" && (
            <>
              <div className="section-header">
                <div>
                  <h4>Assigned cases</h4>
                  <p className="muted">Review your scheduled appointments.</p>
                </div>
                <button className="btn secondary small" type="button" onClick={loadAppointments}>
                  Refresh
                </button>
              </div>

              {appointmentsLoading && <p className="muted">Loading appointments...</p>}
              {appointmentsError && <div className="error">{appointmentsError}</div>}

              <div className="list">
                {appointments.map((appt) => (
                  <div key={appt.id} className="list-item">
                    <div>
                      <strong>{appt.day}</strong>
                      <div className="muted">
                        {appt.start_time} - {appt.end_time}
                      </div>
                    </div>
                    <span className="badge">{appt.status}</span>
                  </div>
                ))}
                {!appointmentsLoading && appointments.length === 0 && (
                  <p className="muted">No appointments assigned.</p>
                )}
              </div>
            </>
          )}

          {activeSection === "availability" && (
            <>
              <div className="section-header">
                <div>
                  <h4>Availability</h4>
                  <p className="muted">Set your available hours for clients.</p>
                </div>
              </div>

              <form className="form" onSubmit={handleScheduleCreate}>
                <div className="form-row">
                  <label htmlFor="scheduleDay">Day</label>
                  <input
                    id="scheduleDay"
                    className="input"
                    placeholder="Monday"
                    value={scheduleForm.day}
                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, day: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="scheduleStart">Start time</label>
                  <input
                    id="scheduleStart"
                    className="input"
                    type="time"
                    value={scheduleForm.start_time}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({ ...prev, start_time: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="scheduleEnd">End time</label>
                  <input
                    id="scheduleEnd"
                    className="input"
                    type="time"
                    value={scheduleForm.end_time}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({ ...prev, end_time: e.target.value }))
                    }
                    required
                  />
                </div>
                {scheduleMessage && <p className="helper">{scheduleMessage}</p>}
                <button className="btn primary" type="submit">
                  Create schedule
                </button>
              </form>
            </>
          )}

          {activeSection === "records" && (
            <>
              <div className="section-header">
                <div>
                  <h4>Clinical records</h4>
                  <p className="muted">Search, create, update, or delete records.</p>
                </div>
              </div>

              <div className="admin-split">
                <div>
                  <form className="form" onSubmit={handleRecordsFetch}>
                    <div className="form-row">
                      <label htmlFor="vetRecordPetId">Pet ID</label>
                      <input
                        id="vetRecordPetId"
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
