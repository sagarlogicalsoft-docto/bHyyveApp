import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCloudUploadAlt,
  FaPlus,
  FaTimes,
  FaRedoAlt,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

import "./addExpert.css";
import api from "../../../config/api";
import ServiceBreadcrumbs from "../../../Components/common/ServiceBreadcrumbs"; 
import ServiceSuccessModal from "../../../Components/common/modal/serviceModal/ServiceSuccessModal";

/* ========================================================
   CONFIG
========================================================= */

const ROUTES = {
  home: "/home",
  expertList: "/expert/view", // breadcrumb + "View experts" button
};

const MAX_IMAGE_SIZE_MB = 2;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const INITIAL_FORM = {
  vendor: "",
  category: "",
  subCategory: "",
  expertName: "",
  experience: "",
  image: null,
};

/* =========================================================
   API SERVICE LAYER (swap endpoints here only)
========================================================= */

const expertService = {
  getFormData: () => api.get("/admin/experts/form-data"),
  saveExpert: (payload) => api.post("/admin/save_expert", payload),
};

const buildExpertPayload = (form) => {
  const data = new FormData();

  data.append("name", form.expertName.trim());
  data.append("exp", form.experience.trim());
  data.append("vendor_id", form.vendor);
  data.append("category_id", form.category);
  data.append("scat_id", form.subCategory);
  data.append("image", form.image);

  return data;
};

/* =========================================================
   COMPONENT
========================================================= */

const AddExpert = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* ---------- load dropdown data ---------- */

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const response = await expertService.getFormData();

        if (response.data.success) {
          setVendors(response.data.data.vendors || []);
          setCategories(response.data.data.categories || []);
          setSubCategories(response.data.data.subCategories || []);
        } else {
          toast.error(response.data.message || "Failed to load form data");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load expert form data",
        );
      } finally {
        setPageLoading(false);
      }
    };

    loadFormData();
  }, []);

  /* ---------- cleanup preview URL ---------- */

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  /* ---------- derived ---------- */

  const filteredSubCategories = useMemo(
    () =>
      subCategories.filter(
        (item) => String(item.cat_id) === String(formData.category),
      ),
    [subCategories, formData.category],
  );

  const completedFields = [
    formData.vendor,
    formData.category,
    formData.subCategory,
    formData.expertName.trim(),
    formData.experience.trim(),
    formData.image,
  ].filter(Boolean).length;

  const progress = Math.round((completedFields / 6) * 100);

  /* =========================================================
     HANDLERS
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
      // sub category depends on category
      ...(name === "category" ? { subCategory: "" } : {}),
    }));

    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const applyImage = (file) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        image: "Only JPG, PNG or WEBP images are allowed",
      }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        image: `Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB`,
      }));
      return;
    }

    setFormData((previous) => ({ ...previous, image: file }));
    setImagePreview(URL.createObjectURL(file));
    setErrors((previous) => ({ ...previous, image: "" }));
  };

  const removeImage = () => {
    setFormData((previous) => ({ ...previous, image: null }));
    setImagePreview("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    applyImage(event.dataTransfer.files?.[0]);
  };

  const validate = () => {
    const next = {};

    if (!formData.vendor) next.vendor = "Select a vendor";
    if (!formData.category) next.category = "Select a category";
    if (!formData.subCategory) next.subCategory = "Select a sub category";
    if (!formData.expertName.trim()) next.expertName = "Enter the expert name";
    if (!formData.experience.trim()) next.experience = "Enter the experience";
    if (!formData.image) next.image = "Upload a profile image";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    removeImage();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      setLoading(true);

      const response = await expertService.saveExpert(
        buildExpertPayload(formData),
      );

      if (response.data.success) {
        setShowSuccess(true);
      } else {
        toast.error(response.data.message || "Expert could not be saved");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    navigate(ROUTES.expertList);
  }, [navigate]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="add-expert-page">
      <Toaster position="top-right" />

      {/* ---------- PAGE HEADER ---------- */}

      <header className="add-expert-header">
        <div>
          <h2 className="add-expert-page-title">Add New Expert</h2>

          <ServiceBreadcrumbs
            items={[
              { label: "Expert Management" },
              { label: "Add Expert" },
            ]}
          />
        </div>

      </header>

      {/* ---------- FORM CARD ---------- */}

        <div className="add-expert-card">
          <div className="add-expert-card-header">
            <h3>Expert details</h3>
           <p>Fill in the details below to add a new expert to your platform.</p>

            <div
              className="add-expert-progress"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Form completion"
            >
              <div
                className="add-expert-progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form className="add-expert-form" onSubmit={handleSubmit} noValidate>
            {pageLoading && (
              <p className="add-expert-loading-note">Loading form options…</p>
            )}

            <h4 className="add-expert-section-title">Assignment</h4>

            <div className="add-expert-form-row">
              <div
                className={`add-expert-form-group ${errors.vendor ? "has-error" : ""}`}
              >
                <label htmlFor="vendor">
                  Vendor<span className="required">*</span>
                </label>

                <select
                  id="vendor"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                  disabled={pageLoading}
                >
                  <option value="">Select vendor</option>

                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>

                {errors.vendor && (
                  <small className="add-expert-error">{errors.vendor}</small>
                )}
              </div>

              <div
                className={`add-expert-form-group ${errors.category ? "has-error" : ""}`}
              >
                <label htmlFor="category">
                  Category<span className="required">*</span>
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={pageLoading}
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>

                {errors.category && (
                  <small className="add-expert-error">{errors.category}</small>
                )}
              </div>

              <div
                className={`add-expert-form-group ${errors.subCategory ? "has-error" : ""}`}
              >
                <label htmlFor="subCategory">
                  Sub category<span className="required">*</span>
                </label>

                <select
                  id="subCategory"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  disabled={!formData.category}
                >
                  <option value="">
                    {formData.category
                      ? "Select sub category"
                      : "Choose a category first"}
                  </option>

                  {filteredSubCategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                {errors.subCategory && (
                  <small className="add-expert-error">
                    {errors.subCategory}
                  </small>
                )}
              </div>
            </div>

            <h4 className="add-expert-section-title">Profile</h4>

            <div className="add-expert-form-row add-expert-form-row-two">
              <div
                className={`add-expert-form-group ${errors.expertName ? "has-error" : ""}`}
              >
                <label htmlFor="expertName">
                  Expert name<span className="required">*</span>
                </label>

                <input
                  type="text"
                  id="expertName"
                  name="expertName"
                  value={formData.expertName}
                  onChange={handleChange}
                  placeholder="e.g. John Deo"
                  autoComplete="off"
                />

                {errors.expertName && (
                  <small className="add-expert-error">
                    {errors.expertName}
                  </small>
                )}
              </div>

              <div
                className={`add-expert-form-group ${errors.experience ? "has-error" : ""}`}
              >
                <label htmlFor="experience">
                  Experience<span className="required">*</span>
                </label>

                <input
                  type="text"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g. 5 years, 2+ years, Fresher"
                  autoComplete="off"
                />

                {errors.experience && (
                  <small className="add-expert-error">
                    {errors.experience}
                  </small>
                )}
              </div>
            </div>

            <h4 className="add-expert-section-title">Photo</h4>

            <div
              className={`add-expert-form-group ${errors.image ? "has-error" : ""}`}
            >
              {!imagePreview ? (
                <div
                  className={`add-expert-dropzone ${isDragging ? "is-dragging" : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="expert-image"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => applyImage(event.target.files?.[0])}
                  />

                  <label htmlFor="expert-image">
                    <FaCloudUploadAlt />
                    <strong>Click to upload or drag and drop</strong>
                    <small>
                      JPG, PNG or WEBP · up to {MAX_IMAGE_SIZE_MB} MB
                    </small>
                  </label>
                </div>
              ) : (
                <div className="add-expert-image-preview">
                  <img src={imagePreview} alt="Expert preview" />

                  <div className="add-expert-image-meta">
                    <strong>{formData.image?.name}</strong>
                    <small>
                      {(formData.image?.size / 1024).toFixed(0)} KB
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={removeImage}
                    className="add-expert-remove-image"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}

              {errors.image && (
                <small className="add-expert-error">{errors.image}</small>
              )}
            </div>

            <div className="add-expert-form-actions">
              <button
                type="button"
                className="add-expert-reset-btn"
                onClick={handleReset}
                disabled={loading}
              >
                <FaRedoAlt />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                className="add-expert-save-btn"
                disabled={loading || pageLoading}
              >
                {loading ? (
                  <i className="add-expert-spinner" aria-hidden="true" />
                ) : (
                  <FaPlus />
                )}
                <span>{loading ? "Saving…" : "Save expert"}</span>
              </button>
            </div>
          </form>
        </div>


      {/* ---------- SUCCESS MODAL ---------- */}

      <ServiceSuccessModal
        isOpen={showSuccess}
        title="Expert added"
        message={`${formData.expertName.trim()} has been added successfully.`}
        buttonText="View experts"
        onClose={handleSuccessClose}
      />
    </div>
  );
};

export default AddExpert;