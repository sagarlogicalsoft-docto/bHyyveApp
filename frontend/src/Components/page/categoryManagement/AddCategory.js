import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheck,
  FaCloudUploadAlt,
  FaHome,
  FaImage,
  FaMapMarkerAlt,
  FaPlus,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../../Components/common/modal/serviceModal/ServiceSuccessModal";
import api from "../../../config/api";

import "./addCategory.css";

const CATEGORY_LIST_PATH = "/category_list";
const CATEGORY_TYPE = "new_cat";

async function request(config) {
  try {
    const response = await api.request(config);
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        err?.message ||
        `Request failed (${err?.response?.status || "network error"})`
    );
  }
}

function addCategory(payload) {
  const formData = new FormData();

  formData.append("category", payload.category ?? "");
  formData.append("name", payload.categoryName ?? "");
  formData.append("sort_description", payload.sortDescription ?? "");
  formData.append("hideHomeService", payload.hideHomeService ?? "");
  formData.append("hideOnSiteService", payload.hideOnSiteService ?? "");
  formData.append("showHomeService", payload.showHomeService ?? "");
  formData.append("showOnSiteService", payload.showOnSiteService ?? "");

  if (payload.categoryImage) {
    formData.append("file", payload.categoryImage);
  }

  return request({
    method: "POST",
    url: "/admin/categories",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/* =========================================================
   COMPONENT
========================================================= */

const AddCategory = () => {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const blobUrlRef = useRef(null);

  const [categoryName, setCategoryName] = useState("");
  const [sortDescription, setSortDescription] = useState("");

  const [homeService, setHomeService] = useState(false);
  const [homeServiceDetail, setHomeServiceDetail] = useState("");

  const [onSiteService, setOnSiteService] = useState(false);
  const [onSiteServiceDetail, setOnSiteServiceDetail] = useState("");

  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [isDragging, setIsDragging] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  /* ---------------------------------------------------------
     IMAGE HANDLERS
  --------------------------------------------------------- */

  const selectImageFile = useCallback((file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    setError(null);

    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = URL.createObjectURL(file);

    setCategoryImage(file);
    setFileName(file.name);
    setImagePreview(blobUrlRef.current);
  }, []);

  const handleImageChange = (event) => {
    selectImageFile(event.target.files?.[0]);
    // allow choosing the same file again
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    setCategoryImage(null);
    setImagePreview(null);
    setFileName("No file chosen");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (submitting) return;
    selectImageFile(event.dataTransfer.files?.[0]);
  };

  const openFilePicker = () => {
    if (!submitting) fileInputRef.current?.click();
  };

  /* ---------------------------------------------------------
     SUBMIT
  --------------------------------------------------------- */

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      setError("Category name is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await addCategory({
        category: CATEGORY_TYPE,
        categoryName: categoryName.trim(),
        sortDescription: sortDescription,
      
        hideHomeService: "",
        hideOnSiteService: "",

        showHomeService: homeService ? "1" : "0",
        showOnSiteService: onSiteService ? "1" : "0",

        categoryImage,
      });

      setSuccessInfo({
        message: response?.message || "The category has been added successfully.",
      });
    } catch (err) {
      console.error("Add category error:", err);
      setError(err.message || "Failed to add category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = useCallback(() => {
    setSuccessInfo(null);
    navigate(CATEGORY_LIST_PATH);
  }, [navigate]);

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <div className="adcg-page">
      {/* PAGE HEADER */}
      <div className="adcg-page-header">
        <h2 className="adcg-page-title">Add Category</h2>
        <ServiceBreadcrumbs
          items={[
            { label: "Category List", to: CATEGORY_LIST_PATH },
            { label: "Add Category" },
          ]}
        />
      </div>

      {/* MAIN CARD */}
      <div className="adcg-card">
        <div className="adcg-card-header">
          <h3>New Category</h3>
          <p>Fill in the details below to create a new category.</p>
        </div>

        <div className="adcg-card-body">
          {error && (
            <div className="adcg-alert" role="alert">
              <span>{error}</span>
              <button
                type="button"
                className="adcg-alert-close"
                aria-label="Dismiss"
                onClick={() => setError(null)}
              >
                <FaTimes />
              </button>
            </div>
          )}

          <div className="adcg-layout">
            {/* LEFT: DETAILS */}
            <div className="adcg-details">
              <div className="adcg-field">
                <label htmlFor="adcg-name">
                  Category Name <span className="adcg-required">*</span>
                </label>
                <input
                  id="adcg-name"
                  type="text"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="adcg-field">
                <label htmlFor="adcg-description">Sort Description</label>
                <textarea
                  id="adcg-description"
                  placeholder="Enter sort description"
                  value={sortDescription}
                  onChange={(event) => setSortDescription(event.target.value)}
                  disabled={submitting}
                  rows={4}
                />
              </div>

              <div className="adcg-services">
                {/* HOME SERVICE */}
                <div
                  className={`adcg-service ${
                    homeService ? "adcg-service-on" : ""
                  }`}
                >
                  <label className="adcg-service-head">
                    <input
                      type="checkbox"
                      className="adcg-checkbox"
                      checked={homeService}
                      onChange={(event) => setHomeService(event.target.checked)}
                      disabled={submitting}
                    />
                    <FaHome className="adcg-service-icon" />
                    <span>Home Service</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Enter home service detail"
                    value={homeServiceDetail}
                    onChange={(event) =>
                      setHomeServiceDetail(event.target.value)
                    }
                    disabled={submitting || !homeService}
                  />
                </div>

                {/* ON SITE SERVICE */}
                <div
                  className={`adcg-service ${
                    onSiteService ? "adcg-service-on" : ""
                  }`}
                >
                  <label className="adcg-service-head">
                    <input
                      type="checkbox"
                      className="adcg-checkbox"
                      checked={onSiteService}
                      onChange={(event) =>
                        setOnSiteService(event.target.checked)
                      }
                      disabled={submitting}
                    />
                    <FaMapMarkerAlt className="adcg-service-icon" />
                    <span>On Site Service</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Enter on site service detail"
                    value={onSiteServiceDetail}
                    onChange={(event) =>
                      setOnSiteServiceDetail(event.target.value)
                    }
                    disabled={submitting || !onSiteService}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: IMAGE */}
            <div className="adcg-image-panel">
              <span className="adcg-image-label">Category Image</span>

              <div className="adcg-preview">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Category preview" />
                    <span className="adcg-preview-badge">Selected image</span>
                  </>
                ) : (
                  <div className="adcg-preview-empty">
                    <FaImage />
                    <span>Image preview will appear here</span>
                  </div>
                )}
              </div>

              <div
                className={`adcg-dropzone ${
                  isDragging ? "adcg-dropzone-active" : ""
                }`}
                role="button"
                tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openFilePicker();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <FaCloudUploadAlt className="adcg-dropzone-icon" />
                <strong>Click to choose</strong>
                <span>or drag and drop an image here</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="adcg-hidden-file"
              />

              <div className="adcg-file-row">
                <span className="adcg-file-name" title={fileName}>
                  {fileName}
                </span>

                {categoryImage && (
                  <button
                    type="button"
                    className="adcg-remove-btn"
                    onClick={handleRemoveImage}
                    disabled={submitting}
                  >
                    <FaTrash />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="adcg-card-footer">
          <button
            type="button"
            className="adcg-cancel-btn"
            onClick={() => navigate(CATEGORY_LIST_PATH)}
            disabled={submitting}
          >
            <FaTimes />
            Cancel
          </button>

          <button
            type="button"
            className="adcg-add-btn"
            onClick={handleAddCategory}
            disabled={submitting}
          >
            {submitting ? (
              <span className="adcg-btn-spinner" aria-hidden="true" />
            ) : (
              <FaPlus />
            )}
            {submitting ? "Adding..." : "Add Category"}
          </button>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <ServiceSuccessModal
        isOpen={Boolean(successInfo)}
        title="Category Added"
        message={successInfo?.message}
        onClose={handleSuccessClose}
      />
    </div>
  );
};

export default AddCategory;