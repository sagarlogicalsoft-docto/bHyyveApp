import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./viewNotification.css";
import api from "../../../../config/api";
import { getImage } from "../../../../Components/utils/images";


const USE_MOCK_DATA = false;
const CURRENCY = "$";

const PROGRESS_STEPS = [
  "pending",
  "accepted",
  "processing",
  "on-the-way",
  "delivered",
];

const STATUS_META = {
  pending: { label: "Pending", className: "vn-status--pending" },
  accepted: { label: "Accepted", className: "vn-status--accepted" },
  processing: { label: "Processing", className: "vn-status--processing" },
  "on-the-way": { label: "On The Way", className: "vn-status--on-the-way" },
  delivered: { label: "Delivered", className: "vn-status--delivered" },
  cancelled: { label: "Cancelled", className: "vn-status--cancelled" },
  "driver-rejected": {
    label: "Driver Rejected",
    className: "vn-status--cancelled",
  },
};

/* Icon path data (rendered inline by the parent, styled by .vn-icon) */
const ICONS = {
  back: <path d="M15 18l-6-6 6-6" />,
  map: (
    <>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  print: (
    <>
      <path d="M6 9V3h12v6" />
      <rect x="4" y="9" width="16" height="8" rx="1.5" />
      <path d="M6 17v4h12v-4" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
      <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </>
  ),
  basket: (
    <>
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6" />
    </>
  ),
  receipt: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h4" />
    </>
  ),
  truck: (
    <>
      <circle cx="6" cy="17" r="2" />
      <circle cx="16" cy="17" r="2" />
      <path d="M6 17V8h6l4 5h2v4" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h13v4" />
      <path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-4" />
      <path d="M21 9v6h-4a3 3 0 0 1 0-6h4Z" />
    </>
  ),
  store: (
    <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M2 9h20l-2-5H4l-2 5Z" />
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  phone: (
    <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  alert: (
    <>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </>
  ),
  cross: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6m0-6-6 6" />
    </>
  ),
  bag: (
    <>
      <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
      <path d="M8 14V9a4 4 0 1 1 8 0v5" />
    </>
  ),
  bike: (
    <>
      <circle cx="7.5" cy="17.5" r="2.2" />
      <circle cx="17.5" cy="17.5" r="2.2" />
      <path d="M3 17V9a1 1 0 0 1 1-1h6v9M10 12h5l4 4" />
    </>
  ),
  delivered: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </>
  ),
};

const STEP_ICONS = {
  pending: ICONS.clock,
  accepted: ICONS.check,
  processing: ICONS.bag,
  "on-the-way": ICONS.bike,
  delivered: ICONS.delivered,
};

const MOCK_NOTIFICATION = {
  id: 1,
  title: "New order received",
  message: "Rahul Testing placed order #BV000150. Please review and accept it.",
  is_read: 0,
  created_at: "2026-09-28T17:59:00",
  order: {
    id: 150,
    vendor_id: 12,
    order_number: "BV000150",
    order_status: "accepted",
    created_at: "2026-09-28T17:59:00",
    accepted_at: "2026-09-28T17:59:40",
    payment_status: "paid",
    payment_method: "Online",
    order_booking_type: "Delivery",
    delivery_charge: 0,
    subtotal: 69,
    coupon_discount: 0,
    hst: "13%",
    hst_amount: 8.97,
    final_total_amount: 82.97,
    wallet_used: 82.97,
    order_note: "",
    user_latitude: 43.5448,
    user_longitude: -79.6584,
    order_items_decoded: [
      {
        cart_id: 1,
        item_name: "Sandwich",
        description: "loaded sandwich",
        item_image: "",
        item_type: "veg",
        quantity: 1,
        price: 69,
        coupon_discount: 0,
        total: 69,
        addons_detail: [
          { id: 1, name: "Regular", price: 0 },
          { id: 2, name: "Cheese", price: 20 },
        ],
      },
    ],
    vendor_info: {
      business_name: "Famous sandwich",
      name: "Testing Developer",
      mobile: "9090909090",
      email_id: "testing@gmail.com",
      image: "",
      lat: 43.5449,
      long: -79.6585,
      minimum_delivery_time: 10,
      maximum_delivery_time: 30,
      delivery_time_type: "min",
    },
    customer: {
      fname: "Rahul",
      lname: "Testing",
      country_code: "91",
      mobile: "8962164658",
      email: "rahul@gmail.com",
      image: "",
      wallet: 83075,
    },
    nearest_distance_km: 0.01,
    nearest_vendor: {
      business_name: "Famous sandwich",
      name: "Testing Developer",
      mobile: "9090909090",
      email_id: "testing@gmail.com",
      image: "",
      lat: 43.5449,
      long: -79.6585,
    },
  },
};

/* ================================================================
   Helpers
================================================================ */

function normalizeStatus(status) {
  if (!status) return "pending";
  const value = String(status).trim().toLowerCase();

  switch (value) {
    case "preparing":
    case "ready_for_pickup":
      return "processing";
    case "picked_up":
    case "on_the_way":
      return "on-the-way";
    case "cancelled":
    case "rejected":
    case "missed":
      return "cancelled";
    default:
      return value.replace(/_/g, "-");
  }
}

function money(value) {
  const num = Number(value);
  const safe = Number.isFinite(num) ? num : 0;
  const formatted = Math.abs(safe).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${safe < 0 ? "- " : ""}${CURRENCY} ${formatted}`;
}

function formatDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";
  return `${formatDate(value)}, ${formatTime(value)}`;
}

function timeAgo(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return formatDate(value);
}

function toCoords(lat, lng) {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (lat === null || lat === undefined || lat === "") return null;
  if (lng === null || lng === undefined || lng === "") return null;
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return null;
  return { lat: latNum, lng: lngNum };
}

function getMapUrl(coords) {
  if (!coords) return null;
  return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
}

function getDirectionsUrl(origin, destination) {
  if (!origin || !destination) return null;
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`;
}

function getFullName(first, last, fallback = "N/A") {
  return `${first || ""} ${last || ""}`.trim() || fallback;
}

function getAddonTotal(item) {
  if (!Array.isArray(item?.addons_detail)) return 0;
  const quantity = Number(item.quantity || 1);
  return item.addons_detail.reduce(
    (sum, addon) => sum + Number(addon.price || 0) * quantity,
    0,
  );
}

const TIMELINE_FIELDS = [
  ["created_at", "Order Placed"],
  ["accepted_at", "Accepted"],
  ["preparing_at", "Preparing"],
  ["ready_for_pickup_at", "Ready For Pickup"],
  ["picked_up_at", "Picked Up"],
  ["on_the_way_at", "On The Way"],
  ["delivered_at", "Delivered"],
];

function transformOrder(apiOrder) {
  if (!apiOrder) return null;

  const vendor = apiOrder.vendor_info || {};
  const customer = apiOrder.customer || {};
  const deliveryBoy = apiOrder.delivery_boy || null;
  const nearestVendor = apiOrder.nearest_vendor || null;

  const items = (apiOrder.order_items_decoded || []).map((item, index) => ({
    id: item.cart_id || item.item_id || index,
    name: item.item_name || "N/A",
    description: item.description || "",
    image: item.item_image ? getImage(item.item_image) : null,
    qty: Number(item.quantity || 0),
    unitPrice: Number(item.price || 0),
    addonPrice: getAddonTotal(item),
    discount: Number(item.coupon_discount || 0),
    couponInfo: item.coupon_info || null,
    lineTotal: Number(item.total || item.line_total || 0),
    itemType: String(item.item_type || "").toLowerCase(),
    addons: Array.isArray(item.addons_detail)
  ? item.addons_detail
  : [],
    subCategory: item.sub_category_name || "",
  }));

  const timeline = TIMELINE_FIELDS.filter(([field]) => apiOrder[field]).map(
    ([field, label]) => ({
      id: field,
      label,
      timestamp: formatDateTime(apiOrder[field]),
    }),
  );

  if (apiOrder.cancelled_at || apiOrder.rejected_at) {
    timeline.push({
      id: "cancelled",
      label: "Cancelled",
      timestamp: formatDateTime(apiOrder.cancelled_at || apiOrder.rejected_at),
    });
  }

  const storeCoords = toCoords(vendor.lat, vendor.long);
  const customerCoords = toCoords(
    apiOrder.user_latitude ?? customer.lat,
    apiOrder.user_longitude ?? customer.lang ?? customer.long,
  );
  const nearestCoords = nearestVendor
    ? toCoords(nearestVendor.lat, nearestVendor.long)
    : null;

  const paid = String(apiOrder.payment_status || "").toLowerCase() === "paid";
  const grandTotal = Number(
    apiOrder.final_total_amount || apiOrder.total_amount || 0,
  );
  const walletUsed = Number(apiOrder.wallet_used || 0);
  const walletBalance = customer.wallet ?? customer.wallet_balance;

  return {
    id: apiOrder.id,
    vendorId: apiOrder.vendor_id,
    orderNumber: apiOrder.order_number || apiOrder.id,
    status: normalizeStatus(apiOrder.order_status),
    createdAt: apiOrder.created_at,
    dateDisplay: formatDate(apiOrder.created_at),
    timeDisplay: formatTime(apiOrder.created_at),
    paid,
    paymentMethod: apiOrder.payment_method || "",
    orderType: apiOrder.order_booking_type || apiOrder.orderBookingType || "",
    items,
    subtotal: Number(apiOrder.subtotal || 0),
    addonsTotal: items.reduce((sum, item) => sum + item.addonPrice, 0),
    couponDiscount: Number(apiOrder.coupon_discount || 0),
    couponInfo: apiOrder.coupon_info || null,
    taxLabel: `HST (${apiOrder.hst || "13%"})`,
    taxAmount: Number(apiOrder.hst_amount || 0),
    taxAmount: Number(apiOrder.hst_amount || 0),
    deliveryCharge: Number(apiOrder.delivery_charge || 0),
    walletUsed,
    grandTotal: Number(apiOrder.final_total_amount || 0),
    balanceToPay:
      apiOrder.payable_amount !== undefined && apiOrder.payable_amount !== null
        ? Number(apiOrder.payable_amount)
        : Math.max(grandTotal - walletUsed, 0),
    orderNote: apiOrder.order_note || "",
    cancelReason: apiOrder.canceled_reason || apiOrder.cancel_reason || "",
    timeline,
    store: {
      name: vendor.business_name || vendor.name || "N/A",
      role: vendor.name || "",
      phone: vendor.mobile || "",
      email: vendor.email_id || "",
      image: vendor.image ? getImage(vendor.image) : null,
      coords: storeCoords,
      mapUrl: getMapUrl(storeCoords),
      prepTime:
        vendor.minimum_delivery_time && vendor.maximum_delivery_time
          ? `${vendor.minimum_delivery_time}–${vendor.maximum_delivery_time} ${vendor.delivery_time_type || "min"}`
          : "",
    },
    customer: {
      name: getFullName(customer.fname, customer.lname, customer.name),
      phone: customer.mobile
        ? `${customer.country_code ? `+${customer.country_code} ` : ""}${customer.mobile}`
        : "",
      email: customer.email || "",
      image: customer.image ? getImage(customer.image) : null,
      coords: customerCoords,
      mapUrl: getMapUrl(customerCoords),
      walletBalance:
        walletBalance !== undefined && walletBalance !== null
          ? Number(walletBalance)
          : null,
    },
    deliveryMan: deliveryBoy
      ? {
          name: getFullName(
            deliveryBoy.first_name,
            deliveryBoy.last_name,
            deliveryBoy.name,
          ),
          role: "Delivery Man",
          phone: deliveryBoy.mobile || deliveryBoy.phone || "",
          email: deliveryBoy.email || "",
          image:
            deliveryBoy.profile_image || deliveryBoy.image
              ? getImage(deliveryBoy.profile_image || deliveryBoy.image)
              : null,
        }
      : null,
    nearestRestaurant: nearestVendor
      ? {
          name: nearestVendor.business_name || nearestVendor.name || "N/A",
          role: nearestVendor.name || "",
          phone: nearestVendor.mobile || "",
          email: nearestVendor.email_id || "",
          image: nearestVendor.image ? getImage(nearestVendor.image) : null,
          mapUrl: getMapUrl(nearestCoords),
          distanceKm: apiOrder.nearest_distance_km,
        }
      : null,
  };
}

function transformNotification(apiNotification) {
  if (!apiNotification) return null;

  const isRead = Boolean(
    Number(apiNotification.is_read ?? apiNotification.read ?? 0),
  );

  return {
    id: apiNotification.id,
    title: apiNotification.title || "Order notification",
    message: apiNotification.message || apiNotification.body || "",
    createdAt: apiNotification.created_at,
    wasUnread: !isRead,
    order: transformOrder(
      apiNotification.order || apiNotification.order_details || null,
    ),
  };
}

/* ================================================================
   API layer
   TODO: confirm endpoint paths + response shape with backend
================================================================ */

const notificationApi = {
  async getNotificationById(notificationId, signal) {
    const response = await api.get(
      `/restaurant/notifications/${notificationId}`,
      { signal }
    );

    return response.data;
  },

  async getOrderByBookingId(bookingId, signal) {
    const response = await api.get(
      `/restaurant/notifications/order/${bookingId}`,
      { signal }
    );

    return response.data;
  },
};

/* ================================================================
   Main component
================================================================ */

export default function ViewNotification({ onBack }) {
  const navigate = useNavigate();
  const { notificationId } = useParams();
  const handleBack = onBack || (() => navigate(-1));

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [copied, setCopied] = useState(false);

  /* ---- load notification ---- */
useEffect(() => {
  const controller = new AbortController();

  async function loadNotification() {
    setLoading(true);
    setError(null);

    try {
      // 1. Open notification
      // This also marks is_seen_admin = 1
      const notificationResponse =
        await notificationApi.getNotificationById(
          notificationId,
          controller.signal
        );

      const notificationData =
        notificationResponse?.notification;

      const bookingId =
        notificationResponse?.booked_id;

      if (!notificationData) {
        throw new Error("Notification not found.");
      }

      if (!bookingId) {
        throw new Error("Booking ID not found.");
      }

      // 2. Get the actual restaurant order
      const orderResponse =
        await notificationApi.getOrderByBookingId(
          bookingId,
          controller.signal
        );

      const orderData = orderResponse?.order;

      if (!orderData) {
        throw new Error("Order not found.");
      }

      // 3. Convert backend order into your existing UI shape
      setNotification({
        id: notificationData.id,
        title:
          notificationData.title ||
          "Restaurant Order Notification",
        message:
          notificationData.message ||
          notificationData.body ||
          "",
        createdAt: notificationData.date,
        wasUnread:
          Number(notificationData.is_seen_admin) === 0,
        order: transformOrder(orderData),
      });
    } catch (err) {
      if (
        err.name === "AbortError" ||
        err.code === "ERR_CANCELED"
      ) {
        return;
      }

      console.error(
        "VIEW NOTIFICATION ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Couldn't load this notification."
      );
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  if (notificationId) {
    loadNotification();
  } else {
    setLoading(false);
    setError("Notification ID not found.");
  }

  return () => controller.abort();
}, [notificationId, reloadKey]);

  /* ---- loading skeleton ---- */
  if (loading) {
    return (
      <div className="vn-page" aria-busy="true" aria-live="polite">
        <div className="vn-skeleton vn-skeleton--bar" />
        <div className="vn-skeleton vn-skeleton--title" />
        <div className="vn-skeleton vn-skeleton--strip" />
        <div className="vn-skeleton vn-skeleton--block" />
        <div className="vn-skeleton vn-skeleton--block" />
      </div>
    );
  }

  /* ---- error state ---- */
  if (error || !notification) {
    return (
      <div className="vn-page">
        <div className="vn-state" role="alert">
          <svg className="vn-icon vn-icon--xl" viewBox="0 0 24 24" aria-hidden="true">
            {ICONS.alert}
          </svg>
          <h2>Something went wrong</h2>
          <p>{error || "Notification not found."}</p>

          <div className="vn-state__actions">
            <button type="button" className="vn-btn" onClick={handleBack}>
              Back to Notifications
            </button>
            <button
              type="button"
              className="vn-btn vn-btn--primary"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { order } = notification;

  const statusMeta = order
    ? STATUS_META[order.status] || { label: order.status, className: "" }
    : null;
  const isDisrupted =
    order?.status === "cancelled" || order?.status === "driver-rejected";
  const currentStepIndex = order ? PROGRESS_STEPS.indexOf(order.status) : -1;

  const mapUrl = order
    ? getDirectionsUrl(order.store.coords, order.customer.coords) ||
      order.store.mapUrl ||
      order.customer.mapUrl
    : null;

  const handleOpenMap = () => {
    if (mapUrl) window.open(mapUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyOrderNumber = () => {
    if (!order || !navigator.clipboard) return;

    navigator.clipboard
      .writeText(String(order.orderNumber))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  };

  return (
    <div className="vn-page">
      {/* ---------------- Top bar ---------------- */}

      <div className="vn-topbar">
        <button type="button" className="vn-btn" onClick={handleBack}>
          <svg className="vn-icon" viewBox="0 0 24 24" aria-hidden="true">
            {ICONS.back}
          </svg>
          Back to Notifications
        </button>

        {order && (
          <div className="vn-topbar__right">
            <button
              type="button"
              className="vn-btn vn-btn--accent"
              onClick={handleOpenMap}
              disabled={!mapUrl}
              title={mapUrl ? "Open route in Google Maps" : "No location available"}
            >
              <svg className="vn-icon" viewBox="0 0 24 24" aria-hidden="true">
                {ICONS.map}
              </svg>
              Map
            </button>

            <button type="button" className="vn-btn" onClick={() => window.print()}>
              <svg className="vn-icon" viewBox="0 0 24 24" aria-hidden="true">
                {ICONS.print}
              </svg>
              Print
            </button>
          </div>
        )}
      </div>

      {/* ---------------- Notification message ---------------- */}

      <section className="vn-notice" aria-label="Notification">
        <span className="vn-notice__icon">
          <svg className="vn-icon vn-icon--lg" viewBox="0 0 24 24" aria-hidden="true">
            {ICONS.bell}
          </svg>
        </span>

        <div className="vn-notice__body">
          <div className="vn-notice__title">
            {notification.title}
            {notification.wasUnread && <span className="vn-new-badge">New</span>}
          </div>
          {notification.message && (
            <p className="vn-notice__message">{notification.message}</p>
          )}
        </div>

        <span className="vn-notice__time">{timeAgo(notification.createdAt)}</span>
      </section>

      {!order ? (
        <div className="vn-state vn-state--soft">
          <svg className="vn-icon vn-icon--xl" viewBox="0 0 24 24" aria-hidden="true">
            {ICONS.receipt}
          </svg>
          <h2>No order linked</h2>
          <p>This notification isn't attached to an order.</p>
        </div>
      ) : (
        <>
          {/* ---------------- Title + status ---------------- */}

          <div className="vn-title">
            <h1>Order Details</h1>
            <span className={`vn-status ${statusMeta.className}`}>
              <span className="vn-status__dot" />
              {statusMeta.label.toUpperCase()}
            </span>
          </div>

          <p className="vn-subline">
            <span>Order #{order.orderNumber}</span>
            <button
              type="button"
              className="vn-copy-btn"
              onClick={handleCopyOrderNumber}
              aria-label="Copy order number"
            >
              <svg className="vn-icon vn-icon--sm" viewBox="0 0 24 24" aria-hidden="true">
                {copied ? ICONS.check : ICONS.copy}
              </svg>
              {copied ? "Copied" : "Copy"}
            </button>
            <span className="vn-dot-sep">·</span>
            <span>
              {order.dateDisplay}, {order.timeDisplay}
            </span>
            <span className="vn-dot-sep">·</span>
            <span>Payment:</span>
            <span className={`vn-badge ${order.paid ? "vn-badge--paid" : "vn-badge--unpaid"}`}>
              {order.paid ? "Paid" : "Unpaid"}
            </span>
          </p>

          {/* ---------------- Summary strip + progress ---------------- */}

          <div className="vn-summary">
            <div className="vn-summary__strip">
              <div className="vn-stat">
                <span className="vn-stat__label">Order Number</span>
                <span className="vn-stat__value">#{order.orderNumber}</span>
              </div>

              <div className="vn-stat">
                <span className="vn-stat__label">Order Date</span>
                <span className="vn-stat__value">{order.dateDisplay}</span>
              </div>

              <div className="vn-stat">
                <span className="vn-stat__label">Order Time</span>
                <span className="vn-stat__value">{order.timeDisplay}</span>
              </div>

              <div className="vn-stat">
                <span className="vn-stat__label">Payment Method</span>
                <span className="vn-stat__value vn-stat__value--inline">
                  {order.paymentMethod}
                  {order.paid && <span className="vn-badge vn-badge--paid">Paid</span>}
                </span>
              </div>

              <div className="vn-stat">
                <span className="vn-stat__label">Grand Total</span>
                <span className="vn-stat__value vn-num">{money(order.grandTotal)}</span>
              </div>

              <div className="vn-stat">
                <span className="vn-stat__label">Wallet Used</span>
                <span className="vn-stat__value vn-stat__value--wallet vn-num">
                  {order.walletUsed > 0 ? `- ${money(order.walletUsed)}` : "—"}
                </span>
              </div>
            </div>

            {isDisrupted ? (
              <div className="vn-banner" role="status">
                <svg className="vn-icon vn-icon--lg" viewBox="0 0 24 24" aria-hidden="true">
                  {ICONS.cross}
                </svg>
                <div>
                  <strong>This order was {statusMeta.label.toLowerCase()}.</strong>
                  {order.cancelReason && <span>Reason: {order.cancelReason}</span>}
                </div>
              </div>
            ) : (
              <div className="vn-tracker-scroll">
                <ol className="vn-tracker" aria-label="Order progress">
                  {PROGRESS_STEPS.map((step, index) => {
                    const isDone = currentStepIndex >= 0 && index < currentStepIndex;
                    const isActive = index === currentStepIndex;

                    return (
                      <li
                        key={step}
                        className={`vn-tracker__step ${index <= currentStepIndex ? "is-reached" : ""} ${isDone ? "is-done" : ""} ${isActive ? "is-active" : ""}`}
                        aria-current={isActive ? "step" : undefined}
                      >
                        <span className="vn-tracker__circle">
                          <svg className="vn-icon vn-icon--lg" viewBox="0 0 24 24" aria-hidden="true">
                            {isDone ? ICONS.check : STEP_ICONS[step]}
                          </svg>
                        </span>
                        <span className="vn-tracker__label">{STATUS_META[step].label}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>

          {/* ---------------- Ordered items + pricing ---------------- */}

          <section className="vn-card">
            <div className="vn-card__header vn-card__header--spread">
              <div className="vn-card__title">
                <svg className="vn-icon vn-icon--lg" viewBox="0 0 24 24" aria-hidden="true">
                  {ICONS.basket}
                </svg>
                <h2>Ordered Items</h2>
              </div>
              <span className="vn-chip">
                {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            <div className="vn-table-scroll">
              <table className="vn-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Details</th>
                    <th className="vn-right">Qty</th>
                    <th className="vn-right">Unit Price</th>
                    <th className="vn-right">Addon Price</th>
                    <th className="vn-right">Discount</th>
                    <th className="vn-right">Line Total</th>
                  </tr>
                </thead>

                <tbody>
                  {order.items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="vn-table__empty">
                        No items found for this order.
                      </td>
                    </tr>
                  )}

                  {order.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="vn-muted">{index + 1}</td>

                      <td>
                        <div className="vn-item">
                          <span className="vn-item__thumb">
                            {item.image ? (
                              <img src={item.image} alt={item.name} loading="lazy" />
                            ) : (
                              <svg className="vn-icon" viewBox="0 0 24 24" aria-hidden="true">
                                {ICONS.image}
                              </svg>
                            )}
                          </span>

                          <span className="vn-item__info">
                            <span className="vn-item__name">
                              {item.itemType && (
                                <span
                                  className={`vn-diet ${item.itemType === "veg" ? "vn-diet--veg" : "vn-diet--nonveg"}`}
                                  title={item.itemType === "veg" ? "Veg" : "Non-Veg"}
                                />
                              )}
                              {item.name}
                            </span>

                            {item.description && (
                              <span className="vn-item__desc">{item.description}</span>
                            )}

                            {item.addons.length > 0 && (
                              <span className="vn-item__addons">
                                <span className="vn-item__addons-label">Add-ons:</span>
                                {item.addons.map((addon) => (
                                  <span className="vn-addon" key={addon.id || addon.name}>
                                    {addon.name}
                                    {Number(addon.price || 0) > 0 && (
                                      <span className="vn-addon__price">
                                        +{money(addon.price)}
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="vn-right vn-num">{item.qty}</td>
                      <td className="vn-right vn-num">{money(item.unitPrice)}</td>
                      <td className="vn-right vn-num">
                        {item.addonPrice > 0 ? (
                          <span className="vn-text-accent">+{money(item.addonPrice)}</span>
                        ) : (
                          <span className="vn-dash">—</span>
                        )}
                      </td>
                      <td className="vn-right vn-num">
                        {item.discount > 0 ? (
                          <span className="vn-text-success">- {money(item.discount)}</span>
                        ) : (
                          <span className="vn-dash">—</span>
                        )}
                      </td>
                      <td className="vn-right vn-num vn-strong">{money(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="vn-pricing">
              <div className="vn-pricing__row">
                <span>Items Subtotal</span>
                <span className="vn-num vn-strong">{money(order.subtotal)}</span>
              </div>

              {order.addonsTotal > 0 && (
                <div className="vn-pricing__row">
                  <span>Add-ons Total</span>
                  <span className="vn-num vn-text-accent vn-strong">
                    + {money(order.addonsTotal)}
                  </span>
                </div>
              )}

              {order.couponDiscount > 0 && (
                <div className="vn-pricing__row">
                  <span>Coupon Discount</span>
                  <span className="vn-num vn-text-success vn-strong">
                    - {money(order.couponDiscount)}
                  </span>
                </div>
              )}

              <div className="vn-pricing__row">
                <span>
                  <svg className="vn-icon vn-icon--sm" viewBox="0 0 24 24" aria-hidden="true">
                    {ICONS.receipt}
                  </svg>
                  {order.taxLabel}
                </span>
                <span className="vn-num vn-text-danger vn-strong">
                  + {money(order.taxAmount)}
                </span>
              </div>

              <div className="vn-pricing__row">
                <span>
                  <svg className="vn-icon vn-icon--sm" viewBox="0 0 24 24" aria-hidden="true">
                    {ICONS.truck}
                  </svg>
                  Delivery Charge
                </span>
                {order.deliveryCharge > 0 ? (
                  <span className="vn-num vn-strong">{money(order.deliveryCharge)}</span>
                ) : (
                  <span className="vn-text-success vn-strong">Free</span>
                )}
              </div>

              <div className="vn-pricing__row vn-pricing__row--total">
                <span>Grand Total</span>
                <span className="vn-num">{money(order.grandTotal)}</span>
              </div>

              {order.walletUsed > 0 && (
                <>
                  <div className="vn-pricing__row vn-pricing__row--after">
                    <span>
                      <svg className="vn-icon vn-icon--sm" viewBox="0 0 24 24" aria-hidden="true">
                        {ICONS.wallet}
                      </svg>
                      Paid from Wallet
                    </span>
                    <span className="vn-num vn-text-success vn-strong">
                      - {money(order.walletUsed)}
                    </span>
                  </div>

                  <div className="vn-pricing__row vn-pricing__row--after">
                    <span>Balance to Pay</span>
                    <span className="vn-num vn-strong">{money(order.balanceToPay)}</span>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ---------------- Store / Customer / Delivery man ---------------- */}

          <div className="vn-grid vn-grid--3">
            <section className="vn-card">
              <div className="vn-card__header">
                <div className="vn-card__title">
                  <svg className="vn-icon vn-icon--lg" viewBox="0 0 24 24" aria-hidden="true">
                    {ICONS.store}
                  </svg>
                  <h3>Store Information</h3>
                </div>
              </div>

              <div className="vn-card__body">
                <PartyCard person={order.store} extraLine={order.store.prepTime}>
                  {order.store.mapUrl && (
                    <a className="vn-link-btn" href={order.store.mapUrl} target="_blank" rel="noopener noreferrer">
                      <svg className="vn-icon vn-icon--sm" viewBox="0 0 24 24" aria-hidden="true">
                        {ICONS.pin}
                      </svg>
                      View on Map
                    </a>
                  )}
                </PartyCard>
              </div>
            </section>

            <section className="vn-card">
              <div className="vn-card__header">
                <div className="vn-card__title">
                  <svg className="vn-icon vn-icon--lg" viewBox="0 0 24 24" aria-hidden="true">
                    {ICONS.user}
                  </svg>
                  <h3>Customer Information</h3>
                </div>
              </div>

              <div className="vn-card__body">
                <PartyCard
                  person={order.customer}
                  walletLine={
                    order.customer.walletBalance !== null
                      ? money(order.customer.walletBalance)
                      : ""
                  }
                >
                  {order.customer.mapUrl && (
                    <a className="vn-link-btn" href={order.customer.mapUrl} target="_blank" rel="noopener noreferrer">
                      <svg className="vn-icon vn-icon--sm" viewBox="0 0 24 24" aria-hidden="true">
                        {ICONS.map}
                      </svg>
                      Customer Location
                    </a>
                  )}
                </PartyCard>
              </div>
            </section>

            <section className="vn-card">
              <div className="vn-card__header">
                <div className="vn-card__title">
                  <svg className="vn-icon vn-icon--lg" viewBox="0 0 24 24" aria-hidden="true">
                    {ICONS.bike}
                  </svg>
                  <h3>Delivery Man</h3>
                </div>
              </div>

              <div className="vn-card__body">
                {order.deliveryMan ? (
                  <PartyCard person={order.deliveryMan} />
                ) : (
                  <div className="vn-empty">
                    <svg className="vn-icon vn-icon--xl" viewBox="0 0 24 24" aria-hidden="true">
                      {ICONS.bike}
                    </svg>
                    No delivery man assigned yet.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ---------------- Timeline + nearest restaurant ---------------- */}

          <div className="vn-grid vn-grid--2">
            <section className="vn-card">
              <div className="vn-card__header">
                <div className="vn-card__title">
                  <svg className="vn-icon vn-icon--lg" viewBox="0 0 24 24" aria-hidden="true">
                    {ICONS.clock}
                  </svg>
                  <h3>Order Timeline</h3>
                </div>
              </div>

              <div className="vn-card__body">
                {order.timeline.length === 0 ? (
                  <div className="vn-empty">No timeline events yet.</div>
                ) : (
                  <ol className="vn-timeline">
                    {order.timeline.map((event, index) => (
                      <li
                        key={event.id}
                        className={index === order.timeline.length - 1 ? "is-current" : ""}
                      >
                        <span className="vn-timeline__dot" />
                        <span className="vn-timeline__label">{event.label}</span>
                        <span className="vn-timeline__time vn-num">{event.timestamp}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </section>

            {order.nearestRestaurant && (
              <section className="vn-card">
                <div className="vn-card__header">
                  <div className="vn-card__title">
                    <svg className="vn-icon vn-icon--lg" viewBox="0 0 24 24" aria-hidden="true">
                      {ICONS.pin}
                    </svg>
                    <h3>Nearest Restaurant to Customer</h3>
                  </div>
                </div>

                <div className="vn-card__body">
                  {order.nearestRestaurant.distanceKm !== undefined &&
                    order.nearestRestaurant.distanceKm !== null && (
                      <span className="vn-distance">
                        <svg className="vn-icon vn-icon--sm" viewBox="0 0 24 24" aria-hidden="true">
                          {ICONS.pin}
                        </svg>
                        {Number(order.nearestRestaurant.distanceKm).toFixed(2)} km away
                      </span>
                    )}

                  <PartyCard person={order.nearestRestaurant}>
                    {order.nearestRestaurant.mapUrl && (
                      <a
                        className="vn-link-btn"
                        href={order.nearestRestaurant.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="vn-icon vn-icon--sm" viewBox="0 0 24 24" aria-hidden="true">
                          {ICONS.map}
                        </svg>
                        View on Map
                      </a>
                    )}
                  </PartyCard>
                </div>
              </section>
            )}
          </div>

          {/* ---------------- Order note ---------------- */}

          {order.orderNote && (
            <section className="vn-card">
              <div className="vn-card__header">
                <div className="vn-card__title">
                  <h3>Order Note</h3>
                </div>
              </div>
              <div className="vn-card__body vn-note">{order.orderNote}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

/* ===================================================================
   Shared card used for store / customer / delivery man / nearest store
=================================================================== */

function PartyCard({ person, extraLine, walletLine, children }) {
  if (!person) return null;

  return (
    <div className="vn-party">
      <span className="vn-party__avatar">
        {person.image ? (
          <img src={person.image} alt={person.name} loading="lazy" />
        ) : (
          <svg className="vn-icon" viewBox="0 0 24 24" aria-hidden="true">
            {ICONS.user}
          </svg>
        )}
      </span>

      <div className="vn-party__body">
        <span className="vn-party__name">{person.name}</span>

        {person.role && <span className="vn-party__line">{person.role}</span>}

        {person.phone && (
          <a className="vn-party__line vn-party__line--link" href={`tel:${person.phone.replace(/\s/g, "")}`}>
            <svg className="vn-icon vn-icon--sm" viewBox="0 0 24 24" aria-hidden="true">
              {ICONS.phone}
            </svg>
            {person.phone}
          </a>
        )}

        {person.email && (
          <a className="vn-party__line vn-party__line--link" href={`mailto:${person.email}`}>
            <svg className="vn-icon vn-icon--sm" viewBox="0 0 24 24" aria-hidden="true">
              {ICONS.mail}
            </svg>
            {person.email}
          </a>
        )}

        {extraLine && (
          <span className="vn-party__line">
            <svg className="vn-icon vn-icon--sm" viewBox="0 0 24 24" aria-hidden="true">
              {ICONS.clock}
            </svg>
            {extraLine}
          </span>
        )}

        {walletLine && (
          <span className="vn-party__line">
            <svg className="vn-icon vn-icon--sm" viewBox="0 0 24 24" aria-hidden="true">
              {ICONS.wallet}
            </svg>
            Wallet:
            <strong className="vn-text-success">{walletLine}</strong>
          </span>
        )}

        {children}
      </div>
    </div>
  );
}