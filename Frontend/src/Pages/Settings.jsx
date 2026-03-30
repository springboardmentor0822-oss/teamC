import "./Settings.css";

function Settings() {
  return (
    <div className="settings-page">

      <h2>Settings & Info</h2>

      {/* ABOUT */}
      <div className="settings-card">
        <h3>About Civix</h3>
        <p>
          Civix is a civic engagement platform that allows citizens to raise
          petitions, participate in polls, and interact with government officials.
          It helps bridge the gap between people and administration by making
          communication transparent and structured.
        </p>
      </div>

      {/* CURRENT FEATURES */}
      <div className="settings-card">
        <h3>Current Features</h3>
        <ul>
          <li>Create and manage petitions</li>
          <li>Sign and track petitions</li>
          <li>Participate in polls</li>
          <li>View officials and reports</li>
          <li>Real-time updates and notifications</li>
        </ul>
      </div>

      {/* UPCOMING FEATURES */}
      <div className="settings-card upcoming">
        <h3>Upcoming Features 🚀</h3>
        <ul>
          <li>Advanced analytics dashboard</li>
          <li>Priority-based petition tracking</li>
          <li>Improved notification system</li>
          <li>Mobile app support</li>
          <li>Enhanced user personalization</li>
        </ul>

        <p className="note">
          More features are currently under development and will be added soon.
        </p>
      </div>

    </div>
  );
}

export default Settings;