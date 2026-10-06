const pool = require("../config/db");
const bcrypt = require("bcrypt");
const BCRYPT_ROUNDS = 10;

const UserModel = {
  async findByEmailOrMobile(email, mobile) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? OR mobile = ?",
      [email, mobile],
    );
    return rows;
  },

  async findByReferralCode(referralCode) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE referral_code = ?",
      [referralCode],
    );
    return rows;
  },

  async countReferralUsage(codeOwnerUserId) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM referrel_history WHERE code_owner_userid = ?",
      [codeOwnerUserId],
    );
    return rows[0].total;
  },

  async insertUser(data) {
    const [result] = await pool.query("INSERT INTO users SET ?", [data]);
    return result.insertId;
  },

  async insertReferralHistory(codeOwnerUserId, whoReferred) {
    const [result] = await pool.query(
      "INSERT INTO referrel_history (code_owner_userid, who_reffered) VALUES (?, ?)",
      [codeOwnerUserId, whoReferred],
    );
    return result.insertId;
  },

  async updateWallet(userId, wallet) {
    const [result] = await pool.query(
      "UPDATE users SET wallet = ? WHERE id = ?",
      [wallet, userId],
    );
    return result.affectedRows;
  },

  async insertWalletDetail(userId, amount, type, debitCredit) {
    const [result] = await pool.query(
      "INSERT INTO wallet_details (userid, amount, type, debit_credit) VALUES (?, ?, ?, ?)",
      [userId, amount, type, debitCredit],
    );
    return result.insertId;
  },

  async findByMobile(mobile) {
    const [rows] = await pool.query("SELECT * FROM users WHERE mobile = ?", [
      mobile,
    ]);
    return rows;
  },

  async updateLogin(id, data) {
    const [result] = await pool.query(
      `UPDATE users
     SET
       lat = ?,
       lang = ?,
       fcm_id = ?,
       otp = ?,
       verify_otp = ?
     WHERE id = ?`,
      [data.lat, data.lang, data.fcm_id, data.otp, data.verify_otp, id],
    );

    return result;
  },

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id=?", [id]);
    return rows;
  },

  async findByIdAndOTP(id, otp) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id=? AND otp=?",
      [id, otp],
    );
    return rows;
  },

  async updateVerifyOTP(id) {
    const [result] = await pool.query(
      "UPDATE users SET verify_otp=1 WHERE id=?",
      [id],
    );
    return result;
  },

  async updateSignupNotification(id) {
    const [result] = await pool.query(
      "UPDATE users SET signup_notification=1 WHERE id=?",
      [id],
    );
    return result;
  },

  async insertNotification(data) {
    const [result] = await pool.query(
      `INSERT INTO notifications
    (sender_id,message,sender_type,receiver_type,types)
    VALUES (?,?,?,?,?)`,
      [
        data.sender_id,
        data.message,
        data.sender_type,
        data.receiver_type,
        data.types,
      ],
    );

    return result.insertId;
  },

  async updateOTP(user_id, otp) {
    const [result] = await pool.query(
      `UPDATE users
         SET otp=?,verify_otp=0
         WHERE id=?`,

      [otp, user_id],
    );

    return result;
  },

  async getCategories() {
    const [rows] = await pool.query(
      `SELECT
            id,
            shop_id,
            category_name,
            category_image,
            service_id,
            status
        FROM category
        WHERE status=1`,
    );

    return rows;
  },

  async getHomeSliders() {
    const [rows] = await pool.query(
      `SELECT *
         FROM home_sliders
         ORDER BY id DESC`,
    );

    return rows;
  },

  async getSubCategoryByName(name) {
    const [rows] = await pool.query(
      "SELECT * FROM sub_category WHERE LOWER(name)=? LIMIT 1",

      [name],
    );

    return rows;
  },

  async getVendor(id) {
    const [rows] = await pool.query(
      `SELECT vendor.*,

(SELECT category_name
FROM category
WHERE id=vendor.cat_id) AS category_name

FROM vendor
WHERE id=?`,

      [id],
    );

    return rows;
  },

  async getStartFrom(vendor_id) {
    const [rows] = await pool.query(
      `SELECT MIN(rate) AS start_from
FROM products
WHERE vendor_id=?
AND status=1`,

      [vendor_id],
    );

    return rows[0];
  },

  async getProducts(vendor_id, userid, scat_id) {
    const [rows] = await pool.query(
      `SELECT
            products.id,
            products.vendor_id,

            IFNULL(product_name,'') AS product_name,
            IFNULL(image,'') AS image,
            IFNULL(about,'') AS about,
            IFNULL(rate,'') AS rate,
            IFNULL(service_type,'') AS service_type,

            IFNULL(products.warranty_status,0) AS warranty_status,
            IFNULL(products.warranty_price,0) AS warranty_price,
            IFNULL(products.warranty_note,'') AS warranty_note,
            IFNULL(products.warranty_duration,'') AS warranty_duration,

            IFNULL(
                (
                    SELECT cart.quantity
                    FROM cart
                    WHERE cart.product_id = products.id
                    AND cart.user_id = ?
                    AND cart.vendor_id = ?
                    LIMIT 1
                ),
                0
            ) AS qty,

            IFNULL(
                (
                    SELECT cart.service_type
                    FROM cart
                    WHERE cart.product_id = products.id
                    AND cart.user_id = ?
                    AND cart.vendor_id = ?
                    LIMIT 1
                ),
                ''
            ) AS selected_service_type,

            IFNULL(
                (
                    SELECT cart.warrenty_status
                    FROM cart
                    WHERE cart.product_id = products.id
                    AND cart.user_id = ?
                    AND cart.vendor_id = ?
                    LIMIT 1
                ),
                0
            ) AS selected_warranty_status,

            IFNULL(
                (
                    SELECT SUM(cart.final_amount)
                    FROM cart
                    WHERE cart.user_id = ?
                ),
                0
            ) AS cart_total,

            IFNULL(
                (
                    SELECT category.category_name
                    FROM category
                    WHERE category.id = products.category_id
                    LIMIT 1
                ),
                ''
            ) AS cat_name,

            IFNULL(
                (
                    SELECT category.showHomeService
                    FROM category
                    WHERE category.id = products.category_id
                    LIMIT 1
                ),
                'Home Service'
            ) AS showHomeService,

            IFNULL(
                (
                    SELECT category.showOnSiteService
                    FROM category
                    WHERE category.id = products.category_id
                    LIMIT 1
                ),
                'On Site'
            ) AS showOnSiteService,

            IFNULL(
                (
                    SELECT sub_category.name
                    FROM sub_category
                    WHERE sub_category.cat_id = products.scat_id
                    LIMIT 1
                ),
                ''
            ) AS scat_name,

            products.status,
            products.scat_id

        FROM products

        WHERE
            products.scat_id = ?
            AND products.status = 1
            AND products.vendor_id = ?

        ORDER BY products.scat_id ASC`,

      [
        userid,
        vendor_id,

        userid,
        vendor_id,

        userid,
        vendor_id,

        userid,

        scat_id,
        vendor_id,
      ],
    );

    return rows;
  },

  async getCartTotal(userid) {
    const [rows] = await pool.query(
      "SELECT SUM(final_amount) AS total FROM cart WHERE user_id=?",

      [userid],
    );

    return rows[0];
  },

  async getUserById(userid) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id=?", [userid]);

    return rows;
  },

  async getVendors(cat_id, subcategory_id) {
    const hasSubCat =
      subcategory_id !== undefined &&
      subcategory_id !== null &&
      subcategory_id !== "";

    const subCatCondition = hasSubCat
      ? `AND EXISTS (
			SELECT 1 FROM products
			WHERE products.vendor_id = vendor.id
			AND products.scat_id = ?
			AND products.status = 1
		)`
      : "";

    const params = hasSubCat ? [cat_id, subcategory_id] : [cat_id];

    const [rows] = await pool.query(
      `SELECT

			vendor.id,
			vendor.id AS vendor_id,

			(SELECT category.category_name
			 FROM category
			 WHERE category.id=vendor.cat_id) AS cat_name,

			(SELECT category.id
			 FROM category
			 WHERE category.id=vendor.cat_id) AS cat_id,

			vendor.name,
			vendor.image,
			vendor.about,

			vendor.business_name AS shop_name,
			vendor.business_description,

			vendor.lat,
			vendor.long,

			(SELECT nearby.redius FROM nearby LIMIT 1) AS redius,

			IFNULL(
				(SELECT ROUND(AVG(rating),1)
				 FROM rating_review
				 WHERE rating_review.vendor_id=vendor.id),
				 '0.0'
			) AS rating,

			IFNULL(
				(SELECT shop_details.shop_name
				 FROM shop_details
				 WHERE shop_details.vendor_id=vendor.id),
				 ''
			) AS shop_names

		FROM vendor

		WHERE vendor.cat_id=?
		AND vendor.is_kyc_approved=1
		AND (SELECT COUNT(*) FROM products WHERE products.vendor_id=vendor.id)>=0
		${subCatCondition}

		ORDER BY vendor.id DESC`,

      params,
    );

    return rows;
  },

  async cartDetail(vendor_id, cat_id, userid, product_id) {
    const response = {};

    const [cartTotal] = await pool.query(
      `SELECT SUM(final_amount) AS cart_total
									FROM cart
									WHERE user_id=?`,
      [userid],
    );
    response.cart_total = cartTotal[0].cart_total || 0;

    const [qty] = await pool.query(
      `SELECT
												quantity AS qty,
												addon_price,
												final_amount
									FROM cart
									WHERE user_id=?
									AND product_id=?`,
      [userid, product_id],
    );

    if (qty.length > 0) {
      response.qty = qty[0].qty;
      response.addon_price = qty[0].addon_price;
      response.product_total_price = qty[0].final_amount;
    } else {
      response.qty = 0;
      response.addon_price = 0;
      response.product_total_price = 0;
    }

    return response;
  },

  async preCartData(vendor_id, cat_id, userid, product_id) {
    const [rows] = await pool.query(
      `SELECT
												cart.*,
												products.service_id,
												products.category_id
									FROM cart
									JOIN products ON products.id = cart.product_id
									WHERE cart.user_id=?`,
      [userid],
    );

    if (rows.length > 0) {
      const cart_vendor_id = rows[0].vendor_id;

      if (Number(vendor_id) === Number(cart_vendor_id)) {
        return 1;
      } else {
        await pool.query("DELETE FROM cart WHERE user_id=?", [userid]);
        return 0;
      }
    }

    return 0;
  },

  async _getAddonData(addons) {
    let addonIds = null;
    let addonPrice = null;

    if (addons) {
      const ids = String(addons)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      if (ids.length > 0) {
        addonIds = ids.join(",");
        const placeholders = ids.map(() => "?").join(",");
        const [rows] = await pool.query(
          `SELECT SUM(price) AS addons_sum
													FROM addon_product
													WHERE id IN (${placeholders})`,
          ids,
        );
        addonPrice = rows[0].addons_sum;
      }
    }

    return { addonIds, addonPrice };
  },

  async _computeAmount(userid, qty, rate, addonPrice) {
    const [bookingRows] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM booking WHERE userid=?",
      [userid],
    );
    const bookingExists = bookingRows[0].cnt;

    let total = addonPrice
      ? Number(qty) * Number(rate) + Number(addonPrice)
      : Number(qty) * Number(rate);

    if (bookingExists == 0) {
      const discount = (total * 10) / 100;
      total -= discount;
    }

    return total;
  },

  async _removeAndRespond(res, vendor_id, cat_id, userid, product_id) {
    await pool.query("DELETE FROM cart WHERE user_id=? AND product_id=?", [
      userid,
      product_id,
    ]);

    // ================= FIX =================
    const detail = await this.cartDetail(vendor_id, cat_id, userid, product_id);
    // ================= FIX END =================

    return res.json({
      result: "true",
      msg: "Updated Successfully",
      cart_total: detail.cart_total,
      qty: detail.qty,
      addon_price: detail.addon_price,
      product_total_price: detail.product_total_price,
    });
  },

  async getShareBonusGift() {
    const [rows] = await pool.query("SELECT * FROM share_bonus_gift LIMIT 1");

    return rows;
  },

  async getCartProducts(userid) {
    const [rows] = await pool.query(
      "SELECT product_id,vendor_id FROM cart WHERE user_id=?",
      [userid],
    );
    return rows;
  },

  async getProductCategories(productIds) {
    if (!productIds.length) return [];

    const placeholders = productIds.map(() => "?").join(",");

    const [rows] = await pool.query(
      `SELECT category_id
       FROM products
       WHERE id IN (${placeholders})`,
      productIds,
    );

    return rows;
  },

  async getActiveCoupons() {
    const [rows] = await pool.query(
      `SELECT *
       FROM cupon_code
       WHERE status='1'
       AND expired_at>=CURDATE()
       AND created_at<=CURDATE()`,
    );

    return rows;
  },

  async isCouponApplied(userid, couponId) {
    const [rows] = await pool.query(
      `SELECT id
       FROM cart
       WHERE user_id=?
       AND coupon_id=?
       LIMIT 1`,
      [userid, couponId],
    );

    return rows.length > 0;
  },

  async getUserLastLogin(user_id) {
    const [rows] = await pool.query(
      `SELECT id,last_login_date
     FROM users
     WHERE id=?`,
      [user_id],
    );

    return rows;
  },

  async updateLastLogin(user_id, loginDate, difference) {
    const formatDate = loginDate.toISOString().slice(0, 19).replace("T", " ");

    const [rows] = await pool.query(
      `UPDATE users
     SET last_login_date=?,
         last_login_time_difference=?
     WHERE id=?`,
      [formatDate, difference, user_id],
    );

    return rows;
  },

  async getAiText() {
    const [rows] = await pool.query(`
    SELECT
      id,
      title,
      image,
      created_at
    FROM ai_texts
  `);

    return rows;
  },

  async userLogout(user_id) {
    const [result] = await pool.query(
      `
      UPDATE users
      SET
        fcm_id = '',
        modify_at = NOW()
      WHERE id = ?
    `,
      [user_id],
    );

    return result.affectedRows > 0;
  },

  async addAddress({ userid, address, lat, lang }) {
    // Check existing address
    const [existing] = await pool.query(
      `SELECT * FROM address WHERE user_id = ? AND lat = ? AND lang = ?`,
      [userid, lat, lang],
    );

    if (existing.length > 0) {
      const updateData = {
        lat,
        lang,
        address,
      };

      await pool.query(
        `UPDATE address
       SET lat = ?, lang = ?, address = ?
       WHERE user_id = ? AND lat = ? AND lang = ?`,
        [lat, lang, address, userid, lat, lang],
      );

      await pool.query(
        `UPDATE users
       SET lat = ?, lang = ?, address = ?
       WHERE id = ?`,
        [lat, lang, address, userid],
      );

      return {
        result: true,
        msg: "Address updated successfully",
      };
    }

    // Count addresses
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM address WHERE user_id = ?`,
      [userid],
    );

    if (countRows[0].total >= 300) {
      const [oldest] = await pool.query(
        `SELECT id
       FROM address
       WHERE user_id = ?
       ORDER BY id ASC
       LIMIT 1`,
        [userid],
      );

      if (oldest.length > 0) {
        await pool.query(`DELETE FROM address WHERE id = ?`, [oldest[0].id]);
      }
    }

    // Insert new address
    const [insertResult] = await pool.query(
      `INSERT INTO address (user_id, address, lat, lang)
     VALUES (?, ?, ?, ?)`,
      [userid, address, lat, lang],
    );

    const addressId = insertResult.insertId;

    await pool.query(
      `UPDATE users
     SET address = ?, lat = ?, lang = ?
     WHERE id = ?`,
      [address, lat, lang, userid],
    );

    if (insertResult.affectedRows > 0) {
      return {
        result: true,
        msg: "Address added successfully",
        address_id: addressId,
      };
    }

    return {
      result: true,
      msg: "Address updated successfully",
      address_id: addressId,
    };
  },

  async getProfile(userid) {
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [
      userid,
    ]);

    return rows.length > 0 ? rows[0] : null;
  },

  async updateProfile(userid, data) {
    if (Object.keys(data).length === 0) {
      return true;
    }

    const fields = [];
    const values = [];

    for (const key in data) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }

    values.push(userid);

    const sql = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = ?
    `;

    const [result] = await pool.query(sql, values);

    return result;
  },

  async getWalletHistory(userId) {
    // Check user
    const [users] = await pool.query(
      `SELECT id, wallet FROM users WHERE id = ?`,
      [userId],
    );

    if (users.length === 0) {
      return {
        userExists: false,
        walletAmount: 0,
        data: [],
      };
    }

    // Get wallet history
    const [walletHistory] = await pool.query(
      `
      SELECT 
        wallet_details.*,
        DATE_FORMAT(wallet_details.timestamp, '%d %b %Y') AS dated
      FROM wallet_details
      WHERE wallet_details.userid = ?
      ORDER BY wallet_details.id DESC
      `,
      [userId],
    );

    return {
      userExists: true,
      walletAmount: users[0].wallet,
      data: walletHistory,
    };
  },

  async changePassword(userId, oldPassword, newPassword) {
    // Get user
    const [users] = await pool.query(
      `SELECT id, fname, lname, mobile, status, password
     FROM users
     WHERE id = ?`,
      [userId],
    );

    if (users.length === 0) {
      return {
        success: false,
        type: "USER_NOT_FOUND",
      };
    }

    const user = users[0];

    // Check old password (hashed compare)
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return {
        success: false,
        type: "INCORRECT_OLD_PASSWORD",
      };
    }

    // Hash new password before saving
    const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Update password
    const [result] = await pool.query(
      `UPDATE users
     SET password = ?, plan_password = ?
     WHERE id = ?`,
      [hashedNewPassword, newPassword, userId],
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        type: "UPDATE_FAILED",
      };
    }

    return {
      success: true,
      user,
      newPassword,
    };
  },

  async addContactUs(userId, title, description) {
    // Check user
    const [users] = await pool.query(
      `SELECT id, fcm_id
       FROM users
       WHERE id = ?`,
      [userId],
    );

    if (users.length === 0) {
      return {
        success: false,
        type: "USER_NOT_FOUND",
      };
    }

    // Contact data
    const contactData = {
      user_id: userId,
      title: title,
      description: description,
    };

    // Insert contact
    const [contactResult] = await pool.query(
      `INSERT INTO contact_us
       (user_id, title, description)
       VALUES (?, ?, ?)`,
      [contactData.user_id, contactData.title, contactData.description],
    );

    // Insert failed
    if (contactResult.affectedRows === 0) {
      return {
        success: false,
        type: "INSERT_FAILED",
      };
    }

    // Notification table
    // FCM/email intentionally disabled
    await pool.query(
      `INSERT INTO notifications
       (sender_id, message, sender_type, receiver_type, types)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        "New contact us feedback submitted.",
        "customer",
        "Admin",
        "Feedback",
      ],
    );

    return {
      success: true,
      data: contactData,
    };
  },

  async getAppRatingReview() {
    const [rows] = await pool.query(`
      SELECT
        app_rating_review.id,
        CONCAT(users.fname, ' ', users.lname) AS user_name,
        users.image,
        app_rating_review.rating + 0.0 AS rating,
        app_rating_review.review
      FROM app_rating_review
      JOIN users
        ON users.id = app_rating_review.user_id
      WHERE app_rating_review.status = 1
      ORDER BY app_rating_review.id DESC
    `);

    return rows;
  },

  async getFaq() {
    const [rows] = await pool.query(`
      SELECT *
      FROM faq
      WHERE faq.type = 'user'
    `);

    return rows;
  },

  async getAboutCompany() {
    const [privacyPolicy] = await pool.query(
      `SELECT * FROM rules WHERE id = 1`,
    );

    const [termsConditions] = await pool.query(
      `SELECT * FROM rules WHERE id = 2`,
    );

    const [aboutUs] = await pool.query(`SELECT * FROM rules WHERE id = 3`);

    return {
      privacy_policy: privacyPolicy.length > 0 ? privacyPolicy[0] : null,

      terms_conditions: termsConditions.length > 0 ? termsConditions[0] : null,

      about_us: aboutUs.length > 0 ? aboutUs[0] : null,
    };
  },

  async getContactUs() {
    const [rows] = await pool.query(`
      SELECT *
      FROM customer_service
      WHERE customer_service.status = 1
    `);

    return rows;
  },

  async saveAppReview(userid, rating, msg = "") {
    try {
      const [users] = await pool.query(
        `
      SELECT id, fcm_id
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
        [userid],
      );

      if (!users || users.length === 0) {
        return {
          success: false,
          type: "WRONG_USERID",
        };
      }

      let reviewResult;

      if (msg && String(msg).trim() !== "") {
        [reviewResult] = await pool.query(
          `
        INSERT INTO app_rating_review
        (
          user_id,
          rating,
          review
        )
        VALUES (?, ?, ?)
        `,
          [userid, rating, msg],
        );
      } else {
        [reviewResult] = await pool.query(
          `
        INSERT INTO app_rating_review
        (
          user_id,
          rating
        )
        VALUES (?, ?)
        `,
          [userid, rating],
        );
      }

      if (!reviewResult || reviewResult.affectedRows === 0) {
        return {
          success: false,
          type: "INSERT_FAILED",
        };
      }

      const [notificationResult] = await pool.query(
        `
        INSERT INTO notifications
        (
          sender_id,
          message,
          sender_type,
          receiver_type,
          types
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          userid,
          "User submitted a new app rating review.",
          "customer",
          "Admin",
          "Feedback",
        ],
      );

      if (!notificationResult || notificationResult.affectedRows === 0) {
        return {
          success: false,
          type: "NOTIFICATION_FAILED",
        };
      }

      return {
        success: true,
        type: "SUCCESS",

        fcm_id: users[0].fcm_id || null,
      };
    } catch (error) {
      console.error("UserModel.saveAppReview Error:", error);

      return {
        success: false,
        type: "INSERT_FAILED",
      };
    }
  },

  async getNearbyBookings(user_id, lat, lang, radius) {
    const [rows] = await pool.query(
      `
    SELECT users.id,
      (
        6371 * 2 * ASIN(
          SQRT(
            POWER(
              SIN(
                (? - users.lat) * PI() / 180 / 2
              ),
              2
            )
            +
            COS(? * PI() / 180)
            *
            COS(users.lat * PI() / 180)
            *
            POWER(
              SIN(
                (? - users.lang) * PI() / 180 / 2
              ),
              2
            )
          )
        )
      ) AS distance
    FROM booking
    JOIN users ON users.id = booking.userid
    WHERE booking.status = 2
    HAVING distance <= ?
    ORDER BY distance ASC
    `,
      [lat, lat, lang, radius],
    );

    return rows.length;
  },

  async getTestimonials() {
    const [rows] = await pool.query(
      `
    SELECT 
      app_rating_review.id,
      app_rating_review.rating,
      CONCAT(users.fname, ' ', users.lname) AS user_name,
      users.image,
      app_rating_review.review AS description
    FROM app_rating_review
    JOIN users 
      ON users.id = app_rating_review.user_id
    WHERE app_rating_review.is_testimonial = 'true'
    `,
    );

    return rows;
  },

  async getExpertVideos(vendor_id) {
    const [videos] = await pool.query(
      `
    SELECT *
    FROM videos
    WHERE vendor_id = ?
    ORDER BY id DESC
    `,
      [vendor_id],
    );

    const videoData = videos.map((row) => ({
      ...row,
      type: "video",
    }));

    const [images] = await pool.query(
      `
    SELECT *
    FROM vendor_images
    WHERE vendor_id = ?
    ORDER BY id DESC
    `,
      [vendor_id],
    );

    const imageData = images.map((row) => ({
      ...row,
      type: "image",
    }));

    return [...videoData, ...imageData];
  },

  async getScatByVendor(vendor_id) {
    const [vendorRows] = await pool.query(
      `
    SELECT id, facebook_ink, country_code, mobile
    FROM vendor
    WHERE id = ?
    `,
      [vendor_id],
    );

    if (vendorRows.length === 0) {
      return {
        status: "wrong_vendor",
      };
    }

    const vendor = vendorRows[0];

    const facebook_ink = vendor.facebook_ink ?? "";
    const vendorMobile = `${vendor.country_code ?? ""}${vendor.mobile ?? ""}`;

    const [productRows] = await pool.query(
      `
    SELECT GROUP_CONCAT(products.category_id) AS scats
    FROM products
    WHERE products.status = 1
      AND products.vendor_id = ?
    `,
      [vendor_id],
    );

    if (productRows.length === 0) {
      return {
        status: "no_data",
      };
    }

    let scats = productRows[0].scats;

    if (!scats) {
      return {
        status: "no_services",
      };
    }

    const categoryIds = scats.split(",").filter((id) => id);

    if (categoryIds.length === 0) {
      return {
        status: "no_services",
      };
    }

    const placeholders = categoryIds.map(() => "?").join(",");

    const [subCategories] = await pool.query(
      `
    SELECT 
      sub_category.*,
      category.category_name
    FROM sub_category
    INNER JOIN category
      ON sub_category.cat_id = category.id
    WHERE sub_category.cat_id IN (${placeholders})
    `,
      categoryIds,
    );

    if (subCategories.length === 0) {
      return {
        status: "no_subcategories",
      };
    }

    return {
      status: "success",
      facebook_ink,
      vendor_mobile: `+${vendorMobile}`,
      data: subCategories,
    };
  },

  async getVendorRatingReview(vendor_id) {
    const [rows] = await pool.query(
      `
    SELECT
      rating_review.id,
      CONCAT(users.fname, ' ', users.lname) AS user_name,
      users.image,
      rating_review.rating,
      rating_review.review,
      DATE_FORMAT(
        rating_review.date_time,
        '%d/%m/%Y %h:%i%p'
      ) AS date_time
    FROM rating_review
    JOIN users
      ON users.id = rating_review.user_id
    WHERE rating_review.vendor_id = ?
    `,
      [vendor_id],
    );

    return rows;
  },

  async deleteCart(user_id) {
    const [result] = await pool.query(
      `
    DELETE FROM cart
    WHERE user_id = ?
    `,
      [user_id],
    );

    return result;
  },

  async getCartByUserId(user_id) {
    const [rows] = await pool.query("SELECT * FROM cart WHERE user_id = ?", [
      user_id,
    ]);
    return rows;
  },

  async getCouponById(id) {
    const [rows] = await pool.query("SELECT * FROM cupon_code WHERE id = ?", [
      id,
    ]);
    return rows[0] || null;
  },

  async getCouponByCode(code) {
    const [rows] = await pool.query("SELECT * FROM cupon_code WHERE code = ?", [
      code,
    ]);
    return rows[0] || null;
  },

  async checkCouponApplied(user_id, coupan_id) {
    const [rows] = await pool.query(
      "SELECT * FROM apply_coupan WHERE user_id = ? AND coupan_id = ?",
      [user_id, coupan_id],
    );
    return rows;
  },

  async deleteAppliedCoupon(user_id, coupan_id) {
    const [result] = await pool.query(
      "DELETE FROM apply_coupan WHERE user_id = ? AND coupan_id = ?",
      [user_id, coupan_id],
    );
    return result;
  },

  async insertAppliedCoupon(user_id, coupan_id, code) {
    const [result] = await pool.query(
      "INSERT INTO apply_coupan (user_id, coupan_id, code, status) VALUES (?, ?, ?, ?)",
      [user_id, coupan_id, code, 1],
    );
    return result.insertId;
  },

  async updateCartCoupon(user_id, coupan_id) {
    const [result] = await pool.query(
      "UPDATE cart SET coupon_applied = 1, coupon_id = ? WHERE user_id = ?",
      [coupan_id, user_id],
    );
    return result;
  },

  async removeCouponFromCart(userid) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();
      await conn.query(
        "UPDATE cart SET coupon_applied = 0, coupon_id = NULL WHERE user_id = ?",
        [userid],
      );

      await conn.query("DELETE FROM apply_coupan WHERE user_id = ?", [userid]);

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async getAddressByIdAndUser(address_id, user_id) {
    const [rows] = await pool.query(
      "SELECT * FROM address WHERE id = ? AND user_id = ?",
      [address_id, user_id],
    );
    return rows[0] || null;
  },

  async getCartItemsByUser(user_id) {
    const [rows] = await pool.query("SELECT * FROM cart WHERE user_id = ?", [
      user_id,
    ]);
    return rows;
  },

  async getDeliveryRadius() {
    const [rows] = await pool.query("SELECT * FROM nearby LIMIT 1");
    return rows[0] || null;
  },

  async getApprovedVendorById(vendor_id) {
    const [rows] = await pool.query(
      "SELECT * FROM vendor WHERE id = ? AND is_kyc_approved = 1",
      [vendor_id],
    );
    return rows[0] || null;
  },

  async findUserByIdForPayment(userid) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userid,
    ]);
    return rows[0] || null;
  },

  async insertSquarePayment(data) {
    const [result] = await pool.query(
      `
    INSERT INTO square_payments
      (userid, amount, currency, status, response, created_on)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        data.userid,
        data.amount,
        data.currency,
        data.status,
        data.response,
        data.created_on,
      ],
    );

    return result.insertId;
  },

  async getUserRawById(userid) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userid,
    ]);
    return rows[0] || null;
  },

  async getVendorRawById(vendor_id) {
    const [rows] = await pool.query("SELECT * FROM vendor WHERE id = ?", [
      vendor_id,
    ]);
    return rows[0] || null;
  },

  async getCartCountByUser(userid) {
    const [rows] = await pool.query("SELECT * FROM cart WHERE user_id = ?", [
      userid,
    ]);
    return rows;
  },

  async getProductById(product_id) {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      product_id,
    ]);
    return rows[0] || null;
  },

  async insertCartItem(data) {
    const [result] = await pool.query("INSERT INTO cart SET ?", [data]);
    return result.insertId;
  },

  async getCartWithProductRate(userid) {
    const [rows] = await pool.query(
      `
      SELECT cart.*, products.rate AS product_rate
      FROM cart
      JOIN products ON products.id = cart.product_id
      WHERE cart.user_id = ?
      `,
      [userid],
    );
    return rows;
  },

  async insertPaymentDetails(data) {
    const [result] = await pool.query("INSERT INTO payment_details SET ?", [
      data,
    ]);
    return result.insertId;
  },

  async getAddressLatLng(address_id) {
    const [rows] = await pool.query(
      "SELECT id, lat, lang FROM address WHERE id = ?",
      [address_id],
    );
    return rows[0] || null;
  },

  async insertBooking(data) {
    const [result] = await pool.query("INSERT INTO booking SET ?", [data]);
    return result.insertId;
  },

  async getCartFinalAmountSum(userid) {
    const [rows] = await pool.query(
      "SELECT SUM(final_amount) AS final_amount FROM cart WHERE user_id = ?",
      [userid],
    );
    return rows[0].final_amount || 0;
  },

  async getUserWalletOnly(userid) {
    const [rows] = await pool.query("SELECT wallet FROM users WHERE id = ?", [
      userid,
    ]);
    return rows[0] || null;
  },

  async updateUserWalletBalance(userid, newBalance) {
    const [result] = await pool.query(
      "UPDATE users SET wallet = ? WHERE id = ?",
      [newBalance, userid],
    );
    return result;
  },

  async decrementUserWallet(userid, amount) {
    const [result] = await pool.query(
      "UPDATE users SET wallet = wallet - ? WHERE id = ?",
      [amount, userid],
    );
    return result;
  },

  async countUserBookings(userid) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM booking WHERE userid = ?",
      [userid],
    );
    return rows[0].total;
  },

  async updateBookingReferralDiscount(booking_id) {
    const [result] = await pool.query(
      "UPDATE booking SET referral_discount = true WHERE id = ?",
      [booking_id],
    );
    return result;
  },

  async updatePaymentDetailsBookingId(payment_id, booking_id) {
    const [result] = await pool.query(
      "UPDATE payment_details SET booking_id = ? WHERE id = ?",
      [booking_id, payment_id],
    );
    return result;
  },

  async getBookingById(booking_id) {
    const [rows] = await pool.query("SELECT * FROM booking WHERE id = ?", [
      booking_id,
    ]);
    return rows[0] || null;
  },

  async getUserEmailDetails(userid) {
    const [rows] = await pool.query(
      "SELECT id, fname, lname, email FROM users WHERE id = ?",
      [userid],
    );
    return rows[0] || null;
  },

  async getAddressDetails(address_id) {
    const [rows] = await pool.query(
      "SELECT address, city, state, pin_code FROM address WHERE id = ?",
      [address_id],
    );
    return rows[0] || null;
  },

  async insertBookingNotification(data) {
    const [result] = await pool.query(
      `
      INSERT INTO notifications
      (booked_id, vendor_id, sender_id, reciever_id, title, message, sender_type, receiver_type, types, meta_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.booked_id,
        data.vendor_id,
        data.sender_id,
        data.reciever_id,
        data.title,
        data.message,
        data.sender_type,
        data.receiver_type,
        data.types,
        data.meta_data,
      ],
    );
    return result.insertId;
  },

  async getCategoryById(categoryId) {
    const [rows] = await pool.query(
      `SELECT
			 id AS category_id,
			 category_name,
			 category_image,
			 sort_description
		 FROM category
		 WHERE id = ? AND status = 1`,
      [categoryId],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async getSubCategoriesByCategoryId(categoryId) {
    const [rows] = await pool.query(
      `SELECT
			 id AS sub_category_id,
			 name AS sub_category_name,
			 image AS sub_category_image,
			 description AS sort_description
		 FROM sub_category
		 WHERE cat_id = ? AND status = 1
		 ORDER BY id DESC`,
      [categoryId],
    );
    return rows;
  },

  // ══════════════ Upcoming Booking — Service side ══════════════
  async getUpcomingServiceBookings(userid) {
    const [rows] = await pool.query(
      `
      SELECT
          booking.id                                          AS Booking_id,
          booking.booking_uniqe_id                            AS Booking_id_string,
          booking.userid,
          booking.address_id,
          booking.date,
          booking.time_slote_id,
          booking.onsite_date,
          booking.onsite_time_slote_id,
          booking.referral_discount,
          booking.payment_id,
          booking.DeliveryCharge,
          DATE_FORMAT(booking.date, '%d %b')                  AS booked_date,
          CASE
              WHEN time_slots.time_slote IS NOT NULL
              THEN DATE_FORMAT(time_slots.time_slote, '%h:%i %p')
              ELSE ''
          END                                                 AS booked_time,
          CASE
              WHEN time_slots.time_slote IS NOT NULL
              THEN CONCAT(
                  DATE_FORMAT(booking.date, '%d %b'),
                  ' ',
                  DATE_FORMAT(time_slots.time_slote, '%h:%i %p')
              )
              ELSE DATE_FORMAT(booking.date, '%d %b')
          END                                                 AS booked_date_time,
          CASE
              WHEN booking.onsite_date IS NOT NULL
                       AND YEAR(booking.onsite_date) > 0
                       AND booking.onsite_time_slote_id IS NOT NULL
                       AND booking.onsite_time_slote_id != 0
                       AND onsite_slots.time_slote IS NOT NULL
              THEN CONCAT(
                  DATE_FORMAT(booking.onsite_date, '%d %b'),
                  ' ',
                  DATE_FORMAT(onsite_slots.time_slote, '%h:%i %p')
              )
              ELSE ''
          END                                                 AS vendor_date_time_booking,
          booking.status                                      AS current_status,
          (SELECT category.category_name FROM category WHERE category.id = booking.cat_id) AS rcat_name,
          (SELECT vendor.image FROM vendor WHERE vendor.id = booking.vendor_id)             AS vendor_image,
          CASE
              WHEN booking.status = 0 THEN 'Pending'
              WHEN booking.status = 1 THEN 'Confirmed'
              WHEN booking.status = 2 THEN 'Completed'
              WHEN booking.status = 3 THEN 'Cancelled'
              ELSE 'NA'
          END                                                 AS status_in_string,
          booking.cart_meta_data,
          booking.booking_type,
          booking.date_time_stamp                             AS sort_datetime
      FROM booking
      LEFT JOIN time_slots ON time_slots.id = booking.time_slote_id
      LEFT JOIN time_slots AS onsite_slots ON onsite_slots.id = booking.onsite_time_slote_id
      WHERE booking.userid = ?
        AND booking.status != 2
        AND booking.status != 3
      ORDER BY booking.date_time_stamp DESC
      `,
      [userid],
    );
    return rows;
  },

  async getWarrantyPriceByProductId(product_id) {
    const [rows] = await pool.query(
      "SELECT warranty_price FROM products WHERE id = ?",
      [product_id],
    );
    return rows.length > 0 ? rows[0].warranty_price : null;
  },

  async getCouponPriceById(coupon_id) {
    const [rows] = await pool.query(
      "SELECT cupon_price FROM cupon_code WHERE id = ?",
      [coupon_id],
    );
    return rows.length > 0 ? rows[0].cupon_price : null;
  },

  // ══════════════ Upcoming Booking — Restaurant side ══════════════
  async getUpcomingRestaurantOrders(userid) {
    const [rows] = await pool.query(
      `
      SELECT
          ro.id                                               AS Booking_id,
          ro.order_number                                     AS Booking_id_string,
          ro.user_id                                          AS userid,
          ro.address_id,
          ro.order_date                                       AS date,
          ro.orderBookingType                                 AS order_booking_type,
          ''                                                  AS time_slote_id,
          ''                                                  AS onsite_date,
          ''                                                  AS onsite_time_slote_id,
          0                                                   AS referral_discount,
          ro.payment_id,
          ro.delivery_charge                                  AS DeliveryCharge,
          DATE_FORMAT(ro.order_date, '%d %b')                 AS booked_date,
          CASE
              WHEN ro.orderBookingType IN ('Pickup', 'Dine In')
              THEN ro.time_slot
              ELSE DATE_FORMAT(
                  STR_TO_DATE(ro.order_time, '%H:%i:%s'), '%h:%i %p'
              )
          END                                                 AS booked_time,
          CONCAT(
              DATE_FORMAT(ro.order_date, '%d %b'),
              ' ',
              CASE
                  WHEN ro.orderBookingType IN ('Pickup', 'Dine In')
                  THEN ro.time_slot
                  ELSE DATE_FORMAT(STR_TO_DATE(ro.order_time, '%H:%i:%s'), '%h:%i %p')
              END
          )                                                   AS booked_date_time,
          ''                                                  AS vendor_date_time_booking,
          ro.order_status                                     AS current_status,
          'Restaurant'                                        AS rcat_name,
          (SELECT v.image FROM vendor v WHERE v.id = ro.vendor_id) AS vendor_image,
          CASE
              WHEN ro.order_status = 'pending'    THEN 'Pending'
              WHEN ro.order_status = 'accepted'   THEN 'Confirmed'
              WHEN ro.order_status = 'processing' THEN 'Confirmed'
              WHEN ro.order_status = 'on_the_way' THEN 'Confirmed'
              WHEN ro.order_status = 'delivered'  THEN 'Completed'
              WHEN ro.order_status = 'cancelled'  THEN 'Cancelled'
              ELSE 'Pending'
          END                                                 AS status_in_string,
          ro.order_items                                      AS cart_meta_data,
          'restaurant'                                        AS booking_type,
          ro.subtotal,
          ro.total_amount                                     AS raw_total,
          ro.wallet_used,
          ro.coupon_id,
          ro.coupon_applied,
          ro.created_at                                       AS sort_datetime
      FROM retsaurant_orders ro
      WHERE ro.user_id = ?
        AND ro.cat_id = 118
        AND ro.order_status != 'delivered'
        AND ro.order_status != 'cancelled'
      ORDER BY ro.created_at DESC
      `,
      [userid],
    );
    return rows;
  },

  async getRestaurantCouponById(coupon_id) {
    const [rows] = await pool.query(
      "SELECT cupon_price, discount_type FROM restaurant_coupon WHERE id = ?",
      [coupon_id],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  // ══════════════ Completed Booking — Service side ══════════════
  async getCompletedServiceBookings(userid) {
    const [rows] = await pool.query(
      `
      SELECT
        booking.id                                          AS Booking_id,
        booking.booking_uniqe_id                            AS Booking_id_string,
        booking.userid,
        booking.address_id,
        booking.date,
        booking.vendor_id,
        booking.time_slote_id,
        booking.onsite_date,
        booking.onsite_time_slote_id,
        booking.referral_discount,
        booking.payment_id,
        booking.completed_date,
        booking.completed_time,
        booking.DeliveryCharge,
        DATE_FORMAT(booking.date, '%d %b')                  AS booked_date,
        CASE
            WHEN time_slots.time_slote IS NOT NULL
            THEN DATE_FORMAT(time_slots.time_slote, '%h:%i %p')
            ELSE ''
        END                                                 AS booked_time,
        CASE
            WHEN time_slots.time_slote IS NOT NULL
            THEN CONCAT(
                DATE_FORMAT(booking.date, '%d %b'),
                ' ',
                DATE_FORMAT(time_slots.time_slote, '%h:%i %p')
            )
            ELSE DATE_FORMAT(booking.date, '%d %b')
        END                                                 AS booked_date_time,
        CASE
            WHEN booking.onsite_date IS NOT NULL
                     AND YEAR(booking.onsite_date) > 0
                     AND booking.onsite_time_slote_id IS NOT NULL
                     AND booking.onsite_time_slote_id != 0
                     AND onsite_slots.time_slote IS NOT NULL
            THEN CONCAT(
                DATE_FORMAT(booking.onsite_date, '%d %b'),
                ' ',
                DATE_FORMAT(onsite_slots.time_slote, '%h:%i %p')
            )
            ELSE ''
        END                                                 AS vendor_date_time_booking,
        CONCAT(
            DATE_FORMAT(booking.completed_date, '%d %b'), ' ',
            booking.completed_time
        ) AS order_completed_date_time,
        booking.status                                      AS current_status,
        (SELECT category.category_name FROM category WHERE category.id = booking.cat_id) AS rcat_name,
        (SELECT vendor.image FROM vendor WHERE vendor.id = booking.vendor_id)             AS vendor_image,
        CASE
            WHEN booking.status = 0 THEN 'Pending'
            WHEN booking.status = 1 THEN 'Confirmed'
            WHEN booking.status = 2 THEN 'Completed'
            WHEN booking.status = 3 THEN 'Cancelled'
            ELSE 'NA'
        END                                                 AS status_in_string,
        booking.cart_meta_data,
        booking.booking_type,
        booking.date_time_stamp                             AS sort_datetime
      FROM booking
      LEFT JOIN time_slots ON time_slots.id = booking.time_slote_id
      LEFT JOIN time_slots AS onsite_slots ON onsite_slots.id = booking.onsite_time_slote_id
      WHERE booking.userid = ?
        AND booking.status = 2
      ORDER BY booking.date_time_stamp DESC
      `,
      [userid],
    );
    return rows;
  },

  async getAddonProductsByIds(idsCsv) {
    const ids = String(idsCsv)
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (ids.length === 0) return [];

    const placeholders = ids.map(() => "?").join(",");
    const [rows] = await pool.query(
      `SELECT * FROM addon_product WHERE id IN (${placeholders})`,
      ids,
    );
    return rows;
  },

  // ══════════════ Completed Booking — Restaurant side ══════════════
  async getCompletedRestaurantOrders(userid) {
    const [rows] = await pool.query(
      `
      SELECT
          ro.id as Booking_id,
          ro.order_number as Booking_id_string,
          ro.user_id as userid,
          ro.orderBookingType   AS order_booking_type,
          ro.vendor_id,
          ro.address_id,
          '' as time_slote_id,
          '' as onsite_date,
          '' as onsite_time_slote_id,
          0 as referral_discount,
          ro.payment_id,

          DATE(ro.created_at) as completed_date,
          TIME(ro.created_at) as completed_time,

          ro.delivery_charge as DeliveryCharge,

          DATE_FORMAT(ro.order_date, '%d %b') as booked_date,
          ro.order_time as booked_time,

          CONCAT(
              DATE_FORMAT(ro.order_date, '%d %b'),
              ' ',
              ro.order_time
          ) as booked_date_time,

          '' as vendor_date_time_booking,

          CONCAT(
              DATE_FORMAT(ro.created_at, '%d %b'),
              ' ',
              TIME(ro.created_at)
          ) as order_completed_date_time,

          '2' as current_status,
          ro.user_latitude as users_lat,
          ro.user_longitude as users_lang,

          'Restaurant' as rcat_name,

          (
              SELECT image
              FROM vendor
              WHERE id = ro.vendor_id
          ) as vendor_image,

          'Completed' as status_in_string,

          ro.order_items as cart_meta_data,
          'restaurant' as booking_type,

          ro.subtotal,
          ro.total_amount,
          ro.created_at as sort_datetime

      FROM retsaurant_orders ro

      WHERE ro.user_id = ?
        AND ro.cat_id = 118
        AND ro.order_status = 'delivered'

      ORDER BY ro.created_at DESC
      `,
      [userid],
    );
    return rows;
  },

  // ══════════════ Cancelled Booking — Service side ══════════════
  async getCancelledServiceBookings(userid) {
    const [rows] = await pool.query(
      `
      SELECT
          booking.id                                          AS Booking_id,
          booking.booking_uniqe_id                            AS Booking_id_string,
          booking.userid,
          booking.address_id,
          booking.date,
          booking.time_slote_id,
          booking.onsite_date,
          booking.onsite_time_slote_id,
          booking.referral_discount,
          booking.payment_id,
          booking.DeliveryCharge,
          DATE_FORMAT(booking.date, '%d %b')                  AS booked_date,
          CASE
              WHEN time_slots.time_slote IS NOT NULL
              THEN DATE_FORMAT(time_slots.time_slote, '%h:%i %p')
              ELSE ''
          END                                                 AS booked_time,
          CASE
              WHEN time_slots.time_slote IS NOT NULL
              THEN CONCAT(
                  DATE_FORMAT(booking.date, '%d %b'),
                  ' ',
                  DATE_FORMAT(time_slots.time_slote, '%h:%i %p')
              )
              ELSE DATE_FORMAT(booking.date, '%d %b')
          END                                                 AS booked_date_time,
          CASE
              WHEN booking.onsite_date IS NOT NULL
                       AND YEAR(booking.onsite_date) > 0
                       AND booking.onsite_time_slote_id IS NOT NULL
                       AND booking.onsite_time_slote_id != 0
                       AND onsite_slots.time_slote IS NOT NULL
              THEN CONCAT(
                  DATE_FORMAT(booking.onsite_date, '%d %b'),
                  ' ',
                  DATE_FORMAT(onsite_slots.time_slote, '%h:%i %p')
              )
              ELSE ''
          END                                                 AS vendor_date_time_booking,
          booking.status                                      AS current_status,
          (SELECT category.category_name FROM category WHERE category.id = booking.cat_id) AS rcat_name,
          (SELECT vendor.image FROM vendor WHERE vendor.id = booking.vendor_id)             AS vendor_image,
          CASE
              WHEN booking.status = 0 THEN 'Pending'
              WHEN booking.status = 1 THEN 'Confirmed'
              WHEN booking.status = 2 THEN 'Completed'
              WHEN booking.status = 3 THEN 'Cancelled'
              ELSE 'NA'
          END                                                 AS status_in_string,
          booking.cart_meta_data,
          booking.booking_type,
          booking.date_time_stamp                             AS sort_datetime
      FROM booking
      LEFT JOIN time_slots ON time_slots.id = booking.time_slote_id
      LEFT JOIN time_slots AS onsite_slots ON onsite_slots.id = booking.onsite_time_slote_id
      WHERE booking.userid = ?
        AND booking.status = 3
      ORDER BY booking.date_time_stamp DESC
      `,
      [userid],
    );
    return rows;
  },

  // ══════════════ Cancelled Booking — Restaurant side ══════════════
  async getCancelledRestaurantOrders(userid) {
    const [rows] = await pool.query(
      `
      SELECT
          id as Booking_id,
          order_number as Booking_id_string,
          user_id as userid,
          orderBookingType as order_booking_type,
          address_id,
          0 as referral_discount,
          order_date as date,
          '' as time_slote_id,
          '' as onsite_date,
          '' as onsite_time_slote_id,
          payment_id,
          delivery_charge as DeliveryCharge,

          DATE_FORMAT(order_date, '%d %b') as booked_date,
          order_time as booked_time,

          CONCAT(
              DATE_FORMAT(order_date, '%d %b'),
              ' ',
              order_time
          ) as booked_date_time,

          '' as vendor_date_time_booking,

          order_status as current_status,

          'Restaurant' as rcat_name,

          (
              SELECT image
              FROM vendor
              WHERE vendor.id = retsaurant_orders.vendor_id
          ) as vendor_image,

          'Cancelled' as status_in_string,

          order_items as cart_meta_data,
          'restaurant' as booking_type,

          canceled_reason as canceled_reason,

          subtotal,
          total_amount

      FROM retsaurant_orders

      WHERE user_id = ?
        AND cat_id = 118
        AND order_status = 'cancelled'

      ORDER BY id DESC
      `,
      [userid],
    );
    return rows;
  },

  async getWarrantyBookings(userid) {
    const [rows] = await pool.query(
      `
      SELECT
        booking.id AS booking_id,
        booking.booking_uniqe_id,
        booking.vendor_id,
        booking.completed_date,
        booking.cart_meta_data,

        (
          SELECT business_name
          FROM vendor
          WHERE vendor.id=booking.vendor_id
        ) AS vendor_name,

        (
          SELECT image
          FROM vendor
          WHERE vendor.id=booking.vendor_id
        ) AS vendor_image,

        (
          SELECT ROUND(AVG(rating),1)
          FROM rating_review
          WHERE rating_review.vendor_id=booking.vendor_id
        ) AS vendor_rating,

        (
          SELECT is_kyc_approved
          FROM vendor
          WHERE vendor.id=booking.vendor_id
        ) AS vendor_verified

      FROM booking

      WHERE booking.userid=?
        AND booking.status=2
        AND booking.cart_meta_data IS NOT NULL

      ORDER BY booking.completed_date DESC
      `,
      [userid],
    );
    return rows;
  },

  async getProductWarrantyDetails(product_id) {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        product_name,
        image,
        warranty_price,
        warranty_note,
        warranty_duration
      FROM products
      WHERE id = ?
      `,
      [product_id],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async getWarrantyArchive(userid, booking_id, product_id) {
    const [rows] = await pool.query(
      `
      SELECT id
      FROM warranty_archive
      WHERE userid = ?
        AND booking_id = ?
        AND product_id = ?
      LIMIT 1
      `,
      [userid, booking_id, product_id],
    );
    return rows;
  },

  async getWarrantyClaim(userid, booking_id, product_id) {
    const [rows] = await pool.query(
      `
      SELECT id, status
      FROM warranty_claim
      WHERE userid = ?
        AND booking_id = ?
        AND product_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [userid, booking_id, product_id],
    );
    return rows;
  },

  async getWarrantyReminder(userid, booking_id, product_id) {
    const [rows] = await pool.query(
      `
      SELECT is_enabled
      FROM warranty_reminder
      WHERE userid = ?
        AND booking_id = ?
        AND product_id = ?
      LIMIT 1
      `,
      [userid, booking_id, product_id],
    );
    return rows;
  },

  async getBookDetailFull(booked_id) {
    const [rows] = await pool.query(
      `
      SELECT
          booking.id                                          AS Booking_id,
          booking.vendor_id,
          booking.otp,

          (SELECT vendor.image         FROM vendor WHERE vendor.id=booking.vendor_id LIMIT 1) AS vendor_image,
          (SELECT vendor.name          FROM vendor WHERE vendor.id=booking.vendor_id LIMIT 1) AS vendor_name,
          (SELECT vendor.business_name FROM vendor WHERE vendor.id=booking.vendor_id LIMIT 1) AS vendor_business_name,

          -- Vendor address (correct source: vendor_address table via vendor_address_id)
          booking.vendor_address_id,
          COALESCE(vendor_address.address, '') AS vendor_address,
          COALESCE(vendor_address.lat, '')     AS vendor_lat,
          COALESCE(vendor_address.long, '')    AS vendor_lang,

          (SELECT users.image FROM users WHERE users.id=booking.userid LIMIT 1) AS user_image,
          (SELECT CONCAT(users.fname, ' ', users.lname) FROM users WHERE users.id=booking.userid LIMIT 1) AS user_name,

          booking.booking_uniqe_id                            AS Booking_id_string,
          booking.userid,
          booking.address_id,
          booking.date,
          booking.time_slote_id,
          booking.onsite_date,
          booking.onsite_time_slote_id,
          booking.booking_type,
          booking.referral_discount,
          booking.payment_id,
          booking.DeliveryCharge,

          CASE
              WHEN booking.date IS NOT NULL
                   AND YEAR(booking.date) > 0
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
                   AND YEAR(booking.date) > 0
                   AND booking.time_slote_id IS NOT NULL
                   AND booking.time_slote_id != 0
                   AND time_slots.time_slote IS NOT NULL
              THEN CONCAT(
                      DATE_FORMAT(booking.date, '%d-%m-%Y'),
                      ' ',
                      DATE_FORMAT(time_slots.time_slote, '%h:%i %p')
                   )
              WHEN booking.date IS NOT NULL
                   AND YEAR(booking.date) > 0
              THEN DATE_FORMAT(booking.date, '%d-%m-%Y')
              ELSE ''
          END                                                 AS booked_date_time,

          CASE
              WHEN booking.onsite_date IS NOT NULL
                       AND YEAR(booking.onsite_date) > 0
                       AND booking.onsite_time_slote_id IS NOT NULL
                       AND booking.onsite_time_slote_id != 0
                       AND onsite_slots.time_slote IS NOT NULL
              THEN CONCAT(
                      DATE_FORMAT(booking.onsite_date, '%d-%m-%Y'),
                      ' ',
                      DATE_FORMAT(onsite_slots.time_slote, '%h:%i %p')
                   )
              ELSE ''
          END AS vendor_date_time_booking,

          50 as item_count,
          200 as total_amount,
          booking.status as current_status,
          (SELECT category.category_name FROM category WHERE category.id=booking.cat_id) as rcat_name,

          (  CASE
                  WHEN booking.status = 0 THEN 'Pending'
                  WHEN booking.status = 1 THEN 'Confirmed'
                  WHEN booking.status = 2 THEN 'Completed'
                  WHEN booking.status = 3 THEN 'Cancelled'
                  ELSE 'NA'
              END) AS status_in_string,

          booking.cart_meta_data,
          ifnull(booking.pending_date, '')    as pending_date,
          ifnull(booking.accept_date, '')     as accept_date,
          ifnull(booking.completed_date, '')  as completed_date,
          ifnull(booking.cancelled_date, '')  as cancelled_date,
          ifnull(booking.canceled_reason, '') as canceled_reason

      FROM booking
      LEFT JOIN time_slots                ON time_slots.id     = booking.time_slote_id
      LEFT JOIN time_slots AS onsite_slots ON onsite_slots.id   = booking.onsite_time_slote_id
      LEFT JOIN vendor_address             ON vendor_address.id = booking.vendor_address_id
      WHERE
      booking.id = ?
      `,
      [booked_id],
    );
    return rows;
  },

  async countRatingReviewByBookingId(booking_id) {
    const [rows] = await pool.query(
      "SELECT id FROM rating_review WHERE booking_id = ?",
      [booking_id],
    );
    return rows.length;
  },

  async getProductWarrantyPriceAndNote(product_id) {
    const [rows] = await pool.query(
      "SELECT warranty_price, warranty_note FROM products WHERE id = ?",
      [product_id],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async getAddonProductsByIdsCsv(idsCsv) {
    const ids = String(idsCsv)
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (ids.length === 0) return [];

    const placeholders = ids.map(() => "?").join(",");
    const [rows] = await pool.query(
      `SELECT * FROM addon_product WHERE id IN (${placeholders})`,
      ids,
    );
    return rows;
  },

  async getCouponPriceOnlyById(coupon_id) {
    const [rows] = await pool.query(
      "SELECT cupon_price FROM cupon_code WHERE id = ?",
      [coupon_id],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async countUnseenMessages(userid) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM chat_list WHERE user_id = ? AND u_seen = 0",
      [userid],
    );
    return rows[0].total;
  },

  async getUserNotifications(userid) {
    const [rows] = await pool.query(
      `
      SELECT
          notifications.id,
          notifications.title,
          notifications.message,
          notifications.types,
          DATE_FORMAT(notifications.date, '%Y/%m/%d %h:%i%p') as dated,
          vendor.name, vendor.image,
          notifications.booked_id
      FROM notifications
      JOIN vendor ON vendor.id = notifications.vendor_id
      WHERE notifications.reciever_id = ?
        AND notifications.receiver_type = 'user'
      ORDER BY notifications.id DESC
      `,
      [userid],
    );
    return rows;
  },

  async countUnseenNotifications(userid) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM notifications WHERE reciever_id = ? AND seen = 0",
      [userid],
    );
    return rows[0].total;
  },

  async markNotificationsAsSeen(userid) {
    const [result] = await pool.query(
      "UPDATE notifications SET seen = 1 WHERE reciever_id = ?",
      [userid],
    );
    return result;
  },

  //.................new code 18-09-26...............//

  async getUserLocationById(userid) {
    const [rows] = await pool.query(
      "SELECT lat, lang FROM users WHERE id = ? LIMIT 1",
      [userid],
    );
    return rows[0] || null;
  },

  async getNearbyRadius() {
    const [rows] = await pool.query("SELECT * FROM nearby LIMIT 1");
    return rows[0] || null;
  },

  async getServiceRecords() {
    const [rows] = await pool.query(`
			SELECT
				products.id            AS product_id,
				products.category_id,
				products.scat_id,
				products.product_name,
				products.image,

				vendor.id              AS vendor_id,
				vendor.name            AS vendor_name,
				vendor.business_name,
				vendor.lat             AS vendor_lat,
				vendor.\`long\`          AS vendor_lon,

				category.category_name,
				sub_category.name      AS sub_category_name,

				restaurant_items.name  AS item_name
			FROM products
			LEFT JOIN vendor           ON vendor.id = products.vendor_id
			LEFT JOIN category         ON category.id = products.category_id
			LEFT JOIN sub_category     ON sub_category.id = products.scat_id
			LEFT JOIN restaurant_items ON restaurant_items.vendor_id = vendor.id
		`);
    return rows;
  },

  async searchRestorent(lat, lang) {
    const radiusKm = 15;

    const [rows] = await pool.query(
      `
      SELECT * FROM (
        SELECT *,
          (
            (
              ACOS(
                LEAST(1, GREATEST(-1,
                  SIN(? * PI() / 180) * SIN(lat * PI() / 180)
                  +
                  COS(? * PI() / 180) * COS(lat * PI() / 180)
                  * COS((? - lang) * PI() / 180)
                ))
              ) * 180 / PI()
            ) * 60 * 1.1515 * 1.609344
          ) AS distance
        FROM shop_details
      ) shop_details
      WHERE distance <= ?
      `,
      [lat, lat, lang, radiusKm],
    );

    return rows;
  },

  async getActiveRestaurantNearbyKm() {
    const [rows] = await pool.query(
      "SELECT * FROM restaurant_nearby_km WHERE status = 1 LIMIT 1",
    );
    return rows[0] || null;
  },

  async getDriverEstimateTimes() {
    const [rows] = await pool.query(
      "SELECT * FROM driver_estimate_time ORDER BY range_km ASC",
    );
    return rows;
  },

  async getRestaurantVendorsWithRating() {
    const [rows] = await pool.query(`
      SELECT
        v.id,
        v.id AS vendor_id,
        v.name,
        v.image,
        v.about,
        v.business_name AS shop_name,
        v.business_description,
        v.restaurant_address AS shopaddress,
        v.lat,
        v.\`long\`,
        v.dining_option,
        v.minimum_delivery_time,
        v.maximum_delivery_time,

        IFNULL(ROUND(AVG(rr.rating), 1), 0.0) AS review,
        COUNT(rr.id) AS total_reviews

      FROM vendor v
      LEFT JOIN rating_review rr
        ON rr.vendor_id = v.id

      WHERE v.vendor_type = 'restaurant'
        AND v.is_kyc_approved = '1'

      GROUP BY v.id
      ORDER BY v.id DESC
    `);
    return rows;
  },

  async getVendorById(vendor_id) {
    const [rows] = await pool.query(
      "SELECT * FROM vendor WHERE id = ? LIMIT 1",
      [vendor_id],
    );
    return rows[0] || null;
  },

  // only active driver estimate rows (status = 1)
  async getActiveDriverEstimateTimes() {
    const [rows] = await pool.query(
      "SELECT * FROM driver_estimate_time WHERE status = 1 ORDER BY range_km ASC",
    );
    return rows;
  },

  async getRestaurantCartRows(userid, vendor_id) {
    const [rows] = await pool.query(
      "SELECT * FROM restaurant_cart WHERE user_id = ? AND vendor_id = ?",
      [userid, vendor_id],
    );
    return rows;
  },

  async getQuickOrderItemIds(userid, vendor_id) {
    const [rows] = await pool.query(
      "SELECT item_id FROM restaurant_quick_order WHERE user_id = ? AND vendor_id = ?",
      [userid, vendor_id],
    );
    return rows;
  },
  async getVendorAddons(vendor_id) {
    const [rows] = await pool.query(
      "SELECT id, name, price, item_id FROM vendor_addons WHERE vendor_id = ?",
      [vendor_id],
    );
    return rows;
  },

  async getRestaurantMenusByVendor(vendor_id) {
    const [rows] = await pool.query(
      `
      SELECT DISTINCT
        IFNULL(rm.id, 0) AS id,
        IFNULL(rm.name, 'Today''s Specials') AS name
      FROM restaurant_items ri
      LEFT JOIN restaurant_menu rm ON rm.id = ri.menu_id
      WHERE ri.vendor_id = ?
        AND ri.status = 1
      `,
      [vendor_id],
    );
    return rows;
  },

  async getRestaurantItemsByMenu(vendor_id, menuId) {
    const [rows] = await pool.query(
      `
      SELECT
        ri.id,
        ri.vendor_id,
        ri.name,
        ri.description,
        ri.item_image,
        ri.item_type,
        ri.unit_price,
        ri.discount_price,
        ri.sub_cat_id,
        ri.menu_id,
        IFNULL(rm.name, 'Today''s Specials') AS menu_name
      FROM restaurant_items ri
      LEFT JOIN restaurant_menu rm ON rm.id = ri.menu_id
      WHERE ri.vendor_id = ?
        AND (
          (ri.menu_id = ?)
          OR
          (? = '0' AND (ri.menu_id IS NULL OR ri.menu_id = ''))
        )
        AND ri.status = 1
      `,
      [vendor_id, String(menuId), String(menuId)],
    );
    return rows;
  },

  async getUserIdById(userid) {
    const [rows] = await pool.query(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [userid],
    );
    return rows[0] || null;
  },

  async getActiveRestaurantBanners() {
    const [rows] = await pool.query(
      `
      SELECT id, vendor_id, title, image
      FROM restaurant_banners
      WHERE status = 1
      ORDER BY id DESC
      `,
    );
    return rows;
  },
  async getVendorsByIds(vendorIds) {
    if (!vendorIds || vendorIds.length === 0) return [];

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name AS restaurant_name,
        restaurant_address,
        lat,
        \`long\`,
        minimum_delivery_time,
        maximum_delivery_time,
        business_description
      FROM vendor
      WHERE id IN (?)
      `,
      [vendorIds],
    );
    return rows;
  },

  async getVendorRatingsByIds(vendorIds) {
    if (!vendorIds || vendorIds.length === 0) return [];

    const [rows] = await pool.query(
      `
      SELECT
        vendor_id,
        IFNULL(ROUND(AVG(rating), 1), 0) AS average_rating,
        COUNT(id) AS total_reviews
      FROM user_rating_review
      WHERE vendor_id IN (?)
      GROUP BY vendor_id
      `,
      [vendorIds],
    );
    return rows;
  },

  async getAllRestaurantVendors() {
    const [rows] = await pool.query(`
      SELECT
        v.id,
        v.id AS vendor_id,
        v.name,
        v.image,
        v.about,
        v.business_name AS shop_name,
        v.business_description,
        v.restaurant_address AS shopaddress,
        v.lat,
        v.\`long\`,
        v.dining_option,
        v.minimum_delivery_time,
        v.maximum_delivery_time,

        COUNT(DISTINCT ri.id) AS total_items,

        IFNULL(ROUND(AVG(rr.rating), 1), 0.0) AS review,
        COUNT(DISTINCT rr.id) AS total_reviews

      FROM vendor v

      LEFT JOIN restaurant_items ri
        ON ri.vendor_id = v.id

      LEFT JOIN rating_review rr
        ON rr.vendor_id = v.id

      WHERE v.vendor_type = 'restaurant'
        AND v.is_kyc_approved = '1'

      GROUP BY v.id

      ORDER BY v.id DESC
    `);
    return rows;
  },

  async getCategoryNameById(category_id) {
    const [rows] = await pool.query(
      "SELECT id, category_name FROM category WHERE id = ? LIMIT 1",
      [category_id],
    );
    return rows[0] || null;
  },

  async getRestaurantSubCategories(category_id) {
    const [rows] = await pool.query(
      `
      SELECT
        sub_category.id,
        sub_category.cat_id,
        sub_category.name AS sub_category_name,
        sub_category.image,
        sub_category.status,
        category.category_name
      FROM sub_category
      LEFT JOIN category ON category.id = sub_category.cat_id
      WHERE sub_category.cat_id = ?
        AND sub_category.status = '1'
      ORDER BY sub_category.id DESC
      `,
      [category_id],
    );
    return rows;
  },

  async getVendorOfferBanners(vendor_id) {
    const [rows] = await pool.query(
      `
      SELECT
        restaurant_banners.id,
        restaurant_banners.title,
        restaurant_banners.vendor_id,
        restaurant_banners.item_id,
        restaurant_banners.image AS banner_image,
        restaurant_banners.status,
        DATE_FORMAT(restaurant_banners.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        vendor.name AS vendor_name,
        restaurant_items.name,
        restaurant_items.description,
        restaurant_items.unit_price,
        restaurant_items.discount_price AS item_discount_price,
        restaurant_items.item_type AS item_type,
        restaurant_items.sub_cat_id AS sub_cat_id,
        restaurant_items.item_image AS item_image
      FROM restaurant_banners
      LEFT JOIN vendor ON vendor.id = restaurant_banners.vendor_id
      LEFT JOIN restaurant_items ON restaurant_items.id = restaurant_banners.item_id
      WHERE restaurant_banners.vendor_id = ?
        AND restaurant_banners.status = 1
      ORDER BY restaurant_banners.id DESC
      `,
      [vendor_id],
    );
    return rows;
  },

  async getQuickOrdersByUserVendor(user_id, vendor_id) {
    const [rows] = await pool.query(
      `
      SELECT
        q.*,
        i.name AS live_item_name,
        i.item_image AS live_item_image
      FROM restaurant_quick_order q
      LEFT JOIN restaurant_items i ON i.id = q.item_id
      WHERE q.user_id = ?
        AND q.vendor_id = ?
      ORDER BY q.id DESC
      `,
      [user_id, vendor_id],
    );
    return rows;
  },
  async getVendorAddonsByIds(vendor_id, addonIds) {
    if (!addonIds || addonIds.length === 0) return [];

    const [rows] = await pool.query(
      `
      SELECT id, vendor_id, name, price
      FROM vendor_addons
      WHERE vendor_id = ?
        AND id IN (?)
      `,
      [vendor_id, addonIds],
    );
    return rows;
  },

  async deleteRestaurantCartOtherVendors(user_id, vendor_id) {
    const [result] = await pool.query(
      "DELETE FROM restaurant_cart WHERE user_id = ? AND vendor_id != ?",
      [user_id, vendor_id],
    );
    return result;
  },

  async deleteRestaurantCartItem(user_id, vendor_id, item_id) {
    const [result] = await pool.query(
      "DELETE FROM restaurant_cart WHERE user_id = ? AND vendor_id = ? AND item_id = ?",
      [user_id, vendor_id, item_id],
    );
    return result;
  },

  async getRestaurantItemById(item_id) {
    const [rows] = await pool.query(
      "SELECT * FROM restaurant_items WHERE id = ? LIMIT 1",
      [item_id],
    );
    return rows[0] || null;
  },
  async getItemAddonsByIds(vendor_id, item_id, addonIds) {
    if (!addonIds || addonIds.length === 0) return [];

    const [rows] = await pool.query(
      `
      SELECT id, name, price
      FROM vendor_addons
      WHERE vendor_id = ?
        AND item_id = ?
        AND id IN (?)
      `,
      [vendor_id, item_id, addonIds],
    );
    return rows;
  },
  async getRestaurantCartItem(user_id, vendor_id, item_id) {
    const [rows] = await pool.query(
      "SELECT * FROM restaurant_cart WHERE user_id = ? AND vendor_id = ? AND item_id = ? LIMIT 1",
      [user_id, vendor_id, item_id],
    );
    return rows[0] || null;
  },

  async updateRestaurantCartById(id, { quantity, price, total_price, addons }) {
    const [result] = await pool.query(
      "UPDATE restaurant_cart SET quantity = ?, price = ?, total_price = ?, addons = ? WHERE id = ?",
      [quantity, price, total_price, addons, id],
    );
    return result;
  },

  async insertRestaurantCart({
    user_id,
    vendor_id,
    item_id,
    quantity,
    price,
    total_price,
    addons,
  }) {
    const [result] = await pool.query(
      `
      INSERT INTO restaurant_cart
        (user_id, vendor_id, item_id, quantity, price, total_price, addons)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [user_id, vendor_id, item_id, quantity, price, total_price, addons],
    );
    return result.insertId;
  },

  async getRestaurantCartById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM restaurant_cart WHERE id = ? LIMIT 1",
      [id],
    );
    return rows[0] || null;
  },

  async getItemForAddons(item_id) {
    const [rows] = await pool.query(
      `
      SELECT id, vendor_id, name, unit_price, discount_price, description, item_image
      FROM restaurant_items
      WHERE id = ?
      LIMIT 1
      `,
      [item_id],
    );
    return rows[0] || null;
  },

  async getLatestRestaurantCartForItem(user_id, item_id) {
    const [rows] = await pool.query(
      `
      SELECT id, user_id, item_id, addons, quantity
      FROM restaurant_cart
      WHERE user_id = ?
        AND item_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [user_id, item_id],
    );
    return rows[0] || null;
  },

  async getAddonGroupsByItemId(item_id) {
    const [rows] = await pool.query(
      `
      SELECT id, item_id, title, is_required, type
      FROM vendor_addon_groups
      WHERE item_id = ?
      ORDER BY id ASC
      `,
      [item_id],
    );
    return rows;
  },

  async getAddonsByGroupIds(item_id, groupIds) {
    if (!groupIds || groupIds.length === 0) return [];

    const [rows] = await pool.query(
      `
      SELECT id, group_id, item_id, name, price, image
      FROM vendor_addons
      WHERE item_id = ?
        AND group_id IN (?)
      ORDER BY id ASC
      `,
      [item_id, groupIds],
    );
    return rows;
  },

  async getItemByIdAndVendor(item_id, vendor_id) {
    const [rows] = await pool.query(
      "SELECT * FROM restaurant_items WHERE id = ? AND vendor_id = ? LIMIT 1",
      [item_id, vendor_id],
    );
    return rows[0] || null;
  },

  async getQuickOrderRow(user_id, vendor_id, item_id) {
    const [rows] = await pool.query(
      "SELECT * FROM restaurant_quick_order WHERE user_id = ? AND vendor_id = ? AND item_id = ? LIMIT 1",
      [user_id, vendor_id, item_id],
    );
    return rows[0] || null;
  },
  async deleteQuickOrderById(id) {
    const [result] = await pool.query(
      "DELETE FROM restaurant_quick_order WHERE id = ?",
      [id],
    );
    return result;
  },
  async insertQuickOrder(data) {
    const [result] = await pool.query(
      "INSERT INTO restaurant_quick_order SET ?",
      [data],
    );
    return result.insertId;
  },
  async removeRestaurantCoupon(userid) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      await conn.query(
        "UPDATE restaurant_cart SET coupon_applied = 0, coupon_id = NULL WHERE user_id = ?",
        [userid],
      );

      await conn.query(
        "DELETE FROM restaurant_apply_coupan WHERE user_id = ?",
        [userid],
      );

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async getRestaurantCartByUser(userid) {
    const [rows] = await pool.query(
      "SELECT * FROM restaurant_cart WHERE user_id = ?",
      [userid],
    );
    return rows;
  },
  async getRestaurantCouponById(id) {
    const [rows] = await pool.query(
      `
      SELECT
        rc.*,
        CAST(rc.created_at AS CHAR) AS created_at_raw,
        CAST(rc.expired_at AS CHAR) AS expired_at_raw
      FROM restaurant_coupon rc
      WHERE rc.id = ?
      LIMIT 1
      `,
      [id],
    );
    return rows[0] || null;
  },

  async getRestaurantCouponByCode(code) {
    const [rows] = await pool.query(
      `
      SELECT
        rc.*,
        CAST(rc.created_at AS CHAR) AS created_at_raw,
        CAST(rc.expired_at AS CHAR) AS expired_at_raw
      FROM restaurant_coupon rc
      WHERE rc.code = ?
      LIMIT 1
      `,
      [code],
    );
    return rows[0] || null;
  },

  async incrementRestaurantCouponUsed(id) {
    const [result] = await pool.query(
      "UPDATE restaurant_coupon SET used_count = used_count + 1 WHERE id = ?",
      [id],
    );
    return result;
  },

  async getRestaurantAppliedCoupon(userid, coupon_id) {
    const [rows] = await pool.query(
      "SELECT * FROM restaurant_apply_coupan WHERE user_id = ? AND coupan_id = ?",
      [userid, coupon_id],
    );
    return rows;
  },

  // delete old applied coupon, save the new one, mark the cart (one transaction)
  async applyRestaurantCoupon(userid, coupon_id, code) {
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      await conn.query(
        "DELETE FROM restaurant_apply_coupan WHERE user_id = ?",
        [userid],
      );

      await conn.query(
        "INSERT INTO restaurant_apply_coupan (user_id, coupan_id, code, status) VALUES (?, ?, ?, ?)",
        [userid, coupon_id, code, 1],
      );

      await conn.query(
        "UPDATE restaurant_cart SET coupon_applied = 1, coupon_id = ? WHERE user_id = ?",
        [coupon_id, userid],
      );

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },
};

module.exports = UserModel;
