import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import "./nearbyVendor.css";

const NearbyVendor = () => {
  const [radius, setRadius] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!radius) {
      alert("Please enter radius in KM.");
      return;
    }

    console.log("Radius:", radius, "KM");

    // API call later
  };

  const handleReset = () => {
    setRadius("");
  };

  return (
    <div className="nearby-vendor-page">
      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="nearby-vendor-page-header">
        <div>
          <h2 className="nearby-vendor-page-title">
            Nearby Vendor
          </h2>

          <div className="nearby-vendor-breadcrumb">
            <Link to="/home">
              Home
            </Link>

            <span className="nearby-vendor-breadcrumb-arrow">
              <IoIosArrowForward />
            </span>

            <span className="nearby-vendor-breadcrumb-active">
              Nearby Vendor
            </span>
          </div>
        </div>
      </div>

      {/* =========================================
          CONTENT CARD
      ========================================= */}

      <div className="nearby-vendor-card">
        <div className="nearby-vendor-card-header">
          <h3>Add Radius All Vendor</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="nearby-vendor-form">
            <div className="nearby-vendor-field">
              <label htmlFor="radius">
                Radius (KM) <span>*</span>
              </label>

              <input
                id="radius"
                name="radius"
                type="number"
                min="1"
                step="0.1"
                value={radius}
                onChange={(event) => setRadius(event.target.value)}
                placeholder="Enter radius in KM"
              />
            </div>
          </div>

          {/* =========================================
              BUTTONS
          ========================================= */}

          <div className="nearby-vendor-actions">
            <button
              type="submit"
              className="nearby-vendor-update-btn"
            >
              Add / Update
            </button>

            <button
              type="button"
              className="nearby-vendor-reset-btn"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NearbyVendor;