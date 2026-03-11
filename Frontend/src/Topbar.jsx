import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaBell,
  FaSignOutAlt,
  FaTimes,
  FaCheck,
  FaUser
} from "react-icons/fa";

import "./Topbar.css";
import socket from "./socket";

function Topbar() {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef(null);

  const token = localStorage.getItem("accessToken");

  /* ================= USER FROM JWT ================= */

  const user = useMemo(() => {
    try {
      if (!token) return {};
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return {};
    }
  }, [token]);

  /* ================= REALTIME SOCKET ================= */

  useEffect(() => {

    socket.on("newNotification", (notification) => {

      setNotifications(prev =>
        [notification, ...prev]
      );

      setUnreadCount(prev => prev + 1);
    });

    return () =>
      socket.off("newNotification");

  }, []);

  /* ================= FETCH NOTIFICATIONS ================= */

  useEffect(() => {

    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`
    };

    const fetchNotifications = async () => {

      try {

        const res = await axios.get(
          "http://localhost:5000/api/notifications",
          { headers }
        );

        setNotifications(res.data);

      } catch (err) {
        console.error(err);
      }
    };

    const fetchUnread = async () => {

      try {

        const res = await axios.get(
          "http://localhost:5000/api/notifications/unread-count",
          { headers }
        );

        setUnreadCount(res.data.count);

      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
    fetchUnread();

    const interval =
      setInterval(fetchUnread, 30000);

    return () =>
      clearInterval(interval);

  }, [token]);

  /* ================= CLOSE DROPDOWN ON OUTSIDE CLICK ================= */

  useEffect(() => {

    const handleClickOutside = (e) => {

      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

  }, []);

  /* ================= MARK NOTIFICATION READ ================= */

  const markRead = async (id) => {

    try {

      await axios.put(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications(prev =>
        prev.map(n =>
          n._id === id
            ? { ...n, read: true }
            : n
        )
      );

      setUnreadCount(prev =>
        Math.max(prev - 1, 0)
      );

    } catch {
      console.error("Mark read failed");
    }
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {

    localStorage.clear();
    navigate("/");

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

          {/* NOTIFICATIONS */}
          <div
            className="notification-wrapper"
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
          >

            <FaBell className="bell-icon" />

            {unreadCount > 0 && (
              <span className="notif-badge">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}

            {showNotifications && (

              <div className="notification-dropdown">

                <h4>Notifications</h4>

                {notifications.length === 0 ? (
                  <p className="empty">
                    No notifications yet
                  </p>
                ) : (

                  notifications
                    .slice(0, 5)
                    .map(n => (

                      <div
                        key={n._id}
                        className={`notif-item ${
                          n.read ? "read" : "unread"
                        }`}
                        onClick={() =>
                          markRead(n._id)
                        }
                      >
                        {n.read ? "✓" : "🔔"} {n.message}
                      </div>

                    ))

                )}

              </div>
            )}

          </div>

          {/* PROFILE MENU */}

          <div
            className="profile-section"
            ref={profileRef}
          >

            <div
              className="profile-avatar"
              onClick={() =>
                setShowProfileMenu(!showProfileMenu)
              }
            >

              <FaUserCircle size={35} />

            </div>

            {showProfileMenu && (

              <div className="profile-dropdown">

                <div className="profile-name">
                  {user.name || "User"}
                </div>

                <button
                  onClick={() =>
                    navigate("/profile")
                  }
                >
                  <FaUser /> Profile
                </button>

                <button
                  onClick={() =>
                    setShowConfirm(true)
                  }
                >
                  <FaSignOutAlt /> Logout
                </button>

              </div>

            )}

          </div>

          {/* USER INFO */}
          <div className="profile-info">

            <div className="role-badge">
              {user.role?.toUpperCase() || "USER"}
            </div>

            <div className="location">
              {user.location || "India"}
            </div>

          </div>

        </div>
      </div>

      {/* LOGOUT MODAL */}

      {showConfirm && (

        <div className="modal-overlay">

          <div className="logout-modal">

            <h3>Logout?</h3>

            <p>
              Are you sure you want to logout?
            </p>

            <div className="modal-actions">

              <button
                className="cancel-btn"
                onClick={() =>
                  setShowConfirm(false)
                }
              >
                <FaTimes /> Cancel
              </button>

              <button
                className="logout-confirm"
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