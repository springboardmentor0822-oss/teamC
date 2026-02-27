import { useNavigate } from "react-router-dom";

function WelcomeCard() {
  const navigate = useNavigate();   

  return (
    <div className="welcome-card">
      <h2>Welcome back 👋</h2>
      <p>Your civic engagement is making a difference.</p>

      <button onClick={() => navigate("/create-petition")}>
        Create Petition
      </button>
    </div>
  );
}

export default WelcomeCard;

