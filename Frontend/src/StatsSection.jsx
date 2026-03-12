import { useEffect, useState } from "react";
import axios from "axios";
import "./StatsSection.css";

function StatsSection() {

  const [stats, setStats] = useState({
    totalPetitions: 0,
    closedPetitions: 0,
    pollsCreated: 0,
    myPetitions: 0,
    successfulPetitions: 0,
   
  });

  const [loading, setLoading] = useState(true);

  // ✅ Fetch dashboard stats
  useEffect(() => {

    const fetchStats = async () => {
      try {

        const res = await axios.get(
          "http://localhost:5000/api/dashboard",
          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("accessToken")}`
            }
          }
        );

        setStats(res.data);

      } catch (error) {
        console.error("Dashboard stats error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

  }, []);

  if (loading) {
    return <p>Loading stats...</p>;
  }

  return (
    <div className="stats-section">

      <div className="stat-card">
        <h3>{stats.total}</h3>
        <p>My Petitions</p>
      </div>

      <div className="stat-card">
        <h3>{stats.closed}</h3>
        <p>Successful Petitions</p>
      </div>

      <div className="stat-card">
        <h3>{stats.pollsCreated}</h3>
        <p>Polls Created</p>
      </div>

    </div>
  );
}

export default StatsSection;