import { useEffect, useState } from "react";
import axios from "axios";

function OfficialDashboard() {

  const [stats, setStats] = useState({
    totalPetitions: 0,
    underReview: 0,
    closedPetitions: 0,
    responsesGiven: 0
  });

  useEffect(() => {

    const fetchStats = async () => {

      try {

        const token = localStorage.getItem("accessToken");

        const res = await axios.get(
          "http://localhost:5000/api/dashboard/official",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setStats(res.data);

      } catch (error) {
        console.error(error);
      }

    };

    fetchStats();

  }, []);

  return (

    <div style={{ padding: "40px" }}>

      <h2>Official Dashboard</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: "20px",
        marginTop: "20px"
      }}>

        <div className="stat-card">
          <h3>{stats.totalPetitions}</h3>
          <p>Total Petitions</p>
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

    </div>
  );
}

export default OfficialDashboard;