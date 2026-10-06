import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./manubar.css";
import secureLocalStorage from "react-secure-storage";
import useOutsideClick from "../hooks/UseOutsideClick";
// import logo from "../Components/assest/bHyyve.jpg";

import {
  FaBell,
  FaEnvelope,
  FaUserCircle,
  FaUser,
  FaCog,
  FaLock,
  FaSignOutAlt,
  FaHandsHelping,
  FaChevronDown,
} from "react-icons/fa";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  // Notification dropdown
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationDropdownRef = useRef(null);

  // Message dropdown
  const [messageOpen, setMessageOpen] = useState(false);
  const messageDropdownRef = useRef(null);

  // Profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // User email
  const adminEmail = secureLocalStorage.getItem("adminemail") || "System";

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(currentTime);

  // -----------------------------------------
  // SCREEN WIDTH
  // -----------------------------------------

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", updateScreenWidth);

    return () => {
      window.removeEventListener("resize", updateScreenWidth);
    };
  }, []);

  // -----------------------------------------
  // CLOSE PROFILE DROPDOWN ON OUTSIDE CLICK
  // -----------------------------------------

  useOutsideClick(profileDropdownRef, () => {
    setProfileOpen(false);
  });

  // -----------------------------------------
  // CLOSE NOTIFICATION DROPDOWN ON OUTSIDE CLICK
  // -----------------------------------------

  useOutsideClick(notificationDropdownRef, () => {
    setNotificationOpen(false);
  });

  // -----------------------------------------
  // CLOSE MESSAGE DROPDOWN ON OUTSIDE CLICK
  // -----------------------------------------

  useOutsideClick(messageDropdownRef, () => {
    setMessageOpen(false);
  });

  // -----------------------------------------
  // PROFILE
  // -----------------------------------------

  const userprofile = () => {
    setProfileOpen(false);
    navigate("/my_profile");
  };

  const accountSettings = () => {
    setProfileOpen(false);
    navigate("/account_settings");
  };

  const changePassword = () => {
    setProfileOpen(false);
    navigate("/change-password");
  };

  const helpPage = () => {
    setProfileOpen(false);
    navigate("/help");
  };

  const handleLogout = () => {
    setProfileOpen(false);

    // If you have a logout API, call it here.

    secureLocalStorage.clear();
    localStorage.removeItem("setstatus");

    navigate("/login");
  };

  return (
    <>
      {/* =====================================================
          DESKTOP NAVBAR
      ===================================================== */}

      {screenWidth >= 768 ? (
        <header
          id="header"
          className="navbar navbar-expand-lg navbar-fixed navbar-height navbar-flush navbar-container navbar-bordered dashboard-navbar"
          style={{ zIndex: 1020 }}
        >
          <div className="navbar-nav-wrap">
            {/* LOGO */}
            {/* <div className="navbar-brand-wrapper" style={{ cursor: "pointer" }}>
              <Link className="navbar-brand" to="/home" aria-label="Home">
                <img
                  className="navbar-brand-logo-mini"
                  src="/bHyyve.jpg"
                  alt="Logo"
                  height={40}
                />
              </Link>
            </div> */}

            <div className="d-flex align-items-center">
              <span className="navbar-badge h5 text-uppercase text-white bg-dark rounded-pill px-4 py-2">
                IST : {formattedDateTime}
              </span>
            </div>

            {/* RIGHT SIDE */}
            <div className="navbar-nav-wrap-content-right">
              <ul className="navbar-nav align-items-center flex-row">
                {/* =========================================
                    NOTIFICATION
                ========================================= */}

                <li className="nav-item notification-nav-item">
                  <div
                    className="notification-dropdown-wrapper"
                    ref={notificationDropdownRef}
                  >
                    <button
                      type="button"
                      className="navbar-icon notification-button"
                      onClick={() => {
                        console.log("NOTIFICATION BUTTON CLICKED");
                        setNotificationOpen((prev) => !prev);
                      }}
                    >
                      <FaBell />

                      <span className="badge bg-primary rounded-pill navbar-badge-icon">
                        49
                      </span>
                    </button>

                    {notificationOpen && (
                      <div className="notification-dropdown">
                        <div className="notification-dropdown-header">
                          <strong>Notifications</strong>

                          <span>49 New</span>
                        </div>

                        <div className="notification-list">
                          <button
                            type="button"
                            className="notification-item"
                            onClick={() => {
                              setNotificationOpen(false);
                              navigate("/notification_1");
                            }}
                          >
                            <div className="notification-icon">
                              <FaBell />
                            </div>

                            <div className="notification-content">
                              <strong>New booking received</strong>
                              <p>
                                A new booking has been created by a customer.
                              </p>
                              <small>2 minutes ago</small>
                            </div>
                          </button>

                          <button
                            type="button"
                            className="notification-item"
                            onClick={() => {
                              setNotificationOpen(false);
                              navigate("/notification_1");
                            }}
                          >
                            <div className="notification-icon">
                              <FaBell />
                            </div>

                            <div className="notification-content">
                              <strong>Warranty claim submitted</strong>
                              <p>
                                A new warranty claim requires your attention.
                              </p>
                              <small>15 minutes ago</small>
                            </div>
                          </button>

                          <button
                            type="button"
                            className="notification-item"
                            onClick={() => {
                              setNotificationOpen(false);
                              navigate("/notification_1");
                            }}
                          >
                            <div className="notification-icon">
                              <FaBell />
                            </div>

                            <div className="notification-content">
                              <strong>New vendor registered</strong>
                              <p>
                                A new vendor has registered on the platform.
                              </p>
                              <small>1 hour ago</small>
                            </div>
                          </button>

                          <button
                            type="button"
                            className="notification-item"
                            onClick={() => {
                              setNotificationOpen(false);
                              navigate("/notification_1");
                            }}
                          >
                            <div className="notification-icon">
                              <FaBell />
                            </div>

                            <div className="notification-content">
                              <strong>Payment received</strong>
                              <p>A payment has been successfully received.</p>
                              <small>2 hours ago</small>
                            </div>
                          </button>
                        </div>

                        <div className="notification-dropdown-footer">
                          <button
                            type="button"
                            onClick={() => {
                              setNotificationOpen(false);
                              navigate("/notification_1");
                            }}
                          >
                            View All Notifications
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>

                {/* =========================================
                    MESSAGE
                ========================================= */}

                <li className="nav-item message-nav-item">
                  <div
                    className="message-dropdown-wrapper"
                    ref={messageDropdownRef}
                  >
                    <button
                      type="button"
                      className="navbar-icon message-button"
                      onClick={() => setMessageOpen(!messageOpen)}
                    >
                      <FaEnvelope />

                      <span className="badge bg-danger rounded-pill navbar-badge-icon">
                        225
                      </span>
                    </button>

                    {messageOpen && (
                      <div className="message-dropdown">
                        <div className="message-dropdown-header">
                          <strong>Messages</strong>
                          <span>225 New</span>
                        </div>

                        <div className="message-list">
                          <button
                            type="button"
                            className="message-item"
                            onClick={() => {
                              setMessageOpen(false);
                              navigate("/messages");
                            }}
                          >
                            <div className="message-icon">
                              <FaEnvelope />
                            </div>

                            <div className="message-content">
                              <strong>New customer message</strong>

                              <p>
                                You have received a new message from a customer.
                              </p>

                              <small>3 minutes ago</small>
                            </div>
                          </button>

                          <button
                            type="button"
                            className="message-item"
                            onClick={() => {
                              setMessageOpen(false);
                              navigate("/messages");
                            }}
                          >
                            <div className="message-icon">
                              <FaEnvelope />
                            </div>

                            <div className="message-content">
                              <strong>Vendor sent a message</strong>

                              <p>A vendor has sent you a new message.</p>

                              <small>20 minutes ago</small>
                            </div>
                          </button>

                          <button
                            type="button"
                            className="message-item"
                            onClick={() => {
                              setMessageOpen(false);
                              navigate("/messages");
                            }}
                          >
                            <div className="message-icon">
                              <FaEnvelope />
                            </div>

                            <div className="message-content">
                              <strong>Support message</strong>

                              <p>You have a new message from support.</p>

                              <small>1 hour ago</small>
                            </div>
                          </button>
                        </div>

                        <div className="message-dropdown-footer">
                          <button
                            type="button"
                            onClick={() => {
                              setMessageOpen(false);
                              navigate("/messages");
                            }}
                          >
                            View All Messages
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>

                {/* =========================================
                    PROFILE
                ========================================= */}

                <li className="nav-item profile-nav-item">
                  <div
                    className="profile-dropdown-wrapper"
                    ref={profileDropdownRef}
                  >
                    {/* PROFILE BUTTON */}

                    <button
                      type="button"
                      className="profile-pill"
                      onClick={() => setProfileOpen(!profileOpen)}
                    >
                      <FaUserCircle size={32} className="profile-user-icon" />

                      <div className="profile-info">
                        <div className="profile-name">{adminEmail}</div>

                        <small>Admin</small>
                      </div>

                      <FaChevronDown
                        className={`profile-arrow ${
                          profileOpen ? "rotate" : ""
                        }`}
                      />
                    </button>

                    {/* DROPDOWN */}

                    {profileOpen && (
                      <ul className="profile-dropdown">
                        {/* HEADER */}

                        <li>
                          <div className="dropdown-header">
                            <strong>{adminEmail}</strong>

                            <small>Admin</small>
                          </div>
                        </li>

                        <li>
                          <hr className="dropdown-divider" />
                        </li>

                        {/* PROFILE */}

                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={userprofile}
                          >
                            <FaUser />
                            <span>My Profile</span>
                          </button>
                        </li>

                        {/* SETTINGS */}

                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={accountSettings}
                          >
                            <FaCog />
                            <span>Account Settings</span>
                          </button>
                        </li>

                        {/* PASSWORD */}

                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={changePassword}
                          >
                            <FaLock />
                            <span>Change Password</span>
                          </button>
                        </li>

                        {/* HELP */}

                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={helpPage}
                          >
                            <FaHandsHelping />
                            <span>Help</span>
                          </button>
                        </li>

                        <li>
                          <hr className="dropdown-divider" />
                        </li>

                        {/* LOGOUT */}

                        <li>
                          <button
                            type="button"
                            className="dropdown-item logout-item"
                            onClick={handleLogout}
                          >
                            <FaSignOutAlt />
                            <span>Logout</span>
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </header>
      ) : (
        /* =====================================================
           MOBILE NAVBAR
        ===================================================== */

        <header
          id="header"
          className="navbar navbar-expand-lg navbar-fixed navbar-height navbar-flush navbar-container navbar-bordered dashboard-navbar"
          style={{ zIndex: 1020 }}
        >
          <div className="navbar-nav-wrap">
            {/* SIDEBAR TOGGLE */}

            <div
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="mobile-sidebar-toggle"
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? (
                <i className="fa fa-times" aria-hidden="true" />
              ) : (
                <i className="fa fa-bars" aria-hidden="true" />
              )}
            </div>

            {/* LOGO */}

            {/* <div className="navbar-brand-wrapper" style={{ cursor: "pointer" }}>
              <Link className="navbar-brand" to="/home" aria-label="Home">
                <img
                  className="navbar-brand-logo-mini"
                  src="./logonew.png"
                  alt="Logo"
                  height={40}
                />
              </Link>
            </div> */}

            {/* MOBILE RIGHT */}

            <div className="navbar-nav-wrap-content-right">
              <ul className="navbar-nav align-items-center flex-row">
                {/* MESSAGE */}

                <li className="nav-item">
                  <div className="navbar-icon position-relative">
                    <FaEnvelope />

                    <span className="badge bg-danger rounded-pill navbar-badge-icon">
                      49
                    </span>
                  </div>
                </li>

                {/* NOTIFICATION */}
                <li className="nav-item notification-nav-item">
                  <div
                    className="notification-dropdown-wrapper"
                    ref={notificationDropdownRef}
                  >
                    <button
                      type="button"
                      className="navbar-icon notification-button"
                      onClick={() => setNotificationOpen(!notificationOpen)}
                    >
                      <FaBell />

                      <span className="badge bg-light rounded-pill navbar-badge-icon">
                        225
                      </span>
                    </button>

                    {notificationOpen && (
                      <div className="notification-dropdown notification-dropdown-mobile">
                        <div className="notification-dropdown-header">
                          <strong>Notifications</strong>
                          <span>225 New</span>
                        </div>

                        <div className="notification-list">
                          <button
                            type="button"
                            className="notification-item"
                            onClick={() => {
                              setNotificationOpen(false);
                              navigate("/notification_1");
                            }}
                          >
                            <div className="notification-icon">
                              <FaBell />
                            </div>

                            <div className="notification-content">
                              <strong>New booking received</strong>
                              <p>A new booking has been created.</p>
                              <small>2 minutes ago</small>
                            </div>
                          </button>

                          <button
                            type="button"
                            className="notification-item"
                            onClick={() => {
                              setNotificationOpen(false);
                              navigate("/notification_1");
                            }}
                          >
                            <div className="notification-icon">
                              <FaBell />
                            </div>

                            <div className="notification-content">
                              <strong>New warranty claim</strong>
                              <p>A warranty claim requires your attention.</p>
                              <small>15 minutes ago</small>
                            </div>
                          </button>
                        </div>

                        <div className="notification-dropdown-footer">
                          <button
                            type="button"
                            onClick={() => {
                              setNotificationOpen(false);
                              navigate("/notification_1");
                            }}
                          >
                            View All Notifications
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>

                {/* PROFILE */}

                <li className="nav-item">
                  <div
                    className="profile-dropdown-wrapper"
                    ref={profileDropdownRef}
                  >
                    <button
                      type="button"
                      className="profile-pill mobile-profile-pill"
                      onClick={() => setProfileOpen(!profileOpen)}
                    >
                      <FaUserCircle size={30} className="profile-user-icon" />

                      <FaChevronDown
                        className={`profile-arrow ${
                          profileOpen ? "rotate" : ""
                        }`}
                      />
                    </button>

                    {profileOpen && (
                      <ul className="profile-dropdown profile-dropdown-mobile">
                        <li>
                          <div className="dropdown-header">
                            <strong>{adminEmail}</strong>

                            <small>Admin</small>
                          </div>
                        </li>

                        <li>
                          <hr className="dropdown-divider" />
                        </li>

                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={userprofile}
                          >
                            <FaUser />
                            <span>My Profile</span>
                          </button>
                        </li>

                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={accountSettings}
                          >
                            <FaCog />
                            <span>Account Settings</span>
                          </button>
                        </li>

                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={changePassword}
                          >
                            <FaLock />
                            <span>Change Password</span>
                          </button>
                        </li>

                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={helpPage}
                          >
                            <FaHandsHelping />
                            <span>Help</span>
                          </button>
                        </li>

                        <li>
                          <hr className="dropdown-divider" />
                        </li>

                        <li>
                          <button
                            type="button"
                            className="dropdown-item logout-item"
                            onClick={handleLogout}
                          >
                            <FaSignOutAlt />
                            <span>Logout</span>
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </header>
      )}
    </>
  );
};

export default Header;
