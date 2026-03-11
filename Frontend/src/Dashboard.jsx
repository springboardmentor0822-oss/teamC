import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import WelcomeCard from "./WelcomeCard";
import StatsSection from "./StatsSection";
import CardsSection from "./CardsSection";
import PetitionList from "./PetitionList";
import MyPetitions from "./MyPetitions";
import OfficialStats from "./OfficialStats";
import PollList from "./Pollss/PollList";

import "./dashboard.css";
import { useEffect } from "react";

function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);
  
  return (
    <div className="dashboard-container">
      <Topbar />
      <div className="dashboard-body">
        {/* SIDEBAR */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
        />
        {/* MAIN CONTENT */}
        <div className="dashboard-main">
          {/* HOME */}
          {activePage === "dashboard" && (
            <>
              <WelcomeCard />
              {user?.role === "official"
                ? <OfficialStats />
                : <StatsSection />
              }
              <CardsSection />
            </>
          )}
          {/* BROWSE PETITIONS */}
          {activePage === "petitions" && (
            <PetitionList />
          )}
          {/* MY PETITIONS */}
          {activePage === "myPetitions" && (
            <MyPetitions />
          )}
          {/* FUTURE MODULES */}
          {activePage === "polls" && (
            <PollList />
          )}
          {activePage === "Reports" && (
            <h2 className="coming-soon">📑 Reports Section (Coming Soon)</h2>
          )}
          {activePage === "Settings" && (
            <h2 className="coming-soon">⚙ Settings (Coming Soon)</h2>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
