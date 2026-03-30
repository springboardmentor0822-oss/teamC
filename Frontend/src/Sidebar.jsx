import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FaHome,
  FaFileAlt,
  FaClipboardList,
  FaPoll,
  FaUserTie,
  FaChartBar,
  FaCog
} from "react-icons/fa";

function Sidebar() {

  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const isActive = (path) => location.pathname === path;

  const goTo = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className={`sidebar ${open ? "open" : "closed"}`}>

      {/* HAMBURGER */}
      <div className="hamburger" onClick={() => setOpen(!open)}>
        ☰
      </div>

      <ul>

        <li
          className={isActive("/dashboard") ? "active" : ""}
          onClick={() => goTo("/dashboard")}
        >
          <FaHome className="icon" />
          {open && <span>Dashboard</span>}
        </li>

        <li
          className={isActive("/dashboard/petitions") ? "active" : ""}
          onClick={() => goTo("/dashboard/petitions")}
        >
          <FaFileAlt className="icon" />
          {open && <span>Petitions</span>}
        </li>

        <li
          className={isActive("/dashboard/mypetitions") ? "active" : ""}
          onClick={() => goTo("/dashboard/mypetitions")}
        >
          <FaClipboardList className="icon" />
          {open && <span>My Petitions</span>}
        </li>

        <li
          className={isActive("/dashboard/polls") ? "active" : ""}
          onClick={() => goTo("/dashboard/polls")}
        >
          <FaPoll className="icon" />
          {open && <span>Polls</span>}
        </li>

        <li
          className={isActive("/dashboard/officials") ? "active" : ""}
          onClick={() => goTo("/dashboard/officials")}
        >
          <FaUserTie className="icon" />
          {open && <span>Officials</span>}
        </li>

        <li
          className={isActive("/dashboard/reports") ? "active" : ""}
          onClick={() => goTo("/dashboard/reports")}
        >
          <FaChartBar className="icon" />
          {open && <span>Reports</span>}
        </li>

        <li
          className={isActive("/dashboard/Settings") ? "active" : ""}
          onClick={() => goTo("/dashboard/Settings")}
        >
          <FaCog className="icon" />
          {open && <span>Settings</span>}
        </li>

      </ul>

    </div>
  );
}

export default Sidebar;