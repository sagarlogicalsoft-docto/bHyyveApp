import React from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";
import "./modal.css";

const ConfirmModal = ({
  show,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!show) {
    return null;
  }

  return (
    <div className="common-modal-overlay">
      <div className="common-confirm-modal">

        <div className="common-modal-icon warning">
          <FaExclamationTriangle />
        </div>

        <h3>{title}</h3>

        <p>{message}</p>

        <div className="common-modal-actions">

          <button
            type="button"
            className="common-modal-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            <FaTimes />
            {cancelText}
          </button>

          <button
            type="button"
            className="common-modal-confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait..." : confirmText}
          </button>

        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;