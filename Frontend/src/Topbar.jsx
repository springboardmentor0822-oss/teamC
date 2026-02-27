import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaBell
} from "react-icons/fa";

function Topbar() {

  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [profileImage, setProfileImage] =
    useState(localStorage.getItem("profileImage"));

  const [notifications, setNotifications] =
    useState([]);

  const [showNotifications,
    setShowNotifications] = useState(false);

  const fileInputRef = useRef(null);

  // ✅ Decode user from JWT
  const token =
    localStorage.getItem("accessToken");

  let user = {};

  if (token) {
    const payload =
      JSON.parse(atob(token.split(".")[1]));
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
              Authorization:
                `Bearer ${token}`
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

  const unreadCount =
    notifications.filter(n => !n.read).length;

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

    const imageURL =
      URL.createObjectURL(file);

    setProfileImage(imageURL);

    // ✅ persist after refresh
    localStorage.setItem(
      "profileImage",
      imageURL
    );
  };

  // ================= MARK READ =================
  const markRead = async (id) => {

    await axios.put(
      `http://localhost:5000/api/notifications/${id}`,
      {},
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    const res = await axios.get(
      "http://localhost:5000/api/notifications",
      {
        headers: {
          Authorization:
            `Bearer ${token}`
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
          <h2>🏛 Civix</h2>
        </div>

        {/* RIGHT SIDE */}
        <div className="profile-container">

          {/* 🔔 NOTIFICATION */}
          <div
            className="notification-wrapper"
            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }
          >
            <FaBell className="bell-icon"/>

            {unreadCount > 0 && (
              <span className="notif-count">
                {unreadCount}
              </span>
            )}

            {showNotifications && (
              <div className="notification-dropdown">

                {notifications.length === 0 &&
                  <p>No notifications</p>
                }

                {notifications.map(n => (
                  <div
                    key={n._id}
                    className={`notif-item ${
                      n.read ? "" : "unread"
                    }`}
                    onClick={() =>
                      markRead(n._id)
                    }
                  >
                    {n.message}
                  </div>
                ))}

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

          {profileImage ? (
            <img
              src={profileImage}
              alt="profile"
              className="profile-img"
              onClick={handleImageClick}
            />
          ) : (
            <FaUserCircle
              className="default-profile-icon"
              onClick={handleImageClick}
            />
          )}

          {/* USER INFO */}
          <div className="profile-info">
            <span>
              {user.role?.toUpperCase()}
            </span>
            <span>
              {user.location}
            </span>
          </div>

          {/* LOGOUT */}
           <button
            className="logout-btn"
            onClick={() => setShowConfirm(true)}
          >
            Logout
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Are you sure?</h3>
            <p>You will be logged out of your account.</p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={handleLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Topbar;