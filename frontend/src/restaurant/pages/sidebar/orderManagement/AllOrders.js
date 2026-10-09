import React, { useEffect, useMemo, useState } from "react";
import api from "../../../../config/api";
import DataTable from "../../../../Components/common/DataTable";
import "./allOrders.css";
import { useNavigate } from "react-router-dom";

const STATUS_TABS = [
  {
    id: "all",
    label: "All Orders",
    heading: "All Restaurant Orders",
  },
  {
    id: "scheduled",
    label: "Scheduled",
    heading: "Scheduled Orders",
  },
  {
    id: "pending",
    label: "Pending",
    heading: "Pending Orders",
  },
  {
    id: "accepted",
    label: "Accepted",
    heading: "Accepted Orders",
  },
  {
    id: "processing",
    label: "Processing",
    heading: "Processing Orders",
  },
  {
    id: "on_the_way",
    label: "On The Way",
    heading: "Orders On The Way",
  },
];

// Maps an order's `status` value to a badge colour + display text.
const STATUS_BADGES = {
  pending: { text: "Pending", className: "badge-status badge-status--pending" },
  scheduled: {
    text: "Scheduled",
    className: "badge-status badge-status--scheduled",
  },
  accepted: {
    text: "Accepted",
    className: "badge-status badge-status--accepted",
  },
  processing: {
    text: "Processing",
    className: "badge-status badge-status--processing",
  },
  ready_for_pickup: {
  text: "Ready for Pickup",
  className: "badge-status badge-status--ready-for-pickup",
},
  on_the_way: {
    text: "On The Way",
    className: "badge-status badge-status--on-the-way",
  },
  delivered: {
    text: "Delivered",
    className: "badge-status badge-status--delivered",
  },
  cancelled: {
    text: "Cancelled",
    className: "badge-status badge-status--cancelled",
  },
};

/**
 * @param {function} [props.onViewOrder]  Called with an order object when the "view" action is clicked.
 *                                        Defaults to a console log — pass your own handler to open a
 *                                        detail page/modal.
 * @param {string}   [props.defaultStatus] Which tab is active on first render. Defaults to "pending".
 */
export default function AllOrders({
  onViewOrder = (order) => console.log("View order:", order),
  defaultStatus = "all",
  orderStatus,
  pageTitle,
}) {
  const [activeStatus, setActiveStatus] = useState(
  orderStatus || defaultStatus
);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

const activeTab =
  STATUS_TABS.find((tab) => tab.id === activeStatus) ||
  (orderStatus === "delivered"
    ? {
        id: "delivered",
        label: "Delivered",
        heading: "Delivered Orders",
      }
    : STATUS_TABS[0]);

  useEffect(() => {
    const controller = new AbortController();

    const loadOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/restaurant/orders", {
          signal: controller.signal,
        });

        const result = response.data;

        if (!result.success) {
          throw new Error(result.message || "Failed to load orders.");
        }

        setStats(result.counts || {});

        setOrders(result.data || []);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") {
          return;
        }

        console.error("Failed to load restaurant orders:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Couldn't load orders. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    return () => controller.abort();
  }, []);

  // ---- Filter the currently loaded orders by the search box ----
  // (Runs client-side against whatever `orders` already holds. If you'd
  // rather search server-side, call api.getOrders(activeStatus, { search })
  // instead and drop this useMemo.)
  const displayedOrders = useMemo(() => {
    let filteredOrders = orders;

    // Status filter
    if (activeStatus !== "all") {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === activeStatus,
      );
    }

    // Search filter
    const query = search.trim().toLowerCase();

    if (!query) {
      return filteredOrders;
    }

    return filteredOrders.filter((order) =>
      [
        order.orderNumber,
        order.order_number,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.restaurantName,
        order.paymentStatus,
        order.status,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query)),
    );
  }, [orders, activeStatus, search]);

  // ---- Column definitions for <DataTable /> ----
  const columns = [
    { key: "serial", label: "#", sortable: false, width: "56px" },
    {
      key: "orderNumber",
      label: "Order",
      render: (value, row) => (
        <button
          type="button"
          className="order-link"
          onClick={() =>
            navigate(`/restaurant/orders/view/${row.id}`, {
              state: { order: row },
            })
          }
        >
          {value}
        </button>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (value) => {
        if (!value) {
          return (
            <div className="date-cell">
              <span className="date-cell__day">N/A</span>
            </div>
          );
        }

        const date = new Date(value);

        return (
          <div className="date-cell">
            <span className="date-cell__day">
              {date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>

            <span className="date-cell__time">
              {date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        );
      },
    },
    {
      key: "customerName",
      label: "Customer",
      width: "220px",
      sortable: false,
      render: (_value, row) => (
        <div className="customer-cell">
          <span className="customer-cell__name">
            {row.customerName || "N/A"}
          </span>

          <span className="customer-cell__line">
            <PhoneIcon /> {row.customerPhone || "N/A"}
          </span>

          <span className="customer-cell__line">
            <MailIcon /> {row.customerEmail || "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      width: "120px",
      sortable: false,
      render: (value) =>
        String(value).toLowerCase() === "paid" ? (
          <span className="badge-payment badge-payment--paid">
            <CheckIcon /> Paid
          </span>
        ) : (
          <span className="badge-payment badge-payment--unpaid">Unpaid</span>
        ),
    },
    {
      key: "total",
      label: "Total",
      render: (value) => (
        <span className="total-cell">$ {Number(value || 0).toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const badge = STATUS_BADGES[value] || {
          text: value,
          className: "badge-status",
        };
        return <span className={badge.className}>{badge.text}</span>;
      },
    },

{
  key: "actions",
  label: "Actions",
  sortable: false,
  render: (_value, row) => (
    <div className="order-action-buttons">
      <button
        type="button"
        className="action-view-btn"
        onClick={() =>
          navigate(`/restaurant/orders/view/${row.id}`, {
            state: { order: row },
          })
        }
        aria-label={`View order ${row.orderNumber}`}
        title="View Order"
      >
        <EyeIcon />
      </button>

      {row.status === "delivered" && (
        <button
          type="button"
          className="action-invoice-btn"
          onClick={() => {
            const invoiceUrl =
              `${api.defaults.baseURL}/restaurant/orders/${row.id}/invoice` +
              `?vendor_id=${row.vendor_id}`;

            window.open(invoiceUrl, "_blank");
          }}
          aria-label={`View invoice ${row.orderNumber}`}
          title="View Invoice"
        >
          <InvoiceIcon />
        </button>
      )}
    </div>
  ),
},

  ]
  return (
    <div className="orders-page">
      {/* ---------------- Page header ---------------- */}
      <div className="orders-page-header">
        <span className="orders-page-header__icon" aria-hidden="true">
          <ClipboardIcon />
        </span>
        <h1>All Restaurant Orders</h1>
      </div>

      {/* ---------------- Status tabs ---------------- */}
      <div className="status-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`status-tab ${activeStatus === tab.id ? "is-active" : ""}`}
            onClick={() => setActiveStatus(tab.id)}
          >
            <span className={`status-tab__icon status-tab__icon--${tab.id}`}>
              <StatusTabIcon statusId={tab.id} />
            </span>
            <span className="status-tab__text">
              <span className="status-tab__label">
                {tab.label.toUpperCase()}
              </span>
              <span className="status-tab__count">
                {stats ? (stats[tab.id] ?? 0) : "–"}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* ---------------- Order list card ---------------- */}
      <div className="orders-card">
        <div className="orders-card__header">
          <div className="orders-card__title">
            <h2>{activeTab.label} List</h2>
            <span className="badge-soft">{displayedOrders.length} Orders</span>
          </div>

          <div className="orders-search">
            <input
              type="text"
              placeholder="Search order / customer / email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              className="orders-search__btn"
              aria-label="Search"
            >
              <SearchIcon />
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertIcon /> {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={displayedOrders}
          searchable={false}
          sortable={true}
          defaultEntriesPerPage={10}
        />

        {loading && <div className="orders-loading">Loading orders...</div>}
      </div>
    </div>
  );
}

/* ===================================================================
 *  Small helper: picks the right tab icon per status.
 *  (Kept as one function instead of six near-identical components.)
 * =================================================================== */

function StatusTabIcon({ statusId }) {
  switch (statusId) {
    case "scheduled":
      return (
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" strokeLinecap="round" />
        </svg>
      );
    case "accepted":
      return (
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M4 12l5 5L20 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "processing":
      return (
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" />
          <path d="M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "on_the_way":
      return (
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M3 16V7a1 1 0 0 1 1-1h9v10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 10h4l4 4v2h-8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7.5" cy="17.5" r="1.8" />
          <circle cx="17.5" cy="17.5" r="1.8" />
        </svg>
      );
    case "pending":
      return (
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M9 3v4h6V3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 12h8M8 16h5" strokeLinecap="round" />
        </svg>
      );
  }
}

/* ===================================================================
 *  Tiny one-off icons — inlined, not worth their own components.
 * =================================================================== */

const ClipboardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M9 3v4h6V3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 12h8M8 16h5" strokeLinecap="round" />
  </svg>
);
const PhoneIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <path
      d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2Z"
      strokeLinejoin="round"
    />
  </svg>
);
const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
  >
    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.3"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3-3" strokeLinecap="round" />
  </svg>
);
const EyeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <path
      d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const AlertIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
    <path
      d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
      strokeLinejoin="round"
    />
  </svg>
);
const InvoiceIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <path
      d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
      strokeLinejoin="round"
    />
    <path d="M14 3v5h5" strokeLinejoin="round" />
    <path d="M8 12h8M8 16h6" strokeLinecap="round" />
  </svg>
);
