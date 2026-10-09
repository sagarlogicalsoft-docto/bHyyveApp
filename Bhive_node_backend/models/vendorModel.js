const pool = require("../config/db");

const VendorModel = {
  async findByEmailOrMobile(email, mobile) {
    const [rows] = await pool.query(
      `SELECT * 
			 FROM vendor 
			 WHERE email_id = ? OR mobile = ?`,
      [email, mobile],
    );

    return rows;
  },

  async findByMobile(mobile) {
    const [rows] = await pool.query(
      `SELECT * 
			 FROM vendor 
			 WHERE mobile = ?`,
      [mobile],
    );

    return rows;
  },

  async insertVendor(data) {
    const [result] = await pool.query("INSERT INTO vendor SET ?", [data]);

    return result.insertId;
  },

  async updateVendor(vendorId, data) {
    const [result] = await pool.query("UPDATE vendor SET ? WHERE id = ?", [
      data,
      vendorId,
    ]);

    return result;
  },

  async getAllTimeSlots() {
    const [rows] = await pool.query(`SELECT id FROM time_slots`);

    return rows;
  },

  async getCategory(categoryId) {
    const [rows] = await pool.query(
      `SELECT * 
			 FROM category 
			 WHERE id = ? 
			 LIMIT 1`,
      [categoryId],
    );

    return rows.length > 0 ? rows[0] : null;
  },

  async findById(vendorId) {
    const [rows] = await pool.query(
      `SELECT * 
			 FROM vendor 
			 WHERE id = ?
			 LIMIT 1`,
      [vendorId],
    );

    return rows.length > 0 ? rows[0] : null;
  },

  async getVendorById(vendorId) {
    const [rows] = await pool.query(
      `SELECT *
			 FROM vendor
			 WHERE id = ?
			 LIMIT 1`,
      [vendorId],
    );

    return rows.length > 0 ? rows[0] : null;
  },

  async getVendorByIdAndOtpVerified(vendorId, otp) {
    const [rows] = await pool.query(
      `SELECT *
		 FROM vendor
		 WHERE id = ?
		 AND otp = ?
		 AND verify_otp = 1
		 LIMIT 1`,
      [vendorId, otp],
    );

    return rows.length > 0 ? rows[0] : null;
  },

  async getVendorByOtp(vendorId, otp) {
    const [rows] = await pool.query(
      `SELECT *
		 FROM vendor
		 WHERE id = ?
		 AND otp = ?
		 LIMIT 1`,
      [vendorId, otp],
    );

    return rows.length > 0 ? rows[0] : null;
  },

  async getAllCategories() {
    const [rows] = await pool.query(`
		SELECT 
			id,
			shop_id,
			category_name,
			category_image,
			service_id,
			status
		FROM category
		WHERE status = 1
		ORDER BY category_name ASC
	`);

    return rows;
  },

  async getAllCities() {
    const [rows] = await pool.query(`
		SELECT *
		FROM city_list
		ORDER BY city_name ASC
	`);

    return rows;
  },

  async getLoginStatus(vendorId) {
    const [rows] = await pool.query(
      `SELECT id, is_kyc_approved
		 FROM vendor
		 WHERE id = ?
		 LIMIT 1`,
      [vendorId],
    );

    return rows.length > 0 ? rows[0] : null;
  },

  //
  async getVendorById(vendorId) {
    const [rows] = await pool.query(`SELECT * FROM vendor WHERE id = ?`, [
      vendorId,
    ]);
    return rows.length > 0 ? rows[0] : null;
  },

  async getPendingBookings(vendorId) {
    const [rows] = await pool.query(
      `SELECT
			 booking.id as Booking_id,
			 booking.booking_uniqe_id as Booking_id_string,
			 booking.userid,
			 booking.referral_discount,
			 booking.lat,
			 booking.lang,
			 booking.DeliveryCharge,
			 (SELECT CONCAT(users.fname, ' ', users.lname) FROM users WHERE users.id = booking.userid) as customer_name,
			 (SELECT address.address FROM address WHERE address.id = booking.address_id) as booking_address,
			 (SELECT payment_details.amount FROM payment_details WHERE payment_details.id = booking.payment_id) as paid_amount,
			 (SELECT payment_details.transaction FROM payment_details WHERE payment_details.id = booking.payment_id) as transaction,
			 booking.address_id,
			 booking.date,
			 booking.time_slote_id,
			 booking.onsite_date,
			 booking.onsite_time_slote_id,
			 booking.payment_id,
			 booking.vendor_address_id,
			 vendor_address.address as vendor_address,
			 vendor_address.lat as vendor_lat,
			 vendor_address.long as vendor_lang,
			 DATE_FORMAT(booking.date, '%d %b') as booked_date,
			 CASE
				 WHEN time_slots.time_slote IS NOT NULL
				 THEN DATE_FORMAT(time_slots.time_slote, '%h:%i %p')
				 ELSE ''
			 END as booked_time,
			 CASE
				 WHEN time_slots.time_slote IS NOT NULL
				 THEN CONCAT(DATE_FORMAT(booking.date, '%d %b'), ' ', DATE_FORMAT(time_slots.time_slote, '%h:%i %p'))
				 ELSE DATE_FORMAT(booking.date, '%d %b')
			 END as booked_date_time,
			 CASE
				 WHEN booking.onsite_date IS NOT NULL
					 AND booking.onsite_date != ''
					 AND booking.onsite_date != '0000-00-00'
					 AND booking.onsite_time_slote_id IS NOT NULL
					 AND booking.onsite_time_slote_id != ''
					 AND booking.onsite_time_slote_id != 0
					 AND onsite_slots.time_slote IS NOT NULL
				 THEN CONCAT(
					 DATE_FORMAT(booking.onsite_date, '%d %b'),
					 ' ',
					 DATE_FORMAT(onsite_slots.time_slote, '%h:%i %p')
				 )
				 ELSE ''
			 END AS vendor_date_time_booking,
			 50 as item_count,
			 200 as total_amount,
			 booking.status as current_status,
			 (SELECT category.category_name FROM category WHERE category.id = booking.cat_id) as rcat_name,
			 (CASE
					 WHEN booking.status = 0 THEN 'Pending'
					 WHEN booking.status = 1 THEN 'Confirmed'
					 WHEN booking.status = 2 THEN 'Completed'
					 WHEN booking.status = 3 THEN 'Cancelled'
					 ELSE 'NA'
			 END) AS status_in_string,
			 '50' as hst,
			 booking.cart_meta_data,
			 booking.booking_type
		 FROM booking
		 LEFT JOIN time_slots ON time_slots.id = booking.time_slote_id
		 LEFT JOIN time_slots AS onsite_slots ON onsite_slots.id = booking.onsite_time_slote_id
		 LEFT JOIN vendor_address ON vendor_address.id = booking.vendor_address_id
		 WHERE booking.vendor_id = ? AND booking.status = 0
		 ORDER BY booking.id DESC`,
      [vendorId],
    );
    return rows;
  },

  async getProductById(productId) {
    const [rows] = await pool.query(`SELECT * FROM products WHERE id = ?`, [
      productId,
    ]);
    return rows.length > 0 ? rows[0] : null;
  },

  async getAddonsByIds(addonIds) {
    const ids = String(addonIds)
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");
    if (ids.length === 0) return [];
    const [rows] = await pool.query(
      `SELECT * FROM addon_product WHERE id IN (?)`,
      [ids],
    );
    return rows;
  },

  async getCouponById(couponId) {
    const [rows] = await pool.query(`SELECT * FROM cupon_code WHERE id = ?`, [
      couponId,
    ]);
    return rows.length > 0 ? rows[0] : null;
  },

  async getBusinessName(vendorId) {
    const [rows] = await pool.query(
      `SELECT id, business_name FROM vendor WHERE id = ?`,
      [vendorId],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async getNotifications(vendorId) {
    const [rows] = await pool.query(
      `SELECT booking.id, booking.booking_uniqe_id, notifications.title,
			 notifications.message,
			 notifications.types,
			 DATE_FORMAT(notifications.date, '%Y/%m/%d %h:%i%p') as dated,
			 CONCAT(users.fname, ' ', users.lname) as username, users.image
		 FROM notifications
		 JOIN booking ON booking.id = notifications.booked_id
		 JOIN users ON users.id = booking.userid
		 WHERE notifications.reciever_id = ? AND notifications.receiver_type = 'vendor'
		 ORDER BY notifications.id DESC`,
      [vendorId],
    );
    return rows;
  },

  async getUnseenNotificationCount(vendorId) {
    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE notifications.reciever_id = ? AND notifications.seen = 0`,
      [vendorId],
    );
    return rows.length;
  },

  async markNotificationsAsSeen(vendorId) {
    const [result] = await pool.query(
      `UPDATE notifications SET seen = 1 WHERE reciever_id = ?`,
      [vendorId],
    );
    return result;
  },

  async getBookingById(bookedId) {
    const [rows] = await pool.query(
      `SELECT id FROM booking WHERE id = ? LIMIT 1`,
      [bookedId],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async getBookingDetailById(bookedId) {
    const [rows] = await pool.query(
      `SELECT
						booking.id                                          AS Booking_id,
						booking.vendor_id,
						booking.booking_uniqe_id                            AS Booking_id_string,

						(SELECT vendor.image FROM vendor WHERE vendor.id = booking.vendor_id LIMIT 1) AS vendor_image,
						(SELECT vendor.name  FROM vendor WHERE vendor.id = booking.vendor_id LIMIT 1) AS vendor_name,

						booking.vendor_address_id,
						vendor_address.address                              AS vendor_address,
						vendor_address.lat                                  AS vendor_lat,
						vendor_address.long                                 AS vendor_lang,

						booking.onsite_date,
						booking.onsite_time_slote_id,
						CASE
								WHEN booking.onsite_date IS NOT NULL
										 AND booking.onsite_date != ''
										 AND booking.onsite_date != '0000-00-00'
										 AND booking.onsite_time_slote_id IS NOT NULL
										 AND booking.onsite_time_slote_id != ''
										 AND booking.onsite_time_slote_id != 0
										 AND onsite_slots.time_slote IS NOT NULL
								THEN CONCAT(
												DATE_FORMAT(booking.onsite_date, '%d-%m-%Y'),
												' ',
												DATE_FORMAT(onsite_slots.time_slote, '%h:%i %p')
										 )
								ELSE ''
						END                                                 AS vendor_date_time_booking,

						booking.address_id,
						booking.date,
						booking.time_slote_id,
						CASE
								WHEN booking.date IS NOT NULL
										 AND booking.date != ''
										 AND booking.date != '0000-00-00'
								THEN DATE_FORMAT(booking.date, '%d-%m-%Y')
								ELSE ''
						END                                                 AS booked_date,
						CASE
								WHEN booking.time_slote_id IS NOT NULL
										 AND booking.time_slote_id != 0
										 AND time_slots.time_slote IS NOT NULL
								THEN DATE_FORMAT(time_slots.time_slote, '%h:%i %p')
								ELSE ''
						END                                                 AS booked_time,
						CASE
								WHEN booking.date IS NOT NULL
										 AND booking.date != ''
										 AND booking.date != '0000-00-00'
										 AND booking.time_slote_id IS NOT NULL
										 AND booking.time_slote_id != 0
										 AND time_slots.time_slote IS NOT NULL
								THEN CONCAT(
												DATE_FORMAT(booking.date, '%d-%m-%Y'),
												' ',
												DATE_FORMAT(time_slots.time_slote, '%h:%i %p')
										 )
								WHEN booking.date IS NOT NULL
										 AND booking.date != ''
										 AND booking.date != '0000-00-00'
								THEN DATE_FORMAT(booking.date, '%d-%m-%Y')
								ELSE ''
						END                                                 AS booked_date_time,

						(SELECT address.address FROM address WHERE address.id = booking.address_id LIMIT 1) AS user_address,

						users.id                                            AS user_id,
						CONCAT(users.fname, ' ', users.lname)               AS user_name,
						users.image                                         AS user_image,
						users.mobile                                        AS user_mobile,
						'5.0'                                                AS user_rating,

						booking.userid,
						booking.lat,
						booking.lang,
						booking.booking_type,
						booking.payment_id,
						booking.completed_date,
						booking.completed_time,
						booking.DeliveryCharge,
						booking.referral_discount,
						booking.total_amount,
						booking.walletAmount,
						booking.payable_amount,

						CASE
								WHEN booking.completed_date IS NOT NULL
										 AND booking.completed_date != ''
										 AND booking.completed_date != '0000-00-00'
								THEN CONCAT(DATE_FORMAT(booking.completed_date, '%d %b'), ' ', booking.completed_time)
								ELSE ''
						END                                                 AS order_completed_date_time,

						50 AS item_count,

						booking.status                                      AS current_status,

						(SELECT category.category_name FROM category WHERE category.id = booking.cat_id) AS rcat_name,

						CASE
								WHEN booking.status = 0 THEN 'Pending'
								WHEN booking.status = 1 THEN 'Confirmed'
								WHEN booking.status = 2 THEN 'Completed'
								WHEN booking.status = 3 THEN 'Cancelled'
								ELSE 'NA'
						END                                                 AS status_in_string,

						booking.cart_meta_data,
						booking.booking_type

		FROM booking
		LEFT JOIN time_slots                    ON time_slots.id     = booking.time_slote_id
		LEFT JOIN time_slots AS onsite_slots     ON onsite_slots.id   = booking.onsite_time_slote_id
		LEFT JOIN vendor_address                 ON vendor_address.id = booking.vendor_address_id
		LEFT JOIN users                          ON users.id          = booking.userid

		WHERE booking.id = ?`,
      [bookedId],
    );
    return rows;
  },

  async getBookingWithUserById(bookingId) {
    // Note: matches PHP's "SELECT booking.*, users.*" — duplicate column
    // names (like id) will overwrite each other, same as PHP's behavior
    const [rows] = await pool.query(
      `SELECT booking.*, users.*
		 FROM booking
		 JOIN users ON users.id = booking.userid
		 WHERE booking.id = ?`,
      [bookingId],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async cancelBooking(bookingId, vendorId, reason) {
    const [result] = await pool.query(
      `UPDATE booking
		 SET status = 3,
				 canceled_reason = ?,
				 cancelled_date = CURDATE()
		 WHERE id = ? AND vendor_id = ?`,
      [reason, bookingId, vendorId],
    );
    return result;
  },

  async getFullBookingById(bookingId) {
    const [rows] = await pool.query(
      `SELECT * FROM booking WHERE id = ? LIMIT 1`,
      [bookingId],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async getUserById(userId) {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE id = ? LIMIT 1`,
      [userId],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async acceptBooking(bookingId) {
    const [result] = await pool.query(
      `UPDATE booking
		 SET status = 1, accept_date = CURDATE()
		 WHERE id = ?`,
      [bookingId],
    );
    return result;
  },

  async getInprocessingBookings(vendorId, filters = {}) {
    const { startDate, endDate, type } = filters;

    let sql = `SELECT
			booking.id as Booking_id,
			booking.booking_uniqe_id as Booking_id_string,
			COALESCE(address.address, '') as booking_address,
			booking.userid,
			COALESCE(users.mobile, '') as mobile,
			COALESCE(booking.lat, '') as lat,
			COALESCE(booking.lang, '') as lang,
			COALESCE(booking.completed_date, '') as completed_date,
			COALESCE(booking.completed_time, '') as completed_time,
			COALESCE(booking.DeliveryCharge, 0) as DeliveryCharge,
			COALESCE((SELECT CONCAT(users.fname, ' ', users.lname) FROM users WHERE users.id=booking.userid), '') as customer_name,
			COALESCE((SELECT ROUND(payment_details.amount, 2) FROM payment_details WHERE payment_details.id = booking.payment_id), 0) AS paid_amount,
			COALESCE((SELECT ROUND(payment_details.amount, 2) FROM payment_details WHERE payment_details.id = booking.payment_id), 0) AS amount,
			COALESCE((SELECT payment_details.transaction FROM payment_details WHERE payment_details.id=booking.payment_id), '') as transaction,

			booking.vendor_id,
			COALESCE((SELECT vendor.name  FROM vendor WHERE vendor.id = booking.vendor_id LIMIT 1), '') as vendor_name,
			COALESCE((SELECT vendor.image FROM vendor WHERE vendor.id = booking.vendor_id LIMIT 1), '') as vendor_image,

			booking.vendor_address_id,
			COALESCE(vendor_address.address, '') as vendor_address,
			COALESCE(vendor_address.lat, '') as vendor_lat,
			COALESCE(vendor_address.long, '') as vendor_lang,

			booking.address_id,
			COALESCE(booking.date, '') as date,
			booking.time_slote_id,
			COALESCE(booking.onsite_date, '') as onsite_date,
			COALESCE(booking.onsite_time_slote_id, '') as onsite_time_slote_id,
			booking.payment_id,
			COALESCE(DATE_FORMAT(booking.date, '%d-%m-%Y'), '') as booked_date,
			COALESCE(DATE_FORMAT(time_slots.time_slote, '%h:%i %p'), '') as booked_time,
			COALESCE(CONCAT(DATE_FORMAT(booking.date, '%d-%m-%Y'), ' ', DATE_FORMAT(time_slots.time_slote, '%h:%i %p')), '') as booked_date_time,

			CASE
					WHEN booking.onsite_date IS NOT NULL
									 AND booking.onsite_date != ''
									 AND booking.onsite_date != '0000-00-00'
									 AND booking.onsite_time_slote_id IS NOT NULL
									 AND booking.onsite_time_slote_id != ''
									 AND booking.onsite_time_slote_id != 0
									 AND onsite_slots.time_slote IS NOT NULL
					THEN CONCAT(
									DATE_FORMAT(booking.onsite_date, '%d-%m-%Y'),
									' ',
									DATE_FORMAT(onsite_slots.time_slote, '%h:%i %p')
					)
					ELSE ''
			END AS vendor_date_time_booking,

			COALESCE(CONCAT(DATE_FORMAT(booking.completed_date, '%d %b'), ' ', booking.completed_time), '') AS order_completed_date_time,
			50 as item_count,
			200 as total_amount,
			booking.status as current_status,
			COALESCE(booking.referral_discount, 0) as referral_discount,
			COALESCE((SELECT category.category_name FROM category WHERE category.id=booking.cat_id), '') as rcat_name,
			(CASE
					WHEN booking.status = 0 THEN 'Pending'
					WHEN booking.status = 1 THEN 'Confirmed'
					WHEN booking.status = 2 THEN 'Completed'
					WHEN booking.status = 3 THEN 'Cancelled'
					ELSE 'NA'
			END) AS status_in_string,
			'13%' as hst,
			COALESCE((SELECT ROUND(AVG(rating),1) FROM rating_review WHERE rating_review.vendor_id=? LIMIT 1), 0) as rating,
			booking.cart_meta_data,
			COALESCE(booking.booking_type, '') as booking_type
	FROM booking
	LEFT JOIN payment_details ON payment_details.id=booking.payment_id
	LEFT JOIN category ON category.id=booking.cat_id
	LEFT JOIN address ON address.id=booking.address_id
	LEFT JOIN vendor_address ON vendor_address.id=booking.vendor_address_id
	LEFT JOIN time_slots ON time_slots.id=booking.time_slote_id
	LEFT JOIN time_slots AS onsite_slots ON onsite_slots.id=booking.onsite_time_slote_id
	LEFT JOIN users ON users.id=booking.userid
	WHERE booking.vendor_id = ?`;

    const params = [vendorId, vendorId];

    if (startDate) {
      sql += ` AND DATE_FORMAT(booking.date_time_stamp, '%Y-%m-%d') >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND DATE_FORMAT(booking.date_time_stamp, '%Y-%m-%d') <= ?`;
      params.push(endDate);
    }
    if (type === "processing") {
      sql += ` AND (booking.status = 0 OR booking.status = 1)`;
    } else if (type === "complete") {
      sql += ` AND booking.status = 2`;
    } else if (type === "canceled") {
      sql += ` AND booking.status = 3`;
    }

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async getVendorPenalty(vendorId, bookingId) {
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(vp.penalty_amount), 0) AS total_penalty
		 FROM vendor_penalties vp
		 JOIN booking b ON b.id = vp.booking_id
		 WHERE vp.vendor_id = ? AND vp.booking_id = ? AND b.penalty_status = 'yes'`,
      [vendorId, bookingId],
    );
    return rows.length > 0 ? rows[0] : { total_penalty: 0 };
  },

  async getServices(vendorId) {
    const [rows] = await pool.query(
      `SELECT * FROM products WHERE vendor_id = ?`,
      [vendorId],
    );
    return rows;
  },

  async getSubCategories(catId) {
    const [rows] = await pool.query(
      `SELECT * FROM sub_category WHERE cat_id = ?`,
      [catId],
    );
    return rows;
  },

  async insertProduct(data) {
    const [result] = await pool.query("INSERT INTO products SET ?", [data]);
    return result.insertId;
  },

  async updateProduct(productId, data) {
    const [result] = await pool.query("UPDATE products SET ? WHERE id = ?", [
      data,
      productId,
    ]);
    return result;
  },

  async getVendorFullDetail(vendorId) {
    const [rows] = await pool.query(
      `SELECT vendor.*,
				IFNULL((SELECT city_name FROM city_list WHERE city_list.id = vendor.city_id), '') as city_name,
				IFNULL((SELECT category_name FROM category WHERE category.id = vendor.cat_id), '') as category_name,
				IFNULL((SELECT shop_name FROM shop_details WHERE shop_details.vendor_id = vendor.id LIMIT 1), '') as shop_name,
				IFNULL((SELECT ROUND(AVG(rating_review.rating),1) FROM rating_review WHERE rating_review.vendor_id = vendor.id), '') as rating
			 FROM vendor
			 WHERE vendor.id = ?`,
      [vendorId],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async getShopDetailByVendorId(vendorId) {
    const [rows] = await pool.query(
      `SELECT * FROM shop_details WHERE vendor_id = ?`,
      [vendorId],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async insertShopDetail(data) {
    const [result] = await pool.query("INSERT INTO shop_details SET ?", [data]);
    return result.insertId;
  },

  async updateShopDetailByVendorId(vendorId, data) {
    const [result] = await pool.query(
      "UPDATE shop_details SET ? WHERE vendor_id = ?",
      [data, vendorId],
    );
    return result;
  },

  async getAddressListByVendorId(vendorId) {
    const [rows] = await pool.query(
      `SELECT id, vendor_id, address
			 FROM vendor_address
			 WHERE vendor_id = ?
			 ORDER BY id DESC`,
      [vendorId],
    );
    return rows;
  },

  async getBankDetailByVendorId(vendorId) {
    const [rows] = await pool.query(
      `SELECT
				IFNULL(acc_holder_name, '') as acc_holder_name,
				IFNULL(account_number, '') as account_number,
				IFNULL(branch_name, '') as branch_name,
				IFNULL(tansit_number, '') as tansit_number,
				IFNULL(branch_address, '') as branch_address,
				IFNULL(institution_number, '') as institution_number
			 FROM vendor
			 WHERE vendor.id = ?`,
      [vendorId],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async getEarningDetail(vendorId, filters = {}) {
    const { startDate, endDate } = filters;

    let sql = `SELECT
				booking.id as book_id,
				booking.booking_uniqe_id as booking_uniqe_id,
				DATE_FORMAT(booking.date_time_stamp, '%Y-%m-%d %h:%i%p') as order_date,
				payment_details.transaction,
				payment_details.amount,
				booking.cart_meta_data,
				'50' as hst
			FROM booking
			JOIN payment_details ON payment_details.id = booking.payment_id
			JOIN category ON category.id = booking.cat_id
			WHERE booking.vendor_id = ? AND booking.status = 2`;

    const params = [vendorId];

    if (startDate) {
      sql += ` AND DATE_FORMAT(booking.date_time_stamp, '%Y-%m-%d') >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND DATE_FORMAT(booking.date_time_stamp, '%Y-%m-%d') <= ?`;
      params.push(endDate);
    }

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async getAllAds() {
    const [rows] = await pool.query(`SELECT * FROM ads`);
    return rows;
  },

  async getSubscriptionByVendorAndPackage(vendorId, packageId) {
    const [rows] = await pool.query(
      `SELECT * FROM subscription WHERE vendor_id = ? AND package_id = ?`,
      [vendorId, packageId],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async expireSubscription(subId) {
    const [result] = await pool.query(
      `UPDATE subscription SET status = 0 WHERE id = ?`,
      [subId],
    );
    return result;
  },

  async getVideoByVendorAndId(vendorId, videoId) {
    const [rows] = await pool.query(
      `SELECT * FROM videos WHERE vendor_id = ? AND id = ?`,
      [vendorId, videoId],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async deleteVideoById(videoId) {
    const [result] = await pool.query(`DELETE FROM videos WHERE id = ?`, [
      videoId,
    ]);
    return result;
  },

  async getVideosByVendorId(vendorId) {
    const [rows] = await pool.query(
      `SELECT * FROM videos WHERE vendor_id = ? ORDER BY id DESC`,
      [vendorId],
    );
    return rows;
  },

  async insertVideo(data) {
    const [result] = await pool.query("INSERT INTO videos SET ?", [data]);
    return result.insertId;
  },

  async getVendorImageByVendorAndId(vendorId, imageId) {
    const [rows] = await pool.query(
      `SELECT * FROM vendor_images WHERE vendor_id = ? AND id = ?`,
      [vendorId, imageId],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async deleteVendorImageById(imageId) {
    const [result] = await pool.query(
      `DELETE FROM vendor_images WHERE id = ?`,
      [imageId],
    );
    return result;
  },

  async getVendorImagesByVendorId(vendorId) {
    const [rows] = await pool.query(
      `SELECT * FROM vendor_images WHERE vendor_id = ? ORDER BY id DESC`,
      [vendorId],
    );
    return rows;
  },
  async insertVendorImage(data) {
    const [result] = await pool.query("INSERT INTO vendor_images SET ?", [
      data,
    ]);
    return result.insertId;
  },

  async getVendorSlotIds(vendor_id) {
    const [rows] = await pool.query("SELECT * FROM vendor WHERE id = ?", [
      vendor_id,
    ]);
    return rows[0] || null;
  },

  async getVendorRawByIdCheck(vendor_id) {
    const [rows] = await pool.query("SELECT * FROM vendor WHERE id = ?", [
      vendor_id,
    ]);
    return rows;
  },

  async insertAppRatingReview(data) {
    const [result] = await pool.query("INSERT INTO app_rating_review SET ?", [
      data,
    ]);
    return result;
  },
  async getRuleByType(type) {
    const [rows] = await pool.query(
      "SELECT * FROM rules WHERE type = ? LIMIT 1",
      [type],
    );
    return rows[0] || null;
  },

  async updateVendorSlots(vendor_id, vendor_slote_id) {
    const [result] = await pool.query(
      "UPDATE vendor SET vendor_slote_id = ? WHERE id = ?",
      [vendor_slote_id, vendor_id],
    );

    return result;
  },

  async getBookingByOtp(booking_id, otp) {
    const [rows] = await pool.query(
      `SELECT booking.*, users.*
       FROM booking
       JOIN users ON users.id = booking.userid
       WHERE booking.id = ?
       AND booking.otp = ?`,
      [booking_id, otp],
    );

    return rows;
  },

  async completeBooking(booking_id, vendor_id) {
    const [result] = await pool.query(
      `UPDATE booking
       SET status = ?,
           completed_date = ?,
           completed_time = ?
       WHERE id = ?
       AND vendor_id = ?`,
      [
        2,
        new Date().toISOString().slice(0, 10),
        new Date().toLocaleTimeString("en-GB", {
          hour12: false,
          timeZone: "Asia/Kolkata",
        }),
        booking_id,
        vendor_id,
      ],
    );

    return result;
  },

  async addRatingReview(review, vendor_id, rating, user_id, booked_id) {
    const [result] = await pool.query(
      `INSERT INTO user_rating_review
       (review, vendor_id, rating, user_id, booked_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        review || null,
        vendor_id || null,
        rating || null,
        user_id || null,
        booked_id || null,
      ],
    );

    return result;
  },

  async activeDeactiveService(service_id) {
    const [product] = await pool.query("SELECT * FROM products WHERE id = ?", [
      service_id,
    ]);

    if (product.length === 0) {
      return {
        success: false,
        msg: "Wrong service_id",
      };
    }

    const current_status = product[0].status;

    let STATUS = 0;

    if (current_status == 0) {
      STATUS = 1;
    }

    if (current_status == 1) {
      STATUS = 0;
    }

    const [result] = await pool.query(
      "UPDATE products SET status = ? WHERE id = ?",
      [STATUS, service_id],
    );

    return {
      success: result.affectedRows > 0,
      status: STATUS,
    };
  },

  //...................new code 19-09-26.....................//

  async getRestaurantVendorById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM vendor WHERE id = ? LIMIT 1",
      [id],
    );
    return rows[0] || null;
  },
  async getTodayOrderStats(vendor_id, todayDate) {
    const [rows] = await pool.query(
      `
      SELECT
        SUM(order_status = 'Pending')   AS pending,
        SUM(order_status = 'Preparing') AS preparing,
        SUM(order_status = 'Delivered') AS delivered,
        SUM(CASE WHEN order_status = 'Delivered' THEN total_amount ELSE 0 END) AS earning
      FROM retsaurant_orders
      WHERE vendor_id = ?
        AND DATE(order_date) = ?
      `,
      [vendor_id, todayDate],
    );

    const row = rows[0] || {};

    return {
      pending: Number(row.pending) || 0,
      preparing: Number(row.preparing) || 0,
      delivered: Number(row.delivered) || 0,
      earning: parseFloat(row.earning) || 0,
    };
  },
  async getRestaurantOrdersWithUser(vendor_id) {
    const [rows] = await pool.query(
      `
      SELECT
        ro.id,
        ro.order_number,
        ro.order_status,
        CAST(ro.order_date AS CHAR) AS order_date,
        CAST(ro.order_time AS CHAR) AS order_time,
        ro.order_items,
        ro.total_amount,
        ro.coupon_id,
        ro.coupon_applied,
        ro.orderBookingType,
 
        u.fname,
        u.lname
 
      FROM retsaurant_orders ro
 
      LEFT JOIN users u
        ON u.id = ro.user_id
 
      WHERE ro.vendor_id = ?
 
      ORDER BY ro.id DESC
      `,
      [vendor_id],
    );
    return rows;
  },
  async getRestaurantCouponsByIds(couponIds) {
    if (!couponIds || couponIds.length === 0) return [];

    const [rows] = await pool.query(
      "SELECT id, discount_type, cupon_price FROM restaurant_coupon WHERE id IN (?)",
      [couponIds],
    );
    return rows;
  },

  // ==============================
  // TruAnon
  // ==============================

async updateTruAnonUsername(vendorId, truanon_username) {
  const [result] = await pool.query(
    `UPDATE vendor SET truanon_username = ? WHERE id = ?`,
    [truanon_username, vendorId]
  );
  return result;
},

async updateTruAnonVerification(vendorId, data) {
  const [result] = await pool.query(
    `UPDATE vendor
     SET is_anchored = ?, truanon_rank = ?, truanon_score = ?, truanon_updated_at = NOW()
     WHERE id = ?`,
    [data.is_anchored ?? 0, data.truanon_rank ?? "Unknown", data.truanon_score ?? 0, vendorId]
  );
  return result;
},

async getTruAnonData(vendorId) {
  const [rows] = await pool.query(
    `SELECT id, truanon_username, is_anchored, truanon_rank, truanon_score, truanon_updated_at
     FROM vendor WHERE id = ? LIMIT 1`,
    [vendorId]
  );
  return rows.length > 0 ? rows[0] : null;
},

//.................... new coed...............//

async getRestaurantItemsByVendorId(vendorId) {
	const [rows] = await pool.query(
		`SELECT 
			 ri.id, ri.status, ri.vendor_id, ri.name, ri.description, 
			 ri.item_image, ri.item_type, ri.unit_price, ri.discount_price, 
			 ri.sub_cat_id, sc.name as sub_category_name
		 FROM restaurant_items ri
		 LEFT JOIN sub_category sc ON sc.id = ri.sub_cat_id
		 WHERE ri.vendor_id = ?`,
		[vendorId],
	);

	return rows;
},

async insertRestaurantItem(data) {
	const [result] = await pool.query("INSERT INTO restaurant_items SET ?", [data]);

	return result.insertId;
},

async findRestaurantItemById(itemId) {
	const [rows] = await pool.query(
		`SELECT * 
		 FROM restaurant_items 
		 WHERE id = ?
		 LIMIT 1`,
		[itemId],
	);

	return rows.length > 0 ? rows[0] : null;
},

async getSubCategoryByRestaurant(categoryId) {
	const [rows] = await pool.query(
		`SELECT id, name FROM sub_category WHERE cat_id = ?`,
		[categoryId],
	);

	return rows;
},

async findRestaurantItemById(itemId) {
	const [rows] = await pool.query(
		`SELECT * 
		 FROM restaurant_items 
		 WHERE id = ?
		 LIMIT 1`,
		[itemId],
	);

	return rows.length > 0 ? rows[0] : null;
},

async updateRestaurantItemStatus(itemId, status) {
	const [result] = await pool.query(
		"UPDATE restaurant_items SET status = ? WHERE id = ?",
		[status, itemId],
	);

	return result;
},

async findRestaurantVendorById(restaurantId) {
	const [rows] = await pool.query(
		`SELECT * 
		 FROM vendor 
		 WHERE id = ? AND vendor_type = 'restaurant'
		 LIMIT 1`,
		[restaurantId],
	);

	return rows.length > 0 ? rows[0] : null;
},

async getRestaurantOrdersByStatus(vendorId, statusList) {
	const placeholders = statusList.map(() => "?").join(",");

	const [rows] = await pool.query(
		`SELECT * 
		 FROM retsaurant_orders
		 WHERE vendor_id = ? AND order_status IN (${placeholders})
		 ORDER BY id DESC`,
		[vendorId, ...statusList],
	);

	return rows;
},


async getUserBriefById(userId) {
	const [rows] = await pool.query(
		`SELECT id, fname, lname, mobile, email, address 
		 FROM users 
		 WHERE id = ?
		 LIMIT 1`,
		[userId],
	);

	return rows.length > 0 ? rows[0] : null;
},

async getAddonsByIds(addonIds) {
	if (!addonIds || addonIds.length === 0) {
		return [];
	}

	const placeholders = addonIds.map(() => "?").join(",");

	const [rows] = await pool.query(
		`SELECT id, name, price 
		 FROM vendor_addons 
		 WHERE id IN (${placeholders})`,
		addonIds,
	);

	return rows;
},

async getRestaurantItemBrief(itemId) {
	const [rows] = await pool.query(
		`SELECT id, name, item_image, item_type, unit_price, discount_price 
		 FROM restaurant_items 
		 WHERE id = ?
		 LIMIT 1`,
		[itemId],
	);

	return rows.length > 0 ? rows[0] : null;
},

async getDriverBriefById(driverId) {
	const [rows] = await pool.query(
		`SELECT 
			id, first_name, last_name, email, phone, address,
			lat, \`long\`, profile_image, is_available, current_order_id
		FROM drivers 
		WHERE id = ?
		LIMIT 1`,
		[driverId],
	);
	return rows.length > 0 ? rows[0] : null;
},

async countRestaurantOrdersByStatus(vendorId, statusList) {
	const placeholders = statusList.map(() => "?").join(",");

	const [rows] = await pool.query(
		`SELECT COUNT(*) AS cnt 
		 FROM retsaurant_orders
		 WHERE vendor_id = ? AND order_status IN (${placeholders})`,
		[vendorId, ...statusList],
	);

	return rows[0] ? rows[0].cnt : 0;
},

async findOrderById(orderId) {
	const [rows] = await pool.query(
		`SELECT * FROM retsaurant_orders WHERE id = ? LIMIT 1`,
		[orderId],
	);
	return rows.length > 0 ? rows[0] : null;
},

async getFullUserById(userId) {
	const [rows] = await pool.query(
		`SELECT * FROM users WHERE id = ? LIMIT 1`,
		[userId],
	);
	return rows.length > 0 ? rows[0] : null;
},

async updateOrder(orderId, data) {
	const [result] = await pool.query(
		"UPDATE retsaurant_orders SET ? WHERE id = ?",
		[data, orderId],
	);
	return result;
},

async insertNotification(data) {
	const [result] = await pool.query("INSERT INTO notifications SET ?", [data]);
	return result.insertId;
},

async getVendorAddress(vendorId) {
	const [rows] = await pool.query(
		`SELECT * FROM vendor_address 
		 WHERE vendor_id = ?
		 ORDER BY id DESC
		 LIMIT 1`,
		[vendorId],
	);
	return rows.length > 0 ? rows[0] : null;
},

async getAddressById(addressId) {
	const [rows] = await pool.query(
		`SELECT * FROM address WHERE id = ? LIMIT 1`,
		[addressId],
	);
	return rows.length > 0 ? rows[0] : null;
},

async getAvailableDrivers() {
	const [rows] = await pool.query(
		`SELECT * FROM drivers 
		 WHERE status = 1 
			 AND free_driver_not_free_driver = 1 
			 AND current_order_id IS NULL`,
	);
	return rows;
},

async getRestaurantOrderDetailsById(orderId) {
	const [rows] = await pool.query(
		`SELECT 
			 ro.*,

			 v.id as vendor_id,
			 v.name as vendor_name,
			 v.email_id as vendor_email,
			 v.mobile as vendor_mobile,
			 v.image as vendor_image,
			 v.business_name,
			 v.business_description,
			 v.lat as vendor_lat,
			 v.\`long\` as vendor_long,
			 v.dining_option,
			 v.minimum_delivery_time,
			 v.maximum_delivery_time,
			 v.delivery_time_type,
			 v.vendor_type,

			 u.id as user_id,
			 u.fname,
			 u.lname,
			 u.email,
			 u.mobile,
			 u.image as user_image,
			 u.address as user_address

		 FROM retsaurant_orders ro

		 LEFT JOIN vendor v 
			 ON v.id = ro.vendor_id

		 LEFT JOIN users u 
			 ON u.id = ro.user_id

		 WHERE ro.id = ?
		 LIMIT 1`,
		[orderId],
	);

	return rows.length > 0 ? rows[0] : null;
},

async getAddonsByIdsForOrder(addonIds) {
	if (!addonIds || addonIds.length === 0) {
		return [];
	}

	const placeholders = addonIds.map(() => "?").join(",");

	const [rows] = await pool.query(
		`SELECT id, name, price 
		 FROM vendor_addons 
		 WHERE id IN (${placeholders})`,
		addonIds,
	);

	return rows;
},

async getRestaurantItemPriceById(itemId) {
	const [rows] = await pool.query(
		`SELECT unit_price, discount_price 
		 FROM restaurant_items 
		 WHERE id = ?
		 LIMIT 1`,
		[itemId],
	);

	return rows.length > 0 ? rows[0] : null;
},

async getRestaurantCouponById(couponId) {
	const [rows] = await pool.query(
		`SELECT * FROM restaurant_coupon WHERE id = ? LIMIT 1`,
		[couponId],
	);

	return rows.length > 0 ? rows[0] : null;
},

async countRatingReviewByBookingId(bookingId) {
	const [rows] = await pool.query(
		`SELECT COUNT(*) AS cnt FROM rating_review WHERE booking_id = ?`,
		[bookingId],
	);

	return rows[0] ? rows[0].cnt : 0;
},

  async getRestaurantItemByVendor(itemId, vendorId) {
    const [rows] = await pool.query(
      `SELECT * FROM restaurant_items WHERE id = ? AND vendor_id = ? LIMIT 1`,
      [itemId, vendorId]
    );
    return rows[0] || null;
  },

  async getAddonGroupByIdItemVendor(groupId, itemId, vendorId) {
    const [rows] = await pool.query(
      `SELECT * FROM vendor_addon_groups WHERE id = ? AND item_id = ? AND vendor_id = ? LIMIT 1`,
      [groupId, itemId, vendorId]
    );
    return rows[0] || null;
  },

  async updateAddonGroup(groupId, title, isRequired) {
    const [result] = await pool.query(
      `UPDATE vendor_addon_groups SET title = ?, is_required = ? WHERE id = ?`,
      [title, isRequired, groupId]
    );
    return result;
  },

  async deleteAddonsByGroupId(groupId) {
    const [result] = await pool.query(
      `DELETE FROM vendor_addons WHERE group_id = ?`,
      [groupId]
    );
    return result;
  },

  async insertAddonGroup(data) {
    const [result] = await pool.query(
      `INSERT INTO vendor_addon_groups
        (item_id, vendor_id, sub_cat_id, type, title, is_required)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.item_id,
        data.vendor_id,
        data.sub_cat_id,
        data.type,
        data.title,
        data.is_required,
      ]
    );
    return result.insertId;
  },

  async deleteAddonGroupById(groupId) {
    const [result] = await pool.query(
      `DELETE FROM vendor_addon_groups WHERE id = ?`,
      [groupId]
    );
    return result;
  },

  async insertAddonsBatch(rows) {
    const [result] = await pool.query(
      `INSERT INTO vendor_addons (group_id, name, price, vendor_id, item_id, image)
       VALUES ?`,
      [rows]
    );
    return result;
  },

  async getAddonsByGroupId(groupId) {
    const [rows] = await pool.query(
      `SELECT * FROM vendor_addons WHERE group_id = ?`,
      [groupId]
    );
    return rows;
  },

  async getItemBasicByVendor(itemId, vendorId) {
    const [rows] = await pool.query(
      `SELECT id, vendor_id, name, unit_price, discount_price, description, item_image
       FROM restaurant_items
       WHERE id = ? AND vendor_id = ?
       LIMIT 1`,
      [itemId, vendorId]
    );
    return rows[0] || null;
  },

  async getAddonGroupsByItemVendor(itemId, vendorId) {
    const [rows] = await pool.query(
      `SELECT id, item_id, title, is_required, type
       FROM vendor_addon_groups
       WHERE item_id = ? AND vendor_id = ?
       ORDER BY id ASC`,
      [itemId, vendorId]
    );
    return rows;
  },

  async getAddonsByGroupAndItem(groupId, itemId, typeLc) {
    const selectCols =
      typeLc === "topping"
        ? "id, group_id, item_id, name, price, image"
        : "id, group_id, item_id, name, price";

    const [rows] = await pool.query(
      `SELECT ${selectCols}
       FROM vendor_addons
       WHERE group_id = ? AND item_id = ?
       ORDER BY id ASC`,
      [groupId, itemId]
    );
    return rows;
  },

  async getRestaurantItemById(itemId) {
    const [rows] = await pool.query(
      `SELECT * FROM restaurant_items WHERE id = ? LIMIT 1`,
      [itemId]
    );
    return rows[0] || null;
  },

  // ---- keyword list for a restaurant item ----
  async getKeywordsByItemId(itemId) {
    const [rows] = await pool.query(
      `SELECT id, restaurant_item_id, keyword, created_at
       FROM restaurant_item_keywords
       WHERE restaurant_item_id = ?
       ORDER BY id DESC`,
      [itemId]
    );
    return rows;
  },

  // ---- check duplicate keyword for same item ----
  async getKeywordByItemAndKeyword(itemId, keyword) {
    const [rows] = await pool.query(
      `SELECT * FROM restaurant_item_keywords
       WHERE restaurant_item_id = ? AND keyword = ?
       LIMIT 1`,
      [itemId, keyword]
    );
    return rows[0] || null;
  },

  // ---- insert new keyword, returns insertId ----
  async insertRestaurantItemKeyword(data) {
    const [result] = await pool.query(
      `INSERT INTO restaurant_item_keywords (restaurant_item_id, vendor_id, keyword)
       VALUES (?, ?, ?)`,
      [data.restaurant_item_id, data.vendor_id, data.keyword]
    );
    return result.insertId;
  },

};

module.exports = VendorModel;
