import { useState } from "react";
import axios from "axios";
import "./ForgotPassword.css";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setSuccess("");

      if (!validateEmail(email)) {
        setError("Please enter a valid email address");
        return;
      }

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      setSuccess(res.data.message);

    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2>Forgot Password</h2>

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="back-link">
          <Link to="/">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;