import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCloudUploadAlt,
  FaSave,
  FaTimes,
  FaFilm,
  FaImage,
  FaExclamationCircle,
} from "react-icons/fa";
import api from "../../../config/api";
import { getImage } from "../../utils/images";
import ServiceBreadcrumbs from "../../../Components/common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../../Components/common/modal/serviceModal/ServiceSuccessModal";

import "./editVendorSlider.css";

// =========================================================
// ROUTES (update to match your router)
// =========================================================

const ROUTES = {
  list: "/all_ven_images",
};

// =========================================================
// SERVICE LAYER (API calls - easy to move to a service file later)
// =========================================================

const vendorSliderService = {
  getById: async (id) => {
    const response = await api.get(`/admin/vendor-images/${id}`);
    const result = response.data;

    if (!result?.success) {
      throw new Error(result?.message || "Failed to load vendor image.");
    }

    return result.data;
  },

  getFormData: async () => {
    const response = await api.get("/admin/vendor-images/form-data");
    const result = response.data;

    if (!result?.success) {
      throw new Error(result?.message || "Failed to load vendor list.");
    }

    return result.data;
  },

  update: async (id, payload) => {
    const response = await api.put(`/admin/vendor-images/${id}`, payload);
    const result = response.data;

    if (!result?.success) {
      throw new Error(result?.message || "Failed to update vendor image.");
    }

    return result;
  },
};

// =========================================================
// HELPERS
// =========================================================

const isVideoFile = (filename = "") =>
  /\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i.test(String(filename).split("?")[0]);

const getErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.message || fallback;

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const TITLE_MAX = 255;
const SUCCESS_CLOSED = { open: false, message: "" };

// =========================================================
// COMPONENT
// =========================================================

const EditVendorSlider = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    vendor_id: "",
  });

  const [vendors, setVendors] = useState([]);
  const [existingImage, setExistingImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(SUCCESS_CLOSED);

  // =========================================================
  // LOAD RECORD + VENDORS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadPageData = async () => {
      try {
        setLoading(true);
        setLoadFailed(false);
        setError("");

        const [record, formResult] = await Promise.all([
          vendorSliderService.getById(id),
          vendorSliderService.getFormData(),
        ]);

        if (cancelled) return;

        setFormData({
          name: record.title || "",
          description: record.description || "",
          vendor_id:
            record.vendor_id !== null && record.vendor_id !== undefined
              ? String(record.vendor_id)
              : "",
        });

        setExistingImage(record.image || "");
        setVendors(formResult?.vendors || []);
      } catch (err) {
        if (cancelled) return;

        setLoadFailed(true);
        setError(getErrorMessage(err, "Unable to load vendor image details."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) {
      loadPageData();
    } else {
      setLoadFailed(true);
      setError("Vendor image ID is missing.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

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

    setSelectedFile(file);
    setError("");
  };

  const handleFileChange = (event) => {
    pickFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    pickFile(event.dataTransfer.files?.[0]);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeSuccess = useCallback(() => {
    setSuccess(SUCCESS_CLOSED);
    navigate(ROUTES.list);
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.vendor_id) {
      setError("Please select a vendor.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter a title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a description.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("description", formData.description.trim());
      payload.append("vendor_id", formData.vendor_id);

      // PHP behaviour: media is optional during an update.
      if (selectedFile) {
        payload.append("file", selectedFile);
      }

      const result = await vendorSliderService.update(id, payload);

      setSuccess({
        open: true,
        message: result.message || "Vendor slider updated successfully.",
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update vendor image."));
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // DERIVED
  // =========================================================

  const previewSource =
    filePreview || (existingImage ? getImage(existingImage) : "");

  const previewIsVideo = selectedFile
    ? selectedFile.type.startsWith("video/") || isVideoFile(selectedFile.name)
    : isVideoFile(existingImage);

  const breadcrumbItems = [
    { label: "Slider List", to: ROUTES.list },
    { label: "Edit Slider" },
  ];

  // =========================================================
  // RETURN
  // =========================================================

  if (loading) {
    return (
      <div className="evs-page">
        <div className="evs-loading">
          <span className="evs-spinner" />
          <p>Loading vendor image details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="evs-page">
      {/* PAGE HEADER */}
      <div className="evs-header">
        <h2 className="evs-title">Edit Vendor Slider</h2>
        <ServiceBreadcrumbs items={breadcrumbItems} />
      </div>

      {/* MAIN CARD */}
      <div className="evs-card">
        <div className="evs-card-header">
          <div>
            <h3>Edit Slider Details</h3>
            <p>Update the vendor, content, or uploaded media.</p>
          </div>

          <button
            type="button"
            className="evs-back-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
        </div>

        {error && (
          <div className="evs-alert evs-alert-error" role="alert">
            <FaExclamationCircle className="evs-alert-icon" />
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

        {loadFailed ? (
          <div className="evs-load-failed">
            <button
              type="button"
              className="evs-submit-btn"
              onClick={() => navigate(ROUTES.list)}
            >
              <FaArrowLeft />
              Back to Manage Slider
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="evs-form">
            <div className="evs-form-grid">
              <div className="evs-field">
                <label htmlFor="evs-vendor">
                  Vendor <span className="evs-required">*</span>
                </label>

                <select
                  id="evs-vendor"
                  name="vendor_id"
                  value={formData.vendor_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select vendor</option>

                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={String(vendor.id)}>
                      {vendor.name || `Vendor #${vendor.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="evs-field">
                <label htmlFor="evs-title">
                  Title <span className="evs-required">*</span>
                </label>

                <input
                  id="evs-title"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter slider title"
                  maxLength={TITLE_MAX}
                  required
                />

                <span className="evs-helper evs-counter">
                  {formData.name.length}/{TITLE_MAX}
                </span>
              </div>

              <div className="evs-field evs-field-full">
                <label htmlFor="evs-description">
                  Description <span className="evs-required">*</span>
                </label>

                <textarea
                  id="evs-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter slider description"
                  rows={4}
                  required
                />

                <span className="evs-helper">
                  Keep the description clear and easy to read.
                </span>
              </div>

              <div className="evs-field evs-field-full">
                <label>Slider Media</label>

                <div className="evs-media-panel">
                  {/* PREVIEW */}
                  <div className="evs-preview">
                    {previewSource ? (
                      <>
                        {previewIsVideo ? (
                          <video
                            key={previewSource}
                            src={previewSource}
                            controls
                            className="evs-preview-media"
                          >
                            Your browser does not support video playback.
                          </video>
                        ) : (
                          <img
                            key={previewSource}
                            src={previewSource}
                            alt="Vendor slider preview"
                            className="evs-preview-media"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                              event.currentTarget.parentElement.classList.add(
                                "evs-preview-error",
                              );
                            }}
                          />
                        )}

                        <span className="evs-preview-badge">
                          {previewIsVideo ? <FaFilm /> : <FaImage />}
                          {selectedFile
                            ? "New"
                            : previewIsVideo
                              ? "Video"
                              : "Image"}
                        </span>
                      </>
                    ) : (
                      <div className="evs-no-preview">
                        <FaCloudUploadAlt />
                        <span>No media preview available</span>
                      </div>
                    )}
                  </div>

                  {/* UPLOAD */}
                  <div className="evs-upload-content">
                    <div
                      className={`evs-dropzone ${isDragging ? "evs-dropzone-active" : ""}`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                    >
                      <FaCloudUploadAlt className="evs-dropzone-icon" />

                      <strong>
                        {selectedFile ? "Replacement selected" : "Replace media"}
                      </strong>

                      <p>
                        {selectedFile
                          ? `${selectedFile.name} (${formatFileSize(selectedFile.size)})`
                          : "Drag & drop a new file here, or browse. Leave empty to keep the current media."}
                      </p>

                      <label
                        htmlFor="vendor-slider-file"
                        className="evs-upload-btn"
                      >
                        <FaCloudUploadAlt />
                        <span>
                          {selectedFile ? "Choose another file" : "Choose file"}
                        </span>
                      </label>

                      <input
                        ref={fileInputRef}
                        id="vendor-slider-file"
                        type="file"
                        accept="image/*,video/*"
                        className="evs-file-input"
                        onChange={handleFileChange}
                      />
                    </div>

                    {selectedFile && (
                      <button
                        type="button"
                        className="evs-remove-file"
                        onClick={clearSelectedFile}
                      >
                        <FaTimes />
                        Keep existing media
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="evs-form-footer">
              <button
                type="button"
                className="evs-cancel-btn"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="evs-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="evs-button-spinner" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Update Slider
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SUCCESS MODAL */}
      <ServiceSuccessModal
        isOpen={success.open}
        title="Slider Updated"
        message={success.message}
        buttonText="Done"
        autoCloseMs={2000}
        onClose={closeSuccess}
      />
    </div>
  );
};

export default EditVendorSlider;