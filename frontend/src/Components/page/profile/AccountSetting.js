import React, { useState } from "react";
import {
  FaBell,
  FaCheck,
  FaChevronRight,
  FaClock,
  FaDesktop,
  FaEnvelope,
  FaGlobe,
  FaLock,
  FaMoon,
  FaShieldAlt,
  FaSignOutAlt,
  FaSun,
  FaTrash,
  FaUserShield,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

import "./accountSetting.css";

const AccountSetting = () => {
  // =========================================================
  // PASSWORD STATE
  // =========================================================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =========================================================
  // SECURITY STATE
  // =========================================================

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // =========================================================
  // NOTIFICATION STATE
  // =========================================================

  const [notifications, setNotifications] = useState({
    newUser: true,
    newVendor: true,
    newBooking: true,
    newFeedback: true,
    warrantyClaim: false,
    subscription: true,
    contactRequest: true,
    systemUpdates: true,
  });

  const [emailPreferences, setEmailPreferences] = useState({
    accountSecurity: true,
    bookingUpdates: true,
    vendorActivity: true,
    promotionalEmails: false,
    systemEmails: true,
  });

  // =========================================================
  // REGIONAL STATE
  // =========================================================

  const [regionalSettings, setRegionalSettings] = useState({
    language: "English",
    timezone: "America/Toronto",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12 Hour",
  });

  // =========================================================
  // APPEARANCE STATE
  // =========================================================

  const [appearance, setAppearance] = useState({
    theme: "light",
    sidebar: "expanded",
    compactMode: false,
  });

  // =========================================================
  // MODAL STATE
  // =========================================================

  const [modal, setModal] = useState({
    show: false,
    type: "",
  });

  // =========================================================
  // PASSWORD HANDLER
  // =========================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getPasswordStrength = () => {
    const password = passwordData.newPassword;

    if (!password) {
      return {
        label: "Enter a password",
        width: "0%",
        level: "",
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak",
        width: "35%",
        level: "weak",
      };
    }

    if (score === 3) {
      return {
        label: "Medium",
        width: "65%",
        level: "medium",
      };
    }

    return {
      label: "Strong",
      width: "100%",
      level: "strong",
    };
  };

  const passwordStrength = getPasswordStrength();

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill all password fields");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must contain at least 8 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    toast.success("Password updated successfully");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // =========================================================
  // TOGGLE HANDLERS
  // =========================================================

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleEmailToggle = (key) => {
    setEmailPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // =========================================================
  // TWO FACTOR AUTHENTICATION
  // =========================================================

  const handleTwoFactorToggle = () => {
    const newValue = !twoFactorEnabled;

    setTwoFactorEnabled(newValue);

    if (newValue) {
      toast.success("Two-factor authentication enabled");
    } else {
      toast.success("Two-factor authentication disabled");
    }
  };

  // =========================================================
  // REGIONAL SETTINGS
  // =========================================================

  const handleRegionalChange = (e) => {
    const { name, value } = e.target;

    setRegionalSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveRegionalSettings = (e) => {
    e.preventDefault();

    toast.success("Regional preferences saved");
  };

  // =========================================================
  // APPEARANCE
  // =========================================================

  const handleThemeChange = (theme) => {
    setAppearance((prev) => ({
      ...prev,
      theme,
    }));

    toast.success(
      `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme selected`
    );
  };

  const handleSidebarChange = (sidebar) => {
    setAppearance((prev) => ({
      ...prev,
      sidebar,
    }));

    toast.success("Sidebar preference updated");
  };

  const handleCompactToggle = () => {
    setAppearance((prev) => ({
      ...prev,
      compactMode: !prev.compactMode,
    }));

    toast.success("Compact mode updated");
  };

  // =========================================================
  // ACTIVE SESSION
  // =========================================================

  const handleLogoutSession = () => {
    toast.success("Session logged out successfully");
  };

  const handleLogoutAll = () => {
    setModal({
      show: true,
      type: "logoutAll",
    });
  };

  // =========================================================
  // DANGER ZONE
  // =========================================================

  const handleDeactivate = () => {
    setModal({
      show: true,
      type: "deactivate",
    });
  };

  const handleDeleteAccount = () => {
    setModal({
      show: true,
      type: "delete",
    });
  };

  const handleModalConfirm = () => {
    if (modal.type === "logoutAll") {
      toast.success("All other sessions have been logged out");
    }

    if (modal.type === "deactivate") {
      toast.success("Account deactivation request submitted");
    }

    if (modal.type === "delete") {
      toast.success("Account deletion request submitted");
    }

    setModal({
      show: false,
      type: "",
    });
  };

  const closeModal = () => {
    setModal({
      show: false,
      type: "",
    });
  };

  const getModalContent = () => {
    switch (modal.type) {
      case "logoutAll":
        return {
          icon: <FaSignOutAlt />,
          title: "Logout from all devices?",
          text:
            "This will log you out from every other device where your account is currently active.",
          button: "Logout All",
        };

      case "deactivate":
        return {
          icon: <FaUserShield />,
          title: "Deactivate your account?",
          text:
            "Your account will be temporarily disabled. You may need administrator assistance to reactivate it.",
          button: "Deactivate",
        };

      case "delete":
        return {
          icon: <FaTrash />,
          title: "Delete your account?",
          text:
            "This is a destructive action. Your account and associated data may be permanently removed.",
          button: "Delete Account",
        };

      default:
        return {
          icon: <FaShieldAlt />,
          title: "Confirm Action",
          text: "Are you sure you want to continue?",
          button: "Confirm",
        };
    }
  };

  const modalContent = getModalContent();

  return (
    <>
      <Toaster position="top-right" />

      <div className="account-settings-page">

        {/* =====================================================
            BREADCRUMB
        ===================================================== */}

        <div className="account-breadcrumb-wrapper">

          <div className="account-breadcrumb">

            <Link to="/admin/dashboard">
              Home
            </Link>

            <FaChevronRight />

            <Link to="#">
              Profile
            </Link>

            <FaChevronRight />

            <span className="active">
              Account Settings
            </span>

          </div>

        </div>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="account-page-header">

          <div>

            <h2>
              Account Settings
            </h2>

            <p>
              Manage your security, notifications, preferences and account.
            </p>

          </div>

        </div>

        {/* =====================================================
            SECURITY
        ===================================================== */}

        <div className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <FaLock />
            </div>

            <div>
              <h3>
                Security
              </h3>

              <p>
                Keep your account secure and manage your login credentials.
              </p>
            </div>

          </div>

          <div className="settings-divider"></div>

          <form onSubmit={handlePasswordSubmit}>

            <div className="settings-form-grid">

              {/* Current Password */}

              <div className="settings-form-group">

                <label>
                  Current Password
                </label>

                <div className="password-input-wrapper">

                  <FaLock />

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    name="currentPassword"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />

                  <button
                    type="button"
                    className="password-eye-button"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                  >
                    {showCurrentPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* New Password */}

              <div className="settings-form-group">

                <label>
                  New Password
                </label>

                <div className="password-input-wrapper">

                  <FaLock />

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    name="newPassword"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />

                  <button
                    type="button"
                    className="password-eye-button"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>

                </div>

                <div className="password-strength">

                  <div className="strength-header">

                    <span>
                      Password strength
                    </span>

                    <span className={passwordStrength.level}>
                      {passwordStrength.label}
                    </span>

                  </div>

                  <div className="strength-bar">
                    <span
                      className={passwordStrength.level}
                      style={{
                        width: passwordStrength.width,
                      }}
                    ></span>
                  </div>

                  <small>
                    Use at least 8 characters with uppercase,
                    lowercase, numbers and symbols.
                  </small>

                </div>

              </div>

              {/* Confirm Password */}

              <div className="settings-form-group">

                <label>
                  Confirm New Password
                </label>

                <div className="password-input-wrapper">

                  <FaLock />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />

                  <button
                    type="button"
                    className="password-eye-button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

            </div>

            <div className="settings-footer">

              <button
                type="submit"
                className="primary-settings-button"
              >
                <FaLock />
                Update Password
              </button>

            </div>

          </form>

          <div className="settings-divider"></div>

          {/* TWO FACTOR */}

          <div className="security-setting-row">

            <div className="security-setting-info">

              <div className="security-setting-icon">
                <FaShieldAlt />
              </div>

              <div>

                <h4>
                  Two-Factor Authentication
                </h4>

                <p>
                  Add an extra layer of security to your account.
                </p>

              </div>

            </div>

            <div className="setting-control-area">

              <span
                className={
                  twoFactorEnabled
                    ? "status-badge enabled"
                    : "status-badge disabled"
                }
              >
                {twoFactorEnabled
                  ? "Enabled"
                  : "Disabled"}
              </span>

              <button
                type="button"
                className={
                  twoFactorEnabled
                    ? "toggle-switch active"
                    : "toggle-switch"
                }
                onClick={handleTwoFactorToggle}
              >
                <span></span>
              </button>

            </div>

          </div>

        </div>

        {/* =====================================================
            NOTIFICATION SETTINGS
        ===================================================== */}

        <div className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <FaBell />
            </div>

            <div>

              <h3>
                Notification Preferences
              </h3>

              <p>
                Choose which events you want to be notified about.
              </p>

            </div>

          </div>

          <div className="settings-divider"></div>

          <div className="toggle-settings-list">

            <SettingToggle
              title="New User Registration"
              description="Get notified when a new user registers."
              value={notifications.newUser}
              onChange={() =>
                handleNotificationToggle("newUser")
              }
            />

            <SettingToggle
              title="New Vendor Registration"
              description="Get notified when a new vendor joins."
              value={notifications.newVendor}
              onChange={() =>
                handleNotificationToggle("newVendor")
              }
            />

            <SettingToggle
              title="New Booking"
              description="Receive alerts for new bookings."
              value={notifications.newBooking}
              onChange={() =>
                handleNotificationToggle("newBooking")
              }
            />

            <SettingToggle
              title="New Feedback"
              description="Get notified when users submit feedback."
              value={notifications.newFeedback}
              onChange={() =>
                handleNotificationToggle("newFeedback")
              }
            />

            <SettingToggle
              title="Warranty Claims"
              description="Receive notifications for new warranty claims."
              value={notifications.warrantyClaim}
              onChange={() =>
                handleNotificationToggle("warrantyClaim")
              }
            />

            <SettingToggle
              title="Subscription Updates"
              description="Receive subscription and package notifications."
              value={notifications.subscription}
              onChange={() =>
                handleNotificationToggle("subscription")
              }
            />

            <SettingToggle
              title="Contact Requests"
              description="Get notified when users contact support."
              value={notifications.contactRequest}
              onChange={() =>
                handleNotificationToggle("contactRequest")
              }
            />

            <SettingToggle
              title="System Updates"
              description="Receive important system and maintenance updates."
              value={notifications.systemUpdates}
              onChange={() =>
                handleNotificationToggle("systemUpdates")
              }
            />

          </div>

        </div>

        {/* =====================================================
            EMAIL PREFERENCES
        ===================================================== */}

        <div className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <FaEnvelope />
            </div>

            <div>

              <h3>
                Email Preferences
              </h3>

              <p>
                Control the types of emails you receive.
              </p>

            </div>

          </div>

          <div className="settings-divider"></div>

          <div className="toggle-settings-list">

            <SettingToggle
              title="Account & Security"
              description="Important account and security-related emails."
              value={emailPreferences.accountSecurity}
              onChange={() =>
                handleEmailToggle("accountSecurity")
              }
            />

            <SettingToggle
              title="Booking Updates"
              description="Emails about booking activity and changes."
              value={emailPreferences.bookingUpdates}
              onChange={() =>
                handleEmailToggle("bookingUpdates")
              }
            />

            <SettingToggle
              title="Vendor Activity"
              description="Updates related to vendor activity."
              value={emailPreferences.vendorActivity}
              onChange={() =>
                handleEmailToggle("vendorActivity")
              }
            />

            <SettingToggle
              title="Promotional Emails"
              description="Receive promotional and marketing emails."
              value={emailPreferences.promotionalEmails}
              onChange={() =>
                handleEmailToggle("promotionalEmails")
              }
            />

            <SettingToggle
              title="System Emails"
              description="Important system and service emails."
              value={emailPreferences.systemEmails}
              onChange={() =>
                handleEmailToggle("systemEmails")
              }
            />

          </div>

        </div>

        {/* =====================================================
            REGIONAL SETTINGS
        ===================================================== */}

        <form onSubmit={saveRegionalSettings}>

          <div className="settings-card">

            <div className="settings-card-header">

              <div className="settings-icon">
                <FaGlobe />
              </div>

              <div>

                <h3>
                  Regional Preferences
                </h3>

                <p>
                  Customize language, timezone and date preferences.
                </p>

              </div>

            </div>

            <div className="settings-divider"></div>

            <div className="settings-form-grid">

              <div className="settings-form-group">

                <label>
                  Language
                </label>

                <select
                  name="language"
                  value={regionalSettings.language}
                  onChange={handleRegionalChange}
                >
                  <option>English</option>
                  <option>French</option>
                </select>

              </div>

              <div className="settings-form-group">

                <label>
                  Timezone
                </label>

                <select
                  name="timezone"
                  value={regionalSettings.timezone}
                  onChange={handleRegionalChange}
                >
                  <option value="America/Toronto">
                    America/Toronto
                  </option>

                  <option value="America/New_York">
                    America/New_York
                  </option>

                  <option value="America/Los_Angeles">
                    America/Los_Angeles
                  </option>

                  <option value="Asia/Kolkata">
                    Asia/Kolkata
                  </option>
                </select>

              </div>

              <div className="settings-form-group">

                <label>
                  Date Format
                </label>

                <select
                  name="dateFormat"
                  value={regionalSettings.dateFormat}
                  onChange={handleRegionalChange}
                >
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>

              </div>

              <div className="settings-form-group">

                <label>
                  Time Format
                </label>

                <select
                  name="timeFormat"
                  value={regionalSettings.timeFormat}
                  onChange={handleRegionalChange}
                >
                  <option>12 Hour</option>
                  <option>24 Hour</option>
                </select>

              </div>

            </div>

            <div className="settings-footer">

              <button
                type="submit"
                className="primary-settings-button"
              >
                <FaCheck />
                Save Preferences
              </button>

            </div>

          </div>

        </form>

        {/* =====================================================
            APPEARANCE
        ===================================================== */}

        <div className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <FaSun />
            </div>

            <div>

              <h3>
                Appearance
              </h3>

              <p>
                Customize how the admin panel looks and behaves.
              </p>

            </div>

          </div>

          <div className="settings-divider"></div>

          <div className="appearance-section">

            <div className="appearance-setting">

              <div>

                <h4>
                  Theme
                </h4>

                <p>
                  Select your preferred dashboard theme.
                </p>

              </div>

              <div className="theme-options">

                <button
                  type="button"
                  className={
                    appearance.theme === "light"
                      ? "theme-option active"
                      : "theme-option"
                  }
                  onClick={() =>
                    handleThemeChange("light")
                  }
                >
                  <FaSun />
                  Light
                </button>

                <button
                  type="button"
                  className={
                    appearance.theme === "dark"
                      ? "theme-option active"
                      : "theme-option"
                  }
                  onClick={() =>
                    handleThemeChange("dark")
                  }
                >
                  <FaMoon />
                  Dark
                </button>

              </div>

            </div>

            <div className="appearance-setting">

              <div>

                <h4>
                  Sidebar
                </h4>

                <p>
                  Choose the default sidebar layout.
                </p>

              </div>

              <div className="theme-options">

                <button
                  type="button"
                  className={
                    appearance.sidebar === "expanded"
                      ? "theme-option active"
                      : "theme-option"
                  }
                  onClick={() =>
                    handleSidebarChange("expanded")
                  }
                >
                  Expanded
                </button>

                <button
                  type="button"
                  className={
                    appearance.sidebar === "collapsed"
                      ? "theme-option active"
                      : "theme-option"
                  }
                  onClick={() =>
                    handleSidebarChange("collapsed")
                  }
                >
                  Collapsed
                </button>

              </div>

            </div>

            <div className="appearance-setting">

              <div>

                <h4>
                  Compact Mode
                </h4>

                <p>
                  Reduce spacing throughout the dashboard.
                </p>

              </div>

              <button
                type="button"
                className={
                  appearance.compactMode
                    ? "toggle-switch active"
                    : "toggle-switch"
                }
                onClick={handleCompactToggle}
              >
                <span></span>
              </button>

            </div>

          </div>

        </div>

        {/* =====================================================
            ACTIVE SESSIONS
        ===================================================== */}

        <div className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <FaDesktop />
            </div>

            <div>

              <h3>
                Active Sessions
              </h3>

              <p>
                Review devices currently signed in to your account.
              </p>

            </div>

          </div>

          <div className="settings-divider"></div>

          <div className="session-list">

            <div className="session-item">

              <div className="session-device-icon">
                <FaDesktop />
              </div>

              <div className="session-info">

                <h4>
                  Chrome • Windows
                </h4>

                <p>
                  Current device • Toronto, Canada
                </p>

                <span className="current-session">
                  Current Session
                </span>

              </div>

            </div>

            <div className="session-item">

              <div className="session-device-icon">
                <FaDesktop />
              </div>

              <div className="session-info">

                <h4>
                  Microsoft Edge • Windows
                </h4>

                <p>
                  Toronto, Canada • 2 hours ago
                </p>

              </div>

              <button
                type="button"
                className="session-logout-button"
                onClick={handleLogoutSession}
              >
                Logout
              </button>

            </div>

            <div className="session-item">

              <div className="session-device-icon">
                <FaDesktop />
              </div>

              <div className="session-info">

                <h4>
                  Chrome • Windows
                </h4>

                <p>
                  Toronto, Canada • Yesterday
                </p>

              </div>

              <button
                type="button"
                className="session-logout-button"
                onClick={handleLogoutSession}
              >
                Logout
              </button>

            </div>

          </div>

          <div className="settings-footer">

            <button
              type="button"
              className="logout-all-button"
              onClick={handleLogoutAll}
            >
              <FaSignOutAlt />
              Logout From All Other Devices
            </button>

          </div>

        </div>

        {/* =====================================================
            DANGER ZONE
        ===================================================== */}

        <div className="danger-zone-card">

          <div className="danger-zone-header">

            <div className="danger-zone-icon">
              <FaShieldAlt />
            </div>

            <div>

              <h3>
                Danger Zone
              </h3>

              <p>
                These actions can affect your account access and data.
              </p>

            </div>

          </div>

          <div className="danger-divider"></div>

          <div className="danger-action">

            <div>

              <h4>
                Deactivate Account
              </h4>

              <p>
                Temporarily disable your account.
              </p>

            </div>

            <button
              type="button"
              className="deactivate-button"
              onClick={handleDeactivate}
            >
              Deactivate
            </button>

          </div>

          <div className="danger-action">

            <div>

              <h4>
                Delete Account
              </h4>

              <p>
                Permanently remove your account and associated data.
              </p>

            </div>

            <button
              type="button"
              className="delete-account-button"
              onClick={handleDeleteAccount}
            >
              <FaTrash />
              Delete Account
            </button>

          </div>

        </div>

      </div>

      {/* =======================================================
          CONFIRMATION MODAL
      ======================================================= */}

      {modal.show && (

        <div
          className="settings-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="settings-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="confirm-modal-icon">
              {modalContent.icon}
            </div>

            <h3>
              {modalContent.title}
            </h3>

            <p>
              {modalContent.text}
            </p>

            <div className="confirm-modal-actions">

              <button
                type="button"
                className="cancel-modal-button"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  modal.type === "delete"
                    ? "confirm-delete-button"
                    : "confirm-action-button"
                }
                onClick={handleModalConfirm}
              >
                {modalContent.button}
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
};


// =========================================================
// REUSABLE TOGGLE COMPONENT
// =========================================================

const SettingToggle = ({
  title,
  description,
  value,
  onChange,
}) => {
  return (
    <div className="setting-toggle-row">

      <div className="setting-toggle-info">

        <h4>
          {title}
        </h4>

        <p>
          {description}
        </p>

      </div>

      <button
        type="button"
        className={
          value
            ? "toggle-switch active"
            : "toggle-switch"
        }
        onClick={onChange}
        aria-label={`Toggle ${title}`}
      >
        <span></span>
      </button>

    </div>
  );
};

export default AccountSetting;