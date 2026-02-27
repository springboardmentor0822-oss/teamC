import { useEffect, useState, } from "react";
import axios from "axios";
import "./PetitionList.css";

function PetitionList() {
  const [petitions, setPetitions] = useState([]);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [myLocation, setMyLocation] = useState(false);
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [officialMessage, setOfficialMessage] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");

const token = localStorage.getItem("accessToken");
let userRole = null;

if (token) {
  const payload = JSON.parse(atob(token.split(".")[1]));
  userRole = payload.role;
}
  
  // 🔥 Fetch petitions (clean architecture)
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      let query = [];

      if (category) query.push(`category=${category}`);
      if (status) query.push(`status=${status}`);
      if (myLocation) query.push(`myLocation=true`);

      const queryString = query.length ? `?${query.join("&")}` : "";

      const res = await axios.get(
        `http://localhost:5000/api/petitions${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          signal: controller.signal,
        }
      );

      setPetitions(res.data);

    } catch (error) {
      if (error.name !== "CanceledError") {
        console.error(error);
      }
    }
  };

  fetchData();

  return () => controller.abort();

}, [category, status, myLocation]);


  // 🔥 Sign petition
 const handleSign = async (id) => {
  try {
    await axios.post(
      `http://localhost:5000/api/petitions/${id}/sign`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    // Trigger refetch by toggling location state trick
    setMyLocation((prev) => prev);

  } catch (error) {
    alert(error.response?.data?.message);
  }
};


  // ================= DETAIL VIEW =================
  if (selectedPetition) {
    const progress =
      (selectedPetition.signatures.length /
        selectedPetition.signatureGoal) *
      100;

    return (
      <div className="petition-detail-page">
        <div className="detail-header">
          <button
            className="back-btn"
            onClick={() => setSelectedPetition(null)}
          >
            ← Back
          </button>

          <div className="detail-meta-top">
            <span className="detail-location">
              {selectedPetition.location}
            </span>
            <span className={`detail-status-pill ${selectedPetition.status}`}>
              {selectedPetition.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="detail-card">
          <h2 className="detail-title">{selectedPetition.title}</h2>
          <p className="detail-subtitle">
            {selectedPetition.description}
          </p>

          <div className="detail-meta-row">
            <span className="detail-chip">
              {selectedPetition.category}
            </span>
          </div>

          <div className="detail-progress-row">
            <div className="progress-bar detail-progress-bar">
              <div
                className="progress"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="detail-progress-text">
              {selectedPetition.signatures.length} /{" "}
              {selectedPetition.signatureGoal} signatures
            </p>
          </div>

          {selectedPetition.status === "active" && (
            <button
              className="primary-btn"
              onClick={async () => {
                await handleSign(selectedPetition._id);
                setSelectedPetition(null);
              }}
            >
              Sign Petition
            </button>
          )}
        </div>

        <div className="detail-sections">
          <div className="detail-section-card">
            <h3 className="section-title">Official Responses</h3>

            {userRole === "official" &&
              selectedPetition.status !== "closed" && (
                <div className="official-response">
                  <textarea
                    className="official-textarea"
                    placeholder="Write your response..."
                    value={officialMessage}
                    onChange={(e) =>
                      setOfficialMessage(e.target.value)
                    }
                  />

                  <div className="official-controls">
                    <select
                      className="official-select"
                      value={statusUpdate}
                      onChange={(e) =>
                        setStatusUpdate(e.target.value)
                      }
                    >
                      <option value="">No Status Change</option>
                      <option value="under_review">
                        Under Review
                      </option>
                      <option value="closed">Close Petition</option>
                    </select>

                    <button
                      className="primary-btn"
                      onClick={async () => {
                        try {
                          await axios.post(
                            `http://localhost:5000/api/petitions/${selectedPetition._id}/respond`,
                            {
                              message: officialMessage,
                              statusUpdate,
                            },
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );

                          alert("Response submitted");

                          setOfficialMessage("");
                          setStatusUpdate("");
                          setSelectedPetition(null);
                        } catch (error) {
                          alert(
                            error.response?.data?.message
                          );
                        }
                      }}
                    >
                      Submit Response
                    </button>
                  </div>
                </div>
              )}

            {selectedPetition.responses.length === 0 && (
              <p className="muted-text">
                No responses yet.
              </p>
            )}

            {selectedPetition.responses.length > 0 && (
              <div className="responses-list">
                {selectedPetition.responses.map(
                  (response, index) => (
                    <div
                      key={index}
                      className="response-item"
                    >
                      <div className="response-header">
                        <span className="response-pill">
                          Official Response
                        </span>
                        <span className="response-status">
                          {response.statusUpdate}
                        </span>
                      </div>
                      <p>{response.message}</p>
                      <small className="response-meta">
                        By {response.official?.name} •{" "}
                        {new Date(
                          response.respondedAt
                        ).toLocaleString()}
                      </small>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div className="detail-section-card">
            <h3 className="section-title">Petition Timeline</h3>

            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <strong>Petition Created</strong>
                  <p>
                    by {selectedPetition.createdBy?.name}
                  </p>
                </div>
              </div>

              {selectedPetition.responses.length === 0 && (
                <p className="muted-text">
                  No official actions yet.
                </p>
              )}

              {selectedPetition.responses.map(
                (response, index) => (
                  <div
                    key={index}
                    className="timeline-item"
                  >
                    <div className="timeline-dot timeline-dot-secondary" />
                    <div className="timeline-content">
                      <strong>Official Response</strong>
                      <p>{response.message}</p>
                      <small>
                        Status Updated:{" "}
                        {response.statusUpdate}
                      </small>
                      <br />
                      <small>
                        By: {response.official?.name}
                      </small>
                      <br />
                      <small>
                        {new Date(
                          response.respondedAt
                        ).toLocaleString()}
                      </small>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= LIST VIEW =================
  return (
    <div className="petition-page">
      <div className="petition-page-header">
        <h2>Petitions</h2>
        <p className="muted-text">
          Explore, filter and sign petitions from your community.
        </p>
      </div>

      {/* FILTERS */}
      <div className="filters">
        <div className="filter-group">
          <label>Category</label>
          <select
            className="filter-select"
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Health">Health</option>
            <option value="Education">Education</option>
            <option value="Environment">Environment</option>
            <option value="Governance">Governance</option>
            <option value="Social">Social</option>
            <option value="Economy">Economy</option>
            <option value="Culture">Culture</option>
            <option value="Sports">Sports</option>
            <option value="Technology">Technology</option>
            <option value="Human Rights">Human Rights</option>
            <option value="Public Safety">Public Safety</option>
            <option value="Transportation">Transportation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            className="filter-select"
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="under_review">Under Review</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={myLocation}
            onChange={() => setMyLocation(!myLocation)}
          />
          <span>My location only</span>
        </label>
      </div>

      {/* PETITION CARDS */}
      <div className="petition-list">
        {petitions.map((petition) => {
          const progress =
            (petition.signatures.length /
              petition.signatureGoal) *
            100;

          return (
            <div
              key={petition._id}
              className="petition-card"
              onClick={() => setSelectedPetition(petition)}
            >
              <div className="card-header-row">
                <h3>{petition.title}</h3>
                <span
                  className={`status-pill ${petition.status}`}
                >
                  {petition.status.replace("_", " ")}
                </span>
              </div>

              <p className="card-description">
                {petition.description}
              </p>

              <div className="meta">
                <span className="chip">
                  {petition.category}
                </span>
                <span className="chip chip-light">
                  {petition.location}
                </span>
              </div>

              <div className="card-footer">
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="signature-row">
                  <span className="signature-count">
                    {petition.signatures.length} /{" "}
                    {petition.signatureGoal} signatures
                  </span>

                  {petition.status === "active" && (
                    <button
                      className="sign-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSign(petition._id);
                      }}
                    >
                      Sign
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {petitions.length === 0 && (
          <div className="empty-state">
            <p>No petitions match these filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PetitionList;
