import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardList,
  FaEnvelope,
  FaExclamationTriangle,
  FaHourglassHalf,
  FaInbox,
  FaMapMarkerAlt,
  FaPhone,
  FaRedo,
  FaSave,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
  FaUndo,
  FaUser,
} from "react-icons/fa";
import api from "../../../config/api";
import DataTable from "../../common/DataTable";
import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceConfirmModal from "../../common/modal/serviceModal/ServiceConfirmModal";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";
import "./viewDetails.css";

const ROUTES = {
  users: "/users",
  bookingView: (bookingId) => `/bookings/view/${bookingId}`,
};

// These paths assume the backend routes discussed earlier.
const ENDPOINTS = {
  details: (id) => `/admin/users/${id}/details`,
  address: (id, addressId) => `/admin/users/${id}/addresses/${addressId}`,
};

const formatJoinedDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const normalizeCustomer = (raw = {}) => ({
  id: raw.id ?? raw.user_id,
  name: [raw.fname ?? "", raw.lname ?? ""].filter(Boolean).join(" "),
  email: raw.email ?? "",
  phone: raw.mobile ?? "",
  address: raw.address ?? "",
  registeredDate: formatJoinedDate(raw.created_at ?? raw.create_date ?? ""),
  active: raw.status === undefined ? true : Number(raw.status) !== 0,
});

const normalizeBooking = (raw = {}) => ({
  id: raw.Booking_id ?? raw.id,
  bookedId: raw.Booking_id_string ?? raw.Booking_id ?? raw.id ?? "",
  customerName: raw.customer_name ?? "",
  bookingAddress: raw.booking_address ?? "",
  paidAmount: raw.grand_total ?? raw.paid_amount ?? "",
  transaction: raw.transaction ?? "",
  bookedDateTime: [
    raw.booked_date ?? "",
    String(raw.booked_time ?? "").replace(/\s/g, ""),
  ]
    .filter(Boolean)
    .join(" "),
  status: raw.status_in_string ?? "Pending",
});

const normalizeAddress = (raw = {}) => {
  const address = raw.address ?? "";

  return {
    id: raw.id,
    address,
    saved: address,
  };
};

const customerService = {
  getDetail: async (id) => {
    const response = await api.get(ENDPOINTS.details(id));
    const data = response.data?.data ?? response.data;

    return {
      customer: normalizeCustomer(data.userDetail ?? data.user ?? {}),
      pendingBookings: (data.pending_booking ?? []).map(normalizeBooking),
      completedBookings: (data.completed_booking ?? []).map(normalizeBooking),
      addresses: (data.user_addresses ?? []).map(normalizeAddress),
    };
  },

  update: (id, payload) => api.put(ENDPOINTS.details(id), payload),

  updateAddress: (id, addressId, address) =>
    api.put(ENDPOINTS.address(id, addressId), { address }),

  removeAddress: (id, addressId) =>
    api.delete(ENDPOINTS.address(id, addressId)),
};

// =========================================================
// HELPERS
// =========================================================

const FORM_FIELDS = ["name", "email", "phone", "address"];

const pickForm = (customer) =>
  FORM_FIELDS.reduce(
    (form, key) => ({ ...form, [key]: customer[key] ?? "" }),
    {},
  );

const validateCustomer = (form) => {
  const errors = {};

  if (!form.name.trim()) errors.name = "Name is required";

  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
    errors.email = "Enter a valid email";

  if (!form.phone.trim()) errors.phone = "Phone number is required";

  return errors;
};

const isCompleted = (status) => String(status).toLowerCase() === "completed";

const formatAmount = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const amount = Number(value);

  return Number.isFinite(amount)
    ? `$${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : value;
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

// =========================================================
// COMPONENT
// =========================================================

const ViewDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("customer");

  const [customer, setCustomer] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // confirm: { type: "status" | "customer" | "addressUpdate" | "addressDelete", payload? }
  const [confirm, setConfirm] = useState(null);
  const [confirmError, setConfirmError] = useState("");
  const [success, setSuccess] = useState(null); // { title, message }

  // =========================================================
  // LOAD
  // =========================================================

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        throw new Error("Invalid customer ID.");
      }

      const result = await customerService.getDetail(id);

      setCustomer(result.customer);
      setForm(pickForm(result.customer));
      setBookings([...result.pendingBookings, ...result.completedBookings]);
      setAddresses(result.addresses);
      setShowErrors(false);
    } catch (error) {
      setLoadError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load customer details.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // =========================================================
  // DERIVED
  // =========================================================

  const completedBookings = useMemo(
    () => bookings.filter((booking) => isCompleted(booking.status)),
    [bookings],
  );

  const incompleteBookings = useMemo(
    () => bookings.filter((booking) => !isCompleted(booking.status)),
    [bookings],
  );

  const errors = useMemo(() => validateCustomer(form), [form]);
  const formDirty = customer
    ? FORM_FIELDS.some((key) => form[key] !== customer[key])
    : false;

  // =========================================================
  // CUSTOMER FORM
  // =========================================================

  const handleFieldChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleResetForm = () => {
    setForm(pickForm(customer));
    setShowErrors(false);
  };

  const handleRequestUpdate = () => {
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }

    setConfirmError("");
    setConfirm({ type: "customer" });
  };

  // =========================================================
  // ADDRESS (state setters are stable, so columns can use [] deps)
  // =========================================================

  const handleAddressChange = useCallback((addressId, value) => {
    setAddresses((previous) =>
      previous.map((item) =>
        item.id === addressId ? { ...item, address: value } : item,
      ),
    );
  }, []);

  // =========================================================
  // CONFIRM / SUCCESS
  // =========================================================

  const closeConfirm = useCallback(() => {
    setConfirm(null);
    setConfirmError("");
  }, []);

  const closeSuccess = useCallback(() => setSuccess(null), []);

  const handleConfirm = async () => {
    if (!confirm || !customer) return;

    try {
      switch (confirm.type) {
        case "status": {
          const next = !customer.active;
          await customerService.setStatus(customer.id ?? id, next);
          setCustomer((previous) => ({ ...previous, active: next }));
          setSuccess({
            title: next ? "Account activated" : "Account deactivated",
            message: `${customer.name || "This customer"}'s account is now ${
              next ? "active" : "inactive"
            }.`,
          });
          break;
        }

        case "customer": {
          const nameParts = form.name.trim().split(/\s+/);
          const fname = nameParts.shift() ?? "";
          const lname = nameParts.join(" ");

          await customerService.update(customer.id ?? id, {
            fname,
            lname,
            email: form.email,
            mobile: form.phone,
            address: form.address,
          });

          setCustomer((previous) => ({
            ...previous,
            name: [fname, lname].filter(Boolean).join(" "),
            email: form.email,
            phone: form.phone,
            address: form.address,
          }));

          setSuccess({
            title: "Details updated",
            message: "The customer details were saved successfully.",
          });
          break;
        }

        case "addressUpdate": {
          const { id: addressId, address } = confirm.payload;
          await customerService.updateAddress(
            customer.id ?? id,
            addressId,
            address,
          );
          setAddresses((previous) =>
            previous.map((item) =>
              item.id === addressId ? { ...item, saved: address } : item,
            ),
          );
          setSuccess({
            title: "Address updated",
            message: "The address was saved successfully.",
          });
          break;
        }

        case "addressDelete": {
          const addressId = confirm.payload.id;
          await customerService.removeAddress(customer.id ?? id, addressId);
          setAddresses((previous) =>
            previous.filter((item) => item.id !== addressId),
          );
          setSuccess({
            title: "Address deleted",
            message: "The address was removed.",
          });
          break;
        }

        default:
          break;
      }

      closeConfirm();
    } catch (error) {
      // keep the modal open and show the reason inside it
      setConfirmError(
        error.message || "Something went wrong. Please try again.",
      );
    }
  };

  const customerName = customer?.name || "this customer";

  const confirmConfig = (() => {
    switch (confirm?.type) {
      case "status":
        return customer?.active
          ? {
              variant: "danger",
              title: "Deactivate this account?",
              message: `${customerName}'s account will be marked as inactive.`,
              confirmText: "Yes, deactivate",
            }
          : {
              variant: "primary",
              title: "Activate this account?",
              message: `${customerName}'s account will be marked as active.`,
              confirmText: "Yes, activate",
            };

      case "customer":
        return {
          variant: "primary",
          title: "Update customer details?",
          message: `The changes will be saved to ${customerName}'s profile.`,
          confirmText: "Yes, update",
        };

      case "addressUpdate":
        return {
          variant: "primary",
          title: "Update this address?",
          message: `The address will be saved as: ${confirm.payload.address}`,
          confirmText: "Yes, update",
        };

      case "addressDelete":
        return {
          variant: "danger",
          title: "Delete this address?",
          message:
            "This address will be permanently removed. This can't be undone.",
          confirmText: "Yes, delete",
        };

      default:
        return {
          variant: "primary",
          title: "",
          message: "",
          confirmText: "Confirm",
        };
    }
  })();

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const bookingColumns = useMemo(
    () => [
      {
        key: "serial",
        label: "Sr.No",
        width: "40px",
        sortable: false,
        render: (_, row, rowIndex) => (
          <span className="viewdetail-serial">{rowIndex + 1}</span>
        ),
      },
      { key: "bookedId", label: "Booked ID", width: "110px", sortable: true },
      {
        key: "customerName",
        label: "Customer Name",
        width: "170px",
        sortable: true,
      },
      {
        key: "bookingAddress",
        label: "Booking Address",
        width: "280px",
        sortable: true,
        className: "viewdetail-address-td",
        render: (value) => (
          <div className="viewdetail-address-cell">
            <FaMapMarkerAlt />
            <span>{value}</span>
          </div>
        ),
      },
      {
        key: "paidAmount",
        label: "Paid Amount",
        width: "120px",
        sortable: true,
        render: (value) => (
          <span className="viewdetail-amount">{formatAmount(value)}</span>
        ),
      },
      {
        key: "transaction",
        label: "Transaction",
        width: "170px",
        sortable: true,
      },
      {
        key: "bookedDateTime",
        label: "Booked DateTime",
        width: "180px",
        sortable: true,
      },
      {
        key: "status",
        label: "Status",
        width: "110px",
        sortable: true,
        render: (value) => (
          <span
            className={`viewdetail-status ${isCompleted(value) ? "completed" : "pending"}`}
          >
            {value}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Action",
        width: "100px",
        sortable: false,
        render: (_, row) => (
          <button
            type="button"
            className="viewdetail-action-btn"
            onClick={() => navigate(ROUTES.bookingView(row.id))}
          >
            View
          </button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const addressColumns = useMemo(
    () => [
      {
        key: "serial",
        label: "Sr.No",
        width: "40px",
        sortable: false,
        render: (_, row, rowIndex) => (
          <span className="viewdetail-serial">{rowIndex + 1}</span>
        ),
      },
      {
        key: "address",
        label: "Address",
        width: "350px",
        sortable: true,
        className: "viewdetail-address-td",
        render: (_, row) => (
          <div className="viewdetail-address-cell">
            <FaMapMarkerAlt />
            <textarea
              className="viewdetail-address-input"
              value={row.address}
              rows={Math.min(
                4,
                Math.max(1, Math.ceil(row.address.length / 45)),
              )}
              aria-label="Address"
              onChange={(event) =>
                handleAddressChange(row.id, event.target.value)
              }
            />
          </div>
        ),
      },
      {
        key: "actions",
        label: "Action",
        width: "100px",
        sortable: false,
        className: "viewdetail-address-td",
        render: (_, row) => {
          const changed = row.address !== row.saved;
          const empty = !row.address.trim();

          return (
            <div className="viewdetail-address-actions">
              <button
                type="button"
                className="viewdetail-row-update-btn"
                disabled={!changed || empty}
                title={changed ? "Update address" : "No changes to save"}
                onClick={() => {
                  setConfirmError("");
                  setConfirm({ type: "addressUpdate", payload: row });
                }}
              >
                <FaSave />
                Update
              </button>

              <button
                type="button"
                className="viewdetail-row-delete-btn"
                title="Delete address"
                onClick={() => {
                  setConfirmError("");
                  setConfirm({ type: "addressDelete", payload: row });
                }}
              >
                <FaTrash />
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleAddressChange],
  );

  // =========================================================
  // TAB RENDERERS
  // =========================================================

  const summary = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: <FaClipboardList />,
      tone: "navy",
    },
    {
      label: "Completed Bookings",
      value: completedBookings.length,
      icon: <FaCheckCircle />,
      tone: "green",
    },
    {
      label: "Incomplete Bookings",
      value: incompleteBookings.length,
      icon: <FaHourglassHalf />,
      tone: "amber",
    },
  ];

  const renderCustomer = () => (
    <div className="viewdetail-customer">
      {/* PROFILE */}
      <div className="viewdetail-profile-section">
        <div className="viewdetail-profile-avatar">
          {getInitials(customer.name) || <FaUser />}
        </div>

        <div className="viewdetail-profile-content">
          <h3>{customer.name || "Unnamed customer"}</h3>

          <p>
            Customer ID: <strong>#{customer.id ?? id}</strong>
          </p>

          <div className="viewdetail-profile-meta">
            <span
              className={`viewdetail-account-badge ${customer.active ? "active" : "inactive"}`}
            >
              <FaCheckCircle />
              {customer.active ? "Active Account" : "Inactive Account"}
            </span>

            {customer.email && (
              <span className="viewdetail-chip">
                <FaEnvelope />
                {customer.email}
              </span>
            )}

            {customer.phone && (
              <span className="viewdetail-chip">
                <FaPhone />
                {customer.phone}
              </span>
            )}

            {customer.registeredDate && (
              <span className="viewdetail-chip">
                <FaCalendarAlt />
                Joined {customer.registeredDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="viewdetail-section">
        <div className="viewdetail-section-title">
          <h4>Booking Summary</h4>
        </div>

        <div className="viewdetail-summary-grid">
          {summary.map((item) => (
            <div
              className={`viewdetail-summary-card ${item.tone}`}
              key={item.label}
            >
              <span className="viewdetail-summary-icon">{item.icon}</span>
              <div>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FORM */}
      <div className="viewdetail-section">
        <div className="viewdetail-section-title">
          <h4>Customer Information</h4>
          <p>Edit the details below, then use Update Now to save.</p>
        </div>

        <div className="viewdetail-details-grid">
          <div className="viewdetail-detail-item">
            <label htmlFor="vd-name">
              Customer Name <b>*</b>
            </label>
            <input
              id="vd-name"
              type="text"
              className={`viewdetail-input ${showErrors && errors.name ? "invalid" : ""}`}
              value={form.name}
              aria-invalid={showErrors && Boolean(errors.name)}
              onChange={(event) =>
                handleFieldChange("name", event.target.value)
              }
            />
            {showErrors && errors.name && (
              <small className="viewdetail-error">{errors.name}</small>
            )}
          </div>

          <div className="viewdetail-detail-item">
            <label htmlFor="vd-email">
              Email Address <b>*</b>
            </label>
            <div className="viewdetail-input-with-icon">
              <FaEnvelope />
              <input
                id="vd-email"
                type="email"
                className={`viewdetail-input ${showErrors && errors.email ? "invalid" : ""}`}
                value={form.email}
                aria-invalid={showErrors && Boolean(errors.email)}
                onChange={(event) =>
                  handleFieldChange("email", event.target.value)
                }
              />
            </div>
            {showErrors && errors.email && (
              <small className="viewdetail-error">{errors.email}</small>
            )}
          </div>

          <div className="viewdetail-detail-item">
            <label htmlFor="vd-phone">
              Phone Number <b>*</b>
            </label>
            <div className="viewdetail-input-with-icon">
              <FaPhone />
              <input
                id="vd-phone"
                type="text"
                className={`viewdetail-input ${showErrors && errors.phone ? "invalid" : ""}`}
                value={form.phone}
                aria-invalid={showErrors && Boolean(errors.phone)}
                onChange={(event) =>
                  handleFieldChange("phone", event.target.value)
                }
              />
            </div>
            {showErrors && errors.phone && (
              <small className="viewdetail-error">{errors.phone}</small>
            )}
          </div>

          <div className="viewdetail-detail-item viewdetail-full-width">
            <label htmlFor="vd-address">Address</label>
            <div className="viewdetail-input-with-icon">
              <FaMapMarkerAlt />
              <input
                id="vd-address"
                type="text"
                className="viewdetail-input"
                value={form.address}
                onChange={(event) =>
                  handleFieldChange("address", event.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="viewdetail-tab-footer">
          <span className="viewdetail-footer-hint">
            {formDirty ? "You have unsaved changes" : "No changes to save"}
          </span>

          <div className="viewdetail-footer-actions">
            <button
              type="button"
              className="viewdetail-reset-btn"
              onClick={handleResetForm}
              disabled={!formDirty}
            >
              <FaUndo />
              Reset
            </button>

            <button
              type="button"
              className="viewdetail-update-btn"
              onClick={handleRequestUpdate}
              disabled={!formDirty}
            >
              <FaSave />
              Update Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookings = (title, subtitle, data, emptyText) => (
    <div className="viewdetail-tab-content">
      <div className="viewdetail-tab-heading">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      <div className="viewdetail-table-wrap">
        {data.length === 0 ? (
          <div className="viewdetail-empty">
            <FaInbox />
            <span>{emptyText}</span>
          </div>
        ) : (
          <DataTable
            columns={bookingColumns}
            data={data}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />
        )}
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="viewdetail-tab-content">
      <div className="viewdetail-tab-heading">
        <h3>Booking Addresses</h3>
        <p>
          Addresses saved by this customer for bookings. Edit an address, then
          press Update.
        </p>
      </div>

      <div className="viewdetail-table-wrap">
        {addresses.length === 0 ? (
          <div className="viewdetail-empty">
            <FaInbox />
            <span>No saved addresses.</span>
          </div>
        ) : (
          <DataTable
            columns={addressColumns}
            data={addresses}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "incomplete":
        return renderBookings(
          "Incomplete Booking",
          "All incomplete and pending bookings of this customer.",
          incompleteBookings,
          "No incomplete bookings.",
        );

      case "history":
        return renderBookings(
          "Booking History",
          "Completed bookings of this customer.",
          completedBookings,
          "No completed bookings yet.",
        );

      case "addresses":
        return renderAddresses();

      default:
        return renderCustomer();
    }
  };

  const tabs = [
    { key: "customer", label: "Customer" },
    {
      key: "incomplete",
      label: "Incomplete Booking",
      count: incompleteBookings.length,
    },
    {
      key: "history",
      label: "Booking History",
      count: completedBookings.length,
    },
    { key: "addresses", label: "Booking Addresses", count: addresses.length },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="viewdetail-page">
      {/* PAGE HEADER */}
      <div className="viewdetail-page-header">
        <div>
          <h2 className="viewdetail-page-title">Customer Detail</h2>

          <ServiceBreadcrumbs
            className="viewdetail-breadcrumb-spacing"
            items={[
              { label: "All Users", to: ROUTES.users },
              { label: "Customer Detail" },
            ]}
          />
        </div>

        <button
          type="button"
          className="viewdetail-back-btn"
          onClick={() => navigate(ROUTES.users)}
        >
          <FaArrowLeft />
          Back to users
        </button>
      </div>

      {/* LOADING / ERROR */}
      {loading && (
        <div className="viewdetail-card viewdetail-state" role="status">
          <span className="viewdetail-spinner" />
          Loading customer details…
        </div>
      )}

      {!loading && loadError && (
        <div
          className="viewdetail-card viewdetail-state viewdetail-state-error"
          role="alert"
        >
          <FaExclamationTriangle />
          <span>{loadError}</span>
          <button
            type="button"
            className="viewdetail-retry-btn"
            onClick={loadAll}
          >
            <FaRedo />
            Try again
          </button>
        </div>
      )}

      {/* MAIN CARD */}
      {!loading && !loadError && customer && (
        <div className="viewdetail-card">
          <div className="viewdetail-card-header">
            <div>
              <h3>Customer Details</h3>
              <p>View and manage complete information about this customer.</p>
            </div>

            <div className="viewdetail-account-control">
              <span>Account:</span>

              <button
                type="button"
                className={`viewdetail-account-btn ${customer.active ? "active" : "inactive"}`}
                onClick={() => {
                  setConfirmError("");
                  setConfirm({ type: "status" });
                }}
              >
                {customer.active ? <FaToggleOn /> : <FaToggleOff />}
                {customer.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>

          <div className="viewdetail-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`viewdetail-tab ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="viewdetail-tab-count">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          <div className="viewdetail-content" role="tabpanel">
            {renderTabContent()}
          </div>
        </div>
      )}

      {/* CONFIRM (shared modal, used by every action on this page) */}
      <ServiceConfirmModal
        isOpen={Boolean(confirm)}
        variant={confirmConfig.variant}
        title={confirmConfig.title}
        message={
          <>
            {confirmConfig.message}
            {confirmError && (
              <span className="viewdetail-confirm-error" role="alert">
                {confirmError}
              </span>
            )}
          </>
        }
        confirmText={confirmConfig.confirmText}
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />

      {/* SUCCESS (shared modal) */}
      <ServiceSuccessModal
        isOpen={Boolean(success)}
        title={success?.title}
        message={success?.message}
        onClose={closeSuccess}
      />
    </div>
  );
};

export default ViewDetail;
