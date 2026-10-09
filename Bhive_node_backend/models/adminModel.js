const pool = require("../config/db");
const jwt = require("jsonwebtoken");

const AdminModel = {
  //LOGIN
  async login(email, password) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM admin
      WHERE admin_email = ?
      AND admin_password = ?
      LIMIT 1
      `,
      [email, password],
    );

    if (rows.length === 0) {
      const error = new Error("Invalid User and password.");
      error.statusCode = 401;
      throw error;
    }

    const admin = rows[0];

    if (String(admin.admin_status) === "0") {
      const error = new Error("Your account currently inactive.");
      error.statusCode = 403;
      throw error;
    }

    const permission = admin.type === "super_admin" ? "all" : admin.permission;

    const user = {
      admin_name: admin.admin_name,
      admin_email: admin.admin_email,
      logged_in: true,
      role: admin.type,
      admin_id: admin.admin_id,
      admin_type_id: admin.admin_type_id,
      lang_id: "2",
      admin_image: admin.admin_image,
      permission,
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    return {
      token,
      user,
    };
  },
  // =====================================================
  // SERVICE MODELS
  // =====================================================

  // -----------------------------------------
  // SUB ADMIN MANAGEMENT
  // -----------------------------------------
  async getSubAdmins() {
    const [rows] = await pool.execute(`
      SELECT
        admin.*,
        roles.id AS role_table_id,
        roles.role_name
      FROM admin
      LEFT JOIN roles
        ON roles.id = admin.role_id
      WHERE admin.type = 'sub_admin'
      ORDER BY admin.admin_id DESC
    `);

    return rows;
  },

  async changeSubAdminStatus(id) {
    const [admins] = await pool.execute(
      "SELECT admin_id, admin_status FROM admin WHERE admin_id = ? LIMIT 1",
      [id],
    );

    if (admins.length === 0) {
      return {
        success: false,
        message: "Admin not found",
      };
    }

    const currentStatus = Number(admins[0].admin_status);
    const newStatus = currentStatus === 1 ? 0 : 1;

    await pool.execute("UPDATE admin SET admin_status = ? WHERE admin_id = ?", [
      newStatus,
      id,
    ]);

    const statusText = newStatus === 1 ? "activated" : "deactivated";

    return {
      success: true,
      message: `Admin has been ${statusText} successfully`,
      status: newStatus,
    };
  },

  async saveSubAdmin({
    admin_name,
    admin_email,
    admin_password,
    permission,
    role_id,
    employee_since,
  }) {
    const [existingAdmin] = await pool.execute(
      "SELECT admin_id FROM admin WHERE admin_email = ? LIMIT 1",
      [admin_email],
    );

    if (existingAdmin.length > 0) {
      return {
        success: false,
        message: "Email already exists",
      };
    }

    // Convert permission array into comma-separated string
    const permissionString = Array.isArray(permission)
      ? permission.join(",")
      : "";

    if (!permissionString) {
      return {
        success: false,
        message: "Please select at least one permission",
      };
    }

    // Prepare data
    const data = [
      admin_name,
      admin_email,
      admin_password,
      "sub_admin",
      role_id,
      permissionString,
      employee_since || null,
    ];

    // Insert
    const [result] = await pool.execute(
      `
      INSERT INTO admin
      (
        admin_name,
        admin_email,
        admin_password,
        type,
        role_id,
        permission,
        employee_since
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      data,
    );

    return {
      success: true,
      message: "Sub Admin added successfully.",
      admin_id: result.insertId,
    };
  },

  async getSubAdminById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        admin.*,
        roles.id AS role_table_id,
        roles.role_name
      FROM admin
      LEFT JOIN roles
        ON roles.id = admin.role_id
      WHERE admin.admin_id = ?
        AND admin.type = 'sub_admin'
      LIMIT 1
      `,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  },

  async updateSubAdmin(id, data) {
    const {
      admin_name,
      admin_email,
      admin_password,
      permission,
      role_id,
      employee_since,
    } = data;

    // Check admin exists
    const [admins] = await pool.execute(
      `
      SELECT admin_id
      FROM admin
      WHERE admin_id = ?
        AND type = 'sub_admin'
      LIMIT 1
      `,
      [id],
    );

    if (admins.length === 0) {
      return {
        success: false,
        message: "Sub Admin not found",
      };
    }

    // Check email already belongs to another admin
    const [emailExists] = await pool.execute(
      `
      SELECT admin_id
      FROM admin
      WHERE admin_email = ?
        AND admin_id != ?
      LIMIT 1
      `,
      [admin_email, id],
    );

    if (emailExists.length > 0) {
      return {
        success: false,
        message: "Email already exists",
      };
    }

    const permissionString = Array.isArray(permission)
      ? permission.join(",")
      : permission;

    if (!permissionString) {
      return {
        success: false,
        message: "Please select at least one permission",
      };
    }

    const updateData = {
      admin_name,
      admin_email,
      permission: permissionString,
      role_id,
    };

    // Only update password if provided
    if (admin_password && admin_password.trim() !== "") {
      updateData.admin_password = admin_password;
    }

    // Only update employee_since when provided
    if (employee_since && employee_since !== "0000-00-00") {
      updateData.employee_since = employee_since;
    }

    const fields = [];
    const values = [];

    Object.entries(updateData).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });

    values.push(id);

    await pool.execute(
      `
      UPDATE admin
      SET ${fields.join(", ")}
      WHERE admin_id = ?
        AND type = 'sub_admin'
      `,
      values,
    );

    return {
      success: true,
      message: "Sub Admin updated successfully.",
    };
  },

  async deleteSubAdmin(adminId) {
    // Check whether Sub Admin exists
    const [subAdmin] = await pool.execute(
      `
      SELECT admin_id
      FROM admin
      WHERE admin_id = ?
        AND type = 'sub_admin'
      LIMIT 1
      `,
      [adminId],
    );

    if (subAdmin.length === 0) {
      return {
        success: false,
        message: "Sub Admin not found",
      };
    }

    // Delete Sub Admin
    const [result] = await pool.execute(
      `
      DELETE FROM admin
      WHERE admin_id = ?
        AND type = 'sub_admin'
      `,
      [adminId],
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "Failed to delete Sub Admin",
      };
    }

    return {
      success: true,
      message: "Sub Admin deleted successfully",
    };
  },

  // -----------------------------------------
  // ROLE MANAGEMENT
  // -----------------------------------------

  async getRoles() {
    const [rows] = await pool.execute(`
      SELECT *
      FROM roles
      ORDER BY id DESC
    `);

    return rows;
  },

  async addRole({ role_name, responsibilities, status }) {
    // Check if role already exists
    const [existingRole] = await pool.execute(
      `
      SELECT id
      FROM roles
      WHERE role_name = ?
      LIMIT 1
      `,
      [role_name],
    );

    if (existingRole.length > 0) {
      return {
        success: false,
        message: "Role already exists",
      };
    }

    // Insert role
    const [result] = await pool.execute(
      `
      INSERT INTO roles
      (
        role_name,
        responsibilities,
        status,
        created_at
      )
      VALUES (?, ?, ?, NOW())
      `,
      [role_name, responsibilities || "", status ?? 1],
    );

    return {
      success: true,
      message: "Role added successfully",
      role_id: result.insertId,
    };
  },

  async updateRoleStatus(id, status) {
    if (!id) {
      return {
        success: false,
        message: "Invalid ID",
      };
    }

    const [result] = await pool.execute(
      "UPDATE roles SET status = ? WHERE id = ?",
      [status, id],
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "Failed to update status",
      };
    }

    return {
      success: true,
      message: "Status updated successfully",
    };
  },

  async updateRole(id, { role_name, responsibilities }) {
    // Check if role exists
    const [roles] = await pool.execute(
      "SELECT id, status FROM roles WHERE id = ? LIMIT 1",
      [id],
    );

    if (roles.length === 0) {
      return {
        success: false,
        message: "Role not found",
      };
    }

    // Check duplicate role name
    const [existingRole] = await pool.execute(
      "SELECT id FROM roles WHERE role_name = ? AND id != ? LIMIT 1",
      [role_name, id],
    );

    if (existingRole.length > 0) {
      return {
        success: false,
        message: "Role name already exists",
      };
    }

    // Preserve existing status
    const currentStatus = roles[0].status;

    const [result] = await pool.execute(
      `UPDATE roles
       SET role_name = ?, responsibilities = ?, status = ?
       WHERE id = ?`,
      [role_name, responsibilities || "", currentStatus, id],
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "Failed to update role",
      };
    }

    return {
      success: true,
      message: "Role updated successfully",
    };
  },

  async deleteRole(id) {
    if (!id) {
      return {
        status: "error",
        message: "Invalid ID",
      };
    }

    const [result] = await pool.query("DELETE FROM roles WHERE id = ?", [id]);

    if (result.affectedRows > 0) {
      return {
        status: "success",
        message: "Role deleted successfully",
      };
    }

    return {
      status: "error",
      message: "Failed to delete role",
    };
  },

  // =====================================================
  // RESTAURANT MODELS
  // =====================================================

  // -----------------------------------------
  // RESTAURANT-DASHBOARD
  // -----------------------------------------
  async getDashboardData() {
    const data = {};

    // Total items
    const [totalItemsResult] = await pool.query(`
      SELECT COUNT(*) AS total_items
      FROM restaurant_items
    `);

    data.total_items = totalItemsResult[0].total_items;

    // Total restaurants
    const [restaurantResult] = await pool.query(`
      SELECT COUNT(*) AS restaurant
      FROM vendor
      WHERE vendor_type = 'restaurant'
    `);

    data.restaurant = restaurantResult[0].restaurant;

    // Today's item count
    const [itemCountResult] = await pool.query(`
      SELECT COUNT(*) AS itemCount
      FROM restaurant_items
      WHERE DATE(created_at) = CURDATE()
    `);

    data.itemCount = itemCountResult[0].itemCount;

    // Current year date range
    const [yearResult] = await pool.query(`
      SELECT
        CONCAT(YEAR(CURDATE()), '-01-01') AS year_start,
        CONCAT(YEAR(CURDATE()), '-12-31') AS year_end
    `);

    const yearStart = yearResult[0].year_start;
    const yearEnd = yearResult[0].year_end;

    // Total orders - this year
    const [orderCountResult] = await pool.query(
      `
        SELECT COUNT(*) AS orderCount
        FROM retsaurant_orders
        WHERE DATE(created_at) >= ?
          AND DATE(created_at) <= ?
      `,
      [yearStart, yearEnd],
    );

    data.orderCount = orderCountResult[0].orderCount;

    // Delivered orders - this year
    const [deliveredOrderResult] = await pool.query(
      `
        SELECT COUNT(*) AS deliveredOrder
        FROM retsaurant_orders
        WHERE order_status = 'Delivered'
          AND DATE(created_at) >= ?
          AND DATE(created_at) <= ?
      `,
      [yearStart, yearEnd],
    );

    data.deliveredOrder = deliveredOrderResult[0].deliveredOrder;

    // Total earning
    const [earningResult] = await pool.query(`
      SELECT SUM(amount) AS totalEarning
      FROM restaurant_payment_details
    `);

    data.totalEarning =
      earningResult[0].totalEarning !== null
        ? earningResult[0].totalEarning
        : 0;

    // All order status counts - this year
    const statuses = [
      "Pending",
      "Accepted",
      "Cancelled",
      "Preparing",
      "Ready_for_pickup",
      "Picked_up",
      "On_the_way",
      "Delivered",
      "Rejected",
    ];

    for (const status of statuses) {
      const key = status.toLowerCase() + "_count";

      const [result] = await pool.query(
        `
          SELECT COUNT(*) AS count
          FROM retsaurant_orders
          WHERE order_status = ?
            AND DATE(created_at) >= ?
            AND DATE(created_at) <= ?
        `,
        [status, yearStart, yearEnd],
      );

      data[key] = result[0].count;
    }

    return data;
  },

  // DATE RANGE
  getDateRange(filter) {
    if (filter === "this_year") {
      return {
        start: "01-01",
        end: "12-31",
      };
    }

    if (filter === "this_month") {
      return {
        start: "month_start",
        end: "month_end",
      };
    }

    if (filter === "this_week") {
      return {
        start: "week_start",
        end: "week_end",
      };
    }

    return {
      start: "01-01",
      end: "12-31",
    };
  },

  // ORDER STATS
  async getOrderStats(filter) {
    const statuses = [
      "Pending",
      "Accepted",
      "Cancelled",
      "Preparing",
      "Ready_for_pickup",
      "Picked_up",
      "On_the_way",
      "Delivered",
      "Rejected",
    ];

    let startDate;
    let endDate;

    if (filter === "this_year" || !filter) {
      const [result] = await pool.query(`
        SELECT
          CONCAT(YEAR(CURDATE()), '-01-01') AS start_date,
          CONCAT(YEAR(CURDATE()), '-12-31') AS end_date
      `);

      startDate = result[0].start_date;
      endDate = result[0].end_date;
    } else if (filter === "this_month") {
      const [result] = await pool.query(`
        SELECT
          DATE_FORMAT(CURDATE(), '%Y-%m-01') AS start_date,
          LAST_DAY(CURDATE()) AS end_date
      `);

      startDate = result[0].start_date;
      endDate = result[0].end_date;
    } else if (filter === "this_week") {
      const [result] = await pool.query(`
        SELECT
          DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AS start_date,
          DATE_ADD(
            DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY),
            INTERVAL 6 DAY
          ) AS end_date
      `);

      startDate = result[0].start_date;
      endDate = result[0].end_date;
    } else {
      const [result] = await pool.query(`
        SELECT
          CONCAT(YEAR(CURDATE()), '-01-01') AS start_date,
          CONCAT(YEAR(CURDATE()), '-12-31') AS end_date
      `);

      startDate = result[0].start_date;
      endDate = result[0].end_date;
    }

    const counts = {};

    for (const status of statuses) {
      const [result] = await pool.query(
        `
          SELECT COUNT(*) AS count
          FROM retsaurant_orders
          WHERE order_status = ?
            AND DATE(created_at) >= ?
            AND DATE(created_at) <= ?
        `,
        [status, startDate, endDate],
      );

      counts[status.toLowerCase()] = result[0].count;
    }

    // Total orders
    const [totalOrdersResult] = await pool.query(
      `
        SELECT COUNT(*) AS total_orders
        FROM retsaurant_orders
        WHERE DATE(created_at) >= ?
          AND DATE(created_at) <= ?
      `,
      [startDate, endDate],
    );

    counts.total_orders = totalOrdersResult[0].total_orders;

    // Delivered orders
    const [deliveredOrdersResult] = await pool.query(
      `
        SELECT COUNT(*) AS delivered_orders
        FROM retsaurant_orders
        WHERE order_status = 'Delivered'
          AND DATE(created_at) >= ?
          AND DATE(created_at) <= ?
      `,
      [startDate, endDate],
    );

    counts.delivered_orders = deliveredOrdersResult[0].delivered_orders;

    return {
      result: true,
      counts,
    };
  },

  // SALES CHART
  async getSalesChartData(filter) {
    const labels = [];
    const values = [];

    if (filter === "this_year") {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      for (let month = 1; month <= 12; month++) {
        const [result] = await pool.query(
          `
            SELECT SUM(amount) AS amount
            FROM restaurant_payment_details
            WHERE YEAR(created_at) = YEAR(CURDATE())
              AND MONTH(created_at) = ?
          `,
          [month],
        );

        const amount = result[0].amount !== null ? Number(result[0].amount) : 0;

        labels.push(monthNames[month - 1]);
        values.push(Number(amount.toFixed(2)));
      }
    } else if (filter === "this_month") {
      const [daysResult] = await pool.query(`
        SELECT DAY(LAST_DAY(CURDATE())) AS days
      `);

      const days = Number(daysResult[0].days);

      const [monthResult] = await pool.query(`
        SELECT DATE_FORMAT(CURDATE(), '%b') AS month
      `);

      const monthShort = monthResult[0].month;

      for (let day = 1; day <= days; day++) {
        const [result] = await pool.query(
          `
            SELECT SUM(amount) AS amount
            FROM restaurant_payment_details
            WHERE DATE(created_at) = STR_TO_DATE(
              CONCAT(
                DATE_FORMAT(CURDATE(), '%Y-%m-'),
                LPAD(?, 2, '0')
              ),
              '%Y-%m-%d'
            )
          `,
          [day],
        );

        const amount = result[0].amount !== null ? Number(result[0].amount) : 0;

        labels.push(`${day} ${monthShort}`);
        values.push(Number(amount.toFixed(2)));
      }
    } else if (filter === "this_week") {
      for (let i = 6; i >= 0; i--) {
        const [result] = await pool.query(
          `
            SELECT
              DATE_FORMAT(
                DATE_SUB(CURDATE(), INTERVAL ? DAY),
                '%Y-%m-%d'
              ) AS day_date,
              DATE_FORMAT(
                DATE_SUB(CURDATE(), INTERVAL ? DAY),
                '%a %d'
              ) AS day_label
          `,
          [i, i],
        );

        const dayDate = result[0].day_date;
        const dayLabel = result[0].day_label;

        const [amountResult] = await pool.query(
          `
            SELECT SUM(amount) AS amount
            FROM restaurant_payment_details
            WHERE DATE(created_at) = ?
          `,
          [dayDate],
        );

        const amount =
          amountResult[0].amount !== null ? Number(amountResult[0].amount) : 0;

        labels.push(dayLabel);
        values.push(Number(amount.toFixed(2)));
      }
    }

    const grandTotal = values.reduce((sum, value) => sum + value, 0);

    return {
      result: true,
      labels,
      values,
      grand_total: grandTotal.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  },

  // -----------------------------------------
  // RESTAURANT-STORE MANAGEMENT
  // -----------------------------------------

  // GET PENDING RESTAURANT STORES
  async getPendingStores() {
    const [rows] = await pool.execute(
      `
        SELECT
            vendor.*,
            category.category_name AS category_name,
            city_list.city_name AS city_name
        FROM vendor
        LEFT JOIN category
            ON category.id = vendor.cat_id
        LEFT JOIN city_list
            ON city_list.id = vendor.city_id
        WHERE vendor.vendor_type = ?
        AND vendor.is_kyc_approved = ?
        ORDER BY vendor.id DESC
        `,
      ["restaurant", "0"],
    );

    return rows;
  },

  // GET ADD STORE CITIES
  async getAddStoreCities() {
    const [rows] = await pool.execute(`
        SELECT *
        FROM city_list
    `);

    return rows;
  },

  // CHECK EMAIL EXISTS
  async checkAddStoreEmailExists(email) {
    const [rows] = await pool.execute(
      `
        SELECT id
        FROM vendor
        WHERE email_id = ?
        LIMIT 1
        `,
      [email],
    );

    return rows.length > 0;
  },

  // INSERT RESTAURANT STORE
  async insertStore(data) {
    const [result] = await pool.execute(
      `
        INSERT INTO vendor (
            business_name,
            hst_number,
            cat_id,
            dining_option,
            minimum_delivery_time,
            maximum_delivery_time,
            delivery_time_type,
            business_description,
            lat,
            \`long\`,
            restaurant_address,
            name,
            email_id,
            password,
            mobile,
            city_id,
            image,
            id_proof,
            id_proof_two,
            pad_file,
            vendor_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        data.business_name,
        data.hst_number,
        data.cat_id,
        data.dining_option,
        data.minimum_delivery_time,
        data.maximum_delivery_time,
        data.delivery_time_type,
        data.business_description,
        data.lat,
        data.long,
        data.restaurant_address,
        data.name,
        data.email_id,
        data.password,
        data.mobile,
        data.city_id,
        data.image,
        data.id_proof,
        data.id_proof_two,
        data.pad_file,
        data.vendor_type,
      ],
    );

    return result.insertId;
  },

  async countTotalStores() {
    const [rows] = await pool.execute(
      `
        SELECT COUNT(*) AS total
        FROM vendor
        WHERE vendor_type = 'restaurant'
        `,
    );

    return rows[0].total;
  },

  async countActiveStores() {
    const [rows] = await pool.execute(
      `
        SELECT COUNT(*) AS total
        FROM vendor
        WHERE vendor_type = 'restaurant'
        AND is_kyc_approved = '1'
        `,
    );

    return rows[0].total;
  },

  async countInactiveStores() {
    const [rows] = await pool.execute(
      `
        SELECT COUNT(*) AS total
        FROM vendor
        WHERE vendor_type = 'restaurant'
        AND is_kyc_approved = '0'
        `,
    );

    return rows[0].total;
  },

  async countNewStores() {
    const [rows] = await pool.execute(
      `
        SELECT COUNT(*) AS total
        FROM vendor
        WHERE vendor_type = 'restaurant'
        AND created_id >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `,
    );

    return rows[0].total;
  },

  async getAllStoresApprove() {
    const [rows] = await pool.execute(
      `
        SELECT
            vendor.*,
            category.category_name AS category_name,
            city_list.city_name AS city_name
        FROM vendor
        LEFT JOIN category
            ON category.id = vendor.cat_id
        LEFT JOIN city_list
            ON city_list.id = vendor.city_id
        WHERE vendor.vendor_type = 'restaurant'
        AND vendor.is_kyc_approved = '1'
        ORDER BY vendor.id DESC
        `,
    );

    return rows;
  },

  async getStoreById(id) {
    const [rows] = await pool.execute(
      `
        SELECT
            vendor.*,
            category.category_name AS category_name,
            city_list.city_name AS city_name
        FROM vendor
        LEFT JOIN category
            ON category.id = vendor.cat_id
        LEFT JOIN city_list
            ON city_list.id = vendor.city_id
        WHERE vendor.vendor_type = 'restaurant'
        AND vendor.id = ?
        `,
      [id],
    );

    return rows[0] || null;
  },

  async searchStores(keyword) {
    const search = `%${keyword}%`;

    const [rows] = await pool.execute(
      `
        SELECT
            vendor.*,
            category.category_name AS category_name,
            city_list.city_name AS city_name
        FROM vendor
        LEFT JOIN category
            ON category.id = vendor.cat_id
        LEFT JOIN city_list
            ON city_list.id = vendor.city_id
        WHERE vendor.vendor_type = 'restaurant'
        AND (
            vendor.business_name LIKE ?
            OR vendor.name LIKE ?
            OR vendor.email_id LIKE ?
            OR vendor.mobile LIKE ?
        )
        ORDER BY vendor.id DESC
        `,
      [search, search, search, search],
    );

    return rows;
  },

  // CHECK EMAIL EXISTS FOR STORE LIST
  async checkStoreListEmailExists(email, id) {
    const [rows] = await pool.execute(
      `
        SELECT id
        FROM vendor
        WHERE id != ?
        AND email_id = ?
        LIMIT 1
        `,
      [id, email],
    );

    return rows.length > 0;
  },

  async updateVendor(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach((key) => {
      if (key === "long") {
        fields.push("`long` = ?");
      } else {
        fields.push(`${key} = ?`);
      }

      values.push(data[key]);
    });

    if (fields.length === 0) {
      return false;
    }

    values.push(id);

    const [result] = await pool.execute(
      `
        UPDATE vendor
        SET ${fields.join(", ")}
        WHERE id = ?
        AND vendor_type = 'restaurant'
        `,
      values,
    );

    return result.affectedRows > 0;
  },

  async updateVendorAddress(vendorId, data) {
    const [result] = await pool.execute(
      `
        UPDATE vendor_address
        SET lat = ?,
            \`long\` = ?,
            address = ?
        WHERE vendor_id = ?
        `,
      [data.lat, data.long, data.address, vendorId],
    );

    return result;
  },

  async deleteStore(id) {
    const [result] = await pool.execute(
      `
        DELETE FROM vendor
        WHERE vendor_type = 'restaurant'
        AND id = ?
        `,
      [id],
    );

    return result.affectedRows > 0;
  },

  async bulkDeleteStores(ids) {
    if (!ids || ids.length === 0) {
      return 0;
    }

    const placeholders = ids.map(() => "?").join(",");

    const [result] = await pool.execute(
      `
        DELETE FROM vendor
        WHERE vendor_type = 'restaurant'
        AND id IN (${placeholders})
        `,
      ids,
    );

    return result.affectedRows;
  },

  async getStoreListCities() {
    const [rows] = await pool.execute(`
    SELECT
      id,
      state_id,
      city_name
    FROM city_list
    WHERE status = '1'
    ORDER BY city_name ASC
  `);

    return rows;
  },

  // GET STORE ORDERS
  async getStoreOrders(storeId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM retsaurant_orders
      WHERE vendor_id = ?
      ORDER BY id DESC
    `,
      [storeId],
    );

    return rows;
  },

  // GET NEARBY KM
  async getNearbyKm() {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        nearby_km,
        status,
        created_at,
        updated_at
      FROM restaurant_nearby_km
      WHERE id = 1
      LIMIT 1
    `,
    );
    if (rows.length === 0) {
      await pool.execute(
        `
        INSERT INTO restaurant_nearby_km
        (
          id,
          nearby_km,
          status,
          created_at
        )
        VALUES (?, ?, ?, NOW())
      `,
        [1, 5.0, 1],
      );

      const [newRows] = await pool.execute(
        `
        SELECT
          id,
          nearby_km,
          status,
          created_at,
          updated_at
        FROM restaurant_nearby_km
        WHERE id = 1
        LIMIT 1
      `,
      );
      return newRows[0];
    }
    return rows[0];
  },

  // UPDATE NEARBY KM
  async updateNearbyKm(nearbyKm, status) {
    const [rows] = await pool.execute(
      `
      SELECT id
      FROM restaurant_nearby_km
      WHERE id = 1
      LIMIT 1
    `,
    );

    if (rows.length > 0) {
      await pool.execute(
        `
        UPDATE restaurant_nearby_km
        SET
          nearby_km = ?,
          status = ?,
          updated_at = NOW()
        WHERE id = 1
      `,
        [nearbyKm, status],
      );
      return "updated";
    }
    await pool.execute(
      `
      INSERT INTO restaurant_nearby_km
      (
        id,
        nearby_km,
        status,
        created_at
      )
      VALUES (?, ?, ?, NOW())
    `,
      [1, nearbyKm, status],
    );
    return "created";
  },

  // -----------------------------------------
  // RESTAURANT-COUPON MANAGEMENT
  // -----------------------------------------

  // GET ALL COUPONS
  async getAllCoupons() {
    const [rows] = await pool.execute(`
    SELECT
      id,
      usage_limit,
      category_ids,
      vendor_ids,
      product_ids,
      title,
      code,
      cupon_price,
      description,
      created_at,
      expired_at,
      user_type,
      discount_type,
      used_count,
      status,
      updated_at
    FROM restaurant_coupon
    ORDER BY id DESC
  `);

    return rows.map((row) => {
      let discountType = row.discount_type || "amount";
      let discountPrice = row.cupon_price;

      if (
        typeof row.cupon_price === "string" &&
        row.cupon_price.includes("%")
      ) {
        discountType = "percent";
        discountPrice = row.cupon_price.replace(/%$/, "");
      }

      return {
        ...row,
        discount_type: discountType,
        discount_price: discountPrice,
        min_order_amount: 0,
        max_discount_amount: "",
        status:
          row.status !== undefined && row.status !== null ? row.status : 1,
      };
    });
  },

  // UPDATE COUPON STATUS
  async updateCouponStatus(id, status) {
    const [result] = await pool.execute(
      `
      UPDATE restaurant_coupon
      SET status = ?, updated_at = NOW()
      WHERE id = ?
    `,
      [status, id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Coupon not found.");
    }

    return result;
  },

  // GET COUPON BY ID
  async getCouponById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        usage_limit,
        category_ids,
        vendor_ids,
        product_ids,
        title,
        code,
        cupon_price,
        description,
        created_at,
        expired_at,
        user_type,
        discount_type,
        used_count,
        status,
        updated_at
      FROM restaurant_coupon
      WHERE id = ?
      LIMIT 1
    `,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];

    let discountType = row.discount_type || "amount";
    let discountPrice = row.cupon_price;

    if (typeof row.cupon_price === "string" && row.cupon_price.includes("%")) {
      discountType = "percent";
      discountPrice = row.cupon_price.replace(/%$/, "");
    }

    return {
      ...row,
      discount_type: discountType,
      discount_price: discountPrice,
      min_order_amount: 0,
      max_discount_amount: "",
      status: row.status !== undefined && row.status !== null ? row.status : 1,
    };
  },

  // GET CATEGORIES BY IDS
  async getCategoriesByIds(ids) {
    const idArray = ids
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id);

    if (idArray.length === 0) {
      return [];
    }

    const placeholders = idArray.map(() => "?").join(",");

    const [rows] = await pool.execute(
      `
      SELECT id, category_name
      FROM category
      WHERE id IN (${placeholders})
    `,
      idArray,
    );

    return rows;
  },

  // GET VENDORS BY IDS
  async getVendorsByIds(ids) {
    const idArray = ids
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id);

    if (idArray.length === 0) {
      return [];
    }

    const placeholders = idArray.map(() => "?").join(",");

    const [rows] = await pool.execute(
      `
      SELECT id, name
      FROM vendor
      WHERE id IN (${placeholders})
    `,
      idArray,
    );

    return rows;
  },

  // GET PRODUCTS BY IDS
  async getProductsByIds(ids) {
    const idArray = ids
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id);

    if (idArray.length === 0) {
      return [];
    }

    const placeholders = idArray.map(() => "?").join(",");

    const [rows] = await pool.execute(
      `
      SELECT id, name
      FROM restaurant_items
      WHERE id IN (${placeholders})
    `,
      idArray,
    );

    return rows;
  },

  // DELETE COUPON
  async deleteCoupon(id) {
    const [result] = await pool.execute(
      `
      DELETE FROM restaurant_coupon
      WHERE id = ?
    `,
      [id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Coupon not found.");
    }

    return result;
  },

  // DELETE SELECTED COUPONS
  async deleteSelectedCoupons(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("No coupons selected.");
    }

    const placeholders = ids.map(() => "?").join(",");

    const [result] = await pool.execute(
      `
      DELETE FROM restaurant_coupon
      WHERE id IN (${placeholders})
    `,
      ids,
    );

    return result;
  },

  // GET ADD COUPON DATA
  async getAddCouponData() {
    const [categories] = await pool.execute(
      `
      SELECT
        id,
        category_name
      FROM category
      WHERE id = 118
    `,
    );

    const [vendors] = await pool.execute(
      `
      SELECT
        id,
        name,
        cat_id
      FROM vendor
      WHERE cat_id = 118
    `,
    );

    let products = [];

    const vendorIds = vendors.map((vendor) => vendor.id);

    if (vendorIds.length > 0) {
      const placeholders = vendorIds.map(() => "?").join(",");

      const [productRows] = await pool.execute(
        `
        SELECT
          id,
          vendor_id,
          name
        FROM restaurant_items
        WHERE vendor_id IN (${placeholders})
      `,
        vendorIds,
      );

      products = productRows;
    }

    return {
      categories,
      vendors,
      products,
    };
  },

  // ADD RESTAURANT COUPON
  async addCoupon(data) {
    const [result] = await pool.execute(
      `
      INSERT INTO restaurant_coupon (
        title,
        code,
        cupon_price,
        discount_type,
        description,
        expired_at,
        usage_limit,
        used_count,
        user_type,
        category_ids,
        vendor_ids,
        product_ids,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        data.title,
        data.code,
        data.cupon_price,
        data.discount_type,
        data.description,
        data.expired_at,
        data.usage_limit,
        data.used_count,
        data.user_type,
        data.category_ids,
        data.vendor_ids,
        data.product_ids,
        data.status,
        data.created_at,
        data.updated_at,
      ],
    );

    return result;
  },

  // GET COUPON EDIT DATA
  async getCouponEditData(id) {
    const [couponRows] = await pool.execute(
      `
      SELECT
        id,
        usage_limit,
        category_ids,
        vendor_ids,
        product_ids,
        title,
        code,
        cupon_price,
        description,
        created_at,
        expired_at,
        user_type,
        discount_type,
        used_count,
        status,
        updated_at
      FROM restaurant_coupon
      WHERE id = ?
      LIMIT 1
    `,
      [id],
    );

    if (couponRows.length === 0) {
      return null;
    }

    const coupon = couponRows[0];

    let discountType = coupon.discount_type || "amount";
    let discountPrice = coupon.cupon_price;

    if (
      typeof coupon.cupon_price === "string" &&
      coupon.cupon_price.includes("%")
    ) {
      discountType = "percent";
      discountPrice = coupon.cupon_price.replace(/%$/, "");
    }

    const formattedCoupon = {
      ...coupon,
      discount_type: discountType,
      discount_price: discountPrice,
      min_order_amount: 0,
      max_discount_amount: "",
      status:
        coupon.status !== undefined && coupon.status !== null
          ? coupon.status
          : 1,
    };

    const [categories] = await pool.execute(
      `
      SELECT id, category_name
      FROM category
      WHERE id = 118
    `,
    );

    const [vendors] = await pool.execute(
      `
      SELECT id, name, cat_id
      FROM vendor
      WHERE cat_id = 118
    `,
    );

    let products = [];

    const vendorIds = vendors.map((vendor) => vendor.id);

    if (vendorIds.length > 0) {
      const placeholders = vendorIds.map(() => "?").join(",");

      const [productRows] = await pool.execute(
        `
        SELECT
          id,
          vendor_id,
          name
        FROM restaurant_items
        WHERE vendor_id IN (${placeholders})
      `,
        vendorIds,
      );

      products = productRows;
    }

    return {
      coupon: formattedCoupon,
      categories,
      vendors,
      products,
    };
  },

  // GET VENDORS BY CATEGORY
  async getVendorsByCategory() {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        name,
        cat_id
      FROM vendor
      WHERE cat_id = 118
    `,
    );

    return rows;
  },

  // GET PRODUCTS BY VENDOR IDS
  async getProductsByVendorIds(vendorIds) {
    if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
      return [];
    }

    const placeholders = vendorIds.map(() => "?").join(",");

    const [rows] = await pool.execute(
      `
      SELECT
        id,
        vendor_id,
        name
      FROM restaurant_items
      WHERE vendor_id IN (${placeholders})
    `,
      vendorIds,
    );

    return rows;
  },

  // UPDATE COUPON
  async updateCoupon(id, data) {
    const [result] = await pool.execute(
      `
      UPDATE restaurant_coupon
      SET
        title = ?,
        code = ?,
        cupon_price = ?,
        discount_type = ?,
        description = ?,
        expired_at = ?,
        usage_limit = ?,
        user_type = ?,
        status = ?,
        category_ids = ?,
        vendor_ids = ?,
        product_ids = ?,
        updated_at = ?
      WHERE id = ?
    `,
      [
        data.title,
        data.code,
        data.cupon_price,
        data.discount_type,
        data.description,
        data.expired_at,
        data.usage_limit,
        data.user_type,
        data.status,
        data.category_ids,
        data.vendor_ids,
        data.product_ids,
        data.updated_at,
        id,
      ],
    );

    return result;
  },

  // -----------------------------------------
  // RESTAURANT- PRODUCT MANAGEMENT
  // -----------------------------------------

  // GET ALL RESTAURANT MENUS
  async getAllMenus() {
    const [rows] = await pool.execute(`
    SELECT
      id,
      name,
      status,
      created_at,
      updated_at
    FROM restaurant_menu
    ORDER BY id DESC
  `);

    return rows;
  },

  // GET ADD RESTAURANT ITEM DATA
  async getAddRestaurantItemData() {
    const [parentCategory] = await pool.execute(`
    SELECT
      id,
      category_name
    FROM category
    WHERE id = 118
  `);

    const [subCategories] = await pool.execute(`
    SELECT
      id,
      name,
      cat_id
    FROM sub_category
    WHERE cat_id = 118
    ORDER BY name ASC
  `);

    const [vendors] = await pool.execute(`
    SELECT
      id,
      name,
      business_name
    FROM vendor
    WHERE vendor_type = 'restaurant'
    ORDER BY name DESC
  `);

    const [menus] = await pool.execute(`
    SELECT
      id,
      name
    FROM restaurant_menu
    WHERE status = '1'
    ORDER BY name DESC
  `);

    return {
      parent_category: parentCategory[0] || null,
      sub_categories: subCategories,
      vendors,
      menus,
      title: "Add Restaurant Item",
    };
  },

  // CHECK MENU NAME EXISTS
  async nameExists(name, excludeId = null) {
    let query = `
    SELECT id
    FROM restaurant_menu
    WHERE name = ?
  `;

    const params = [name];

    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }

    query += ` LIMIT 1`;

    const [rows] = await pool.execute(query, params);

    return rows.length > 0;
  },

  // CREATE MENU
  async createMenu(name) {
    const [result] = await pool.execute(
      `
      INSERT INTO restaurant_menu (name, status)
      VALUES (?, 1)
    `,
      [name],
    );

    return result.insertId;
  },

  // GET MENU BY ID
  async getMenuById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        name,
        status,
        created_at,
        updated_at
      FROM restaurant_menu
      WHERE id = ?
      LIMIT 1
    `,
      [id],
    );

    return rows[0] || null;
  },

  // UPDATE MENU
  async updateMenu(id, name) {
    const [result] = await pool.execute(
      `
      UPDATE restaurant_menu
      SET name = ?
      WHERE id = ?
    `,
      [name, id],
    );

    return result;
  },

  // DELETE MENU
  async deleteMenu(id) {
    const [result] = await pool.execute(
      `
      DELETE FROM restaurant_menu
      WHERE id = ?
    `,
      [id],
    );

    return result;
  },

  // BULK DELETE MENUS
  async bulkDeleteMenus(ids) {
    const placeholders = ids.map(() => "?").join(", ");

    const [result] = await pool.execute(
      `
      DELETE FROM restaurant_menu
      WHERE id IN (${placeholders})
    `,
      ids,
    );

    return result;
  },

  // UPDATE MENU STATUS
  async updateMenuStatus(id, status) {
    const [result] = await pool.execute(
      `
      UPDATE restaurant_menu
      SET status = ?
      WHERE id = ?
    `,
      [status, id],
    );

    return result;
  },

  // GET ALL RESTAURANT ITEMS
  async getAllRestaurantItems() {
    const [rows] = await pool.execute(`
    SELECT
      ri.*,
      sc.name AS sub_cat_name,
      v.name AS vendor_name,
      v.business_name,
      c.category_name
    FROM restaurant_items ri
    LEFT JOIN sub_category sc
      ON sc.id = ri.sub_cat_id
    LEFT JOIN category c
      ON c.id = sc.cat_id
    LEFT JOIN vendor v
      ON v.id = ri.vendor_id
    ORDER BY ri.id DESC
  `);

    return rows;
  },

  // GET RESTAURANT ITEM DETAILS BY ID
  async getRestaurantItemById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        ri.*,
        sc.name AS sub_cat_name,
        v.name AS vendor_name,
        c.category_name,
        m.name AS menu_name
      FROM restaurant_items ri
      LEFT JOIN sub_category sc
        ON sc.id = ri.sub_cat_id
      LEFT JOIN category c
        ON c.id = sc.cat_id
      LEFT JOIN vendor v
        ON v.id = ri.vendor_id
      LEFT JOIN restaurant_menu m
        ON m.id = ri.menu_id
      WHERE ri.id = ?
      LIMIT 1
    `,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    const item = rows[0];

    const [groups] = await pool.execute(
      `
      SELECT *
      FROM vendor_addon_groups
      WHERE item_id = ?
      ORDER BY id ASC
    `,
      [id],
    );

    for (const group of groups) {
      const [options] = await pool.execute(
        `
        SELECT *
        FROM vendor_addons
        WHERE group_id = ?
        ORDER BY id ASC
      `,
        [group.id],
      );

      group.options = options;
    }

    const addon_groups = [];
    const topping_groups = [];

    for (const group of groups) {
      if (group.type === "topping") {
        topping_groups.push(group);
      } else {
        addon_groups.push(group);
      }
    }

    return {
      ...item,
      addon_groups,
      topping_groups,
    };
  },

  // UPDATE RESTAURANT ITEM STATUS
  async updateRestaurantItemStatus(itemId, status) {
    const [result] = await pool.execute(
      `UPDATE restaurant_items SET status = ? WHERE id = ?`,
      [status, itemId],
    );

    return result;
  },

  // GET ALL RESTAURANT ORDERS
  async getAllRestaurantOrders() {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM retsaurant_orders
      ORDER BY id DESC
    `,
    );

    return rows;
  },

  // DELETE RESTAURANT ITEM
  async deleteRestaurantItem(id) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [items] = await connection.execute(
        `SELECT item_image FROM restaurant_items WHERE id = ? LIMIT 1`,
        [id],
      );

      if (items.length === 0) {
        await connection.rollback();

        return {
          affectedRows: 0,
          item: null,
        };
      }

      await connection.execute(`DELETE FROM vendor_addons WHERE item_id = ?`, [
        id,
      ]);

      const [result] = await connection.execute(
        `DELETE FROM restaurant_items WHERE id = ?`,
        [id],
      );

      await connection.commit();

      return {
        affectedRows: result.affectedRows,
        item: items[0],
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // BULK DELETE RESTAURANT ITEMS
  async bulkDeleteRestaurantItems(ids) {
    const placeholders = ids.map(() => "?").join(", ");

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [items] = await connection.execute(
        `
        SELECT id, item_image
        FROM restaurant_items
        WHERE id IN (${placeholders})
      `,
        ids,
      );

      const [result] = await connection.execute(
        `
        DELETE FROM restaurant_items
        WHERE id IN (${placeholders})
      `,
        ids,
      );

      await connection.commit();

      return {
        affectedRows: result.affectedRows,
        items,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // CREATE RESTAURANT ITEM
  async createRestaurantItem(data) {
    const [result] = await pool.execute(
      `
      INSERT INTO restaurant_items (
        vendor_id,
        name,
        description,
        item_type,
        unit_price,
        discount_price,
        sub_cat_id,
        menu_id,
        item_image,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `,
      [
        data.vendor_id,
        data.name,
        data.description,
        data.item_type,
        data.unit_price,
        data.discount_price,
        data.sub_cat_id,
        data.menu_id,
        data.item_image,
        data.created_at,
      ],
    );

    return result.insertId;
  },

  // GET ADDON GROUP BY ID AND ITEM ID
  async getAddonGroupByIdAndItemId(groupId, itemId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM vendor_addon_groups
      WHERE id = ?
        AND item_id = ?
      LIMIT 1
    `,
      [groupId, itemId],
    );

    return rows[0] || null;
  },

  // CREATE ADDON GROUP
  async createAddonGroup(data) {
    const [result] = await pool.execute(
      `
      INSERT INTO vendor_addon_groups (
        item_id,
        vendor_id,
        sub_cat_id,
        type,
        title,
        is_required
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        data.item_id,
        data.vendor_id,
        data.sub_cat_id,
        data.type,
        data.title,
        data.is_required,
      ],
    );

    return result.insertId;
  },

  // UPDATE ADDON GROUP
  async updateAddonGroup(groupId, title, isRequired) {
    const [result] = await pool.execute(
      `
      UPDATE vendor_addon_groups
      SET title = ?, is_required = ?
      WHERE id = ?
    `,
      [title, isRequired, groupId],
    );

    return result;
  },

  // DELETE ADDON OPTIONS BY GROUP ID
  async deleteAddonOptionsByGroupId(groupId) {
    const [result] = await pool.execute(
      `
      DELETE FROM vendor_addons
      WHERE group_id = ?
    `,
      [groupId],
    );

    return result;
  },

  // INSERT ADDON OPTIONS
  async insertAddonOptions(options) {
    if (!options.length) {
      return null;
    }

    const values = [];

    for (const option of options) {
      values.push([
        option.group_id,
        option.name,
        option.price,
        option.vendor_id,
        option.item_id,
        option.image,
      ]);
    }

    const placeholders = values.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");

    const params = values.flat();

    const [result] = await pool.execute(
      `
      INSERT INTO vendor_addons (
        group_id,
        name,
        price,
        vendor_id,
        item_id,
        image
      )
      VALUES ${placeholders}
    `,
      params,
    );

    return result;
  },

  // GET ADDON GROUPS BY ITEM ID
  async getAddonGroupsByItemId(itemId) {
    const [groups] = await pool.execute(
      `
      SELECT *
      FROM vendor_addon_groups
      WHERE item_id = ?
      ORDER BY id ASC
    `,
      [itemId],
    );

    return groups;
  },

  // GET ADDON OPTIONS BY GROUP ID
  async getAddonOptionsByGroupId(groupId) {
    const [options] = await pool.execute(
      `
      SELECT *
      FROM vendor_addons
      WHERE group_id = ?
    `,
      [groupId],
    );

    return options;
  },

  // DELETE ADDON GROUP
  async deleteAddonGroup(groupId) {
    await pool.execute(
      `
      DELETE FROM vendor_addons
      WHERE group_id = ?
    `,
      [groupId],
    );

    const [result] = await pool.execute(
      `
      DELETE FROM vendor_addon_groups
      WHERE id = ?
    `,
      [groupId],
    );

    return result;
  },

  // GET EDIT RESTAURANT ITEM DATA
  async getEditRestaurantItemData(id) {
    const [itemRows] = await pool.execute(
      `
      SELECT
        ri.*,
        sc.name AS sub_cat_name
      FROM restaurant_items ri
      LEFT JOIN sub_category sc
        ON sc.id = ri.sub_cat_id
      WHERE ri.id = ?
    `,
      [id],
    );

    const item = itemRows[0] || null;

    if (!item) {
      return null;
    }

    const [parentCategory] = await pool.execute(
      `
      SELECT id, category_name
      FROM category
      WHERE id = 118
    `,
    );

    const [subCategories] = await pool.execute(
      `
      SELECT id, name, cat_id
      FROM sub_category
      WHERE cat_id = 118
      ORDER BY name ASC
    `,
    );

    const [vendors] = await pool.execute(
      `
      SELECT 
        id, 
        name,
        business_name
      FROM vendor
      WHERE vendor_type = 'restaurant'
    `,
    );

    const [menus] = await pool.execute(
      `
      SELECT id, name
      FROM restaurant_menu
      WHERE status = '1'
    `,
    );

    return {
      item,
      parent_category: parentCategory[0] || null,
      sub_categories: subCategories,
      vendors,
      menus,
      title: "Edit Restaurant Item",
    };
  },

  // GET RESTAURANT ITEM FOR UPDATE
  async getRestaurantItemForUpdate(itemId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM restaurant_items
      WHERE id = ?
      LIMIT 1
    `,
      [itemId],
    );

    return rows[0] || null;
  },

  // UPDATE RESTAURANT ITEM
  async updateRestaurantItem(itemId, data) {
    const [result] = await pool.execute(
      `
      UPDATE restaurant_items
      SET
        vendor_id = ?,
        name = ?,
        description = ?,
        item_type = ?,
        unit_price = ?,
        discount_price = ?,
        sub_cat_id = ?,
        menu_id = ?,
        updated_at = ?
      WHERE id = ?
    `,
      [
        data.vendor_id,
        data.name,
        data.description,
        data.item_type,
        data.unit_price,
        data.discount_price,
        data.sub_cat_id,
        data.menu_id,
        data.updated_at,
        itemId,
      ],
    );

    return result;
  },

  // UPDATE RESTAURANT ITEM IMAGE
  async updateRestaurantItemImage(itemId, image) {
    const [result] = await pool.execute(
      `
      UPDATE restaurant_items
      SET item_image = ?
      WHERE id = ?
    `,
      [image, itemId],
    );

    return result;
  },

  // UPDATE RESTAURANT ITEM IMAGE AND DATA
  async updateRestaurantItemImageAndData(itemId, data) {
    const [result] = await pool.execute(
      `
      UPDATE restaurant_items
      SET
        vendor_id = ?,
        name = ?,
        description = ?,
        item_type = ?,
        unit_price = ?,
        discount_price = ?,
        sub_cat_id = ?,
        menu_id = ?,
        updated_at = ?,
        item_image = ?
      WHERE id = ?
    `,
      [
        data.vendor_id,
        data.name,
        data.description,
        data.item_type,
        data.unit_price,
        data.discount_price,
        data.sub_cat_id,
        data.menu_id,
        data.updated_at,
        data.item_image,
        itemId,
      ],
    );

    return result;
  },

  // UPDATE ADDON
  async updateAddon(addonId, name, price) {
    const [result] = await pool.execute(
      `
      UPDATE vendor_addons
      SET
        name = ?,
        price = ?
      WHERE id = ?
    `,
      [name, price, addonId],
    );

    return result;
  },

  // GET ADDON BY ID
  async getAddonById(addonId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM vendor_addons
      WHERE id = ?
      LIMIT 1
    `,
      [addonId],
    );

    return rows[0] || null;
  },

  // DELETE ADDON
  async deleteAddon(addonId) {
    const [result] = await pool.execute(
      `
      DELETE FROM vendor_addons
      WHERE id = ?
    `,
      [addonId],
    );

    return result;
  },

  // -----------------------------------------
  // RESTAURANT- DRIVER SECTION
  // -----------------------------------------

  // GET ALL DRIVERS
  async getAllDrivers(limit = null, offset = 0, search = "") {
    let sql = `
    SELECT *
    FROM drivers
  `;

    const params = [];

    if (search) {
      sql += `
      WHERE (
        first_name LIKE ?
        OR last_name LIKE ?
        OR email LIKE ?
        OR phone LIKE ?
      )
    `;

      const keyword = `%${search}%`;
      params.push(keyword, keyword, keyword, keyword);
    }

    sql += ` ORDER BY id DESC`;

    if (limit) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));
    }

    const [rows] = await pool.execute(sql, params);

    return rows;
  },

  // SEARCH DRIVERS
  async searchDrivers(keyword) {
    const sql = `
    SELECT *
    FROM drivers
    WHERE (
      first_name LIKE ?
      OR last_name LIKE ?
      OR email LIKE ?
      OR phone LIKE ?
    )
    ORDER BY id DESC
  `;

    const searchValue = `%${keyword}%`;

    const [rows] = await pool.execute(sql, [
      searchValue,
      searchValue,
      searchValue,
      searchValue,
    ]);

    return rows;
  },

  // COUNT DRIVERS
  async countDrivers(search = "") {
    let sql = `
    SELECT COUNT(*) AS total
    FROM drivers
  `;

    const params = [];

    if (search) {
      sql += `
      WHERE (
        first_name LIKE ?
        OR last_name LIKE ?
        OR email LIKE ?
        OR phone LIKE ?
      )
    `;

      const searchValue = `%${search}%`;
      params.push(searchValue, searchValue, searchValue, searchValue);
    }

    const [rows] = await pool.execute(sql, params);

    return rows[0].total;
  },

  // COUNT ACTIVE DRIVERS
  async countActiveDrivers(search = "") {
    let sql = `
    SELECT COUNT(*) AS total
    FROM drivers
    WHERE status = 1
  `;

    const params = [];

    if (search) {
      sql += `
      AND (
        first_name LIKE ?
        OR last_name LIKE ?
        OR email LIKE ?
        OR phone LIKE ?
      )
    `;

      const searchValue = `%${search}%`;
      params.push(searchValue, searchValue, searchValue, searchValue);
    }

    const [rows] = await pool.execute(sql, params);

    return rows[0].total;
  },

  // GET DRIVER BY ID
  async getDriverById(id) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM drivers
      WHERE id = ?
    `,
      [id],
    );

    return rows[0];
  },

  // GET DELIVERED ORDERS BY DRIVER ID
  async getDeliveredOrdersByDriverId(driverId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM retsaurant_orders
      WHERE delivery_boy_id = ?
        AND order_status = 'Delivered'
    `,
      [driverId],
    );

    return rows;
  },

  // UPDATE DRIVER STATUS
  async updateDriverStatus(id, status) {
    const [result] = await pool.execute(
      `
      UPDATE drivers
      SET status = ?
      WHERE id = ?
    `,
      [status, id],
    );

    return result.affectedRows > 0;
  },

  // DELETE DRIVER
  async deleteDriver(id) {
    const [result] = await pool.execute(
      `
      DELETE FROM drivers
      WHERE id = ?
    `,
      [id],
    );

    return result.affectedRows > 0;
  },

  // CHECK DRIVER EMAIL
  async emailExists(email, driverId) {
    const [rows] = await pool.execute(
      "SELECT id FROM drivers WHERE email = ? AND id != ?",
      [email, driverId],
    );

    return rows.length > 0;
  },

  // CHECK DRIVER PHONE
  async phoneExists(phone, driverId) {
    const [rows] = await pool.execute(
      "SELECT id FROM drivers WHERE phone = ? AND id != ?",
      [phone, driverId],
    );

    return rows.length > 0;
  },

  // UPDATE DRIVER
  async updateDriver(driverId, driverData) {
    const [result] = await pool.execute(
      `UPDATE drivers SET
      first_name = ?,
      last_name = ?,
      email = ?,
      country_code = ?,
      phone = ?,
      profile_image = ?,
      identity_type = ?,
      identity_number = ?,
      identity_image = ?,
      updated_at = ?
    WHERE id = ?`,
      [
        driverData.first_name,
        driverData.last_name,
        driverData.email,
        driverData.country_code,
        driverData.phone,
        driverData.profile_image,
        driverData.identity_type,
        driverData.identity_number,
        driverData.identity_image,
        driverData.updated_at,
        driverId,
      ],
    );

    return result;
  },

  // CHECK DRIVER EMAIL FOR CREATE
  async createEmailExists(email) {
    const [rows] = await pool.execute(
      `SELECT id
     FROM drivers
     WHERE email = ?
     LIMIT 1`,
      [email],
    );

    return rows.length > 0;
  },

  // CHECK DRIVER PHONE FOR CREATE
  async createPhoneExists(phone) {
    const [rows] = await pool.execute(
      `SELECT id
     FROM drivers
     WHERE phone = ?
     LIMIT 1`,
      [phone],
    );

    return rows.length > 0;
  },

  // CREATE DRIVER
  async createDriver(driverData) {
    const {
      first_name,
      last_name,
      email,
      country_code,
      phone,
      profile_image,
      identity_type,
      identity_number,
      identity_image,
      lat,
      long,
      address,
      created_at,
      updated_at,
    } = driverData;

    const [result] = await pool.execute(
      `INSERT INTO drivers (
      first_name,
      last_name,
      email,
      country_code,
      phone,
      profile_image,
      identity_type,
      identity_number,
      identity_image,
      lat,
      \`long\`,
      address,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        country_code,
        phone,
        profile_image,
        identity_type,
        identity_number,
        identity_image,
        lat,
        long,
        address,
        created_at,
        updated_at,
      ],
    );

    return result;
  },

  // GET DRIVER ESTIMATE TIME COUNT
  async getDriverEstimateTimeCount(search) {
    let sql = `
    SELECT COUNT(*) AS total
    FROM driver_estimate_time
  `;

    const params = [];

    if (search) {
      sql += `
      WHERE range_km LIKE ?
      OR from_time LIKE ?
    `;

      const searchValue = `%${search}%`;

      params.push(searchValue, searchValue);
    }

    const [rows] = await pool.execute(sql, params);

    return rows[0].total;
  },

  // GET DRIVER ESTIMATE TIMES
  async getDriverEstimateTimes(search, limit, offset) {
    let sql = `
    SELECT *
    FROM driver_estimate_time
  `;

    const params = [];

    if (search) {
      sql += `
      WHERE range_km LIKE ?
      OR from_time LIKE ?
    `;

      const searchValue = `%${search}%`;

      params.push(searchValue, searchValue);
    }

    sql += `
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `;

    params.push(limit, offset);

    const [rows] = await pool.execute(sql, params);

    return rows;
  },

  // CHECK DRIVER ESTIMATE RANGE
  async checkRangeExists(rangeKm) {
    const [rows] = await pool.execute(
      "SELECT id FROM driver_estimate_time WHERE range_km = ? LIMIT 1",
      [rangeKm],
    );

    return rows.length > 0;
  },

  // CREATE DRIVER ESTIMATE TIME
  async createDriverEstimateTime(data) {
    const [result] = await pool.execute(
      `INSERT INTO driver_estimate_time
     (range_km, from_time, status, created_at)
     VALUES (?, ?, ?, ?)`,
      [data.range_km, data.from_time, data.status, data.created_at],
    );

    return result;
  },

  // GET DRIVER ESTIMATE TIME BY ID
  async getDriverEstimateTimeById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM driver_estimate_time WHERE id = ?",
      [id],
    );

    return rows[0] || null;
  },

  // CHECK DRIVER ESTIMATE RANGE FOR UPDATE
  async checkDriverEstimateTimeRangeExists(rangeKm, id) {
    const [rows] = await pool.execute(
      `SELECT id
     FROM driver_estimate_time
     WHERE range_km = ?
     AND id != ?
     LIMIT 1`,
      [rangeKm, id],
    );

    return rows.length > 0;
  },

  // UPDATE DRIVER ESTIMATE TIME
  async updateDriverEstimateTime(id, data) {
    const [result] = await pool.execute(
      `UPDATE driver_estimate_time
     SET range_km = ?,
         from_time = ?,
         status = ?,
         updated_at = ?
     WHERE id = ?`,
      [data.range_km, data.from_time, data.status, data.updated_at, id],
    );

    return result;
  },

  // UPDATE DRIVER ESTIMATE TIME STATUS
  async updateDriverEstimateTimeStatus(id, status) {
    const [result] = await pool.execute(
      `UPDATE driver_estimate_time
     SET status = ?
     WHERE id = ?`,
      [status, id],
    );

    return result;
  },

  // DELETE DRIVER ESTIMATE TIME
  async deleteDriverEstimateTime(id) {
    const [result] = await pool.execute(
      `DELETE FROM driver_estimate_time WHERE id = ?`,
      [id],
    );

    return result;
  },

  // BULK DELETE DRIVER TIMES
  async bulkDeleteDriverTimes(ids) {
    const placeholders = ids.map(() => "?").join(",");

    const [result] = await pool.execute(
      `DELETE FROM driver_estimate_time WHERE id IN (${placeholders})`,
      ids,
    );

    return result;
  },

  // GET BANNERS
  async getBanners(search, limit, offset) {
    let sql = `
    SELECT
      restaurant_banners.*,
      vendor.name AS vendor_name,
      restaurant_items.name AS item_name
    FROM restaurant_banners
    LEFT JOIN vendor
      ON vendor.id = restaurant_banners.vendor_id
    LEFT JOIN restaurant_items
      ON restaurant_items.id = restaurant_banners.item_id
  `;

    const params = [];

    if (search) {
      sql += ` WHERE restaurant_banners.title LIKE ?`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY restaurant_banners.id DESC LIMIT ? OFFSET ?`;

    params.push(limit, offset);

    const [rows] = await pool.execute(sql, params);

    return rows;
  },

  // COUNT BANNERS
  async countBanners(search) {
    let sql = `
    SELECT COUNT(*) AS total
    FROM restaurant_banners
  `;

    const params = [];

    if (search) {
      sql += ` WHERE title LIKE ?`;
      params.push(`%${search}%`);
    }

    const [rows] = await pool.execute(sql, params);

    return rows[0].total;
  },

  // GET RESTAURANT VENDORS
  async getRestaurantVendors() {
    const [rows] = await pool.execute(`
    SELECT id, business_name AS name
    FROM vendor
    WHERE vendor_type = 'restaurant'
  `);

    return rows;
  },

  // CREATE BANNER
  async createBanner(data) {
    const [result] = await pool.execute(
      `
      INSERT INTO restaurant_banners
      (
        title,
        vendor_id,
        item_id,
        image,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        data.title,
        data.vendor_id,
        data.item_id,
        data.image,
        data.status,
        data.created_at,
      ],
    );

    return result.insertId;
  },

  // GET BANNER BY ID
  async getBannerById(id) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM restaurant_banners
      WHERE id = ?
    `,
      [id],
    );

    return rows[0];
  },

  // GET BANNER WITH DETAILS
  async getBannerWithDetails(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        restaurant_banners.*,
        vendor.name AS vendor_name,
        restaurant_items.name AS item_name
      FROM restaurant_banners
      LEFT JOIN vendor
        ON vendor.id = restaurant_banners.vendor_id
      LEFT JOIN restaurant_items
        ON restaurant_items.id = restaurant_banners.item_id
      WHERE restaurant_banners.id = ?
    `,
      [id],
    );

    return rows[0];
  },

  // DELETE BANNER
  async deleteBanner(id) {
    const [result] = await pool.execute(
      `
      DELETE FROM restaurant_banners
      WHERE id = ?
    `,
      [id],
    );

    return result;
  },

  // UPDATE BANNER STATUS
  async updateBannerStatus(id, status) {
    const [result] = await pool.execute(
      `
      UPDATE restaurant_banners
      SET status = ?
      WHERE id = ?
    `,
      [status, id],
    );

    return result;
  },

  // UPDATE BANNER
  async updateBanner(id, data) {
    const [result] = await pool.execute(
      `
      UPDATE restaurant_banners
      SET
        title = ?,
        vendor_id = ?,
        item_id = ?,
        image = ?,
        updated_at = ?
      WHERE id = ?
    `,
      [
        data.title,
        data.vendor_id,
        data.item_id,
        data.image,
        data.updated_at,
        id,
      ],
    );

    return result;
  },

  // GET RESTAURANT ITEMS BY VENDOR
  async getRestaurantItems(vendorId) {
    const [rows] = await pool.execute(
      `
      SELECT id, name
      FROM restaurant_items
      WHERE vendor_id = ?
      ORDER BY name ASC
    `,
      [vendorId],
    );

    return rows;
  },

  // GET UNREAD NOTIFICATIONS
  async getUnreadNotifications() {
    const [rows] = await pool.execute(`
    SELECT *
    FROM restaurant_notifications
    WHERE status = '0'
    ORDER BY id DESC
  `);

    return rows;
  },

  // GET UNREAD RESTAURANT-ORDER NOTIFICATION COUNT
  async getUnreadNotificationCount() {
    const [rows] = await pool.execute(`
    SELECT COUNT(*) AS count
    FROM notifications
    WHERE is_seen_admin = 0
      AND types = 'restaurant_order'
  `);

    return rows[0].count;
  },

  // MARK ALL AS READ
  async markAllAsRead() {
    const [result] = await pool.execute(`
    UPDATE restaurant_notifications
    SET status = '1'
    WHERE status = '0'
  `);

    return result;
  },

  // GET RESTAURANT NOTIFICATIONS
  async getRestaurantNotifications() {
    const [rows] = await pool.execute(`
    SELECT *
    FROM notifications
    WHERE types = 'restaurant_order'
      AND is_seen_admin = '0'
    ORDER BY id DESC
  `);

    return rows;
  },

  // GET RESTAURANT NOTIFICATION BY ID
  async getRestaurantNotificationById(id) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM notifications
      WHERE id = ?
        AND types = 'restaurant_order'
    `,
      [id],
    );

    return rows[0] || null;
  },

  // MARK NOTIFICATION AS SEEN
  async markNotificationAsSeen(id) {
    const [result] = await pool.execute(
      `
      UPDATE notifications
      SET is_seen_admin = 1
      WHERE id = ?
        AND types = 'restaurant_order'
    `,
      [id],
    );

    return result;
  },

  // BULK DELETE NOTIFICATIONS
  async bulkDeleteNotifications(ids) {
    if (!ids || ids.length === 0) {
      return null;
    }

    const placeholders = ids.map(() => "?").join(",");

    const [result] = await pool.execute(
      `
      DELETE FROM notifications
      WHERE id IN (${placeholders})
        AND types = 'restaurant_order'
    `,
      ids,
    );

    return result;
  },

  // GET RESTAURANT ORDER BY ID
  async getRestaurantOrderById(bookingId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM retsaurant_orders
      WHERE id = ?
    `,
      [bookingId],
    );

    return rows[0] || null;
  },

  // GET ADDONS BY IDS
  async getAddonsByIds(addonIds) {
    if (!addonIds || addonIds.length === 0) {
      return [];
    }

    const placeholders = addonIds.map(() => "?").join(",");

    const [rows] = await pool.execute(
      `
      SELECT *
      FROM vendor_addons
      WHERE id IN (${placeholders})
    `,
      addonIds,
    );

    return rows;
  },

  // GET SUB-CATEGORY BY ID
  async getSubCategoryById(id) {
    const [rows] = await pool.execute(
      `
      SELECT name
      FROM sub_category
      WHERE id = ?
    `,
      [id],
    );

    return rows[0] || null;
  },

  // GET COUPON BY ID FOR NOTIFICATION
  async getCouponByIdForNotification(id) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM restaurant_coupon
      WHERE id = ?
    `,
      [id],
    );

    return rows[0] || null;
  },

  // GET VENDOR BY ID
  async getVendorById(id) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM vendor
      WHERE id = ?
    `,
      [id],
    );

    return rows[0] || null;
  },

  // GET CUSTOMER BY ID
  async getCustomerById(id) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM users
      WHERE id = ?
    `,
      [id],
    );

    return rows[0] || null;
  },

  // GET ALL RESTAURANT VENDORS
  async getAllVendors() {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        name,
        business_name,
        email_id,
        mobile,
        image,
        lat,
        \`long\`,
        vendor_type,
        cat_id,
        city_id,
        restaurant_address,
        minimum_delivery_time,
        maximum_delivery_time,
        delivery_time_type
      FROM vendor
      WHERE vendor_type = 'restaurant'
      AND lat IS NOT NULL
      AND \`long\` IS NOT NULL
    `,
    );

    return rows;
  },

  // GET ORDER BY ID
  async getOrderById(orderId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM retsaurant_orders
      WHERE id = ?
      LIMIT 1
    `,
      [orderId],
    );

    return rows[0] || null;
  },

  // GET DRIVER BY ID FOR NOTIFICATION
  async getDriverByIdForNotification(id) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM drivers
      WHERE id = ?
    `,
      [id],
    );

    return rows[0] || null;
  },

  // GET RESTAURANT VENDORS FOR NOTIFICATION
  async getRestaurantVendorsForNotification() {
    const [rows] = await pool.execute(`
    SELECT *
    FROM vendor
    WHERE vendor_type = 'restaurant'
  `);

    return rows;
  },

  // -----------------------------------------
  // RESTAURANT- DRIVER SECTION
  // -----------------------------------------

  // GET INVOICE ORDER
  async getInvoiceOrder(orderId, vendorId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM retsaurant_orders
      WHERE id = ?
      AND vendor_id = ?
      LIMIT 1
    `,
      [orderId, vendorId],
    );

    return rows[0] || null;
  },

  // GET CUSTOMER FOR INVOICE
  async getCustomerByIdForInvoice(userId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
      [userId],
    );

    return rows[0] || null;
  },

  // GET VENDOR FOR INVOICE
  async getVendorByIdForInvoice(vendorId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM vendor
      WHERE id = ?
      LIMIT 1
    `,
      [vendorId],
    );

    return rows[0] || null;
  },

  // GET ADDRESS FOR INVOICE
  async getAddressByIdForInvoice(addressId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM address
      WHERE id = ?
      LIMIT 1
    `,
      [addressId],
    );

    return rows[0] || null;
  },

  // GET ADDONS FOR INVOICE
  async getAddonsByIdsForInvoice(addonIds) {
    if (!addonIds || !addonIds.length) {
      return [];
    }

    const placeholders = addonIds.map(() => "?").join(",");

    const [rows] = await pool.execute(
      `
      SELECT *
      FROM vendor_addons
      WHERE id IN (${placeholders})
    `,
      addonIds,
    );

    return rows;
  },

  // GET SUB CATEGORY FOR INVOICE
  async getSubCategoryByIdForInvoice(subCategoryId) {
    if (!subCategoryId) {
      return null;
    }

    const [rows] = await pool.execute(
      `
      SELECT name
      FROM sub_category
      WHERE id = ?
      LIMIT 1
    `,
      [subCategoryId],
    );

    return rows[0] || null;
  },

  // GET RESTAURANT COUPON FOR INVOICE
  async getRestaurantCouponById(couponId) {
    if (!couponId) {
      return null;
    }

    const [rows] = await pool.execute(
      `
      SELECT *
      FROM restaurant_coupon
      WHERE id = ?
      LIMIT 1
    `,
      [couponId],
    );

    return rows[0] || null;
  },

  // GET STORE ITEMS
  async getStoreItems({
    storeId,
    status = null,
    search = "",
    page = 1,
    pageSize = 10,
  }) {
    const offset = (page - 1) * pageSize;

    let where = `WHERE ri.vendor_id = ?`;
    const params = [storeId];

    if (status === "active") {
      where += ` AND ri.status = 1`;
    }

    if (status === "inactive") {
      where += ` AND ri.status = 0`;
    }

    if (search) {
      where += ` AND ri.name LIKE ?`;
      params.push(`%${search}%`);
    }

    const [rows] = await pool.execute(
      `
      SELECT
        ri.*,
        sc.name AS sub_category_name
      FROM restaurant_items ri
      LEFT JOIN sub_category sc
        ON sc.id = ri.sub_cat_id
      ${where}
      ORDER BY ri.id DESC
      LIMIT ? OFFSET ?
    `,
      [...params, Number(pageSize), Number(offset)],
    );

    const [countRows] = await pool.execute(
      `
      SELECT COUNT(*) AS total
      FROM restaurant_items ri
      ${where}
    `,
      params,
    );

    return {
      items: rows,
      totalCount: Number(countRows[0]?.total || 0),
    };
  },

  // GET STORE ITEMS SUMMARY
  async getStoreItemsSummary(storeId) {
    const [rows] = await pool.execute(
      `
      SELECT
        COUNT(*) AS all_items,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS active_items,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS inactive_items
      FROM restaurant_items
      WHERE vendor_id = ?
    `,
      [storeId],
    );

    return {
      all: Number(rows[0]?.all_items || 0),
      active: Number(rows[0]?.active_items || 0),
      inactive: Number(rows[0]?.inactive_items || 0),
    };
  },

  // GET ITEM ADDONS
  async getItemAddons(addonIds, vendorId) {
    if (!addonIds.length) return [];

    const placeholders = addonIds.map(() => "?").join(",");

    const [rows] = await pool.execute(
      `
      SELECT id, name, price
      FROM vendor_addons
      WHERE id IN (${placeholders})
      AND vendor_id = ?
    `,
      [...addonIds, vendorId],
    );

    return rows;
  },

  // Get restaurant categories
  async getRestaurantCategories() {
    const [rows] = await pool.execute(
      `
      SELECT 
        category.id,
        category.shop_id,
        category.category_name AS name,
        category.arebic_category_name AS ar_name,
        category.category_image,
        category.service_id,
        category.status,
        category.created_date,
        category.showHomeService,
        category.showOnSiteService,
        category.sort_description,
        category.sort_order
      FROM category
      WHERE category.id = 118
      ORDER BY category.id DESC
    `,
    );

    return rows;
  },

  // UPDATE RESTAURANT CATEGORY
  // UPDATE RESTAURANT CATEGORY
  async updateRestaurantCategory(categoryId, data) {
    const [result] = await pool.execute(
      `
      UPDATE category
      SET
        category_name = ?,
        sort_description = ?,
        showHomeService = ?,
        showOnSiteService = ?
      WHERE id = ?
    `,
      [
        data.name,
        data.sort_description,
        data.showHomeService,
        data.showOnSiteService,
        categoryId,
      ],
    );

    return result;
  },

  // UPDATE RESTAURANT CATEGORY IMAGE
  async updateRestaurantCategoryImage(categoryId, image) {
    const [result] = await pool.execute(
      `
      UPDATE category
      SET category_image = ?
      WHERE id = ?
    `,
      [image, categoryId],
    );

    return result;
  },

  // GET RESTAURANT CATEGORY BY ID
  async getRestaurantCategoryById(categoryId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM category
      WHERE id = ?
    `,
      [categoryId],
    );

    return rows[0] || null;
  },

  // UPDATE RESTAURANT CATEGORY STATUS
  async updateRestaurantCategoryStatus(categoryId, status) {
    const [result] = await pool.execute(
      `
      UPDATE category
      SET status = ?
      WHERE id = ?
    `,
      [status, categoryId],
    );

    return result;
  },

  //GET RESTAURANT SUB CATEGORY LIST
  async getRestaurantSubCategories() {
    const [rows] = await pool.execute(
      `
      SELECT
        sub_category.*,
        category.category_name AS category_name
      FROM sub_category
      JOIN category
        ON category.id = sub_category.cat_id
      WHERE sub_category.cat_id = 118
      ORDER BY sub_category.id DESC
    `,
    );

    return rows;
  },

  //CHANGE RESTAURANT SUB CATEGORY STATUS
  async changeRestaurantSubCategoryStatus(subCategoryId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM sub_category
      WHERE sub_category.id = ?
    `,
      [subCategoryId],
    );

    if (rows.length > 0) {
      const status = rows[0].status;
      let newStatus = 0;

      if (status == 0) {
        newStatus = 1;
      }

      if (status == 1) {
        newStatus = 0;
      }

      const [result] = await pool.execute(
        `
        UPDATE sub_category
        SET status = ?
        WHERE id = ?
      `,
        [newStatus, subCategoryId],
      );

      return result;
    }

    return null;
  },

  //UPDATE RESTAURANT SUB CATEGORY
  async updateRestaurantSubCategory(subCategoryId, data) {
    const [result] = await pool.execute(
      `
      UPDATE sub_category
      SET
        cat_id = 118,
        name = ?,
        description = ?
        ${data.image ? ", image = ?" : ""}
      WHERE id = ?
        AND cat_id = 118
    `,
      data.image
        ? [data.name, data.description, data.image, subCategoryId]
        : [data.name, data.description, subCategoryId],
    );

    return result;
  },

  //GET RESTAURANT SUB CATEGORY
  async getRestaurantSubCategoryById(subCategoryId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM sub_category
      WHERE id = ?
    `,
      [subCategoryId],
    );

    return rows[0] || null;
  },

  async deleteRestaurantSubCategory(subCategoryId) {
    const [result] = await pool.execute(
      `
      DELETE FROM sub_category
      WHERE id = ?
        AND cat_id = 118
    `,
      [subCategoryId],
    );

    return result;
  },

  async deleteSelectedRestaurantSubCategories(subCategoryIds) {
    if (!subCategoryIds || subCategoryIds.length === 0) {
      return null;
    }

    const placeholders = subCategoryIds.map(() => "?").join(", ");

    const [result] = await pool.execute(
      `
      DELETE FROM sub_category
      WHERE id IN (${placeholders})
        AND cat_id = 118
    `,
      subCategoryIds,
    );

    return result;
  },

  //Add sub category
  async addRestaurantSubCategory(data) {
    const [result] = await pool.execute(
      `
      INSERT INTO sub_category
      (
        cat_id,
        name,
        description,
        image
      )
      VALUES (?, ?, ?, ?)
    `,
      [118, data.name, data.description, data.image || null],
    );

    return result;
  },

  // =================================
  // RESTAURANT - STORE KEYWORDS
  // =================================

  // GET STORE BY ID
  async getRestaurantStoreById(id) {
    const [rows] = await pool.execute(
      `
    SELECT
      vendor.*,
      category.category_name AS category_name,
      city_list.city_name AS city_name
    FROM vendor
    LEFT JOIN category
      ON category.id = vendor.cat_id
    LEFT JOIN city_list
      ON city_list.id = vendor.city_id
    WHERE vendor.vendor_type = 'restaurant'
    AND vendor.id = ?
    `,
      [id],
    );

    return rows[0] || null;
  },

  // GET KEYWORDS BY CATEGORY
  async getRestaurantKeywordsByCategory(categoryId) {
    const [rows] = await pool.execute(
      `
    SELECT *
    FROM category_keywords
    WHERE category_id = ?
    ORDER BY keyword ASC
    `,
      [118],
    );

    return rows;
  },

  // GET RESTAURANT VENDOR KEYWORD IDS
  async getRestaurantVendorKeywordIds(vendorId) {
    const [rows] = await pool.execute(
      `
    SELECT keyword_id
    FROM restaurant_vendor_keywords
    WHERE vendor_id = ?
    `,
      [vendorId],
    );

    const ids = [];

    for (const row of rows) {
      ids.push(row.keyword_id);
    }

    return ids;
  },

  // SAVE RESTAURANT VENDOR KEYWORDS
  async saveRestaurantVendorKeywords(vendorId, keywordIds) {
    await pool.execute(
      `
    DELETE FROM restaurant_vendor_keywords
    WHERE vendor_id = ?
    `,
      [vendorId],
    );

    if (Array.isArray(keywordIds) && keywordIds.length > 0) {
      const insertValues = keywordIds.map((keywordId) => [vendorId, keywordId]);

      await pool.query(
        `
      INSERT INTO restaurant_vendor_keywords
      (
        vendor_id,
        keyword_id
      )
      VALUES ?
      `,
        [insertValues],
      );
    }

    return true;
  },
};

module.exports = AdminModel;
