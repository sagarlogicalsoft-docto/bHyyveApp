import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaDownload,
  FaEye,
  FaExclamationCircle,
  FaSave,
  FaTimes,
  FaUpload,
} from "react-icons/fa";
import api from "../../../config/api";
import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";
import "./uploadDocuments.css";

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

// ----------------------------------------------------------------------------
// API SERVICE LAYER (kept inline - move to a service file when needed)
// ----------------------------------------------------------------------------
const FIELD_TO_API_KEY = {
  contractId: "contract_id",
  tradeLicense: "trade_license",
  ownerId: "owner_id",
  registrationId: "registration_id",
  computerCard: "computer_card",
  priceList: "price_list",
  idProof1: "id_proof_1",
  idProof2: "id_proof_2",
};

const uploadVendorDocumentsApi = async (vendorId, documents) => {
  const formData = new FormData();

  Object.entries(FIELD_TO_API_KEY).forEach(([key, apiKey]) => {
    if (documents[key]) {
      formData.append(apiKey, documents[key]);
    }
  });

  const response = await api.post(
    `/admin/vendors/documents/${vendorId}`,
    formData,
  );

  return response.data;
};

const documentFields = [
  { key: "contractId", label: "Contract ID", required: true },
  { key: "tradeLicense", label: "Trade License", required: true },
  { key: "ownerId", label: "Owner ID", required: true },
  { key: "registrationId", label: "Registration ID", required: true },
  { key: "computerCard", label: "Computer Card", required: true },
  { key: "priceList", label: "Price List", required: true },
  { key: "idProof1", label: "ID Proof-1", required: true },
  { key: "idProof2", label: "ID Proof-2", required: true },
];

const emptyDocuments = documentFields.reduce(
  (acc, field) => ({ ...acc, [field.key]: null }),
  {},
);

const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const UploadDocuments = () => {
  const { id: vendorId } = useParams();
  const [documents, setDocuments] = useState(emptyDocuments);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedCount = Object.values(documents).filter(Boolean).length;
  const totalCount = documentFields.length;
  const progress = Math.round((selectedCount / totalCount) * 100);

  // --------------------------------------------------------------------------
  // Handle file selection (with type + size validation)
  // --------------------------------------------------------------------------
  const handleFileChange = (key, event) => {
    const file = event.target.files?.[0];

    // allow picking the same file again after removing it
    event.target.value = "";

    if (!file) {
      return;
    }

    const extension = file.name.split(".").pop().toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setFieldErrors((prev) => ({
        ...prev,
        [key]: "Only PDF, JPG or PNG files are allowed.",
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        [key]: `File must be smaller than ${MAX_FILE_SIZE_MB} MB.`,
      }));
      return;
    }

    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    setFormError("");
    setDocuments((prev) => ({
      ...prev,
      [key]: file,
    }));
  };

  // --------------------------------------------------------------------------
  // Remove selected file
  // --------------------------------------------------------------------------
  const handleRemove = (key) => {
    setDocuments((prev) => ({
      ...prev,
      [key]: null,
    }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // --------------------------------------------------------------------------
  // View selected file
  // --------------------------------------------------------------------------
  const handleView = (file) => {
    if (!file) {
      return;
    }

    const fileUrl = URL.createObjectURL(file);

    window.open(fileUrl, "_blank");

    setTimeout(() => {
      URL.revokeObjectURL(fileUrl);
    }, 60000);
  };

  // --------------------------------------------------------------------------
  // Download selected file
  // --------------------------------------------------------------------------
  const handleDownload = (file) => {
    if (!file) {
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = fileUrl;
    link.download = file.name;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(fileUrl);
    }, 1000);
  };

  // --------------------------------------------------------------------------
  // Upload documents API
  // --------------------------------------------------------------------------
  const handleSave = async () => {
    try {
      if (!vendorId) {
        setFormError("Vendor ID not found.");
        return;
      }

      if (selectedCount === 0) {
        setFormError("Please select at least one document.");
        return;
      }

      setFormError("");
      setSaving(true);

      const data = await uploadVendorDocumentsApi(vendorId, documents);

      console.log("Upload documents response:", data);

      if (data.success) {
        setShowSuccess(true);
      } else {
        setFormError(data.message || "Failed to upload documents.");
      }
    } catch (error) {
      console.error("Upload documents error:", error.response?.data || error);

      setFormError(
        error.response?.data?.message || "Failed to upload documents.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="upload-documents-page">
      <ServiceBreadcrumbs
        className="upload-documents-breadcrumb"
        items={[
          { label: "Vendors List", to: "/vendor_list" },
          { label: "Upload Documents" },
        ]}
      />

      <div className="upload-documents-card">
        {/* ---------------------------------------------------------------- */}
        {/* Header */}
        {/* ---------------------------------------------------------------- */}

        <div className="upload-documents-header">
          <div>
            <h2>Upload Documents</h2>
            <p>Upload and manage vendor documents</p>
          </div>

          <div
            className="upload-progress"
            role="status"
            aria-label={`${selectedCount} of ${totalCount} documents selected`}
          >
            <div className="upload-progress-top">
              <span>
                {selectedCount} of {totalCount} selected
              </span>
              <span>{progress}%</span>
            </div>
            <div className="upload-progress-track">
              <div
                className="upload-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Form error */}
        {/* ---------------------------------------------------------------- */}

        {formError && (
          <div className="upload-documents-alert" role="alert">
            <FaExclamationCircle />
            <span>{formError}</span>
            <button
              type="button"
              className="upload-documents-alert-close"
              onClick={() => setFormError("")}
              aria-label="Dismiss message"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Documents */}
        {/* ---------------------------------------------------------------- */}

        <div className="documents-grid">
          {documentFields.map((document) => {
            const selectedFile = documents[document.key];
            const error = fieldErrors[document.key];

            return (
              <div
                className={`document-item ${error ? "has-error" : ""}`}
                key={document.key}
              >
                <label className="document-label" htmlFor={document.key}>
                  {document.label}

                  {document.required && (
                    <span className="required-star">*</span>
                  )}
                </label>

                <div
                  className={`document-upload-box ${
                    selectedFile ? "has-file" : ""
                  }`}
                >
                  <input
                    type="file"
                    id={document.key}
                    className="document-file-input"
                    onChange={(event) => handleFileChange(document.key, event)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />

                  <label htmlFor={document.key} className="document-file-label">
                    {selectedFile ? (
                      <FaCheckCircle className="upload-icon upload-icon-done" />
                    ) : (
                      <FaUpload className="upload-icon" />
                    )}

                    <span className="upload-text">
                      {selectedFile ? selectedFile.name : "Choose File"}
                    </span>

                    {selectedFile && (
                      <span className="upload-size">
                        {formatFileSize(selectedFile.size)}
                      </span>
                    )}
                  </label>

                  {selectedFile && (
                    <button
                      type="button"
                      className="document-remove-button"
                      onClick={() => handleRemove(document.key)}
                      aria-label={`Remove ${document.label}`}
                      title="Remove"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                {error && <p className="document-error">{error}</p>}

                {selectedFile ? (
                  <div className="document-actions">
                    <button
                      type="button"
                      className="document-view-button"
                      onClick={() => handleView(selectedFile)}
                    >
                      <FaEye />
                      View
                    </button>

                    <button
                      type="button"
                      className="document-download-button"
                      onClick={() => handleDownload(selectedFile)}
                    >
                      <FaDownload />
                      Download
                    </button>
                  </div>
                ) : (
                  <div className="document-not-submitted">Not Submitted</div>
                )}
              </div>
            );
          })}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Footer */}
        {/* ---------------------------------------------------------------- */}

        <div className="upload-documents-footer">
          <p className="upload-documents-hint">
            Accepted: PDF, JPG, PNG &middot; Max {MAX_FILE_SIZE_MB} MB each
          </p>

          <button
            type="button"
            className="document-save-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="button-spinner" aria-hidden="true" />
            ) : (
              <FaSave />
            )}

            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <ServiceSuccessModal
        isOpen={showSuccess}
        title="Documents uploaded"
        message={`${selectedCount} ${
          selectedCount === 1 ? "document was" : "documents were"
        } saved successfully for this vendor.`}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default UploadDocuments;