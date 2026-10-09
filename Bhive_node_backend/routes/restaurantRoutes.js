const express = require("express");
const router = express.Router();
const restaurantApiController = require("../controllers/restaurantApiController");

router.get("/restaurant_all_orders_home", restaurantApiController.restaurantAllOrdersHome);

module.exports = router;
