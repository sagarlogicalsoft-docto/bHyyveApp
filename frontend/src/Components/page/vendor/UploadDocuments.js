import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { FaDownload, FaEye, FaSave, FaUpload } from "react-icons/fa";
import api from "../../../config/api";
import "./uploadDocuments.css";

const UploadDocuments = () => {
  const { id: vendorId } = useParams();
  const [documents, setDocuments] = useState({
    contractId: null,
    tradeLicense: null,
    ownerId: null,
    registrationId: null,
    computerCard: null,
    priceList: null,
    idProof1: null,
    idProof2: null,
  });

  const [saving, setSaving] = useState(false);

  const documentFields = [
    {
      key: "contractId",
      label: "Contract ID",
      required: true,
    },
    {
      key: "tradeLicense",
      label: "Trade License",
      required: true,
    },
    {
      key: "ownerId",
      label: "Owner ID",
      required: true,
    },
    {
      key: "registrationId",
      label: "Registration ID",
      required: true,
    },
    {
      key: "computerCard",
      label: "Computer Card",
      required: true,
    },
    {
      key: "priceList",
      label: "Price List",
      required: true,
    },
    {
      key: "idProof1",
      label: "ID Proof-1",
      required: true,
    },
    {
      key: "idProof2",
      label: "ID Proof-2",
      required: true,
    },
  ];

  // --------------------------------------------------------------------------
  // Handle file selection
  // --------------------------------------------------------------------------
  const handleFileChange = (key, event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [key]: file,
    }));
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
    }, 1000);
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
        alert("Vendor ID not found.");
        return;
      }

      const hasDocuments = Object.values(documents).some(
        (file) => file !== null,
      );

      if (!hasDocuments) {
        alert("Please select at least one document.");
        return;
      }

      setSaving(true);

      const formData = new FormData();

      if (documents.contractId) {
        formData.append("contract_id", documents.contractId);
      }

      if (documents.tradeLicense) {
        formData.append("trade_license", documents.tradeLicense);
      }

      if (documents.ownerId) {
        formData.append("owner_id", documents.ownerId);
      }

      if (documents.registrationId) {
        formData.append("registration_id", documents.registrationId);
      }

      if (documents.computerCard) {
        formData.append("computer_card", documents.computerCard);
      }

      if (documents.priceList) {
        formData.append("price_list", documents.priceList);
      }

      if (documents.idProof1) {
        formData.append("id_proof_1", documents.idProof1);
      }

      if (documents.idProof2) {
        formData.append("id_proof_2", documents.idProof2);
      }

      const response = await api.post(
        `/vendor/vendors/documents/${vendorId}`,
        formData,
      );

      console.log("Upload documents response:", response.data);

      if (response.data.success) {
        alert("Documents uploaded successfully.");
      } else {
        alert(response.data.message || "Failed to upload documents.");
      }
    } catch (error) {
      console.error("Upload documents error:", error.response?.data || error);

      alert(error.response?.data?.message || "Failed to upload documents.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="upload-documents-page">
      <div className="upload-documents-card">
        {/* ---------------------------------------------------------------- */}
        {/* Header */}
        {/* ---------------------------------------------------------------- */}

        <div className="upload-documents-header">
          <div>
            <h2>Upload Documents</h2>
            <p>Upload and manage vendor documents</p>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Documents */}
        {/* ---------------------------------------------------------------- */}

        <div className="documents-grid">
          {documentFields.map((document) => {
            const selectedFile = documents[document.key];

            return (
              <div className="document-item" key={document.key}>
                {/* Label */}

                <label className="document-label">
                  {document.label}

                  {document.required && (
                    <span className="required-star">*</span>
                  )}
                </label>

                {/* Upload box */}

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
                    <FaUpload className="upload-icon" />

                    <span className="upload-text">
                      {selectedFile ? selectedFile.name : "Choose File"}
                    </span>
                  </label>
                </div>

                {/* Actions */}

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
          <button
            type="button"
            className="document-save-button"
            onClick={handleSave}
            disabled={saving}
          >
            <FaSave />

            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadDocuments;
