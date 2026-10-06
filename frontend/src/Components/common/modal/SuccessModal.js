import React from "react";
import { FaCheck } from "react-icons/fa";
import "./modal.css";

const SuccessModal = ({
  show,
  title = "Success!",
  message = "Operation completed successfully.",
  buttonText = "OK",
  onClose,
}) => {
  if (!show) {
    return null;
  }

  return (
    <div className="common-modal-overlay">
      <div className="common-success-modal">

        <div className="common-modal-icon success">
          <FaCheck />
        </div>

        <h3>{title}</h3>

        <p>{message}</p>

        <button
          type="button"
          className="common-success-button"
          onClick={onClose}
        >
          <FaCheck />
          {buttonText}
        </button>

      </div>
    </div>
  );
};

export default SuccessModal;