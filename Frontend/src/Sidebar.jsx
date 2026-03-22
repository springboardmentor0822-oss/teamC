import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">

      <ul>

        <li
          className={isActive("/dashboard") ? "active" : ""}
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </li>

        <li
          className={isActive("/dashboard/petitions") ? "active" : ""}
          onClick={() => navigate("/dashboard/petitions")}
        >
          Petitions
        </li>

        <li
          className={isActive("/dashboard/mypetitions") ? "active" : ""}
          onClick={() => navigate("/dashboard/mypetitions")}
        >
          My Petitions
        </li>

        <li
          className={isActive("/dashboard/polls") ? "active" : ""}
          onClick={() => navigate("/dashboard/polls")}
        >
          Polls
        </li>

        <li
          className={isActive("/dashboard/officials") ? "active" : ""}
          onClick={() => navigate("/dashboard/officials")}
        >
          Officials
        </li>

        <li
          className={isActive("/dashboard/reports") ? "active" : ""}
          onClick={() => navigate("/dashboard/reports")}
        >
          Reports
        </li>

        <li
          className={isActive("/dashboard/settings") ? "active" : ""}
          onClick={() => navigate("/dashboard/settings")}
        >
          Settings
        </li>

      </ul>

    </div>
  );
}

export default Sidebar;