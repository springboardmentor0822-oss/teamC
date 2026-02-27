import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaBell,
  FaSignOutAlt,
  FaTimes,
  FaCheck
} from "react-icons/fa";
import "./Topbar.css"; // Import the improved CSS

function Topbar() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage"));
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ Decode user from JWT
  const token = localStorage.getItem("accessToken");
  let user = {};

  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    user = payload;
  }

  // ================= FETCH NOTIFICATIONS =================
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
  }, [token]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  // ================= PROFILE IMAGE =================
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);
    setProfileImage(imageURL);
    // ✅ persist after refresh
    localStorage.setItem("profileImage", imageURL);
  };

  // ================= MARK READ =================
  const markRead = async (id) => {
    await axios.put(
      `http://localhost:5000/api/notifications/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const res = await axios.get(
      "http://localhost:5000/api/notifications",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setNotifications(res.data);
  };

  return (
    <>
      <div className="topbar">
        {/* LOGO */}
        <div className="topbar-left">
          <h2 className="logo">
            🏛️ <span>Civix</span>
          </h2>
        </div>

        {/* RIGHT SIDE */}
        <div className="profile-container">
          {/* 🔔 NOTIFICATION */}
          <div className="notification-wrapper" onClick={() => setShowNotifications(!showNotifications)}>
            <div className="notification-icon-container">
              <FaBell className="bell-icon" />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </div>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h4>Notifications</h4>
                  <span className="notification-count">{unreadCount} unread</span>
                </div>
                
                {notifications.length === 0 ? (
                  <div className="empty-notifications">
                    <div className="empty-icon">📭</div>
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {notifications.slice(0, 5).map(n => (
                      <div
                        key={n._id}
                        className={`notif-item ${n.read ? 'read' : 'unread'}`}
                        onClick={() => markRead(n._id)}
                      >
                        <div className="notif-content">
                          <div className="notif-icon">
                            {n.read ? '✓' : '🔔'}
                          </div>
                          <div className="notif-message">
                            {n.message}
                          </div>
                        </div>
                        {!n.read && <div className="mark-read-btn">Mark Read</div>}
                      </div>
                    ))}
                    {notifications.length > 5 && (
                      <div className="more-notifications">
                        +{notifications.length - 5} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PROFILE IMAGE */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageChange}
          />

          <div className="profile-section" onClick={handleImageClick}>
            {profileImage ? (
              <div className="profile-image-container">
                <img
                  src={profileImage}
                  alt="profile"
                  className="profile-img"
                />
                <div className="profile-camera-overlay">📷</div>
              </div>
            ) : (
              <div className="default-profile-container">
                <FaUserCircle className="default-profile-icon" />
                <div className="profile-camera-overlay">📷</div>
              </div>
            )}
          </div>

          {/* USER INFO */}
          <div className="profile-info">
            <div className="role-badge">
              {user.role?.toUpperCase() || 'USER'}
            </div>
            <div className="location">{user.location || 'Gurugram'}</div>
          </div>

          {/* LOGOUT */}
          <button className="logout-btn" onClick={() => setShowConfirm(true)} title="Logout">
            <FaSignOutAlt />
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <FaSignOutAlt className="modal-icon" />
              <h3>Confirm Logout</h3>
            </div>
            <p className="modal-message">
              Are you sure you want to log out? You'll need to sign in again to continue.
            </p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                <FaTimes /> Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleLogout}
              >
                <FaCheck /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Topbar;