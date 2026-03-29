import { useEffect, useState } from "react";
import api from "../api";
import "./OfficialPetitions.css";

function OfficialPetitions() {

  const [petitions, setPetitions] = useState([]);

  useEffect(() => {

    const fetchPetitions = async () => {
      try {
        const res = await api.get("/api/petitions?myLocation=true");
        setPetitions(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPetitions();

  }, []);

  return (
    <div className="official-petitions">

      <h2>Petitions For Review</h2>

      <div className="petition-grid">

        {petitions.map(p => (
          <div key={p._id} className="petition-card">

            <h3>{p.title}</h3>
            <p>{p.description}</p>

            <div className="petition-footer">
              <span className={`status ${p.status}`}>
                {p.status}
              </span>

              <span>
                {p.signatures?.length || 0} signatures
              </span>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default OfficialPetitions;