import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ResetPassword.css";

function ResetPassword() {
  const { token } = useParams(); // get token from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      setError("");
      setSuccess("");

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      setLoading(true);

      await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password }
      );

      setSuccess("Password reset successful. Redirecting to login...");
      
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid or expired reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2>Reset Password</h2>

        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button onClick={handleReset} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;