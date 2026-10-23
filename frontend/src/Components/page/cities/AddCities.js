import React, { useCallback, useState } from "react";
import { MdLocationCity } from "react-icons/md";
import api from "../../../config/api";
import ServiceBreadcrumbs from "../../../Components/common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../../Components/common/modal/serviceModal/ServiceSuccessModal";

import "./addCities.css";

// =========================================================
// API SERVICE (kept inline; move to a service layer later)
// =========================================================

const addCityRequest = (cityName) =>
  api.post("/admin/service_side_cities/add", {
    city_name: cityName,
    save: "new_city",
  });

const AddCities = () => {
  const [cityName, setCityName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Stable reference so the modal's auto-close timer isn't reset on re-render
  const closeSuccess = useCallback(() => setShowSuccess(false), []);

  // =========================================================
  // ADD CITY
  // =========================================================

  const handleAddCity = async (event) => {
    event.preventDefault();

    const trimmedCityName = cityName.trim();

    setErrorMessage("");

    if (!trimmedCityName) {
      setErrorMessage("Please enter city name.");
      return;
    }

    try {
      setLoading(true);

      const response = await addCityRequest(trimmedCityName);

      if (response.data?.success) {
        setSuccessMessage(response.data.message || "City added successfully.");
        setShowSuccess(true);
        setCityName("");
      } else {
        setErrorMessage(response.data?.message || "Unable to add city.");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setErrorMessage("City already exists.");
      } else {
        setErrorMessage(
          error.response?.data?.message ||
            "Unable to add city. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-cities-page">
      {/* PAGE HEADER */}

      <div className="add-cities-header">
        <h2 className="add-cities-title">Add New City</h2>
        <ServiceBreadcrumbs items={[{ label: "Add City" }]} />
      </div>

      {/* MAIN CARD */}

      <div className="add-cities-card">
        <div className="add-cities-card-header">
          <span className="add-cities-card-icon" aria-hidden="true">
            <MdLocationCity />
          </span>

          <div>
            <h3>City Details</h3>
            <p>Enter the city name you want to add to the service area.</p>
          </div>
        </div>

        <form className="add-cities-form" onSubmit={handleAddCity} noValidate>
          {/* CITY NAME */}

          <div className="add-cities-field">
            <label htmlFor="cityName">
              City Name
              <span>*</span>
            </label>

            <div
              className={`add-cities-input-wrap${
                errorMessage ? " add-cities-input-wrap--error" : ""
              }`}
            >
              <MdLocationCity className="add-cities-input-icon" aria-hidden="true" />

              <input
                id="cityName"
                type="text"
                placeholder="e.g. Bhopal"
                value={cityName}
                onChange={(event) => {
                  setCityName(event.target.value);
                  setErrorMessage("");
                }}
                disabled={loading}
                aria-invalid={Boolean(errorMessage)}
                autoComplete="off"
              />
            </div>

            {errorMessage && (
              <p className="add-cities-error" role="alert">
                {errorMessage}
              </p>
            )}
          </div>

          {/* ACTIONS */}

          <div className="add-cities-actions">
            <button
              type="submit"
              className="add-cities-add-button"
              disabled={loading}
            >
              {loading && <span className="add-cities-spinner" aria-hidden="true" />}
              {loading ? "Adding..." : "Add City"}
            </button>

            <button
              type="button"
              className="add-cities-clear-button"
              onClick={() => {
                setCityName("");
                setErrorMessage("");
              }}
              disabled={loading || !cityName}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* SUCCESS MODAL */}

      <ServiceSuccessModal
        isOpen={showSuccess}
        title="City Added!"
        message={successMessage}
        onClose={closeSuccess}
      />
    </div>
  );
};

export default AddCities;