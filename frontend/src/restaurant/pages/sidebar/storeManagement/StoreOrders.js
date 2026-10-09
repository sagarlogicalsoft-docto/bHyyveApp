import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StoreHeaderCommon from "./StoreHeaderCommon";
import "./StoreOrders.css";
import api from "../../../../config/api";
import Breadcrumbs from "../../common/BreadCrumbs";

const STATUS_TABS = [
  { key: "all", label: "All orders", queryValue: null },
  { key: "scheduled", label: "Scheduled", queryValue: "scheduled" },
  { key: "pending", label: "Pending", queryValue: "pending" },
  { key: "accepted", label: "Accepted", queryValue: "accepted" },
  { key: "processing", label: "Processing", queryValue: "processing" },
  { key: "on_the_way", label: "On the way", queryValue: "on_the_way" },
];

const OrdersService = {
  getSummary(storeId, { signal } = {}) {
    return api.get(`/restaurant/stores/${storeId}/orders/summary`, {
      signal,
    });
  },

  getOrders({ storeId, status, search, page = 1, pageSize = 10, signal } = {}) {
    return api.get(`/restaurant/stores/${storeId}/orders`, {
      params: {
        status,
        search,
        page,
        pageSize,
      },
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

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return (
    <>
      <span>{formattedDate}</span>
      <span>{formattedTime}</span>
    </>
  );
}

function formatCurrency(value, currency = "USD") {
  if (value === null || value === undefined) return "—";

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

function formatDistance(value, unit = "km") {
  if (value === null || value === undefined) return "—";
  return `${value} ${unit}`;
}

// Purely presentational: buckets a distance value so nearby vs far
// orders can be color-coded, mirroring the reference design.
function getDistanceLevel(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return numeric <= 1 ? "near" : "far";
}

// Purely presentational: normalizes a payment status string so a paid
// order gets a checkmark + tinted styling, matching the reference design.
function getPaymentInfo(paymentStatus) {
  if (!paymentStatus) return { isPaid: false, label: "—" };
  const isPaid = String(paymentStatus).trim().toLowerCase() === "paid";
  return { isPaid, label: paymentStatus };
}

/* ------------------------------------------------------------------ *
 * Inline icon set — kept as small local functions (not separate
 * files/exports) so the deliverable stays to StoreOrders.js/.css.
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

function IconAll(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconScheduled(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v3M16 3v3" />
      <circle cx="16.5" cy="15" r="3" />
      <path d="M16.5 13.6V15l1 .8" />
    </svg>
  );
}

function IconPending(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M6 3.5h12M6 20.5h12" />
      <path d="M7 3.5v3.2c0 1.6.9 3 2.3 3.9l1.8 1.1a1 1 0 010 1.6l-1.8 1.1c-1.4.9-2.3 2.3-2.3 3.9v2.2M17 3.5v3.2c0 1.6-.9 3-2.3 3.9l-1.8 1.1a1 1 0 000 1.6l1.8 1.1c1.4.9 2.3 2.3 2.3 3.9v2.2" />
    </svg>
  );
}

function IconAccepted(props) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.3l2.4 2.4 4.6-5" />
    </svg>
  );
}

function IconProcessing(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M4 12a8 8 0 0113.9-5.4M20 12a8 8 0 01-13.9 5.4" />
      <path d="M17 4v3h-3M7 20v-3h3" />
    </svg>
  );
}

function IconOnTheWay(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M3.5 16.5h2M9 16.5H6.2" />
      <circle cx="7.5" cy="17.5" r="2.2" />
      <circle cx="17" cy="17.5" r="2.2" />
      <path d="M9.7 17.5h5.1l1.2-4.6h2.3M14.8 12.9l-2.3-3.4H8.4l-1.4 3.4" />
      <path d="M12.5 9.5V6.8a1 1 0 011-1h1.6" />
    </svg>
  );
}

const STATUS_ICONS = {
  all: IconAll,
  scheduled: IconScheduled,
  pending: IconPending,
  accepted: IconAccepted,
  processing: IconProcessing,
  on_the_way: IconOnTheWay,
};

function IconSearch(props) {
  return (
    <svg {...iconProps} width={17} height={17} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  );
}

function IconEye(props) {
  return (
    <svg {...iconProps} width={17} height={17} {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" />
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

function IconEmptyTray(props) {
  return (
    <svg width={72} height={72} viewBox="0 0 72 72" fill="none" {...props}>
      <path
        d="M11 34.5L18.5 15h35L61 34.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 34.5v16a3 3 0 003 3h44a3 3 0 003-3v-16H46.5a1 1 0 00-.9.6l-1.8 3.8a1 1 0 01-.9.6H29.1a1 1 0 01-.9-.6l-1.8-3.8a1 1 0 00-.9-.6H11z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function IconFork(props) {
  return (
    <svg {...iconProps} width={13} height={13} {...props}>
      <path d="M7 3v7.5a2 2 0 002 2v0a2 2 0 002-2V3M9 3v18M15 3c-1.4 0-2.5 1.6-2.5 5.5S13.6 13 15 13s2.5-.5 2.5-.5V3M15 13v8" />
    </svg>
  );
}

function IconPin(props) {
  return (
    <svg {...iconProps} width={13} height={13} {...props}>
      <path d="M12 21s7-6.4 7-11.5A7 7 0 105 9.5C5 14.6 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

function IconCheckSmall(props) {
  return (
    <svg {...iconProps} width={13} height={13} {...props}>
      <path d="M4.5 12.5l5 5 10-11" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export default function StoreOrders({ onViewOrder, pageSize = 10 }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [storeLoading, setStoreLoading] = useState(true);

  const [activeStatus, setActiveStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchDebounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadStore = async () => {
      try {
        setStoreLoading(true);
        const response = await api.get(`/restaurant/stores/${id}`);

        console.log("STORE HEADER RESPONSE:", response.data);

        if (!cancelled) {
          setStore(response.data?.data || response.data);
        }

        if (!cancelled) {
          setStore(response.data?.data || response.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Store header error:", error);
        }
      } finally {
        if (!cancelled) {
          setStoreLoading(false);
        }
      }
    };

    if (id) {
      loadStore();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadOrders = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    const statusTab = STATUS_TABS.find((tab) => tab.key === activeStatus);

    try {
      const [ordersResponse, summaryResponse] = await Promise.all([
        OrdersService.getOrders({
          storeId: id,
          status: statusTab ? statusTab.queryValue : null,
          search: searchTerm || undefined,
          page,
          pageSize,
          signal: controller.signal,
        }),

        OrdersService.getSummary(id, {
          signal: controller.signal,
        }),
      ]);

      const ordersData = ordersResponse.data;
      const summaryData = summaryResponse.data;

      setOrders(ordersData?.data || []);
      setTotalCount(ordersData?.totalCount || 0);
      setTotalPages(ordersData?.totalPages || 1);
      setCounts(summaryData?.counts || {});
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong while loading orders.");
        setOrders([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, activeStatus, searchTerm, page, pageSize]);

  useEffect(() => {
    loadOrders();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [loadOrders]);

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

  function handleViewOrder(order) {
    navigate(`/restaurant/orders/view/${order.id}`);
  }

  const visibleCount = orders.length;

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
            label: "Orders",
          },
        ]}
      />
    </div>
    
    <div className="store-view-page">
      <StoreHeaderCommon
        storeName={
          store?.business_name || store?.store_name || store?.name || "N/A"
        }
        storeId={store?.id || id}
        storeStatus={
          Number(store?.is_kyc_approved) === 1 ? "Active" : "Inactive"
        }
      />
      <div className="store-orders">
        <div
          className="store-orders__status-strip"
          role="tablist"
          aria-label="Order status filter"
        >
          {STATUS_TABS.map((tab) => {
            const Icon = STATUS_ICONS[tab.key];
            const isActive = tab.key === activeStatus;
            const count = tab.key === "all" ? counts.all : counts[tab.key];
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`status-card${isActive ? " status-card--active" : ""} status-card--${tab.key}`}
                onClick={() => handleStatusChange(tab.key)}
              >
                <span className="status-card__icon">
                  <Icon />
                </span>
                <span className="status-card__text">
                  <span className="status-card__label">{tab.label}</span>
                  <span className="status-card__count">
                    {count === undefined || count === null ? "—" : count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="store-orders__panel">
          <div className="store-orders__panel-header">
            <div className="store-orders__panel-title">
              <h2>Order List</h2>
              <span className="store-orders__count-pill">
                {totalCount} {totalCount === 1 ? "Order" : "Orders"}
              </span>
            </div>

            <form
              className="store-orders__search"
              onSubmit={handleSearchSubmit}
              role="search"
            >
              <IconSearch className="store-orders__search-icon" />
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchInputChange}
                placeholder="Search order, customer, or email"
                aria-label="Search orders"
              />
              <button type="submit" aria-label="Search orders">
                <IconSearch />
              </button>
            </form>
          </div>

          <div className="store-orders__table-wrap">
            <table className="store-orders__table">
              <thead>
                <tr>
                  <th className="col-index">#</th>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Nearest restaurant</th>
                  <th>Distance</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="col-actions">Actions</th>
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
                  orders.map((order, index) => {
                    const distanceLevel = getDistanceLevel(order.distance);
                    const payment = getPaymentInfo(order.paymentStatus);
                    return (
                      <tr key={order.id}>
                        <td className="col-index">
                          {(page - 1) * pageSize + index + 1}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="order-link"
                            onClick={() => handleViewOrder(order)}
                            aria-label={`View order ${order.orderNumber}`}
                          >
                            #{order.orderNumber}
                          </button>
                        </td>

                        <td className="cell-date">
                          {formatDate(order.createdAt)}
                        </td>
                        <td>
                          <div className="cell-customer">
                            <span className="cell-customer__name">
                              {order.customerName || "N/A"}
                            </span>

                            {order.customerPhone && (
                              <span className="cell-customer__phone">
                                {order.customerPhone}
                              </span>
                            )}

                            {order.customerEmail && (
                              <span className="cell-customer__email">
                                {order.customerEmail}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {order.restaurantName ? (
                            <span className="restaurant-pill">
                              <IconFork />
                              {order.restaurantName}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {order.distance === null ||
                          order.distance === undefined ? (
                            "—"
                          ) : (
                            <span
                              className={`distance-pill${
                                distanceLevel
                                  ? ` distance-pill--${distanceLevel}`
                                  : ""
                              }`}
                            >
                              <IconPin />
                              {formatDistance(order.distance)}
                            </span>
                          )}
                        </td>
                        <td>
                          {payment.isPaid ? (
                            <span className="payment-pill payment-pill--paid">
                              <IconCheckSmall />
                              Paid
                            </span>
                          ) : (
                            <span className="payment-pill">
                              {payment.label}
                            </span>
                          )}
                        </td>
                        <td className="cell-mono">
                          {formatCurrency(order.total, order.currency)}
                        </td>
                        <td>
                          <span
                            className={`status-chip status-chip--${order.status}`}
                          >
                            {STATUS_TABS.find(
                              (t) => t.queryValue === order.status,
                            )?.label || order.status}
                          </span>
                        </td>
                        <td className="store-orders-col-actions">
                          <button
                            type="button"
                            className="store-orders-row-action"
                            onClick={() => handleViewOrder(order)}
                            aria-label={`View order ${order.orderNumber}`}
                          >
                            <IconEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {!isLoading && !error && visibleCount === 0 && (
              <div className="store-orders__empty">
                <IconEmptyTray className="store-orders__empty-icon" />
                <p className="store-orders__empty-title">No orders found</p>
                <p className="store-orders__empty-copy">
                  {searchTerm || activeStatus !== "all"
                    ? "Try a different search term or switch status filters."
                    : "New orders will show up here as soon as they come in."}
                </p>
              </div>
            )}

            {error && (
              <div className="store-orders__error">
                <IconAlert className="store-orders__error-icon" />
                <p className="store-orders__empty-title">
                  Couldn't load orders
                </p>
                <p className="store-orders__empty-copy">{error}</p>
                <button
                  type="button"
                  className="store-orders__retry"
                  onClick={loadOrders}
                >
                  <IconRefresh />
                  Retry
                </button>
              </div>
            )}
          </div>

          {!isLoading && !error && totalPages > 1 && (
            <div className="store-orders__pagination">
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
