import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import "./storeReviews.css";
import api from "../../../../config/api";
import StoreHeaderCommon from "./StoreHeaderCommon";
import Breadcrumbs from "../../common/BreadCrumbs";

const RATING_BREAKDOWN_ROWS = [
  { key: "excellent", label: "Excellent" },
  { key: "good", label: "Good" },
  { key: "average", label: "Average" },
  { key: "belowAverage", label: "Below average" },
  { key: "poor", label: "Poor" },
];

const EXPORT_FORMATS = [
  { key: "csv", label: "Export as CSV" },
  { key: "pdf", label: "Export as PDF" },
];

/* ------------------------------------------------------------------ *
 * Service layer — swap the endpoint paths / payload shape below for
 * the real API. Every call site only depends on this object, so
 * wiring up the backend later means editing this block alone.
 * ------------------------------------------------------------------ */

const ReviewsService = {
  getSummary(storeId, { signal } = {}) {
    return api.get(`/restaurant/stores/${storeId}/reviews/summary`, {
      signal,
    });
  },

  getReviews({ storeId, page = 1, pageSize = 10, signal } = {}) {
    return api.get(`/restaurant/stores/${storeId}/reviews`, {
      params: {
        page,
        pageSize,
      },
      signal,
    });
  },

  replyToReview(storeId, reviewId, message, { signal } = {}) {
    return api.post(
      `/restaurant/stores/${storeId}/reviews/${reviewId}/reply`,
      { message },
      { signal },
    );
  },

  exportReviews(storeId, format, { signal } = {}) {
    return api.get(`/restaurant/stores/${storeId}/reviews/export`, {
      params: { format },
      responseType: "blob",
      signal,
    });
  },
};

/* ------------------------------------------------------------------ *
 * Formatting helpers
 * ------------------------------------------------------------------ */

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getBarPercent(count, total) {
  if (!total) return 0;
  const numeric = Number(count) || 0;
  return Math.min(100, Math.round((numeric / total) * 100));
}

/* ------------------------------------------------------------------ *
 * Inline icon set — kept as small local functions (not separate
 * files/exports) so the deliverable stays to StoreReviews.js/.css.
 * ------------------------------------------------------------------ */

function IconStar({ filled, ...props }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3.5l2.6 5.4 5.9.6-4.4 4 1.3 5.8L12 16.5l-5.4 2.8 1.3-5.8-4.4-4 5.9-.6L12 3.5z" />
    </svg>
  );
}

function IconDownload(props) {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3.5v12M8 12l4 4 4-4" />
      <path d="M4.5 17v2.2a1.8 1.8 0 001.8 1.8h11.4a1.8 1.8 0 001.8-1.8V17" />
    </svg>
  );
}

function IconChevronDown(props) {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 8.5l7 7 7-7" />
    </svg>
  );
}

function IconAlert(props) {
  return (
    <svg width={56} height={56} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 3.5L21.5 20h-19L12 3.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M12 9.5v4.2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="16.7" r="1" fill="currentColor" />
    </svg>
  );
}

function IconRefresh(props) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 12a8 8 0 0113.9-5.4M20 12a8 8 0 01-13.9 5.4" />
      <path d="M17 4v3h-3M7 20v-3h3" />
    </svg>
  );
}

// Small line-art "no data" illustration, kept local so the component
// stays self-contained (no external image asset to wire up later).
function IconNoData(props) {
  return (
    <svg width={170} height={150} viewBox="0 0 170 150" fill="none" {...props}>
      <ellipse cx="85" cy="120" rx="55" ry="10" fill="var(--sr-canvas)" />
      <path
        d="M78 42c6-10 16-14 22-8s2 16-4 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="82" cy="40" r="14" stroke="currentColor" strokeWidth="2" />
      <circle cx="94" cy="46" r="1.6" fill="var(--sr-primary)" />
      <path d="M74 56c-3 4-3 9 0 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M69 70c4-6 12-9 18-9s15 3 19 10c4 7 5 20 3 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M69 70c-8 4-14 12-17 20-2 5-6 9-9 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M96 78c8 2 14 10 15 20-1 6-3 12-2 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="41" cy="103" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="112" cy="118" r="6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export default function StoreReviews({ onReplyReview, pageSize = 10 }) {
  const { id } = useParams();

  const [page, setPage] = useState(1);

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    average: 0,
    totalReviews: 0,
    breakdown: {},
  });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const abortRef = useRef(null);
  const exportMenuRef = useRef(null);

  const loadReviews = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const [reviewsResponse, summaryResponse] = await Promise.all([
        ReviewsService.getReviews({
          storeId: id,
          page,
          pageSize,
          signal: controller.signal,
        }),

        ReviewsService.getSummary(id, {
          signal: controller.signal,
        }),
      ]);

      const reviewsData = reviewsResponse.data;
      const summaryData = summaryResponse.data;

      setReviews(reviewsData?.data || []);
      setTotalCount(reviewsData?.totalCount || 0);
      setTotalPages(reviewsData?.totalPages || 1);
      setSummary({
        average: summaryData?.average || 0,
        totalReviews: summaryData?.totalReviews || 0,
        breakdown: summaryData?.breakdown || {},
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong while loading reviews.");
        setReviews([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, page, pageSize]);

  useEffect(() => {
    loadReviews();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [loadReviews]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  async function handleExport(format) {
    setIsExportOpen(false);
    setIsExporting(true);
    try {
      const response = await ReviewsService.exportReviews(id, format);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reviews.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Couldn't export reviews right now.");
    } finally {
      setIsExporting(false);
    }
  }

  function handleReply(review) {
    if (onReplyReview) onReplyReview(review);
  }

  const visibleCount = reviews.length;
  const roundedAverage = Number(summary.average || 0).toFixed(1);

  return (
    <>
     <div className="breadcrumb-wrapper">
      <Breadcrumbs
        items={[
          {
            label: "Stores",
            path: "/restaurant/stores_list",
          },
          {
            label: "Reviews",
          },
        ]}
      />
    </div>
     <div className="store-reviews-page">
      <StoreHeaderCommon
        storeName="Country Fair"
        storeId={id}
        storeStatus="Active"
      />
    <div className="store-reviews">
      <div className="store-reviews__overview">
        <div className="store-reviews__rating">
          <div className="store-reviews__rating-value">
            {roundedAverage}
            <span className="store-reviews__rating-max">/5</span>
          </div>
          <div className="store-reviews__stars" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <IconStar key={i} filled={i < Math.round(summary.average || 0)} />
            ))}
          </div>
          <div className="store-reviews__rating-count">
            {summary.totalReviews} {summary.totalReviews === 1 ? "Review" : "Reviews"}
          </div>
        </div>

        <div className="store-reviews__breakdown">
          {RATING_BREAKDOWN_ROWS.map((row) => {
            const count = summary.breakdown?.[row.key] || 0;
            const percent = getBarPercent(count, summary.totalReviews);
            return (
              <div className="breakdown-row" key={row.key}>
                <span className="breakdown-row__label">{row.label}</span>
                <span className="breakdown-row__track">
                  <span
                    className="breakdown-row__fill"
                    style={{ width: `${percent}%` }}
                  />
                </span>
                <span className="breakdown-row__count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="store-reviews__panel">
        <div className="store-reviews__panel-header">
          <div className="store-reviews__panel-title">
            <h2>Review List</h2>
            <span className="store-reviews__count-pill">{totalCount}</span>
          </div>

          <div className="store-reviews__export" ref={exportMenuRef}>
            <button
              type="button"
              className="store-reviews__export-btn"
              onClick={() => setIsExportOpen((open) => !open)}
              disabled={isExporting}
              aria-haspopup="true"
              aria-expanded={isExportOpen}
            >
              <IconDownload />
              {isExporting ? "Exporting…" : "Export"}
              <IconChevronDown />
            </button>

            {isExportOpen && (
              <div className="store-reviews__export-menu" role="menu">
                {EXPORT_FORMATS.map((format) => (
                  <button
                    key={format.key}
                    type="button"
                    role="menuitem"
                    onClick={() => handleExport(format.key)}
                  >
                    {format.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="store-reviews__table-wrap">
          <table className="store-reviews__table">
            <thead>
              <tr>
                <th className="col-index">Sl</th>
                <th>Review Id</th>
                <th>Item</th>
                <th>Reviewer Info</th>
                <th>Review</th>
                <th>Date</th>
                <th>Store Reply</th>
                <th className="col-status">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="row-skeleton" aria-hidden="true">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j}>
                        <span className="skeleton-bar" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading &&
                !error &&
                reviews.map((review, index) => (
                  <tr key={review.id}>
                    <td className="col-index">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="cell-mono">#{review.reviewNumber || review.id}</td>
                    <td>{review.itemName || "—"}</td>
                    <td>
                      <div className="cell-reviewer">
                        <span className="cell-reviewer__name">
                          {review.reviewerName || "Anonymous"}
                        </span>
                        {review.reviewerEmail && (
                          <span className="cell-reviewer__email">
                            {review.reviewerEmail}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="cell-review">
                        <span className="cell-review__stars" aria-hidden="true">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <IconStar
                              key={i}
                              filled={i < (review.rating || 0)}
                            />
                          ))}
                        </span>
                        {review.comment && (
                          <span className="cell-review__text">{review.comment}</span>
                        )}
                      </div>
                    </td>
                    <td className="cell-date">{formatDate(review.createdAt)}</td>
                    <td>
                      {review.storeReply ? (
                        <span className="cell-reply">{review.storeReply}</span>
                      ) : (
                        <button
                          type="button"
                          className="cell-reply-btn"
                          onClick={() => handleReply(review)}
                        >
                          Reply
                        </button>
                      )}
                    </td>
                    <td className="col-status">
                      <span
                        className={`status-chip status-chip--${review.status || "published"}`}
                      >
                        {review.status || "Published"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!isLoading && !error && visibleCount === 0 && (
            <div className="store-reviews__empty">
              <IconNoData className="store-reviews__empty-icon" />
              <p className="store-reviews__empty-title">No Data Found</p>
            </div>
          )}

          {error && (
            <div className="store-reviews__error">
              <IconAlert className="store-reviews__error-icon" />
              <p className="store-reviews__empty-title">Couldn't load reviews</p>
              <p className="store-reviews__error-copy">{error}</p>
              <button type="button" className="store-reviews__retry" onClick={loadReviews}>
                <IconRefresh />
                Retry
              </button>
            </div>
          )}
        </div>

        {!isLoading && !error && totalPages > 1 && (
          <div className="store-reviews__pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  </>
  );
}