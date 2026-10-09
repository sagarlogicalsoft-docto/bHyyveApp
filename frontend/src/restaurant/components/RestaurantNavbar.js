import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../.././../src/Components/assest/bHyyve.jpg";
import api from "../../config/api";

import {
  FaBars,
  FaBell,
  FaEnvelope,
  FaUserCircle,
  FaChevronDown,
  FaArrowLeft,
  FaUser,
  FaCog,
  FaQuestionCircle,
  FaCheckDouble,
  FaArrowRight,
} from "react-icons/fa";

import "./restaurantNavbar.css";
import useOutsideClick from "../../hooks/UseOutsideClick";

/* =========================================================
   API SERVICE FUNCTIONS
   Isolated so they can be swapped / reused later.
========================================================= */

const fetchUnreadCountApi = () =>
  api.get("/restaurant/notifications/unread-count");

const fetchNotificationsApi = () => api.get("/restaurant/notifications");

const fetchNotificationByIdApi = (id) =>
  api.get(`/restaurant/notifications/${id}`);

const markAllNotificationsReadApi = () =>
  api.patch("/restaurant/notifications/read");

/* ========================================================= */

const RestaurantNavbar = ({ sidebarOpen, setSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  // Close the dropdowns when clicking anywhere outside them.

  useOutsideClick(profileMenuRef, () => {
    setProfileMenuOpen(false);
  });

  useOutsideClick(notificationMenuRef, () => {
    setNotificationDropdownOpen(false);
  });

  // ============================================================
  // FETCH UNREAD COUNT
  // ============================================================

  const fetchNotificationCount = async () => {
    try {
      const response = await fetchUnreadCountApi();

      if (response.data?.success) {
        setNotificationCount(response.data.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
  }, [location.pathname]);

  // ============================================================
  // FETCH LATEST NOTIFICATIONS
  // ============================================================

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);

      const response = await fetchNotificationsApi();

      if (response.data?.success) {
        const latestNotifications = response.data.notifications || [];

        setNotifications(latestNotifications.slice(0, 10));
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  // ============================================================
  // TOGGLE NOTIFICATION DROPDOWN
  // ============================================================

  const handleNotificationToggle = async () => {
    const newState = !notificationDropdownOpen;

    setNotificationDropdownOpen(newState);

    if (newState) {
      await fetchNotifications();
    }
  };

  // ============================================================
  // OPEN NOTIFICATION
  // ============================================================

  const handleNotificationOpen = async (notification) => {
    try {
      setNotificationDropdownOpen(false);

      await fetchNotificationByIdApi(notification.id);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, is_seen_admin: 1 } : item
        )
      );

      await fetchNotificationCount();

      navigate(`/restaurant/order_notification/view/${notification.id}`);
    } catch (error) {
      console.error("Failed to open notification:", error);
    }
  };

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingRead(true);

      const response = await markAllNotificationsReadApi();

      if (response.data?.success) {
        setNotifications((prev) =>
          prev.map((item) => ({ ...item, is_seen_admin: 1 }))
        );

        setNotificationCount(0);
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    } finally {
      setMarkingRead(false);
    }
  };

  // ============================================================
  // PROFILE
  // ============================================================

  const goTo = (path) => {
    setProfileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="restaurant-navbar">
      <div className="restaurant-navbar-inner">
        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <div className="restaurant-navbar-left">
          {/* SIDEBAR TOGGLE */}

          <button
            type="button"
            className="restaurant-navbar-menu-btn"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <FaBars />
          </button>

          {/* PAGE / BRAND */}

          <div className="restaurant-navbar-brand">
            <span className="restaurant-navbar-brand-icon">
              <img src={logo} alt="Logo" />
            </span>

            <div>
              <strong style={{ color: "#005555", fontWeight: "900" }}>
                bHyyve
              </strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <div className="restaurant-navbar-right">
          {/* =================================================
              MESSAGE
          ================================================= */}

          <button
            type="button"
            className="restaurant-navbar-icon-btn"
            onClick={() => navigate("/restaurant/messages")}
            aria-label="Messages"
          >
            <FaEnvelope />

            <span className="restaurant-navbar-badge message-badge">5</span>
          </button>

          {/* =================================================
              NOTIFICATION (with dropdown)
          ================================================= */}

          <div className="restaurant-notification-wrap" ref={notificationMenuRef}>
            <button
              type="button"
              className={`restaurant-navbar-icon-btn ${
                notificationDropdownOpen ? "notification-active" : ""
              }`}
              onClick={handleNotificationToggle}
              aria-label="Notifications"
              aria-haspopup="true"
              aria-expanded={notificationDropdownOpen}
            >
              <FaBell />

              {notificationCount > 0 && (
                <span className="restaurant-navbar-badge notification-badge">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>

            {notificationDropdownOpen && (
              <div className="restaurant-notification-dropdown">
                {/* HEADER */}

                <div className="restaurant-notification-header">
                  <div>
                    <h3>Notifications</h3>

                    <p>
                      {notificationCount > 0
                        ? `${notificationCount} unread notification${
                            notificationCount > 1 ? "s" : ""
                          }`
                        : "You're all caught up"}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="notification-mark-read-btn"
                    onClick={handleMarkAllAsRead}
                    disabled={markingRead || notificationCount === 0}
                  >
                    <FaCheckDouble />{" "}
                    {markingRead ? "Reading..." : "Mark all read"}
                  </button>
                </div>

                {/* LIST */}

                <div className="restaurant-notification-list">
                  {notificationLoading ? (
                    <div className="notification-dropdown-loading">
                      <div className="notification-loader"></div>
                      <span>Loading notifications...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="notification-dropdown-empty">
                      <div className="notification-empty-icon">
                        <FaBell />
                      </div>

                      <strong>No notifications</strong>

                      <span>New restaurant notifications will appear here.</span>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const isUnread = Number(notification.is_seen_admin) === 0;

                      return (
                        <button
                          type="button"
                          key={notification.id}
                          className={`restaurant-notification-item ${
                            isUnread ? "is-unread" : ""
                          }`}
                          onClick={() => handleNotificationOpen(notification)}
                        >
                          <div className="notification-item-icon">
                            <FaBell />
                          </div>

                          <div className="notification-item-content">
                            <div className="notification-item-top">
                              <strong className="notification-item-title">
                                {notification.title || "Restaurant Notification"}
                              </strong>

                              {isUnread && (
                                <span className="notification-unread-dot"></span>
                              )}
                            </div>

                            <span className="notification-item-message">
                              {notification.message ||
                                notification.body ||
                                "You have a new restaurant notification."}
                            </span>

                            <span className="notification-item-time">
                              {notification.date || ""}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* FOOTER */}

                <div className="restaurant-notification-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationDropdownOpen(false);
                      navigate("/restaurant/order_notification");
                    }}
                  >
                    View all notifications <FaArrowRight />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              PROFILE (with dropdown)
          ================================================= */}

          <div className="restaurant-navbar-profile-wrap" ref={profileMenuRef}>
            <button
              type="button"
              className="restaurant-navbar-profile"
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
            >
              <FaUserCircle className="restaurant-profile-icon" />

              <div className="restaurant-profile-info">
                <strong>Admin</strong>
                <small>Restaurant Admin</small>
              </div>

              <FaChevronDown
                className={`restaurant-profile-arrow ${profileMenuOpen ? "is-open" : ""}`}
              />
            </button>

            {profileMenuOpen && (
              <div className="restaurant-profile-dropdown" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="restaurant-profile-dropdown-item"
                  onClick={() => goTo("/restaurant/profile")}
                >
                  <FaUser /> My Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="restaurant-profile-dropdown-item"
                  onClick={() => goTo("/restaurant/account-settings")}
                >
                  <FaCog /> Account Settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="restaurant-profile-dropdown-item"
                  onClick={() => goTo("/restaurant/help")}
                >
                  <FaQuestionCircle /> Help
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="restaurant-navbar-back-btn"
            onClick={() => navigate("/home")}
          >
            <FaArrowLeft />
            <span>Admin Panel</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default RestaurantNavbar;