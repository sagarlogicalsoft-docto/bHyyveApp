import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaPlus, FaTimes } from "react-icons/fa";

import "./addImages.css";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const AddImages = () => {
  const navigate = useNavigate();

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    vendor: "",
    title: "",
    image: null,
    description: "",
  });

  // Image preview
  const [imagePreview, setImagePreview] = useState("");

  // =========================================================
  // VENDOR API STATE
  // =========================================================

  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);

  // =========================================================
  // GET VENDORS
  // =========================================================

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);

      const response = await fetch(`${BASE_URL}/vendor/vendors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      console.log("VENDORS API RESPONSE:", result);

      if (!response.ok || !result.success) {
        throw new Error(
          result?.message || "Failed to fetch vendors"
        );
      }

      setVendors(result.data || []);
    } catch (error) {
      console.error("Fetch vendors error:", error);
    } finally {
      setLoadingVendors(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "image") {
      const selectedFile = files?.[0] || null;

      setFormData((previous) => ({
        ...previous,
        image: selectedFile,
      }));

      if (selectedFile) {
        setImagePreview(URL.createObjectURL(selectedFile));
      } else {
        setImagePreview("");
      }

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("category", "");
      formDataToSend.append("name", formData.title);
      formDataToSend.append("vimage", "vimage");
      formDataToSend.append("vendor_id", formData.vendor);
      formDataToSend.append("description", formData.description);

      if (formData.image) {
        formDataToSend.append("file", formData.image);
      }

      const response = await fetch(
        `${BASE_URL}/admin/vendor-images`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const result = await response.json();

      console.log("ADD VENDOR IMAGE API RESPONSE:", result);

      if (!response.ok || !result.success) {
        throw new Error(
          result?.message || "Failed to add image"
        );
      }

      alert(result.message || "Image Added");

      setFormData({
        vendor: "",
        title: "",
        image: null,
        description: "",
      });

      setImagePreview("");

      // Reset file input
      event.target.reset();

    } catch (error) {
      console.error("Add vendor image error:", error);
      alert(error.message || "Failed to add image");
    }
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    navigate("/all_ven_images");
  };

  return (
    <div className="add-image-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="add-image-page-header">
        <div>
          <h2 className="add-image-page-title">Add Image</h2>

          <div className="add-image-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <Link to="/all_ven_images">
              Manage Slider
            </Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="add-image-breadcrumb-active">
              Add Image
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="add-image-card">

        <div className="add-image-card-header">
          <h3>Add New Image</h3>
        </div>

        {/* ===================================================
            FORM
        =================================================== */}

        <form onSubmit={handleSubmit}>

          <div className="add-image-form-grid">

            {/* =================================================
                SELECT VENDOR
            ================================================= */}

            <div className="add-image-form-group">
              <label htmlFor="vendor">
                Select Vendor <span>*</span>
              </label>

              <select
                id="vendor"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                required
                disabled={loadingVendors}
              >
                <option value="">
                  {loadingVendors
                    ? "Loading Vendors..."
                    : "Select Vendor"}
                </option>

                {vendors.map((vendor) => (
                  <option
                    key={vendor.id}
                    value={vendor.id}
                  >
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* =================================================
                TITLE
            ================================================= */}

            <div className="add-image-form-group">
              <label htmlFor="title">
                Title <span>*</span>
              </label>

              <input
                id="title"
                type="text"
                name="title"
                placeholder="Enter title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* =================================================
                IMAGE
            ================================================= */}

            <div className="add-image-form-group">
              <label htmlFor="image">
                Image <span>*</span>
              </label>

              <div className="add-image-file-row">

                <input
                  id="image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />

                {imagePreview && (
                  <div className="add-image-preview">
                    <img
                      src={imagePreview}
                      alt="Selected"
                      className="add-image-preview-img"
                    />
                  </div>
                )}

              </div>
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="add-image-form-group add-image-description-group">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="5"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* ===================================================
              BUTTONS
          =================================================== */}

          <div className="add-image-submit-wrapper">

            <button
              type="submit"
              className="add-image-submit-btn"
            >
              <FaPlus />
              Add Image
            </button>

            <button
              type="button"
              className="add-image-cancel-btn"
              onClick={handleCancel}
            >
              <FaTimes />
              Cancel
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default AddImages;