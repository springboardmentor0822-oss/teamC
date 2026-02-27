import { useEffect, useState } from "react";
import axios from "axios";
import "./MyPetition.css";

function MyPetitions() {
  const [petitions, setPetitions] = useState([]);

  const fetchMyPetitions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/petitions/my", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

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
    <div className="my-petition-page">
      <div className="my-petition-header">
        <div>
          <h2 className="my-petition-title">My Petitions</h2>
          <p className="my-petition-subtitle">
            Track the progress of petitions you have created.
          </p>
        </div>

        <div className="my-petition-summary-chip">
          <span>Total petitions</span>
          <strong>{petitions.length}</strong>
        </div>
      </div>

      <div className="my-petition-list">
        {petitions.map((p) => {
          const progress = (p.signatures.length / p.signatureGoal) * 100;

          return (
            <div key={p._id} className="my-petition-card">
              <div className="my-petition-card-header">
                <h3 className="my-petition-card-title">{p.title}</h3>
                <span className={`my-status-badge my-status-${p.status}`}>
                  {p.status}
                </span>
              </div>

              <p className="my-petition-description">{p.description}</p>

              <div className="my-petition-meta">
                <span className="my-meta-pill">{p.category}</span>
                <span className="my-meta-dot">•</span>
                <span className="my-meta-text">{p.location}</span>
              </div>

              <div className="my-petition-progress-row">
                <div className="my-progress-info">
                  <span className="my-progress-label">Progress</span>
                  <span className="my-progress-value">
                    {p.signatures.length} / {p.signatureGoal} signatures
                  </span>
                </div>

                <div className="my-progress-bar">
                  <div
                    className="my-progress-fill"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="my-petition-actions">
                <button
                  className="my-delete-btn"
                  onClick={async () => {
                    if (!window.confirm("Delete this petition?")) return;

                    try {
                      await axios.delete(
                        `http://localhost:5000/api/petitions/${p._id}`,
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "accessToken"
                            )}`,
                          },
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

        {petitions.length === 0 && (
          <div className="my-empty-state">
            <h3>No petitions yet</h3>
            <p>Create your first petition to see it listed here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPetitions;
