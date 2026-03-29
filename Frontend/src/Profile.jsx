import { useState, useEffect } from "react";
// import axios from "axios";
import "./profile.css";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";
import api from "./api";

function Profile() {
  

  const [user, setUser] = useState({});
  
  const [preview, setPreview] = useState(null);
  const [analytics, setAnalytics] = useState({
    total: 0,
    active: 0,
    underReview: 0,
    closed: 0
  });

  const [activities, setActivities] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const navigate = useNavigate();

  
  /* ================= LOAD USER ================= */
  useEffect(() => {
  const loadUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("User fetch failed", err);
    } finally {
      setLoadingUser(false);
    }
  };

  loadUser();
}, []);
  /* ================= LOAD ANALYTICS ================= */
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await api.get("/api/dashboard");
setAnalytics(res.data);
      } catch (err) {
        console.error("Analytics fetch failed", err);
      } finally {
        setLoadingAnalytics(false);
      }
    };

     loadAnalytics();
  }, []);

  /* ================= LOAD ACTIVITY ================= */
  useEffect(() => {
    const loadActivity = async () => {
      try {
        const res = await api.get("/api/users/activity");
setActivities(res.data);
      } catch (err) {
        console.error("Activity fetch failed", err);
      } finally {
        setLoadingActivity(false);
      }
    };

     loadActivity();
  }, []);

  /* ================= AVATAR UPLOAD ================= */
  const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ✅ VALIDATION
  if (!file.type.startsWith("image/")) {
    alert("Only image files allowed");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert("Image must be less than 2MB");
    return;
  }

  // ✅ PREVIEW
  const previewUrl = URL.createObjectURL(file);
  setPreview(previewUrl);

  const formData = new FormData();
  formData.append("avatar", file);

  try {
   await api.post("/api/users/avatar", formData, {
  headers: {
    "Content-Type": "multipart/form-data"
  }
});

    const updatedUser = await api.get("/api/auth/me");
setUser(updatedUser.data);
setPreview(null);

  } catch (err) {
    console.error("Upload failed", err);
    alert("Upload failed");
    setPreview(null);
  }
};

  const roleIsOfficial = user.role === "official";

  return (
    <div className="profile-page">
      {/* TOP BAR / TITLE */}
      <div className="profile-topbar">


  <div>
    <h1 className="profile-title">My Profile</h1>
    <p className="profile-subtitle">
      View your account details, activity, and petition statistics at a glance.
    </p>
  </div>
  <button
    className="profile-back-btn"
    onClick={() => navigate("/dashboard")}
  >
    <FaArrowLeft /> Back
  </button>

</div>

      {/* HEADER */}
      <div className="profile-header card">
        <div className="profile-header-left">
          <div className="profile-image-wrapper">
            <label
              htmlFor="upload-photo"
              className="avatar-upload-label"
              aria-label="Change profile photo"
            >
              <img
              key={user.avatar}
                src={
                  preview
                    ? preview
                    : user.avatar
                    ? `http://localhost:5000${user.avatar}`
                    : `https://ui-avatars.com/api/?name=${user.name || "User"}`
                }
                alt="Profile"
                className="profile-avatar"
              />
              <div className="avatar-overlay">
                <span className="avatar-overlay-text">Change</span>
              </div>
            </label>

            <input
              type="file"
              id="upload-photo"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </div>

          <div className="profile-main-info">
            <div className="profile-name-row">
              <h2 className="profile-name">
                {user.name || "User"}
              </h2>
              {roleIsOfficial && (
                <span className="verified-badge">
                  ✔ Verified Official
                </span>
              )}
            </div>

            <div
              className="role-badge"
              style={{
                background: roleIsOfficial ? "#dbeafe" : "#ecfdf5",
                color: roleIsOfficial ? "#1d4ed8" : "#047857"
              }}
            >
              {user.role?.toUpperCase() || "CITIZEN"}
            </div>

            <div className="profile-meta">
              <p className="location">
                <span className="meta-icon">📍</span>
                {user.location || "India"}
              </p>

              <p className="joined-date">
                <span className="meta-icon">🗓</span>
                Member since{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "2024"}
              </p>
            </div>
          </div>
        </div>

        <div className="profile-header-right">
          <button className="profile-action-btn secondary">
            Edit Details
          </button>
          <button className="profile-action-btn primary"
          onClick = { () => navigate("/myPetitions")} >
            View Petitions
          </button>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="analytics-section">
        <h3 className="section-title">Petition Overview</h3>

        {loadingAnalytics ? (
          <div className="skeleton-grid">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : (
          <div className="analytics-grid">
            <div className="analytics-card card">
              <div className="analytics-label-row">
                <span className="analytics-label">Total Petitions</span>
              </div>
              <h3 className="analytics-value">{analytics.total}</h3>
            </div>

            <div className="analytics-card card analytics-card--active">
              <div className="analytics-label-row">
                <span className="analytics-label">Active</span>
              </div>
              <h3 className="analytics-value">{analytics.active}</h3>
            </div>

            <div className="analytics-card card analytics-card--review">
              <div className="analytics-label-row">
                <span className="analytics-label">Under Review</span>
              </div>
              <h3 className="analytics-value">{analytics.underReview}</h3>
            </div>

            <div className="analytics-card card analytics-card--closed">
              <div className="analytics-label-row">
                <span className="analytics-label">Closed</span>
              </div>
              <h3 className="analytics-value">{analytics.closed}</h3>
            </div>
          </div>
        )}
      </div>

      {/* ACCOUNT DETAILS */}
      <div className="account-section card">
        <div className="section-header">
          <h3 className="section-title">Account Information</h3>
          <p className="section-subtitle">
            Basic details associated with your account.
          </p>
        </div>

        {loadingUser ? (
          <div className="account-grid">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : (
          <div className="account-grid">
            <div className="account-field">
              <label className="field-label">Email</label>
              <p className="field-value">
                {user.email || "user@email.com"}
              </p>
            </div>

            <div className="account-field">
              <label className="field-label">Phone</label>
              <p className="field-value">
                {user.phone || "+91 XXXXXXXX"}
              </p>
            </div>

            {roleIsOfficial && (
              <>
                <div className="account-field">
                  <label className="field-label">Department</label>
                  <p className="field-value">
                    {user.department || "Government Dept"}
                  </p>
                </div>

                <div className="account-field">
                  <label className="field-label">Government ID</label>
                  <p className="field-value">
                    {user.govId || "GOV12345"}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="activity-section card">
        <div className="section-header">
          <h3 className="section-title">Recent Activity</h3>
          <p className="section-subtitle">
            Track what you have been doing recently on the platform.
          </p>
        </div>

        {loadingActivity ? (
          <div className="activity-list">
            <div className="activity-skeleton" />
            <div className="activity-skeleton" />
          </div>
        ) : (
          <div className="activity-list">
            {activities.length === 0 && (
              <p className="empty-state-text">
                No recent activity yet. Start by creating or signing a petition.
              </p>
            )}

            {activities.map((item, index) => (
              <div className="activity-item" key={index}>
                <div className="activity-icon">
                  {item.type === "signed" && "✍️"}
                  {item.type === "created" && "📢"}
                  {item.type === "response" && "🏛️"}
                </div>

                <div className="activity-content">
                  <p className="activity-message">{item.message}</p>
                  <span className="activity-time">
                    {new Date(item.time).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
