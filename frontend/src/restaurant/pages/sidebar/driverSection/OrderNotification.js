import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../config/api";
import "./orderNotification.css";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
const BellIcon = () => (
  <svg
    className="on-header-icon"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function StatusBadge({ isSeen }) {
  return (
    <span
      className={`on-badge ${isSeen ? "on-badge--seen" : "on-badge--unseen"}`}
    >
      {isSeen ? "Seen" : "Unseen"}
    </span>
  );
}

function truncate(text, max = 42) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function OrderNotification() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  // -------------------------------------------------------------------------
  // Search debounce
  // -------------------------------------------------------------------------
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(handle);
  }, [searchInput]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/restaurant/notifications");

      const data = response.data;

      setNotifications(data.notifications || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while loading notifications.",
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // -------------------------------------------------------------------------
  // Client-side search
  // -------------------------------------------------------------------------
  const filteredNotifications = useMemo(() => {
    if (!search) {
      return notifications;
    }

    const searchText = search.toLowerCase();

    return notifications.filter((notification) => {
      return (
        String(notification.title || "")
          .toLowerCase()
          .includes(searchText) ||
        String(notification.message || "")
          .toLowerCase()
          .includes(searchText) ||
        String(notification.sender_type || "")
          .toLowerCase()
          .includes(searchText) ||
        String(notification.receiver_type || "")
          .toLowerCase()
          .includes(searchText) ||
        String(notification.types || "")
          .toLowerCase()
          .includes(searchText)
      );
    });
  }, [notifications, search]);

  // -------------------------------------------------------------------------
  // Client-side pagination
  // -------------------------------------------------------------------------
  const total = filteredNotifications.length;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;

    return filteredNotifications.slice(start, end);
  }, [filteredNotifications, page, limit]);

  // If changing search/page size makes current page invalid
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // -------------------------------------------------------------------------
  // Selection
  // -------------------------------------------------------------------------
  const allSelected =
    paginatedRows.length > 0 &&
    paginatedRows.every((row) => selectedIds.includes(row.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedRows.some((row) => row.id === id)),
      );
    } else {
      setSelectedIds((prev) => {
        const idsToAdd = paginatedRows
          .map((row) => row.id)
          .filter((id) => !prev.includes(id));

        return [...prev, ...idsToAdd];
      });
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  // -------------------------------------------------------------------------
  // Open notification
  //
  // Backend:
  // GET /restaurant/notifications/:id
  //
  // This marks is_seen_admin = 1 and returns the booking/order information.
  // -------------------------------------------------------------------------
  const handleOpen = async (row) => {
    try {
      const response = await api.get(`/restaurant/notifications/${row.id}`);

      const data = response.data;

      // Mark locally as seen
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, is_seen_admin: 1 } : item,
        ),
      );

      // The backend response contains the booking/order information.
      const bookingId =
        data?.booking_id ||
        data?.booked_id ||
        data?.notification?.booked_id ||
        data?.data?.booked_id;

      if (bookingId) {
        navigate(`/restaurant/order_notification/view/${row.id}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to open notification.",
      );
    }
  };

  // -------------------------------------------------------------------------
  // Bulk delete
  //
  // POST Restaurant/bulk_delete_restaurant_notifications
  // body: { ids: ids }
  // -------------------------------------------------------------------------

  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;

    setShowDeleteConfirm(true);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    setDeleteLoading(true);

    try {
      await api.post("/restaurant/notifications/bulk-delete", {
        ids: selectedIds,
      });

      // Store count before clearing selectedIds
      setDeletedCount(selectedIds.length);

      // Remove deleted notifications from local list
      setNotifications((prev) =>
        prev.filter((notification) => !selectedIds.includes(notification.id)),
      );

      // Clear selected notifications
      setSelectedIds([]);

      // Close confirmation modal
      setShowDeleteConfirm(false);

      // Show success modal
      setShowDeleteSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete selected notifications.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Range label
  // -------------------------------------------------------------------------
  const rangeLabel = useMemo(() => {
    if (total === 0) {
      return "Showing 0 of 0";
    }

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return `Showing ${start}–${end} of ${total}`;
  }, [page, limit, total]);

  // -------------------------------------------------------------------------
  // Pagination numbers
  // -------------------------------------------------------------------------
  const pageNumbers = useMemo(() => {
    const pages = [];
    const windowSize = 1;

    for (let p = 1; p <= totalPages; p++) {
      if (
        p === 1 ||
        p === totalPages ||
        (p >= page - windowSize && p <= page + windowSize)
      ) {
        pages.push(p);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  }, [page, totalPages]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="on-page">
      <div className="on-page-header">
        <span className="on-header-icon-wrap">
          <BellIcon />
        </span>

        <h1 className="on-page-title">Restaurant Notifications</h1>
      </div>

      <div className="on-card">
        {/* --------------------------------------------------------------- */}
        {/* Top bar */}
        {/* --------------------------------------------------------------- */}
        <div className="on-card-topbar">
          <div className="on-total-badge">
            <span className="on-total-label">Total Notifications</span>

            <span className="on-total-count">{total}</span>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Toolbar */}
        {/* --------------------------------------------------------------- */}
        <div className="on-toolbar">
          <div className="on-show-entries">
            <span>Show</span>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <span>entries</span>
          </div>

          <div className="on-search">
            <input
              type="text"
              placeholder="Search by title, message, sender..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            <button
              className="on-search-btn"
              onClick={() => {
                setSearch(searchInput.trim());
                setPage(1);
              }}
              aria-label="Search"
            >
              <SearchIcon />
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Table */}
        {/* --------------------------------------------------------------- */}
        <div className="on-table-wrap">
          <table className="on-table">
            <thead>
              <tr>
                <th className="on-checkbox-col">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>

                <th>Sr.No</th>
                <th>Title</th>
                <th>Message</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Type</th>
                <th>Status</th>
                <th className="on-action-col">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="on-state-cell">
                    Loading notifications…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={9}
                    className="on-state-cell on-state-cell--error"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && paginatedRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="on-state-cell">
                    No notifications found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                paginatedRows.map((row, index) => {
                  const isUnseen = Number(row.is_seen_admin) === 0;

                  return (
                    <tr
                      key={row.id}
                      className={isUnseen ? "on-row--unseen" : ""}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>

                      <td>{(page - 1) * limit + index + 1}</td>

                      <td className="on-cell-title">{row.title}</td>

                      <td className="on-cell-message" title={row.message}>
                        {truncate(row.message)}
                      </td>

                      <td className="on-cell-muted">{row.sender_type}</td>

                      <td className="on-cell-muted">{row.receiver_type}</td>

                      <td className="on-cell-muted">{row.types}</td>

                      <td>
                        <StatusBadge isSeen={!isUnseen} />
                      </td>

                      <td>
                        <button
                          className="on-open-btn"
                          onClick={() => handleOpen(row)}
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Pagination */} 
        {/* --------------------------------------------------------------- */}
        <div className="on-pagination">
          <span className="on-range-label">{rangeLabel}</span>

          <div className="on-pagination-controls">
            <button
              className="on-page-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>

            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="on-page-ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  className={`on-page-btn ${
                    p === page ? "on-page-btn--active" : ""
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ),
            )}

            <button
              className="on-page-btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
        {/* Selected notification actions */}
        {/* --------------------------------------------------------------- */}
        {selectedIds.length > 0 && (
          <div className="on-selection-actions">
            <button
              type="button"
              className="on-cancel-btn"
              onClick={() => setSelectedIds([])}
              disabled={deleteLoading}
            >
              Cancel
            </button>

            <button
              type="button"
              className="on-delete-btn"
              onClick={handleDeleteClick}
              disabled={deleteLoading}
            >
              Delete Selected ({selectedIds.length})
            </button>
          </div>
        )}

      {/* --------------------------------------------------------------- */}
      {/* Delete confirmation modal */}
      {/* --------------------------------------------------------------- */}
      <ConfirmModal
        show={showDeleteConfirm}
        title="Delete Notifications"
        message={`Are you sure you want to delete ${selectedIds.length} selected notification${
          selectedIds.length > 1 ? "s" : ""
        }?`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDeleteSelected}
        onCancel={() => {
          if (!deleteLoading) {
            setShowDeleteConfirm(false);
          }
        }}
      />

      {/* --------------------------------------------------------------- */}
      {/* Delete success modal */}
      {/* --------------------------------------------------------------- */}
      <SuccessModal
        show={showDeleteSuccess}
        title="Notifications Deleted"
        message={`${deletedCount} notification${
          deletedCount > 1 ? "s have" : " has"
        } been deleted successfully.`}
        buttonText="OK"
        onClose={() => {
          setShowDeleteSuccess(false);
        }}
      />
    </div>
  );
}