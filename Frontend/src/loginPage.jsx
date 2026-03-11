import React, { useState } from "react";
import { FaFileSignature, FaChartBar, FaCheckCircle } from "react-icons/fa";
import "./loginPage.css";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE = "http://localhost:5000/api";

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPasswordHints, setShowPasswordHints ] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    role: "citizen",
    officialId: "",
  });

  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (name === "password") {
    setPasswordRules({
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*()_\-+[\]{};:'",.<>/?]/.test(value),
    });
  }
};


  const handleResendVerification = async () => {
    try {
      setLoadingVerify(true);
      setError("");
      setSuccess("");

      await axios.post(`${API_BASE}/auth/resend-verification`, {
        email: formData.email,
      });

      setSuccess("Verification email sent. Please check your inbox.");
      setShowVerify(false);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to resend verification email."
      );
    } finally {
      setLoadingVerify(false);
    }
  };

  const validatePassword = (password) => {
    // at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+[\]{};:'",.<>/?]).{6,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);

    try {
      setError("");
      setSuccess("");
      setShowVerify(false);

      // basic client validation
      if (!formData.password) {
  setError("Password required.");
  return;
}

// Enforce strong password ONLY while registering new users
if (!isLogin && !validatePassword(formData.password)) {
  setError(
    "Password must be 6+ characters, include uppercase, lowercase, number, and symbol."
  );
  return;
}



      if (!isLogin) {
        if (!formData.name.trim()) {
          setError("Full name is required.");
          return;
        }
        if (!formData.location.trim()) {
          setError("Location is required.");
          return;
        }
        if (
          formData.role === "official" &&
          !formData.officialId.trim()
        ) {
          setError("Official ID is required for government accounts.");
          return;
        }
      }

      if (isLogin) {
        // build login body without undefined fields
        const loginBody = {
          email: formData.email,
          password: formData.password,
        };

        if (
          formData.role === "official" &&
          formData.officialId.trim()
        ) {
          loginBody.officialId = formData.officialId.trim();
        }

        const res = await axios.post(
          `${API_BASE}/auth/login`,
          loginBody
        );

        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        let payload = null;
        try {
          payload = JSON.parse(
            atob(res.data.accessToken.split(".")[1])
          );
        } catch {
          setError("Invalid login response. Please try again.");
          return;
        }

        if (payload.role === "official") {
          navigate("/dashboard");
        } else if (payload.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        await axios.post(`${API_BASE}/auth/register`, {
          ...formData,
          officialId:
            formData.role === "official"
              ? formData.officialId
              : undefined,
        });

        setSuccess(
          "Registration successful. Please verify your email."
        );
        setIsLogin(true);
      }
      } catch (err) {
    const message =
      err.response?.data?.message || "Something went wrong";

    if (message === "Email not verified") {
  setError("Please verify your email to continue.");
  setShowVerify(true);
} else if (message === "Account locked. Try again in a few minutes.") {
  setError("Too many failed attempts. Try again in 15 minutes.");
} else if (message === "Invalid credentials") {
  setError("Email, password, or official ID is incorrect.");
} else {
  setError(message);
}

  } finally {
    setSubmitting(false);
  }

  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <div className="logo">
          <span className="logo-text">🏛 Civix</span>
        </div>

        <h1 className="title">Digital Civic Engagement Platform</h1>
        <p className="subtitle">Empowering civic voices</p>

        <div className="features">
          <div className="feature">
            <FaFileSignature />
            <div>
              <h4>Create and Sign Petitions</h4>
              <p>Easily create petitions and gather support.</p>
            </div>
          </div>

          <div className="feature">
            <FaChartBar />
            <div>
              <h4>Participate in Public Polls</h4>
              <p>Vote on local issues and see results.</p>
            </div>
          </div>

          <div className="feature">
            <FaCheckCircle />
            <div>
              <h4>Track Official Responses</h4>
              <p>Monitor progress on concerns.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="auth-card">
          <h2>{isLogin ? "Welcome Back" : "Create Your Account"}</h2>

          <div className="toggle">
            <button
  type="button"
  className={isLogin ? "active" : ""}
  onClick={() => {
    setIsLogin(true);
    setError("");
    setSuccess("");
    setShowVerify(false);
    setFormData((prev) => ({
      ...prev,
      password: "",
      officialId: "",
    }));
  }}
>
  Login
</button>

<button
  type="button"
  className={!isLogin ? "active" : ""}
  onClick={() => {
    setIsLogin(false);
    setError("");
    setSuccess("");
    setShowVerify(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      location: "",
      role: "citizen",
      officialId: "",
    });
  }}
>
  Register
</button>

          </div>

          <form onSubmit={handleSubmit} className="form">
            {!isLogin && (
              <>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />

                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />

<label>Password</label>
<div
  className="password-wrapper"
  onFocus={() => setShowPasswordHints(true)}
  onBlur={(e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowPasswordHints(false);
    }
  }}
>
  <div className="password-input-row">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={formData.password}
      onChange={handleChange}
      autoComplete="new-password"
    />
    <button
      type="button"
      className="password-toggle"
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </button>
  </div>

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




                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />

                <label className="field-label">Register as</label>
                <div className="role-toggle">
                  <button
                    type="button"
                    className={`role-option ${
                      formData.role === "citizen"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleChange({
                        target: {
                          name: "role",
                          value: "citizen",
                        },
                      })
                    }
                  >
                    <span className="role-title">
                      Community member
                    </span>
                    <span className="role-desc">
                      Create and support local petitions
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`role-option ${
                      formData.role === "official"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleChange({
                        target: {
                          name: "role",
                          value: "official",
                        },
                      })
                    }
                  >
                    <span className="role-title">
                      Government official
                    </span>
                    <span className="role-desc">
                      Respond to public issues and feedback
                    </span>
                  </button>
                </div>

                {formData.role === "official" && (
                  <>
                    <label>Enter Your ID</label>
                    <input
                      type="text"
                      name="officialId"
                      value={formData.officialId || ""}
                      onChange={handleChange}
                      placeholder="Enter your official ID"
                    />
                  </>
                )}
              </>
            )}

            {isLogin && (
              <>
                <label className="field-label">Sign in as</label>
                <div className="role-toggle">
                  <button
                    type="button"
                    className={`role-option ${
                      formData.role === "citizen"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleChange({
                        target: {
                          name: "role",
                          value: "citizen",
                        },
                      })
                    }
                  >
                    <span className="role-title">
                      Community member
                    </span>
                    <span className="role-desc">
                      Use your citizen account
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`role-option ${
                      formData.role === "official"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleChange({
                        target: {
                          name: "role",
                          value: "official",
                        },
                      })
                    }
                  >
                    <span className="role-title">
                      Government official
                    </span>
                    <span className="role-desc">
                      Use your official ID
                    </span>
                  </button>
                </div>

                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />

                <label>Password</label>
                <div className="password-input-row">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>


                {formData.role === "official" && (
                  <>
                    <label>Official ID</label>
                    <input
                      type="text"
                      name="officialId"
                      value={formData.officialId}
                      onChange={handleChange}
                      placeholder="Enter your official ID"
                    />
                  </>
                )}

                <Link
                  to="/forgot-password"
                  className="forgot-link"
                >
                  Forgot Password?
                </Link>
              </>
            )}

            {showVerify && (
              <button
                type="button"
                className="verify-btn"
                onClick={handleResendVerification}
                disabled={loadingVerify}
              >
                {loadingVerify ? "Sending..." : "Verify Now"}
              </button>
            )}

            {error && <p className="error-text">{error}</p>}
            {success && (
              <p className="success-text">{success}</p>
            )}

            <button
  type="submit"
  className="primary-btn"
  disabled={submitting}
>
  {submitting
    ? "Please wait..."
    : isLogin
    ? "Sign In"
    : "Create Account"}
</button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
