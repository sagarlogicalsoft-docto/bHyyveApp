import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import "./addNewPackage.css";

const AddNewPackage = () => {
  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    packageName: "",
    description: "",
    price: "",
    validityDays: "",
  });

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // SAVE PACKAGE
  // =========================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.packageName.trim()) {
      alert("Please enter package name.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please enter description.");
      return;
    }

    if (!formData.price) {
      alert("Please enter price.");
      return;
    }

    if (!formData.validityDays) {
      alert("Please enter validity days.");
      return;
    }

    console.log("Add New Package API Data:", {
      packageName: formData.packageName,
      description: formData.description,
      price: Number(formData.price),
      validityDays: Number(formData.validityDays),
    });

    // =======================================================
    // API CALL WILL BE CONNECTED HERE LATER
    // =======================================================

    alert("Package added successfully.");

    setFormData({
      packageName: "",
      description: "",
      price: "",
      validityDays: "",
    });
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="add-new-package-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="add-new-package-header">

        <h2 className="add-new-package-title">
          Add New Package
        </h2>

        <div className="add-new-package-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="add-new-package-breadcrumb-active">
            Add New Package
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="add-new-package-card">

        <form
          className="add-new-package-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              PACKAGE NAME
          ================================================= */}

          <div className="add-new-package-form-group">

            <label htmlFor="packageName">
              Package Name
            </label>

            <input
              id="packageName"
              name="packageName"
              type="text"
              placeholder="Enter package name"
              value={formData.packageName}
              onChange={handleChange}
            />

          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="add-new-package-form-group">

            <label htmlFor="description">
              Desc
            </label>

            <textarea
              id="description"
              name="description"
              placeholder="Enter package description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
            />

          </div>

          {/* =================================================
              PRICE
          ================================================= */}

          <div className="add-new-package-form-group">

            <label htmlFor="price">
              Price
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter price"
              value={formData.price}
              onChange={handleChange}
            />

          </div>

          {/* =================================================
              VALIDITY DAYS
          ================================================= */}

          <div className="add-new-package-form-group">

            <label htmlFor="validityDays">
              Validity Days (in Numbers)
            </label>

            <input
              id="validityDays"
              name="validityDays"
              type="number"
              min="1"
              step="1"
              placeholder="Enter validity days"
              value={formData.validityDays}
              onChange={handleChange}
            />

          </div>

          {/* =================================================
              SAVE BUTTON
          ================================================= */}

          <div className="add-new-package-submit-wrapper">

            <button
              type="submit"
              className="add-new-package-save-btn"
            >
              Save
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddNewPackage;