import { useEffect, useState } from "react";
import axios from "axios";
import "./PetitionList.css";

function MyPetitions() {

  const [petitions, setPetitions] = useState([]);

  const fetchMyPetitions = async () => {
    try {

      const res = await axios.get(
        "http://localhost:5000/api/petitions/my",
        {
          headers: {
            Authorization:
              `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      setPetitions(res.data);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchMyPetitions();
    })();
  }, []);

  return (
    <div className="petition-page">

      <h2>My Petitions</h2>

      <div className="petition-list">

        {petitions.map((p) => {

          const progress =
            (p.signatures.length / p.signatureGoal) * 100;

          return (
            <div key={p._id} className="petition-card">

              <h3>{p.title}</h3>

              <p>{p.description}</p>

              <div className="meta">
                <span>{p.category}</span>
                <span>{p.location}</span>
                <span className={`status ${p.status}`}>
                  {p.status}
                </span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p>
                {p.signatures.length} /
                {p.signatureGoal} signatures
              </p>

              <div className="petition-actions">

  <button
    className="delete-btn"
    onClick={async () => {

      if (!window.confirm("Delete this petition?")) return;

      try {
        await axios.delete(
          `http://localhost:5000/api/petitions/${p._id}`,
          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );

        fetchMyPetitions();

      } catch (err) {
        alert(err.response?.data?.message);
      }
    }}
  >
    Delete
  </button>

</div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default MyPetitions;