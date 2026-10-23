import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaCheck,
  FaHome,
  FaImage,
  FaMapMarkerAlt,
  FaTimes,
  FaUndo,
  FaCloudUploadAlt,
} from "react-icons/fa";

import { getImage } from "../../utils/images";
import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../../Components/common/modal/serviceModal/ServiceSuccessModal";
import api from "../../../config/api";

import "./editCategory.css";

const CATEGORY_LIST_PATH = "/category_list";

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

function getCategoryById(categoryId) {
  return request({ method: "GET", url: `/admin/categories/${categoryId}` });
}

// FormData is used because an image file may be attached
function updateCategory(categoryId, payload) {
  const formData = new FormData();

  formData.append("cat_id", categoryId);
  formData.append("name", payload.categoryName ?? "");
  formData.append("showHomeService", payload.showHomeService ?? "");
  formData.append("sortDescription", payload.sortDescription ?? "");
  formData.append("showOnSiteService", payload.showOnSiteService ?? "");

  if (payload.categoryImage) {
    formData.append("file", payload.categoryImage);
  }

  return request({
    method: "PUT",
    url: `/admin/categories/${categoryId}`,
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

/* =========================================================
   COMPONENT
========================================================= */

const EditCategory = () => {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const blobUrlRef = useRef(null);

  const [categoryName, setCategoryName] = useState("");
  const [sortDescription, setSortDescription] = useState("");

  const [homeService, setHomeService] = useState(false);
  const [homeServiceDetail, setHomeServiceDetail] = useState("");

  const [onSiteService, setOnSiteService] = useState(false);
  const [onSiteServiceDetail, setOnSiteServiceDetail] = useState("");

  // image: newly chosen file, what is shown, and the saved one (to undo)
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [originalImage, setOriginalImage] = useState({ src: null, name: "" });
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);

  /* ---------------------------------------------------------
     LOAD EXISTING CATEGORY
  --------------------------------------------------------- */

  useEffect(() => {
    if (!categoryId) return;

    const fetchCategory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getCategoryById(categoryId);
        const data = response?.data || {};

        setCategoryName(data.category_name || "");
        setSortDescription(data.sort_description || "");

        setHomeService(
          data.showHomeService === "1" || data.showHomeService === 1
        );
        setOnSiteService(
          data.showOnSiteService === "1" || data.showOnSiteService === 1
        );

        if (data.category_image) {
          const image = getImage(data.category_image);

          setFileName(data.category_image);
          setImagePreview(image);
          setOriginalImage({ src: image, name: data.category_image });
        }
      } catch (err) {
        console.error("Get category error:", err);
        setError(err.message || "Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  // free the temporary preview URL when leaving the page
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

  const handleUndoImage = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    setCategoryImage(null);
    setImagePreview(originalImage.src);
    setFileName(originalImage.name || "No file chosen");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (loading || submitting) return;
    selectImageFile(event.dataTransfer.files?.[0]);
  };

  const openFilePicker = () => {
    if (!loading && !submitting) fileInputRef.current?.click();
  };

  /* ---------------------------------------------------------
     SUBMIT
  --------------------------------------------------------- */

  const handleUpdate = async () => {
    if (!categoryName.trim()) {
      setError("Category name is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await updateCategory(categoryId, {
        categoryName: categoryName.trim(),
        sortDescription,

        // PHP expects these values
        showHomeService: homeService ? "1" : "0",
        showOnSiteService: onSiteService ? "1" : "0",

        categoryImage,
      });

      setSuccessOpen(true);
    } catch (err) {
      console.error("Update category error:", err);
      setError(err.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = useCallback(() => {
    setSuccessOpen(false);
    navigate(CATEGORY_LIST_PATH);
  }, [navigate]);

  const disabled = loading || submitting;

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <div className="ectg-page">
      {/* PAGE HEADER */}
      <div className="ectg-page-header">
        <h2 className="ectg-page-title">Edit Category</h2>
        <ServiceBreadcrumbs
          items={[
            { label: "Category List", to: CATEGORY_LIST_PATH },
            { label: "Edit Category" },
          ]}
        />
      </div>

      {/* MAIN CARD */}
      <div className="ectg-card">
        <div className="ectg-card-header">
          <h3>Update Category</h3>
          <p>Change the details below and save to update this category.</p>
        </div>

        <div className="ectg-card-body">
          {error && (
            <div className="ectg-alert" role="alert">
              <span>{error}</span>
              <button
                type="button"
                className="ectg-alert-close"
                aria-label="Dismiss"
                onClick={() => setError(null)}
              >
                <FaTimes />
              </button>
            </div>
          )}

          {loading ? (
            <div className="ectg-state">
              <span className="ectg-spinner" aria-hidden="true" />
              Loading category...
            </div>
          ) : (
            <div className="ectg-layout">
              {/* LEFT: DETAILS */}
              <div className="ectg-details">
                <div className="ectg-field">
                  <label htmlFor="ectg-name">
                    Category Name <span className="ectg-required">*</span>
                  </label>
                  <input
                    id="ectg-name"
                    type="text"
                    placeholder="Enter category name"
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    disabled={disabled}
                  />
                </div>

                <div className="ectg-field">
                  <label htmlFor="ectg-description">Sort Description</label>
                  <textarea
                    id="ectg-description"
                    placeholder="Enter sort description"
                    value={sortDescription}
                    onChange={(event) => setSortDescription(event.target.value)}
                    disabled={disabled}
                    rows={4}
                  />
                </div>

                <div className="ectg-services">
                  {/* HOME SERVICE */}
                  <div
                    className={`ectg-service ${
                      homeService ? "ectg-service-on" : ""
                    }`}
                  >
                    <label className="ectg-service-head">
                      <input
                        type="checkbox"
                        className="ectg-checkbox"
                        checked={homeService}
                        onChange={(event) =>
                          setHomeService(event.target.checked)
                        }
                        disabled={disabled}
                      />
                      <FaHome className="ectg-service-icon" />
                      <span>Home Service</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Enter home service detail"
                      value={homeServiceDetail}
                      onChange={(event) =>
                        setHomeServiceDetail(event.target.value)
                      }
                      disabled={disabled || !homeService}
                    />
                  </div>

                  {/* ON SITE SERVICE */}
                  <div
                    className={`ectg-service ${
                      onSiteService ? "ectg-service-on" : ""
                    }`}
                  >
                    <label className="ectg-service-head">
                      <input
                        type="checkbox"
                        className="ectg-checkbox"
                        checked={onSiteService}
                        onChange={(event) =>
                          setOnSiteService(event.target.checked)
                        }
                        disabled={disabled}
                      />
                      <FaMapMarkerAlt className="ectg-service-icon" />
                      <span>On Site Service</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Enter on site service detail"
                      value={onSiteServiceDetail}
                      onChange={(event) =>
                        setOnSiteServiceDetail(event.target.value)
                      }
                      disabled={disabled || !onSiteService}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: IMAGE */}
              <div className="ectg-image-panel">
                <span className="ectg-image-label">Category Image</span>

                <div className="ectg-preview">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Category preview" />
                      <span
                        className={`ectg-preview-badge ${
                          categoryImage ? "ectg-preview-badge-new" : ""
                        }`}
                      >
                        {categoryImage ? "New image" : "Current image"}
                      </span>
                    </>
                  ) : (
                    <div className="ectg-preview-empty">
                      <FaImage />
                      <span>No image selected</span>
                    </div>
                  )}
                </div>

                <div
                  className={`ectg-dropzone ${
                    isDragging ? "ectg-dropzone-active" : ""
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
                  <FaCloudUploadAlt className="ectg-dropzone-icon" />
                  <strong>Click to choose</strong>
                  <span>or drag and drop an image here</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="ectg-hidden-file"
                />

                <div className="ectg-file-row">
                  <span className="ectg-file-name" title={fileName}>
                    {fileName}
                  </span>

                  {categoryImage && (
                    <button
                      type="button"
                      className="ectg-undo-btn"
                      onClick={handleUndoImage}
                      disabled={submitting}
                    >
                      <FaUndo />
                      Undo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="ectg-card-footer">
          <button
            type="button"
            className="ectg-cancel-btn"
            onClick={() => navigate(CATEGORY_LIST_PATH)}
            disabled={submitting}
          >
            <FaTimes />
            Cancel
          </button>

          <button
            type="button"
            className="ectg-update-btn"
            onClick={handleUpdate}
            disabled={disabled}
          >
            {submitting ? (
              <span className="ectg-btn-spinner" aria-hidden="true" />
            ) : (
              <FaCheck />
            )}
            {submitting ? "Updating..." : "Update"}
          </button>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <ServiceSuccessModal
        isOpen={successOpen}
        title="Category Updated"
        message="The category has been updated successfully."
        onClose={handleSuccessClose}
      />
    </div>
  );
};

export default EditCategory;