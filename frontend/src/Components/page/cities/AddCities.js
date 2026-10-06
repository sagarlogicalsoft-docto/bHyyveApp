import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import "./addCities.css";

const AddCities = () => {
  const [cityName, setCityName] = useState("");

  // =========================================================
  // ADD CITY
  // =========================================================

  const handleAddCity = (event) => {
    event.preventDefault();

    const trimmedCityName = cityName.trim();

    if (!trimmedCityName) {
      alert("Please enter city name.");
      return;
    }

    console.log("Add City:", {
      cityName: trimmedCityName,
    });

    // =======================================================
    // API CALL WILL BE CONNECTED HERE LATER
    // =======================================================

    alert("City added successfully.");

    setCityName("");
  };

  return (
    <div className="add-cities-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="add-cities-header">

        <div>
          <h2 className="add-cities-title">
            Add New City
          </h2>

          <div className="add-cities-breadcrumb">

            <Link to="/home">
              Home
            </Link>

            <IoIosArrowForward />

            <span>
              Add City
            </span>

          </div>
        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="add-cities-card">

        <div className="add-cities-card-header">
          <h3>
            Add City
          </h3>

          <p>
            Enter the city name you want to add.
          </p>
        </div>

        <form
          className="add-cities-form"
          onSubmit={handleAddCity}
        >

          {/* =================================================
              CITY NAME
          ================================================= */}

          <div className="add-cities-field">

            <label htmlFor="cityName">
              City Name
              <span>*</span>
            </label>

            <input
              id="cityName"
              type="text"
              placeholder="Enter city name"
              value={cityName}
              onChange={(event) =>
                setCityName(event.target.value)
              }
            />

          </div>

          {/* =================================================
              ACTION
          ================================================= */}

          <div className="add-cities-actions">

            <button
              type="submit"
              className="add-cities-add-button"
            >
              Add City
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddCities;