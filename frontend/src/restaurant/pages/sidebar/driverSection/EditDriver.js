import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../config/api";
import "./editDriver.css";
import { getImage } from "../../../../Components/utils/images";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/styles";

// ---- tiny inline icons -------------------------------------------------

const CarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path d="M4 16v-3.5L6 8h12l2 4.5V16" />
    <path d="M4 16h16v2.5a1 1 0 01-1 1h-1.5a1 1 0 01-1-1V17H7.5v1.5a1 1 0 01-1 1H5a1 1 0 01-1-1V16z" />
    <circle cx="7.5" cy="16" r="1.4" />
    <circle cx="16.5" cy="16" r="1.4" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor">
    <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 4.5V18h14v-1.5c0-2.5-3-4.5-7-4.5z" />
  </svg>
);

const IdCardIcon = () => (
  <svg
    viewBox="0 0 20 20"
    width="13"
    height="13"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <rect x="2" y="4" width="16" height="12" rx="2" />
    <circle cx="7" cy="10" r="1.6" />
    <path d="M11 9h5M11 12h4" />
  </svg>
);

const UploadIcon = () => (
  <svg
    viewBox="0 0 20 20"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M10 13V4M10 4l-3 3M10 4l3 3" />
    <path d="M4 14v1.5A1.5 1.5 0 005.5 17h9a1.5 1.5 0 001.5-1.5V14" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor">
    <path d="M10 8.6l4-4L15.4 6l-4 4 4 4-1.4 1.4-4-4-4 4L4.6 14l4-4-4-4L6 4.6z" />
  </svg>
);

// ---- small presentational helpers -----------------------------------

const SectionCard = ({ icon, title, children }) => (
  <section className="ed-card">
    <header className="ed-card__head">
      <span className="ed-card__icon">{icon}</span>
      <h2>{title}</h2>
    </header>
    <div className="ed-card__body">{children}</div>
  </section>
);

const Field = ({ label, required, children }) => (
  <div className="field">
    <label>
      {label}
      {required && <span className="field__required">*</span>}
    </label>
    {children}
  </div>
);

// Reusable image dropzone — used for both the profile photo and the
// identity document image. The upload box is always visible (so a new
// image can be picked any time), and the current image — once selected —
// is shown just below it at its real display size.
const ImageDropzone = ({
  hint,
  preview,
  onSelect,
  onRemove,
  previewShape = "square", // "circle" | "square" — shape of the preview only
  removeStyle = "button", // "button" (label below) | "corner" (badge on image)
  align = "center", // "center" | "left"
  inputId,
}) => {
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onSelect(file);
  };

  return (
    <div className={`dropzone-wrap dropzone-wrap--${align}`}>
      {hint && <p className="dropzone-hint">{hint}</p>}

      <label
        htmlFor={inputId}
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <UploadIcon />
        <span className="dropzone__cta">Click to upload</span>
        <span className="dropzone__sub">Or drag and drop</span>
        <input
          id={inputId}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          hidden
          onChange={handleFile}
        />
      </label>

      {preview && (
        <div className={`preview-wrap preview-wrap--${previewShape}`}>
          <div className={`preview preview--${previewShape}`}>
            <img src={preview} alt="Preview" />
            {removeStyle === "corner" && (
              <button
                type="button"
                className="preview__remove-badge"
                onClick={onRemove}
                aria-label="Remove image"
              >
                <CloseIcon />
              </button>
            )}
          </div>
          {removeStyle === "button" && (
            <button
              type="button"
              className="preview__remove-btn"
              onClick={onRemove}
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ---- main component -----------------------------------------------------

export default function EditDriver() {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const phoneInputRef = useRef(null);
  const itiRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [removeIdentityImage, setRemoveIdentityImage] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country_code: "+91",
    identity_type: "driving_license",
    identity_number: "",
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const [identityImageFile, setIdentityImageFile] = useState(null);
  const [identityImagePreview, setIdentityImagePreview] = useState(null);

  // ---- load existing driver -------------------------------------------

  const fetchDriver = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/restaurant/drivers/${driverId}`);
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch driver details");
      }
      console.log("EDIT DRIVER API RESPONSE:", data);
      const d = data.data.driver;
      setForm({
        first_name: d.first_name || "",
        last_name: d.last_name || "",
        email: d.email || "",
        phone: d.phone || "",
        country_code: d.country_code || "+91",
        identity_type: d.identity_type || "driving_license",
        identity_number: d.identity_number || "",
      });
      setProfileImagePreview(
        d.profile_image ? getImage(d.profile_image) : null,
      );
      setIdentityImagePreview(
        d.identity_image ? getImage(d.identity_image) : null,
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Couldn't load this driver's details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchDriver();
  }, [fetchDriver]);

  useEffect(() => {
    if (loading || !phoneInputRef.current) return;

    const iti = intlTelInput(phoneInputRef.current, {
      initialCountry: form.country_code === "+1" ? "us" : "in",
      separateDialCode: true,
      allowDropdown: true,
      showFlags: true,
      countrySearch: true,
      loadUtils: () => import("intl-tel-input/utils"),
    });

    itiRef.current = iti;

    return () => {
      iti.destroy();
      itiRef.current = null;
    };
  }, [loading]);

  // useEffect(() => {
  //   if (!itiRef.current || !form.phone) return;

  //   itiRef.current.setNumber(`${form.country_code || "+91"}${form.phone}`);
  // }, [form.phone, form.country_code]);

  const syncPhone = async () => {
    if (!itiRef.current) {
      const countryCode = form.country_code?.trim() || "+91";
      const inputPhone =
        phoneInputRef.current?.value?.trim() || form.phone.trim();

      return {
        phone: inputPhone,
        country_code: countryCode,
        full_phone: `${countryCode}${inputPhone}`,
      };
    }

    const iti = itiRef.current;

    // Wait for utils to load
    await iti.promise;

    const country = iti.getSelectedCountry();

    const dialCode = country
      ? `+${country.dialCode}`
      : form.country_code?.trim() || "+91";

    if (iti.isValidNumber()) {
      const full = iti.getNumber();

      const local = full.startsWith(dialCode)
        ? full.slice(dialCode.length)
        : form.phone.trim();

      return {
        phone: local,
        country_code: dialCode,
        full_phone: full,
      };
    }
    const inputPhone =
      phoneInputRef.current?.value?.trim() || form.phone.trim();

    return {
      phone: inputPhone,
      country_code: dialCode,
      full_phone: `${dialCode}${inputPhone}`,
    };
  };

  // ---- field helpers -----------------------------------------------------

  const updateField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleProfileImageSelect = (file) => {
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
    setRemoveProfileImage(false);
  };

  const handleIdentityImageSelect = (file) => {
    setIdentityImageFile(file);
    setIdentityImagePreview(URL.createObjectURL(file));
    setRemoveIdentityImage(false);
  };

  // ---- submit --------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError(null);

    try {
      const payload = new FormData();

      const phoneData = await syncPhone();

      payload.append("driver_id", driverId);
      payload.append("first_name", form.first_name.trim());
      payload.append("last_name", form.last_name.trim());
      payload.append("email", form.email.trim());

      payload.append("phone", phoneData.phone);
      payload.append("country_code", phoneData.country_code);
      payload.append("full_phone", phoneData.full_phone);

      payload.append("identity_type", form.identity_type);
      payload.append("identity_number", form.identity_number.trim());

      payload.append("remove_profile_image", removeProfileImage ? "1" : "0");

      payload.append("remove_identity_image", removeIdentityImage ? "1" : "0");

      if (profileImageFile) {
        payload.append("profile_image", profileImageFile);
      }

      if (identityImageFile) {
        payload.append("identity_image", identityImageFile);
      }

      const { data } = await api.post(
        `/restaurant/drivers/${driverId}`,
        payload,
      );

      if (!data.success) {
        throw new Error(data.message || "Couldn't update this driver.");
      }

      navigate(`/restaurant/view_driver/${driverId}`);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Couldn't update this driver. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ---- render states ------------------------------------------------------

  if (loading) {
    return (
      <div className="edit-driver">
        <div className="ed-skeleton">
          <div className="sk sk--header" />
          <div className="sk sk--card" />
          <div className="sk sk--card" />
        </div>
      </div>
    );
  }

  return (
    <div className="edit-driver">
      <div className="edit-driver__topbar">
        <div className="edit-driver__title">
          <span className="edit-driver__title-icon">
            <CarIcon />
          </span>
          <h1>Edit Driver</h1>
        </div>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => navigate("/restaurant/driver_list")}
        >
          ← Back To List
        </button>
      </div>

      {error && (
        <div className="inline-error">
          {error}
          <button type="button" onClick={() => setError(null)}>
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <SectionCard icon={<UserIcon />} title="User Info">
          <div className="ed-grid">
            <div className="ed-grid__fields">
              <Field label="First name" required>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={updateField("first_name")}
                  required
                />
              </Field>

              <Field label="Last name" required>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={updateField("last_name")}
                  required
                />
              </Field>

              <Field label="Email" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  required
                />
              </Field>

              <Field label="Phone" required>
                <div className="phone-group">
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    defaultValue={form.phone}
                    required
                  />
                </div>
              </Field>
            </div>

            <div className="ed-grid__aside">
              <span className="ed-grid__aside-label">Profile Image</span>
              <ImageDropzone
                inputId="profile-image-input"
                hint="JPG, JPEG, PNG < 1MB (1:1)"
                preview={profileImagePreview}
                onSelect={handleProfileImageSelect}
                onRemove={() => {
                  setProfileImageFile(null);
                  setProfileImagePreview(null);
                  setRemoveProfileImage(true);
                }}
                previewShape="circle"
                removeStyle="button"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={<IdCardIcon />} title="Identity Info">
          <div className="ed-grid ed-grid--identity">
            <Field label="Identity Type" required>
              <select
                value={form.identity_type}
                onChange={updateField("identity_type")}
              >
                <option value="driving_license">Driving license</option>
                <option value="passport">Passport</option>
                <option value="nid">National ID</option>
              </select>
            </Field>

            <Field label="Identity Number" required>
              <input
                type="text"
                value={form.identity_number}
                onChange={updateField("identity_number")}
                required
              />
            </Field>
          </div>

          <div className="field field--full">
            <label>
              Identity Image<span className="field__required">*</span>
            </label>
            <ImageDropzone
              inputId="identity-image-input"
              hint="JPG, JPEG, PNG < 1MB (2:1)"
              preview={identityImagePreview}
              onSelect={handleIdentityImageSelect}
              onRemove={() => {
                setIdentityImageFile(null);
                setIdentityImagePreview(null);
                setRemoveIdentityImage(true);
              }}
              previewShape="square"
              removeStyle="corner"
              align="left"
            />
          </div>
        </SectionCard>

        <div className="ed-actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? "Updating…" : "Update Driver"}
          </button>
        </div>
      </form>
    </div>
  );
}
