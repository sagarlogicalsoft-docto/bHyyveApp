import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCopy,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaRegStar,
  FaStar,
  FaTrash,
} from "react-icons/fa";
import { MdClose, MdRateReview } from "react-icons/md";

import api from "../../../config/api";
import DataTable from "../../common/DataTable";
import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceConfirmModal from "../../common/modal/serviceModal/ServiceConfirmModal";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";

import "./appRatings.css";

// =========================================================
// API SERVICE (kept inline; move to a service layer later)
// =========================================================

const getReviewsRequest = () => api.get("/admin/app_reviews");

const markTestimonialRequest = (id) =>
  api.patch(`/admin/app_reviews/${id}/mark_testimonial`);

const removeTestimonialRequest = (id) =>
  api.patch(`/admin/app_reviews/${id}/remove_testimonial`);

const deleteReviewRequest = (id) => api.delete(`/admin/app_reviews/${id}`);

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

// =========================================================
// CONFIRM POPUP CONFIG
// =========================================================

const CONFIRM_CONFIG = {
  mark: {
    variant: "primary",
    title: "Mark as Testimonial?",
    message: (name) =>
      `Do you want to mark ${name}'s review as a testimonial?`,
    confirmText: "Yes, Mark",
    successTitle: "Marked as Testimonial!",
    successMessage: "The review is now featured as a testimonial.",
    errorMessage: "Could not mark review as testimonial.",
    request: markTestimonialRequest,
  },
  remove: {
    variant: "primary",
    title: "Remove Testimonial?",
    message: (name) => `Remove ${name}'s review from testimonials?`,
    confirmText: "Yes, Remove",
    successTitle: "Testimonial Removed!",
    successMessage: "The review has been removed from testimonials.",
    errorMessage: "Could not remove review from testimonials.",
    request: removeTestimonialRequest,
  },
  delete: {
    variant: "danger",
    title: "Delete Review?",
    message: (name) =>
      `Are you sure you want to delete ${name}'s review? This action cannot be undone.`,
    confirmText: "Yes, Delete",
    successTitle: "Review Deleted!",
    successMessage: "The review has been deleted successfully.",
    errorMessage: "Could not delete review.",
    request: deleteReviewRequest,
  },
};

const toExportRows = (reviews) =>
  reviews.map((item, index) => ({
    Sno: index + 1,
    Username: item.username,
    Rating: item.rating,
    Review: item.review,
    Dated: item.dated,
  }));

const AppRatings = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // confirm = null | { type: "mark" | "remove" | "delete", row }
  const [confirm, setConfirm] = useState(null);

  const [success, setSuccess] = useState({
    open: false,
    title: "",
    message: "",
  });

  const showSuccess = useCallback(
    (title, message) => setSuccess({ open: true, title, message }),
    []
  );

  // Stable reference so the success modal's auto-close timer isn't reset
  const closeSuccess = useCallback(
    () => setSuccess((previous) => ({ ...previous, open: false })),
    []
  );

  // =========================================================
  // GET APP REVIEWS
  // =========================================================

  const loadReviews = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const response = await getReviewsRequest();

      const responseData = response.data;
      const reviewData = Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData)
          ? responseData
          : [];

      setReviews(
        reviewData.map((item) => ({
          id: item.app_r_id ?? item.id,
          username: `${item.fname ?? ""} ${item.lname ?? ""}`.trim() || "—",
          userPicture: item.image || "",
          rating: item.rating ?? "—",
          review: item.review ?? "—",
          dated: item.r_dated ?? "—",
          testimonial:
            item.is_testimonial === true ||
            String(item.is_testimonial).toLowerCase() === "true" ||
            Number(item.is_testimonial) === 1,
        }))
      );
    } catch (err) {
      console.error("Get app reviews error:", err);
      setReviews([]);
      setError(
        getErrorMessage(err, "Could not load app reviews. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // =========================================================
  // OPEN CONFIRM
  // =========================================================

  const openConfirm = useCallback((type, row) => {
    setConfirm({ type, row });
  }, []);

  // =========================================================
  // CONFIRMED ACTION (mark / remove testimonial / delete)
  // Called by ServiceConfirmModal, which handles its own loading state.
  // Errors can't be shown inside that modal, so they go to the page alert.
  // =========================================================

  const handleConfirm = async () => {
    const { type, row } = confirm;
    const config = CONFIRM_CONFIG[type];

    try {
      const response = await config.request(row.id);

      setConfirm(null);

      if (response?.data?.success === false) {
        setError(response.data.message || config.errorMessage);
        return;
      }

      showSuccess(
        config.successTitle,
        response?.data?.message || config.successMessage
      );

      await loadReviews(true);
    } catch (err) {
      console.error(`${type} review error:`, err);
      setConfirm(null);
      setError(getErrorMessage(err, config.errorMessage));
    }
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "Sno",
        sortable: true,
        render: (_, row, index) => (
          <span className="app-ratings-serial">{index + 1}</span>
        ),
      },
      {
        key: "username",
        label: "User",
        sortable: true,
        render: (value, row) => (
          <div className="app-ratings-user">
            <span className="app-ratings-avatar">
              <span className="app-ratings-avatar-initial">
                {value === "—" ? "?" : value.charAt(0).toUpperCase()}
              </span>

              {row.userPicture && (
                <img
                  src={row.userPicture}
                  alt={value}
                  className="app-ratings-avatar-img"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}
            </span>

            <span className="app-ratings-username">{value}</span>
          </div>
        ),
      },
      {
        key: "rating",
        label: "Rating",
        sortable: true,
        render: (value) => {
          const score = Number(value);

          if (Number.isNaN(score)) {
            return <span className="app-ratings-muted">—</span>;
          }

          return (
            <div className="app-ratings-rating" title={`${score} / 5`}>
              <span className="app-ratings-stars" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => (
                  <FaStar
                    key={n}
                    className={`app-ratings-star${
                      n <= Math.round(score) ? " is-filled" : ""
                    }`}
                  />
                ))}
              </span>

              <span className="app-ratings-rating-value">{score}</span>
            </div>
          );
        },
      },
      {
        key: "review",
        label: "Review",
        sortable: true,
        render: (value) => (
          <span className="app-ratings-review" title={value}>
            {value}
          </span>
        ),
      },
      {
        key: "dated",
        label: "Dated",
        sortable: true,
        render: (value) => <span className="app-ratings-date">{value}</span>,
      },
      {
        key: "testimonial",
        label: "Status",
        sortable: false,
        render: (value) => (
          <span
            className={`app-ratings-badge${
              value ? " app-ratings-badge--active" : ""
            }`}
          >
            {value ? "Testimonial" : "Regular"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Action",
        sortable: false,
        render: (_, row) => (
          <div className="app-ratings-actions">
            <button
              type="button"
              className={`app-ratings-testimonial-btn${
                row.testimonial ? " app-ratings-testimonial-btn--remove" : ""
              }`}
              onClick={() =>
                openConfirm(row.testimonial ? "remove" : "mark", row)
              }
            >
              {row.testimonial ? (
                <FaRegStar aria-hidden="true" />
              ) : (
                <FaStar aria-hidden="true" />
              )}
              {row.testimonial ? "Remove Testimonial" : "Add Testimonial"}
            </button>

            <button
              type="button"
              className="app-ratings-delete-btn"
              onClick={() => openConfirm("delete", row)}
            >
              <FaTrash aria-hidden="true" />
              Delete
            </button>
          </div>
        ),
      },
    ],
    [openConfirm]
  );

  // =========================================================
  // COPY EXPORT
  // =========================================================

  const handleCopy = async () => {
    const text = reviews
      .map(
        (item, index) =>
          `${index + 1}\t${item.username}\t${item.rating}\t${item.review}\t${item.dated}`
      )
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      showSuccess("Copied!", "Reviews copied to clipboard.");
    } catch (err) {
      console.error("Copy failed:", err);
      setError("Could not copy reviews.");
    }
  };

  // =========================================================
  // EXCEL EXPORT
  // =========================================================

  const handleExcel = async () => {
    try {
      const XLSX = await import("xlsx");

      const worksheet = XLSX.utils.json_to_sheet(toExportRows(reviews));
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "App Reviews");
      XLSX.writeFile(workbook, "AppReviews.xlsx");
    } catch (err) {
      console.error("Excel export failed:", err);
      setError("Could not export Excel file.");
    }
  };

  // =========================================================
  // CSV EXPORT
  // =========================================================

  const handleCSV = async () => {
    try {
      const XLSX = await import("xlsx");

      const worksheet = XLSX.utils.json_to_sheet(toExportRows(reviews));
      const csv = XLSX.utils.sheet_to_csv(worksheet);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "AppReviews.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
      setError("Could not export CSV file.");
    }
  };

  // =========================================================
  // PDF EXPORT
  // =========================================================

  const handlePDF = async () => {
    try {
      const jsPDFModule = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");

      const { jsPDF } = jsPDFModule;
      const doc = new jsPDF("landscape");

      autoTableModule.default(doc, {
        head: [["Sno", "Username", "Rating", "Review", "Dated"]],
        body: reviews.map((item, index) => [
          index + 1,
          item.username,
          item.rating,
          item.review,
          item.dated,
        ]),
        startY: 20,
      });

      doc.save("AppReviews.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
      setError("Could not export PDF file.");
    }
  };

  // =========================================================
  // UI
  // =========================================================

  const config = confirm ? CONFIRM_CONFIG[confirm.type] : null;
  const testimonialCount = reviews.filter((item) => item.testimonial).length;
  const exportDisabled = loading || reviews.length === 0;

  const exportButtons = [
    { label: "Copy", icon: <FaCopy />, onClick: handleCopy },
    { label: "Excel", icon: <FaFileExcel />, onClick: handleExcel },
    { label: "CSV", icon: <FaFileCsv />, onClick: handleCSV },
    { label: "PDF", icon: <FaFilePdf />, onClick: handlePDF },
  ];

  return (
    <div className="app-ratings-page">
      {/* PAGE HEADER */}

      <div className="app-ratings-header">
        <h2 className="app-ratings-title">App Reviews</h2>
        <ServiceBreadcrumbs items={[{ label: "App Reviews" }]} />
      </div>

      {/* MAIN CARD */}

      <div className="app-ratings-card">
        {/* TOOLBAR */}

        <div className="app-ratings-toolbar">
          <div className="app-ratings-toolbar-info">
            <span className="app-ratings-toolbar-icon" aria-hidden="true">
              <MdRateReview />
            </span>

            <div>
              <h3>All App Reviews</h3>
              <p>
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                {testimonialCount > 0 &&
                  ` · ${testimonialCount} ${
                    testimonialCount === 1 ? "testimonial" : "testimonials"
                  }`}
              </p>
            </div>
          </div>

          <div className="app-ratings-export-buttons">
            {exportButtons.map((item) => (
              <button
                key={item.label}
                type="button"
                className="app-ratings-export-btn"
                onClick={item.onClick}
                disabled={exportDisabled}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* API ERROR */}

        {error && (
          <div className="app-ratings-error" role="alert">
            <span>{error}</span>

            <div className="app-ratings-error-actions">
              <button
                type="button"
                className="app-ratings-retry-btn"
                onClick={() => loadReviews()}
                disabled={loading}
              >
                Retry
              </button>

              <button
                type="button"
                className="app-ratings-error-close"
                onClick={() => setError(null)}
                aria-label="Dismiss"
              >
                <MdClose />
              </button>
            </div>
          </div>
        )}

        {/* LOADING / EMPTY / TABLE */}

        {loading && (
          <p className="app-ratings-state">
            <span className="app-ratings-spinner" aria-hidden="true" />
            Loading app reviews...
          </p>
        )}

        {!loading && !error && reviews.length === 0 && (
          <p className="app-ratings-state">No app reviews found.</p>
        )}

        <div className="app-ratings-table-wrapper">
          {!loading && reviews.length > 0 && (
            <DataTable
              columns={columns}
              data={reviews}
              entriesPerPageOptions={[10, 25, 50, 100]}
              defaultEntriesPerPage={10}
              searchable={true}
              sortable={true}
            />
          )}
        </div>
      </div>

      {/* CONFIRM + SUCCESS MODALS */}

      <ServiceConfirmModal
        isOpen={Boolean(confirm)}
        variant={config?.variant || "primary"}
        title={config?.title}
        message={config ? config.message(confirm.row.username) : ""}
        confirmText={config?.confirmText}
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      <ServiceSuccessModal
        isOpen={success.open}
        title={success.title}
        message={success.message}
        onClose={closeSuccess}
      />
    </div>
  );
};

export default AppRatings;