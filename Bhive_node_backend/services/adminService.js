const AdminModel = require("../models/adminModel");
const fs = require("fs");
const path = require("path");
const imagesPath = path.join(__dirname, "../assets/images");

//LOGIN
const login = async (email, password) => {
  return await AdminModel.login(email, password);
};
// =====================================================
// SERVICE SERVICES
// =====================================================

//..................

// =====================================================
// RESTAURANT SERVICES
// =====================================================

// -----------------------------------------
// RESTAURANT-DASHBOARD
// -----------------------------------------

// DASHBOARD
const getDashboardData = async () => {
  return await AdminModel.getDashboardData();
};

// ORDER STATS
const getOrderStats = async (filter) => {
  return await AdminModel.getOrderStats(filter);
};

// SALES CHART
const getSalesChartData = async (filter) => {
  return await AdminModel.getSalesChartData(filter);
};

// -----------------------------------------
// RESTAURANT-STORE MANAGEMENT
// -----------------------------------------

// GET PENDING STORES
const getPendingStores = async () => {
  return await AdminModel.getPendingStores();
};

// GET ADD STORE CITIES
const getAddStoreCities = async () => {
  const cities = await AdminModel.getAddStoreCities();

  return {
    success: true,
    data: cities,
  };
};

// ADD RESTAURANT STORE
const addStore = async (data, files) => {
  const emailExists = await AdminModel.checkAddStoreEmailExists(data.email);

  if (emailExists) {
    return {
      success: false,
      message: "Email already exists!",
    };
  }

  const diningOptions = Array.isArray(data.dining_option)
    ? data.dining_option
    : data.dining_option
      ? [data.dining_option]
      : [];

  if (diningOptions.length === 0) {
    return {
      success: false,
      message: "Please select at least one dining option!",
    };
  }

  // const hashedPassword = await bcrypt.hash(data.password, 10);

  const image = files?.profilePhoto?.[0] ? files.profilePhoto[0].filename : "";

  const idProof = files?.idProof?.[0] ? files.idProof[0].filename : "";

  const businessLicense = files?.businessLicense?.[0]
    ? files.businessLicense[0].filename
    : "";

  const padFile = files?.padFile?.[0] ? files.padFile[0].filename : "";

  const vendorData = {
    business_name: data.business_name.trim(),
    hst_number: data.hst_number ? data.hst_number.trim() : "",
    cat_id: data.cat_id,
    dining_option: diningOptions.join(","),
    minimum_delivery_time: data.minimum_delivery_time,
    maximum_delivery_time: data.maximum_delivery_time,
    delivery_time_type: data.delivery_time_type,
    business_description: data.business_description.trim(),
    lat: data.latitude,
    long: data.longitude,
    restaurant_address: data.restaurant_address.trim(),
    name: `${data.first_name.trim()} ${data.last_name.trim()}`,
    email_id: data.email.trim(),
    password: data.password,
    mobile: data.mobile,
    city_id: data.city_id,
    image,
    id_proof: idProof,
    id_proof_two: businessLicense,
    pad_file: padFile,
    vendor_type: "restaurant",
  };

  const insertId = await AdminModel.insertStore(vendorData);

  if (!insertId) {
    return {
      success: false,
      message: "Failed to add store. Please try again.",
    };
  }

  return {
    success: true,
    message: "Store added successfully!",
    store_id: insertId,
  };
};

// GET RESTAURANT STORE LIST WITH COUNTS
const getRestaurantStores = async () => {
  const [totalStores, activeStores, inactiveStores, newStores, stores] =
    await Promise.all([
      AdminModel.countTotalStores(),
      AdminModel.countActiveStores(),
      AdminModel.countInactiveStores(),
      AdminModel.countNewStores(),
      AdminModel.getAllStoresApprove(),
    ]);

  return {
    totalStores,
    activeStores,
    inactiveStores,
    newStores,
    stores,
  };
};

// GET STORE BY ID
const getStoreById = async (id) => {
  return await AdminModel.getStoreById(id);
};

// SEARCH STORES
const searchStores = async (keyword) => {
  return await AdminModel.searchStores(keyword);
};

// UPDATE STORE
const updateStore = async (id, data, files) => {
  const existingStore = await AdminModel.getStoreById(id);

  if (!existingStore) {
    return {
      success: false,
      message: "Store not found.",
    };
  }

  if (data.email !== undefined) {
    const emailExists = await AdminModel.checkStoreListEmailExists(
      data.email,
      id,
    );

    if (emailExists) {
      return {
        success: false,
        message: "Email already exists for another store!",
      };
    }
  }

  const vendorData = {};

  if (data.business_name !== undefined)
    vendorData.business_name = data.business_name;

  if (data.hst_number !== undefined) vendorData.hst_number = data.hst_number;

  if (data.cat_id !== undefined) vendorData.cat_id = data.cat_id;

  if (data.dining_option !== undefined) {
    const diningOptions = Array.isArray(data.dining_option)
      ? data.dining_option
      : [data.dining_option];

    vendorData.dining_option = diningOptions.join(",");
  }

  if (data.minimum_delivery_time !== undefined)
    vendorData.minimum_delivery_time = data.minimum_delivery_time;

  if (data.maximum_delivery_time !== undefined)
    vendorData.maximum_delivery_time = data.maximum_delivery_time;

  if (data.delivery_time_type !== undefined)
    vendorData.delivery_time_type = data.delivery_time_type;

  if (data.business_description !== undefined)
    vendorData.business_description = data.business_description;

  if (data.latitude !== undefined) vendorData.lat = data.latitude;

  if (data.longitude !== undefined) vendorData.long = data.longitude;

  if (data.city_id !== undefined) vendorData.city_id = data.city_id;

  if (data.name !== undefined) vendorData.name = data.name;

  if (data.email !== undefined) vendorData.email_id = data.email;

  if (data.mobile !== undefined) vendorData.mobile = data.mobile;

  if (data.restaurant_address !== undefined)
    vendorData.restaurant_address = data.restaurant_address;

  if (data.password !== undefined) vendorData.password = data.password;

  vendorData.vendor_type = "restaurant";

  // FILE UPLOADS

  if (files?.profilePhoto?.[0]) {
    vendorData.image = files.profilePhoto[0].filename;
  }

  if (files?.idProof?.[0]) {
    vendorData.id_proof = files.idProof[0].filename;
  }

  if (files?.businessLicense?.[0]) {
    vendorData.id_proof_two = files.businessLicense[0].filename;
  }

  if (files?.padFile?.[0]) {
    vendorData.pad_file = files.padFile[0].filename;
  }

  // UPDATE VENDOR
  const vendorUpdated = await AdminModel.updateVendor(id, vendorData);

  // UPDATE VENDOR ADDRESS
  if (
    data.latitude !== undefined ||
    data.longitude !== undefined ||
    data.restaurant_address !== undefined
  ) {
    await AdminModel.updateVendorAddress(id, {
      lat: data.latitude !== undefined ? data.latitude : existingStore.lat,

      long: data.longitude !== undefined ? data.longitude : existingStore.long,

      address:
        data.restaurant_address !== undefined
          ? data.restaurant_address
          : existingStore.restaurant_address,
    });
  }

  return {
    success: vendorUpdated,
    message: vendorUpdated
      ? "Store updated successfully!"
      : "Failed to update store.",
  };
};

// TOGGLE STORE STATUS
const toggleStoreStatus = async (id, is_kyc_approved) => {
  const store = await AdminModel.getStoreById(id);

  if (!store) {
    return {
      success: false,
      message: "Store not found.",
    };
  }

  const updated = await AdminModel.updateVendor(id, {
    is_kyc_approved,
  });

  return {
    success: updated,
    message: updated
      ? "Store status updated successfully!"
      : "Failed to update store status.",
  };
};

// DELETE SINGLE STORE
const deleteStore = async (id) => {
  const store = await AdminModel.getStoreById(id);

  if (!store) {
    return {
      success: false,
      message: "Store not found.",
    };
  }

  const deleted = await AdminModel.deleteStore(id);

  return {
    success: deleted,
    message: deleted
      ? "Store deleted successfully!"
      : "Failed to delete store!",
  };
};

// BULK DELETE STORES
const bulkDeleteStores = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return {
      success: false,
      message: "No stores selected!",
    };
  }

  const deletedCount = await AdminModel.bulkDeleteStores(ids);

  return {
    success: deletedCount > 0,
    message: `${deletedCount} stores deleted successfully!`,
  };
};

// GET STORE LIST CITIES
const getStoreListCities = async () => {
  const cities = await AdminModel.getStoreListCities();

  return {
    success: true,
    data: cities,
  };
};

// calculate the distance between two latitude/longitude points using the Haversine formula,
// and return the distance in kilometers.
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// NORMALIZE STATUS
const normalizeStatus = (status) => {
  if (!status) return "";

  const value = String(status).trim().toLowerCase();

  switch (value) {
    case "pending":
      return "pending";

    case "accepted":
      return "accepted";

    case "preparing":
      return "processing";

    case "ready_for_pickup":
      return "processing";

    case "picked_up":
      return "on_the_way";

    case "on_the_way":
      return "on_the_way";

    case "delivered":
      return "delivered";

    case "cancelled":
      return "cancelled";

    case "rejected":
      return "cancelled";

    case "missed":
      return "cancelled";

    case "scheduled":
      return "scheduled";

    default:
      return value;
  }
};

// GET CUSTOMER NAME
const getCustomerName = (customer) => {
  if (!customer) {
    return "N/A";
  }

  if (customer.name) {
    return customer.name;
  }

  const firstName = customer.fname || customer.first_name || "";
  const lastName = customer.lname || customer.last_name || "";

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "N/A";
};

// PREPARE ONE ORDER
const prepareOrder = async (order, vendors) => {
  const customer = await AdminModel.getCustomerById(order.user_id);

  const orderVendor = vendors.find(
    (vendor) => Number(vendor.id) === Number(order.vendor_id),
  );

  const userLat = parseFloat(order.user_latitude);
  const userLon = parseFloat(order.user_longitude);

  let nearestVendor = null;
  let nearestDistance = Infinity;

  if (Number.isFinite(userLat) && Number.isFinite(userLon)) {
    for (const vendor of vendors) {
      const vendorLat = parseFloat(vendor.lat);
      const vendorLon = parseFloat(vendor.long);

      if (!Number.isFinite(vendorLat) || !Number.isFinite(vendorLon)) {
        continue;
      }

      const distance = haversine(userLat, userLon, vendorLat, vendorLon);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestVendor = vendor;
      }
    }
  }

  let orderItems = [];

  if (order.order_items) {
    try {
      orderItems = JSON.parse(order.order_items);
    } catch (error) {
      orderItems = [];
    }
  }

  const normalizedStatus = normalizeStatus(order.order_status);

  return {
    ...order,

    vendor_info: orderVendor || null,

    nearest_vendor: nearestVendor,

    nearest_distance_km: Number.isFinite(nearestDistance)
      ? Number(nearestDistance.toFixed(2))
      : null,

    order_items_decoded: orderItems,

    customer,

    orderNumber: order.order_number || order.id,

    customerName: getCustomerName(customer),

    customerPhone: customer?.phone || customer?.mobile || "",

    customerEmail: customer?.email || customer?.email_id || "",

    restaurantName:
      nearestVendor?.business_name || nearestVendor?.name || "N/A",

    distance: Number.isFinite(nearestDistance)
      ? Number(nearestDistance.toFixed(2))
      : null,

    paymentStatus: String(order.payment_status || "").toLowerCase(),

    total: Number(order.total_amount || 0),

    status: normalizedStatus,

    createdAt: order.created_at,

    currency: "USD",
  };
};

// GET STORE ORDERS
const getStoreOrders = async ({
  storeId,
  status,
  search,
  page = 1,
  pageSize = 20,
}) => {
  const store = await AdminModel.getStoreById(storeId);

  if (!store) {
    return {
      success: false,
      message: "Store not found.",
    };
  }

  const orders = await AdminModel.getStoreOrders(storeId);

  const vendors = await AdminModel.getAllVendors();

  const preparedOrders = [];

  for (const order of orders) {
    const prepared = await prepareOrder(order, vendors);

    preparedOrders.push(prepared);
  }

  // SEARCH
  let filteredOrders = preparedOrders;

  if (search && String(search).trim()) {
    const keyword = String(search).trim().toLowerCase();

    filteredOrders = filteredOrders.filter((order) => {
      return (
        String(order.order_number || "")
          .toLowerCase()
          .includes(keyword) ||
        String(order.orderNumber || "")
          .toLowerCase()
          .includes(keyword) ||
        String(order.customerName || "")
          .toLowerCase()
          .includes(keyword) ||
        String(order.customerEmail || "")
          .toLowerCase()
          .includes(keyword) ||
        String(order.customerPhone || "")
          .toLowerCase()
          .includes(keyword) ||
        String(order.restaurantName || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }

  // STATUS FILTER
  if (status && status !== "all") {
    filteredOrders = filteredOrders.filter(
      (order) => order.status === String(status).toLowerCase(),
    );
  }

  // PAGINATION
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);

  const limit = Math.max(parseInt(pageSize, 10) || 20, 1);

  const totalCount = filteredOrders.length;

  const totalPages = Math.max(Math.ceil(totalCount / limit), 1);

  const startIndex = (currentPage - 1) * limit;

  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: paginatedOrders,
    totalCount,
    totalPages,
    page: currentPage,
    pageSize: limit,
  };
};

// GET STATUS SUMMARY FOR ONE STORE
const getStoreOrderSummary = async (storeId) => {
  const store = await AdminModel.getStoreById(storeId);

  if (!store) {
    return {
      success: false,
      message: "Store not found.",
    };
  }

  const orders = await AdminModel.getStoreOrders(storeId);

  const counts = {
    all: orders.length,
    scheduled: 0,
    pending: 0,
    accepted: 0,
    processing: 0,
    on_the_way: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const order of orders) {
    const status = normalizeStatus(order.order_status);

    if (Object.prototype.hasOwnProperty.call(counts, status)) {
      counts[status]++;
    }
  }

  return {
    success: true,
    counts,
  };
};

// GET ORDER DETAILS
const getOrderDetails = async (orderId) => {
  const order = await AdminModel.getOrderById(orderId);

  if (!order) {
    return {
      success: false,
      message: "Order not found.",
    };
  }

  // DECODE ORDER ITEMS

  let items = [];

  if (order.order_items) {
    try {
      items = JSON.parse(order.order_items);
    } catch (error) {
      items = [];
    }
  }

  // PREPARE EACH ITEM

  const preparedItems = [];

  for (const item of items) {
    let addonsDetail = [];

    if (item.addons) {
      const addonIds = String(item.addons)
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => Number.isInteger(id));

      if (addonIds.length) {
        addonsDetail = await AdminModel.getAddonsByIds(addonIds);
      }
    }

    let subCategoryName = "";

    if (item.sub_cat_id) {
      const subCategory = await AdminModel.getSubCategoryById(item.sub_cat_id);

      subCategoryName = subCategory?.name || "";
    }

    let itemCouponDiscount = 0;
    let itemCouponInfo = null;

    if (Number(item.coupon_applied) === 1 && item.coupon_id) {
      const coupon = await AdminModel.getRestaurantCouponById(item.coupon_id);

      if (coupon) {
        itemCouponInfo = coupon;

        const price = Number(item.price || 0) * Number(item.quantity || 1);

        if (coupon.discount_type === "percent") {
          itemCouponDiscount = Number(
            ((price * Number(coupon.cupon_price || 0)) / 100).toFixed(2),
          );
        } else {
          itemCouponDiscount = Math.min(Number(coupon.cupon_price || 0), price);
        }
      }
    }

    const unitPrice = Number(item.price || 0);
    const quantity = Number(item.quantity || 1);

    const total =
      item.line_total !== undefined
        ? Number(item.line_total || 0)
        : unitPrice * quantity;

    preparedItems.push({
      ...item,

      addons_detail: addonsDetail,

      sub_category_name: subCategoryName,

      coupon_discount: itemCouponDiscount,

      coupon_info: itemCouponInfo,

      total,
    });
  }

  order.order_items_decoded = preparedItems;

  // STORE

  order.vendor_info = await AdminModel.getVendorById(order.vendor_id);

  // CUSTOMER

  order.customer = await AdminModel.getCustomerById(order.user_id);

  // DELIVERY BOY

  order.delivery_boy = null;

  if (order.delivery_boy_id) {
    order.delivery_boy = await AdminModel.getDriverById(order.delivery_boy_id);
  }

  // NEAREST RESTAURANT

  const vendors = await AdminModel.getAllVendors();

  const userLat = parseFloat(order.user_latitude);
  const userLon = parseFloat(order.user_longitude);

  let nearestVendor = null;
  let nearestDistance = Infinity;

  if (Number.isFinite(userLat) && Number.isFinite(userLon)) {
    for (const vendor of vendors) {
      const vendorLat = parseFloat(vendor.lat);
      const vendorLon = parseFloat(vendor.long);

      if (!Number.isFinite(vendorLat) || !Number.isFinite(vendorLon)) {
        continue;
      }

      const distance = haversine(userLat, userLon, vendorLat, vendorLon);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestVendor = vendor;
      }
    }
  }

  order.nearest_vendor = nearestVendor;

  order.nearest_distance_km = Number.isFinite(nearestDistance)
    ? Number(nearestDistance.toFixed(2))
    : null;

  // ORDER COUPON

  order.coupon_discount = 0;
  order.coupon_info = null;

  if (Number(order.coupon_applied) === 1 && order.coupon_id) {
    const coupon = await AdminModel.getRestaurantCouponById(order.coupon_id);

    if (coupon) {
      order.coupon_info = coupon;

      const subtotal = Number(order.subtotal || 0);

      if (coupon.discount_type === "percent") {
        order.coupon_discount = Number(
          ((subtotal * Number(coupon.cupon_price || 0)) / 100).toFixed(2),
        );
      } else {
        order.coupon_discount = Math.min(
          Number(coupon.cupon_price || 0),
          subtotal,
        );
      }
    }
  }

  // SAME FALLBACK AS PHP

  if (!order.coupon_discount && order.discount) {
    order.coupon_discount = Number(order.discount || 0);
  }

  // TOTALS

  const subtotal = Number(order.subtotal || 0);

  const amountAfterDiscount = subtotal - Number(order.coupon_discount || 0);

  const hstAmount = (amountAfterDiscount * 13) / 100;

  const deliveryCharge = Number(order.delivery_charge || 0);

  const finalTotal = amountAfterDiscount + hstAmount + deliveryCharge;

  order.subtotal_amount = subtotal.toFixed(2);

  order.amount_after_discount = amountAfterDiscount.toFixed(2);

  order.hst = "13%";

  order.hst_amount = hstAmount.toFixed(2);

  order.final_total_amount = finalTotal.toFixed(2);

  return {
    success: true,
    data: order,
  };
};

// GET STORE ITEMS
const getStoreItems = async ({
  storeId,
  status,
  search,
  page = 1,
  pageSize = 10,
}) => {
  const result = await AdminModel.getStoreItems({
    storeId,
    status,
    search,
    page,
    pageSize,
  });

  const items = [];

  for (const item of result.items) {
    let addons = [];

    if (item.addion) {
      const addonIds = String(item.addion)
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => Number.isInteger(id));

      if (addonIds.length) {
        addons = await AdminModel.getItemAddons(addonIds, storeId);
      }
    }

    items.push({
      ...item,

      id: item.id,
      name: item.name || "",
      description: item.description || "",

      subCategory: item.sub_category_name || "",

      itemType: item.item_type || "",

      unitPrice: Number(item.unit_price || 0),
      discountPrice: Number(item.discount_price || 0),

      isActive: Number(item.status) === 1,

      image: item.item_image || "",
      imageUrl: item.item_image || "",

      currency: "USD",

      addons,
    });
  }

  return {
    items,
    totalCount: result.totalCount,
    totalPages: Math.ceil(result.totalCount / Number(pageSize)),
  };
};

// GET STORE ITEMS SUMMARY
const getStoreItemsSummary = async (storeId) => {
  return await AdminModel.getStoreItemsSummary(storeId);
};

// TOGGLE STORE ITEM STATUS
const toggleStoreItemStatus = async (storeId, itemId) => {
  const item = await AdminModel.getRestaurantItemById(itemId);

  if (!item) {
    return {
      success: false,
      message: "Item not found.",
    };
  }

  if (Number(item.vendor_id) !== Number(storeId)) {
    return {
      success: false,
      message: "Item does not belong to this store.",
    };
  }

  const newStatus = Number(item.status) === 1 ? 0 : 1;

  await AdminModel.updateRestaurantItemStatus(itemId, newStatus);

  return {
    success: true,
    status: newStatus,
    isActive: newStatus === 1,
    message:
      newStatus === 1
        ? "Item activated successfully."
        : "Item deactivated successfully.",
  };
};

// GET ALL RESTAURANT ORDERS
const getAllRestaurantOrders = async () => {
  try {
    const orders = await AdminModel.getAllRestaurantOrders();

    const vendors = await AdminModel.getAllVendors();

    const preparedOrders = [];

    for (const order of orders) {
      const customer = await AdminModel.getCustomerById(order.user_id);

      const orderVendor = vendors.find(
        (vendor) => Number(vendor.id) === Number(order.vendor_id),
      );

      let orderItems = [];

      if (order.order_items) {
        try {
          orderItems = JSON.parse(order.order_items);
        } catch (error) {
          console.error(
            `Failed to decode order_items for order ${order.id}:`,
            error,
          );

          orderItems = [];
        }
      }

      const normalizedStatus = normalizeStatus(order.order_status);

      preparedOrders.push({
        ...order,

        // VENDOR INFORMATION
        vendor_info: orderVendor || null,

        // CUSTOMER INFORMATION
        customer: customer || null,

        // DECODED ORDER ITEMS
        order_items_decoded: orderItems,

        // FRONTEND-FRIENDLY FIELDS
        orderNumber: order.order_number || order.id,

        customerName: getCustomerName(customer),

        customerPhone: customer?.phone || customer?.mobile || "",

        customerEmail: customer?.email || customer?.email_id || "",

        // ACTUAL VENDOR
        restaurantName:
          orderVendor?.business_name || orderVendor?.name || "N/A",

        paymentStatus: String(order.payment_status || "")
          .trim()
          .toLowerCase(),

        total: Number(order.total_amount || 0),

        status: normalizedStatus,

        createdAt: order.created_at,

        currency: "USD",
      });
    }

    // STATUS COUNTS

    const counts = {
      all: preparedOrders.length,
      pending: 0,
      scheduled: 0,
      accepted: 0,
      processing: 0,
      on_the_way: 0,
      delivered: 0,
      cancelled: 0,
    };

    preparedOrders.forEach((order) => {
      const status = order.status;

      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status]++;
      }
    });

    return {
      success: true,
      data: preparedOrders,
      counts,
    };
  } catch (error) {
    console.error("Get all restaurant orders service error:", error);

    throw error;
  }
};

// GET NEARBY KM
const getNearbyKm = async () => {
  const nearby = await AdminModel.getNearbyKm();

  return {
    success: true,
    data: nearby,
  };
};

// UPDATE NEARBY KM
const updateNearbyKm = async (nearbyKm, status) => {
  const result = await AdminModel.updateNearbyKm(nearbyKm, status);

  return {
    success: true,
    message:
      result === "updated"
        ? "Nearby KM updated successfully"
        : "Nearby KM saved successfully",
  };
};

// -----------------------------------------
// RESTAURANT-COUPON MANAGEMENT
// -----------------------------------------

// GET ALL COUPONS
const getAllCoupons = async () => {
  const coupons = await AdminModel.getAllCoupons();

  return {
    success: true,
    data: {
      coupons,
    },
  };
};

// UPDATE COUPON STATUS
const updateCouponStatus = async (id, status) => {
  await AdminModel.updateCouponStatus(id, status);

  return {
    success: true,
    message:
      Number(status) === 1
        ? "Coupon activated successfully."
        : "Coupon deactivated successfully.",
  };
};

// GET COUPON BY ID
const getCouponById = async (id) => {
  const coupon = await AdminModel.getCouponById(id);

  if (!coupon) {
    return {
      success: false,
      message: "Coupon not found.",
      data: null,
    };
  }

  return {
    success: true,
    data: {
      coupon,
    },
  };
};

// GET CATEGORIES BY IDS
const getCategoriesByIds = async (ids) => {
  const categories = await AdminModel.getCategoriesByIds(ids);

  return {
    success: true,
    data: categories,
  };
};

// GET VENDORS BY IDS
const getVendorsByIds = async (ids) => {
  const vendors = await AdminModel.getVendorsByIds(ids);

  return {
    success: true,
    data: vendors,
  };
};

// GET PRODUCTS BY IDS
const getProductsByIds = async (ids) => {
  const products = await AdminModel.getProductsByIds(ids);

  return {
    success: true,
    data: products,
  };
};

// DELETE COUPON
const deleteCoupon = async (id) => {
  await AdminModel.deleteCoupon(id);

  return {
    success: true,
    message: "Coupon deleted successfully!",
  };
};

// DELETE SELECTED COUPONS
const deleteSelectedCoupons = async (ids) => {
  const result = await AdminModel.deleteSelectedCoupons(ids);

  return {
    success: true,
    message: `${result.affectedRows} coupon(s) deleted successfully!`,
  };
};

// GET ADD COUPON DATA
const getAddCouponData = async () => {
  const data = await AdminModel.getAddCouponData();

  return {
    success: true,
    data,
  };
};

// ADD RESTAURANT COUPON
const addCoupon = async (data) => {
  await AdminModel.addCoupon(data);

  return {
    success: true,
    message: "Coupon added successfully!",
  };
};

// GET COUPON EDIT DATA
const getCouponEditData = async (id) => {
  const data = await AdminModel.getCouponEditData(id);

  if (!data) {
    return {
      success: false,
      message: "Coupon not found.",
      data: null,
    };
  }

  return {
    success: true,
    data,
  };
};

// GET VENDORS BY CATEGORY
const getVendorsByCategory = async () => {
  const vendors = await AdminModel.getVendorsByCategory();

  return {
    success: true,
    data: vendors,
  };
};

// GET PRODUCTS BY VENDOR IDS
const getProductsByVendorIds = async (vendorIds) => {
  const products = await AdminModel.getProductsByVendorIds(vendorIds);

  return {
    success: true,
    data: products,
  };
};

// UPDATE COUPON
const updateCoupon = async (id, data) => {
  const editData = await AdminModel.getCouponEditData(id);

  if (!editData) {
    return {
      success: false,
      message: "Coupon not found.",
    };
  }

  await AdminModel.updateCoupon(id, data);

  return {
    success: true,
    message: "Coupon updated successfully!",
  };
};

// -----------------------------------------
// RESTAURANT-PRODUCT MANAGEMENT
// -----------------------------------------

// GET ALL MENUS
const getAllMenus = async () => {
  return await AdminModel.getAllMenus();
};

// GET ADD RESTAURANT ITEM DATA
const getAddRestaurantItemData = async () => {
  return await AdminModel.getAddRestaurantItemData();
};

// CREATE MENU
const createMenu = async (name) => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    const error = new Error("Menu name is required");
    error.statusCode = 400;
    throw error;
  }

  const exists = await AdminModel.nameExists(trimmedName);

  if (exists) {
    const error = new Error("Menu name already exists");
    error.statusCode = 409;
    throw error;
  }

  const id = await AdminModel.createMenu(trimmedName);

  return {
    id,
    name: trimmedName,
    status: 1,
  };
};

// GET MENU BY ID
const getMenuById = async (id) => {
  return await AdminModel.getMenuById(id);
};

// UPDATE MENU
const updateMenu = async (id, name) => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    const error = new Error("Menu name is required");
    error.statusCode = 400;
    throw error;
  }

  const exists = await AdminModel.nameExists(trimmedName, id);

  if (exists) {
    const error = new Error("Menu name already exists");
    error.statusCode = 409;
    throw error;
  }

  return await AdminModel.updateMenu(id, trimmedName);
};

// DELETE MENU
const deleteMenu = async (id) => {
  return await AdminModel.deleteMenu(id);
};

// BULK DELETE MENUS
const bulkDeleteMenus = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error("No menu selected");
    error.statusCode = 400;
    throw error;
  }

  return await AdminModel.bulkDeleteMenus(ids);
};

// UPDATE MENU STATUS
const updateMenuStatus = async (id, status) => {
  const numericStatus = Number(status);

  if (![0, 1].includes(numericStatus)) {
    const error = new Error("Invalid menu status");
    error.statusCode = 400;
    throw error;
  }

  return await AdminModel.updateMenuStatus(id, numericStatus);
};

// GET ALL RESTAURANT ITEMS
const getAllRestaurantItems = async () => {
  return AdminModel.getAllRestaurantItems();
};

// GET RESTAURANT ITEM BY ID
const getRestaurantItemById = async (id) => {
  return AdminModel.getRestaurantItemById(id);
};

// UPDATE RESTAURANT ITEM STATUS
const updateRestaurantItemStatus = async (id, status) => {
  if (status !== 0 && status !== 1) {
    const error = new Error("Invalid status");
    error.statusCode = 400;
    throw error;
  }

  return AdminModel.updateRestaurantItemStatus(id, status);
};

// DELETE RESTAURANT ITEM
const deleteRestaurantItem = async (id) => {
  return AdminModel.deleteRestaurantItem(id);
};

// BULK DELETE RESTAURANT ITEMS
const bulkDeleteRestaurantItems = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error("No items selected");
    error.statusCode = 400;
    throw error;
  }

  return AdminModel.bulkDeleteRestaurantItems(ids);
};

// CREATE RESTAURANT ITEM
const createRestaurantItem = async (data) => {
  const id = await AdminModel.createRestaurantItem(data);

  return await AdminModel.getRestaurantItemById(id);
};

// SAVE ADDON GROUP
const saveAddonGroup = async (data) => {
  const {
    vendor_id,
    item_id,
    sub_cat_id,
    type,
    title,
    is_required,
    group_id,
    options,
  } = data;

  if (
    !vendor_id ||
    !item_id ||
    !type ||
    title === "" ||
    !options ||
    options.length === 0
  ) {
    const error = new Error(
      "Required: vendor_id, item_id, type, title, at least 1 option",
    );
    error.statusCode = 400;
    throw error;
  }

  if (!["addon", "topping"].includes(type)) {
    const error = new Error("Invalid type. Must be addon or topping.");
    error.statusCode = 400;
    throw error;
  }

  const isUpdate = !!group_id;

  let finalGroupId = group_id;

  if (isUpdate) {
    const group = await AdminModel.getAddonGroupByIdAndItemId(
      group_id,
      item_id,
    );

    if (!group) {
      const error = new Error("Group not found for this item.");
      error.statusCode = 404;
      throw error;
    }

    await AdminModel.updateAddonGroup(group_id, title, is_required);

    await AdminModel.deleteAddonOptionsByGroupId(group_id);
  } else {
    finalGroupId = await AdminModel.createAddonGroup({
      item_id,
      vendor_id,
      sub_cat_id,
      type,
      title,
      is_required,
    });
  }

  if (!options.length) {
    await AdminModel.deleteAddonGroup(finalGroupId);

    return {
      deleted: true,
      group_id: finalGroupId,
      type,
    };
  }

  const insertData = options
    .filter((option) => option.name !== "")
    .map((option) => ({
      group_id: finalGroupId,
      name: option.name,
      price: option.price,
      vendor_id,
      item_id,
      image: option.image || null,
    }));

  if (insertData.length === 0) {
    await AdminModel.deleteAddonGroup(finalGroupId);

    return {
      deleted: true,
      group_id: finalGroupId,
      type,
    };
  }

  await AdminModel.insertAddonOptions(insertData);

  const savedOptions = await AdminModel.getAddonOptionsByGroupId(finalGroupId);

  return {
    group_id: finalGroupId,
    type,
    title,
    is_required,
    options: savedOptions,
  };
};

// GET ITEM ADDONS
const getItemAddons = async (itemId) => {
  const groups = await AdminModel.getAddonGroupsByItemId(itemId);

  for (const group of groups) {
    group.options = await AdminModel.getAddonOptionsByGroupId(group.id);
  }

  return groups;
};

// DELETE ADDON GROUP
const deleteAddonGroup = async (groupId) => {
  return await AdminModel.deleteAddonGroup(groupId);
};

// GET EDIT RESTAURANT ITEM DATA
const getEditRestaurantItemData = async (id) => {
  return await AdminModel.getEditRestaurantItemData(id);
};

// UPDATE RESTAURANT ITEM
const updateRestaurantItem = async (itemId, data) => {
  return await AdminModel.updateRestaurantItem(itemId, data);
};

// UPDATE RESTAURANT ITEM IMAGE
const updateRestaurantItemImage = async (itemId, image) => {
  return await AdminModel.updateRestaurantItemImage(itemId, image);
};

// UPDATE RESTAURANT ITEM IMAGE AND DATA
const updateRestaurantItemImageAndData = async (itemId, data) => {
  return await AdminModel.updateRestaurantItemImageAndData(itemId, data);
};

// GET RESTAURANT ITEM FOR UPDATE
const getRestaurantItemForUpdate = async (itemId) => {
  return await AdminModel.getRestaurantItemForUpdate(itemId);
};

// UPDATE ADDON
const updateAddon = async (addonId, name, price) => {
  return await AdminModel.updateAddon(addonId, name, price);
};

// GET ADDON BY ID
const getAddonById = async (addonId) => {
  return await AdminModel.getAddonById(addonId);
};

// DELETE ADDON
const deleteAddon = async (addonId) => {
  return await AdminModel.deleteAddon(addonId);
};

// -----------------------------------------
// RESTAURANT-DRIVER SECTION
// -----------------------------------------

// GET DRIVERS
const getDrivers = async (search = "") => {
  let drivers;

  if (search) {
    drivers = await AdminModel.searchDrivers(search);
  } else {
    drivers = await AdminModel.getAllDrivers();
  }

  const totalDrivers = await AdminModel.countDrivers(search);
  const activeDrivers = await AdminModel.countActiveDrivers(search);
  const inactiveDrivers = totalDrivers - activeDrivers;

  return {
    drivers,
    total_drivers: totalDrivers,
    active_drivers: activeDrivers,
    inactive_drivers: inactiveDrivers,
  };
};

// TOGGLE DRIVER STATUS
const toggleDriverStatus = async (id) => {
  const driver = await AdminModel.getDriverById(id);

  if (driver) {
    const newStatus = driver.status == 1 ? 0 : 1;

    const update = await AdminModel.updateDriverStatus(id, newStatus);

    if (update) {
      return {
        success: true,
        status: newStatus,
      };
    } else {
      return {
        success: false,
        message: "Database update failed",
      };
    }
  } else {
    return {
      success: false,
      message: "Driver not found",
    };
  }
};

// GET DRIVER DETAILS
const getDriverDetails = async (id) => {
  const driver = await AdminModel.getDriverById(id);

  if (!driver) {
    return {
      success: false,
      message: "Driver not found",
    };
  }

  const deliveredOrders = await AdminModel.getDeliveredOrdersByDriverId(id);

  const totalDelivered = deliveredOrders.length;
  const totalDriverEarning = totalDelivered * 5;

  return {
    success: true,
    data: {
      driver,
      delivered_orders: deliveredOrders,
      total_delivered: totalDelivered,
      total_driver_earning: totalDriverEarning,
    },
  };
};

// DELETE DRIVER
const deleteDriver = async (id) => {
  const driver = await AdminModel.getDriverById(id);

  if (driver) {
    if (driver.profile_image) {
      const imagePath = path.join(imagesPath, driver.profile_image);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (driver.identity_image) {
      const identityImagePath = path.join(imagesPath, driver.identity_image);

      if (fs.existsSync(identityImagePath)) {
        fs.unlinkSync(identityImagePath);
      }
    }

    const deleted = await AdminModel.deleteDriver(id);

    if (deleted) {
      return {
        success: true,
        message: "Driver deleted successfully!",
      };
    } else {
      return {
        success: false,
        message: "Failed to delete driver!",
      };
    }
  } else {
    return {
      success: false,
      message: "Driver not found!",
    };
  }
};

// BULK DELETE DRIVERS
const bulkDeleteDrivers = async (driverIds) => {
  if (!driverIds || driverIds.length === 0) {
    return {
      success: false,
      message: "No drivers selected",
    };
  }

  let deletedCount = 0;
  let failedCount = 0;

  for (const id of driverIds) {
    const driver = await AdminModel.getDriverById(id);

    if (driver) {
      if (driver.profile_image) {
        const profileImagePath = path.join(imagesPath, driver.profile_image);

        if (fs.existsSync(profileImagePath)) {
          fs.unlinkSync(profileImagePath);
        }
      }

      if (driver.identity_image) {
        const identityImagePath = path.join(imagesPath, driver.identity_image);

        if (fs.existsSync(identityImagePath)) {
          fs.unlinkSync(identityImagePath);
        }
      }

      const deleted = await AdminModel.deleteDriver(id);

      if (deleted) {
        deletedCount++;
      } else {
        failedCount++;
      }
    } else {
      failedCount++;
    }
  }

  if (deletedCount > 0) {
    return {
      success: true,
      message: deletedCount + " driver(s) deleted successfully!",
    };
  } else {
    return {
      success: false,
      message: "Failed to delete drivers!",
    };
  }
};

// GET DRIVER BY ID
const getDriverById = async (id) => {
  return await AdminModel.getDriverById(id);
};

// UPDATE DRIVER
const updateDriver = async ({
  driverId,
  first_name,
  last_name,
  email,
  country_code,
  phone,
  full_phone,
  identity_type,
  identity_number,
  profile_image,
  identity_image,
  remove_profile_image,
  remove_identity_image,
}) => {
  const existingDriver = await AdminModel.getDriverById(driverId);

  if (!existingDriver) {
    return {
      success: false,
      message: "Driver not found",
    };
  }

  const emailAlreadyExists = await AdminModel.emailExists(email, driverId);

  if (emailAlreadyExists) {
    return {
      success: false,
      message: "Email already exists",
      errors: {
        email: "Email is already taken",
      },
    };
  }

  let phone_local;

  if (country_code && full_phone && full_phone.indexOf(country_code) === 0) {
    phone_local = full_phone.substring(country_code.length).replace(/^ +/, "");
  } else {
    phone_local = phone;
  }

  const phoneAlreadyExists = await AdminModel.phoneExists(
    phone_local,
    driverId,
  );

  if (phoneAlreadyExists) {
    return {
      success: false,
      message: "Phone already exists",
      errors: {
        phone: "Phone is already taken",
      },
    };
  }

  const errors = {};

  if (!first_name || !String(first_name).trim()) {
    errors.first_name = "The First name field is required.";
  }

  if (!last_name || !String(last_name).trim()) {
    errors.last_name = "The Last name field is required.";
  }

  if (!email || !String(email).trim()) {
    errors.email = "The Email field is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    errors.email = "The Email field must contain a valid email address.";
  }

  if (!phone || !String(phone).trim()) {
    errors.phone = "The Phone field is required.";
  }

  if (!identity_type || !String(identity_type).trim()) {
    errors.identity_type = "The Identity type field is required.";
  }

  if (!identity_number || !String(identity_number).trim()) {
    errors.identity_number = "The Identity number field is required.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Validation failed",
      errors,
    };
  }

  let finalProfileImage = existingDriver.profile_image || "";

  if (remove_profile_image === "1") {
    if (existingDriver.profile_image) {
      const oldProfilePath = path.join(
        imagesPath,
        existingDriver.profile_image,
      );

      if (fs.existsSync(oldProfilePath)) {
        fs.unlinkSync(oldProfilePath);
      }
    }

    finalProfileImage = "";
  }

  if (profile_image) {
    if (existingDriver.profile_image && remove_profile_image !== "1") {
      const oldProfilePath = path.join(
        imagesPath,
        existingDriver.profile_image,
      );

      if (fs.existsSync(oldProfilePath)) {
        fs.unlinkSync(oldProfilePath);
      }
    }

    finalProfileImage = profile_image;
  }

  let finalIdentityImage = existingDriver.identity_image || "";

  if (remove_identity_image === "1") {
    if (existingDriver.identity_image) {
      const oldIdentityPath = path.join(
        imagesPath,
        existingDriver.identity_image,
      );

      if (fs.existsSync(oldIdentityPath)) {
        fs.unlinkSync(oldIdentityPath);
      }
    }

    finalIdentityImage = "";
  }

  if (identity_image) {
    if (existingDriver.identity_image && remove_identity_image !== "1") {
      const oldIdentityPath = path.join(
        imagesPath,
        existingDriver.identity_image,
      );

      if (fs.existsSync(oldIdentityPath)) {
        fs.unlinkSync(oldIdentityPath);
      }
    }

    finalIdentityImage = identity_image;
  }

  const driverData = {
    first_name,
    last_name,
    email,
    country_code,
    phone: phone_local,
    profile_image: finalProfileImage,
    identity_type,
    identity_number,
    identity_image: finalIdentityImage,
    updated_at: new Date(),
  };

  await AdminModel.updateDriver(driverId, driverData);

  return {
    success: true,
    message: "Driver updated successfully",
  };
};

// SAVE DRIVER
const saveDriver = async (body, files) => {
  const errors = {};

  if (!body.first_name || !String(body.first_name).trim()) {
    errors.first_name = "The First name field is required.";
  }

  if (!body.last_name || !String(body.last_name).trim()) {
    errors.last_name = "The Last name field is required.";
  }

  if (!body.email || !String(body.email).trim()) {
    errors.email = "The Email field is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email).trim())) {
    errors.email = "The Email field must contain a valid email address.";
  }

  if (!body.phone || !String(body.phone).trim()) {
    errors.phone = "The Phone field is required.";
  }

  if (!body.identity_type || !String(body.identity_type).trim()) {
    errors.identity_type = "The Identity type field is required.";
  }

  if (!body.identity_number || !String(body.identity_number).trim()) {
    errors.identity_number = "The Identity number field is required.";
  }

  if (!body.latitude || !String(body.latitude).trim()) {
    errors.latitude = "The Latitude field is required.";
  }

  if (!body.longitude || !String(body.longitude).trim()) {
    errors.longitude = "The Longitude field is required.";
  }

  if (!body.address || !String(body.address).trim()) {
    errors.address = "The Address field is required.";
  }

  if (!errors.email) {
    const emailExists = await AdminModel.createEmailExists(
      String(body.email).trim(),
    );

    if (emailExists) {
      errors.email = "The Email field must contain a unique value.";
    }
  }

  if (!errors.phone) {
    const phoneExists = await AdminModel.createPhoneExists(
      String(body.phone).trim(),
    );

    if (phoneExists) {
      errors.phone = "The Phone field must contain a unique value.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Validation failed",
      errors,
    };
  }

  if (!files || !files.identity_image || !files.identity_image.length) {
    return {
      success: false,
      message: "Validation failed",
      errors: {
        identity_image: "Identity image is required.",
      },
    };
  }

  const full_phone = body.full_phone;
  const country_code = body.country_code;
  const phone = body.phone;

  let phone_local;

  if (
    country_code &&
    full_phone &&
    String(full_phone).startsWith(String(country_code))
  ) {
    phone_local = String(full_phone)
      .substring(String(country_code).length)
      .replace(/^ +/, "");
  } else {
    phone_local = phone;
  }

  let profile_image = "";

  if (files.profile_image && files.profile_image.length) {
    profile_image = files.profile_image[0].filename || "";
  }

  const identity_image = files.identity_image[0].filename || "";

  if (!identity_image) {
    return {
      success: false,
      message: "Failed to upload identity image.",
    };
  }

  const driverData = {
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    country_code,
    phone: phone_local,
    profile_image,
    identity_type: body.identity_type,
    identity_number: body.identity_number,
    identity_image,
    lat: body.latitude,
    long: body.longitude,
    address: body.address,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const result = await AdminModel.createDriver(driverData);

  if (result.affectedRows > 0) {
    return {
      success: true,
      message: "Driver added successfully",
    };
  }

  return {
    success: false,
    message: "Failed to add driver. Please try again.",
  };
};

// GET DRIVER ESTIMATE TIME LIST
const getDriverEstimateTimeList = async ({ search, page }) => {
  const perPage = 10;

  const totalRows = await AdminModel.getDriverEstimateTimeCount(search);

  const currentPage = page || 1;

  const offset = (currentPage - 1) * perPage;

  const driverTimes = await AdminModel.getDriverEstimateTimes(
    search,
    perPage,
    offset,
  );

  return {
    driver_times: driverTimes,
    total_rows: totalRows,
    current_page: currentPage,
    per_page: perPage,
    search,
    title: "Driver Estimate Time List",
  };
};

// SAVE DRIVER ESTIMATE TIME
const saveDriverEstimateTime = async (body) => {
  const errors = {};

  if (!body.range_km || !String(body.range_km).trim()) {
    errors.range_km = "The Range KM field is required.";
  }

  if (!body.from_time || !String(body.from_time).trim()) {
    errors.from_time = "The From Time field is required.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const rangeKm = `${body.range_km} km`;

  const exists = await AdminModel.checkRangeExists(rangeKm);

  if (exists) {
    return {
      success: false,
      errors: {
        range_km: "The Range KM field must contain a unique value.",
      },
    };
  }

  const insertData = {
    range_km: rangeKm,
    from_time: body.from_time,
    status: body.status ? 1 : 0,
    created_at: new Date(),
  };

  const result = await AdminModel.createDriverEstimateTime(insertData);

  if (result.affectedRows > 0) {
    return {
      success: true,
      message: "Driver estimate time added successfully",
    };
  }

  return {
    success: false,
    message: "Failed to add driver estimate time",
  };
};

// GET DRIVER ESTIMATE TIME FOR EDIT
const getDriverEstimateTimeForEdit = async (id) => {
  const driverTime = await AdminModel.getDriverEstimateTimeById(id);

  if (!driverTime) {
    return {
      success: false,
      message: "Driver estimate time not found",
    };
  }

  return {
    success: true,
    data: driverTime,
  };
};

// UPDATE DRIVER ESTIMATE TIME
const updateDriverEstimateTime = async (id, body) => {
  const errors = {};

  if (!body.range_km || !String(body.range_km).trim()) {
    errors.range_km = "The Range KM field is required.";
  }

  if (!body.from_time || !String(body.from_time).trim()) {
    errors.from_time = "The From Time field is required.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  let rangeKm = String(body.range_km).trim();

  if (!rangeKm.includes("km")) {
    rangeKm += " km";
  }

  const exists = await AdminModel.checkDriverEstimateTimeRangeExists(
    rangeKm,
    id,
  );

  if (exists) {
    return {
      success: false,
      message: "Range KM already exists",
    };
  }

  const updateData = {
    range_km: rangeKm,
    from_time: body.from_time,
    status: body.status ? 1 : 0,
    updated_at: new Date(),
  };

  const result = await AdminModel.updateDriverEstimateTime(id, updateData);

  if (result.affectedRows >= 0) {
    return {
      success: true,
      message: "Driver estimate time updated successfully",
    };
  }

  return {
    success: false,
    message: "No changes made",
  };
};

// UPDATE DRIVER TIME STATUS
const updateDriverTimeStatus = async (id, status) => {
  const result = await AdminModel.updateDriverEstimateTimeStatus(id, status);

  if (result.affectedRows > 0) {
    return {
      success: true,
      message: "Status updated successfully",
    };
  }

  return {
    success: false,
    message: "Failed to update status",
  };
};

// DELETE DRIVER ESTIMATE TIME
const deleteDriverEstimateTime = async (id) => {
  const result = await AdminModel.deleteDriverEstimateTime(id);

  if (result.affectedRows > 0) {
    return {
      success: true,
      message: "Driver estimate time deleted successfully",
    };
  }

  return {
    success: false,
    message: "Failed to delete",
  };
};

// BULK DELETE DRIVER TIMES
const bulkDeleteDriverTimes = async (ids) => {
  if (!ids || ids.length === 0) {
    return {
      success: false,
      message: "No records selected",
    };
  }

  await AdminModel.bulkDeleteDriverTimes(ids);

  return {
    success: true,
    message: `${ids.length} records deleted successfully`,
  };
};

// BANNER LIST
const getBannerList = async (search, perPage) => {
  const limit = 10;
  const offset = perPage ? Number(perPage) : 0;

  const banners = await AdminModel.getBanners(search, limit, offset);

  const total = await AdminModel.countBanners(search);

  const vendors = await AdminModel.getRestaurantVendors();

  return {
    banners,
    total,
    vendors,
  };
};

// ADD BANNER
const saveBanner = async (data) => {
  const newId = await AdminModel.createBanner(data);

  const banner = await AdminModel.getBannerWithDetails(newId);

  return banner;
};

// GET SINGLE BANNER
const getBanner = async (id) => {
  return await AdminModel.getBannerById(id);
};

// DELETE BANNER
const removeBanner = async (id) => {
  const banner = await AdminModel.getBannerById(id);

  if (!banner) {
    return {
      found: false,
    };
  }

  const result = await AdminModel.deleteBanner(id);

  return {
    found: true,
    deleted: result.affectedRows > 0,
    banner,
  };
};

// UPDATE BANNER STATUS
const changeBannerStatus = async (bannerId, status) => {
  const result = await AdminModel.updateBannerStatus(bannerId, status);

  return result;
};

// UPDATE BANNER
const editBanner = async (bannerId, data) => {
  const existing = await AdminModel.getBannerById(bannerId);

  if (!existing) {
    return {
      found: false,
    };
  }

  const result = await AdminModel.updateBanner(bannerId, data);

  return {
    found: true,
    updated: result.affectedRows > 0,
  };
};

// RESTAURANT ITEMS
const getItemsByVendor = async (vendorId) => {
  return await AdminModel.getRestaurantItems(vendorId);
};

// Get unread notifications
const getUnreadNotifications = async () => {
  const notifications = await AdminModel.getUnreadNotifications();

  return {
    count: notifications.length,
    notifications,
  };
};

// Get unread restaurant-order notification count
const getUnreadNotificationCount = async () => {
  return AdminModel.getUnreadNotificationCount();
};

// Mark all unread notifications as read
const markAllAsRead = async () => {
  await AdminModel.markAllAsRead();

  return {
    success: true,
  };
};

// Get restaurant notification list
const getRestaurantNotifications = async () => {
  return await AdminModel.getRestaurantNotifications();
};

// Bulk delete restaurant notifications
const bulkDeleteNotifications = async (ids) => {
  if (ids && ids.length > 0) {
    await AdminModel.bulkDeleteNotifications(ids);
  }

  return {
    success: true,
    message: `${ids ? ids.length : 0} notifications deleted successfully`,
  };
};

// Open restaurant notification
const openRestaurantNotification = async (id) => {
  const notification = await AdminModel.getRestaurantNotificationById(id);

  if (!notification) {
    return null;
  }

  await AdminModel.markNotificationAsSeen(id);

  if (!notification.booked_id) {
    return {
      notification,
      booked_id: null,
    };
  }

  return {
    notification,
    booked_id: notification.booked_id,
  };
};

// Get restaurant notification transaction/order
const getRestaurantNotificationTransaction = async (bookingId) => {
  const order = await AdminModel.getRestaurantOrderById(bookingId);

  if (!order) {
    return null;
  }

  const items = JSON.parse(order.order_items || "[]");

  for (const item of items) {
    item.addons_detail = [];

    if (item.addons) {
      const addonIds = String(item.addons)
        .split(",")
        .filter((id) => id);

      if (addonIds.length > 0) {
        item.addons_detail = await AdminModel.getAddonsByIds(addonIds);
      }
    }

    item.sub_category_name = "";

    if (item.sub_cat_id) {
      const subCategory = await AdminModel.getSubCategoryById(item.sub_cat_id);

      item.sub_category_name = subCategory?.name || "";
    }

    item.coupon_discount = 0;
    item.coupon_info = null;

    if (item.coupon_applied && item.coupon_applied == 1 && item.coupon_id) {
      const coupon = await AdminModel.getCouponByIdForNotification(
        item.coupon_id,
      );

      if (coupon) {
        item.coupon_info = coupon;

        const price = Number(item.price || 0) * Number(item.quantity || 0);

        if (coupon.discount_type === "percent") {
          item.coupon_discount = Number(
            ((price * Number(coupon.cupon_price)) / 100).toFixed(2),
          );
        } else {
          item.coupon_discount = Math.min(Number(coupon.cupon_price), price);
        }
      }
    }

    item.total =
      item.line_total !== undefined
        ? item.line_total
        : Number(item.price || 0) * Number(item.quantity || 0);
  }

  order.order_items_decoded = items;

  // Vendor
  order.vendor_info = await AdminModel.getVendorById(order.vendor_id);

  // Customer
  order.customer = await AdminModel.getCustomerById(order.user_id);

  // Delivery boy
  order.delivery_boy = null;

  if (order.delivery_boy_id) {
    order.delivery_boy = await AdminModel.getDriverByIdForNotification(
      order.delivery_boy_id,
    );
  }

  // Find nearest restaurant vendor
  const vendors = await AdminModel.getRestaurantVendorsForNotification();

  let nearestVendor = null;
  let nearestDistance = Number.MAX_SAFE_INTEGER;

  const userLat = Number(order.user_latitude);
  const userLon = Number(order.user_longitude);

  for (const vendor of vendors) {
    if (!vendor.lat || !vendor.long) {
      continue;
    }

    const distance = haversine(
      userLat,
      userLon,
      Number(vendor.lat),
      Number(vendor.long),
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestVendor = vendor;
    }
  }

  order.nearest_vendor = nearestVendor;
  order.nearest_distance_km = Number(nearestDistance.toFixed(2));

  // Order-level coupon
  order.coupon_discount = 0;
  order.coupon_info = null;

  if (order.coupon_applied && order.coupon_applied == 1 && order.coupon_id) {
    const coupon = await AdminModel.getCouponByIdForNotification(
      order.coupon_id,
    );

    if (coupon) {
      order.coupon_info = coupon;

      const subtotal = Number(order.subtotal || 0);

      if (coupon.discount_type === "percent") {
        order.coupon_discount = Number(
          ((subtotal * Number(coupon.cupon_price)) / 100).toFixed(2),
        );
      } else {
        order.coupon_discount = Math.min(Number(coupon.cupon_price), subtotal);
      }
    }
  }

  if (!order.coupon_discount && order.discount) {
    order.coupon_discount = Number(order.discount);
  }

  // PHP number_format(..., 2)
  order.subtotal_amount = Number(order.subtotal || 0).toFixed(2);

  const amountAfterDiscount =
    Number(order.subtotal || 0) - Number(order.coupon_discount || 0);

  order.amount_after_discount = amountAfterDiscount.toFixed(2);

  const hstAmount = (amountAfterDiscount * 13) / 100;

  order.hst = "13%";
  order.hst_amount = hstAmount.toFixed(2);

  const finalTotal =
    amountAfterDiscount + hstAmount + Number(order.delivery_charge || 0);

  order.final_total_amount = finalTotal.toFixed(2);

  return order;
};

// -----------------------------------------
// RESTAURANT-Invoice
// -----------------------------------------

const BACKEND_BASE_URL = "http://localhost:6010";

const buildImageUrl = (path) => {
  path = String(path || "").trim();

  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.includes("/")) {
    return `${BACKEND_BASE_URL}/uploads/${path.replace(/^\/+/, "")}`;
  }

  return `${BACKEND_BASE_URL}/uploads/${path}`;
};

const formatNumber = (value) => {
  return Number(value || 0).toFixed(2);
};

const getInvoiceData = async (orderId, vendorId) => {
  const order = await AdminModel.getInvoiceOrder(orderId, vendorId);

  if (!order) {
    return null;
  }

  let customer = null;

  if (order.user_id) {
    customer = await AdminModel.getCustomerByIdForInvoice(order.user_id);
  }

  let vendor = null;

  if (order.vendor_id) {
    vendor = await AdminModel.getVendorByIdForInvoice(order.vendor_id);
  }

  let address = null;

  if (order.address_id) {
    address = await AdminModel.getAddressByIdForInvoice(order.address_id);
  }

  let items = [];

  try {
    items = JSON.parse(order.order_items || "[]");

    if (!Array.isArray(items)) {
      items = [];
    }
  } catch {
    items = [];
  }

  const productList = [];
  let totalAmount = 0;

  for (const item of items) {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 0);
    const linePrice = price * quantity;

    let addonsDetail = [];

    if (item.addons) {
      const addonIds = String(item.addons)
        .split(",")
        .map((id) => parseInt(id, 10))
        .filter(Boolean);

      if (addonIds.length) {
        addonsDetail = await AdminModel.getAddonsByIdsForInvoice(addonIds);
      }
    }

    let subCategoryName = "";

    if (item.sub_cat_id) {
      const subCategory = await AdminModel.getSubCategoryByIdForInvoice(
        item.sub_cat_id,
      );

      subCategoryName = subCategory?.name || "";
    }

    let itemCouponDiscount = 0;

    if (item.coupon_applied && item.coupon_applied == 1 && item.coupon_id) {
      const itemCoupon = await AdminModel.getRestaurantCouponById(
        item.coupon_id,
      );

      if (itemCoupon) {
        if (itemCoupon.discount_type === "percent") {
          itemCouponDiscount = Number(
            ((linePrice * Number(itemCoupon.cupon_price)) / 100).toFixed(2),
          );
        } else {
          itemCouponDiscount = Math.min(
            Number(itemCoupon.cupon_price),
            linePrice,
          );
        }
      }
    }

    const lineTotal =
      item.line_total !== undefined ? Number(item.line_total) : linePrice;

    totalAmount += lineTotal;

    productList.push({
      id: item.id ?? null,
      product_id: item.product_id ?? null,
      name: item.item_name ?? item.name ?? "",
      item_type: item.item_type ?? "",
      description: item.description ?? "",
      sub_category_name: subCategoryName,
      price: formatNumber(price),
      quantity,
      addon_price: item.addon_price ?? 0,
      addons_detail: addonsDetail,
      coupon_discount: formatNumber(itemCouponDiscount),
      final_amount: formatNumber(lineTotal),
      image: item.item_image ?? item.image ?? "",
    });
  }

  const subtotal =
    order.subtotal !== undefined ? Number(order.subtotal) : totalAmount;

  let couponDiscount = 0;
  let couponInfo = null;

  if (order.coupon_applied && order.coupon_applied == 1 && order.coupon_id) {
    couponInfo = await AdminModel.getRestaurantCouponById(order.coupon_id);

    if (couponInfo) {
      if (couponInfo.discount_type === "percent") {
        couponDiscount = Number(
          ((subtotal * Number(couponInfo.cupon_price)) / 100).toFixed(2),
        );
      } else {
        couponDiscount = Math.min(Number(couponInfo.cupon_price), subtotal);
      }
    }
  }

  if (!couponDiscount && order.discount) {
    couponDiscount = Number(order.discount);
  }

  const amountAfterDiscount = subtotal - couponDiscount;

  const hstPercentage = 13;
  const hstAmount = (amountAfterDiscount * hstPercentage) / 100;

  const finalTotalBeforeDelivery = amountAfterDiscount + hstAmount;

  const orderBookingType = order.orderBookingType || "";

  const isDeliveryOrder = orderBookingType === "Delivery";

  const deliveryCharge = isDeliveryOrder ? 5.0 : 0.0;

  const finalTotal = finalTotalBeforeDelivery + deliveryCharge;

  const dateCandidates = [
    "order_date",
    "date",
    "created_at",
    "createdAt",
    "created_on",
  ];

  let date = null;

  for (const column of dateCandidates) {
    if (order[column]) {
      date = order[column];
      break;
    }
  }

  if (!date) {
    date = new Date();
  }

  const result = {
    ...order,
    customer,
    fname: customer?.fname || "",
    lname: customer?.lname || "",
    email: customer?.email || "",
    mobile: customer?.phone || customer?.mobile || "",
    post_code: customer?.post_code || "",
    vendor_info: vendor,
    vendor_logo: buildImageUrl(vendor?.image || vendor?.logo || ""),
    invoice_number: order.id,
    booking_id: order.order_number || `BV${String(order.id).padStart(6, "0")}`,
    address,
    delivery_address: address?.address || "",
    product_list: productList,
    subtotal_amount: formatNumber(subtotal),
    coupon_info: couponInfo,
    discount_percent:
      couponInfo && couponInfo.discount_type === "percent"
        ? `${couponInfo.cupon_price}%`
        : "0%",
    discount:
      couponInfo && couponInfo.discount_type === "percent"
        ? `${couponInfo.cupon_price}%`
        : "0%",
    discount_amount: formatNumber(couponDiscount),
    amount_after_discount: amountAfterDiscount.toFixed(2),
    hst: `${hstPercentage}%`,
    hst_amount: hstAmount.toFixed(2),
    order_booking_type: orderBookingType,
    is_delivery_order: isDeliveryOrder,
    delivery_charge_amount: deliveryCharge.toFixed(2),
    delivery_type: isDeliveryOrder ? "Delivery" : "Pickup / Dine-in",
    delivery_charge: deliveryCharge.toFixed(2),
    total_amount: finalTotal.toFixed(2),
    date,
  };

  return result;
};

// Get restaurant categories
const getRestaurantCategories = async () => {
  return await AdminModel.getRestaurantCategories();
};

// UPDATE RESTAURANT CATEGORY
const updateRestaurantCategory = async (categoryId, data, file) => {
  const {
    cat_id,
    name,
    sort_description,
    hideHomeService,
    hideOnSiteService,
    showHomeService,
    showOnSiteService,
  } = data;

  if (cat_id && name) {
    const finalShowHomeService = hideHomeService
      ? hideHomeService
      : showHomeService;

    const finalShowOnSiteService = hideOnSiteService
      ? hideOnSiteService
      : showOnSiteService;

    await AdminModel.updateRestaurantCategory(cat_id, {
      name,
      sort_description,
      showHomeService: finalShowHomeService,
      showOnSiteService: finalShowOnSiteService,
    });

    if (file) {
      await AdminModel.updateRestaurantCategoryImage(cat_id, file.filename);
    }
  }

  return await AdminModel.getRestaurantCategoryById(categoryId);
};

// UPDATE RESTAURANT CATEGORY STATUS
const updateRestaurantCategoryStatus = async (categoryId, status) => {
  const result = await AdminModel.updateRestaurantCategoryStatus(
    categoryId,
    status,
  );

  return result;
};

//GET RESTAURANT SUB CATEGORY LIST
const getRestaurantSubCategories = async () => {
  return await AdminModel.getRestaurantSubCategories();
};

//CHANGE RESTAURANT SUB CATEGORY STATUS
const changeRestaurantSubCategoryStatus = async (subCategoryId) => {
  return await AdminModel.changeRestaurantSubCategoryStatus(subCategoryId);
};

//UPDATE RESTAURANT SUB CATEGORY
const updateRestaurantSubCategory = async (subCategoryId, data, file) => {
  const { name, description } = data;

  if (!name) {
    return {
      error: true,
      message: "Please fill all the required fields.",
    };
  }

  const updateData = {
    name,
    description,
  };

  if (file) {
    updateData.image = file.filename;
  }

  await AdminModel.updateRestaurantSubCategory(subCategoryId, updateData);

  const subCategory =
    await AdminModel.getRestaurantSubCategoryById(subCategoryId);

  return {
    error: false,
    subCategory,
  };
};

const deleteRestaurantSubCategory = async (subCategoryId) => {
  return await AdminModel.deleteRestaurantSubCategory(subCategoryId);
};

const deleteSelectedRestaurantSubCategories = async (subCategoryIds) => {
  return await AdminModel.deleteSelectedRestaurantSubCategories(subCategoryIds);
};

const addRestaurantSubCategory = async (data, file) => {
  const { scat, description } = data;

  if (!scat) {
    return {
      error: true,
      message: "Sub category name is required.",
    };
  }

  const image = file ? file.filename : null;

  const result = await AdminModel.addRestaurantSubCategory({
    name: scat,
    description,
    image,
  });

  return {
    error: false,
    result,
  };
};

// -----------------------------------------
// RESTAURANT - STORE KEYWORDS
// -----------------------------------------

const getRestaurantStoreById = async (id) => {
  return await AdminModel.getStoreById(id);
};

const getRestaurantKeywordsByCategory = async (categoryId) => {
  return await AdminModel.getRestaurantKeywordsByCategory();
};

const getRestaurantVendorKeywordIds = async (vendorId) => {
  return await AdminModel.getRestaurantVendorKeywordIds(vendorId);
};

const saveRestaurantVendorKeywords = async (vendorId, keywordIds) => {
  return await AdminModel.saveRestaurantVendorKeywords(vendorId, keywordIds);
};

module.exports = {
  login,
  //dashboard
  getDashboardData,
  getOrderStats,
  getSalesChartData,

  //store management and orders
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
  normalizeStatus,
  haversine,
  getOrderDetails,
  getStoreItems,
  getStoreItemsSummary,
  toggleStoreItemStatus,
  getAllRestaurantOrders,
  getNearbyKm,
  updateNearbyKm,

  //keywords
  getRestaurantStoreById,
  getRestaurantKeywordsByCategory,
  getRestaurantVendorKeywordIds,
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
  getRestaurantItemForUpdate,
  updateRestaurantItem,
  updateRestaurantItemImage,
  updateRestaurantItemImageAndData,
  getAddonById,
  updateAddon,
  deleteAddon,

  //driver section
  getDrivers,
  toggleDriverStatus,
  getDriverDetails,
  getDriverById,
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

  getBannerList,
  saveBanner,
  getBanner,
  removeBanner,
  changeBannerStatus,
  editBanner,
  getItemsByVendor,

  getUnreadNotifications,
  getUnreadNotificationCount,
  markAllAsRead,
  getRestaurantNotifications,
  bulkDeleteNotifications,
  openRestaurantNotification,
  getRestaurantNotificationTransaction,

  getInvoiceData,
};
