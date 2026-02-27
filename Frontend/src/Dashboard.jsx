import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import WelcomeCard from "./WelcomeCard";
import StatsSection from "./StatsSection";
import CardsSection from "./CardsSection";
import PetitionList from "./PetitionList";
import MyPetitions from "./MyPetitions";
import OfficialStats from "./OfficialStats";

import "./dashboard.css";

function Dashboard() {

  const [activePage, setActivePage] =
    useState("dashboard");

    const token = localStorage.getItem("accessToken");

    const user =
      token ? JSON.parse(atob(token.split(".")[1])) : null;

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

          {/* ✅ MY PETITIONS */}
          {activePage === "myPetitions" && (
            <MyPetitions />
          )}

          {/* FUTURE MODULES */}
          {activePage === "polls" && (
            <h2>📊 Polls Section (Coming Soon)</h2>
          )}

          {activePage === "Reports" && (
            <h2>📑 Reports Section (Coming Soon)</h2>
          )}

          {activePage === "Settings" && (
            <h2>⚙ Settings (Coming Soon)</h2>
          )}

        </div>

      </div>
    </div>
  );
}

export default Dashboard;