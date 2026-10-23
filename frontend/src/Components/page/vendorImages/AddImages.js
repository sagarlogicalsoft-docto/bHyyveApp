import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTimes,
  FaCloudUploadAlt,
  FaFilm,
  FaImage,
  FaExclamationCircle,
} from "react-icons/fa";
import api from "../../../config/api";
import ServiceBreadcrumbs from "../../../Components/common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../../Components/common/modal/serviceModal/ServiceSuccessModal";

import "./addImages.css";

// =========================================================
// ROUTES (update to match your router)
// =========================================================

const ROUTES = {
  list: "/all_ven_images",
};

// =========================================================
// SERVICE LAYER (API calls - easy to move to a service file later)
// =========================================================

const addImageService = {
  // GET /admin/vendor-images/form-data -> { success, data: { services, vendors } }
  getVendors: async () => {
    const response = await api.get("/admin/vendor-images/form-data");
    const result = response.data;

    if (!result?.success) {
      throw new Error(result?.message || "Failed to fetch vendors.");
    }

    return result.data?.vendors || [];
  },

  // POST /admin/vendor-images (field names match the PHP form + Node controller)
  create: async ({ vendor, title, description, file }) => {
    const payload = new FormData();
    payload.append("category", "");
    payload.append("name", title.trim());
    payload.append("vimage", "vimage");
    payload.append("vendor_id", vendor);
    payload.append("description", description.trim());
    payload.append("file", file);

    const response = await api.post("/admin/vendor-images", payload);
    const result = response.data;

    if (!result?.success) {
      throw new Error(result?.message || "Failed to add image.");
    }

    return result;
  },
};

// =========================================================
// HELPERS
// =========================================================

const getErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.message || fallback;

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const EMPTY_FORM = { vendor: "", title: "", description: "" };
const SUCCESS_CLOSED = { open: false, message: "" };
const TITLE_MAX = 255;

// =========================================================
// COMPONENT
// =========================================================

const AddImages = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(SUCCESS_CLOSED);

  // =========================================================
  // LOAD VENDORS
  // =========================================================

  const fetchVendors = useCallback(async () => {
    try {
      setLoadingVendors(true);
      setError("");

      setVendors(await addImageService.getVendors());
    } catch (err) {
      console.error("Fetch vendor form data error:", err);
      setError(getErrorMessage(err, "Failed to load vendors."));
    } finally {
      setLoadingVendors(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // =========================================================
  // LOCAL FILE PREVIEW
  // =========================================================

  useEffect(() => {
    if (!selectedFile) {
      setFilePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setFilePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedFile]);

  const isVideo = Boolean(selectedFile?.type?.startsWith("video/"));

  // =========================================================
  // HANDLERS
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
  };

  const pickFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setError("Please choose an image or video file.");
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleFileChange = (event) => {
    pickFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (submitting) return;
    pickFile(event.dataTransfer.files?.[0]);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.list);
  };

  const closeSuccess = useCallback(() => {
    setSuccess(SUCCESS_CLOSED);
    navigate(ROUTES.list);
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");

    if (!formData.vendor) {
      setError("Please select a vendor.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a title.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await addImageService.create({
        ...formData,
        file: selectedFile,
      });

      setFormData(EMPTY_FORM);
      clearSelectedFile();
      setSuccess({
        open: true,
        message: result.message || "Image added successfully.",
      });
    } catch (err) {
      console.error("Add vendor image error:", err);
      setError(getErrorMessage(err, "Failed to add image."));
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="add-image-page">
      {/* PAGE HEADER */}
      <div className="add-image-page-header">
        <h2 className="add-image-page-title">Add Image</h2>

        <ServiceBreadcrumbs
          items={[
            { label: "Manage Slider", to: ROUTES.list },
            { label: "Add Image" },
          ]}
        />
      </div>

      {/* MAIN CARD */}
      <div className="add-image-card">
        <div className="add-image-card-header">
          <h3>Add New Image</h3>
          <p>Choose a vendor and upload an image or video for the home slider.</p>
        </div>

        {error && (
          <div className="add-image-alert" role="alert">
            <FaExclamationCircle className="add-image-alert-icon" />
            <span>{error}</span>
            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              <FaTimes />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-image-form">
          <div className="add-image-form-grid">
            {/* SELECT VENDOR */}
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
                disabled={loadingVendors || submitting}
              >
                <option value="">
                  {loadingVendors ? "Loading Vendors..." : "Select Vendor"}
                </option>

                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* TITLE */}
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
                maxLength={TITLE_MAX}
                required
                disabled={submitting}
              />

              <small className="add-image-counter">
                {formData.title.length}/{TITLE_MAX}
              </small>
            </div>

            {/* MEDIA */}
            <div className="add-image-form-group add-image-full">
              <label htmlFor="image">
                Image / Video <span>*</span>
              </label>

              <div className="add-image-media-panel">
                <div
                  className={`add-image-dropzone ${isDragging ? "add-image-dropzone-active" : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <FaCloudUploadAlt className="add-image-dropzone-icon" />

                  <strong>
                    {selectedFile ? "File selected" : "Upload media"}
                  </strong>

                  <p>
                    {selectedFile
                      ? `${selectedFile.name} (${formatFileSize(selectedFile.size)})`
                      : "Drag & drop an image or video here, or browse."}
                  </p>

                  <label htmlFor="image" className="add-image-upload-btn">
                    <FaCloudUploadAlt />
                    <span>{selectedFile ? "Choose another file" : "Choose file"}</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    id="image"
                    type="file"
                    name="image"
                    accept="image/*,video/*"
                    className="add-image-file-input"
                    onChange={handleFileChange}
                    disabled={submitting}
                  />

                  {selectedFile && (
                    <button
                      type="button"
                      className="add-image-remove-file"
                      onClick={clearSelectedFile}
                      disabled={submitting}
                    >
                      <FaTimes />
                      Remove file
                    </button>
                  )}
                </div>

                <div className="add-image-preview">
                  {filePreview ? (
                    <>
                      {isVideo ? (
                        <video
                          key={filePreview}
                          src={filePreview}
                          controls
                          className="add-image-preview-media"
                        >
                          Your browser does not support video playback.
                        </video>
                      ) : (
                        <img
                          key={filePreview}
                          src={filePreview}
                          alt="Selected"
                          className="add-image-preview-media"
                        />
                      )}

                      <span className="add-image-preview-badge">
                        {isVideo ? <FaFilm /> : <FaImage />}
                        {isVideo ? "Video" : "Image"}
                      </span>
                    </>
                  ) : (
                    <div className="add-image-no-preview">
                      <FaImage />
                      <span>Preview will appear here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="add-image-form-group add-image-full">
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                name="description"
                rows="5"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="add-image-submit-wrapper">
            <button
              type="button"
              className="add-image-cancel-btn"
              onClick={handleCancel}
              disabled={submitting}
            >
              <FaTimes />
              Cancel
            </button>

            <button
              type="submit"
              className="add-image-submit-btn"
              disabled={submitting || loadingVendors}
            >
              {submitting ? (
                <>
                  <span className="add-image-button-spinner" />
                  Adding...
                </>
              ) : (
                <>
                  <FaPlus />
                  Add Image
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SUCCESS MODAL */}
      <ServiceSuccessModal
        isOpen={success.open}
        title="Image Added"
        message={success.message}
        buttonText="Done"
        autoCloseMs={2000}
        onClose={closeSuccess}
      />
    </div>
  );
};

export default AddImages;