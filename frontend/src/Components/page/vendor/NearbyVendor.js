import React, { useEffect, useState } from "react";

import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";

import api from "../../../config/api";

import "./nearbyVendor.css";

// =========================================================
// API SERVICE LAYER
// =========================================================

// GET EXISTING VENDOR RADIUS
const getVendorRadiusApi = async () => {
  const response = await api.get("/admin/vendor-radius");
  return response.data;
};

// ADD / UPDATE VENDOR RADIUS
const saveNearbyRadiusApi = async (radius, vendorId) => {
  const response = await api.post("/admin/vendor-radius", {
    redius: radius,
    vendor_id: vendorId,
  });

  return response.data;
};

const NearbyVendor = () => {
  const [radius, setRadius] = useState("");
  const [vendorId, setVendorId] = useState("");

  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");

  const [loadingRadius, setLoadingRadius] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // =========================================================
  // GET EXISTING VENDOR RADIUS
  // =========================================================

  useEffect(() => {
    const fetchVendorRadius = async () => {
      try {
        setLoadingRadius(true);
        setApiError("");

        const response = await getVendorRadiusApi();

        if (response?.success) {
          const vendorData = response.data;

          if (vendorData) {
            setVendorId(vendorData.id ?? "");

            // DB value may be "10 KM"; input type="number"
            // must receive only the numeric portion.
            const savedRadius = String(vendorData.redius ?? "")
              .replace(/km/gi, "")
              .trim();

            setRadius(savedRadius);
          } else {
            // No record exists: next save will INSERT.
            setVendorId("");
            setRadius("");
          }
        } else {
          setApiError(response?.message || "Failed to fetch vendor radius.");
        }
      } catch (err) {
        console.error("Get vendor radius error:", err);

        setApiError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch vendor radius.",
        );
      } finally {
        setLoadingRadius(false);
      }
    };

    fetchVendorRadius();
  }, []);

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    setRadius(event.target.value);

    if (error) {
      setError("");
    }

    if (apiError) {
      setApiError("");
    }
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validate = () => {
    if (!radius.trim()) {
      setError("Please enter radius in KM.");
      return false;
    }

    if (!Number.isFinite(Number(radius)) || Number(radius) < 1) {
      setError("Radius must be at least 1 KM.");
      return false;
    }

    return true;
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setApiError("");

    if (!validate()) {
      document.getElementById("radius")?.focus();
      return;
    }

    try {
      setSaving(true);

      const response = await saveNearbyRadiusApi(radius, vendorId);

      if (response?.success) {
        setSuccessMessage(
          response.message || `Radius set to ${radius} KM successfully.`,
        );

        setShowSuccess(true);
      } else {
        setApiError(response?.message || "Failed to save radius.");
      }
    } catch (err) {
      console.error("Save vendor radius error:", err);

      setApiError(
        err.response?.data?.message || err.message || "Failed to save radius.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {
    setRadius("");
    setError("");
    setApiError("");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="nearby-vendor-page">
      <h2 className="nearby-vendor-page-title">Add Nearby</h2>

      <ServiceBreadcrumbs
        className="nearby-vendor-breadcrumb"
        items={[{ label: "Nearby Vendor" }]}
      />

      <div className="nearby-vendor-card">
        <div className="nearby-vendor-card-header">
          <h3>Add Radius All Vendor</h3>
          <p>Set the distance in kilometres that applies to all vendors.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {apiError && (
            <div className="nearby-vendor-alert" role="alert">
              {apiError}
            </div>
          )}

          <div className="nearby-vendor-form">
            <div className="nearby-vendor-field">
              <label htmlFor="radius">
                Radius (KM) <span>*</span>
              </label>

              <div
                className={`nearby-vendor-input-wrap ${
                  error ? "has-error" : ""
                }`}
              >
                <input
                  id="radius"
                  name="radius"
                  type="number"
                  min="1"
                  step="0.1"
                  inputMode="decimal"
                  value={radius}
                  onChange={handleChange}
                  placeholder={
                    loadingRadius
                      ? "Loading saved radius..."
                      : "Enter radius in KM"
                  }
                  disabled={loadingRadius || saving}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "radius-error" : undefined}
                />

                <span className="nearby-vendor-unit">KM</span>
              </div>

              {error && (
                <small className="nearby-vendor-error" id="radius-error">
                  {error}
                </small>
              )}
            </div>
          </div>

          <div className="nearby-vendor-actions">
            <button
              type="submit"
              className="nearby-vendor-update-btn"
              disabled={loadingRadius || saving}
            >
              {saving && (
                <span className="nearby-vendor-spinner" aria-hidden="true" />
              )}

              {loadingRadius
                ? "Loading..."
                : saving
                  ? "Saving..."
                  : "Add / Update"}
            </button>

            <button
              type="button"
              className="nearby-vendor-reset-btn"
              onClick={handleReset}
              disabled={loadingRadius || saving}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <ServiceSuccessModal
        isOpen={showSuccess}
        title="Radius saved"
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default NearbyVendor;
