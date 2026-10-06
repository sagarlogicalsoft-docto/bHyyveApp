import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import "./storeItems.css";
import api from "../../../../config/api";
import StoreHeaderCommon from "./StoreHeaderCommon";
import { getImage } from "../../../../Components/utils/images";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";
import Breadcrumbs from "../../common/BreadCrumbs";

const ITEM_STATUS_TABS = [
  { key: "all", label: "All Items", queryValue: null },
  { key: "active", label: "Active Items", queryValue: "active" },
  { key: "inactive", label: "Inactive Items", queryValue: "inactive" },
];

/* ------------------------------------------------------------------ *
 * Service layer — swap the endpoint paths / payload shape below for
 * the real API. Every call site only depends on this object, so
 * wiring up the backend later means editing this block alone.
 * ------------------------------------------------------------------ */

const ItemsService = {
  getSummary(storeId, { signal } = {}) {
    return api.get(`/restaurant/stores/${storeId}/items/summary`, {
      signal,
    });
  },

  getItems({ storeId, status, search, page = 1, pageSize = 10, signal } = {}) {
    return api.get(`/restaurant/stores/${storeId}/items`, {
      params: {
        status,
        search,
        page,
        pageSize,
      },
      signal,
    });
  },

  updateItemStatus(storeId, itemId, { signal } = {}) {
    return api.patch(
      `/restaurant/stores/${storeId}/items/${itemId}/status`,
      {},
      { signal },
    );
  },
};

/* ------------------------------------------------------------------ *
 * Formatting helpers
 * ------------------------------------------------------------------ */

function formatCurrency(value, currency = "USD") {
  if (value === null || value === undefined || value === "") return "—";

  const currencyMap = {
    USD: "USD",
    INR: "INR",
  };

  const code = currencyMap[currency] || "USD";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
  }).format(Number(value));
}

function getItemTypeMeta(itemType) {
  const normalized = (itemType || "").toLowerCase();
  if (normalized === "non-veg" || normalized === "nonveg") {
    return { label: itemType, tone: "non-veg" };
  }
  if (normalized === "egg") {
    return { label: itemType, tone: "egg" };
  }
  if (!normalized) {
    return { label: "—", tone: "unknown" };
  }
  return { label: itemType, tone: "veg" };
}

/* ------------------------------------------------------------------ *
 * Inline icon set — kept as small local functions (not separate
 * files/exports) so the deliverable stays to StoreItems.js/.css.
 * ------------------------------------------------------------------ */

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function IconAllItems(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M4 7l8-4 8 4-8 4-8-4z" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function IconActiveItems(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="6" />
      <path d="M8.5 12.3l2.4 2.4 4.6-5.2" />
    </svg>
  );
}

function IconInactiveItems(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="6" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}

const SUMMARY_ICONS = {
  all: IconAllItems,
  active: IconActiveItems,
  inactive: IconInactiveItems,
};

function IconSearch(props) {
  return (
    <svg {...iconProps} width={17} height={17} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  );
}

function IconRefresh(props) {
  return (
    <svg {...iconProps} width={16} height={16} {...props}>
      <path d="M4 12a8 8 0 0113.9-5.4M20 12a8 8 0 01-13.9 5.4" />
      <path d="M17 4v3h-3M7 20v-3h3" />
    </svg>
  );
}

function IconEmptyBox(props) {
  return (
    <svg width={72} height={72} viewBox="0 0 72 72" fill="none" {...props}>
      <path
        d="M11 22l25-11 25 11-25 11-25-11z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 22v22l25 11 25-11V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M36 33v22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
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

function IconImagePlaceholder(props) {
  return (
    <svg {...iconProps} width={18} height={18} {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M4.5 16.5l5-5 3.5 3.5L17 11l3 3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export default function StoreItems({ onSelectItem, pageSize = 10 }) {
  const { id } = useParams();

  const [activeStatus, setActiveStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [storeName, setStoreName] = useState("N/A");
  const [storeStatus, setStoreStatus] = useState("Inactive");

  const searchDebounceRef = useRef(null);
  const abortRef = useRef(null);

  const loadItems = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    const statusTab = ITEM_STATUS_TABS.find((tab) => tab.key === activeStatus);

    try {
      const [itemsResponse, summaryResponse] = await Promise.all([
        ItemsService.getItems({
          storeId: id,
          status: statusTab ? statusTab.queryValue : null,
          search: searchTerm || undefined,
          page,
          pageSize,
          signal: controller.signal,
        }),

        ItemsService.getSummary(id, {
          signal: controller.signal,
        }),
      ]);

      const itemsData = itemsResponse.data;
      const summaryData = summaryResponse.data;
      // console.log("🔥 ITEMS DATA:", itemsData?.data);

      setItems(itemsData?.data || []);
      setTotalCount(itemsData?.totalCount || 0);
      setTotalPages(itemsData?.totalPages || 1);
      setCounts(summaryData?.counts || {});
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong while loading items.");
        setItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, activeStatus, searchTerm, page, pageSize]);

  useEffect(() => {
    // console.log("🔥 ITEMS USEEFFECT RUNNING");
    // console.log("🔥 ID:", id);
    if (!id) return;

    const controller = new AbortController();

    const loadStore = async () => {
      try {
        const response = await api.get(`/restaurant/stores/${id}`, {
          signal: controller.signal,
        });

        const store =
          response.data?.data || response.data?.store || response.data;

        if (store) {
          setStoreName(store.business_name || store.name || "N/A");

          setStoreStatus(
            Number(store.is_kyc_approved) === 1 ? "Active" : "Inactive",
          );
        }
      } catch (error) {
        if (error.name !== "AbortError" && error.code !== "ERR_CANCELED") {
          console.error("Failed to load store details:", error);
        }
      }
    };

    loadStore();

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    // console.log("🔥 ITEMS API EFFECT RUNNING");
    // console.log("🔥 ID:", id);

    if (!id) return;

    loadItems();
  }, [id, loadItems]);

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

  function handleToggleStatus(item) {
    setSelectedItem(item);
    setShowConfirmModal(true);
  }

  async function handleConfirmStatusChange() {
    if (!selectedItem) return;

    setTogglingId(selectedItem.id);

    try {
      await ItemsService.updateItemStatus(id, selectedItem.id);

      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                isActive: !selectedItem.isActive,
              }
            : item,
        ),
      );

      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to update item status:", err);

      setShowConfirmModal(false);
      setSelectedItem(null);

      setError(err.response?.data?.message || "Failed to update item status.");
    } finally {
      setTogglingId(null);
    }
  }

  function handleCancelStatusChange() {
    setShowConfirmModal(false);
    setSelectedItem(null);
  }

  function handleSuccessClose() {
    setShowSuccessModal(false);
    setSelectedItem(null);
  }

  function handleSelectItem(item) {
    if (onSelectItem) onSelectItem(item);
  }

  const visibleCount = items.length;

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
            label: "Items",
          },
        ]}
      />
    </div>
    <div className=" itm-store-item-page">
      <StoreHeaderCommon
        storeName={storeName}
        storeId={id}
        storeStatus={storeStatus}
      />
      <div className="itm-store-items">
        <div className="itm-store-items__summary-strip">
          {ITEM_STATUS_TABS.map((tab) => {
            const Icon = SUMMARY_ICONS[tab.key];
            const isActive = tab.key === activeStatus;
            const count = tab.key === "all" ? counts.all : counts[tab.key];
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`itm-summary-card${isActive ? " itm-summary-card--selected" : ""} itm-summary-card--${tab.key}`}
                onClick={() => handleStatusChange(tab.key)}
              >
                <span className="itm-summary-card__icon">
                  <Icon />
                </span>
                <span className="itm-summary-card__label">{tab.label}</span>
                <span className="itm-summary-card__count">
                  {count === undefined || count === null ? "—" : count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="itm-store-items__panel">
          <div className="itm-store-items__panel-header">
            <div className="itm-store-items__panel-title">
              <h2>Items</h2>
              <span className="itm-store-items__count-pill">{totalCount}</span>
            </div>

            <form
              className="itm-store-items__search"
              onSubmit={handleSearchSubmit}
              role="search"
            >
              <IconSearch className="itm-store-items__search-icon" />
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchInputChange}
                placeholder="Search by name..."
                aria-label="Search items"
              />
              <button type="submit" aria-label="Search items">
                <IconSearch />
              </button>
            </form>
          </div>

          <div className="itm-store-items__table-wrap">
            <table className="itm-store-items__table">
              <thead>
                <tr>
                  <th className="itm-col-index">Sr.No</th>
                  <th>Name</th>
                  <th>Sub Category</th>
                  <th>Item Type</th>
                  <th>Unit Price</th>
                  <th>Discount Price</th>
                  <th className="itm-col-status">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={`skeleton-${i}`}
                      className="itm-row-skeleton"
                      aria-hidden="true"
                    >
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j}>
                          <span className="itm-skeleton-bar" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {!isLoading &&
                  !error &&
                  items.map((item, index) => {
                    const typeMeta = getItemTypeMeta(item.itemType);
                    return (
                      <tr key={item.id}>
                        <td className="itm-col-index">
                          {(page - 1) * pageSize + index + 1}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="itm-cell-item"
                            onClick={() => handleSelectItem(item)}
                          >
                            <span className="itm-cell-item__thumb">
                              {item.image ? (
                                <img
                                  src={getImage(item.image)}
                                  alt={item.name || ""}
                                />
                              ) : (
                                <IconImagePlaceholder />
                              )}
                            </span>
                            <span className="itm-cell-item__text">
                              <span className="itm-cell-item__name">
                                {item.name || "Untitled item"}
                              </span>
                              {item.description && (
                                <span className="itm-cell-item__desc">
                                  {item.description}
                                </span>
                              )}
                            </span>
                          </button>
                        </td>
                        <td>{item.subCategory || "—"}</td>
                        <td>
                          <span
                            className={`itm-item-type itm-item-type--${typeMeta.tone}`}
                          >
                            <span className="itm-item-type__dot" />
                            {typeMeta.label}
                          </span>
                        </td>
                        <td className="itm-cell-mono">
                          {formatCurrency(item.unitPrice, item.currency)}
                        </td>
                        <td className="itm-cell-mono">
                          {formatCurrency(item.discountPrice, item.currency)}
                        </td>
                        <td className="itm-col-status">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={!!item.isActive}
                            aria-label={`Toggle ${item.name || "item"} status`}
                            className={`itm-status-toggle${item.isActive ? " itm-status-toggle--on" : ""}`}
                            disabled={togglingId === item.id}
                            onClick={() => handleToggleStatus(item)}
                          >
                            <span className="itm-status-toggle__thumb" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {!isLoading && !error && visibleCount === 0 && (
              <div className="itm-store-items__empty">
                <IconEmptyBox className="itm-store-items__empty-icon" />
                <p className="itm-store-items__empty-title">No items found</p>
                <p className="itm-store-items__empty-copy">
                  {searchTerm || activeStatus !== "all"
                    ? "Try a different search term or switch filters."
                    : "Items you add to the menu will show up here."}
                </p>
              </div>
            )}

            {error && (
              <div className="itm-store-items__error">
                <IconAlert className="itm-store-items__error-icon" />
                <p className="itm-store-items__empty-title">Couldn't load items</p>
                <p className="itm-store-items__empty-copy">{error}</p>
                <button
                  type="button"
                  className="itm-store-items__retry"
                  onClick={loadItems}
                >
                  <IconRefresh />
                  Retry
                </button>
              </div>
            )}
          </div>

          {!isLoading && !error && totalPages > 1 && (
            <div className="itm-store-items__pagination">
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

      <ConfirmModal
        show={showConfirmModal}
        title="Change Item Status"
        message={
          selectedItem
            ? `Are you sure you want to ${
                selectedItem.isActive ? "deactivate" : "activate"
              } "${selectedItem.name}"?`
            : "Are you sure you want to change this item's status?"
        }
        confirmText={selectedItem?.isActive ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
        loading={togglingId === selectedItem?.id}
      />

      <SuccessModal
        show={showSuccessModal}
        title="Status Updated"
        message={
          selectedItem
            ? `"${selectedItem.name}" has been ${
                selectedItem.isActive ? "activated" : "deactivated"
              } successfully.`
            : "Item status updated successfully."
        }
        buttonText="OK"
        onClose={handleSuccessClose}
      />
    </div>
    </>
  );
}
