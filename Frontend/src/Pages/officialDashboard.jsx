import { useEffect, useState } from "react";
import api from "../api";
import "./OfficialDashboard.css";

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
        const res = await api.get("/api/dashboard/official");

        setStats({
          totalPetitions: res.data.total ?? 0,
          underReview: res.data.underReview ?? 0,
          closedPetitions: res.data.closed ?? 0,
          responsesGiven: res.data.responsesGiven ?? 0
        });

      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();

  }, []);

  return (
    <div className="official-dashboard">

      {/* HEADER */}
      <div className="dashboard-header">
        <h2>Official Dashboard</h2>
        <p>Manage petitions in your region efficiently</p>
      </div>

      {/* STATS */}
      <div className="stats-grid">

        <div className="stat-card blue">
          <h3>{stats.totalPetitions}</h3>
          <p>Total Petitions</p>
        </div>

        <div className="stat-card yellow">
          <h3>{stats.underReview}</h3>
          <p>Under Review</p>
        </div>

        <div className="stat-card red">
          <h3>{stats.closedPetitions}</h3>
          <p>Closed</p>
        </div>

        <div className="stat-card green">
          <h3>{stats.responsesGiven}</h3>
          <p>Responses Given</p>
        </div>

      </div>

    </div>
  );
}

export default OfficialDashboard;