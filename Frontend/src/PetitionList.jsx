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

  // =====================================================
  // 🔥 DETAIL VIEW MODE
  // =====================================================
  if (selectedPetition) {
    const progress =
      (selectedPetition.signatures.length /
        selectedPetition.signatureGoal) *
      100;

    return (
      <div className="petition-detail">
        <button onClick={() => setSelectedPetition(null)}>
          ← Back
        </button>

        <h2>{selectedPetition.title}</h2>
        <p>{selectedPetition.description}</p>

        <div className="meta">
          <span>{selectedPetition.category}</span>
          <span>{selectedPetition.location}</span>
          <span className={`status ${selectedPetition.status}`}>
            {selectedPetition.status}
          </span>
        </div>

        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p>
          {selectedPetition.signatures.length} /{" "}
          {selectedPetition.signatureGoal} signatures
        </p>

        {selectedPetition.status === "active" && (
          <button
            onClick={async () => {
              await handleSign(selectedPetition._id);
              setSelectedPetition(null);
            }}
          >
            Sign Petition
          </button>
        )}

        <h3>Official Responses</h3>

        {userRole === "official" && selectedPetition.status !== "closed" && (
  <div className="official-response">
    {/* <h3>Respond to Petition</h3> */}

    <textarea
      placeholder="Write your response..."
      value={officialMessage}
      onChange={(e) => setOfficialMessage(e.target.value)}
    />

    <select
      value={statusUpdate}
      onChange={(e) => setStatusUpdate(e.target.value)}
    >
      <option value="">No Status Change</option>
      <option value="under_review">Under Review</option>
      <option value="closed">Close Petition</option>
    </select>

    <button
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
          alert(error.response?.data?.message);
        }
      }}
    >
      Submit Response
    </button>
  </div>
)}

        {selectedPetition.responses.length === 0 && (
          <p>No responses yet.</p>
        )}

        <h3>Petition Timeline</h3>

<div className="timeline">

  {/* Petition Created */}
  <div className="timeline-item">
    <strong>Petition Created</strong>
    <p>
      by {selectedPetition.createdBy?.name}
    </p>
  </div>

  {/* Official Responses */}
  {selectedPetition.responses.length === 0 && (
    <p>No official actions yet.</p>
  )}

  {selectedPetition.responses.map((response, index) => (
    <div key={index} className="timeline-item">

      <strong>Official Response</strong>

      <p>{response.message}</p>

      <small>
        Status Updated: {response.statusUpdate}
      </small>

      <br />

      <small>
        By: {response.official?.name}
      </small>

      <br />

      <small>
        {new Date(response.respondedAt).toLocaleString()}
      </small>

    </div>
  ))}

</div>
      </div>
    );
  }

  // =====================================================
  // 🔥 LIST VIEW MODE
  // =====================================================
  return (
    <div className="petition-page">
      <h2>Petitions</h2>

      {/* FILTERS */}
      <div className="filters">
        <select onChange={(e) => setCategory(e.target.value)}>
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

        <select onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="under_review">Under Review</option>
          <option value="closed">Closed</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={myLocation}
            onChange={() => setMyLocation(!myLocation)}
          />
          My Location Only
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
              <h3>{petition.title}</h3>
              <p>{petition.description}</p>

              <div className="meta">
                <span>{petition.category}</span>
                <span>{petition.location}</span>
                <span className={`status ${petition.status}`}>
                  {petition.status}
                </span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p>
                {petition.signatures.length} /{" "}
                {petition.signatureGoal} signatures
              </p>

              {petition.status === "active" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSign(petition._id);
                  }}
                >
                  Sign Petition
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PetitionList;