import React, { useState } from "react";
import { FaFileSignature, FaChartBar, FaCheckCircle } from "react-icons/fa";
import "./loginPage.css";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    role: "citizen",
    officialId: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  

  const handleResendVerification = async () => {
    try {
      setLoadingVerify(true);
      setError("");
      setSuccess("");

      await axios.post(
        "http://localhost:5000/api/auth/resend-verification",
        { email: formData.email }
      );

      setSuccess("Verification email sent. Please check your inbox.");
      setShowVerify(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to resend verification email.");
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");
      setShowVerify(false);

      if (!validateEmail(formData.email)) {
        setError("Enter a valid email");
        return;
      }

      if (!formData.password) {
        setError("Password required");
        return;
      }

      if (isLogin) {
        const res = await axios.post(
          "http://localhost:5000/api/auth/login",
          {
          email: formData.email,
          password: formData.password,
          officialId:
            formData.role === "official" ? formData.officialId : undefined,
        }
        );

        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        const payload = JSON.parse(
          atob(res.data.accessToken.split(".")[1])
        );

        if (payload.role === "official") {
          navigate("/dashboard");
        } else if (payload.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }

      } else {
        await axios.post(
          "http://localhost:5000/api/auth/register",
          formData
        );

        setSuccess(
          "Registration successful. Please verify your email."
        );
        setIsLogin(true);
      }

    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong";

      if (message === "Email not verified") {
        setError("Email not verified");
        setShowVerify(true);
      } else {
        setError(message);
      }
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
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>

            <button
              type="button"
              className={!isLogin ? "active" : ""}
              onClick={() => setIsLogin(false)}
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
    <input
      type="password"
      name="password"
      value={formData.password}
      onChange={handleChange}
    />

    <label>Location</label>
    <input
      type="text"
      name="location"
      value={formData.location}
      onChange={handleChange}
    />

    <label>I am registering as</label>
    <div className="radio-group">
      <label>
        <input
          type="radio"
          name="role"
          value="citizen"
          checked={formData.role === "citizen"}
          onChange={handleChange}
        />
        Citizen
      </label>

      <label>
        <input
          type="radio"
          name="role"
          value="official"
          checked={formData.role === "official"}
          onChange={handleChange}
        />
        Public Official
      </label>
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
    <label>I am logging in as</label>
    <div className="radio-group">
      <label>
        <input
          type="radio"
          name="role"
          value="citizen"
          checked={formData.role === "citizen"}
          onChange={handleChange}
        />
        Citizen
      </label>

      <label>
        <input
          type="radio"
          name="role"
          value="official"
          checked={formData.role === "official"}
          onChange={handleChange}
        />
        Public Official
      </label>
    </div>

    <label>Email</label>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
    />

    <label>Password</label>
    <input
      type="password"
      name="password"
      value={formData.password}
      onChange={handleChange}
    />

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

    <Link to="/forgot-password" className="forgot-link">
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
            {success && <p className="success-text">{success}</p>}

            <button type="submit" className="primary-btn">
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;