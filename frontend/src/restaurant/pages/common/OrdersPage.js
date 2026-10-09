import React, { useEffect, useMemo, useState } from "react";
import DataTable from "../../../Components/common/DataTable";
import "./ordersPage.css";
import { useNavigate } from "react-router-dom";
import api from "../../../config/api";

/* ============================================================
   STATUS CONFIGURATION
   ============================================================ */

const STATUS_BADGES = {
  pending: {
    text: "Pending",
    className: "badge-status badge-status--pending",
  },

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

  preparing: {
    text: "Preparing",
    className: "badge-status badge-status--preparing",
  },

  ready_for_pickup: {
    text: "Ready For Pickup",
    className: "badge-status badge-status--ready-for-pickup",
  },

  picked_up: {
    text: "Picked Up",
    className: "badge-status badge-status--picked-up",
  },

  driver_rejected: {
    text: "Driver Rejected",
    className: "badge-status badge-status--driver-rejected",
  },
};

/* ============================================================
   COMMON ORDERS PAGE
   ============================================================ */

export default function OrdersPage({
  pageTitle = "Orders",
  orderStatus = "all",
  onViewOrder = (order) => {
    console.log("View order:", order);
  },
}) {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => controller.abort();
  }, []);

  /*
   * Filter orders according to the page.
   *
   * Example:
   * orderStatus="pending"
   * -> only pending orders will be displayed.
   *
   * orderStatus="accepted"
   * -> only accepted orders will be displayed.
   */

  const filteredStatusOrders = useMemo(() => {
    if (!orderStatus || orderStatus === "all") {
      return orders;
    }

    return orders.filter((order) => order.status === orderStatus);
  }, [orders, orderStatus]);

  /*
   * Search filtering
   */

  const displayedOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return filteredStatusOrders;
    }

    return filteredStatusOrders.filter((order) =>
      [order.orderNumber, order.customerName, order.email, order.phone]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query)),
    );
  }, [filteredStatusOrders, search]);

  /*
   * Current status badge
   */

  const getStatusBadge = (status) => {
    const badge = STATUS_BADGES[status];

    if (!badge) {
      return {
        text: status || "Unknown",
        className: "badge-status",
      };
    }

    return badge;
  };

  /* ==========================================================
     DATATABLE COLUMNS
     ========================================================== */

  const columns = [
    {
      key: "serial",
      label: "#",
      sortable: false,
      width: "56px",
    },

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

    /*
     * STATUS
     *
     * This is the important part.
     *
     * The status comes from each order and automatically displays
     * the correct badge.
     */

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
  ];
  return (
    <div className="orders-page">
      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <div className="orders-page-header">
        <span className="orders-page-header__icon" aria-hidden="true">
          <ClipboardIcon />
        </span>

        <h1>{pageTitle}</h1>
      </div>

      {/* ======================================================
          ORDER CARD
          ====================================================== */}

      <div className="orders-card">
        {/* Header */}

        <div className="orders-card__header">
          <div className="orders-card__title">
            <h2>{pageTitle} List</h2>

            <span className="badge-soft">{displayedOrders.length} Orders</span>
          </div>

          {/* Search */}

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

        {/* ==================================================
            DATATABLE
            ================================================== */}

        <DataTable
          columns={columns}
          data={displayedOrders}
          searchable={false}
          sortable={true}
          defaultEntriesPerPage={10}
        />
      </div>
    </div>
  );
}

/* ============================================================
   ICONS
   ============================================================ */

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