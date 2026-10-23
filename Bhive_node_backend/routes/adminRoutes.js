const express = require("express");
const router = express.Router();

const adminRouter = express.Router();
const restaurantRouter = express.Router();
const adminController = require("../controllers/adminApiController");

router.post("/admin/login", adminController.login);
// =====================================================
// SERVICE SIDE
// =====================================================
const {
  //SERVICE SIDE
  uploadVendorDocuments,
  uploadVendorFiles,
  uploadExpertImage,
  uploadCategoryImage,
  uploadSubCategoryImage,
  uploadCategoryImport,
  uploadCategoryKeywordsImport,
  uploadVendorSliderImage,
  uploadServiceSideCitiesExcel,

  //RESTAURANT SIDE
  uploadRestaurantFiles,
  productUploadMiddleware,
  uploadDriverFiles,
  uploadBannerFile,
  uploadRestaurantCategory,
  uploadRestaurantSubCategory,
} = require("../middleware/adminMiddleware");

// SUB ADMIN MANAGEMENT
adminRouter.get("/subadmins", adminController.getSubAdmins);
adminRouter.get("/subadmins/:id", adminController.getSubAdmin);
adminRouter.put("/subadmins/:id/status", adminController.changeSubAdminStatus);
adminRouter.post("/save_subadmin", adminController.saveSubAdmin);
adminRouter.put("/subadmins/:id", adminController.updateSubAdmin);
adminRouter.delete("/subadmins/:id", adminController.deleteSubAdmin);

// ROLE MANAGEMENT
adminRouter.get("/roles", adminController.getRoles);
adminRouter.post("/roles", adminController.addRole);
adminRouter.put("/roles/:id/status", adminController.updateRoleStatus);
adminRouter.put("/roles/:id", adminController.updateRole);
adminRouter.delete("/roles/:id/delete", adminController.deleteRole);

// VENDOR MANAGEMENT
adminRouter.get("/vendors", adminController.getVendors);
adminRouter.get("/vendors-categories", adminController.getVendorCategories);
adminRouter.get("/cities", adminController.getVendorCities);
adminRouter.post("/vendors", uploadVendorFiles, adminController.createVendor);
adminRouter.post(
  "/vendors/documents/:id",
  uploadVendorDocuments,
  adminController.uploadVendorDocuments,
);
adminRouter.patch("/vendors/:id/kyc-status", adminController.changeKycStatus);
adminRouter.delete("/vendors/selected", adminController.deleteSelectedVendors);
adminRouter.delete("/vendors/:id", adminController.deleteVendor);
adminRouter.get("/vendors/:id", adminController.getVendorById);
adminRouter.get("/cities", adminController.getAllCities);
adminRouter.get(
  "/vendors/:id/shop-details",
  adminController.getServiceVendorShopDetails,
);

adminRouter.post(
  "/vendors/update-details",
  adminController.updateServiceVendorDetails,
);

adminRouter.get(
  "/vendors/:id/addresses",
  adminController.getServiceVendorAddresses,
);

adminRouter.post(
  "/vendors/addresses",
  adminController.saveServiceVendorAddress,
);

adminRouter.delete(
  "/vendors/addresses/:addressId",
  adminController.deleteServiceVendorAddress,
);

adminRouter.get(
  "/vendors/:id/keywords",
  adminController.getServiceVendorKeywords,
);

adminRouter.post(
  "/vendors/keywords",
  adminController.saveServiceVendorKeywords,
);

adminRouter.get("/vendor-radius", adminController.getVendorRadius);
adminRouter.post("/vendor-radius", adminController.saveVendorRadius);

// USER MANAGEMENT
adminRouter.get("/users", adminController.getUsers);
adminRouter.post("/users/:id/wallet", adminController.addWalletAmount);
adminRouter.delete("/users/:id", adminController.deleteCustomer);
adminRouter.post("/users/bulk-delete", adminController.deleteSelectedUsers);
adminRouter.get("/users/:id/details", adminController.getUserPageDetails);
adminRouter.put("/users/:id/details", adminController.updateUserPageDetails);
adminRouter.put(
  "/users/:id/addresses/:addressId",
  adminController.updateUserAddress,
);
adminRouter.delete(
  "/users/:id/addresses/:addressId",
  adminController.deleteUserAddress,
);

// =====================================================
// EXPERT MANAGEMENT
// =====================================================

adminRouter.get("/experts", adminController.getExperts);
adminRouter.get("/experts/form-data", adminController.getExpertFormData);
adminRouter.get("/expert_details/:id", adminController.getExpertDetails);
adminRouter.post(
  "/save_expert",
  uploadExpertImage,
  adminController.saveNewExpert,
);
adminRouter.put(
  "/update_expert/:id",
  adminController.updateExpertBasisDetailController,
);

// ==================== APP REVIEWS ====================

adminRouter.get("/app_reviews", adminController.getAppReviews);
adminRouter.patch(
  "/app_reviews/:id/mark_testimonial",
  adminController.markAppReviewAsTestimonial,
);
adminRouter.patch(
  "/app_reviews/:id/remove_testimonial",
  adminController.removeAppReviewTestimonial,
);
adminRouter.delete("/app_reviews/:id", adminController.deleteAppReview);

// ==================== CATEGORY ROUTES ====================

adminRouter.get("/categories", adminController.getCategories);
adminRouter.put("/categories/order", adminController.updateCategoryOrder);
adminRouter.put("/categories/:id/status", adminController.updateCategoryStatus);
adminRouter.get("/categories/:id", adminController.getCategoryById);
adminRouter.put(
  "/categories/:id",
  uploadCategoryImage,
  adminController.updateCategory,
);
adminRouter.delete(
  "/categories/selected",
  adminController.deleteSelectedCategories,
);
adminRouter.delete("/categories/:id", adminController.deleteCategory);
adminRouter.post(
  "/categories/import",
  uploadCategoryImport,
  adminController.importCategories,
);
adminRouter.post(
  "/categories",
  uploadCategoryImage,
  adminController.addCategory,
);

// ==================== CATEGORY KEYWORDS ROUTES ====================

adminRouter.get("/category-keywords", adminController.getCategoryKeywordList);
adminRouter.post("/category-keywords", adminController.addCategoryKeywords);
adminRouter.post(
  "/category-keywords/import",
  uploadCategoryKeywordsImport,
  adminController.importCategoryKeywords,
);

adminRouter.delete(
  "/category-keywords/:id",
  adminController.deleteCategoryKeyword,
);

adminRouter.delete(
  "/category-keywords/category/:categoryId",
  adminController.deleteCategoryKeywordsByCategory,
);

// ==================== SUBCATEGORY ROUTES ====================

adminRouter.get("/sub-categories", adminController.getSubCategories);
adminRouter.put(
  "/sub-categories/order",
  adminController.updateSubCategoryOrder,
);
adminRouter.post(
  "/sub-categories/add-category",
  uploadSubCategoryImage,
  adminController.addSubCategory,
);
adminRouter.get("/sub-categories/:id", adminController.getSubCategoryEditData);
adminRouter.put(
  "/sub-categories/:id",
  uploadSubCategoryImage,
  adminController.updateSubCategory,
);
adminRouter.delete(
  "/sub-categories/selected",
  adminController.deleteSelectedSubCategories,
);

adminRouter.delete("/sub-categories/:id", adminController.deleteSubCategory);
adminRouter.put(
  "/sub-categories/:id/status",
  adminController.changeSubCategoryStatus,
);

// ====================  VENDOR IMAGE SLIDER  ===========================

adminRouter.get("/vendor-images", adminController.getAllVendorImages);
adminRouter.get(
  "/vendor-images/form-data",
  adminController.getVendorImageFormData,
);

adminRouter.get("/vendor-images/:id", adminController.getVendorImageById);

adminRouter.post(
  "/vendor-images",
  uploadVendorSliderImage,
  adminController.addVendorImage,
);

adminRouter.put(
  "/vendor-images/:id",
  uploadVendorSliderImage,
  adminController.updateVendorImage,
);

adminRouter.delete(
  "/vendor-images/selected",
  adminController.deleteSelectedVendorImages,
);
adminRouter.delete("/vendor-images/:id", adminController.deleteVendorImage);

// ==================== SERVICE SIDE CITIES ====================

adminRouter.get("/service_side_cities", adminController.getServiceSideCities);
adminRouter.get(
  "/service_side_cities/:id",
  adminController.getServiceSideCityById,
);
adminRouter.post(
  "/service_side_cities/add",
  adminController.addServiceSideCity,
);
adminRouter.post(
  "/service_side_cities/:id/edit",
  adminController.updateServiceSideCity,
);
adminRouter.post(
  "/service_side_cities/delete_selected",
  adminController.deleteSelectedServiceSideCities,
);
adminRouter.delete(
  "/service_side_cities/:id",
  adminController.deleteServiceSideCity,
);
adminRouter.post(
  "/service_side_cities/import",
  uploadServiceSideCitiesExcel,
  adminController.importServiceSideCities,
);

// =====================================================
// RESTAURANT SIDE
// =====================================================

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
