import { useEffect, useState } from "react";
import axios from "axios";
import "./OfficialPetitions.css";

function OfficialPetitions() {

  const [petitions, setPetitions] = useState([]);
  const [selectedPetition, setSelectedPetition] = useState(null);

  const [responseMessage, setResponseMessage] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");

  // ================= FETCH PETITIONS =================
  const fetchPetitions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/petitions?myLocation=true",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      setPetitions(res.data);

    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchPetitions();
    })();
  }, []);

  // ================= SUBMIT RESPONSE =================
  const handleResponse = async () => {
    try {

      if (!responseMessage) {
        alert("Response message required");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/petitions/${selectedPetition._id}/respond`,
        {
          message: responseMessage,
          statusUpdate
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      alert("Response submitted successfully");

      setSelectedPetition(null);
      setResponseMessage("");
      setStatusUpdate("");

      fetchPetitions();

    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  // ================= DETAIL VIEW =================
  if (selectedPetition) {

    const progress =
      (selectedPetition.signatures.length /
        selectedPetition.signatureGoal) * 100;

    return (
      <div className="official-detail">

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

        {/* Progress */}
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p>
          {selectedPetition.signatures.length} /
          {selectedPetition.signatureGoal} signatures
        </p>

        {/* ================= RESPONSE ================= */}

        <h3>Official Response</h3>

        <textarea
          placeholder="Write official response..."
          value={responseMessage}
          onChange={(e) =>
            setResponseMessage(e.target.value)
          }
        />

        {/* ================= STATUS FLOW ================= */}

        <h3>Update Status</h3>

        <select
          value={statusUpdate}
          onChange={(e) =>
            setStatusUpdate(e.target.value)
          }
        >

          {selectedPetition.status === "active" && (
            <option value="under_review">
              Move to Under Review
            </option>
          )}

          <select
 value={statusUpdate}
 onChange={(e)=>setStatusUpdate(e.target.value)}
>
  <option value="under_review">
    Under Review
  </option>

  <option value="approved">
    Approve Petition
  </option>

  <option value="rejected">
    Reject Petition
  </option>
</select>

          {/* {(selectedPetition.status === "approved" ||
            selectedPetition.status === "rejected") && (
            <option value="closed">
              Close Petition
            </option>
          )} */}

        </select>

        <button onClick={handleResponse}>
          Submit Response
        </button>

        {/* ================= RESPONSE HISTORY ================= */}

        <h3>Previous Responses</h3>

        {selectedPetition.responses.length === 0 && (
          <p>No responses yet</p>
        )}

        {selectedPetition.responses.map((r, index) => (
          <div key={index} className="response-card">
            <p>{r.message}</p>
            <small>Status: {r.statusUpdate}</small>
          </div>
        ))}

      </div>
    );
  }

  // ================= LIST VIEW =================
  return (
    <div className="official-page">

      <h2>Petitions For Review</h2>

      <div className="petition-list">

        {petitions.map((petition) => (

          <div
            key={petition._id}
            className="petition-card"
            onClick={() =>
              setSelectedPetition(petition)
            }
          >

            <h3>{petition.title}</h3>

            <p>{petition.description}</p>

            <span className={`status ${petition.status}`}>
              {petition.status}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}

export default OfficialPetitions;