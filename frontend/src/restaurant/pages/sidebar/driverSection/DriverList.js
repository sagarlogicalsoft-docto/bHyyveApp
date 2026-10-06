import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./driverList.css";
import api from "../../../../config/api";
import { getImage } from "../../../../Components/utils/images";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";

const DRIVER_STATUS_TABS = [
  { key: "all", label: "All Drivers", queryValue: null },
  { key: "active", label: "Active", queryValue: "active" },
  { key: "inactive", label: "Inactive", queryValue: "inactive" },
];

const DriversService = {
  getDrivers({ search, signal } = {}) {
    return api.get(`/restaurant/drivers`, {
      params: {
        search: search || undefined,
      },
      signal,
    });
  },

  updateDriverStatus(driverId, { signal } = {}) {
    return api.patch(`/restaurant/drivers/${driverId}/status`, {}, { signal });
  },

  deleteDriver(driverId, { signal } = {}) {
    return api.delete(`/restaurant/drivers/${driverId}`, { signal });
  },

  deleteDrivers(driverIds, { signal } = {}) {
    return api.delete(`/restaurant/drivers/bulk`, {
      data: {
        driver_ids: driverIds,
      },
      signal,
    });
  },
};

/* ------------------------------------------------------------------ *
 * Inline icon set — kept as small local functions (not separate
 * files/exports) so the deliverable stays to DriverList.js/.css.
 * ------------------------------------------------------------------ */

function IconDriverBadge(props) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 16V9a1 1 0 011-1h9l4 4h3v4" />
      <path d="M17 8v5h4" />
      <circle cx="7.5" cy="17.5" r="2" />
      <circle cx="16.5" cy="17.5" r="2" />
      <circle cx="18" cy="5" r="3.4" />
      <path d="M18 3.6v1.8l1.2.8" />
    </svg>
  );
}

function IconSearch(props) {
  return (
    <svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  );
}

function IconEye(props) {
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
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEdit(props) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 20l4.2-.8L20 7.4a2 2 0 000-2.8l-.6-.6a2 2 0 00-2.8 0L4.8 15.8 4 20z" />
      <path d="M14 6l4 4" />
    </svg>
  );
}

function IconTrash(props) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4.5 7h15M9.5 7V5a1.5 1.5 0 011.5-1.5h2A1.5 1.5 0 0114.5 5v2M18 7l-.8 12.2a2 2 0 01-2 1.8H8.8a2 2 0 01-2-1.8L6 7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function IconCheckCircle(props) {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.3l2.4 2.4 4.6-5.2" />
    </svg>
  );
}

function IconBan(props) {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M6.5 6.5l11 11" />
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
      <path
        d="M12 9.5v4.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
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

function IconEmptyDrivers(props) {
  return (
    <svg width={72} height={72} viewBox="0 0 72 72" fill="none" {...props}>
      <rect
        x="10"
        y="30"
        width="52"
        height="20"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16 30l6-13h28l6 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="52" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="52" r="5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function DriverList({
  onViewDriver,
  onEditDriver,
  pageSize = 10,
}) {
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [drivers, setDrivers] = useState([]);
  const [counts, setCounts] = useState({});
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const searchDebounceRef = useRef(null);
  const abortRef = useRef(null);

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: null,
    driver: null,
  });

  const navigate = useNavigate();

  const [successModal, setSuccessModal] = useState({
    show: false,
    title: "",
    message: "",
  });

  const loadDrivers = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await DriversService.getDrivers({
        search: searchTerm,
        signal: controller.signal,
      });

      const data = response.data?.data;

      const allDrivers = data?.drivers || [];

      setDrivers(allDrivers);

      setTotalCount(data?.total_drivers || 0);

      setCounts({
        all: data?.total_drivers || 0,
        active: data?.active_drivers || 0,
        inactive: data?.inactive_drivers || 0,
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Something went wrong while loading drivers.",
        );

        setDrivers([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  const filteredDrivers = drivers.filter((driver) => {
    if (activeStatus === "active") {
      return Number(driver.status) === 1;
    }

    if (activeStatus === "inactive") {
      return Number(driver.status) === 0;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));

  const paginatedDrivers = filteredDrivers.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  useEffect(() => {
    loadDrivers();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [loadDrivers]);

  useEffect(() => {
    setSelectedIds([]);
  }, [drivers]);

  function handleStatusChange(key) {
    setActiveStatus(key);
    setPage(1);
  }

  function handleSearchInputChange(event) {
    const value = event.target.value;
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchTerm(value.trim());
      setPage(1);
    }, 400);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setSearchTerm(searchInput.trim());
    setPage(1);
  }

  function toggleSelectAll(event) {
    setSelectedIds(
      event.target.checked ? filteredDrivers.map((d) => d.id) : [],
    );
  }

  function toggleSelectRow(driverId) {
    setSelectedIds((prev) =>
      prev.includes(driverId)
        ? prev.filter((id) => id !== driverId)
        : [...prev, driverId],
    );
  }

  function handleToggleStatus(driver) {
    setConfirmModal({
      show: true,
      type: "status",
      driver,
    });
  }

  function handleDelete(driver) {
    setConfirmModal({
      show: true,
      type: "delete",
      driver,
    });
  }

  async function confirmDeleteDriver() {
    const driver = confirmModal.driver;

    if (!driver) return;

    setBusyId(driver.id);

    try {
      await DriversService.deleteDriver(driver.id);

      setConfirmModal({
        show: false,
        type: null,
        driver: null,
      });

      await loadDrivers();

      setSuccessModal({
        show: true,
        title: "Driver Deleted",
        message: "Driver deleted successfully!",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Couldn't delete that driver.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function confirmToggleStatus() {
    const driver = confirmModal.driver;

    if (!driver) return;

    setBusyId(driver.id);

    try {
      await DriversService.updateDriverStatus(driver.id);

      setConfirmModal({
        show: false,
        type: null,
        driver: null,
      });

      await loadDrivers();

      setSuccessModal({
        show: true,
        title: "Status Updated",
        message: "Driver status updated successfully.",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update driver status.",
      );
    } finally {
      setBusyId(null);
    }
  }

  function handleBulkDelete() {
    if (selectedIds.length === 0) return;

    setConfirmModal({
      show: true,
      type: "bulk-delete",
      driver: null,
    });
  }

  async function confirmBulkDelete() {
    if (selectedIds.length === 0) return;

    try {
      await DriversService.deleteDrivers(selectedIds);

      setSelectedIds([]);

      setConfirmModal({
        show: false,
        type: null,
        driver: null,
      });

      await loadDrivers();

      setSuccessModal({
        show: true,
        title: "Drivers Deleted",
        message: "Selected drivers deleted successfully!",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Couldn't delete the selected drivers.",
      );
    }
  }

  function handleView(driver) {
    navigate(`/restaurant/view_driver/${driver.id}`);
  }

  function handleEdit(driver) {
    navigate(`/restaurant/edit_driver/${driver.id}`);
  }

  const visibleCount = filteredDrivers.length;
  const allSelected =
    filteredDrivers.length > 0 &&
    filteredDrivers.every((driver) => selectedIds.includes(driver.id));

  return (
    <div className="driver-list">
      <div className="driver-list__header">
        <span className="driver-list__header-icon" aria-hidden="true">
          <IconDriverBadge />
        </span>
        <h1>Drivers</h1>
      </div>

      <div className="driver-list__summary-strip">
        {DRIVER_STATUS_TABS.map((tab) => {
          const isActive = tab.key === activeStatus;
          const count = tab.key === "all" ? counts.all : counts[tab.key];
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`summary-card${isActive ? " summary-card--selected" : ""} summary-card--${tab.key}`}
              onClick={() => handleStatusChange(tab.key)}
            >
              <span className="summary-card__label">{tab.label}</span>
              <span className="summary-card__count">
                {count === undefined || count === null ? "—" : count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="driver-list__panel">
        <div className="driver-list__panel-header">
          <div className="driver-list__panel-title">
            <h2>Driver List</h2>
            <span className="driver-list__count-pill">{totalCount}</span>
          </div>

          <form
            className="driver-list__search"
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <IconSearch className="driver-list__search-icon" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Search by name, email or phone..."
              aria-label="Search drivers"
            />
            <button type="submit" aria-label="Search drivers">
              <IconSearch />
            </button>
          </form>
        </div>

        <div className="driver-list__table-wrap">
          <table className="driver-list__table">
            <thead>
              <tr>
                <th className="col-checkbox">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all drivers"
                  />
                </th>
                <th className="col-index">Sr No</th>
                <th>Bank Info</th>
                <th>Driver Info</th>
                <th className="col-numeric">Total Trip</th>
                <th className="col-numeric">Complete</th>
                <th className="col-numeric">Cancelled</th>
                <th>Availability</th>
                <th className="col-status">Status</th>
                <th className="col-actions">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr
                    key={`skeleton-${i}`}
                    className="row-skeleton"
                    aria-hidden="true"
                  >
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j}>
                        <span className="skeleton-bar" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading &&
                !error &&
                paginatedDrivers.map((driver, index) => (
                  <tr key={driver.id}>
                    <td className="col-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(driver.id)}
                        onChange={() => toggleSelectRow(driver.id)}
                        aria-label={`Select ${driver.name || "driver"}`}
                      />
                    </td>
                    <td className="col-index">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td>
                      {driver.branch_name ? (
                        <span className="cell-bank cell-bank--filled">
                          {driver.branch_name}
                        </span>
                      ) : (
                        <span className="cell-bank cell-bank--empty">
                          Not added
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="cell-driver">
                        <span className="cell-driver__avatar">
                          {driver.profile_image ? (
                            <img src={getImage(driver.profile_image)} alt="" />
                          ) : (
                            (driver.first_name || "?").charAt(0).toUpperCase()
                          )}
                        </span>
                        <span className="cell-driver__text">
                          <span className="cell-driver__name">
                            {`${driver.first_name || ""} ${driver.last_name || ""}`.trim() ||
                              "Unnamed driver"}
                          </span>
                          {driver.email && (
                            <span className="cell-driver__line">
                              {driver.email}
                            </span>
                          )}
                          {driver.phone && (
                            <span className="cell-driver__line">
                              {driver.phone}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="col-numeric cell-mono">
                      {driver.total_trip ?? 0}
                    </td>
                    <td className="col-numeric cell-mono">
                      {driver.complete_trip ?? 0}
                    </td>
                    <td className="col-numeric cell-mono">
                      {driver.cancel_trip ?? 0}
                    </td>
                    <td>
                      <span
                        className={`availability-badge${
                          driver.is_available
                            ? " availability-badge--available"
                            : " availability-badge--unavailable"
                        }`}
                      >
                        {driver.is_available ? (
                          <IconCheckCircle />
                        ) : (
                          <IconBan />
                        )}
                        {driver.is_available ? "Available" : "Not Available"}
                      </span>
                    </td>
                    <td className="col-status">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Number(driver.status) === 1}
                        aria-label={`Toggle ${driver.name || "driver"} status`}
                        className={`status-toggle${
                          Number(driver.status) === 1
                            ? " status-toggle--on"
                            : ""
                        }`}
                        disabled={busyId === driver.id}
                        onClick={() => handleToggleStatus(driver)}
                      >
                        <span className="status-toggle__thumb" />
                      </button>
                    </td>
                    <td className="col-actions">
                      <div className="row-actions">
                        <button
                          type="button"
                          className="row-action row-action--view"
                          aria-label={`View ${driver.name || "driver"}`}
                          onClick={() => handleView(driver)}
                          disabled={busyId === driver.id}
                        >
                          <IconEye />
                        </button>
                        <button
                          type="button"
                          className="row-action row-action--edit"
                          aria-label={`Edit ${driver.name || "driver"}`}
                          onClick={() => handleEdit(driver)}
                          disabled={busyId === driver.id}
                        >
                          <IconEdit />
                        </button>
                        <button
                          type="button"
                          className="row-action row-action--danger"
                          aria-label={`Delete ${driver.name || "driver"}`}
                          onClick={() => handleDelete(driver)}
                          disabled={busyId === driver.id}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!isLoading && !error && visibleCount === 0 && (
            <div className="driver-list__empty">
              <IconEmptyDrivers className="driver-list__empty-icon" />
              <p className="driver-list__empty-title">No drivers found</p>
              <p className="driver-list__empty-copy">
                {searchTerm || activeStatus !== "all"
                  ? "Try a different search term or switch filters."
                  : "Drivers you add will show up here."}
              </p>
            </div>
          )}

          {error && (
            <div className="driver-list__error">
              <IconAlert className="driver-list__error-icon" />
              <p className="driver-list__empty-title">Couldn't load drivers</p>
              <p className="driver-list__error-copy">{error}</p>
              <button
                type="button"
                className="driver-list__retry"
                onClick={loadDrivers}
              >
                <IconRefresh />
                Retry
              </button>
            </div>
          )}
        </div>

        {!isLoading && !error && totalPages > 1 && (
          <div className="driver-list__pagination">
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

      {selectedIds.length > 0 && (
        <div className="driver-list__bulk-actions">
          <button
            type="button"
            className="driver-list__bulk-cancel"
            onClick={() => setSelectedIds([])}
          >
            Cancel
          </button>
          <button
            type="button"
            className="driver-list__bulk-delete"
            onClick={handleBulkDelete}
          >
            <IconTrash />
            Delete {selectedIds.length} selected
          </button>
        </div>
      )}

      <ConfirmModal
        show={confirmModal.show}
        title={
          confirmModal.type === "status"
            ? "Update Driver Status"
            : confirmModal.type === "bulk-delete"
              ? "Delete Selected Drivers"
              : "Delete Driver"
        }
        message={
          confirmModal.type === "status"
            ? `Are you sure you want to ${
                Number(confirmModal.driver?.status) === 1
                  ? "deactivate"
                  : "activate"
              } this driver?`
            : confirmModal.type === "bulk-delete"
              ? `Are you sure you want to delete ${selectedIds.length} selected driver(s)?`
              : "Are you sure you want to delete this driver?"
        }
        confirmText={
          confirmModal.type === "status" ? "Yes, Update" : "Yes, Delete"
        }
        cancelText="Cancel"
        loading={
          confirmModal.type === "status"
            ? busyId === confirmModal.driver?.id
            : false
        }
        onConfirm={
          confirmModal.type === "status"
            ? confirmToggleStatus
            : confirmModal.type === "bulk-delete"
              ? confirmBulkDelete
              : confirmDeleteDriver
        }
        onCancel={() =>
          setConfirmModal({
            show: false,
            type: null,
            driver: null,
          })
        }
      />

      <SuccessModal
        show={successModal.show}
        title={successModal.title}
        message={successModal.message}
        buttonText="OK"
        onClose={() =>
          setSuccessModal({
            show: false,
            title: "",
            message: "",
          })
        }
      />
    </div>
  );
}
