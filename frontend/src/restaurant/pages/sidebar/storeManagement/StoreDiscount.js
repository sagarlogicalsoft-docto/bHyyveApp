import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import "./storeDiscount.css";
import api from "../../../../config/api";
import StoreHeaderCommon from "./StoreHeaderCommon";
import Breadcrumbs from "../../common/BreadCrumbs";

const DiscountsService = {
  getDiscounts(storeId, { signal } = {}) {
    return api.get(`/restaurant/stores/${storeId}/discounts`, {
      signal,
    });
  },

  createDiscount(storeId, payload, { signal } = {}) {
    return api.post(`/restaurant/stores/${storeId}/discounts`, payload, {
      signal,
    });
  },

  updateDiscount(storeId, discountId, payload, { signal } = {}) {
    return api.put(
      `/restaurant/stores/${storeId}/discounts/${discountId}`,
      payload,
      { signal },
    );
  },

  deleteDiscount(storeId, discountId, { signal } = {}) {
    return api.delete(`/restaurant/stores/${storeId}/discounts/${discountId}`, {
      signal,
    });
  },

  updateDiscountStatus(storeId, discountId, isActive, { signal } = {}) {
    return api.patch(
      `/restaurant/stores/${storeId}/discounts/${discountId}/status`,
      { isActive },
      { signal },
    );
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

function formatDiscountValue(discount) {
  if (discount.discountType === "percentage") {
    return `${discount.value}% off`;
  }
  if (discount.discountType === "flat") {
    return `$${discount.value} off`;
  }
  return discount.value ?? "—";
}

/* ------------------------------------------------------------------ *
 * Inline icon set — kept as small local functions (not separate
 * files/exports) so the deliverable stays to StoreDiscount.js/.css.
 * ------------------------------------------------------------------ */

function IconInfo(props) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconPlus(props) {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconEdit(props) {
  return (
    <svg
      width={15}
      height={15}
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
      width={15}
      height={15}
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

function IconAlert(props) {
  return (
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none" {...props}>
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

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export default function StoreDiscount({ onAddDiscount, onEditDiscount }) {
  const { id } = useParams();

  const [discounts, setDiscounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const abortRef = useRef(null);

  const loadDiscounts = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await DiscountsService.getDiscounts(id, {
        signal: controller.signal,
      });
      setDiscounts(response.data?.data || []);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong while loading discounts.");
        setDiscounts([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDiscounts();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [loadDiscounts]);

  function handleAddDiscount() {
    if (onAddDiscount) onAddDiscount();
  }

  function handleEditDiscount(discount) {
    if (onEditDiscount) onEditDiscount(discount);
  }

  async function handleToggleStatus(discount) {
    const nextIsActive = !discount.isActive;
    setBusyId(discount.id);

    // Optimistic update so the switch feels instant; rolled back below
    // if the request fails.
    setDiscounts((prev) =>
      prev.map((d) => (d.id === discount.id ? { ...d, isActive: nextIsActive } : d)),
    );

    try {
      await DiscountsService.updateDiscountStatus(id, discount.id, nextIsActive);
    } catch (err) {
      setDiscounts((prev) =>
        prev.map((d) => (d.id === discount.id ? { ...d, isActive: discount.isActive } : d)),
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(discount) {
    setBusyId(discount.id);
    const previousDiscounts = discounts;

    // Optimistic remove; rolled back below if the request fails.
    setDiscounts((prev) => prev.filter((d) => d.id !== discount.id));

    try {
      await DiscountsService.deleteDiscount(id, discount.id);
    } catch (err) {
      setDiscounts(previousDiscounts);
      setError(err.message || "Couldn't delete that discount.");
    } finally {
      setBusyId(null);
    }
  }

  const hasDiscounts = discounts.length > 0;

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
            label: "Discounts",
          },
        ]}
      />
    </div>
    <div className="store-discount-page">
      <StoreHeaderCommon
        storeName="Country Fair"
        storeId={id}
        storeStatus="Active"
      />
    <div className="store-discount">
      <div className="store-discount__panel">
        <div className="store-discount__panel-header">
          <div className="store-discount__title-block">
            <div className="store-discount__title">
              <IconInfo className="store-discount__title-icon" />
              <h2>Discount Info</h2>
            </div>
            <p className="store-discount__note">
              <span className="store-discount__note-mark">*</span> When this
              discount is available is applied on the items in this stores.
            </p>
          </div>

          <button
            type="button"
            className="store-discount__add-btn"
            onClick={handleAddDiscount}
          >
            <IconPlus />
            Add Discount
          </button>
        </div>

        <div className="store-discount__body">
          {isLoading && (
            <div className="store-discount__table-wrap">
              <table className="store-discount__table">
                <tbody>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="row-skeleton" aria-hidden="true">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j}>
                          <span className="skeleton-bar" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && error && (
            <div className="store-discount__error">
              <IconAlert className="store-discount__error-icon" />
              <p className="store-discount__empty-title">Couldn't load discounts</p>
              <p className="store-discount__error-copy">{error}</p>
              <button
                type="button"
                className="store-discount__retry"
                onClick={loadDiscounts}
              >
                <IconRefresh />
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && !hasDiscounts && (
            <div className="store-discount__empty">
              <p className="store-discount__empty-text">NO DISCOUNT CREATED YET</p>
            </div>
          )}

          {!isLoading && !error && hasDiscounts && (
            <div className="store-discount__table-wrap">
              <table className="store-discount__table">
                <thead>
                  <tr>
                    <th className="col-index">Sl</th>
                    <th>Discount Name</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th className="col-status">Status</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount, index) => (
                    <tr key={discount.id}>
                      <td className="col-index">{index + 1}</td>
                      <td>
                        <span className="cell-discount-name">
                          {discount.name || "Untitled discount"}
                        </span>
                      </td>
                      <td className="cell-type">{discount.discountType || "—"}</td>
                      <td className="cell-mono">{formatDiscountValue(discount)}</td>
                      <td className="cell-date">{formatDate(discount.startDate)}</td>
                      <td className="cell-date">{formatDate(discount.endDate)}</td>
                      <td className="col-status">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={!!discount.isActive}
                          aria-label={`Toggle ${discount.name || "discount"} status`}
                          className={`status-toggle${discount.isActive ? " status-toggle--on" : ""}`}
                          disabled={busyId === discount.id}
                          onClick={() => handleToggleStatus(discount)}
                        >
                          <span className="status-toggle__thumb" />
                        </button>
                      </td>
                      <td className="col-actions">
                        <div className="row-actions">
                          <button
                            type="button"
                            className="row-action"
                            aria-label={`Edit ${discount.name || "discount"}`}
                            onClick={() => handleEditDiscount(discount)}
                            disabled={busyId === discount.id}
                          >
                            <IconEdit />
                          </button>
                          <button
                            type="button"
                            className="row-action row-action--danger"
                            aria-label={`Delete ${discount.name || "discount"}`}
                            onClick={() => handleDelete(discount)}
                            disabled={busyId === discount.id}
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
    </>
  );
}