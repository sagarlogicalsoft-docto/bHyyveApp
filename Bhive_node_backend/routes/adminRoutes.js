const express = require("express");
const router = express.Router();

const adminRouter = express.Router();
const restaurantRouter = express.Router();
const adminController = require("../controllers/adminApiController");

router.post("/admin/login", adminController.login);
// =====================================================
// SERVICE SIDE
// =====================================================

//

// =====================================================
// RESTAURANT SIDE
// =====================================================
const {
  uploadRestaurantFiles,
  productUploadMiddleware,
  uploadDriverFiles,
  uploadBannerFile,
  uploadRestaurantCategory,
  uploadRestaurantSubCategory,
} = require("../middleware/adminMiddleware");

//DASHBOARD ROUTES
restaurantRouter.get("/dashboard", adminController.getDashboardData);
restaurantRouter.post("/dashboard/order-stats", adminController.getOrderStats);
restaurantRouter.post(
  "/dashboard/sales-chart",
  adminController.getSalesChartData,
);

//NEW STORE ROUTES
restaurantRouter.get("/stores/pending", adminController.getPendingStores);

//ADD STORE ROUTES
restaurantRouter.get("/stores/cities", adminController.getAddStoreCities);
restaurantRouter.post(
  "/stores/add",
  uploadRestaurantFiles,
  adminController.addStore,
);

//STORE LIST ROUTES
restaurantRouter.get("/stores", adminController.getRestaurantStores);
restaurantRouter.get("/stores/search", adminController.searchStores);
restaurantRouter.get("/stores/cities", adminController.getStoreListCities);
restaurantRouter.get("/orders", adminController.getAllRestaurantOrders);
restaurantRouter.get("/orders/:orderId", adminController.getOrderDetails);
restaurantRouter.get("/stores/:id/orders", adminController.getStoreOrders);
restaurantRouter.get(
  "/stores/:id/orders/summary",
  adminController.getStoreOrderSummary,
);
restaurantRouter.get(
  "/stores/:id/items/summary",
  adminController.getStoreItemsSummary,
);
restaurantRouter.get("/stores/:id/items", adminController.getStoreItems);
restaurantRouter.patch(
  "/stores/:id/items/:itemId/status",
  adminController.updateStoreItemStatus,
);
restaurantRouter.delete("/stores/bulk", adminController.bulkDeleteStores);
restaurantRouter.get("/stores/:id", adminController.getStoreById);
restaurantRouter.patch(
  "/stores/:id",
  uploadRestaurantFiles,
  adminController.updateStore,
);
restaurantRouter.patch("/stores/:id/status", adminController.toggleStoreStatus);
restaurantRouter.delete("/stores/:id", adminController.deleteStore);

//RESTAURANT KEYWORDS
restaurantRouter.get(
  "/stores/:id/keywords",
  adminController.getRestaurantStoreKeywords,
);

restaurantRouter.post(
  "/stores/keywords",
  adminController.saveRestaurantVendorKeywords,
);

//NEARBY RESTAURANT ROUTES
restaurantRouter.get("/nearby-km", adminController.getNearbyKm);
restaurantRouter.patch("/nearby-km", adminController.updateNearbyKm);

//CATEGORY MANAGEMENT
restaurantRouter.get("/categories", adminController.getRestaurantCategories);
restaurantRouter.get(
  "/sub_categories",
  adminController.getRestaurantSubCategories,
);

restaurantRouter.post(
  "/sub_categories",
  uploadRestaurantSubCategory,
  adminController.addRestaurantSubCategory,
);

restaurantRouter.patch(
  "/categories/:id",
  uploadRestaurantCategory,
  adminController.updateRestaurantCategory,
);
restaurantRouter.patch(
  "/categories/:id/status",
  adminController.updateRestaurantCategoryStatus,
);
restaurantRouter.patch(
  "/sub_categories/:id/status",
  adminController.changeRestaurantSubCategoryStatus,
);

restaurantRouter.patch(
  "/sub_categories/:id",
  uploadRestaurantSubCategory,
  adminController.updateRestaurantSubCategory,
);
restaurantRouter.delete(
  "/sub_categories/bulk",
  adminController.deleteSelectedRestaurantSubCategories,
);
restaurantRouter.delete(
  "/sub_categories/:id",
  adminController.deleteRestaurantSubCategory,
);

//COUPONS MANAGEMENT ROUTES
restaurantRouter.get("/coupons/add-data", adminController.getAddCouponData);
restaurantRouter.get("/coupons", adminController.getAllCoupons);
restaurantRouter.post("/coupons/", adminController.addCoupon);
restaurantRouter.get(
  "/coupons/categories-by-ids",
  adminController.getCategoriesByIds,
);
restaurantRouter.get(
  "/coupons/vendors-by-ids",
  adminController.getVendorsByIds,
);
restaurantRouter.get(
  "/coupons/products-by-ids",
  adminController.getProductsByIds,
);
restaurantRouter.get(
  "/coupons/vendors-by-category",
  adminController.getVendorsByCategory,
);
restaurantRouter.get("/coupons/:id/edit", adminController.getCouponEditData);
restaurantRouter.patch(
  "/coupons/:id/status",
  adminController.updateCouponStatus,
);
restaurantRouter.get("/coupons/:id", adminController.getCouponById);
restaurantRouter.delete("/coupons/bulk", adminController.deleteSelectedCoupons);
restaurantRouter.delete("/coupons/:id", adminController.deleteCoupon);
restaurantRouter.post(
  "/coupons/products-by-vendors",
  adminController.getProductsByVendorIds,
);
restaurantRouter.put("/coupons/:id", adminController.updateCoupon);

//PRODUCT MANAGEMENT
restaurantRouter.get("/menus", adminController.getAllMenus);
restaurantRouter.post("/menus", adminController.createMenu);
restaurantRouter.get("/menus/:id", adminController.getMenuById);
restaurantRouter.put("/menus/:id", adminController.updateMenu);
restaurantRouter.delete("/menus/bulk", adminController.bulkDeleteMenus);
restaurantRouter.delete("/menus/:id", adminController.deleteMenu);
restaurantRouter.patch("/menus/:id/status", adminController.updateMenuStatus);
restaurantRouter.get("/products", adminController.getAllRestaurantItems);
restaurantRouter.post(
  "/products",
  productUploadMiddleware,
  adminController.createRestaurantItem,
);
restaurantRouter.get("/products/add", adminController.getAddRestaurantItemData);
restaurantRouter.get(
  "/products/:id/edit",
  adminController.getEditRestaurantItemData,
);
restaurantRouter.get("/products/:id", adminController.getRestaurantItemById);
restaurantRouter.patch(
  "/products/:id/status",
  adminController.updateRestaurantItemStatus,
);
restaurantRouter.patch(
  "/products/:id",
  productUploadMiddleware,
  adminController.updateRestaurantItem,
);
restaurantRouter.delete(
  "/products/bulk",
  adminController.bulkDeleteRestaurantItems,
);
restaurantRouter.delete("/products/:id", adminController.deleteRestaurantItem);
restaurantRouter.post(
  "/products/addon-group",
  productUploadMiddleware,
  adminController.saveAddonGroup,
);
restaurantRouter.get("/products/:id/addons", adminController.getItemAddons);
restaurantRouter.delete(
  "/products/addon-group/:groupId",
  adminController.deleteAddonGroup,
);
restaurantRouter.patch("/products/addon/:addonId", adminController.updateAddon);
restaurantRouter.delete(
  "/products/addon/:addonId",
  adminController.deleteAddon,
);

//DRIVER SECTION
restaurantRouter.get(
  "/drivers/driver-estimate-time",
  adminController.getDriverEstimateTimeList,
);

restaurantRouter.get(
  "/drivers/driver-estimate-time/:id",
  adminController.getDriverEstimateTimeForEdit,
);

restaurantRouter.get("/drivers", adminController.getDrivers);
restaurantRouter.get("/drivers/:id", adminController.getDriverDetails);
restaurantRouter.get("/drivers/:id/edit", adminController.getDriverForEdit);
restaurantRouter.post(
  "/drivers/driver-estimate-time",
  adminController.saveDriverEstimateTime,
);

restaurantRouter.post(
  "/drivers/driver-estimate-time/bulk-delete",
  adminController.bulkDeleteDriverTimes,
);

restaurantRouter.post(
  "/drivers/driver-estimate-time/status",
  adminController.updateDriverTimeStatus,
);

restaurantRouter.post(
  "/drivers/driver-estimate-time/:id",
  adminController.updateDriverEstimateTime,
);

restaurantRouter.delete(
  "/drivers/driver-estimate-time/:id",
  adminController.deleteDriverEstimateTime,
);

restaurantRouter.patch(
  "/drivers/:id/status",
  adminController.toggleDriverStatus,
);
restaurantRouter.delete("/drivers/bulk", adminController.bulkDeleteDrivers);
restaurantRouter.delete("/drivers/:id", adminController.deleteDriver);
restaurantRouter.post(
  "/drivers",
  uploadDriverFiles,
  adminController.saveDriver,
);
restaurantRouter.post(
  "/drivers/:id",
  uploadDriverFiles,
  adminController.updateDriver,
);

//BANNER
restaurantRouter.get("/banners", adminController.restaurantBanner);
restaurantRouter.post(
  "/banners",
  uploadBannerFile,
  adminController.restaurantBannerSave,
);
restaurantRouter.get("/banners/:id", adminController.restaurantBannerList);
restaurantRouter.delete("/banners/:id", adminController.restaurantBannerDelete);
restaurantRouter.post(
  "/banners/status",
  adminController.restaurantBannerUpdateStatus,
);
restaurantRouter.post(
  "/banners/update",
  uploadBannerFile,
  adminController.restaurantBannerUpdate,
);
restaurantRouter.get(
  "/banners/items/:vendor_id",
  adminController.getRestaurantItems,
);

//NOTIFICATION
restaurantRouter.get(
  "/notifications/unread",
  adminController.getUnreadNotifications,
);
restaurantRouter.get(
  "/notifications/unread-count",
  adminController.getUnreadNotificationCount,
);

restaurantRouter.patch("/notifications/read", adminController.markAllAsRead);
restaurantRouter.get(
  "/notifications",
  adminController.getRestaurantNotifications,
);
restaurantRouter.post(
  "/notifications/bulk-delete",
  adminController.bulkDeleteNotifications,
);
restaurantRouter.get(
  "/notifications/order/:booking_id",
  adminController.getRestaurantNotificationTransaction,
);
restaurantRouter.get(
  "/notifications/:id",
  adminController.openRestaurantNotification,
);

//INVOICE
restaurantRouter.get(
  "/orders/:orderId/invoice",
  adminController.generateRestaurantInvoice,
);

router.use("/admin", adminRouter);
router.use("/restaurant", restaurantRouter);

module.exports = router;
