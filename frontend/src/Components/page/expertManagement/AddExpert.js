import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaPlus, FaTimes } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";

import "./addExpert.css";
import api from "../../../config/api";

const AddExpert = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    expert: "",
    category: "",
    subCategory: "",
    expertName: "",
    experience: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const fetchExpertFormData = async () => {
    try {
      const response = await api.get("/expert/form-data");

      console.log("Expert Form Data:", response.data);

      if (response.data.success) {
        setVendors(response.data.data.vendors || []);
        setCategories(response.data.data.categories || []);
        setSubCategories(response.data.data.subCategories || []);
      } else {
        toast.error(response.data.message || "Failed to load form data");
      }
    } catch (error) {
      console.error("Expert form data error:", error);

      toast.error(
        error.response?.data?.message || "Failed to load expert form data",
      );
    }
  };

  useEffect(() => {
    fetchExpertFormData();
  }, []);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // IMAGE
  // =========================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFormData((previous) => ({
      ...previous,
      image: file,
    }));

    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setFormData((previous) => ({
      ...previous,
      image: null,
    }));

    setImagePreview("");

    const fileInput = document.getElementById("expert-image");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // =========================================================
  // SUBMIT API
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.image) {
      toast.error("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("name", formData.expertName);
      data.append("exp", formData.experience);
      data.append("vendor_id", formData.expert);
      data.append("category_id", formData.category);
      data.append("scat_id", formData.subCategory);
      data.append("image", formData.image);

      const response = await api.post("/expert/save-new-expert", data);

      console.log("Save Expert Response:", response.data);

      if (response.data.success) {
        toast.success(response.data.message);

        setTimeout(() => {
          navigate("/view_experts");
        }, 1000);
      } else {
        toast.error(response.data.message || "Expert could not be saved");
      }
    } catch (error) {
      console.error("Save Expert Error:", error);

      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {
    setFormData({
      expert: "",
      category: "",
      subCategory: "",
      expertName: "",
      experience: "",
      image: null,
    });

    setImagePreview("");

    const fileInput = document.getElementById("expert-image");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="add-expert-page">
      <Toaster position="top-right" />

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="add-expert-page-header">
        <div>
          <h2 className="add-expert-page-title">Add New Expert</h2>

          <div className="add-expert-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <Link to="/expert/view">Expert Management</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="add-expert-breadcrumb-active">Add Expert</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          FORM CARD
      ===================================================== */}

      <div className="add-expert-card">
        <div className="add-expert-card-header">
          <div>
            <h3>Add New Expert</h3>

            <p>Enter the required information to add a new expert.</p>
          </div>
        </div>

        <form className="add-expert-form" onSubmit={handleSubmit}>
          {/* =================================================
              ROW 1
          ================================================= */}

          <div className="add-expert-form-row">
            {/* SELECT EXPERT */}

            <div className="add-expert-form-group">
              <label htmlFor="expert">
                Select Vendor
                <span className="required">*</span>
              </label>

              <select
                id="expert"
                name="expert"
                value={formData.expert}
                onChange={handleChange}
                required
              >
                <option value="">Select Vendor</option>

                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SELECT CATEGORY */}

            <div className="add-expert-form-group">
              <label htmlFor="category">
                Select Category
                <span className="required">*</span>
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">.. Select Category ..</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* =================================================
              ROW 2
          ================================================= */}

          <div className="add-expert-form-row">
            {/* SELECT SUB CATEGORY */}

            <div className="add-expert-form-group">
              <label htmlFor="subCategory">
                Select Sub Category
                <span className="required">*</span>
              </label>

              <select
                id="subCategory"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                required
              >
                <option value="">.. Select Sub Category ..</option>

                {subCategories
                  .filter(
                    (subCategory) =>
                      !formData.category ||
                      String(subCategory.cat_id) === String(formData.category),
                  )
                  .map((subCategory) => (
                    <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* EXPERT NAME */}

            <div className="add-expert-form-group">
              <label htmlFor="expertName">
                Expert Name
                <span className="required">*</span>
              </label>

              <input
                type="text"
                id="expertName"
                name="expertName"
                value={formData.expertName}
                onChange={handleChange}
                placeholder="Enter expert name"
                required
              />
            </div>
          </div>

          {/* =================================================
              ROW 3
          ================================================= */}

          <div className="add-expert-form-row">
            {/* EXPERIENCE */}

            <div className="add-expert-form-group">
              <label htmlFor="experience">
                Experience
                <span className="required">*</span>
              </label>

              <div className="add-expert-experience-wrapper">
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Enter experience"
                  required
                />
              </div>
            </div>

            {/* IMAGE */}

            <div className="add-expert-form-group">
              <label htmlFor="expert-image">Select Image File</label>

              <div className="add-expert-upload-area">
                {!imagePreview ? (
                  <>
                    <input
                      type="file"
                      id="expert-image"
                      accept="image/*"
                      onChange={handleImageChange}
                    />

                    <label
                      htmlFor="expert-image"
                      className="add-expert-upload-label"
                    >
                      <FaCloudUploadAlt />

                      <span>Choose Image</span>

                      <small>JPG, PNG, WEBP</small>
                    </label>
                  </>
                ) : (
                  <div className="add-expert-image-preview">
                    <img src={imagePreview} alt="Expert preview" />

                    <button
                      type="button"
                      onClick={removeImage}
                      className="add-expert-remove-image"
                      title="Remove Image"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              FORM ACTIONS
          ================================================= */}

          <div className="add-expert-form-actions">
            <button
              type="button"
              className="add-expert-reset-btn"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>

            <button
              type="submit"
              className="add-expert-save-btn"
              disabled={loading}
            >
              <FaPlus />

              <span>{loading ? "Saving..." : "Save Expert"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpert;
