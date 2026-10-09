const express = require("express");
const router = express.Router();
const deliveryApiController = require("../controllers/deliveryApiController");
const upload = require("../middleware/upload");

router.post(
  "/delivery_boy_signup",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "identity_image", maxCount: 1 },
    { name: "cv_uploads", maxCount: 1 },
  ]),
  deliveryApiController.deliveryBoySignup,
);

router.post("/delivery_boy_login", deliveryApiController.deliveryBoyLogin);
router.post(
  "/delivery_boy_verify_otp",
  deliveryApiController.deliveryBoyVerifyOtp,
);
router.post(
  "/delivery_boy_update_profile",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "identity_image", maxCount: 1 },
    { name: "cv_uploads", maxCount: 1 },
  ]),
  deliveryApiController.deliveryBoyUpdateProfile,
);

router.post(
  "/driver_availability_status",
  deliveryApiController.driverAvailabilityStatus,
);
router.post("/delivery_get_profile", deliveryApiController.deliveryGetProfile);
router.post(
  "/update_driver_live_location",
  deliveryApiController.updateDriverLiveLocation,
);
router.post(
  "/driver_accept_reject_order",
  deliveryApiController.driverAcceptRejectOrder,
);
router.post(
  "/driver_preparing_orders",
  deliveryApiController.driverPreparingOrders,
);
router.post(
  "/driver_ready_for_pickup",
  deliveryApiController.driverReadyForPickup,
);
router.post(
  "/driver_ready_for_pickup_orders_show",
  deliveryApiController.driverReadyForPickupOrdersShow,
);
router.post(
  "/driver_on_the_way_order",
  deliveryApiController.driverOnTheWayOrder,
);

router.post("/driver_home_data", deliveryApiController.driverHomeData);
router.post(
  "/driver_earnings_dashboard",
  deliveryApiController.driverEarningsDashboard,
);
router.post(
  "/driver_all_orders_list",
  deliveryApiController.driverAllOrdersList,
);

router.post("/driver_save_bank_details", deliveryApiController.driverSaveBankDetails);
router.post("/delivery_boy_logout", deliveryApiController.deliveryBoyLogout);

router.post("/restaurant_pending_order_details", deliveryApiController.restaurantOrderDetails);

module.exports = router;
