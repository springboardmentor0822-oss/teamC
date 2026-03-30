import { useEffect, useState } from "react";
import api from "../api";
import "./Officials.css";

function Officials() {
  const [officials, setOfficials] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [selected, setSelected] = useState(null);
  const [location, setLocation] = useState("");
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD USER ================= */

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setLocation(res.data.location || "");
      } catch (err) {
        console.error("User fetch failed", err);
      }
    };

    loadUser();
  }, []);

  /* ================= FETCH OFFICIALS ================= */

  useEffect(() => {
    if (useMyLocation && !location) return;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const query = useMyLocation
          ? `?location=${location}&search=${search}&role=${role}`
          : `?search=${search}&role=${role}`;

        const res = await api.get(`/api/officials/list${query}`);
        setOfficials(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400); // debounce

    return () => clearTimeout(timeout);
  }, [search, role, location, useMyLocation]);

  const resetFilters = () => {
    setSearch("");
    setRole("");
    setUseMyLocation(false);
  };

  return (
    <div className="official-page">
      {/* HEADER */}
      <div className="official-header">
        <h2>Officials Directory</h2>
        <p>Find and connect with officials in your locality</p>
      </div>

      {/* FILTERS */}
      <div className="filters">
        <div className="field-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Category</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All categories</option>
            <option>Infrastructure</option>
            <option>Health</option>
            <option>Education</option>
            <option>Environment</option>
          </select>
        </div>

        <button
          className={`btn location-btn ${useMyLocation ? "active" : ""}`}
          onClick={() => setUseMyLocation(!useMyLocation)}
        >
          📍 {useMyLocation ? "Using my location" : "Use my location"}
        </button>
      </div>

      {/* GRID */}
      <div className="official-grid">
        {loading ? (
          <p className="state-text">Loading officials...</p>
        ) : officials.length === 0 ? (
          <div className="empty-state">
            <p>No officials found for these filters.</p>
            <button className="btn" onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          officials.map((off) => (
            <div key={off._id} className="official-card">
              {off.profileImage || off.avatar ? (
                <img
                  src={
                    off.profileImage
                      ? `http://localhost:5000${off.profileImage}`
                      : `http://localhost:5000${off.avatar}`
                  }
                  alt={off.name}
                  className="avatar-img"
                />
              ) : (
                <div className="avatar">
                  {off.name?.split(" ").map((n) => n[0]).join("")}
                </div>
              )}

              <h3 className="official-name">{off.name}</h3>

              <p className="meta-line">
                <span className="role-pill">{off.role}</span>
                <span className="dot-separator">•</span>
                <span className="location-text">{off.location}</span>
              </p>

              <button
                className="btn details"
                onClick={() => setSelected(off)}
              >
                View details
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="close-icon" onClick={() => setSelected(null)}>
              ✕
            </span>

            <div className="modal-header">
              {selected.profileImage ? (
                <img
                  src={`http://localhost:5000${selected.profileImage}`}
                  alt={selected.name}
                  className="avatar-img large"
                />
              ) : (
                <div className="avatar large">
                  {selected.name?.split(" ").map((n) => n[0]).join("")}
                </div>
              )}

              <h3>{selected.name}</h3>
              <p className="modal-subtitle">
                {selected.role} · {selected.location}
              </p>
            </div>

            <div className="modal-body">
              <div className="info-box">
                <h4>About</h4>
                <p className="clamp-text">
                  {selected.description || "No description available."}
                </p>
              </div>

              <div className="info-box inline">
                <h4>Status</h4>
                <span className="status active">Active official</span>
              </div>

              {selected.email && (
                <div className="info-box inline">
                  <h4>Email</h4>
                  <span className="info-value">{selected.email}</span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              {selected.email && (
                <a
                  href={`mailto:${selected.email}`}
                  className="btn email"
                >
                  📧 Send email
                </a>
              )}
              <button
                className="btn secondary-btn"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Officials;
