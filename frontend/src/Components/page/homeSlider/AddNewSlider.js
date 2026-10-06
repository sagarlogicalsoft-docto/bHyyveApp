import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import "./addNewSlider.css";

const AddNewSlider = () => {
  const [imageFile, setImageFile] = useState(null);

  // =========================================================
  // SELECT IMAGE
  // =========================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImageFile(null);
      return;
    }

    setImageFile(file);
  };

  // =========================================================
  // ADD SLIDER
  // =========================================================

  const handleAddSlider = (event) => {
    event.preventDefault();

    if (!imageFile) {
      alert("Please select an image file.");
      return;
    }

    console.log("Add New Slider:", {
      image: imageFile,
    });

    // =======================================================
    // API CALL WILL COME HERE LATER
    // =======================================================

    alert("Slider added successfully.");

    setImageFile(null);

    // Reset file input
    event.target.reset();
  };

  return (
    <div className="add-new-slider-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="add-new-slider-header">

        <h2 className="add-new-slider-title">
          Add New Slider
        </h2>

        {/* ===================================================
            BREADCRUMB
        =================================================== */}

        <div className="add-new-slider-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <Link to="/manage-slider">
            Manage Slider
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="add-new-slider-breadcrumb-active">
            Add New Slider
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="add-new-slider-card">

        <div className="add-new-slider-card-header">
          <h3>
            Add New Slider
          </h3>
        </div>

        {/* ===================================================
            FORM
        =================================================== */}

        <form
          className="add-new-slider-form"
          onSubmit={handleAddSlider}
        >

          {/* =================================================
              IMAGE
          ================================================= */}

          <div className="add-new-slider-form-group">

            <label htmlFor="sliderImage">
              Select Image File
            </label>

            <input
              id="sliderImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

          </div>

          {/* =================================================
              SELECTED FILE NAME
          ================================================= */}

          {imageFile && (
            <div className="add-new-slider-selected-file">
              Selected: {imageFile.name}
            </div>
          )}

          {/* =================================================
              BUTTON
          ================================================= */}

          <div className="add-new-slider-form-footer">

            <button
              type="submit"
              className="add-new-slider-add-btn"
            >
              Add
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default AddNewSlider;