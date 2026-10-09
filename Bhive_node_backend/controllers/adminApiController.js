const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const adminService = require("../services/adminService");
const {
  drawRestaurantInvoice,
  addInvoicePageNumbers,
} = require("../services/invoiceService");

//LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const data = await adminService.login(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      ...data,
    });
  } catch (error) {
    console.error("Admin Login Error:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
// =====================================================
// SERVICE SERVICES
// =====================================================

const getSubAdmins = async (req, res) => {
  try {
    const subAdmins = await adminService.getSubAdmins();

    return res.status(200).json({
      success: true,
      message: "Sub admins fetched successfully.",
      data: subAdmins,
    });
  } catch (error) {
    console.error("Get sub admins error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sub admins.",
    });
  }
};

const changeSubAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.changeSubAdminStatus(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Change sub admin status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update admin status.",
    });
  }
};

const saveSubAdmin = async (req, res) => {
  try {
    const {
      admin_name,
      admin_email,
      admin_password,
      permission,
      role_id,
      employee_since,
    } = req.body;

    if (!admin_name || !admin_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Admin name is required",
      });
    }

    if (!admin_email || !admin_email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!admin_password || !admin_password.trim()) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (!role_id) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    if (!Array.isArray(permission) || permission.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one permission",
      });
    }

    const result = await adminService.saveSubAdmin({
      admin_name: admin_name.trim(),
      admin_email: admin_email.trim(),
      admin_password,
      permission,
      role_id,
      employee_since,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Save sub admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add Sub Admin.",
    });
  }
};

const getSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const subAdmin = await adminService.getSubAdminById(id);

    if (!subAdmin) {
      return res.status(404).json({
        success: false,
        message: "Sub Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sub Admin fetched successfully.",
      data: subAdmin,
    });
  } catch (error) {
    console.error("Get sub admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Sub Admin.",
    });
  }
};

const updateSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      admin_name,
      admin_email,
      admin_password,
      permission,
      role_id,
      employee_since,
    } = req.body;

    // Basic validation
    if (!admin_name) {
      return res.status(400).json({
        success: false,
        message: "Admin name is required",
      });
    }

    if (!admin_email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // if (!role_id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Role is required",
    //   });
    // }

    if (!Array.isArray(permission) || permission.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one permission",
      });
    }

    const result = await adminService.updateSubAdmin(id, {
      admin_name,
      admin_email,
      admin_password,
      permission,
      role_id,
      employee_since,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update sub admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update Sub Admin.",
    });
  }
};

const deleteSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Sub Admin ID",
      });
    }

    const result = await adminService.deleteSubAdmin(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete Sub Admin Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete Sub Admin",
    });
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await adminService.getRoles();

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully.",
      data: roles,
    });
  } catch (error) {
    console.error("Get roles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles.",
    });
  }
};

const addRole = async (req, res) => {
  try {
    const { role_name, responsibilities, status } = req.body;

    // Validate role name
    if (!role_name || !role_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    const result = await adminService.addRole({
      role_name: role_name.trim(),
      responsibilities: responsibilities || "",
      status: status ?? 1,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Add role error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add role",
    });
  }
};

const updateRoleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const result = await adminService.updateRoleStatus(id, status);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update role status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name, responsibilities } = req.body;

    if (!id || !role_name || !role_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    const result = await adminService.updateRole(id, {
      role_name: role_name.trim(),
      responsibilities: responsibilities || "",
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update role error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update role",
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.deleteRole(id);

    return res.json(result);
  } catch (error) {
    console.error("Delete Role Error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to delete role",
    });
  }
};

// =====================================================
// RESTAURANT SERVICES
// =====================================================

// -----------------------------------------
// RESTAURANT-DASHBOARD
// -----------------------------------------

const getDashboardData = async (req, res) => {
  try {
    const data = await adminService.getDashboardData();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const filter = req.body.filter;

    const data = await adminService.getOrderStats(filter);

    res.status(200).json(data);
  } catch (error) {
    console.error("Order Stats Error:", error);

    res.status(500).json({
      result: false,
      message: error.message,
    });
  }
};

// SALES CHART
const getSalesChartData = async (req, res) => {
  try {
    const filter = req.body.filter;

    const data = await adminService.getSalesChartData(filter);

    res.status(200).json(data);
  } catch (error) {
    console.error("Sales Chart Error:", error);

    res.status(500).json({
      result: false,
      message: error.message,
    });
  }
};

// -----------------------------------------
// RESTAURANT-STORE MANAGEMENT
// -----------------------------------------

// PENDING STORES
const getPendingStores = async (req, res) => {
  try {
    const stores = await adminService.getPendingStores();

    return res.status(200).json({
      success: true,
      message: "Pending stores fetched successfully",
      totalStores: stores.length,
      stores,
    });
  } catch (error) {
    console.error("Get pending stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending stores",
      error: error.message,
    });
  }
};

// GET ADD STORE CITIES
const getAddStoreCities = async (req, res) => {
  try {
    const result = await adminService.getAddStoreCities();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get cities error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cities.",
    });
  }
};

// ADD RESTAURANT STORE
const addStore = async (req, res) => {
  try {
    const data = req.body;
    const files = req.files;

    if (!data.business_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Business Name is required.",
      });
    }

    if (!data.cat_id) {
      return res.status(400).json({
        success: false,
        message: "Category is required.",
      });
    }

    if (
      !data.dining_option ||
      (Array.isArray(data.dining_option) && data.dining_option.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one dining option!",
      });
    }

    if (!data.minimum_delivery_time) {
      return res.status(400).json({
        success: false,
        message: "Minimum Delivery Time is required.",
      });
    }

    if (!data.maximum_delivery_time) {
      return res.status(400).json({
        success: false,
        message: "Maximum Delivery Time is required.",
      });
    }

    if (!data.delivery_time_type) {
      return res.status(400).json({
        success: false,
        message: "Delivery Time Type is required.",
      });
    }

    if (!data.business_description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Business Description is required.",
      });
    }

    if (!data.latitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude is required.",
      });
    }

    if (!data.longitude) {
      return res.status(400).json({
        success: false,
        message: "Longitude is required.",
      });
    }

    if (!data.restaurant_address?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Restaurant address is required.",
      });
    }

    if (!data.first_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "First Name is required.",
      });
    }

    if (!data.last_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Last Name is required.",
      });
    }

    if (!data.email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(data.email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!data.password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    if (data.password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    if (!data.mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile Number is required.",
      });
    }

    if (!data.city_id) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    if (!files?.profilePhoto?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required.",
      });
    }

    if (!files?.idProof?.[0]) {
      return res.status(400).json({
        success: false,
        message: "ID proof is required.",
      });
    }

    if (!files?.businessLicense?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Business license is required.",
      });
    }

    if (!files?.padFile?.[0]) {
      return res.status(400).json({
        success: false,
        message: "PAD file is required.",
      });
    }

    const result = await adminService.addStore(data, files);

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("Add restaurant store error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add store. Please try again.",
    });
  }
};

// GET RESTAURANT STORES
const getRestaurantStores = async (req, res) => {
  try {
    const data = await adminService.getRestaurantStores();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get restaurant stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant stores.",
    });
  }
};

// GET STORE BY ID
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await adminService.getStoreById(id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error("Get restaurant store error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch store.",
    });
  }
};

// SEARCH STORES
const searchStores = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required.",
      });
    }

    const stores = await adminService.searchStores(keyword);

    return res.status(200).json({
      success: true,
      data: stores,
    });
  } catch (error) {
    console.error("Search restaurant stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search stores.",
    });
  }
};

// UPDATE STORE
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const files = req.files;

    if (!data.business_name) {
      return res.status(400).json({
        success: false,
        message: "Business Name is required.",
      });
    }

    if (!data.cat_id) {
      return res.status(400).json({
        success: false,
        message: "Category is required.",
      });
    }

    if (
      !data.dining_option ||
      (Array.isArray(data.dining_option) && data.dining_option.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one dining option!",
      });
    }

    if (!data.minimum_delivery_time) {
      return res.status(400).json({
        success: false,
        message: "Minimum Delivery Time is required.",
      });
    }

    if (!data.maximum_delivery_time) {
      return res.status(400).json({
        success: false,
        message: "Maximum Delivery Time is required.",
      });
    }

    if (!data.delivery_time_type) {
      return res.status(400).json({
        success: false,
        message: "Delivery Time Type is required.",
      });
    }

    if (!data.business_description) {
      return res.status(400).json({
        success: false,
        message: "Description is required.",
      });
    }

    if (!data.latitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude is required.",
      });
    }

    if (!data.longitude) {
      return res.status(400).json({
        success: false,
        message: "Longitude is required.",
      });
    }

    if (!data.city_id) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    if (!data.name) {
      return res.status(400).json({
        success: false,
        message: "First Name is required.",
      });
    }

    if (!data.email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!data.mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile is required.",
      });
    }

    if (!data.restaurant_address) {
      return res.status(400).json({
        success: false,
        message: "Restaurant address is required.",
      });
    }

    if (!data.password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    const result = await adminService.updateStore(id, data, files);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update restaurant store error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update store. Please try again.",
    });
  }
};

// TOGGLE STORE STATUS
const toggleStoreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_kyc_approved } = req.body;

    if (is_kyc_approved === undefined || is_kyc_approved === null) {
      return res.status(400).json({
        success: false,
        message: "is_kyc_approved is required.",
      });
    }

    const result = await adminService.toggleStoreStatus(id, is_kyc_approved);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Toggle restaurant store status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update store status.",
    });
  }
};

// DELETE STORE
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.deleteStore(id);

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Delete restaurant store error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete store!",
    });
  }
};

// BULK DELETE STORES
const bulkDeleteStores = async (req, res) => {
  try {
    const { store_ids } = req.body;

    const result = await adminService.bulkDeleteStores(store_ids);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Bulk delete restaurant stores error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete stores!",
    });
  }
};

// GET STORE LIST CITIES
const getStoreListCities = async (req, res) => {
  try {
    const result = await adminService.getStoreListCities();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Cities Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cities.",
    });
  }
};

// GET STORE ORDERS
const getStoreOrders = async (req, res) => {
  try {
    const { id } = req.params;

    const { status, search, page = 1, pageSize = 20 } = req.query;

    const result = await adminService.getStoreOrders({
      storeId: id,
      status,
      search,
      page,
      pageSize,
    });

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get store orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch store orders.",
    });
  }
};

// GET STORE ORDER SUMMARY
const getStoreOrderSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.getStoreOrderSummary(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get store order summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order summary.",
    });
  }
};

// GET ORDER DETAILS
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await adminService.getOrderDetails(orderId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get order details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details.",
      error: error.message,
    });
  }
};

// GET STORE ITEMS
const getStoreItems = async (req, res) => {
  try {
    const { id } = req.params;

    const { status, search = "", page = 1, pageSize = 10 } = req.query;

    const result = await adminService.getStoreItems({
      storeId: id,
      status,
      search,
      page: Number(page),
      pageSize: Number(pageSize),
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("Get store items error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch store items.",
      error: error.message,
    });
  }
};

// GET STORE ITEMS SUMMARY
const getStoreItemsSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const counts = await adminService.getStoreItemsSummary(id);

    return res.status(200).json({
      success: true,
      counts,
    });
  } catch (error) {
    console.error("Get store items summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch item summary.",
      error: error.message,
    });
  }
};

// UPDATE STORE ITEM STATUS
const updateStoreItemStatus = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    const result = await adminService.toggleStoreItemStatus(id, itemId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update store item status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update item status.",
      error: error.message,
    });
  }
};

// GET ALL RESTAURANT ORDERS
const getAllRestaurantOrders = async (req, res) => {
  try {
    const result = await adminService.getAllRestaurantOrders();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get all restaurant orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant orders.",
    });
  }
};

// GET NEARBY KM
const getNearbyKm = async (req, res) => {
  try {
    const result = await adminService.getNearbyKm();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Nearby KM Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch nearby KM.",
    });
  }
};

// UPDATE NEARBY KM
const updateNearbyKm = async (req, res) => {
  try {
    const { nearby_km, status } = req.body;

    if (
      nearby_km === undefined ||
      nearby_km === null ||
      String(nearby_km).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        errors: {
          nearby_km: "Nearby KM is required.",
        },
      });
    }

    const nearbyKm = Number(nearby_km);

    if (!Number.isFinite(nearbyKm)) {
      return res.status(400).json({
        success: false,
        errors: {
          nearby_km: "Nearby KM must be a valid number.",
        },
      });
    }

    if (nearbyKm <= 0) {
      return res.status(400).json({
        success: false,
        errors: {
          nearby_km: "Nearby KM must be greater than 0.",
        },
      });
    }

    const nearbyStatus =
      status === true || status === 1 || status === "1" || status === "true"
        ? 1
        : 0;

    const result = await adminService.updateNearbyKm(nearbyKm, nearbyStatus);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update Nearby KM Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update nearby KM.",
    });
  }
};

// -----------------------------------------
// RESTAURANT-COUPON MANAGEMENT
// -----------------------------------------

// GET ALL COUPONS
const getAllCoupons = async (req, res) => {
  try {
    const result = await adminService.getAllCoupons();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Restaurant Coupons Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant coupons.",
    });
  }
};

// UPDATE COUPON STATUS
const updateCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 0 && status !== 1 && status !== "0" && status !== "1") {
      return res.status(400).json({
        success: false,
        message: "Status must be 0 or 1.",
      });
    }

    const result = await adminService.updateCouponStatus(id, Number(status));

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update Restaurant Coupon Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update coupon status.",
    });
  }
};

// GET COUPON BY ID
const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.getCouponById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Restaurant Coupon By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupon.",
    });
  }
};

// GET CATEGORIES BY IDS
const getCategoriesByIds = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Category IDs are required.",
      });
    }

    const result = await adminService.getCategoriesByIds(ids);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Categories By IDs Error:", error);

    return res.status(500).json({
      success: false,
      data: [],
      message: "Failed to fetch categories.",
    });
  }
};

// GET VENDORS BY IDS
const getVendorsByIds = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Vendor IDs are required.",
      });
    }

    const result = await adminService.getVendorsByIds(ids);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Vendors By IDs Error:", error);

    return res.status(500).json({
      success: false,
      data: [],
      message: "Failed to fetch vendors.",
    });
  }
};

// GET PRODUCTS BY IDS
const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Product IDs are required.",
      });
    }

    const result = await adminService.getProductsByIds(ids);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Products By IDs Error:", error);

    return res.status(500).json({
      success: false,
      data: [],
      message: "Failed to fetch products.",
    });
  }
};

// DELETE COUPON
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.deleteCoupon(id);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete Restaurant Coupon Error:", error);

    if (error.message === "Coupon not found.") {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon.",
    });
  }
};

// DELETE SELECTED COUPONS
const deleteSelectedCoupons = async (req, res) => {
  try {
    const { coupon_ids } = req.body;

    if (!Array.isArray(coupon_ids) || coupon_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No coupons selected.",
      });
    }

    const result = await adminService.deleteSelectedCoupons(coupon_ids);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Bulk Delete Restaurant Coupons Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete selected coupons.",
    });
  }
};

// GET COUPON EDIT DATA
const getCouponEditData = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.getCouponEditData(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Restaurant Coupon Edit Data Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupon edit data.",
    });
  }
};

// GET ADD COUPON DATA
const getAddCouponData = async (req, res) => {
  try {
    const result = await adminService.getAddCouponData();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Add Coupon Data Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupon form data.",
    });
  }
};

// ADD RESTAURANT COUPON
const addCoupon = async (req, res) => {
  try {
    const {
      title,
      code,
      discount_price,
      discount_type,
      description,
      expired_at,
      usage_limit,
      user_type,
      categories,
      vendors,
      products,
    } = req.body;

    if (
      !title ||
      !code ||
      discount_price === undefined ||
      discount_price === "" ||
      !expired_at
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const formattedCode = String(code).trim().toUpperCase();

    const formattedCouponPrice =
      discount_type === "percent" ? `${discount_price}%` : discount_price;

    const usageLimit =
      usage_limit !== undefined && usage_limit !== null && usage_limit !== ""
        ? usage_limit
        : 1;

    const userType = user_type || "all";

    const categoryIds = Array.isArray(categories) ? categories.join(",") : "";

    const vendorIds = Array.isArray(vendors) ? vendors.join(",") : "";

    const productIds = Array.isArray(products) ? products.join(",") : "";

    const data = {
      title,
      code: formattedCode,
      cupon_price: formattedCouponPrice,
      discount_type,
      description: description || "",
      expired_at,
      usage_limit: usageLimit,
      used_count: 0,
      user_type: userType,
      category_ids: categoryIds,
      vendor_ids: vendorIds,
      product_ids: productIds,
      status: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await adminService.addCoupon(data);

    return res.status(201).json(result);
  } catch (error) {
    console.error("Add Restaurant Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not save coupon. Please try again.",
    });
  }
};

// GET VENDORS BY CATEGORY
const getVendorsByCategory = async (req, res) => {
  try {
    const result = await adminService.getVendorsByCategory();

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Vendors By Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vendors.",
    });
  }
};

// GET PRODUCTS BY VENDOR IDS
const getProductsByVendorIds = async (req, res) => {
  try {
    const { vendor_ids } = req.body;

    if (!Array.isArray(vendor_ids) || vendor_ids.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const result = await adminService.getProductsByVendorIds(vendor_ids);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Products By Vendor IDs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
};

// UPDATE COUPON
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      code,
      discount_price,
      discount_type,
      description,
      expired_at,
      usage_limit,
      user_type,
      status,
      categories,
      vendors,
      products,
    } = req.body;

    if (
      !title ||
      !code ||
      discount_price === undefined ||
      discount_price === "" ||
      !expired_at ||
      !id
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const formattedCode = String(code).trim().toUpperCase();

    const formattedCouponPrice =
      discount_type === "percent" ? `${discount_price}%` : discount_price;

    const usageLimit =
      usage_limit !== undefined && usage_limit !== null && usage_limit !== ""
        ? usage_limit
        : 1;

    const userType = user_type || "all";

    const categoryIds = Array.isArray(categories) ? categories.join(",") : "";

    const vendorIds = Array.isArray(vendors) ? vendors.join(",") : "";

    const productIds = Array.isArray(products) ? products.join(",") : "";

    const data = {
      title,
      code: formattedCode,
      cupon_price: formattedCouponPrice,
      discount_type,
      description: description || "",
      expired_at,
      usage_limit: usageLimit,
      user_type: userType,
      status,
      category_ids: categoryIds,
      vendor_ids: vendorIds,
      product_ids: productIds,
      updated_at: new Date(),
    };

    const result = await adminService.updateCoupon(id, data);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Update Restaurant Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update coupon.",
    });
  }
};

// GET ALL MENUS
const getAllMenus = async (req, res) => {
  try {
    const menus = await adminService.getAllMenus();

    return res.status(200).json({
      success: true,
      data: menus,
      total: menus.length,
    });
  } catch (error) {
    console.error("Get all menus error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch menus",
    });
  }
};

// GET ADD RESTAURANT ITEM DATA
const getAddRestaurantItemData = async (req, res) => {
  try {
    const data = await adminService.getAddRestaurantItemData();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get add restaurant item data error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch add restaurant item data",
    });
  }
};

// CREATE MENU
const createMenu = async (req, res) => {
  try {
    const { name } = req.body;

    const menu = await adminService.createMenu(name || "");

    return res.status(201).json({
      success: true,
      message: "Menu added successfully",
      menu,
    });
  } catch (error) {
    console.error("Create menu error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to add menu",
    });
  }
};

// GET MENU BY ID
const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await adminService.getMenuById(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    return res.status(200).json({
      success: true,
      menu,
    });
  } catch (error) {
    console.error("Get menu error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu",
    });
  }
};

// UPDATE MENU
const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const result = await adminService.updateMenu(id, name || "");

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes made or update failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu updated successfully",
      menu: {
        id: Number(id),
        name: name.trim(),
      },
    });
  } catch (error) {
    console.error("Update menu error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update menu",
    });
  }
};

// DELETE MENU
const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.deleteMenu(id);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete menu",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete menu",
    });
  }
};

// BULK DELETE MENUS
const bulkDeleteMenus = async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await adminService.bulkDeleteMenus(ids);

    return res.status(200).json({
      success: true,
      message: `${result.affectedRows} menu(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Bulk delete menus error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Bulk delete failed",
    });
  }
};

// UPDATE MENU STATUS
const updateMenuStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await adminService.updateMenuStatus(id, status);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to update status",
      });
    }

    return res.status(200).json({
      success: true,
      message: Number(status) === 1 ? "Menu Activated" : "Menu Deactivated",
    });
  } catch (error) {
    console.error("Update menu status error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update status",
    });
  }
};

// GET ALL RESTAURANT ITEMS
const getAllRestaurantItems = async (req, res) => {
  try {
    const items = await adminService.getAllRestaurantItems();

    return res.status(200).json({
      success: true,
      data: items,
      total: items.length,
    });
  } catch (error) {
    console.error("Get restaurant items error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant items",
    });
  }
};

// GET RESTAURANT ITEM BY ID
const getRestaurantItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Item ID required",
      });
    }

    const item = await adminService.getRestaurantItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Get restaurant item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant item",
    });
  }
};

// UPDATE RESTAURANT ITEM STATUS
const updateRestaurantItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Item ID required",
      });
    }

    const result = await adminService.updateRestaurantItemStatus(
      id,
      Number(status),
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found or status unchanged",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error("Update restaurant item status error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Status update failed",
    });
  }
};

// DELETE RESTAURANT ITEM
const deleteRestaurantItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Item ID required",
      });
    }

    const result = await adminService.deleteRestaurantItem(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (result.item?.item_image) {
      const imagePath = path.join(
        __dirname,
        "../assets/images",
        result.item.item_image,
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Item and its addons deleted successfully",
    });
  } catch (error) {
    console.error("Delete restaurant item error:", error);

    return res.status(500).json({
      success: false,
      message: "Delete failed. Please try again.",
    });
  }
};

// BULK DELETE RESTAURANT ITEMS
const bulkDeleteRestaurantItems = async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await adminService.bulkDeleteRestaurantItems(ids);

    result.items.forEach((item) => {
      if (!item.item_image) return;

      const imagePath = path.join(
        __dirname,
        "../assets/images",
        item.item_image,
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    return res.status(200).json({
      success: true,
      message: `${result.affectedRows} item(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Bulk delete restaurant items error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Bulk delete failed",
    });
  }
};

// CREATE RESTAURANT ITEM
const createRestaurantItem = async (req, res) => {
  try {
    const vendor_id = req.body.vendor_id;
    const name = req.body.name;
    const description = req.body.description;
    const item_type = req.body.item_type;
    const unit_price = req.body.unit_price;
    const discount_price = req.body.discount_price;
    const sub_cat_id = req.body.sub_cat_id;
    const menu_id = req.body.menu_id;

    if (
      vendor_id === undefined ||
      vendor_id === null ||
      vendor_id === "" ||
      name === "" ||
      description === "" ||
      item_type === "" ||
      unit_price === "" ||
      discount_price === "" ||
      sub_cat_id === "" ||
      menu_id === ""
    ) {
      return res.status(400).json({
        result: false,
        msg: "Required: vendor_id, name, description, item_type, unit_price, discount_price, sub_cat_id, menu_id, item_image",
      });
    }

    const itemFile = req.files?.find((file) => file.fieldname === "item_image");

    if (!itemFile) {
      return res.status(400).json({
        result: false,
        msg: "item_image required",
      });
    }

    const insertData = {
      vendor_id,
      name,
      description,
      item_type,
      unit_price,
      discount_price,
      sub_cat_id,
      menu_id,
      item_image: itemFile.filename,
      created_at: new Date(),
    };

    const item = await adminService.createRestaurantItem(insertData);

    return res.status(200).json({
      result: true,
      msg: "Item added successfully",
      data: item,
    });
  } catch (error) {
    console.error("Restaurant item add error:", error);

    return res.status(500).json({
      result: false,
      msg: "Database insert failed",
    });
  }
};

// SAVE ADDON GROUP
const saveAddonGroup = async (req, res) => {
  try {
    const vendor_id = req.body.vendor_id;
    const item_id = req.body.item_id;
    const sub_cat_id = req.body.sub_cat_id;
    const type = req.body.type;
    const title = (req.body.title || "").trim();
    const is_required = req.body.is_required ? 1 : 0;
    const group_id = req.body.group_id;

    let optionNames = req.body.option_name || [];
    let optionPrices = req.body.option_price || [];
    let existingImages = req.body.existing_image || [];

    if (!Array.isArray(optionNames)) {
      optionNames = [optionNames];
    }

    if (!Array.isArray(optionPrices)) {
      optionPrices = [optionPrices];
    }

    if (!Array.isArray(existingImages)) {
      existingImages = [existingImages];
    }

    if (
      !vendor_id ||
      !item_id ||
      !type ||
      title === "" ||
      optionNames.length === 0
    ) {
      return res.status(400).json({
        result: false,
        msg: "Required: vendor_id, item_id, type, title, at least 1 option",
      });
    }

    if (!["addon", "topping"].includes(type)) {
      return res.status(400).json({
        result: false,
        msg: "Invalid type. Must be addon or topping.",
      });
    }

    const options = [];

    for (let idx = 0; idx < optionNames.length; idx++) {
      const name = String(optionNames[idx] || "").trim();

      if (name === "") {
        continue;
      }

      const price =
        optionPrices[idx] !== undefined ? Number(optionPrices[idx]) : 0;

      let image =
        existingImages[idx] !== undefined ? existingImages[idx] : null;

      const uploadedFile = req.files?.find(
        (file) => file.fieldname === `option_image_${idx}`,
      );

      if (type === "topping" && uploadedFile) {
        image = uploadedFile.filename;
      }

      options.push({
        name,
        price,
        image,
      });
    }

    const data = await adminService.saveAddonGroup({
      vendor_id,
      item_id,
      sub_cat_id,
      type,
      title,
      is_required,
      group_id,
      options,
    });

    if (data.deleted) {
      return res.status(200).json({
        result: true,
        msg: "All options removed, group deleted.",
        data,
      });
    }

    return res.status(200).json({
      result: true,
      msg: group_id
        ? `${type.charAt(0).toUpperCase() + type.slice(1)} group updated successfully`
        : `${type.charAt(0).toUpperCase() + type.slice(1)} group added successfully`,
      data,
    });
  } catch (error) {
    console.error("Save addon group error:", error);

    return res.status(error.statusCode || 500).json({
      result: false,
      msg: error.message || "Failed to save addon group",
    });
  }
};

// GET ITEM ADDONS
const getItemAddons = async (req, res) => {
  try {
    const itemId = req.params.id || req.body.item_id || req.query.item_id;

    if (!itemId) {
      return res.status(400).json({
        result: false,
        msg: "item_id required",
      });
    }

    const groups = await adminService.getItemAddons(itemId);

    return res.status(200).json({
      result: true,
      data: groups,
    });
  } catch (error) {
    console.error("Get item addons error:", error);

    return res.status(500).json({
      result: false,
      msg: error.message || "Failed to fetch addons",
    });
  }
};

// DELETE ADDON GROUP
const deleteAddonGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId || req.body.group_id;

    if (!groupId) {
      return res.status(400).json({
        result: false,
        msg: "group_id required",
      });
    }

    await adminService.deleteAddonGroup(groupId);

    return res.status(200).json({
      result: true,
      msg: "Deleted successfully",
    });
  } catch (error) {
    console.error("Delete addon group error:", error);

    return res.status(500).json({
      result: false,
      msg: "Failed to delete addon group",
    });
  }
};

// GET EDIT RESTAURANT ITEM DATA
const getEditRestaurantItemData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        result: false,
        msg: "Item ID required",
      });
    }

    const data = await adminService.getEditRestaurantItemData(id);

    if (!data) {
      return res.status(404).json({
        result: false,
        msg: "Item not found",
      });
    }

    return res.status(200).json({
      result: true,
      data,
    });
  } catch (error) {
    console.error("Get edit restaurant item error:", error);

    return res.status(500).json({
      result: false,
      msg: "Failed to fetch edit restaurant item data",
    });
  }
};

// UPDATE RESTAURANT ITEM
const updateRestaurantItem = async (req, res) => {
  try {
    const item_id = req.body.item_id;
    const vendor_id = req.body.vendor_id;
    const name = req.body.name;
    const description = req.body.description;
    const item_type = req.body.item_type;
    const unit_price = req.body.unit_price;
    const discount_price = req.body.discount_price;
    const sub_cat_id = req.body.sub_cat_id;
    const menu_id = req.body.menu_id;
    const remove_image = req.body.remove_image;

    if (!item_id) {
      return res.status(400).json({
        result: false,
        msg: "Item ID required",
      });
    }

    const existing = await adminService.getRestaurantItemForUpdate(item_id);

    if (!existing) {
      return res.status(404).json({
        result: false,
        msg: "Item not found",
      });
    }

      console.log("BODY:", req.body);
console.log("FILES:", req.files);
    const itemFile = req.files?.find((file) => file.fieldname === "item_image");


    let updateData = {
      vendor_id,
      name,
      description,
      item_type,
      unit_price,
      discount_price,
      sub_cat_id,
      menu_id,
      updated_at: new Date(),
    };

    if (itemFile) {
      const oldImagePath = existing.item_image
        ? path.join(__dirname, "../assets/images", existing.item_image)
        : null;

      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      updateData.item_image = itemFile.filename;

      await adminService.updateRestaurantItemImageAndData(item_id, updateData);
    } else if (remove_image === "1") {
      const oldImagePath = existing.item_image
        ? path.join(__dirname, "../assets/images", existing.item_image)
        : null;

      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      updateData.item_image = "";

      await adminService.updateRestaurantItemImageAndData(item_id, updateData);
    } else {
      await adminService.updateRestaurantItem(item_id, updateData);
    }

    return res.status(200).json({
      result: true,
      msg: "Item updated successfully",
    });
  } catch (error) {
    console.error("Restaurant item update error:", error);

    return res.status(500).json({
      result: false,
      msg: "Update failed",
    });
  }
};

// UPDATE ADDON
const updateAddon = async (req, res) => {
  try {
    const addon_id = req.body.addon_id;
    const name = String(req.body.name || "").trim();
    const price = req.body.price;

    if (
      !addon_id ||
      name === "" ||
      price === "" ||
      price === undefined ||
      price === null
    ) {
      return res.status(400).json({
        result: false,
        msg: "Required: addon_id, name, price",
      });
    }

    if (!isNaN(price) === false || Number(price) < 0) {
      return res.status(400).json({
        result: false,
        msg: "Price must be a valid positive number",
      });
    }

    const existing = await adminService.getAddonById(addon_id);

    if (!existing) {
      return res.status(404).json({
        result: false,
        msg: "Addon not found",
      });
    }

    const success = await adminService.updateAddon(addon_id, name, price);

    if (success) {
      return res.status(200).json({
        result: true,
        msg: "Addon updated successfully",
      });
    }

    return res.status(400).json({
      result: false,
      msg: "Update failed",
    });
  } catch (error) {
    console.error("Update addon error:", error);

    return res.status(500).json({
      result: false,
      msg: "Update failed",
    });
  }
};

// DELETE ADDON
const deleteAddon = async (req, res) => {
  try {
    const addon_id = req.body.addon_id;

    if (!addon_id || !isFinite(Number(addon_id))) {
      return res.status(400).json({
        result: false,
        msg: "Valid addon_id required",
      });
    }

    const numericAddonId = Number(addon_id);

    const existing = await adminService.getAddonById(numericAddonId);

    if (!existing) {
      return res.status(404).json({
        result: false,
        msg: "Addon not found or already deleted (id: " + numericAddonId + ")",
      });
    }

    try {
      await adminService.deleteAddon(numericAddonId);
    } catch (error) {
      return res.status(500).json({
        result: false,
        msg: "Delete error: " + error.message,
      });
    }

    const check = await adminService.getAddonById(numericAddonId);

    if (!check) {
      return res.status(200).json({
        result: true,
        msg: "Addon deleted successfully",
      });
    }

    return res.status(400).json({
      result: false,
      msg: "Delete failed - row still exists after delete query",
    });
  } catch (error) {
    console.error("Delete addon error:", error);

    return res.status(500).json({
      result: false,
      msg: "Delete failed",
    });
  }
};

// -----------------------------------------
// RESTAURANT-DRIVER SECTION
// -----------------------------------------

// GET DRIVERS
const getDrivers = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";

    const result = await adminService.getDrivers(search);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get restaurant drivers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch drivers. Please try again.",
    });
  }
};

// TOGGLE DRIVER STATUS
const toggleDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.toggleDriverStatus(id);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Driver toggle status error:", error);

    return res.status(500).json({
      success: false,
      message: "Database update failed",
    });
  }
};

// GET DRIVER DETAILS
const getDriverDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.getDriverDetails(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get driver details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch driver details",
    });
  }
};

// DELETE DRIVER
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.deleteDriver(id);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Delete driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete driver!",
    });
  }
};

// BULK DELETE DRIVERS
const bulkDeleteDrivers = async (req, res) => {
  try {
    const driverIds = req.body.driver_ids;

    const result = await adminService.bulkDeleteDrivers(driverIds);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Bulk delete drivers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete drivers!",
    });
  }
};

// GET DRIVER FOR EDIT
const getDriverForEdit = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await adminService.getDriverById(id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    console.error("Get driver for edit error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch driver",
    });
  }
};

// UPDATE DRIVER
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.updateDriver({
      driverId: id,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      country_code: req.body.country_code,
      phone: req.body.phone,
      full_phone: req.body.full_phone,
      identity_type: req.body.identity_type,
      identity_number: req.body.identity_number,
      remove_profile_image: req.body.remove_profile_image,
      remove_identity_image: req.body.remove_identity_image,
      profile_image: req.files?.profile_image?.[0]?.filename || "",
      identity_image: req.files?.identity_image?.[0]?.filename || "",
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("Update driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update driver.",
    });
  }
};

// SAVE DRIVER
const saveDriver = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({
        success: false,
        message: "Invalid request",
      });
    }

    const result = await adminService.saveDriver(req.body, req.files);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Save restaurant driver error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add driver. Please try again.",
    });
  }
};

// GET DRIVER ESTIMATE TIME LIST
const getDriverEstimateTimeList = async (req, res) => {
  const { search } = req.query;
  const page = Number(req.query.page) || 1;

  const data = await adminService.getDriverEstimateTimeList({
    search,
    page,
  });

  return res.status(200).json({
    success: true,
    data,
  });
};

// SAVE DRIVER ESTIMATE TIME
const saveDriverEstimateTime = async (req, res) => {
  try {
    const result = await adminService.saveDriverEstimateTime(req.body);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET DRIVER ESTIMATE TIME FOR EDIT
const getDriverEstimateTimeForEdit = async (req, res) => {
  try {
    const result = await adminService.getDriverEstimateTimeForEdit(
      req.params.id,
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE DRIVER ESTIMATE TIME
const updateDriverEstimateTime = async (req, res) => {
  try {
    const result = await adminService.updateDriverEstimateTime(
      req.params.id,
      req.body,
    );

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE DRIVER TIME STATUS
const updateDriverTimeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    const result = await adminService.updateDriverTimeStatus(id, status);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE DRIVER ESTIMATE TIME
const deleteDriverEstimateTime = async (req, res) => {
  try {
    const result = await adminService.deleteDriverEstimateTime(req.params.id);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// BULK DELETE DRIVER TIMES
const bulkDeleteDriverTimes = async (req, res) => {
  try {
    const result = await adminService.bulkDeleteDriverTimes(req.body.ids);

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// RESTAURANT BANNER LIST
const restaurantBanner = async (req, res) => {
  try {
    const search = req.query.search;
    const perPage = req.query.per_page ? req.query.per_page : 0;

    const result = await adminService.getBannerList(search, perPage);

    res.json({
      status: "success",
      banners: result.banners,
      total: result.total,
      fatch_vendor: result.vendors,
    });
  } catch (error) {
    res.json({
      status: "error",
      message: error.message,
    });
  }
};

// ADD BANNER
const restaurantBannerSave = async (req, res) => {
  try {
    const title = req.body.title;
    const vendorId = req.body.vendor_id;
    const itemId = req.body.item_id;

    if (!title || !vendorId || !itemId) {
      return res.json({
        status: "error",
        message: "Validation failed",
      });
    }

    const imagePath = req.file ? req.file.filename : "";

    const banner = await adminService.saveBanner({
      title,
      vendor_id: vendorId,
      item_id: itemId,
      image: imagePath,
      status: 1,
      created_at: new Date(),
    });

    res.json({
      status: "success",
      message: "Banner added successfully",
      banner,
    });
  } catch (error) {
    res.json({
      status: "error",
      message: "Failed to add banner",
    });
  }
};

// GET SINGLE BANNER
const restaurantBannerList = async (req, res) => {
  try {
    const banner = await adminService.getBanner(req.params.id);

    if (banner) {
      return res.json({
        status: "success",
        data: banner,
      });
    }

    res.json({
      status: "error",
      message: "Banner not found",
    });
  } catch (error) {
    res.json({
      status: "error",
      message: error.message,
    });
  }
};

// DELETE BANNER
const restaurantBannerDelete = async (req, res) => {
  try {
    const result = await adminService.removeBanner(req.params.id);

    if (!result.found) {
      return res.json({
        status: "error",
        message: "Banner not found",
      });
    }

    if (result.banner.image) {
      const imagePath = path.join(
        __dirname,
        "../assets/images",
        result.banner.image,
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (result.deleted) {
      return res.json({
        status: "success",
        message: "Banner deleted successfully",
      });
    }

    res.json({
      status: "error",
      message: "Failed to delete banner",
    });
  } catch (error) {
    res.json({
      status: "error",
      message: "Failed to delete banner",
    });
  }
};

// UPDATE BANNER STATUS
const restaurantBannerUpdateStatus = async (req, res) => {
  try {
    const bannerId = req.body.banner_id;
    const status = req.body.status;

    const result = await adminService.changeBannerStatus(bannerId, status);

    if (result.affectedRows > 0) {
      const message =
        status == 1
          ? "Banner activated successfully"
          : "Banner deactivated successfully";

      return res.json({
        status: "success",
        message,
      });
    }

    res.json({
      status: "error",
      message: "Failed to update status",
    });
  } catch (error) {
    res.json({
      status: "error",
      message: "Failed to update status",
    });
  }
};

// UPDATE BANNER
const restaurantBannerUpdate = async (req, res) => {
  try {
    const bannerId = req.body.banner_id;
    const title = req.body.title;
    const vendorId = req.body.vendor_id;
    const itemId = req.body.item_id;

    if (!bannerId || !title || !vendorId || !itemId) {
      return res.json({
        status: "error",
        message: "Validation failed",
      });
    }

    const existing = await adminService.getBanner(bannerId);

    if (!existing) {
      return res.json({
        status: "error",
        message: "Banner not found",
      });
    }

    let imagePath = existing.image;

    if (req.file) {
      imagePath = req.file.filename;
    }

    const result = await adminService.editBanner(bannerId, {
      title,
      vendor_id: vendorId,
      item_id: itemId,
      image: imagePath,
      updated_at: new Date(),
    });

    if (result.updated) {
      return res.json({
        status: "success",
        message: "Banner updated successfully",
      });
    }

    res.json({
      status: "error",
      message: "Failed to update banner",
    });
  } catch (error) {
    res.json({
      status: "error",
      message: "Failed to update banner",
    });
  }
};

// GET RESTAURANT ITEMS
const getRestaurantItems = async (req, res) => {
  try {
    const vendorId = req.params.vendor_id;

    if (!vendorId || isNaN(vendorId)) {
      return res.json({
        status: "error",
        message: "Invalid vendor id",
        data: [],
      });
    }

    const items = await adminService.getItemsByVendor(vendorId);

    res.json({
      status: "success",
      data: items,
    });
  } catch (error) {
    res.json({
      status: "error",
      message: error.message,
    });
  }
};

// GET UNREAD NOTIFICATIONS
const getUnreadNotifications = async (req, res) => {
  try {
    const data = await adminService.getUnreadNotifications();

    res.json(data);
  } catch (error) {
    console.error("Get unread notifications error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET UNREAD NOTIFICATION COUNT
const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await adminService.getUnreadNotificationCount();

    return res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error getting unread notification count:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// MARK ALL NOTIFICATIONS AS READ
const markAllAsRead = async (req, res) => {
  try {
    const data = await adminService.markAllAsRead();

    res.json(data);
  } catch (error) {
    console.error("Mark notifications as read error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET RESTAURANT NOTIFICATIONS
const getRestaurantNotifications = async (req, res) => {
  try {
    const notifications = await adminService.getRestaurantNotifications();

    res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get restaurant notifications error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// BULK DELETE NOTIFICATIONS
const bulkDeleteNotifications = async (req, res) => {
  try {
    const ids = req.body.ids;

    const data = await adminService.bulkDeleteNotifications(ids);

    res.json(data);
  } catch (error) {
    console.error("Bulk delete notifications error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// OPEN RESTAURANT NOTIFICATION
const openRestaurantNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await adminService.openRestaurantNotification(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (!data.booked_id) {
      return res.status(404).json({
        success: false,
        message: "Booking ID not found",
      });
    }

    res.json({
      success: true,
      notification: data.notification,
      booked_id: data.booked_id,
    });
  } catch (error) {
    console.error("Open restaurant notification error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET RESTAURANT NOTIFICATION TRANSACTION
const getRestaurantNotificationTransaction = async (req, res) => {
  try {
    const { booking_id } = req.params;

    if (!booking_id) {
      return res.status(404).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const order =
      await adminService.getRestaurantNotificationTransaction(booking_id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get restaurant notification transaction error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GENERATE RESTAURANT INVOICE
const generateRestaurantInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { vendor_id } = req.query;

    if (!orderId || !vendor_id) {
      return res.status(400).json({
        success: false,
        message: "Parameters orderId and vendor_id are required",
      });
    }

    const result = await adminService.getInvoiceData(orderId, vendor_id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "No order found for given orderId / vendor_id",
      });
    }

    const pdf = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `inline; filename="BHIVE INVOICE-${result.id}.pdf"`,
    );

    pdf.on("error", (error) => {
      console.error("Invoice PDF stream error:", error);

      if (!res.headersSent) {
        res.status(500).end("Unable to generate invoice PDF");
      } else {
        res.destroy(error);
      }
    });

    pdf.pipe(res);

    // DRAW INVOICE UI FROM TEMPLATE
    drawRestaurantInvoice(pdf, result);

    // ADD PAGE NUMBERS
    addInvoicePageNumbers(pdf);

    pdf.end();
  } catch (error) {
    console.error("Error generating restaurant invoice:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.destroy(error);
  }
};

// Get restaurant category list
const getRestaurantCategories = async (req, res) => {
  try {
    const categories = await adminService.getRestaurantCategories();

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching restaurant categories:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant categories",
    });
  }
};

// UPDATE RESTAURANT CATEGORY
const updateRestaurantCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.updateRestaurantCategory(
      id,
      req.body,
      req.file,
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: result,
    });
  } catch (error) {
    console.error("Error updating restaurant category:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update restaurant category",
    });
  }
};

// UPDATE RESTAURANT CATEGORY STATUS
const updateRestaurantCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await adminService.updateRestaurantCategoryStatus(id, status);

    return res.status(200).json({
      success: true,
      message: "Category status updated successfully",
    });
  } catch (error) {
    console.error("Error updating restaurant category status:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update category status",
    });
  }
};

//GET RESTAURANT SUB CATEGORY LIST
const getRestaurantSubCategories = async (req, res) => {
  try {
    const subcategories = await adminService.getRestaurantSubCategories();

    return res.status(200).json({
      success: true,
      subcategories,
    });
  } catch (error) {
    console.error("Error fetching restaurant subcategories:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant subcategories",
    });
  }
};

//CHANGE RESTAURANT SUB CATEGORY STATUS
const changeRestaurantSubCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    await adminService.changeRestaurantSubCategoryStatus(id);

    return res.status(200).json({
      success: true,
      message: "Status Changed Successfully",
    });
  } catch (error) {
    console.error("Error changing restaurant subcategory status:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change subcategory status",
    });
  }
};

//UPDATE RESTAURANT SUB CATEGORY
const updateRestaurantSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminService.updateRestaurantSubCategory(
      id,
      req.body,
      req.file,
    );

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Updated Successfully",
      subCategory: result.subCategory,
    });
  } catch (error) {
    console.error("Error updating restaurant subcategory:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const deleteRestaurantSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await adminService.deleteRestaurantSubCategory(id);

    return res.status(200).json({
      success: true,
      message: "Sub Category Deleted Successfully",
    });
  } catch (error) {
    console.error("Error deleting restaurant subcategory:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete subcategory",
    });
  }
};

const deleteSelectedRestaurantSubCategories = async (req, res) => {
  try {
    const { sub_cat_id } = req.body;

    const result =
      await adminService.deleteSelectedRestaurantSubCategories(sub_cat_id);

    return res.status(200).json({
      success: true,
      message: "Selected Sub Categories Deleted Successfully",
      receivedIds: sub_cat_id,
      affectedRows: result?.affectedRows || 0,
    });
  } catch (error) {
    console.error("Error deleting selected restaurant subcategories:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete selected subcategories",
    });
  }
};

const addRestaurantSubCategory = async (req, res) => {
  try {
    const result = await adminService.addRestaurantSubCategory(
      req.body,
      req.file,
    );

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Sub Category Added Successfully",
    });
  } catch (error) {
    console.error("Error adding restaurant subcategory:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add restaurant subcategory",
    });
  }
};

// -----------------------------------------
// GET RESTAURANT STORE KEYWORDS
// -----------------------------------------

const getRestaurantStoreKeywords = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await adminService.getRestaurantStoreById(id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const categoryKeywords =
      await adminService.getRestaurantKeywordsByCategory();

    const vendorKeywordIds =
      await adminService.getRestaurantVendorKeywordIds(id);

    res.status(200).json({
      success: true,
      categoryKeywords,
      vendorKeywordIds,
    });
  } catch (error) {
    console.error("Get Restaurant Store Keywords Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SAVE RESTAURANT VENDOR KEYWORDS
const saveRestaurantVendorKeywords = async (req, res) => {
  try {
    const vendorId = req.body.vendor_id;
    const keywordIds = req.body.keyword_ids;

    if (!vendorId) {
      return res.status(200).json({
        status: 0,
        message: "Vendor ID missing.",
      });
    }

    const result = await adminService.saveRestaurantVendorKeywords(
      vendorId,
      keywordIds,
    );

    if (result) {
      return res.status(200).json({
        status: 1,
        message: "Keywords updated successfully.",
      });
    }

    return res.status(200).json({
      status: 0,
      message: "Something went wrong.",
    });
  } catch (error) {
    console.error("Save Restaurant Vendor Keywords Error:", error);

    res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};

module.exports = {
  login,

  //SERVICE SIDE
  //sub admin management
  getSubAdmins,
  changeSubAdminStatus,
  saveSubAdmin,
  getSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
  getRoles,
  addRole,
  updateRoleStatus,
  updateRole,
  deleteRole,

  //RESTAURANT SIDE
  //dashboard
  getDashboardData,
  getOrderStats,
  getSalesChartData,
  //store management
  getPendingStores,
  getAddStoreCities,
  addStore,
  getRestaurantStores,
  getStoreById,
  searchStores,
  updateStore,
  toggleStoreStatus,
  deleteStore,
  bulkDeleteStores,
  getStoreListCities,
  getStoreOrders,
  getStoreOrderSummary,
  getOrderDetails,
  getStoreItems,
  getStoreItemsSummary,
  updateStoreItemStatus,
  getAllRestaurantOrders,
  getNearbyKm,
  updateNearbyKm,

  //Keywords
  getRestaurantStoreKeywords,
  saveRestaurantVendorKeywords,

  //category management
  getRestaurantCategories,
  updateRestaurantCategory,
  updateRestaurantCategoryStatus,
  getRestaurantSubCategories,
  changeRestaurantSubCategoryStatus,
  updateRestaurantSubCategory,
  deleteRestaurantSubCategory,
  deleteSelectedRestaurantSubCategories,
  addRestaurantSubCategory,

  //coupon management
  getAllCoupons,
  updateCouponStatus,
  getCouponById,
  getCategoriesByIds,
  getVendorsByIds,
  getProductsByIds,
  deleteCoupon,
  deleteSelectedCoupons,
  getCouponEditData,
  getVendorsByCategory,
  getAddCouponData,
  addCoupon,
  getProductsByVendorIds,
  updateCoupon,

  //product management
  getAllMenus,
  getAddRestaurantItemData,
  createMenu,
  getMenuById,
  updateMenu,
  deleteMenu,
  bulkDeleteMenus,
  updateMenuStatus,

  getAllRestaurantItems,
  getRestaurantItemById,
  updateRestaurantItemStatus,
  deleteRestaurantItem,
  bulkDeleteRestaurantItems,
  createRestaurantItem,

  saveAddonGroup,
  getItemAddons,
  deleteAddonGroup,
  getEditRestaurantItemData,
  updateRestaurantItem,
  updateAddon,
  deleteAddon,

  //driver section
  getDrivers,
  toggleDriverStatus,
  getDriverDetails,
  getDriverForEdit,
  updateDriver,
  deleteDriver,
  bulkDeleteDrivers,
  saveDriver,
  getDriverEstimateTimeList,
  saveDriverEstimateTime,
  getDriverEstimateTimeForEdit,
  updateDriverEstimateTime,
  updateDriverTimeStatus,
  deleteDriverEstimateTime,
  bulkDeleteDriverTimes,

  restaurantBanner,
  restaurantBannerSave,
  restaurantBannerList,
  restaurantBannerDelete,
  restaurantBannerUpdateStatus,
  restaurantBannerUpdate,
  getRestaurantItems,

  getUnreadNotifications,
  getUnreadNotificationCount,
  markAllAsRead,
  getRestaurantNotifications,
  bulkDeleteNotifications,
  openRestaurantNotification,
  getRestaurantNotificationTransaction,

  generateRestaurantInvoice,
};
