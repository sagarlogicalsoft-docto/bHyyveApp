import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../config/api";
import "./viewDriver.css";
import { getImage } from "../../../../Components/utils/images";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";

// ---- tiny inline icons -------------------------------------------------

const MailIcon = () => (
  <svg
    viewBox="0 0 20 20"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <rect x="2" y="4" width="16" height="12" rx="2" />
    <path d="M3 5.5l7 5 7-5" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor">
    <path d="M4.5 2.5c-1 0-1.8.8-1.7 1.8.4 3.6 2 6.9 4.5 9.4s5.8 4.1 9.4 4.5c1 .1 1.8-.7 1.8-1.7v-2c0-.9-.7-1.6-1.5-1.7l-2.6-.4c-.6-.1-1.2.1-1.6.5l-1 1c-2-1-3.7-2.7-4.7-4.7l1-1c.4-.4.6-1 .5-1.6l-.4-2.6c-.1-.8-.8-1.5-1.7-1.5h-2z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor">
    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm4.2 6.2l-5 5a1 1 0 01-1.4 0l-2-2a1 1 0 111.4-1.4l1.3 1.3 4.3-4.3a1 1 0 011.4 1.4z" />
  </svg>
);

const MinusCircleIcon = () => (
  <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor">
    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm4 9H6a1 1 0 010-2h8a1 1 0 010 2z" />
  </svg>
);

const SignalIcon = () => (
  <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor">
    <path d="M3 15h2v3H3v-3zm4-4h2v7H7v-7zm4-4h2v11h-2V7zm4-4h2v15h-2V3z" />
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

const DocIcon = () => (
  <svg
    viewBox="0 0 20 20"
    width="13"
    height="13"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M6 2h6l4 4v12H6z" />
    <path d="M12 2v4h4" />
  </svg>
);

const CurrencyIcon = () => (
  <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor">
    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.9 4.2v1.1c.9.2 1.6.6 2.1 1.2l-1 .9c-.4-.4-.9-.7-1.6-.8v2.2c1.5.4 2.4 1 2.4 2.3 0 1.3-1 2.1-2.4 2.3v1.1H9.3v-1.1c-1-.2-1.8-.6-2.4-1.3l1-.9c.5.5 1 .8 1.7.9v-2.3c-1.4-.3-2.3-1-2.3-2.2 0-1.2 1-2 2.3-2.2V6.2h1.3z" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor">
    <path d="M10 1c-3 0-5.5 2.4-5.5 5.5C4.5 10.8 10 18 10 18s5.5-7.2 5.5-11.5C15.5 3.4 13 1 10 1zm0 7.3a2 2 0 110-4 2 2 0 010 4z" />
  </svg>
);

// ---- small presentational helpers -----------------------------------

const StatusPill = ({ tone, icon, children }) => (
  <span className={`pill pill--${tone}`}>
    {icon ? (
      <span className="pill__icon">{icon}</span>
    ) : (
      <span className="pill__dot" />
    )}
    {children}
  </span>
);

const InfoRow = ({ label, children }) => (
  <div className="info-row">
    <span className="info-row__label">{label}</span>
    <span className="info-row__value">{children}</span>
  </div>
);

const SectionCard = ({ icon, title, action, children, className = "" }) => (
  <section className={`section-card ${className}`}>
    <header className="section-card__head">
      <h2>
        <span className="section-card__icon">{icon}</span>
        {title}
      </h2>
      {action}
    </header>
    <div className="section-card__body">{children}</div>
  </section>
);

// ---- image lightbox ----------------------------------------------------

const Lightbox = ({ src, alt, onClose }) => {
  if (!src) return null;
  return (
    <div className="lightbox" onClick={onClose}>
      <button
        className="lightbox__close"
        onClick={onClose}
        aria-label="Close preview"
      >
        &times;
      </button>
      <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
    </div>
  );
};

// ---- helpers -------------------------------------------------------------

const isImageFile = (url) =>
  /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url || "");

// ---- main component -----------------------------------------------------

export default function ViewDriver() {
  const { driverId } = useParams();
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [totalDelivered, setTotalDelivered] = useState(0);
  const [totalDriverEarning, setTotalDriverEarning] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchDriver = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get(`/restaurant/drivers/${driverId}`);

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch driver details");
      }

      setDriver(data.data.driver);
      setDeliveredOrders(data.data.delivered_orders || []);
      setTotalDelivered(data.data.total_delivered || 0);
      setTotalDriverEarning(data.data.total_driver_earning || 0);
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

  // ---- actions (stubbed against the same api client) ---------------------

  const openStatusConfirm = () => {
    setShowConfirmModal(true);
  };

  const toggleActiveStatus = async () => {
    if (!driver) return;

    const nextStatus = Number(driver.status) === 1 ? 0 : 1;

    setActionLoading(true);
    setError(null);

    try {
      const { data } = await api.patch(
        `/restaurant/drivers/${driverId}/status`,
        {
          status: nextStatus,
        },
      );

      if (!data.success) {
        throw new Error(data.message || "Couldn't update driver status.");
      }

      setDriver((prev) => ({
        ...prev,
        status: nextStatus,
      }));

      setShowConfirmModal(false);

      setSuccessMessage(
        nextStatus === 1
          ? "Driver has been activated successfully."
          : "Driver has been deactivated successfully.",
      );

      setShowSuccessModal(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Couldn't update driver status.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ---- render states ------------------------------------------------------

  if (loading) {
    return (
      <div className="driver-view">
        <div className="driver-view__skeleton">
          <div className="sk sk--header" />
          <div className="driver-view__grid">
            <div className="sk sk--card sk--tall" />
            <div className="driver-view__main">
              <div className="sk sk--card" />
              <div className="sk sk--card" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !driver) {
    return (
      <div className="driver-view">
        <div className="state-panel state-panel--error">
          <div className="state-panel__icon">!</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <div className="state-panel__actions">
            <button
              className="btn btn--ghost"
              onClick={() => navigate("/driver_list")}
            >
              Back to list
            </button>
            <button className="btn btn--primary" onClick={fetchDriver}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="driver-view">
        <div className="state-panel">
          <h2>Driver not found</h2>
          <p>This driver may have been removed.</p>
          <button
            className="btn btn--primary"
            onClick={() => navigate("/drivers")}
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  const {
    first_name,
    last_name,
    email,
    phone,
    country_code,
    status,
    is_available,
    profile_image,
    identity_type,
    identity_number,
    identity_image,
    cv_uploads,
    total_trip,
    complete_trip,
    cancel_trip,
    created_at,
    address,
    lat,
    long,
  } = driver;

  const fullName = `${first_name || ""} ${last_name || ""}`.trim();
  const isActive = Number(status) === 1;
  const isOnline = Number(is_available) === 1;

  const initials = (fullName || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="driver-view">
      {/* top bar */}
      <div className="driver-view__topbar">
        <div>
          <h1>Driver details</h1>
        </div>
        <div className="driver-view__topbar-actions">
          <button
            className={`btn ${isActive ? "btn--deactivate" : "btn--activate"}`}
            disabled={actionLoading}
            onClick={openStatusConfirm}
          >
            {isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            className="btn btn--ghost"
            onClick={() => navigate("/restaurant/driver_list")}
          >
            Back to list
          </button>
          <button
            className="btn btn--primary"
            onClick={() => navigate(`/restaurant/edit_driver/${driverId}`)}
          >
            Edit driver
          </button>
        </div>
      </div>

      {error && (
        <div className="inline-error">
          {error}
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      <div className="driver-view__grid">
        {/* left: identity card */}
        <aside className="profile-card">
          <div
            className="profile-card__avatar"
            onClick={() =>
              profile_image && setPreviewImage(getImage(profile_image))
            }
          >
            {profile_image ? (
              <img src={getImage(profile_image)} alt={fullName} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <h2 className="profile-card__name">{fullName}</h2>
          <div className="profile-card__pills">
            <StatusPill
              tone={isActive ? "positive" : "inactive"}
              icon={isActive ? <CheckCircleIcon /> : <MinusCircleIcon />}
            >
              {isActive ? "Active" : "Inactive"}
            </StatusPill>

            <StatusPill
              tone={isOnline ? "live" : "neutral"}
              icon={isOnline ? <SignalIcon /> : null}
            >
              {isOnline ? "Online" : "Offline"}
            </StatusPill>
          </div>
          <div className="profile-card__contact">
            <a href={`mailto:${email}`} className="contact-link">
              <MailIcon /> {email}
            </a>
            <a
              href={`tel:${country_code || ""}${phone || ""}`}
              className="contact-link"
            >
              <PhoneIcon /> {country_code || ""} {phone || ""}
            </a>
          </div>

          <div className="profile-card__stats">
            <div>
              <strong>{total_trip || 0}</strong>
              <span>Total</span>
            </div>

            <div>
              <strong className="text-positive">{complete_trip || 0}</strong>
              <span>Completed</span>
            </div>

            <div>
              <strong className="text-danger">{cancel_trip || 0}</strong>
              <span>Cancelled</span>
            </div>
          </div>

          {created_at && (
            <p className="profile-card__joined">
              Joined{" "}
              {new Date(created_at).toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </aside>

        {/* right: detail sections */}
        <div className="driver-view__main">
          <SectionCard icon={<UserIcon />} title="Personal information">
            <InfoRow label="Full name">{fullName || "—"}</InfoRow>
            <InfoRow label="Email">{email || "—"}</InfoRow>
            <InfoRow label="Phone">
              {phone ? `${country_code || ""} ${phone}` : "—"}
            </InfoRow>
            <InfoRow label="Status">
              <StatusPill
                tone={isActive ? "positive" : "inactive"}
                icon={isActive ? <CheckCircleIcon /> : <MinusCircleIcon />}
              >
                {isActive ? "Active" : "Inactive"}
              </StatusPill>
            </InfoRow>
            <InfoRow label="Registered on">
              {created_at
                ? new Date(created_at).toLocaleString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </InfoRow>
          </SectionCard>

          <SectionCard icon={<IdCardIcon />} title="Identity information">
            <InfoRow label="Identity type">
              {identity_type === "passport"
                ? "Passport"
                : identity_type === "driving_license"
                  ? "Driving License"
                  : identity_type === "nid"
                    ? "National ID"
                    : identity_type || "—"}
            </InfoRow>
            <InfoRow label="Identity number">{identity_number || "—"}</InfoRow>
            <InfoRow label="Identity image">
              {identity_image ? (
                <button
                  className="thumb-btn"
                  onClick={() => setPreviewImage(getImage(identity_image))}
                >
                  <img src={getImage(identity_image)} alt="Identity document" />
                </button>
              ) : (
                "—"
              )}
            </InfoRow>
          </SectionCard>

          <SectionCard icon={<DocIcon />} title="CV / Resume">
            {cv_uploads ? (
              isImageFile(cv_uploads) ? (
                <button
                  className="thumb-btn thumb-btn--cv"
                  onClick={() => setPreviewImage(getImage(cv_uploads))}
                >
                  <img src={getImage(cv_uploads)} alt="CV / Resume" />
                </button>
              ) : (
                <a
                  className="btn btn--ghost"
                  href={getImage(cv_uploads)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Resume
                </a>
              )
            ) : (
              <p className="muted">No CV uploaded yet.</p>
            )}
          </SectionCard>

          <SectionCard icon={<CurrencyIcon />} title="Driver earnings">
            <InfoRow label="Total delivered orders">
              <span className="chip chip--positive">
                {totalDelivered} orders
              </span>
            </InfoRow>

            <InfoRow label="Earning per order">$5.00</InfoRow>

            <InfoRow label="Total earning">
              <strong className="text-positive">
                ${Number(totalDriverEarning).toFixed(2)}
              </strong>
            </InfoRow>
          </SectionCard>
        </div>
      </div>

      {/* full-width address & map section */}
      <SectionCard
        icon={<PinIcon />}
        title="Address &amp; location"
        className="address-card--full"
      >
        <div className="address-block">
          <span className="address-block__label">Registered Address</span>
          <p className="address-line">
            <PinIcon />
            {address || "No address on file."}
          </p>
        </div>

        {lat && long && (
          <div className="map-embed map-embed--full">
            <iframe
              title="driver-location"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${lat},${long}&z=15&output=embed`}
            />
          </div>
        )}
      </SectionCard>

      <Lightbox
        src={previewImage}
        alt="Preview"
        onClose={() => setPreviewImage(null)}
      />
      <ConfirmModal
        show={showConfirmModal}
        title={isActive ? "Deactivate Driver" : "Activate Driver"}
        message={
          isActive
            ? "Are you sure you want to deactivate this driver?"
            : "Are you sure you want to activate this driver?"
        }
        confirmText={isActive ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        onConfirm={toggleActiveStatus}
        onCancel={() => setShowConfirmModal(false)}
        loading={actionLoading}
      />
      <SuccessModal
        show={showSuccessModal}
        title="Success!"
        message={successMessage}
        buttonText="OK"
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
