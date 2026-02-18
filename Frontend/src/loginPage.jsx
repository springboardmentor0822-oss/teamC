import React, { useState } from "react";
import { FaFileSignature, FaChartBar, FaCheckCircle } from "react-icons/fa";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";


function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    role: "citizen",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        // Login logic
        const res = await axios.post(
          "http://localhost:5000/api/auth/login", 
          {
            email: formData.email,
            password: formData.password,
          }
        );
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);

        navigate("/dashboard");

      } else {
        // Registration logic
        const res = await axios.post(
          "http://localhost:5000/api/auth/register",
           formData
          );

          localStorage.setItem("token", res.data.token);
          localStorage.setItem("role", res.data.role);
          navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
        alert(err.response?.data?.message || JSON.stringify(err.response?.data));
    }
  };

  const navigate = useNavigate();
  return (
    <div className="login-container">

      {/* ================= LEFT PANEL ================= */}
      <div className="left-panel">
        <div className="logo">
          <span className="logo-icon">🏛</span>
          <span className="logo-text">Civix</span>
        </div>

        <h1 className="title">
          Digital Civic Engagement Platform
        </h1>

        <p className="subtitle">
          Civix enables citizens to engage in local governance through
          petitions, voting, and tracking officials' responses.
          Join our platform to make your voice heard and drive positive change
          in your community.
        </p>

        <div className="features">
          <div className="feature">
            <div className="icon-box">
              <FaFileSignature />
            </div>
            <div>
              <h4>Create and Sign Petitions</h4>
              <p>Easily create petitions for issues you care about and gather support.</p>
            </div>
          </div>

          <div className="feature">
            <div className="icon-box">
              <FaChartBar />
            </div>
            <div>
              <h4>Participate in Public Polls</h4>
              <p>Vote on local issues and see real-time results of community sentiment.</p>
            </div>
          </div>

          <div className="feature">
            <div className="icon-box">
              <FaCheckCircle />
            </div>
            <div>
              <h4>Track Official Responses</h4>
              <p>See how officials respond to community concerns and track progress.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="right-panel">
        <div className="auth-card">

          {/* Title */}
          <h2>{isLogin ? "Welcome Back" : "Create Your Account"}</h2>

          {/* Subtitle */}
          <p className="subtitle">
            {isLogin
              ? "Join our platfrom to make your voice heard in local governance"
              : "join our platform to make your voice heard in local governance"}
          </p>

          {/* Toggle Buttons */}
          <div className="toggle">
            <button
              className={isLogin ? "active" : ""}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>

            <button
              className={!isLogin ? "active" : ""}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <div className="form">

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

                <label className="register-type-label">
                  I am registering as
                </label>

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
              </>
            )}

            {isLogin && (
              <>
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
              </>
            )}
            <button
              className="primary-btn"
              type="button"
              onClick={handleSubmit}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </div>
          {/* Bottom Switch */}
          <div className="bottom-switch">
            {isLogin ? (
              <>
                Don’t have an account?
                <span onClick={() => setIsLogin(false)}> Register now</span>
              </>
            ) : (
              <>
                Already have an account?
                <span onClick={() => setIsLogin(true)}> Login</span>
              </>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

export default LoginPage;
