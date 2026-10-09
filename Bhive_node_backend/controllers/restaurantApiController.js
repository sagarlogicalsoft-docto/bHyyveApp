const RestaurantModel = require("../models/restaurantModel");

// GET /Api_vendor/restaurant_all_orders_home?vendor_id=119
// Socket band ho ya app pehli baar khule, tab ye REST fallback kaam aata hai
exports.restaurantAllOrdersHome = async (req, res) => {
  try {
    const vendorId = Number(req.query.vendor_id);

    if (!vendorId) {
      return res.json({ result: false, msg: "vendor_id required" });
    }

    const exists = await RestaurantModel.vendorExists(vendorId);
    if (!exists) {
      return res.json({ result: false, msg: "Invalid vendor_id" });
    }

    const orders = await RestaurantModel.getVendorOrdersHome(vendorId);

    return res.json({
      result: true,
      msg: orders.length ? "Orders fetched successfully" : "No orders found",
      total: orders.length,
      restaurant_id: vendorId,
      orders,
    });
  } catch (err) {
    console.error("restaurantAllOrdersHome error:", err.message);
    return res.json({ result: false, msg: "Server error" });
  }
};
