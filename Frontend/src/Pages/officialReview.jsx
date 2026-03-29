import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./officialReview.css";

function OfficialReview() {

  const [petitions, setPetitions] = useState([]);
  const [responses, setResponses] = useState({});
  const [statuses, setStatuses] = useState({});

  const token = localStorage.getItem("accessToken");

  const fetchPetitions = useCallback(async () => {
    const res = await axios.get(
      "http://localhost:5000/api/petitions?myLocation=true",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setPetitions(res.data);
  }, [token]);

  useEffect(() => {
    (async () => {
      await fetchPetitions();
    })();
  }, [fetchPetitions]);

  const submitResponse = async (petitionId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/petitions/${petitionId}/respond`,
        {
          message: responses[petitionId],
          statusUpdate: statuses[petitionId]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Response submitted");

      // refresh
      fetchPetitions();

    } catch (err) {
      console.error(err);
      alert("Error submitting response");
    }
  };

  return (
    <div className="official-review">

      <h2>Petitions For Review</h2>

      {petitions.map((petition) => (
        <div key={petition._id} className="review-card">

          <h3>{petition.title}</h3>

          <p>{petition.description}</p>

          <p>Status: {petition.status}</p>

          <p>
            Signatures: {petition.signatures?.length || 0}
          </p>

          {/* RESPONSE INPUT */}
          <textarea
            placeholder="Write response..."
            value={responses[petition._id] || ""}
            onChange={(e) =>
              setResponses({
                ...responses,
                [petition._id]: e.target.value
              })
            }
          />

          {/* STATUS DROPDOWN */}
          <select
            value={statuses[petition._id] || ""}
            onChange={(e) =>
              setStatuses({
                ...statuses,
                [petition._id]: e.target.value
              })
            }
          >
            <option value="">No change</option>
            <option value="under_review">Under Review</option>
            <option value="closed">Close Petition</option>
          </select>

          <button onClick={() => submitResponse(petition._id)}>
            Submit Response
          </button>

        </div>
      ))}

    </div>
  );
}

export default OfficialReview;