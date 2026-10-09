import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./serviceConfirmModal.css";

export default function ServiceConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "Please confirm that you want to continue.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  const [isBusy, setIsBusy] = useState(false);

  const busy = isLoading || isBusy;

  // -------------------------------------------------------------------------
  // CONFIRM (supports async handlers)
  // -------------------------------------------------------------------------
  const handleConfirm = async () => {
    if (busy || !onConfirm) {
      return;
    }

    try {
      setIsBusy(true);
      await onConfirm();
    } finally {
      setIsBusy(false);
    }
  };

  // -------------------------------------------------------------------------
  // ESCAPE KEY + BODY SCROLL LOCK
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busy && onCancel) {
        onCancel();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, busy, onCancel]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="scm-overlay"
      onClick={() => !busy && onCancel && onCancel()}
    >
      <div
        className={`scm-modal scm-modal--${variant}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="scm-title"
        aria-describedby="scm-message"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ICON */}
        <div className="scm-icon-wrap">
          <span className="scm-icon-pulse" aria-hidden="true" />

          <svg
            className="scm-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {variant === "danger" ? (
              <>
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5M14 11v5" />
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5" />
                <path d="M12 16.5v.01" />
              </>
            )}
          </svg>
        </div>

        {/* TEXT */}
        <h2 className="scm-title" id="scm-title">
          {title}
        </h2>

        <p className="scm-message" id="scm-message">
          {message}
        </p>

        {/* ACTIONS */}
        <div className="scm-actions">
          <button
            type="button"
            className="scm-btn scm-btn-cancel"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="scm-btn scm-btn-confirm"
            onClick={handleConfirm}
            disabled={busy}
            autoFocus
          >
            {busy && <span className="scm-spinner" aria-hidden="true" />}
            {busy ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}