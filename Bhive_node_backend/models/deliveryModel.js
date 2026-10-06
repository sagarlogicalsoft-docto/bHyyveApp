const pool = require("../config/db");

const DeliveryModel = {
  async checkDriver(phone, email) {
    const [rows] = await pool.query(
      "SELECT * FROM drivers WHERE phone=? OR email=?",
      [phone, email],
    );
    return rows;
  },

  async insertDriver(data) {
    const [result] = await pool.query(
      `INSERT INTO drivers
      (
      first_name,
      last_name,
      email,
      phone,
      country_code,
      profile_image,
      identity_type,
      identity_number,
      identity_image,
      cv_uploads,
      lat,
      \`long\`,
      address,
      status,
      total_trip,
      complete_trip,
      cancel_trip,
      otp,
      is_verified,
      created_at,
      updated_at
      )
      VALUES
      (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.first_name,
        data.last_name,
        data.email,
        data.phone,
        data.country_code,
        data.profile_image,
        data.identity_type,
        data.identity_number,
        data.identity_image,
        data.cv_uploads,
        data.lat,
        data.long,
        data.address,
        data.status,
        data.total_trip,
        data.complete_trip,
        data.cancel_trip,
        data.otp,
        data.is_verified,
        data.created_at,
        data.updated_at,
      ],
    );

    return result;
  },

  async getDriver(phone, country_code) {
    const [rows] = await pool.query(
      "SELECT * FROM drivers WHERE phone=? AND country_code=?",
      [phone, country_code],
    );
    return rows;
  },

  async updateLogin(phone, country_code, fcm_id, otp) {
    const [result] = await pool.query(
      `UPDATE drivers
       SET country_code=?,
           fcm_id=?,
           otp=?,
           is_verified=?,
           updated_at=NOW()
       WHERE phone=?`,
      [country_code, fcm_id, otp, 0, phone],
    );

    return result;
  },

  async verifyOtp(phone, otp) {
    const [rows] = await pool.query(
      "SELECT * FROM drivers WHERE phone = ? AND otp = ?",
      [phone, otp],
    );
    return rows;
  },

  async updateOtpVerified(id) {
    const [result] = await pool.query(
      `UPDATE drivers
       SET is_verified = ?,
           otp = NULL,
           updated_at = NOW()
       WHERE id = ?`,
      [1, id],
    );

    return result;
  },

  async getDriverById(driver_id) {
    const [rows] = await pool.query("SELECT * FROM drivers WHERE id=?", [
      driver_id,
    ]);
    return rows;
  },

  async checkEmail(email, driver_id) {
    const [rows] = await pool.query(
      "SELECT * FROM drivers WHERE email=? AND id!=?",
      [email, driver_id],
    );
    return rows;
  },

  async checkPhone(phone, driver_id) {
    const [rows] = await pool.query(
      "SELECT * FROM drivers WHERE phone=? AND id!=?",
      [phone, driver_id],
    );
    return rows;
  },

  async updateDriver(driver_id, updateData) {
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);

    if (keys.length === 0) {
      return null;
    }

    const setQuery = keys.map((key) => `\`${key}\` = ?`).join(", ");

    const sql = `UPDATE drivers SET ${setQuery} WHERE id = ?`;

    values.push(driver_id);

    console.log("FINAL SQL:", sql);
    console.log("FINAL VALUES:", values);

    const [result] = await pool.query(sql, values);

    return result;
  },

  async updateAvailability(driver_id, status) {
    const [result] = await pool.query(
      `UPDATE drivers
       SET is_available=?,
           updated_at=NOW()
       WHERE id=?`,
      [status, driver_id],
    );

    return result;
  },

  async getActiveDriver(driver_id) {
    const [rows] = await pool.query(
      `SELECT * FROM drivers
       WHERE id = ?
       AND status = 1
       AND is_available = 1`,
      [driver_id],
    );

    return rows;
  },

  async updateDriverLocation(driver_id, lat, long) {
    const [result] = await pool.query(
      `UPDATE drivers
       SET lat = ?,
           \`long\` = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [lat, long, driver_id],
    );

    return result;
  },
	async getRestaurantOrder(order_id) {
		const [rows] = await pool.query(
			`SELECT *
			 FROM retsaurant_orders
			 WHERE id = ?
			 LIMIT 1`,
			[order_id]
		);

		return rows[0] || null;
	},

  async getUser(user_id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id=?", [
      user_id,
    ]);

    return rows;
  },

  async getVendor(vendor_id) {
    const [rows] = await pool.query("SELECT * FROM vendor WHERE id=?", [
      vendor_id,
    ]);

    return rows;
  },

  async acceptOrder(order_id, driver_id, otp) {
    const [result] = await pool.query(
      `UPDATE retsaurant_orders
       SET
       order_status=?,
       delivery_boy_id=?,
       delivery_accepted_at=NOW(),
       preparing_at=NOW(),
       delivery_otp=?
       WHERE id=?`,

      ["Preparing", driver_id, otp, order_id],
    );

    return result;
  },

  async updateDriverAccept(driver_id, order_id, total_trip) {
    const [result] = await pool.query(
      `UPDATE drivers
       SET
       current_order_id=?,
       free_driver_not_free_driver=?,
       total_trip=?
       WHERE id=?`,

      [order_id, 0, total_trip, driver_id],
    );

    return result;
  },

  async updateDriverReject(driver_id, cancel_trip) {
    const [result] = await pool.query(
      `UPDATE drivers
       SET
       cancel_trip=?,
       current_order_id=NULL,
       free_driver_not_free_driver=1
       WHERE id=?`,

      [cancel_trip, driver_id],
    );

    return result;
  },

  async getOtherDrivers(driver_id) {
    const [rows] = await pool.query(
      `SELECT *
       FROM drivers
       WHERE status=1
       AND id!=?`,

      [driver_id],
    );

    return rows;
  },

  async rejectOrder(order_id) {
    const [result] = await pool.query(
      `UPDATE retsaurant_orders
       SET
       order_status='Rejected',
       delivery_rejected_at=NOW()
       WHERE id=?`,

      [order_id],
    );

    return result;
  },

  async checkDriverStatus(driver_id) {
    const [rows] = await pool.query(
      `SELECT * FROM drivers WHERE id = ? AND status = 1`,
      [driver_id],
    );
    return rows;
  },

  async getPreparingOrders(driver_id) {
    const [rows] = await pool.query(
      `SELECT
        retsaurant_orders.*,

        users.fname,
        users.lname,
        users.mobile,
        users.email,

        vendor.name as vendor_name,
        vendor.email_id as vendor_email,
        vendor.mobile as vendor_mobile,
        vendor.business_name as vendor_business_name,
        vendor.lat as vendor_latitude,
        vendor.long as vendor_longitude

      FROM retsaurant_orders
      LEFT JOIN users ON users.id = retsaurant_orders.user_id
      LEFT JOIN vendor ON vendor.id = retsaurant_orders.vendor_id
      WHERE retsaurant_orders.delivery_boy_id = ?
      AND retsaurant_orders.order_status = 'Preparing'
      ORDER BY retsaurant_orders.id DESC`,
      [driver_id],
    );
    return rows;
  },

	async getVendorAddress(vendor_id) {
		const [rows] = await pool.query(
			`SELECT *
			 FROM vendor_address
			 WHERE vendor_id = ?
			 ORDER BY id DESC
			 LIMIT 1`,
			[vendor_id]
		);

		return rows[0] || null;
	},

  async getCoupon(coupon_id) {
    const [rows] = await pool.query(
      `SELECT * FROM restaurant_coupon WHERE id = ?`,
      [coupon_id],
    );
    return rows;
  },

 	async getAddonsByIds(addon_ids) {

		if (!addon_ids || addon_ids.length === 0) {
			return [];
		}

		const placeholders = addon_ids
			.map(() => "?")
			.join(",");

		const [rows] = await pool.query(
			`SELECT id, name, price
			 FROM vendor_addons
			 WHERE id IN (${placeholders})`,
			addon_ids
		);

		return rows;
	},

  async getRestaurantItem(item_id) {
    const [rows] = await pool.query(
      `SELECT unit_price, discount_price FROM restaurant_items WHERE id = ?`,
      [item_id],
    );
    return rows;
  },

  async getPreparingOrder(order_id, driver_id) {
    const [rows] = await pool.query(
      `SELECT *
       FROM retsaurant_orders
       WHERE id=?
       AND delivery_boy_id=?
       AND order_status='Preparing'`,
      [order_id, driver_id],
    );

    return rows;
  },

  async readyForPickup(order_id) {
    const [result] = await pool.query(
      `UPDATE retsaurant_orders
       SET
       order_status='Ready_for_pickup',
       ready_for_pickup_at=NOW()
       WHERE id=?`,
      [order_id],
    );

    return result;
  },

  async getOrderById(order_id) {
    const [rows] = await pool.query(
      "SELECT * FROM retsaurant_orders WHERE id=?",
      [order_id],
    );

    return rows;
  },

  async getReadyForPickupOrders(driver_id) {
    const [rows] = await pool.query(
      `SELECT
        retsaurant_orders.id,
        retsaurant_orders.vendor_id,
        retsaurant_orders.user_id,
        retsaurant_orders.order_number,
        retsaurant_orders.order_status,
        retsaurant_orders.payment_status,
        retsaurant_orders.subtotal,
        retsaurant_orders.delivery_charge,
        retsaurant_orders.total_amount,
        retsaurant_orders.drop_address,
        retsaurant_orders.user_latitude,
        retsaurant_orders.user_longitude,
        retsaurant_orders.delivery_otp,
        retsaurant_orders.delivery_time,
        retsaurant_orders.created_at,
        retsaurant_orders.order_items,
        retsaurant_orders.coupon_id,
        retsaurant_orders.coupon_applied,
        retsaurant_orders.wallet_used,
        retsaurant_orders.address_id,

        users.fname          AS user_fname,
        users.lname          AS user_lname,
        users.mobile         AS user_mobile,
        users.email          AS user_email,

        address.address      AS user_address,
        address.lat          AS user_address_lat,
        address.lang         AS user_address_long,

        vendor.name          AS restaurant_name,
        vendor.email_id      AS restaurant_email,
        vendor.mobile        AS restaurant_mobile,
        vendor.business_name AS restaurant_business_name,
        vendor.lat           AS vendor_lat,
        vendor.long          AS vendor_long

      FROM retsaurant_orders
      LEFT JOIN users ON users.id = retsaurant_orders.user_id
      LEFT JOIN address ON address.id = retsaurant_orders.address_id
      LEFT JOIN vendor ON vendor.id = retsaurant_orders.vendor_id
      WHERE retsaurant_orders.delivery_boy_id = ?
      AND retsaurant_orders.order_status IN ('Ready_for_pickup', 'On_the_way', 'Picked_up')
      ORDER BY retsaurant_orders.id DESC`,
      [driver_id],
    );
    return rows;
  },

  async getPickedUpOrder(order_id, driver_id) {
    const [rows] = await pool.query(
      `SELECT *
       FROM retsaurant_orders
       WHERE id=?
       AND delivery_boy_id=?
       AND order_status='Picked_up'`,
      [order_id, driver_id],
    );
    return rows;
  },

  async updateOnTheWay(order_id, confirm_status) {
    const [result] = await pool.query(
      `UPDATE retsaurant_orders
       SET
       order_status='On_the_way',
       confirm_status=?,
       on_the_way_at=NOW()
       WHERE id=?`,
      [confirm_status, order_id],
    );

    return result;
  },

  async updateDriverCurrentOrder(driver_id, order_id) {
    const [result] = await pool.query(
      `UPDATE drivers
       SET
       current_order_id=?,
       free_driver_not_free_driver=0
       WHERE id=?`,
      [order_id, driver_id],
    );

    return result;
  },

  async getDriverHomeData(driver_id) {
    // Get driver
    const [drivers] = await pool.query(
      `SELECT
      id,
      first_name,
      last_name,
      phone,
      email,
      profile_image,
      is_available
     FROM drivers
     WHERE id = ?
       AND status = 1
     LIMIT 1`,
      [driver_id],
    );

    if (drivers.length === 0) {
      return null;
    }

    const driver = drivers[0];

    // Today date
    const [todayResult] = await pool.query(`SELECT CURDATE() AS today`);

    const today = todayResult[0].today;

    // Today's order counts
    const [counts] = await pool.query(
      `SELECT
      COUNT(*) AS today_total,

      SUM(
        CASE
          WHEN order_status = 'Preparing'
          THEN 1 ELSE 0
        END
      ) AS today_preparing,

      SUM(
        CASE
          WHEN order_status = 'On_the_way'
          THEN 1 ELSE 0
        END
      ) AS today_on_the_way,

      SUM(
        CASE
          WHEN order_status = 'Delivered'
          THEN 1 ELSE 0
        END
      ) AS today_delivered,

      SUM(
        CASE
          WHEN order_status = 'Cancelled'
          THEN 1 ELSE 0
        END
      ) AS today_cancelled

     FROM retsaurant_orders
     WHERE delivery_boy_id = ?
       AND DATE(created_at) = CURDATE()`,
      [driver_id],
    );

    // Total delivered orders
    const [deliveredResult] = await pool.query(
      `SELECT COUNT(*) AS total_delivered_orders
     FROM retsaurant_orders
     WHERE delivery_boy_id = ?
       AND order_status = 'Delivered'`,
      [driver_id],
    );

    const todayData = counts[0] || {};

    const today_total = Number(todayData.today_total || 0);
    const today_preparing = Number(todayData.today_preparing || 0);
    const today_on_the_way = Number(todayData.today_on_the_way || 0);
    const today_delivered = Number(todayData.today_delivered || 0);
    const today_cancelled = Number(todayData.today_cancelled || 0);

    const total_delivered_orders = Number(
      deliveredResult[0]?.total_delivered_orders || 0,
    );

    // Earning per order
    const per_order_earning = 5;

    const final_total = total_delivered_orders * per_order_earning;

    const today_earning = today_delivered * per_order_earning;

    return {
      driver,
      today,
      today_total,
      today_preparing,
      today_on_the_way,
      today_delivered,
      today_cancelled,
      total_delivered_orders,
      final_total,
      today_earning,
    };
  },

  async getDriverEarningsDashboard(driver_id, filter) {
    const [drivers] = await pool.query(
      `SELECT
      id,
      first_name,
      last_name,
      phone,
      email,
      profile_image
     FROM drivers
     WHERE id = ?
     LIMIT 1`,
      [driver_id],
    );

    if (drivers.length === 0) {
      return null;
    }

    const now = new Date();

    const istDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    const [year, month, day] = istDate.split("-").map(Number);

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");

      return `${y}-${m}-${d}`;
    };

    let dateCondition = "";
    let dateParams = [];
    let filterLabel = "All Time";

    if (filter === "daily") {
      const today = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      dateCondition = `
      AND DATE(ro.order_date) = ?
    `;

      dateParams = [today];

      const formattedToday = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(now);

      filterLabel = `Today - ${formattedToday}`;
    } else if (filter === "weekly") {
      const currentDate = new Date(year, month - 1, day);

      const dayOfWeek = currentDate.getDay();

      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

      const weekStart = new Date(currentDate);

      weekStart.setDate(currentDate.getDate() + diffToMonday);

      const weekEnd = new Date(weekStart);

      weekEnd.setDate(weekStart.getDate() + 6);

      const weekStartString = formatDate(weekStart);
      const weekEndString = formatDate(weekEnd);

      dateCondition = `
      AND DATE(ro.order_date) BETWEEN ? AND ?
    `;

      dateParams = [weekStartString, weekEndString];

      filterLabel = `${weekStartString} to ${weekEndString}`;
    } else if (filter === "monthly") {
      const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;

      const lastDay = new Date(year, month, 0).getDate();

      const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      dateCondition = `
      AND DATE(ro.order_date) BETWEEN ? AND ?
    `;

      dateParams = [monthStart, monthEnd];

      const monthName = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        month: "long",
        year: "numeric",
      }).format(now);

      filterLabel = monthName;
    }

    const [allTimeResult] = await pool.query(
      `SELECT COUNT(*) AS total_orders_alltime
     FROM retsaurant_orders
     WHERE delivery_boy_id = ?
       AND order_status = 'Delivered'`,
      [driver_id],
    );

    const totalOrdersAllTime = Number(
      allTimeResult[0]?.total_orders_alltime || 0,
    );

    const perOrderEarning = 5;

    const totalEarningAllTime = totalOrdersAllTime * perOrderEarning;

    const [orders] = await pool.query(
      `SELECT
      ro.id,
      ro.order_number,
      ro.order_date,
      ro.order_time,
      ro.order_items,
      ro.total_amount,
      ro.coupon_id,
      ro.coupon_applied,
      ro.delivery_charge,

      v.name AS restaurant_name,
      v.business_name AS business_name

     FROM retsaurant_orders ro

     LEFT JOIN vendor v
       ON v.id = ro.vendor_id

     WHERE ro.delivery_boy_id = ?
       AND ro.order_status = 'Delivered'

       ${dateCondition}

     ORDER BY ro.id DESC`,
      [driver_id, ...dateParams],
    );

    const filterTotalOrders = orders.length;

    const filterTotalEarning = filterTotalOrders * perOrderEarning;

    const orderList = [];

    for (const order of orders) {
      let itemCount = 0;
      let subtotal = 0;

      if (order.order_items) {
        try {
          const decoded =
            typeof order.order_items === "string"
              ? JSON.parse(order.order_items)
              : order.order_items;

          if (Array.isArray(decoded)) {
            itemCount = decoded.length;

            for (const item of decoded) {
              let lineTotal = 0;

              if (item.line_total !== undefined && item.line_total !== null) {
                lineTotal = Number(item.line_total);
              } else {
                lineTotal =
                  Number(item.price || 0) * Number(item.quantity || 1);
              }

              subtotal += lineTotal;
            }
          }
        } catch (error) {
          console.log("Order items JSON error:", error.message);
        }
      }

      let discount = 0;
      let discountPercent = 0;
      let couponName = "";

      if (order.coupon_id && Number(order.coupon_applied) === 1) {
        const [coupons] = await pool.query(
          `SELECT
          id,
          title,
          discount_type,
          cupon_price
         FROM restaurant_coupon
         WHERE id = ?
         LIMIT 1`,
          [order.coupon_id],
        );

        if (coupons.length > 0) {
          const coupon = coupons[0];

          couponName = coupon.title || "";

          const discountType = String(coupon.discount_type || "").toLowerCase();

          const couponPrice = Number(coupon.cupon_price || 0);

          // Percentage
          if (discountType === "percentage" || discountType === "percent") {
            discountPercent = couponPrice;

            discount = (subtotal * discountPercent) / 100;
          }

          // Fixed amount
          else {
            discount = couponPrice;

            if (subtotal > 0) {
              discountPercent = (discount / subtotal) * 100;
            }
          }

          if (discount > subtotal) {
            discount = subtotal;
          }
        }
      }

      const amountAfterDiscount = subtotal - discount;

      const hstPercent = 13;

      const hstAmount = (amountAfterDiscount * hstPercent) / 100;

      const deliveryCharge = 5;

      const grandTotal = amountAfterDiscount + hstAmount + deliveryCharge;

      orderList.push({
        order_id: String(order.id),

        order_number: String(order.order_number || ""),

        restaurant_name: String(order.restaurant_name || ""),

        business_name: String(order.business_name || ""),

        order_date: String(order.order_date || ""),

        order_time: String(order.order_time || ""),

        item_count: Number(itemCount),

        subtotal: Number(subtotal).toFixed(2),

        coupon_name: String(couponName),

        discount_percent: Number(discountPercent).toFixed(2),

        discount_amount: Number(discount).toFixed(2),

        amount_after_discount: Number(amountAfterDiscount).toFixed(2),

        hst_percent: "13%",

        hst_amount: Number(hstAmount).toFixed(2),

        delivery_charge: Number(deliveryCharge).toFixed(2),

        grand_total: Number(grandTotal).toFixed(2),

        driver_earning: Number(perOrderEarning).toFixed(2),
      });
    }

    return {
      totalOrdersAllTime,
      totalEarningAllTime,

      filter: filter && filter !== "" ? filter : "all",

      filterLabel,

      filterTotalOrders,

      filterTotalEarning,

      perOrderEarning,

      orderList,
    };
  },

  async getDriverAllOrdersList(driver_id, order_status) {
    const [drivers] = await pool.query(
      `SELECT id
     FROM drivers
     WHERE id = ?
     LIMIT 1`,
      [driver_id],
    );

    if (drivers.length === 0) {
      return null;
    }

    const allStatuses = [
      "Pending",
      "Accepted",
      "Cancelled",
      "Preparing",
      "Ready_for_pickup",
      "Picked_up",
      "On_the_way",
      "Delivered",
      "Rejected",
      "Missed",
    ];

    let query = `
    SELECT
      ro.id,
      ro.order_number,
      ro.order_date,
      ro.order_time,
      ro.order_status,
      ro.total_amount,
      ro.delivery_charge,
      ro.order_items,
      ro.coupon_id,
      ro.coupon_applied,

      v.name AS restaurant_name,
      v.business_name AS business_name

    FROM retsaurant_orders ro

    LEFT JOIN vendor v
      ON v.id = ro.vendor_id

    WHERE ro.delivery_boy_id = ?
  `;

    const params = [driver_id];

    if (order_status === "All") {
      const placeholders = allStatuses.map(() => "?").join(",");

      query += `
      AND ro.order_status IN (${placeholders})
    `;

      params.push(...allStatuses);
    } else {
      query += `
      AND ro.order_status = ?
    `;

      params.push(order_status);
    }

    query += `
    ORDER BY ro.id DESC
  `;

    const [orders] = await pool.query(query, params);

    if (orders.length === 0) {
      return {
        orders: [],
      };
    }

    const orderList = [];

    // Status counts
    let countPending = 0;
    let countAccepted = 0;
    let countCancelled = 0;
    let countPreparing = 0;
    let countReadyPickup = 0;
    let countPickedUp = 0;
    let countOnTheWay = 0;
    let countDelivered = 0;
    let countRejected = 0;
    let countMissed = 0;

    for (const order of orders) {
      let itemCount = 0;
      let subtotal = 0;

      if (order.order_items) {
        try {
          const decoded =
            typeof order.order_items === "string"
              ? JSON.parse(order.order_items)
              : order.order_items;

          if (Array.isArray(decoded)) {
            itemCount = decoded.length;

            for (const item of decoded) {
              const line =
                item.line_total !== undefined && item.line_total !== null
                  ? Number(item.line_total)
                  : Number(item.price || 0) * Number(item.quantity || 1);

              subtotal += line;
            }
          }
        } catch (error) {
          console.log("Order items JSON error:", error.message);
        }
      }

      let discount = 0;
      let discountPercent = 0;
      let couponName = "";

      if (order.coupon_id && Number(order.coupon_applied) === 1) {
        const [coupons] = await pool.query(
          `SELECT
          id,
          title,
          discount_type,
          cupon_price
         FROM restaurant_coupon
         WHERE id = ?
         LIMIT 1`,
          [order.coupon_id],
        );

        if (coupons.length > 0) {
          const coupon = coupons[0];

          couponName = coupon.title || "";

          const discountType = String(coupon.discount_type || "").toLowerCase();

          const couponPrice = Number(coupon.cupon_price || 0);

          // Percentage
          if (discountType === "percentage" || discountType === "percent") {
            discountPercent = couponPrice;

            discount = (subtotal * discountPercent) / 100;
          }

          // Fixed amount
          else {
            discount = couponPrice;

            if (subtotal > 0) {
              discountPercent = (discount / subtotal) * 100;
            }
          }

          if (discount > subtotal) {
            discount = subtotal;
          }
        }
      }

      const amountAfterDiscount = subtotal - discount;

      const hstAmount = (amountAfterDiscount * 13) / 100;

      const originalDeliveryCharge = Number(order.delivery_charge || 0);

      const finalTotal =
        amountAfterDiscount + hstAmount + originalDeliveryCharge;

      const deliveryCharge = 5;

      const finalChange = finalTotal + deliveryCharge;

      switch (order.order_status) {
        case "Pending":
          countPending++;
          break;

        case "Accepted":
          countAccepted++;
          break;

        case "Cancelled":
          countCancelled++;
          break;

        case "Preparing":
          countPreparing++;
          break;

        case "Ready_for_pickup":
          countReadyPickup++;
          break;

        case "Picked_up":
          countPickedUp++;
          break;

        case "On_the_way":
          countOnTheWay++;
          break;

        case "Delivered":
          countDelivered++;
          break;

        case "Rejected":
          countRejected++;
          break;

        case "Missed":
          countMissed++;
          break;
      }

      orderList.push({
        order_id: String(order.id),

        order_number: String(order.order_number || ""),

        restaurant_name: String(order.restaurant_name || ""),

        business_name: String(order.business_name || ""),

        order_date: String(order.order_date || ""),

        order_time: String(order.order_time || ""),

        order_status: String(order.order_status || ""),

        item_count: Number(itemCount),

        subtotal: Number(subtotal).toFixed(2),

        coupon_name: couponName,

        discount_percent: Number(discountPercent).toFixed(2),

        discount_amount: Number(discount).toFixed(2),

        hst_percent: "13%",

        hst_amount: Number(hstAmount).toFixed(2),

        delivery_charge: deliveryCharge,

        total_amount: Number(finalChange).toFixed(2),
      });
    }

    return {
      orders: orderList,

      countPending,
      countAccepted,
      countCancelled,
      countPreparing,
      countReadyPickup,
      countPickedUp,
      countOnTheWay,
      countDelivered,
      countRejected,
      countMissed,
    };
  },

  async updateDriverBankDetails(driver_id, bankData) {
    const {
      acc_holder_name,
      account_number,
      branch_name,
      institution_number,
      tansit_number,
      branch_address,
    } = bankData;

    const [result] = await pool.query(
      `UPDATE drivers
     SET
       acc_holder_name = ?,
       account_number = ?,
       branch_name = ?,
       institution_number = ?,
       tansit_number = ?,
       branch_address = ?
     WHERE id = ?`,
      [
        acc_holder_name,
        account_number,
        branch_name,
        institution_number,
        tansit_number,
        branch_address,
        driver_id,
      ],
    );

    return result;
  },

  async logoutDriver(driver_id) {
    const [result] = await pool.query(
      `UPDATE drivers
     SET
       fcm_id = NULL,
       updated_at = NOW()
     WHERE id = ?`,
      [driver_id],
    );

    return result;
  },

  async getUserById(userId) {
    const [rows] = await pool.query(
      `SELECT id, fname, lname, mobile, email, image
             FROM users
             WHERE id = ?
             LIMIT 1`,
      [userId],
    );

    return rows[0] || null;
  },

  async getAddressById(addressId) {
    const [rows] = await pool.query(
      `SELECT *
             FROM address
             WHERE id = ?
             LIMIT 1`,
      [addressId],
    );

    return rows[0] || null;
  },

  async getRestaurantById(vendorId) {
    const [rows] = await pool.query(
      `SELECT *
             FROM vendor
             WHERE id = ?
             AND vendor_type = 'restaurant'
             LIMIT 1`,
      [vendorId],
    );

    return rows[0] || null;
  },

  async getCouponById(couponId) {
    const [rows] = await pool.query(
      `SELECT code, cupon_price, discount_type
             FROM restaurant_coupon
             WHERE id = ?
             LIMIT 1`,
      [couponId],
    );

    return rows[0] || null;
  },
};

module.exports = DeliveryModel;