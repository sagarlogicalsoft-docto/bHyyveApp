import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import "./serviceSuccessModal.css";

const PARTICLE_COUNT = 12;

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, index) => index);

export default function ServiceSuccessModal({
  isOpen,
  title = "Success!",
  message = "Your action was completed successfully.",
  buttonText = "Done",
  autoCloseMs = 2000,
  onClose,
}) {
  // -------------------------------------------------------------------------
  // AUTO CLOSE
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen || !autoCloseMs || !onClose) {
      return undefined;
    }

    const timer = setTimeout(onClose, autoCloseMs);

    return () => clearTimeout(timer);
  }, [isOpen, autoCloseMs, onClose]);

  // -------------------------------------------------------------------------
  // ESCAPE KEY + BODY SCROLL LOCK
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="ssm-overlay" onClick={onClose}>
      <div
        className="ssm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ssm-title"
        aria-describedby="ssm-message"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ANIMATED CHECK */}
        <div className="ssm-check-wrap">
          <span className="ssm-ring ssm-ring--one" aria-hidden="true" />
          <span className="ssm-ring ssm-ring--two" aria-hidden="true" />

          {PARTICLES.map((index) => (
            <span
              key={index}
              className="ssm-particle"
              style={{ "--a": `${index * (360 / PARTICLE_COUNT)}deg` }}
              aria-hidden="true"
            />
          ))}

          <svg
            className="ssm-check"
            viewBox="0 0 52 52"
            aria-hidden="true"
          >
            <circle className="ssm-check-circle" cx="26" cy="26" r="23" />
            <path className="ssm-check-mark" d="M15 27.5l8 8 15-16" />
          </svg>
        </div>

        {/* TEXT */}
        <h2 className="ssm-title" id="ssm-title">
          {title}
        </h2>

        <p className="ssm-message" id="ssm-message">
          {message}
        </p>

        {/* ACTION */}
        <button
          type="button"
          className="ssm-btn"
          onClick={onClose}
          autoFocus
        >
          {buttonText}
        </button>

        {/* AUTO CLOSE PROGRESS */}
        {autoCloseMs > 0 && (
          <div className="ssm-progress" aria-hidden="true">
            <span
              className="ssm-progress-bar"
              style={{ animationDuration: `${autoCloseMs}ms` }}
            />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}