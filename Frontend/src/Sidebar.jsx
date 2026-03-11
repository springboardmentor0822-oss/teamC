function Sidebar({ activePage, setActivePage }) {
  return (
    <div className="sidebar">
      

      <ul>
        <li
          className={activePage === "dashboard" ? "active" : ""}
          onClick={() => setActivePage("dashboard")}
        >
          Dashboard
        </li>

        <li
          className={activePage === "petitions" ? "active" : ""}
          onClick={() => setActivePage("petitions")}
        >
          Petitions
        </li>

        {/* <li onClick={() => setActivePage("petitions")}>
          Browse Petitions
        </li> */}

        <li onClick={() => setActivePage("myPetitions")}>
          My Petitions
        </li>

        <li
          className={activePage === "polls" ? "active" : ""}
          onClick={() => setActivePage("polls")}
        >
          Polls
        </li>

        <li
          className={activePage === "Officials" ? "active" : ""}
          onClick={() => setActivePage("Officials")}
        >
          Officials
        </li>
       
        <li
          className={activePage === "Settings" ? "active" : ""}
          onClick={() => setActivePage("Settings")}
        >
          Settings
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;


