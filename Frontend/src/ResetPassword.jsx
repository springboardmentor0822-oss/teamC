import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./ResetPassword.css";

const API_BASE = "http://localhost:5000/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [passwordRules, setPasswordRules] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });
  const [showPasswordHints, setShowPasswordHints] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (value) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+[\]{};:'",.<>/?]).{8,}$/;
    return regex.test(value);
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordRules({
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*()_\-+[\]{};:'",.<>/?]/.test(value),
    });
  };

  const handleReset = async () => {
    if (loading) return;

    setError("");
    setSuccess("");

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API_BASE}/auth/reset-password/${token}`, {
        password,
      });

      setSuccess("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid or expired reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2>Reset Password</h2>

        {/* New password */}
        <label>New Password</label>
        <div
          className="password-field"
          onFocus={() => setShowPasswordHints(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setShowPasswordHints(false);
            }
          }}
        >
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-eye-btn"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>

          {showPasswordHints && (
            <div className="password-popover">
              <p className="password-popover-title">Password must contain:</p>
              <ul>
                <li className={passwordRules.length ? "ok" : ""}>
                  8 or more characters
                </li>
                <li className={passwordRules.number ? "ok" : ""}>
                  At least 1 number
                </li>
                <li className={passwordRules.upper ? "ok" : ""}>
                  At least 1 uppercase letter
                </li>
                <li className={passwordRules.lower ? "ok" : ""}>
                  At least 1 lowercase letter
                </li>
                <li className={passwordRules.special ? "ok" : ""}>
                  At least 1 special character (e.g. ! @ # $ ^)
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <label>Confirm Password</label>
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-eye-btn"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button
          className="reset-submit-btn"
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
