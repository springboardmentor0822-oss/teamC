import { useNavigate } from "react-router-dom";

function WelcomeCard({user}) {
  const navigate = useNavigate();    

  return (
    <div className="welcome-card">
      <h2>Welcome back 👋</h2>
      <p>Your civic engagement is making a difference.</p>

        {user && user.role ==="citizen" && (
      <button onClick={() => navigate("/create-petition")}>
        Create Petition
      </button>
       )}
    </div>
  );
}

export default WelcomeCard;

