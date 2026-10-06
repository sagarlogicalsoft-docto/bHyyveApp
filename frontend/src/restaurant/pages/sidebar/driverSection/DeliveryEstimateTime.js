import React, { useCallback, useEffect, useRef, useState } from "react";
import "./deliveryEstimateTime.css";
import api from "../../../../config/api";

import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";

const INITIAL_FORM = {
  range: "",
  estimateTime: "",
  status: "active",
};

function validate(form) {
  const errors = {};

  if (!form.range.trim()) {
    errors.range = "Range (KM) is required";
  } else if (Number.isNaN(Number(form.range)) || Number(form.range) <= 0) {
    errors.range = "Enter a valid range in KM";
  }

  if (!form.estimateTime.trim()) {
    errors.estimateTime = "Estimate time is required";
  } else if (
    Number.isNaN(Number(form.estimateTime)) ||
    Number(form.estimateTime) <= 0
  ) {
    errors.estimateTime = "Enter a valid time in minutes";
  }

  return errors;
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(date.getDate())}-${pad(
    date.getMonth() + 1,
  )}-${date.getFullYear()} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}:${pad(date.getSeconds())}`;
}

function getRangeKm(record) {
  return record.range_km ?? record.range ?? "";
}

function getEstimateMinutes(record) {
  return record.from_time ?? record.estimate_time ?? record.estimateTime ?? "";
}

function isRecordActive(record) {
  return (
    record.status === true ||
    record.status === "active" ||
    record.status === 1 ||
    record.status === "1"
  );
}

/* ------------------------------------------------------------------ */
/* Add / Edit modal                                                    */
/* ------------------------------------------------------------------ */

function EstimateTimeModal({ mode, record, onClose, onSaved }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (mode === "edit" && record) {
      setForm({
        range: String(getRangeKm(record)).replace(" km", ""),
        estimateTime: String(getEstimateMinutes(record)),
        status: isRecordActive(record) ? "active" : "inactive",
      });
    } else {
      setForm(INITIAL_FORM);
    }

    setErrors({});
    setSubmitError(null);
  }, [mode, record]);

  useEffect(() => {
    firstFieldRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    setErrors((prev) =>
      prev[key] ? { ...prev, [key]: undefined } : prev,
    );
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate(form);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      range_km: Number(form.range),
      from_time: Number(form.estimateTime),
      status: form.status === "active" ? 1 : 0,
    };

    try {
      if (mode === "edit" && record) {
        await api.post(
          `/restaurant/drivers/driver-estimate-time/${record.id}`,
          payload,
        );
      } else {
        await api.post(
          "/restaurant/drivers/driver-estimate-time",
          payload,
        );
      }

      onSaved();
    } catch (error) {
      const responseData = error.response?.data;

      if (responseData?.errors) {
        setErrors((prev) => ({
          ...prev,
          ...responseData.errors,
        }));
      }

      setSubmitError(
        responseData?.message ||
          error.message ||
          "Something went wrong while saving this record.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="det-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="det-modal" role="dialog" aria-modal="true">
        <header className="det-modal-header">
          <h2>
            {mode === "edit"
              ? "Edit Driver Estimate Time"
              : "Add Driver Estimate Time"}
          </h2>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="det-modal-body">
            <div className="det-modal-section-title">
              {mode === "edit" ? "Edit Record" : "Add New Record"}
            </div>

            <div className="det-form-grid">
              <div className="det-field-group">
                <label className="det-field-label">
                  Range (KM) <span className="det-required">*</span>
                </label>

                <input
                  ref={firstFieldRef}
                  className={`det-text-input ${
                    errors.range ? "det-text-input--error" : ""
                  }`}
                  placeholder="Enter range in KM"
                  value={form.range}
                  onChange={(e) => updateField("range", e.target.value)}
                />

                {errors.range && (
                  <span className="det-field-error">{errors.range}</span>
                )}
              </div>

              <div className="det-field-group">
                <label className="det-field-label">
                  Estimate Time (Minutes){" "}
                  <span className="det-required">*</span>
                </label>

                <input
                  className={`det-text-input ${
                    errors.estimateTime ? "det-text-input--error" : ""
                  }`}
                  placeholder="Enter time in minutes"
                  value={form.estimateTime}
                  onChange={(e) =>
                    updateField("estimateTime", e.target.value)
                  }
                />

                <p className="det-field-hint">
                  Example: 5, 10, 15, 20, 30 minutes
                </p>

                {errors.estimateTime && (
                  <span className="det-field-error">
                    {errors.estimateTime}
                  </span>
                )}
              </div>
            </div>

            <div className="det-field-group det-field-group--status">
              <label className="det-field-label">Status</label>

              <div className="det-radio-group">
                <label className="det-radio">
                  <input
                    type="radio"
                    name="status"
                    checked={form.status === "active"}
                    onChange={() => updateField("status", "active")}
                  />
                  Active
                </label>

                <label className="det-radio">
                  <input
                    type="radio"
                    name="status"
                    checked={form.status === "inactive"}
                    onChange={() => updateField("status", "inactive")}
                  />
                  Inactive
                </label>
              </div>
            </div>

            {submitError && (
              <p className="det-submit-error">{submitError}</p>
            )}
          </div>

          <footer className="det-modal-footer">
            {mode === "edit" && record ? (
              <div className="det-modal-meta">
                <span>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      x="4"
                      y="5"
                      width="16"
                      height="16"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M4 9h16M8 3v4M16 3v4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Created:{" "}
                  {formatDateTime(
                    record.created_at ?? record.createdAt,
                  )}
                </span>

                <span>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M12 7v5l3 2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Last Updated:{" "}
                  {formatDateTime(
                    record.updated_at ?? record.updatedAt,
                  )}
                </span>
              </div>
            ) : (
              <span />
            )}

            <div className="det-modal-actions">
              <button
                type="button"
                className="det-btn det-btn--secondary"
                onClick={mode === "edit" ? onClose : handleReset}
                disabled={isSubmitting}
              >
                {mode === "edit" ? "Cancel" : "Reset"}
              </button>

              <button
                type="submit"
                className="det-btn det-btn--primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving…"
                  : mode === "edit"
                  ? "Update Record"
                  : "Save Record"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function DeliveryEstimateTime() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [modalState, setModalState] = useState(null);

  /* Confirm Modal */
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: null,
    record: null,
  });

  const [confirmLoading, setConfirmLoading] = useState(false);

  /* Success Modal */
  const [successModal, setSuccessModal] = useState({
    show: false,
    title: "Success!",
    message: "",
  });

  const fetchRecords = useCallback(async (query = "") => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await api.get(
        "/restaurant/drivers/driver-estimate-time",
        {
          params: query ? { search: query } : {},
        },
      );

      const data = response.data?.data;

      setRecords(
        Array.isArray(data?.driver_times)
          ? data.driver_times
          : [],
      );

      setSelectedIds([]);
    } catch (error) {
      console.error(
        "Failed to load estimate time records:",
        error,
      );

      setLoadError(
        "Failed to load records. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchRecords]);

  const handleSaved = () => {
    setModalState(null);
    fetchRecords(searchTerm.trim());
  };

  /* -------------------------------------------------------------- */
  /* Open Confirm Modal                                             */
  /* -------------------------------------------------------------- */

  const openStatusConfirm = (record) => {
    setConfirmModal({
      show: true,
      type: "status",
      record,
    });
  };

  const openDeleteConfirm = (record) => {
    setConfirmModal({
      show: true,
      type: "delete",
      record,
    });
  };

  const openBulkDeleteConfirm = () => {
    if (selectedIds.length === 0) return;

    setConfirmModal({
      show: true,
      type: "bulk-delete",
      record: null,
    });
  };

  const closeConfirmModal = () => {
    if (confirmLoading) return;

    setConfirmModal({
      show: false,
      type: null,
      record: null,
    });
  };

  /* -------------------------------------------------------------- */
  /* Confirm Status Change                                          */
  /* -------------------------------------------------------------- */

  const confirmStatusChange = async () => {
    const record = confirmModal.record;

    if (!record) return;

    const nextStatus = isRecordActive(record) ? 0 : 1;

    setConfirmLoading(true);

    try {
      const response = await api.post(
        "/restaurant/drivers/driver-estimate-time/status",
        {
          id: record.id,
          status: nextStatus,
        },
      );

      if (response.data?.success) {
        setRecords((prev) =>
          prev.map((item) =>
            item.id === record.id
              ? { ...item, status: nextStatus }
              : item,
          ),
        );

        closeConfirmModal();

        setSuccessModal({
          show: true,
          title: "Success!",
          message:
            response.data?.message ||
            "Status updated successfully",
        });
      } else {
        throw new Error(
          response.data?.message ||
            "Failed to update status",
        );
      }
    } catch (error) {
      console.error(
        "Failed to update status:",
        error,
      );

      setConfirmLoading(false);

      setSuccessModal({
        show: true,
        title: "Failed",
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update status",
      });

      return;
    }

    setConfirmLoading(false);
  };

  /* -------------------------------------------------------------- */
  /* Confirm Single Delete                                          */
  /* -------------------------------------------------------------- */

  const confirmDelete = async () => {
    const record = confirmModal.record;

    if (!record) return;

    setConfirmLoading(true);

    try {
      const response = await api.delete(
        `/restaurant/drivers/driver-estimate-time/${record.id}`,
      );

      if (response.data?.success) {
        setRecords((prev) =>
          prev.filter((item) => item.id !== record.id),
        );

        setSelectedIds((prev) =>
          prev.filter((id) => id !== record.id),
        );

        closeConfirmModal();

        setSuccessModal({
          show: true,
          title: "Deleted Successfully",
          message:
            response.data?.message ||
            "Driver estimate time deleted successfully",
        });
      } else {
        throw new Error(
          response.data?.message ||
            "Failed to delete",
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete record:",
        error,
      );

      setConfirmLoading(false);

      setSuccessModal({
        show: true,
        title: "Delete Failed",
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete record",
      });

      return;
    }

    setConfirmLoading(false);
  };

  /* -------------------------------------------------------------- */
  /* Confirm Bulk Delete                                            */
  /* -------------------------------------------------------------- */

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setConfirmLoading(true);

    try {
      const response = await api.post(
        "/restaurant/drivers/driver-estimate-time/bulk-delete",
        {
          ids: selectedIds,
        },
      );

      if (response.data?.success) {
        setRecords((prev) =>
          prev.filter(
            (item) => !selectedIds.includes(item.id),
          ),
        );

        setSelectedIds([]);

        closeConfirmModal();

        setSuccessModal({
          show: true,
          title: "Deleted Successfully",
          message:
            response.data?.message ||
            "Records deleted successfully",
        });
      } else {
        throw new Error(
          response.data?.message ||
            "Failed to delete records",
        );
      }
    } catch (error) {
      console.error(
        "Failed to bulk delete records:",
        error,
      );

      setConfirmLoading(false);

      setSuccessModal({
        show: true,
        title: "Delete Failed",
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete records",
      });

      return;
    }

    setConfirmLoading(false);
  };

  /* -------------------------------------------------------------- */
  /* Confirm Action Router                                          */
  /* -------------------------------------------------------------- */

  const handleConfirmAction = () => {
    if (confirmModal.type === "status") {
      confirmStatusChange();
      return;
    }

    if (confirmModal.type === "delete") {
      confirmDelete();
      return;
    }

    if (confirmModal.type === "bulk-delete") {
      confirmBulkDelete();
    }
  };

  const toggleSelectAll = (checked) => {
    setSelectedIds(
      checked ? records.map((r) => r.id) : [],
    );
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id],
    );
  };

  const isAllSelected =
    records.length > 0 &&
    selectedIds.length === records.length;

  return (
    <div className="det-page">
      <h1 className="det-page-title">
        Driver Estimate Time Management
      </h1>

      <div className="det-card">
        <div className="det-card-header">
          <span>Total Records</span>
          <span className="det-badge-count">
            {records.length}
          </span>
        </div>

        <div className="det-toolbar">
          <button
            type="button"
            className="det-btn det-btn--primary"
            onClick={() =>
              setModalState({
                mode: "add",
                record: null,
              })
            }
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            Add New
          </button>

          <div className="det-search">
            <input
              type="text"
              className="det-search-input"
              placeholder="Search by range km or time"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

            <button
              type="button"
              className="det-search-btn"
              onClick={() =>
                fetchRecords(searchTerm.trim())
              }
              aria-label="Search"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="m20 20-3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="det-table-wrap">
          <table className="det-table">
            <thead>
              <tr>
                <th className="det-th-checkbox">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) =>
                      toggleSelectAll(e.target.checked)
                    }
                  />
                </th>

                <th>Sr. No</th>
                <th>Range (KM)</th>
                <th>Estimate Time (Minutes)</th>
                <th>Status</th>
                <th>Created At</th>
                <th className="det-th-action">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="det-empty-row"
                  >
                    Loading…
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td
                    colSpan={7}
                    className="det-empty-row det-empty-row--error"
                  >
                    {loadError}
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="det-empty-row"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                records.map((record, index) => {
                  const active =
                    isRecordActive(record);

                  return (
                    <tr key={record.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(
                            record.id,
                          )}
                          onChange={() =>
                            toggleSelectOne(record.id)
                          }
                        />
                      </td>

                      <td>{index + 1}</td>

                      <td>
                        {getRangeKm(record)}
                      </td>

                      <td>
                        <span className="det-time-pill">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="9"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            />
                            <path
                              d="M12 7v5l3 2"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>

                          {getEstimateMinutes(record)}{" "}
                          Minutes
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`det-toggle ${
                            active
                              ? "det-toggle--on"
                              : ""
                          }`}
                          onClick={() =>
                            openStatusConfirm(record)
                          }
                          role="switch"
                          aria-checked={active}
                          aria-label="Toggle status"
                        >
                          <span className="det-toggle-knob" />
                        </button>
                      </td>

                      <td>
                        {formatDateTime(
                          record.created_at ??
                            record.createdAt,
                        )}
                      </td>

                      <td>
                        <div className="det-action-group">
                          <button
                            type="button"
                            className="det-icon-btn det-icon-btn--edit"
                            onClick={() =>
                              setModalState({
                                mode: "edit",
                                record,
                              })
                            }
                            aria-label="Edit record"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          <button
                            type="button"
                            className="det-icon-btn det-icon-btn--delete"
                            onClick={() =>
                              openDeleteConfirm(record)
                            }
                            aria-label="Delete record"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bulk Delete */}
        {selectedIds.length > 0 && (
          <div className="det-table-footer det-table-footer--bulk">
            <button
              type="button"
              className="det-btn det-btn--danger"
              onClick={openBulkDeleteConfirm}
            >
              Delete Selected ({selectedIds.length})
            </button>
          </div>
        )}

        <div className="det-table-footer">
          Showing {records.length} of {records.length} entries
        </div>
      </div>

      {modalState && (
        <EstimateTimeModal
          mode={modalState.mode}
          record={modalState.record}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
        />
      )}

      {/* ---------------------------------------------------------- */}
      {/* Confirm Modal                                              */}
      {/* ---------------------------------------------------------- */}

      <ConfirmModal
        show={confirmModal.show}
        title={
          confirmModal.type === "status"
            ? "Change Status"
            : confirmModal.type === "bulk-delete"
            ? "Delete Selected Records"
            : "Delete Record"
        }
        message={
          confirmModal.type === "status"
            ? `Are you sure you want to ${
                confirmModal.record &&
                isRecordActive(confirmModal.record)
                  ? "deactivate"
                  : "activate"
              } this record?`
            : confirmModal.type === "bulk-delete"
            ? `Are you sure you want to delete ${selectedIds.length} selected records?`
            : `Are you sure you want to delete the ${
                confirmModal.record
                  ? getRangeKm(confirmModal.record)
                  : ""
              } record?`
        }
        confirmText={
          confirmModal.type === "status"
            ? "Yes, Change"
            : "Delete"
        }
        cancelText="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={closeConfirmModal}
        loading={confirmLoading}
      />

      {/* ---------------------------------------------------------- */}
      {/* Success Modal                                              */}
      {/* ---------------------------------------------------------- */}

      <SuccessModal
        show={successModal.show}
        title={successModal.title}
        message={successModal.message}
        buttonText="OK"
        onClose={() =>
          setSuccessModal({
            show: false,
            title: "Success!",
            message: "",
          })
        }
      />
    </div>
  );
}