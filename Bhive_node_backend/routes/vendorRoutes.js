const express = require("express");

const router = express.Router();
const upload = require("../middleware/upload");

const vendorApiController = require("../controllers/vendorApiController");

router.post("/vendor_signup", vendorApiController.vendorSignup);
router.post("/vendor_login", vendorApiController.vendorLogin);

router.post(
	"/save_detail",
	upload.fields([
		{
			name: "profile_image",
			maxCount: 1,
		},
		{
			name: "id_proof",
			maxCount: 1,
		},
		{
			name: "id_proof_two",
			maxCount: 1,
		},
		{
			name: "pad_file",
			maxCount: 1,
		},
	]),

	vendorApiController.saveDetail,
);

router.post("/save_bank_detail", vendorApiController.saveBankDetail);
router.post("/vendor_verify_otp", vendorApiController.verifyOtp);
router.get("/get_categories", vendorApiController.getCategories);
router.get("/get_cities", vendorApiController.getCities);
router.post("/get_login_status", vendorApiController.getLoginStatus);
router.post("/get_pending_booking", vendorApiController.getPendingBooking);
router.post("/get_business_name", vendorApiController.getBusinessName);
router.post("/get_notifications", vendorApiController.getNotifications);
router.post("/mark_as_seen_nf", vendorApiController.markAsSeenNf);
router.post("/get_book_detail", vendorApiController.getBookDetail);
router.post("/cancel_booking", vendorApiController.cancelBooking);
router.post("/order_accept", vendorApiController.orderAccept);
router.post("/get_inprocessing_bookings", vendorApiController.getInprocessingBookings);
router.post("/get_services", vendorApiController.getServices);
router.post("/get_sub_categories", vendorApiController.getSubCategories);

router.post(
	"/add_service",
	upload.array("image", 10),
	vendorApiController.addService,
);





router.post(
	"/save_shop_detail",
	upload.fields([
		{ name: "image", maxCount: 1 },
		{ name: "id_proof", maxCount: 1 },
		{ name: "id_proof_two", maxCount: 1 },
	]),
	vendorApiController.saveShopDetail,
);

router.post("/get_user_detail", vendorApiController.getUserDetail);
router.post("/vendor_logout", vendorApiController.vendorLogout);
router.post("/get_my_address_vendor", vendorApiController.getMyAddressVendor);
router.post("/get_bank_detail", vendorApiController.getBankDetail);
router.post("/get_earning_detail", vendorApiController.getEarningDetail);
router.post("/get_advertising_list", vendorApiController.getAdvertisinglist);
router.post("/delete_video_vendor", vendorApiController.deleteVideoVendor);
router.post("/get_video_vendor", vendorApiController.getVideoVendor);


router.post(
	"/add_video_vendor",
	upload.single("video"),
	vendorApiController.addVideoVendor,
);


router.post("/delete_images_vendor", vendorApiController.deleteImagesVendor);

router.post("/get_images_vendor", vendorApiController.getImagesVendor);
router.post(
	"/add_images_vendor",
	upload.single("image"),
	vendorApiController.addImagesVendor,
);
router.post("/vendor_time_slots", vendorApiController.vendorTimeSlots);
router.post("/save_app_review", vendorApiController.saveAppReview);
router.get("/get_policies", vendorApiController.getPolicies);
router.post("/vendor_time_slots_update", vendorApiController.vendorTimeSlotsUpdate);
router.post("/complete_order_now", vendorApiController.completeOrderNow);
router.post("/active_deactive_service", vendorApiController.activeDeactiveService);
router.post("/restaurant_home_dashboard", vendorApiController.restaurantHomeDashboard);
router.post("/restaurant_all_orders_home", vendorApiController.restaurantAllOrdersHome);

// ==========================================
// TruAnon
// ==========================================

router.get("/truanon/webview_url", vendorApiController.getTruAnonWebviewUrl);
router.get("/truanon/callback", vendorApiController.truAnonCallback);
router.post("/truanon/verify", vendorApiController.verifyTruAnon);

router.post("/restaurant_open_close_status", vendorApiController.restaurantOpenCloseStatus);
router.post("/restaurant_get_items", vendorApiController.restaurantGetItems);
router.post(
  "/restaurant_item_add",
  upload.single("item_image"),
  vendorApiController.restaurantItemAdd,
);
router.post("/get_sub_category_by_reasaurant", vendorApiController.getSubCategoryByReasaurant);
router.post("/restaurant_item_status_update", vendorApiController.restaurantItemStatusUpdate);
router.post("/restaurant_order_booking", vendorApiController.restaurantOrderBooking);
router.post("/restaurant_accept_decline_order", vendorApiController.restaurantAcceptDeclineOrder);
router.post("/restaurant_order_details", vendorApiController.restaurantOrderDetails);

router.post(
  "/vendor_add_addon_group",
  upload.any(),
  vendorApiController.vendorAddAddonGroup
);

router.post(
  "/vendor_get_item_addons",
  vendorApiController.vendorGetItemAddons
);

router.post(
  "/restaurant_items_keyword_list",
  vendorApiController.restaurantItemsKeywordList
);

router.post(
  "/add_restaurant_items_keyword",
  vendorApiController.addRestaurantItemsKeyword
);

module.exports = router;
 