import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./orderDetails.css";
import api from "../../../config/api";
import { getImage } from "../../../Components/utils/images";

const PROGRESS_STEPS = [
  "pending",
  "accepted",
  "processing",
  "on-the-way",
  "delivered",
];

const STATUS_META = {
  pending: { label: "Pending", className: "status-pill--pending" },
  accepted: { label: "Accepted", className: "status-pill--accepted" },
  preparing: { label: "Preparing", className: "status-pill--processing" },
  processing: { label: "Processing", className: "status-pill--processing" },
  "ready-for-pickup": {
    label: "Ready For Pickup",
    className: "status-pill--ready",
  },
  "picked-up": { label: "Picked Up", className: "status-pill--processing" },
  "on-the-way": { label: "On The Way", className: "status-pill--on-the-way" },
  delivered: { label: "Delivered", className: "status-pill--delivered" },
  cancelled: { label: "Cancelled", className: "status-pill--cancelled" },
  "driver-rejected": {
    label: "Driver Rejected",
    className: "status-pill--cancelled",
  },
};

/* ================================================================
   Helpers
================================================================ */

function normalizeStatus(status) {
  if (!status) return "pending";

  const value = String(status).trim().toLowerCase();

  switch (value) {
    case "pending":
      return "pending";

    case "accepted":
      return "accepted";

    case "cancelled":
      return "cancelled";

    case "preparing":
      return "preparing";

    case "ready_for_pickup":
      return "ready-for-pickup";

    case "picked_up":
      return "picked-up";

    case "on_the_way":
      return "on-the-way";

    case "delivered":
      return "delivered";

    case "rejected":
      return "driver-rejected";

    default:
      return value.replace(/_/g, "-");
  }
}

function formatMoney(value) {
  const num = Number(value);
  return Number.isFinite(num)
    ? num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getImageUrl(filename) {
  if (!filename) return null;

  if (
    filename.startsWith("http://") ||
    filename.startsWith("https://") ||
    filename.startsWith("data:")
  ) {
    return filename;
  }

  const baseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";
  const serverUrl = baseUrl.replace(/\/api\/?$/, "");

  return `${serverUrl}/uploads/${filename}`;
}

function getMapUrl(lat, lng) {
  if (
    lat === null ||
    lat === undefined ||
    lng === null ||
    lng === undefined ||
    lat === "" ||
    lng === ""
  ) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}

function getDirectionsUrl(storeLat, storeLng, customerLat, customerLng) {
  if (
    storeLat === null ||
    storeLat === undefined ||
    storeLng === null ||
    storeLng === undefined ||
    customerLat === null ||
    customerLat === undefined ||
    customerLng === null ||
    customerLng === undefined
  ) {
    return null;
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    `${storeLat},${storeLng}`,
  )}&destination=${encodeURIComponent(`${customerLat},${customerLng}`)}`;
}

function getCustomerName(customer) {
  if (!customer) return "N/A";
  const firstName = customer.fname || "";
  const lastName = customer.lname || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || customer.name || "N/A";
}

function getVendorName(vendor) {
  if (!vendor) return "N/A";
  return vendor.business_name || vendor.name || "N/A";
}

function getAddonTotal(item) {
  if (!Array.isArray(item?.addons_detail)) return 0;
  const quantity = Number(item.quantity || 1);
  return item.addons_detail.reduce(
    (sum, addon) => sum + Number(addon.price || 0) * quantity,
    0,
  );
}

/* ================================================================
   Transform API response into the shape used by this UI
================================================================ */

function transformOrder(apiOrder) {
  if (!apiOrder) return null;

  const normalizedStatus = normalizeStatus(apiOrder.order_status);
  const vendor = apiOrder.vendor_info || {};
  const customer = apiOrder.customer || {};
  const deliveryBoy = apiOrder.delivery_boy;
  const nearestVendor = apiOrder.nearest_vendor;
  const orderDate = formatDate(apiOrder.created_at);
  const orderTime = formatTime(apiOrder.created_at);

  const items = Array.isArray(apiOrder.order_items_decoded)
    ? apiOrder.order_items_decoded.map((item, index) => ({
        id: item.cart_id || item.item_id || index,
        name: item.item_name || "N/A",
        description: item.description || "",
        image: getImage(item.item_image),
        qty: Number(item.quantity || 0),
        unitPrice: Number(item.price || 0),
        addonPrice: getAddonTotal(item),
        discount: Number(item.coupon_discount || 0),
        lineTotal: Number(item.total || item.line_total || 0),
        itemType: item.item_type || "",
        subCategoryName: item.sub_category_name || "",
        addons_detail: item.addons_detail || [],
        couponInfo: item.coupon_info || null,
      }))
    : [];

  const storeMapUrl = getMapUrl(vendor.lat, vendor.long);

  const customerLat = apiOrder.user_latitude || customer.lat || null;
  const customerLng = apiOrder.user_longitude || customer.lang || null;
  const customerMapUrl = getMapUrl(customerLat, customerLng);

  const deliveryBoyLat = deliveryBoy?.lat || deliveryBoy?.latitude || null;
  const deliveryBoyLng = deliveryBoy?.long || deliveryBoy?.longitude || null;
  const deliveryBoyMapUrl = getMapUrl(deliveryBoyLat, deliveryBoyLng);

  const nearestRestaurant = nearestVendor
    ? {
        distanceKm: apiOrder.nearest_distance_km,
        name: getVendorName(nearestVendor),
        role: nearestVendor.name || "",
        phone: nearestVendor.mobile || "",
        email: nearestVendor.email_id || "",
        image: getImage(nearestVendor?.image),
        locationUrl: getMapUrl(nearestVendor.lat, nearestVendor.long),
      }
    : null;

  const timeline = [];

  if (apiOrder.created_at) {
    timeline.push({
      id: "created",
      label: "Order Placed",
      timestamp: formatDateTime(apiOrder.created_at),
    });
  }

  if (apiOrder.accepted_at) {
    timeline.push({
      id: "accepted",
      label: "Accepted",
      timestamp: formatDateTime(apiOrder.accepted_at),
    });
  }

  if (apiOrder.preparing_at) {
    timeline.push({
      id: "preparing",
      label: "Preparing",
      timestamp: formatDateTime(apiOrder.preparing_at),
    });
  }

  if (apiOrder.ready_for_pickup_at) {
    timeline.push({
      id: "ready",
      label: "Ready For Pickup",
      timestamp: formatDateTime(apiOrder.ready_for_pickup_at),
    });
  }

  if (apiOrder.picked_up_at) {
    timeline.push({
      id: "picked-up",
      label: "Picked Up",
      timestamp: formatDateTime(apiOrder.picked_up_at),
    });
  }

  if (apiOrder.on_the_way_at) {
    timeline.push({
      id: "on-the-way",
      label: "On The Way",
      timestamp: formatDateTime(apiOrder.on_the_way_at),
    });
  }

  if (apiOrder.delivered_at) {
    timeline.push({
      id: "delivered",
      label: "Delivered",
      timestamp: formatDateTime(apiOrder.delivered_at),
    });
  }

  if (apiOrder.rejected_at || apiOrder.cancelled_at) {
    timeline.push({
      id: "cancelled",
      label: "Cancelled",
      timestamp: formatDateTime(apiOrder.cancelled_at || apiOrder.rejected_at),
    });
  }

  const deliveryCharge = Number(apiOrder.delivery_charge || 0);

  return {
    id: apiOrder.id,
    vendorId: apiOrder.vendor_id,
    orderNumber: apiOrder.order_number || apiOrder.id,
    status: normalizedStatus,
    dateDisplay: orderDate,
    timeDisplay: orderTime,
    paid: String(apiOrder.payment_status || "").toLowerCase() === "paid",
    paymentMethod:
      apiOrder.payment_method ||
      (String(apiOrder.payment_status || "").toLowerCase() === "paid"
        ? "Online"
        : "Unpaid"),
    orderType:
      apiOrder.orderBookingType || apiOrder.order_booking_type || "N/A",
    deliveryCharge,
    items,
    subtotal: Number(apiOrder.subtotal || 0),
    couponDiscount: Number(apiOrder.coupon_discount || 0),
    amountAfterDiscount: Number(apiOrder.amount_after_discount || 0),
    taxLabel: `HST (${apiOrder.hst || "13%"})`,
    taxAmount: Number(apiOrder.hst_amount || 0),
    grandTotal: Number(
      apiOrder.final_total_amount || apiOrder.total_amount || 0,
    ),
    store: {
      name: getVendorName(vendor),
      role: vendor.name || "",
      phone: vendor.mobile || "",
      email: vendor.email_id || "",
      prepTimeDisplay:
        vendor.minimum_delivery_time && vendor.maximum_delivery_time
          ? `${vendor.minimum_delivery_time}–${vendor.maximum_delivery_time} ${vendor.delivery_time_type || "min"}`
          : "",
      image: getImage(vendor?.image),
      mapUrl: storeMapUrl,
    },
    customer: {
      name: getCustomerName(customer),
      phone: customer.mobile
        ? `${customer.country_code ? `+${customer.country_code} ` : ""}${customer.mobile}`
        : "",
      email: customer.email || "",
      image: getImage(customer?.image),
      locationUrl: customerMapUrl,
      address:
        apiOrder.address || apiOrder.drop_address || customer.address || "",
    },
    deliveryMan: deliveryBoy
      ? {
          name:
            `${deliveryBoy.first_name || ""} ${deliveryBoy.last_name || ""}`.trim() ||
            deliveryBoy.name ||
            "N/A",
          role: "Delivery Man",
          phone: deliveryBoy.mobile || deliveryBoy.phone || "",
          email: deliveryBoy.email || "",
          image: getImage(deliveryBoy.profile_image || deliveryBoy.image),
          mapUrl: deliveryBoyMapUrl,
        }
      : null,
    timeline,
    nearestRestaurant,
    orderNote: apiOrder.order_note || "",
    guests: apiOrder.guests || "",
    timeSlot: apiOrder.time_slot || "",
    deliveryOtp: apiOrder.delivery_otp || apiOrder.otp || "",
    cancelReason: apiOrder.canceled_reason || apiOrder.cancel_reason || "",
    cancelledDate: apiOrder.cancelled_date || apiOrder.cancelled_at || "",
    walletUsed: Number(apiOrder.wallet_used || 0),
    payableAmount: Number(apiOrder.payable_amount || 0),
    orderBookingType:
      apiOrder.orderBookingType || apiOrder.order_booking_type || "",
  };
}

/* ================================================================
   API
================================================================ */

const orderApi = {
  async getOrderById(orderId, signal) {
    const response = await api.get(`/restaurant/orders/${orderId}`, { signal });
    return response.data?.data || null;
  },
};

/* ================================================================
   Main Component
================================================================ */

export default function OrderDetails({ onBack }) {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const handleBack =
    onBack || (() => navigate(`/restaurant/store/orders/${order.vendorId}`));

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrder() {
      setLoading(true);
      setError(null);

      try {
        const result = await orderApi.getOrderById(orderId, controller.signal);
        const transformedOrder = transformOrder(result);
        setOrder(transformedOrder);
      } catch (err) {
        console.error("ORDER DETAILS ERROR:", err);

        if (err.name !== "AbortError" && err.code !== "ERR_CANCELED") {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Couldn't load this order.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (orderId) {
      loadOrder();
    } else {
      setLoading(false);
      setError("Order ID not found.");
    }

    return () => controller.abort();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenMap = () => {
    const store = order?.store;
    const customer = order?.customer;

    if (store?.mapUrl && customer?.locationUrl) {
      const storeCoords = store.mapUrl.split("query=")[1];
      const customerCoords = customer.locationUrl.split("query=")[1];

      if (storeCoords && customerCoords) {
        const url =
          `https://www.google.com/maps/dir/?api=1` +
          `&origin=${decodeURIComponent(storeCoords)}` +
          `&destination=${decodeURIComponent(customerCoords)}`;

        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
    }

    if (store?.mapUrl) {
      window.open(store.mapUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="order-details-loading">Loading order...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-page">
        <div className="order-details-error">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
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
          {error || "Order not found."}
        </div>
      </div>
    );
  }

  const statusMeta = STATUS_META[order.status] || {
    label: order.status,
    className: "",
  };
  const isDisrupted =
    order.status === "cancelled" || order.status === "driver-rejected";
  const currentStepIndex = PROGRESS_STEPS.indexOf(order.status);
  const addonsTotal = order.items.reduce(
    (sum, item) => sum + Number(item.addonPrice || 0),
    0,
  );

  return (
    <div className="order-details-page">
      {/* ---------------- Top bar ---------------- */}

      <div className="order-details-topbar">
        <button type="button" className="btn btn-outline" onClick={handleBack}>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              d="M15 18l-6-6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Orders
        </button>

        <div className="order-details-topbar__right">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleOpenMap}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"
                strokeLinejoin="round"
              />
              <path d="M9 4v14M15 6v14" />
            </svg>
            Map
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handlePrint}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9V3h12v6" strokeLinejoin="round" />
              <rect x="4" y="9" width="16" height="8" rx="1.5" />
              <path d="M6 17v4h12v-4" strokeLinejoin="round" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* ---------------- Title + status ---------------- */}

      <div className="order-details-title">
        <h1>Order Details</h1>

        <span className={`status-pill ${statusMeta.className}`}>
          <span className="status-pill__dot" />
          {statusMeta.label.toUpperCase()}
        </span>
      </div>

      <p className="order-details-subline">
        Order #{order.orderNumber} · {order.dateDisplay}, {order.timeDisplay} ·
        Payment:{" "}
        {order.paid ? (
          <span className="badge-payment badge-payment--paid">Paid</span>
        ) : (
          <span className="badge-payment badge-payment--unpaid">Unpaid</span>
        )}
      </p>

      {/* ---------------- Blue info strip ---------------- */}

      <div className="order-info-strip">
        <div className="order-info-strip__grid">
          <div className="order-info-stat">
            <span className="order-info-stat__label">Order Number</span>
            <span className="order-info-stat__value">#{order.orderNumber}</span>
          </div>

          <div className="order-info-stat">
            <span className="order-info-stat__label">Order Date</span>
            <span className="order-info-stat__value">{order.dateDisplay}</span>
          </div>

          <div className="order-info-stat">
            <span className="order-info-stat__label">Order Time</span>
            <span className="order-info-stat__value">{order.timeDisplay}</span>
          </div>

          <div className="order-info-stat">
            <span className="order-info-stat__label">Payment Method</span>

            <span className="order-info-stat__value order-info-stat__value--inline">
              {order.paymentMethod}
              {order.paid && (
                <span className="badge-payment badge-payment--paid">Paid</span>
              )}
            </span>
          </div>

          <div className="order-info-stat">
            <span className="order-info-stat__label">Order Type</span>
            <span className="order-info-stat__value">{order.orderType}</span>
          </div>

          <div className="order-info-stat">
            <span className="order-info-stat__label">Delivery Charge</span>
            <span className="order-info-stat__value">
              {order.deliveryCharge
                ? `$ ${formatMoney(order.deliveryCharge)}`
                : "Not Applicable"}
            </span>
          </div>
        </div>

        <div className="order-info-strip__total">
          <span className="order-info-stat__label">Grand Total</span>
          <span className="order-info-strip__total-value">
            $ {formatMoney(order.grandTotal)}
          </span>
        </div>
      </div>

      {/* ---------------- Progress tracker ---------------- */}

      {isDisrupted ? (
        <div className={`status-banner status-banner--${order.status}`}>
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m9 9 6 6m0-6-6 6" strokeLinecap="round" />
          </svg>
          This order was {statusMeta.label.toLowerCase()}.
        </div>
      ) : (
        <div className="progress-tracker">
          {PROGRESS_STEPS.map((step, index) => {
            const isDone = currentStepIndex >= 0 && index < currentStepIndex;
            const isActive = index === currentStepIndex;
            const stepLabel = STATUS_META[step]?.label || step;

            return (
              <React.Fragment key={step}>
                {index > 0 && (
                  <div
                    className={`progress-tracker__line ${isDone || isActive ? "is-filled" : ""}`}
                  />
                )}

                <div className="progress-tracker__step">
                  <span
                    className={`progress-tracker__circle ${isDone ? "is-done" : ""} ${isActive ? "is-active" : ""}`}
                  >
                    <ProgressStepIcon step={step} isDone={isDone} />
                  </span>

                  <span
                    className={`progress-tracker__label ${isActive ? "is-active" : ""}`}
                  >
                    {stepLabel}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ---------------- Ordered items ---------------- */}

      <div className="section-card">
        <div className="section-card__header">
          <div className="section-card__title">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path
                d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2>Ordered Items</h2>
          </div>

          <span className="badge-soft">{order.items.length} Items</span>
        </div>

        <div className="items-table-scroll">
          <table className="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ITEM DETAILS</th>
                <th className="align-right">QTY</th>
                <th className="align-right">UNIT PRICE</th>
                <th className="align-right">ADDON PRICE</th>
                <th className="align-right">DISCOUNT</th>
                <th className="align-right">LINE TOTAL</th>
              </tr>
            </thead>

            <tbody>
              {order.items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>

                  <td>
                    <div className="item-details-cell">
                      <span className="item-details-cell__thumb">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                          </svg>
                        )}
                      </span>

                      <span>
                        <span className="item-details-cell__name">
                          <VegIcon type={item.itemType} />
                          {item.name}
                        </span>

                        {item.description && (
                          <span className="item-details-cell__desc">
                            {item.description}
                          </span>
                        )}

                        {item.addons_detail?.length > 0 && (
                          <span className="item-addons">
                            <span className="item-sub-text">
                              Add-ons:&nbsp;
                            </span>

                            {item.addons_detail.map((addon) => (
                              <span className="chip chip-addon" key={addon.id}>
                                {addon.name}

                                {Number(addon.price || 0) > 0 && (
                                  <span className="addon-price">
                                    +${Number(addon.price).toFixed(2)}
                                  </span>
                                )}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="align-right mono-value">{item.qty}</td>
                  <td className="align-right mono-value">
                    $ {formatMoney(item.unitPrice)}
                  </td>
                  <td className="align-right mono-value">
                    <MoneyOrDash value={item.addonPrice} />
                  </td>
                  <td className="align-right mono-value">
                    <MoneyOrDash value={item.discount} />
                  </td>
                  <td className="align-right mono-value line-total">
                    $ {formatMoney(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---------------- Pricing breakdown ---------------- */}

        <div className="pricing-breakdown">
          <div className="pricing-row">
            <span>Items Subtotal</span>
            <span className="mono-value">$ {formatMoney(order.subtotal)}</span>
          </div>

          {addonsTotal > 0 && (
            <div className="pricing-row">
              <span>Add-ons Total</span>
              <span className="mono-value pricing-row__addon">
                + $ {formatMoney(addonsTotal)}
              </span>
            </div>
          )}

          {order.couponDiscount > 0 && (
            <div className="pricing-row">
              <span>Coupon Discount</span>
              <span className="mono-value">
                - $ {formatMoney(order.couponDiscount)}
              </span>
            </div>
          )}

          <div className="pricing-row">
            <span>
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 8h8M8 12h8M8 16h4" strokeLinecap="round" />
              </svg>
              {order.taxLabel}
            </span>
            <span className="mono-value pricing-row__tax">
              + $ {formatMoney(order.taxAmount)}
            </span>
          </div>

          <div className="pricing-row">
            <span>Order Type</span>
            <span>{order.orderType}</span>
          </div>

          <div className="pricing-row">
            <span>
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="6" cy="17" r="2" />
                <circle cx="16" cy="17" r="2" />
                <path d="M6 17V8h6l4 5h2v4" strokeLinejoin="round" />
              </svg>
              Delivery Charge
            </span>
            <span className="mono-value">
              {order.deliveryCharge
                ? `$ ${formatMoney(order.deliveryCharge)}`
                : "Not Applicable"}
            </span>
          </div>

          <div className="pricing-row pricing-row--total">
            <span>Grand Total</span>
            <span className="mono-value">
              $ {formatMoney(order.grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ---------------- Store / Customer / Delivery man ---------------- */}

      <div className="info-card-grid">
        <InfoCard
          icon={
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M2 9h20l-2-5H4l-2 5Z"
                strokeLinejoin="round"
              />
            </svg>
          }
          title="Store Information"
        >
          <PartyCard
            person={order.store}
            extraLine={order.store?.prepTimeDisplay}
          >
            {order.store?.mapUrl && (
              <a
                className="link-btn"
                href={order.store.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                View on Map
              </a>
            )}
          </PartyCard>
        </InfoCard>

        <InfoCard
          icon={
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="8" r="4" />
              <path
                d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"
                strokeLinecap="round"
              />
            </svg>
          }
          title="Customer Information"
        >
          <PartyCard person={order.customer}>
            {order.customer?.locationUrl && (
              <a
                className="link-btn"
                href={order.customer.locationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                Customer Location
              </a>
            )}
          </PartyCard>
        </InfoCard>

        <InfoCard
          icon={
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="6" cy="17" r="2" />
              <circle cx="16" cy="17" r="2" />
              <path d="M6 17V8h6l4 5h2v4" strokeLinejoin="round" />
            </svg>
          }
          title="Delivery Man"
        >
          {order.deliveryMan ? (
            <PartyCard person={order.deliveryMan} />
          ) : (
            <div className="empty-state">
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="6" cy="17" r="2" />
                <circle cx="16" cy="17" r="2" />
                <path d="M6 17V8h6l4 5h2v4" strokeLinejoin="round" />
              </svg>
              No delivery man assigned yet.
            </div>
          )}
        </InfoCard>
      </div>

      {/* ---------------- Timeline + nearest restaurant ---------------- */}

      <div className="info-card-grid info-card-grid--2">
        <InfoCard
          icon={
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                d="M12 7v5l3 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          title="Order Timeline"
        >
          <ul className="timeline-list">
            {order.timeline.map((event) => (
              <li key={event.id}>
                <span className="timeline-list__dot" />
                <span className="timeline-list__label">{event.label}</span>
                <span className="timeline-list__time">{event.timestamp}</span>
              </li>
            ))}
          </ul>
        </InfoCard>

        {order.nearestRestaurant && (
          <InfoCard title="Nearest Restaurant to Customer">
            <span className="distance-pill">
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path
                  d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {order.nearestRestaurant.distanceKm} km away
            </span>

            <PartyCard person={order.nearestRestaurant}>
              {order.nearestRestaurant.locationUrl && (
                <a
                  className="link-btn"
                  href={order.nearestRestaurant.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path
                      d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  View on Map
                </a>
              )}
            </PartyCard>
          </InfoCard>
        )}
      </div>

      {/* ---------------- Order Note ---------------- */}

      {order.orderNote && (
        <div className="section-card">
          <div className="section-card__header">
            <div className="section-card__title">
              <h2>Order Note</h2>
            </div>
          </div>

          <div className="info-card__body">{order.orderNote}</div>
        </div>
      )}
    </div>
  );
}

/* ===================================================================
   Reusable components
=================================================================== */

function InfoCard({ icon, title, children }) {
  return (
    <div className="info-card">
      <div className="info-card__header">
        {icon}
        <h3>{title}</h3>
      </div>

      <div className="info-card__body">{children}</div>
    </div>
  );
}

function PartyCard({ person, extraLine, children }) {
  if (!person) return null;

  return (
    <div className="party-card">
      <span className="party-card__avatar">
        {person.image ? (
          <img src={person.image} alt={person.name} />
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" strokeLinecap="round" />
          </svg>
        )}
      </span>

      <div className="party-card__body">
        <span className="party-card__name">{person.name}</span>

        {person.role && <span className="party-card__line">{person.role}</span>}

        {person.phone && (
          <span className="party-card__line">
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
            {person.phone}
          </span>
        )}

        {person.email && (
          <span className="party-card__line">
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path
                d="m3 7 9 6 9-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {person.email}
          </span>
        )}

        {extraLine && (
          <span className="party-card__line">
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                d="M12 7v5l3 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {extraLine}
          </span>
        )}

        {children}
      </div>
    </div>
  );
}

function MoneyOrDash({ value }) {
  if (value === null || value === undefined || Number(value) === 0) {
    return <span className="cell-dash">—</span>;
  }

  return <span>$ {formatMoney(value)}</span>;
}

function VegIcon({ type }) {
  const value = String(type || "")
    .toLowerCase()
    .replace(/[_\s]/g, "-");
  if (value === "veg") return <span className="veg-icon" title="Veg" />;
  if (value === "non-veg" || value === "nonveg")
    return <span className="nveg-icon" title="Non-Veg" />;
  return null;
}

function ProgressStepIcon({ step, isDone }) {
  if (isDone) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path
          d="M20 6 9 17l-5-5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  switch (step) {
    case "pending":
      return (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "accepted":
      return (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
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
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" strokeLinecap="round" />
          <path d="M8 14V9a4 4 0 1 1 8 0v5" strokeLinecap="round" />
        </svg>
      );

    case "on-the-way":
      return (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="7.5" cy="17.5" r="2.2" />
          <circle cx="17.5" cy="17.5" r="2.2" />
          <path
            d="M3 17V9a1 1 0 0 1 1-1h6v9M10 12h5l4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "delivered":
      return (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
        </svg>
      );

    default:
      return null;
  }
}
