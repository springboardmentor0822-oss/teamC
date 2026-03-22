import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import WelcomeCard from "./WelcomeCard";
import StatsSection from "./StatsSection";
import CardsSection from "./CardsSection";
import OfficialStats from "./OfficialStats";
import Reports from "./Pages/Reports";

import "./dashboard.css";

function Dashboard() {

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("accessToken");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [navigate, token]);

  // Check if we are on base dashboard route
  const isHome = location.pathname === "/dashboard";

  return (
    <div className="dashboard-container">

      <Topbar />

      <div className="dashboard-body">

        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <div className="dashboard-main">

          {/* ✅ Dashboard Home */}
          {isHome && (
            <>
              <WelcomeCard />
              {user?.role === "official"
                ? <OfficialStats />
                : <StatsSection />
              }
              <CardsSection />
            </>
          )}

          {/* ✅ Routed Pages (Polls, Petitions, etc.) */}
          <Outlet />

        </div>

      </div>

    </div>
  );
}

export default Dashboard;