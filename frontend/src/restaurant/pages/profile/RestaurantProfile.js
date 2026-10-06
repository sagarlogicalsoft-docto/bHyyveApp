import React, { useEffect, useRef, useState } from "react";
import { FaUser, FaCamera, FaTrash, FaSpinner } from "react-icons/fa";
import "./restaurantProfile.css";

/**
 * ------------------------------------------------------------------
 *  RestaurantProfile.js
 * ------------------------------------------------------------------
 *  "My Profile" page — shows the logged-in admin's info and lets
 *  them edit it, plus add/remove their profile photo.
 *
 *  BACKEND INTEGRATION
 *  --------------------
 *  Every server call lives inside the `api` object below.
 *   1. Set REACT_APP_API_BASE_URL in your .env (falls back to "/api").
 *   2. Point the functions inside `api` at your real endpoints.
 *   3. Delete MOCK_PROFILE once the API is live — it only exists so
 *      the page renders during frontend dev.
 *
 *  Expected endpoints (adjust freely):
 *   GET    /api/profile               -> Profile (see MOCK_PROFILE for shape)
 *   PUT    /api/profile                -> updated Profile
 *   POST   /api/profile/image          -> { imageUrl }   (multipart/form-data, field name "image")
 *   DELETE /api/profile/image          -> { success: true }
 * ------------------------------------------------------------------
 */

const API_BASE_URL =
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
  "/api";

const MAX_IMAGE_SIZE_MB = 5;

const MOCK_PROFILE = {
  name: "Admin",
  role: "Restaurant Admin",
  email: "admin@bhyyve.com",
  phone: "9090909090",
  restaurantName: "Famous Sandwich",
  address: "221B Baker Street, Toronto, ON",
  joinedDisplay: "12 Jan 2025",
  bio: "",
  imageUrl: null,
};

const api = {
  // 👉 ADD API HERE: fetch the logged-in admin's profile.
  // Called once on mount.
  //    GET /profile  ->  Profile
  async getProfile(signal) {
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, { signal });
      if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
      return await res.json();
    } catch (err) {
      // TODO: remove fallback once the /profile endpoint is live
      console.warn("[RestaurantProfile] Falling back to mock profile:", err.message);
      return MOCK_PROFILE;
    }
  },

  // 👉 ADD API HERE: save edited profile fields.
  // Called when "Save Changes" is clicked.
  //    PUT /profile  ->  updated Profile
  async updateProfile(payload) {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Failed to save profile (${res.status})`);
    }
    return res.json();
  },

  // 👉 ADD API HERE: upload a new profile photo.
  // Called when the user picks a file via the camera icon.
  //    POST /profile/image (multipart/form-data, field "image")  ->  { imageUrl }
  async uploadProfileImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_BASE_URL}/profile/image`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Failed to upload image (${res.status})`);
    }
    return res.json(); // -> { imageUrl }
  },

  // 👉 ADD API HERE: remove the current profile photo.
  // Called when the trash icon is clicked.
  //    DELETE /profile/image  ->  { success: true }
  async removeProfileImage() {
    const res = await fetch(`${API_BASE_URL}/profile/image`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Failed to remove image (${res.status})`);
    }
    return res.json();
  },
};

export default function RestaurantProfile() {
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null); // editable copy, only used while editing
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ---- Load the profile once on mount ----
  useEffect(() => {
    const controller = new AbortController();
    api
      .getProfile(controller.signal)
      .then((data) => setProfile(data))
      .catch((err) => {
        if (err.name !== "AbortError") setError("Couldn't load your profile. Please try again.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  // Auto-clear the success banner after a few seconds.
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const startEditing = () => {
    setForm({ ...profile });
    setIsEditing(true);
    setError(null);
  };

  const cancelEditing = () => {
    setForm(null);
    setIsEditing(false);
    setError(null);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateProfile(form);
      setProfile(updated);
      setIsEditing(false);
      setForm(null);
      setSuccessMessage("Profile updated.");
    } catch (err) {
      setError(err.message || "Something went wrong while saving your profile.");
    } finally {
      setSaving(false);
    }
  };

  // ---- Profile image add / remove ----

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow picking the same file again later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    setError(null);
    setImageBusy(true);

    // Show the picked image immediately while the upload is in flight.
    const previewUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, imageUrl: previewUrl }));

    try {
      const { imageUrl } = await api.uploadProfileImage(file);
      setProfile((prev) => ({ ...prev, imageUrl }));
      setSuccessMessage("Profile photo updated.");
    } catch (err) {
      setError(err.message || "Couldn't upload that image. Please try again.");
      // Roll back to whatever the server actually has on failure.
      setProfile((prev) => ({ ...prev, imageUrl: profile?.imageUrl || null }));
    } finally {
      URL.revokeObjectURL(previewUrl);
      setImageBusy(false);
    }
  };

  const handleRemoveImage = async () => {
    setImageBusy(true);
    setError(null);
    try {
      await api.removeProfileImage();
      setProfile((prev) => ({ ...prev, imageUrl: null }));
      setSuccessMessage("Profile photo removed.");
    } catch (err) {
      setError(err.message || "Couldn't remove your photo. Please try again.");
    } finally {
      setImageBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="rp-page">
        <div className="rp-loading">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rp-page">
        <div className="rp-error-banner">{error || "Profile not found."}</div>
      </div>
    );
  }

  const active = isEditing ? form : profile;

  return (
    <div className="rp-page">
      <div className="rp-header">
        <h1>My Profile</h1>
        <p>View and manage your account information</p>
      </div>

      {error && <div className="rp-error-banner">{error}</div>}
      {successMessage && <div className="rp-success-banner">{successMessage}</div>}

      <div className="rp-card">
        {/* ---------------- Avatar + name ---------------- */}
        <div className="rp-identity">
          <div className="rp-avatar">
            {profile.imageUrl ? (
              <img src={profile.imageUrl} alt={profile.name} />
            ) : (
              <FaUser className="rp-avatar__placeholder" />
            )}

            {imageBusy && (
              <div className="rp-avatar__overlay">
                <FaSpinner className="rp-spin" />
              </div>
            )}

            <button
              type="button"
              className="rp-avatar__btn rp-avatar__btn--camera"
              onClick={handlePickImage}
              disabled={imageBusy}
              aria-label="Change profile photo"
              title="Change profile photo"
            >
              <FaCamera />
            </button>

            {profile.imageUrl && (
              <button
                type="button"
                className="rp-avatar__btn rp-avatar__btn--remove"
                onClick={handleRemoveImage}
                disabled={imageBusy}
                aria-label="Remove profile photo"
                title="Remove profile photo"
              >
                <FaTrash />
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="rp-hidden-input"
              onChange={handleImageSelected}
            />
          </div>

          <div className="rp-identity__text">
            <strong>{profile.name}</strong>
            <span>{profile.role}</span>
          </div>

          {!isEditing && (
            <button type="button" className="rp-btn rp-btn--outline rp-edit-btn" onClick={startEditing}>
              Edit Profile
            </button>
          )}
        </div>

        {/* ---------------- Info fields ---------------- */}
        <div className="rp-fields">
          <div className="rp-field">
            <label>Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={active.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            ) : (
              <p>{profile.name}</p>
            )}
          </div>

          <div className="rp-field">
            <label>Email Address</label>
            {isEditing ? (
              <input
                type="email"
                value={active.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            ) : (
              <p>{profile.email}</p>
            )}
          </div>

          <div className="rp-field">
            <label>Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                value={active.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            ) : (
              <p>{profile.phone}</p>
            )}
          </div>

          <div className="rp-field">
            <label>Restaurant Name</label>
            {isEditing ? (
              <input
                type="text"
                value={active.restaurantName}
                onChange={(e) => updateField("restaurantName", e.target.value)}
              />
            ) : (
              <p>{profile.restaurantName}</p>
            )}
          </div>

          <div className="rp-field rp-field--full">
            <label>Address</label>
            {isEditing ? (
              <input
                type="text"
                value={active.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            ) : (
              <p>{profile.address}</p>
            )}
          </div>

          <div className="rp-field">
            <label>Joined</label>
            <p className="rp-field__muted">{profile.joinedDisplay}</p>
          </div>

          <div className="rp-field rp-field--full">
            <label>Bio</label>
            {isEditing ? (
              <textarea
                rows={3}
                value={active.bio}
                placeholder="A short note about you or your restaurant..."
                onChange={(e) => updateField("bio", e.target.value)}
              />
            ) : (
              <p className={!profile.bio ? "rp-field__muted" : ""}>
                {profile.bio || "No bio added yet."}
              </p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="rp-actions">
            <button type="button" className="rp-btn rp-btn--outline" onClick={cancelEditing} disabled={saving}>
              Cancel
            </button>
            <button type="button" className="rp-btn rp-btn--primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}