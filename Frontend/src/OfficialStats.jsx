import { useEffect, useState } from "react";
import axios from "axios";
import "./StatsSection.css";

function OfficialStats() {

  const [stats, setStats] = useState({
    totalPetitions: 0,
    underReview: 0,
    closedPetitions: 0,
    responsesGiven: 0
  });

  useEffect(() => {

    const fetchStats = async () => {
      try {

        const res = await axios.get(
          "http://localhost:5000/api/dashboard/official",
          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );

        setStats(res.data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();

  }, []);

  return (
    <div className="stats-section">

      <div className="stat-card">
        <h3>{stats.totalPetitions}</h3>
        <p>Regional Petitions</p>
      </div>

      <div className="stat-card">
        <h3>{stats.underReview}</h3>
        <p>Under Review</p>
      </div>

      <div className="stat-card">
        <h3>{stats.closedPetitions}</h3>
        <p>Closed</p>
      </div>

      <div className="stat-card">
        <h3>{stats.responsesGiven}</h3>
        <p>Responses Given</p>
      </div>

    </div>
  );
}

export default OfficialStats;