import { useEffect, useState } from "react";
import axios from "axios";

function CardsSection() {
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchPetitions = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        "http://localhost:5000/api/petitions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPetitions(res.data);
    } catch (error) {
      console.error("Error fetching petitions:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchPetitions();
}, []);

  if (loading) return <p>Loading petitions...</p>;

  const activePetitions = petitions.filter(
    (petition) => petition.status === "open"
  );

  return (
    <div className="cards-section">
      <div className="section-header">
        <h2>Active Petitions Near You</h2>
      </div>

      <div className="cards-grid">
        {activePetitions.map((petition) => (
          <div key={petition._id} className="premium-card">
            <h3>{petition.title}</h3>
            <p>{petition.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardsSection;
