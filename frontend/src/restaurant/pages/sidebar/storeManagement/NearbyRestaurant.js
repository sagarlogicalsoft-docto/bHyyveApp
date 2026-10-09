import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  FaMapMarkedAlt,
  FaEdit,
  FaInfoCircle,
  FaSave,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";

import api from "../../../../config/api";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";
import Breadcrumbs from "../../common/BreadCrumbs";

import "./nearbyRestaurant.css";

const NearbyRestaurant = () => {
  const [nearbyRadius, setNearbyRadius] = useState("");
  const [status, setStatus] = useState(false);
  const [createdAt, setCreatedAt] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // MODAL STATES
  // =========================================================
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // =========================================================
  // FORMAT DATE
  // =========================================================
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${formattedDate}, ${formattedTime}`;
  };

  // =========================================================
  // GET NEARBY KM
  // =========================================================
  const fetchNearbyKm = async () => {
    try {
      setLoading(true);

      const response = await api.get("/restaurant/nearby-km");

      if (response.data?.success) {
        const data = response.data.data;

        setNearbyRadius(
          data?.nearby_km !== undefined && data?.nearby_km !== null
            ? Number(data.nearby_km).toFixed(2)
            : ""
        );

        setStatus(Number(data?.status) === 1);

        setCreatedAt(formatDate(data?.created_at));
        setLastUpdated(formatDate(data?.updated_at));
      } else {
        toast.error(
          response.data?.message ||
            "Failed to fetch nearby restaurant setting."
        );
      }
    } catch (error) {
      console.error("Get Nearby KM Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch nearby restaurant setting."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD SETTING
  // =========================================================
  useEffect(() => {
    fetchNearbyKm();
  }, []);

  // =========================================================
  // RADIUS INPUT
  // =========================================================
  const handleRadiusChange = (e) => {
    const value = e.target.value;

    // Allow empty value while editing
    if (value === "") {
      setNearbyRadius("");
      return;
    }

    // Allow numbers with up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setNearbyRadius(value);
    }
  };

  // =========================================================
  // SAVE BUTTON
  // Validate first, then open confirmation modal
  // =========================================================
  const handleSave = () => {
    const radius = Number(nearbyRadius);

    if (!nearbyRadius || Number.isNaN(radius)) {
      toast.error("Please enter a valid nearby radius.");
      return;
    }

    if (radius <= 0) {
      toast.error("Nearby radius must be greater than 0 KM.");
      return;
    }

    setShowConfirmModal(true);
  };

  // =========================================================
  // CONFIRM SAVE / PATCH
  // =========================================================
  const handleConfirmSave = async () => {
    const radius = Number(nearbyRadius);

    try {
      setSaving(true);

      const response = await api.patch("/restaurant/nearby-km", {
        nearby_km: radius,
        status: status ? 1 : 0,
      });

      if (response.data?.success) {
        setNearbyRadius(radius.toFixed(2));

        // Close confirmation modal
        setShowConfirmModal(false);

        // Open success modal
        setShowSuccessModal(true);
      } else {
        toast.error(
          response.data?.message ||
            "Failed to update nearby restaurant setting."
        );
      }
    } catch (error) {
      console.error("Update Nearby KM Error:", error);

      const backendErrors = error.response?.data?.errors;

      if (backendErrors?.nearby_km) {
        toast.error(backendErrors.nearby_km);
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to update nearby restaurant setting."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SUCCESS MODAL CLOSE
  // Refresh data from backend after successful update
  // =========================================================
  const handleSuccessClose = async () => {
    setShowSuccessModal(false);

    await fetchNearbyKm();
  };

  return (
    <>
     <div className="breadcrumb-wrapper">
      <Breadcrumbs
        items={[
          {
            label: "Store Management",
          },
          {
            label: "Nearby Restaurant",
          },
        ]}
      />
    </div>
    <div className="nearby-restaurant-page">

      {/* Page Header */}
      <div className="nearby-page-header">
        <div className="nearby-title-wrapper">
          <div className="nearby-title-icon">
            <FaMapMarkedAlt />
          </div>

          <div>
            <h1>Restaurant Nearby KM Setting</h1>

            <p>
              Set the radius within which nearby restaurants will be shown to
              customers.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          INITIAL LOADING
          ===================================================== */}
      {loading ? (
        <div className="nearby-loading-container">
          <div className="nearby-loading-content">
            <FaSpinner className="nearby-loading-spinner" />

            <span className="nearby-loading-text">
              Loading nearby restaurant settings...
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Current Radius Card */}
          <div className="nearby-current-card">
            <div className="nearby-current-radius">
              {Number(nearbyRadius || 0).toFixed(1)}
            </div>

            <div className="nearby-current-label">
              Current Nearby Radius
            </div>

            <div
              className={`nearby-status-badge ${
                status ? "active" : "inactive"
              }`}
            >
              <FaCheck />

              {status ? "Active" : "Inactive"}
            </div>
          </div>

          {/* Update Card */}
          <div className="nearby-form-card">
            {/* Card Header */}
            <div className="nearby-form-header">
              <div className="nearby-form-title">
                <FaEdit />
                <span>Update Nearby KM</span>
              </div>
            </div>

            <div className="nearby-form-divider"></div>

            {/* Information */}
            <div className="nearby-info-box">
              <div className="nearby-info-icon">
                <FaInfoCircle />
              </div>

              <div className="nearby-info-text">
                This is a global setting. Only one value exists and it applies
                to all restaurants. Changes take effect immediately.
              </div>
            </div>

            {/* Radius Input */}
            <div className="nearby-form-group">
              <label htmlFor="nearbyRadius">
                Nearby Radius (KM) <span>*</span>
              </label>

              <div className="nearby-input-wrapper">
                <input
                  id="nearbyRadius"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={nearbyRadius}
                  onChange={handleRadiusChange}
                  placeholder="Enter radius"
                  disabled={saving}
                />

                <span className="nearby-input-unit">
                  KM
                </span>
              </div>

              <p className="nearby-input-help">
                Enter distance in kilometers (e.g. 5, 10.5, 2.5)
              </p>
            </div>

            {/* Status */}
            <div className="nearby-status-row">
              <div className="nearby-status-label">
                Status
              </div>

              <button
                type="button"
                className={`nearby-toggle ${
                  status ? "active" : ""
                }`}
                onClick={() => setStatus(!status)}
                disabled={saving}
                aria-label="Toggle restaurant nearby setting status"
              >
                <span className="nearby-toggle-circle"></span>
              </button>

              <span
                className={`nearby-status-text ${
                  status ? "active" : "inactive"
                }`}
              >
                {status ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Dates */}
            <div className="nearby-date-row">
              <div className="nearby-date-item">
                <span className="nearby-date-label">
                  Created At
                </span>

                <span className="nearby-date-value">
                  {createdAt || "-"}
                </span>
              </div>

              <div className="nearby-date-item">
                <span className="nearby-date-label">
                  Last Updated
                </span>

                <span className="nearby-date-value">
                  {lastUpdated || "-"}
                </span>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="button"
              className="nearby-save-button"
              onClick={handleSave}
              disabled={saving}
            >
              <FaSave />
              <span>Save Changes</span>
            </button>
          </div>
        </>
      )}

      {/* =====================================================
          CONFIRMATION MODAL
          ===================================================== */}
      <ConfirmModal
        show={showConfirmModal}
        title="Update Nearby KM"
        message="Are you sure you want to update the nearby restaurant radius?"
        confirmText="Update"
        cancelText="Cancel"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmModal(false)}
        loading={saving}
      />

      {/* =====================================================
          SUCCESS MODAL
          ===================================================== */}
      <SuccessModal
        show={showSuccessModal}
        title="Success!"
        message="Nearby restaurant setting updated successfully."
        buttonText="OK"
        onClose={handleSuccessClose}
      />
    </div>
    </>
  );
};

export default NearbyRestaurant;