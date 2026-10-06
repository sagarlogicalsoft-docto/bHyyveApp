const pool = require("../config/db");

const RestaurantModel = {
  // Vendor exist karta hai ya nahi (socket connect ke time validate karne ke liye)
  async vendorExists(vendorId) {
    const [rows] = await pool.query("SELECT id FROM vendor WHERE id = ? LIMIT 1", [vendorId]);
    return rows.length > 0;
  },

  // Halka query sirf change-detect karne ke liye (PHP wale fingerprint jaisa)
  async getOrdersFingerprint(vendorId) {
    const [rows] = await pool.query(
      `SELECT id, order_status, updated_at FROM retsaurant_orders WHERE vendor_id = ? ORDER BY id DESC`,
      [vendorId],
    );
    return JSON.stringify(rows);
  },

  // Vendor home screen ke liye pura order list (totals ke sath) - same calc jo PHP me tha
  async getVendorOrdersHome(vendorId) {
    const [orders] = await pool.query(
      `SELECT
         ro.id, ro.order_number, ro.order_status, ro.order_date, ro.order_time,
         ro.order_items, ro.total_amount, ro.coupon_id, ro.coupon_applied,
         ro.orderBookingType, ro.created_at, u.fname, u.lname
       FROM retsaurant_orders ro
       LEFT JOIN users u ON u.id = ro.user_id
       WHERE ro.vendor_id = ?
       ORDER BY ro.id DESC`,
      [vendorId],
    );

    const finalOrders = [];

    for (const order of orders) {
      let itemCount = 0;
      let subtotal = 0;

      if (order.order_items) {
        try {
          const items = JSON.parse(order.order_items);
          if (Array.isArray(items)) {
            itemCount = items.length;
            for (const item of items) {
              const line =
                item.line_total !== undefined
                  ? Number(item.line_total)
                  : Number(item.price || 0) * Number(item.quantity || 1);
              subtotal += line;
            }
          }
        } catch (_) {
          // invalid JSON, skip
        }
      }

      let discount = 0;

      if (order.coupon_id && Number(order.coupon_applied) === 1) {
        const [couponRows] = await pool.query(
          `SELECT title, discount_type, cupon_price FROM restaurant_coupon WHERE id = ? LIMIT 1`,
          [order.coupon_id],
        );
        const coupon = couponRows[0];

        if (coupon) {
          discount =
            coupon.discount_type === "percentage" || coupon.discount_type === "percent"
              ? (subtotal * Number(coupon.cupon_price)) / 100
              : Number(coupon.cupon_price);

          if (discount > subtotal) discount = subtotal;
        }
      }

      const afterDiscount = subtotal - discount;
      const hst = (afterDiscount * 13) / 100;
      const deliveryCharge = order.orderBookingType === "Delivery" ? 5 : 0;
      const finalTotal = afterDiscount + hst + deliveryCharge;

      finalOrders.push({
        order_id: String(order.id),
        order_number: order.order_number || "",
        fname: order.fname || "",
        lname: order.lname || "",
        order_status: order.order_status || "",
        order_date: order.order_date || "",
        order_time: order.order_time || "",
        created_at: order.created_at || "",
        item_count: itemCount,
        total_amount: finalTotal.toFixed(2),
      });
    }

    return finalOrders;
  },
};

module.exports = RestaurantModel;