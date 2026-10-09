import React, { useRef, useState } from "react";
import {
  FaCamera,
  FaEdit,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaMapMarkerAlt,
  FaLock,
  FaSave,
  FaTrash,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

import "./myProfile.css";

const MyProfile = () => {
  const fileInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@bhyyve.com",
    mobile: "+1 000 000 0000",
    address: "Canada",
    city: "",
    country: "Canada",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setProfileImage(imageUrl);

    toast.success("Profile image selected");
  };

  const handleRemoveImage = () => {
    setProfileImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.success("Profile image removed");
  };

  // =========================================================
  // PROFILE UPDATE
  // =========================================================

  const handleProfileSubmit = (e) => {
    e.preventDefault();

    toast.success("Profile updated successfully");
  };

  // =========================================================
  // PASSWORD UPDATE
  // =========================================================

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

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    toast.success("Password updated successfully");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="my-profile-page">

        {/* =====================================================
            BREADCRUMB
        ===================================================== */}

        <div className="profile-breadcrumb-wrapper">
          <div className="profile-breadcrumb">

            <Link to="/admin/dashboard">
              Home
            </Link>

            <span>/</span>

            <Link to="#">
              Profile
            </Link>

            <span>/</span>

            <span className="active">
              My Profile
            </span>

          </div>
        </div>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="profile-page-header">

          <div>
            <h2>My Profile</h2>

            <p>
              Manage your profile information and account settings.
            </p>
          </div>

        </div>

        {/* =====================================================
            PROFILE TOP CARD
        ===================================================== */}

        <div className="profile-main-card">

          <div className="profile-cover"></div>

          <div className="profile-header-content">

            <div className="profile-image-section">

              <div className="profile-image-wrapper">

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-image"
                  />
                ) : (
                  <div className="profile-placeholder">
                    <FaUser />
                  </div>
                )}

                <button
                  type="button"
                  className="profile-camera-button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change Profile Image"
                >
                  <FaCamera />
                </button>

              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />

              <div className="profile-image-actions">

                <button
                  type="button"
                  className="change-image-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaCamera />
                  Change Image
                </button>

                {profileImage && (
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                  >
                    <FaTrash />
                    Remove
                  </button>
                )}

              </div>

              <p className="image-help-text">
                JPG, PNG or WEBP. Maximum size 2MB.
              </p>

            </div>

            <div className="profile-header-info">

              <h3>
                {formData.firstName} {formData.lastName}
              </h3>

              <p>
                <FaEnvelope />
                {formData.email}
              </p>

              <span className="admin-role-badge">
                Administrator
              </span>

            </div>

          </div>

        </div>

        {/* =====================================================
            PERSONAL INFORMATION
        ===================================================== */}

        <form onSubmit={handleProfileSubmit}>

          <div className="profile-content-card">

            <div className="profile-card-header">

              <div className="profile-section-icon">
                <FaUser />
              </div>

              <div>
                <h3>Personal Information</h3>

                <p>
                  Update your personal and contact information.
                </p>
              </div>

            </div>

            <div className="profile-divider"></div>

            <div className="profile-form-grid">

              {/* First Name */}

              <div className="profile-form-group">

                <label>
                  First Name
                </label>

                <div className="profile-input-wrapper">

                  <FaUser />

                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* Last Name */}

              <div className="profile-form-group">

                <label>
                  Last Name
                </label>

                <div className="profile-input-wrapper">

                  <FaUser />

                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* Email */}

              <div className="profile-form-group">

                <label>
                  Email Address
                </label>

                <div className="profile-input-wrapper">

                  <FaEnvelope />

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* Mobile */}

              <div className="profile-form-group">

                <label>
                  Mobile Number
                </label>

                <div className="profile-input-wrapper">

                  <FaPhone />

                  <input
                    type="text"
                    name="mobile"
                    placeholder="Enter mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* Address */}

              <div className="profile-form-group profile-full-width">

                <label>
                  Address
                </label>

                <div className="profile-input-wrapper">

                  <FaMapMarkerAlt />

                  <input
                    type="text"
                    name="address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* City */}

              <div className="profile-form-group">

                <label>
                  City
                </label>

                <div className="profile-input-wrapper">

                  <FaMapMarkerAlt />

                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* Country */}

              <div className="profile-form-group">

                <label>
                  Country
                </label>

                <div className="profile-input-wrapper">

                  <FaMapMarkerAlt />

                  <input
                    type="text"
                    name="country"
                    placeholder="Enter country"
                    value={formData.country}
                    onChange={handleChange}
                  />

                </div>

              </div>

            </div>

            {/* Save Button */}

            <div className="profile-card-footer">

              <button
                type="submit"
                className="profile-save-button"
              >
                <FaSave />
                Save Changes
              </button>

            </div>

          </div>

        </form>

        {/* =====================================================
            PASSWORD SECTION
        ===================================================== */}

        <form onSubmit={handlePasswordSubmit}>

          <div className="profile-content-card password-card">

            <div className="profile-card-header">

              <div className="profile-section-icon">
                <FaLock />
              </div>

              <div>
                <h3>Change Password</h3>

                <p>
                  Keep your account secure by using a strong password.
                </p>
              </div>

            </div>

            <div className="profile-divider"></div>

            <div className="profile-form-grid">

              {/* Current Password */}

              <div className="profile-form-group">

                <label>
                  Current Password
                </label>

                <div className="profile-input-wrapper">

                  <FaLock />

                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />

                </div>

              </div>

              {/* New Password */}

              <div className="profile-form-group">

                <label>
                  New Password
                </label>

                <div className="profile-input-wrapper">

                  <FaLock />

                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />

                </div>

              </div>

              {/* Confirm Password */}

              <div className="profile-form-group">

                <label>
                  Confirm Password
                </label>

                <div className="profile-input-wrapper">

                  <FaLock />

                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />

                </div>

              </div>

            </div>

            <div className="profile-card-footer">

              <button
                type="submit"
                className="profile-save-button"
              >
                <FaEdit />
                Update Password
              </button>

            </div>

          </div>

        </form>

      </div>
    </>
  );
};

export default MyProfile;