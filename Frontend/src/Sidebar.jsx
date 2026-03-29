import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

function Sidebar() {

  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const isActive = (path) => location.pathname === path;

  const goTo = (path) => {
    navigate(path);
    setOpen(false); // ✅ automatically close sidebar
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
          {open && "Dashboard"}
        </li>

        <li
          className={isActive("/dashboard/petitions") ? "active" : ""}
          onClick={() => goTo("/dashboard/petitions")}
        >
          {open && "Petitions"}
        </li>

        <li
          className={isActive("/dashboard/mypetitions") ? "active" : ""}
          onClick={() => goTo("/dashboard/mypetitions")}
        >
          {open && "My Petitions"}
        </li>

        <li
          className={isActive("/dashboard/polls") ? "active" : ""}
          onClick={() => goTo("/dashboard/polls")}
        >
          {open && "Polls"}
        </li>

        <li
          className={isActive("/dashboard/officials") ? "active" : ""}
          onClick={() => goTo("/dashboard/officials")}
        >
          {open && "Officials"}
        </li>

        <li
          className={isActive("/dashboard/reports") ? "active" : ""}
          onClick={() => goTo("/dashboard/reports")}
        >
          {open && "Reports"}
        </li>

        <li
          className={isActive("/dashboard/settings") ? "active" : ""}
          onClick={() => goTo("/dashboard/settings")}
        >
          {open && "Settings"}
        </li>

      </ul>

    </div>
  );
}

export default Sidebar;
