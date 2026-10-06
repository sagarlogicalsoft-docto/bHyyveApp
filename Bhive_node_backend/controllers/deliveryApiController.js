const bcrypt = require("bcrypt");
const pool = require("../config/db");
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
const DeliveryModel = require("../models/deliveryModel");
const { sendOTP } = require("../utils/sms");
const messaging = require("../config/firebase");
const { emitVendorOrders } = require("../sockets/vendorOrders"); // ADDED: real-time vendor push

const baseUrl = "http://192.168.1.11:6010";

async function removeFirebaseEntry(targetDriverId, targetOrderId) {
  try {
    const ref = admin
      .database()
      .ref(`assigned_driver_orders/${targetDriverId}`);
    const snapshot = await ref.once("value");
    const firebaseData = snapshot.val();

    if (firebaseData) {
      const removals = [];
      for (const pushKey in firebaseData) {
        const node = firebaseData[pushKey];
        if (
          node &&
          node.order_id !== undefined &&
          String(node.order_id) === String(targetOrderId)
        ) {
          removals.push(
            admin
              .database()
              .ref(`assigned_driver_orders/${targetDriverId}/${pushKey}`)
              .remove(),
          );
        }
      }
      await Promise.all(removals);
    }
  } catch (err) {}
}

async function isOrderStillPendingElsewhere(otherDrivers, orderId) {
  for (const other of otherDrivers) {
    try {
      const ref = admin.database().ref(`assigned_driver_orders/${other.id}`);
      const snapshot = await ref.once("value");
      const firebaseData = snapshot.val();

      if (firebaseData) {
        for (const pushKey in firebaseData) {
          const node = firebaseData[pushKey];
          if (
            node &&
            node.order_id !== undefined &&
            String(node.order_id) === String(orderId)
          ) {
            return true; // break 2; wala equivalent
          }
        }
      }
    } catch (err) {
      // Silently continue
    }
  }
  return false;
}

async function deliveryBoySignup(req, res) {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      country_code,
      identity_type,
      identity_number,
      lat,
      long,
      address,
    } = req.body || {};

    if (
      !first_name ||
      !last_name ||
      !email ||
      !phone ||
      !country_code ||
      !identity_type ||
      !identity_number ||
      !lat ||
      !long ||
      !address
    ) {
      return res.json({
        result: false,
        msg: "Required: first_name, last_name, email, phone, country_code, identity_type, identity_number, profile_image, identity_image, lat, long, and address required",
      });
    }

    const allowedIdentity = ["passport", "driving_license", "nid"];

    if (!allowedIdentity.includes(identity_type)) {
      return res.json({
        result: false,
        msg: "identity_type only allowed: passport, driving_license, nid",
      });
    }

    const checkDriver = await DeliveryModel.checkDriver(phone, email);

    if (checkDriver.length > 0) {
      return res.json({
        result: false,
        msg: "Phone or Email already exists",
      });
    }

    const profile_image = req.files?.profile_image
      ? req.files.profile_image[0].filename
      : "";

    const identity_image = req.files?.identity_image
      ? req.files.identity_image[0].filename
      : "";

    const cv_uploads = req.files?.cv_uploads
      ? req.files.cv_uploads[0].filename
      : "";

    if (!profile_image || !identity_image || !cv_uploads) {
      return res.json({
        result: false,
        msg: "profile_image and identity_image required",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    const data = {
      first_name,
      last_name,
      email,
      phone,
      country_code,
      profile_image,
      identity_type,
      identity_number,
      identity_image,
      cv_uploads,
      lat,
      long,
      address,
      status: 0,
      total_trip: 0,
      complete_trip: 0,
      cancel_trip: 0,
      otp,
      is_verified: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await DeliveryModel.insertDriver(data);

    if (result.affectedRows > 0) {
      await sendOTP(country_code, phone, otp);

      return res.json({
        result: true,
        msg: "Delivery boy signup successful",
        driver_id: result.insertId,
        otp,
      });
    }

    return res.json({
      result: false,
      msg: "Signup failed",
    });
  } catch (err) {
    console.log("deliveryBoySignup Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function deliveryBoyLogin(req, res) {
  try {
    const { phone, country_code, fcm_id } = req.body || {};

    if (!phone || !country_code || !fcm_id) {
      return res.json({
        result: false,
        msg: "Required: phone, country_code, fcm_id",
      });
    }

    const driver = await DeliveryModel.getDriver(phone, country_code);

    if (driver.length === 0) {
      return res.json({
        result: false,
        msg: "Delivery boy not registered",
      });
    }

    if (driver[0].status == 0) {
      return res.json({
        result: false,
        msg: "Account is inactive please wait admin by activated account",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    const update = await DeliveryModel.updateLogin(
      phone,
      country_code,
      fcm_id,
      otp,
    );

    if (update.affectedRows >= 0) {
      await sendOTP(country_code, phone, otp);

      return res.json({
        result: true,
        msg: "OTP sent successfully",
        phone,
        country_code,
        otp,
      });
    }

    return res.json({
      result: false,
      msg: "Failed to generate OTP",
    });
  } catch (err) {
    console.log("deliveryBoyLogin Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function deliveryBoyVerifyOtp(req, res) {
  try {
    const { phone, otp } = req.body || {};

    if (!phone || !otp) {
      return res.json({
        result: false,
        msg: "Required: phone, otp",
      });
    }

    const driver = await DeliveryModel.verifyOtp(phone, otp);

    if (driver.length === 0) {
      return res.json({
        result: false,
        msg: "Invalid OTP",
      });
    }

    const driverData = driver[0];

    await DeliveryModel.updateOtpVerified(driverData.id);

    return res.json({
      result: true,
      msg: "Otp verified successfully",
      id: driverData.id,
    });
  } catch (err) {
    console.log("deliveryBoyVerifyOtp Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function deliveryBoyUpdateProfile(req, res) {
  try {
    const {
      driver_id,
      first_name,
      last_name,
      email,
      phone,
      country_code,
      identity_type,
      identity_number,
      lat,
      long,
      address,
    } = req.body || {};

    if (driver_id === undefined || driver_id === null || driver_id === "") {
      return res.status(400).json({
        result: false,
        msg: "Required: driver_id",
      });
    }

    const driver = await DeliveryModel.getDriverById(driver_id);

    if (!driver || driver.length === 0) {
      return res.status(404).json({
        result: false,
        msg: "Invalid driver_id",
      });
    }

    const allowedIdentity = ["passport", "driving_license", "nid"];

    if (
      identity_type !== undefined &&
      identity_type !== null &&
      identity_type !== ""
    ) {
      if (!allowedIdentity.includes(identity_type)) {
        return res.status(400).json({
          result: false,
          msg: "identity_type only allowed: passport, driving_license, nid",
        });
      }
    }

    const update = {};

    if (first_name !== undefined && first_name !== null && first_name !== "") {
      update.first_name = first_name;
    }

    if (last_name !== undefined && last_name !== null && last_name !== "") {
      update.last_name = last_name;
    }

    if (email !== undefined && email !== null && email !== "") {
      const cleanEmail = String(email).trim().toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          result: false,
          msg: "Invalid email address",
        });
      }

      const check = await DeliveryModel.checkEmail(cleanEmail, driver_id);

      if (check && check.length > 0) {
        return res.status(409).json({
          result: false,
          msg: "Email already exists",
        });
      }

      update.email = cleanEmail;
    }

    if (phone !== undefined && phone !== null && phone !== "") {
      const cleanPhone = String(phone).replace(/\D/g, "");

      if (!cleanPhone) {
        return res.status(400).json({
          result: false,
          msg: "Invalid phone number",
        });
      }

      const checkPhone = await DeliveryModel.checkPhone(cleanPhone, driver_id);

      if (checkPhone && checkPhone.length > 0) {
        return res.status(409).json({
          result: false,
          msg: "Phone already exists",
        });
      }

      update.phone = cleanPhone;
    }

    if (
      country_code !== undefined &&
      country_code !== null &&
      country_code !== ""
    ) {
      update.country_code = String(country_code).trim();
    }

    if (
      identity_type !== undefined &&
      identity_type !== null &&
      identity_type !== ""
    ) {
      update.identity_type = identity_type;
    }

    if (
      identity_number !== undefined &&
      identity_number !== null &&
      identity_number !== ""
    ) {
      update.identity_number = identity_number;
    }

    if (lat !== undefined && lat !== null && lat !== "") {
      const latitude = Number(lat);

      if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
        return res.status(400).json({
          result: false,
          msg: "Invalid latitude. Must be between -90 and 90",
        });
      }

      update.lat = latitude;
    }

    if (long !== undefined && long !== null && long !== "") {
      const longitude = Number(long);

      if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
        return res.status(400).json({
          result: false,
          msg: "Invalid longitude. Must be between -180 and 180",
        });
      }

      update.long = longitude;
    }

    if (address !== undefined && address !== null && address !== "") {
      update.address = String(address).trim();
    }

    if (
      req.files &&
      req.files.profile_image &&
      req.files.profile_image.length > 0
    ) {
      update.profile_image = req.files.profile_image[0].filename;
    }

    if (
      req.files &&
      req.files.identity_image &&
      req.files.identity_image.length > 0
    ) {
      update.identity_image = req.files.identity_image[0].filename;
    }

    if (req.files && req.files.cv_uploads && req.files.cv_uploads.length > 0) {
      update.cv_uploads = req.files.cv_uploads[0].filename;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        result: false,
        msg: "No data provided for update",
      });
    }

    update.updated_at = new Date();

    await DeliveryModel.updateDriver(driver_id, update);

    const updatedDriver = await DeliveryModel.getDriverById(driver_id);

    return res.status(200).json({
      result: true,

      msg: "Profile updated successfully",

      data: updatedDriver[0],
    });
  } catch (err) {
    console.error("deliveryBoyUpdateProfile Error:", err);

    return res.status(500).json({
      result: false,

      msg: "Something Went Wrong",

      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}

async function driverAvailabilityStatus(req, res) {
  try {
    const { driver_id, status } = req.body || {};

    if (driver_id === undefined || status === undefined) {
      return res.json({
        result: false,
        msg: "Required: driver_id, status",
      });
    }

    if (status != "0" && status != "1") {
      return res.json({
        result: false,
        msg: "status only allowed: 0 (OFFLINE), 1 (ONLINE)",
      });
    }

    const driver = await DeliveryModel.getDriverById(driver_id);

    if (driver.length === 0) {
      return res.json({
        result: false,
        msg: "Invalid driver_id",
      });
    }

    await DeliveryModel.updateAvailability(driver_id, status);

    const updatedDriver = await DeliveryModel.getDriverById(driver_id);

    return res.json({
      result: true,
      msg: status == "1" ? "Driver is now ONLINE" : "Driver is now OFFLINE",
      data: updatedDriver[0],
    });
  } catch (err) {
    console.log("driverAvailabilityStatus Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function deliveryGetProfile(req, res) {
  try {
    const { driver_id } = req.body || {};

    if (!driver_id) {
      return res.json({
        result: false,
        msg: "driver_id required",
      });
    }

    const profile = await DeliveryModel.getDriverById(driver_id);

    if (profile.length === 0) {
      return res.json({
        result: false,
        msg: "Invalid delivery boy",
      });
    }

    return res.json({
      result: true,
      msg: "Profile details",
      data: profile[0],
    });
  } catch (err) {
    console.log("deliveryGetProfile Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function updateDriverLiveLocation(req, res) {
  try {
    const { driver_id, lat, long } = req.body || {};

    if (!driver_id || !lat || !long) {
      return res.json({
        result: false,
        msg: "Required: driver_id, lat, long",
      });
    }

    const driver = await DeliveryModel.getActiveDriver(driver_id);

    if (driver.length === 0) {
      return res.json({
        result: false,
        msg: "Driver not found, inactive or offline",
      });
    }

    await DeliveryModel.updateDriverLocation(driver_id, lat, long);

    return res.json({
      result: true,
      msg: "Driver live location updated successfully",
    });
  } catch (err) {
    console.log("updateDriverLiveLocation Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function driverAcceptRejectOrder(req, res) {
  try {
    const { driver_id, order_id, action } = req.body || {};

    if (!driver_id || !order_id || !action) {
      return res.json({
        result: false,
        msg: "Required: driver_id, order_id, action",
      });
    }

    if (!["accept", "reject"].includes(action)) {
      return res.json({
        result: false,
        msg: "Action must be accept or reject",
      });
    }

    const driverData = await DeliveryModel.getActiveDriver(driver_id);

    if (driverData.length === 0) {
      return res.json({
        result: false,
        msg: "Driver not found or inactive",
      });
    }

    const driver = driverData[0];

    const orderData = await DeliveryModel.getRestaurantOrder(order_id);

    if (orderData.length === 0) {
      return res.json({
        result: false,
        msg: "Order not found",
      });
    }

    const order = orderData[0];

    // ================= ACCEPT =================

    if (action === "accept") {
      if (
        order.order_status === "Preparing" ||
        (order.delivery_boy_id &&
          String(order.delivery_boy_id) !== String(driver_id))
      ) {
        return res.json({
          result: false,
          msg: "Order already accepted by another driver",
        });
      }

      if (order.order_status !== "Accepted") {
        return res.json({
          result: false,
          msg: "Order is not in Accepted state",
        });
      }

      const otp = Math.floor(1000 + Math.random() * 9000);

      await DeliveryModel.acceptOrder(order_id, driver_id, otp);

      await DeliveryModel.updateDriverAccept(
        driver_id,
        order_id,
        Number(driver.total_trip) + 1,
      );

      emitVendorOrders(order.vendor_id); // ADDED: vendor home screen ko realtime push

      return res.json({
        result: true,
        msg: "Order accepted successfully and moved to Preparing",
        order_id,
        driver_id,
        otp,
        status: "Preparing",
      });
    }

    // ================= REJECT =================

    if (action === "reject") {
      await DeliveryModel.updateDriverReject(
        driver_id,
        Number(driver.cancel_trip) + 1,
      );

      const otherDrivers = await DeliveryModel.getOtherDrivers(driver_id);

      let stillPending = false;

      if (otherDrivers.length > 0) {
        stillPending = true;
      }

      if (!stillPending) {
        await DeliveryModel.rejectOrder(order_id);
        emitVendorOrders(order.vendor_id); // ADDED: vendor home screen ko realtime push
      }

      return res.json({
        result: true,
        msg: "Order rejected successfully",
        order_id,
        driver_id,
        status: stillPending ? "Still pending with other drivers" : "Rejected",
      });
    }

    return res.json({
      result: false,
      msg: "Invalid action",
    });
  } catch (err) {
    console.log("driverAcceptRejectOrder Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function driverAcceptRejectOrder(req, res) {
  try {
    const { driver_id, order_id, action } = req.body || {};

    if (!driver_id || !order_id || !action) {
      return res.json({
        result: false,
        msg: "Required: driver_id, order_id, action",
      });
    }

    if (!["accept", "reject"].includes(action)) {
      return res.json({
        result: false,
        msg: "Action must be accept or reject",
      });
    }

    const driverData = await DeliveryModel.getActiveDriver(driver_id);

    if (driverData.length === 0) {
      return res.json({
        result: false,
        msg: "Driver not found or inactive",
      });
    }

    const driver = driverData[0];

    const orderData = await DeliveryModel.getRestaurantOrder(order_id);

    if (orderData.length === 0) {
      return res.json({
        result: false,
        msg: "Order not found",
      });
    }

    const order = orderData[0];

    // ================= ACCEPT =================

    if (action === "accept") {
      if (
        order.order_status === "Preparing" ||
        (order.delivery_boy_id &&
          String(order.delivery_boy_id) !== String(driver_id))
      ) {
        await removeFirebaseEntry(driver_id, order_id);

        return res.json({
          result: false,
          msg: "Order already accepted by another driver",
        });
      }

      if (order.order_status !== "Accepted") {
        return res.json({
          result: false,
          msg: "Order is not in Accepted state",
        });
      }

      const otp = Math.floor(1000 + Math.random() * 9000);

      await DeliveryModel.acceptOrder(order_id, driver_id, otp);

      await DeliveryModel.updateDriverAccept(
        driver_id,
        order_id,
        Number(driver.total_trip) + 1,
      );

      // Notification wala part yahin PHP me tha — hata diya gaya hai (sirf ye missing hai, baaki sab same)

      await removeFirebaseEntry(driver_id, order_id);

      // Aur baaki sab active drivers ke node se bhi hata do (jinhe ye order offer hua tha)
      const otherDriversForCleanup =
        await DeliveryModel.getOtherDrivers(driver_id);

      await Promise.all(
        otherDriversForCleanup.map((other) =>
          removeFirebaseEntry(other.id, order_id),
        ),
      );

      emitVendorOrders(order.vendor_id); // ADDED: vendor home screen ko realtime push

      return res.json({
        result: true,
        msg: "Order accepted successfully and moved to Preparing",
        order_id,
        driver_id,
        otp,
        status: "Preparing",
      });
    }

    // ================= REJECT =================

    if (action === "reject") {
      await DeliveryModel.updateDriverReject(
        driver_id,
        Number(driver.cancel_trip) + 1,
      );

      await removeFirebaseEntry(driver_id, order_id);

      const otherDrivers = await DeliveryModel.getOtherDrivers(driver_id);

      const stillPending = await isOrderStillPendingElsewhere(
        otherDrivers,
        order_id,
      );

      if (!stillPending) {
        await DeliveryModel.rejectOrder(order_id);
        emitVendorOrders(order.vendor_id); // ADDED: vendor home screen ko realtime push
      }

      return res.json({
        result: true,
        msg: "Order rejected successfully",
        order_id,
        driver_id,
        status: stillPending ? "Still pending with other drivers" : "Rejected",
      });
    }

    return res.json({
      result: false,
      msg: "Invalid action",
    });
  } catch (err) {
    console.log("driverAcceptRejectOrder Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function driverPreparingOrders(req, res) {
  try {
    const { driver_id } = req.body || {};

    if (!driver_id) {
      return res.json({
        result: false,
        msg: "Required: driver_id",
      });
    }

    const driverData = await DeliveryModel.checkDriverStatus(driver_id);

    if (driverData.length === 0) {
      return res.json({
        result: false,
        msg: "Invalid driver",
      });
    }

    const orders = await DeliveryModel.getPreparingOrders(driver_id);

    if (orders.length === 0) {
      return res.json({
        result: false,
        msg: "No Preparing orders found",
        data: [],
      });
    }

    for (const order of orders) {
      // ================= Vendor Address =================

      const vendorAddress = await DeliveryModel.getVendorAddress(
        order.vendor_id,
      );

      order.vendor_address =
        vendorAddress.length > 0 && vendorAddress[0].address
          ? vendorAddress[0].address
          : "";

      // ================= Subtotal Calculation =================

      let subtotal = 0;

      let decodedSubtotal = null;

      if (order.order_items) {
        try {
          decodedSubtotal = JSON.parse(order.order_items);
        } catch (e) {
          decodedSubtotal = null;
        }
      }

      if (Array.isArray(decodedSubtotal)) {
        for (const item of decodedSubtotal) {
          const lineTotal =
            item.line_total !== undefined
              ? parseFloat(item.line_total)
              : parseFloat(item.price || 0) * parseInt(item.quantity || 1);

          subtotal += lineTotal;
        }
      }

      // ================= Coupon / Discount =================

      let discount = 0;
      let discountPercent = 0;
      let couponName = "";
      let couponCode = "";

      if (order.coupon_id && Number(order.coupon_applied) === 1) {
        const couponData = await DeliveryModel.getCoupon(order.coupon_id);

        if (couponData.length > 0) {
          const coupon = couponData[0];

          couponName = coupon.title || "";
          couponCode = coupon.code || "";

          if (
            coupon.discount_type === "percentage" ||
            coupon.discount_type === "percent"
          ) {
            discountPercent = parseFloat(coupon.cupon_price);
            discount = (subtotal * discountPercent) / 100;
          } else {
            discount = parseFloat(coupon.cupon_price);

            if (subtotal > 0) {
              discountPercent = (discount / subtotal) * 100;
            }
          }

          if (discount > subtotal) {
            discount = subtotal;
          }
        }
      }

      const amountAfterDiscount = subtotal - discount;

      const hstPercent = 13;

      const hstAmount = (amountAfterDiscount * hstPercent) / 100;

      const deliveryCharge = 5;

      const finalTotal = amountAfterDiscount + hstAmount + deliveryCharge;

      order.billing = {
        subtotal: subtotal.toFixed(2),
        coupon_name: couponName,
        coupon_code: couponCode,
        discount_percent: discountPercent.toFixed(2),
        discount_amount: discount.toFixed(2),
        amount_after_discount: amountAfterDiscount.toFixed(2),
        hst: "13%",
        hst_amount: hstAmount.toFixed(2),
        delivery_charge: deliveryCharge.toFixed(2),
        total_amount: finalTotal.toFixed(2),
      };

      // ================= Order Items Detail =================

      let decodedItems = null;

      if (order.order_items) {
        try {
          decodedItems = JSON.parse(order.order_items);
        } catch (e) {
          decodedItems = null;
        }
      }

      if (
        decodedItems &&
        Array.isArray(decodedItems) &&
        decodedItems.length > 0
      ) {
        const finalItems = [];

        for (const item of decodedItems) {
          // ---------- Addons ----------

          let addonsDetail = [];

          if (item.addons) {
            const addonIds = String(item.addons)
              .split(",")
              .map((id) => parseInt(id, 10))
              .filter((id) => !isNaN(id) && id !== 0);

            if (addonIds.length > 0) {
              const addonRows = await DeliveryModel.getAddonsByIds(addonIds);

              if (addonRows.length > 0) {
                addonsDetail = addonRows;
              }
            }
          }

          // ---------- Restaurant Item ----------

          const restaurantItemData = await DeliveryModel.getRestaurantItem(
            item.item_id,
          );

          const restaurantItem =
            restaurantItemData.length > 0 ? restaurantItemData[0] : null;

          const itemPrice =
            restaurantItem && restaurantItem.unit_price
              ? parseFloat(restaurantItem.unit_price)
              : parseFloat(item.price || 0);

          const itemTotal =
            item.total_price !== undefined
              ? parseFloat(item.total_price)
              : itemPrice * parseInt(item.quantity || 1);

          finalItems.push({
            cart_id: item.cart_id || "",
            product_id: item.item_id || "",
            item_name: item.item_name || "",
            item_image: item.item_image || "",
            price: itemPrice.toFixed(2),
            quantity: parseInt(item.quantity || 0),
            addons: addonsDetail,
            service_type: item.item_type || "",
            description: item.description || "",
            total_price: itemTotal.toFixed(2),
            unit_price: restaurantItem ? restaurantItem.unit_price || "" : "",
            discount_price: restaurantItem
              ? restaurantItem.discount_price || ""
              : "",
          });
        }

        order.order_items = finalItems;
      } else {
        order.order_items = [];
      }
    }

    return res.json({
      result: true,
      msg: "Preparing orders fetched successfully",
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.log("driverPreparingOrders Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function driverReadyForPickup(req, res) {
  try {
    const { driver_id, order_id } = req.body || {};

    if (!driver_id || !order_id) {
      return res.json({
        result: false,
        msg: "Required: driver_id, order_id",
      });
    }

    const driver = await DeliveryModel.getActiveDriver(driver_id);

    if (driver.length === 0) {
      return res.json({
        result: false,
        msg: "Invalid driver",
      });
    }

    const order = await DeliveryModel.getPreparingOrder(order_id, driver_id);

    if (order.length === 0) {
      return res.json({
        result: false,
        msg: "Order not found or not in Preparing status",
      });
    }

    await DeliveryModel.readyForPickup(order_id);

    const updated = await DeliveryModel.getOrderById(order_id);

    return res.json({
      result: true,
      msg: "Order moved to Ready_for_pickup successfully",
      order_id,
      driver_id,
      status: "Ready_for_pickup",
      data: updated[0],
    });
  } catch (err) {
    console.log("driverReadyForPickup Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function driverReadyForPickupOrdersShow(req, res) {
  try {
    const { driver_id } = req.body || {};

    if (!driver_id) {
      return res.json({
        result: false,
        msg: "Required: driver_id",
      });
    }

    const driverData = await DeliveryModel.checkDriverStatus(driver_id);

    if (driverData.length === 0) {
      return res.json({
        result: false,
        msg: "Invalid driver",
      });
    }

    const orders = await DeliveryModel.getReadyForPickupOrders(driver_id);

    if (orders.length === 0) {
      return res.json({
        result: false,
        msg: "No Ready For Pickup / On The Way orders found",
      });
    }

    for (const order of orders) {
      // ================= Vendor / Restaurant Address =================

      const vendorAddress = await DeliveryModel.getVendorAddress(
        order.vendor_id,
      );

      const va = vendorAddress.length > 0 ? vendorAddress[0] : null;

      order.restaurant_address = va && va.address ? va.address : "";
      order.restaurant_lat = va && va.lat ? va.lat : "";
      order.restaurant_long = va && va.long ? va.long : "";

      // ================= Order Items =================

      let finalItems = [];
      let decodedItems = [];

      if (order.order_items) {
        try {
          decodedItems = JSON.parse(order.order_items);
        } catch (e) {
          decodedItems = [];
        }
      }

      if (!Array.isArray(decodedItems)) {
        decodedItems = [];
      }

      for (const item of decodedItems) {
        // ---------- Addons ----------

        let addonsDetail = [];

        if (item.addons) {
          const addonIds = String(item.addons)
            .split(",")
            .map((id) => parseInt(id, 10))
            .filter((id) => !isNaN(id) && id !== 0);

          if (addonIds.length > 0) {
            const addonRows = await DeliveryModel.getAddonsByIds(addonIds);

            if (addonRows.length > 0) {
              addonsDetail = addonRows;
            }
          }
        }

        // ---------- Restaurant Item ----------

        const restaurantItemData = await DeliveryModel.getRestaurantItem(
          item.item_id,
        );

        const restaurantItem =
          restaurantItemData.length > 0 ? restaurantItemData[0] : null;

        const itemPrice =
          restaurantItem && restaurantItem.unit_price
            ? parseFloat(restaurantItem.unit_price)
            : parseFloat(item.price || 0);

        const itemTotal =
          item.total_price !== undefined
            ? parseFloat(item.total_price)
            : itemPrice * parseInt(item.quantity || 1);

        finalItems.push({
          cart_id: item.cart_id || "",
          product_id: item.item_id || "",
          item_name: item.item_name || "",
          item_image: item.item_image || "",
          price: itemPrice.toFixed(2),
          quantity: parseInt(item.quantity || 0),
          addons: addonsDetail,
          service_type: item.item_type || "",
          description: item.description || "",
          total_price: itemTotal.toFixed(2),
          unit_price: restaurantItem ? restaurantItem.unit_price || "" : "",
          discount_price: restaurantItem
            ? restaurantItem.discount_price || ""
            : "",
        });
      }

      order.order_items = finalItems;
      order.item_count = finalItems.length;

      // ================= Billing =================

      const subtotal = parseFloat(order.subtotal || 0);

      let discount = 0;
      let discountPercent = 0;
      let couponName = "";
      let couponCode = "";

      if (order.coupon_id && Number(order.coupon_applied) === 1) {
        const couponData = await DeliveryModel.getCoupon(order.coupon_id);

        if (couponData.length > 0) {
          const coupon = couponData[0];

          couponName = coupon.title || "";
          couponCode = coupon.code || "";

          if (
            coupon.discount_type === "percentage" ||
            coupon.discount_type === "percent"
          ) {
            discountPercent = parseFloat(coupon.cupon_price);
            discount = (subtotal * discountPercent) / 100;
          } else {
            discount = parseFloat(coupon.cupon_price);

            if (subtotal > 0) {
              discountPercent = (discount / subtotal) * 100;
            }
          }
        }
      }

      if (discount > subtotal) {
        discount = subtotal;
      }

      const amountAfterDiscount = subtotal - discount;
      const hstPercent = 13;
      const hstAmount = (amountAfterDiscount * hstPercent) / 100;
      const walletUsed = parseFloat(order.wallet_used || 0);
      const deliveryCharge = 5;

      const finalTotal = amountAfterDiscount + hstAmount + deliveryCharge;

      order.billing = {
        subtotal: subtotal.toFixed(2),
        coupon_id: order.coupon_id || "",
        coupon_name: couponName,
        coupon_code: couponCode,
        discount_percent: discountPercent.toFixed(2),
        discount_string: `${discountPercent.toFixed(2)}%`,
        discount_amount: discount.toFixed(2),
        amount_after_discount: amountAfterDiscount.toFixed(2),
        delivery_charge: deliveryCharge.toFixed(2),
        wallet_used: walletUsed.toFixed(2),
        hst: "13%",
        hst_amount: hstAmount.toFixed(2),
        total_amount: finalTotal.toFixed(2),
      };

      // cleanup raw fields
      delete order.coupon_applied;
      delete order.wallet_used;
    }

    return res.json({
      result: true,
      msg: "Ready For Pickup / On The Way orders fetched successfully",
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.log("driverReadyForPickupOrdersShow Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function driverOnTheWayOrder(req, res) {
  try {
    const { driver_id, order_id, confirm_status } = req.body || {};

    if (!driver_id || !order_id || !confirm_status) {
      return res.json({
        result: false,
        msg: "Required: driver_id, order_id, confirm_status",
      });
    }

    const driver = await DeliveryModel.getActiveDriver(driver_id);

    if (driver.length === 0) {
      return res.json({
        result: false,
        msg: "Invalid driver",
      });
    }

    const order = await DeliveryModel.getPickedUpOrder(order_id, driver_id);

    if (order.length === 0) {
      return res.json({
        result: false,
        msg: "Order not found or not in Picked_up status",
      });
    }

    await DeliveryModel.updateOnTheWay(order_id, confirm_status);

    /*
    ======================================================
    ADD USER & VENDOR NOTIFICATION HERE
    ======================================================

    Same place as PHP:

    - Get User
    - Get Vendor
    - Insert notification table
    - Send FCM Notification

    ======================================================
    */

    await DeliveryModel.updateDriverCurrentOrder(driver_id, order_id);

    const updated = await DeliveryModel.getOrderById(order_id);

    let data = updated[0];

    let item_count = 0;

    if (data.order_items) {
      try {
        const items = JSON.parse(data.order_items);

        if (Array.isArray(items)) {
          item_count = items.length;
        }
      } catch (e) {}
    }

    data.item_count = item_count;

    return res.json({
      result: true,
      msg: "Order status updated to On_the_way successfully",
      order_id,
      driver_id,
      status: "On_the_way",
      data,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function driverHomeData(req, res) {
  try {
    const { driver_id } = req.body || {};

    if (!driver_id) {
      return res.json({
        result: false,
        msg: "Required: driver_id",
      });
    }

    const data = await DeliveryModel.getDriverHomeData(driver_id);

    if (!data) {
      return res.json({
        result: false,
        msg: "Invalid driver_id",
      });
    }

    const {
      driver,
      today,
      today_total,
      today_preparing,
      today_on_the_way,
      today_delivered,
      today_cancelled,
      total_delivered_orders,
      final_total,
      today_earning,
    } = data;

    return res.json({
      result: true,
      msg: "Driver home data fetched successfully",

      data: {
        driver_id: String(driver.id),

        driver_name:
          `${driver.first_name || ""} ${driver.last_name || ""}`.trim(),

        driver_phone: driver.phone || "",

        driver_email: driver.email || "",

        driver_image: driver.profile_image || "",

        is_available: Number(driver.is_available || 0),

        total_earning: Number(final_total).toFixed(2),

        total_delivered_orders,

        today: {
          date: today,

          total_earning: Number(today_earning).toFixed(2),

          today_total,

          orders: today_preparing,

          on_the_way: today_on_the_way,

          delivered: today_delivered,

          cancelled: today_cancelled,
        },
      },
    });
  } catch (err) {
    console.error("driverHomeData Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function driverEarningsDashboard(req, res) {
  try {
    const { driver_id, filter } = req.body || {};

    if (!driver_id) {
      return res.json({
        result: false,
        msg: "Required: driver_id",
      });
    }

    const allowedFilters = ["daily", "weekly", "monthly"];

    if (filter && !allowedFilters.includes(filter)) {
      return res.json({
        result: false,
        msg: "Invalid filter. Allowed: daily, weekly, monthly",
      });
    }

    const data = await DeliveryModel.getDriverEarningsDashboard(
      driver_id,
      filter,
    );

    if (!data) {
      return res.json({
        result: false,
        msg: "Invalid driver_id",
      });
    }

    return res.json({
      result: true,

      msg: "Driver earnings fetched successfully",

      summary: {
        total_orders_alltime: Number(data.totalOrdersAllTime),

        total_earning_alltime: Number(data.totalEarningAllTime).toFixed(2),

        filter: data.filter,

        filter_label: data.filterLabel,

        filter_total_orders: Number(data.filterTotalOrders),

        filter_total_earning: Number(data.filterTotalEarning).toFixed(2),

        per_order_earning: data.perOrderEarning,
      },

      orders: data.orderList,
    });
  } catch (err) {
    console.error("driverEarningsDashboard Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function driverAllOrdersList(req, res) {
  try {
    const { driver_id, order_status } = req.body || {};

    if (!driver_id || !order_status) {
      return res.json({
        result: false,
        msg: "Required: driver_id, order_status",
      });
    }

    const allStatuses = [
      "Pending",
      "Accepted",
      "Cancelled",
      "Preparing",
      "Ready_for_pickup",
      "Picked_up",
      "On_the_way",
      "Delivered",
      "Rejected",
      "Missed",
    ];

    const allowedStatuses = ["All", ...allStatuses];

    if (!allowedStatuses.includes(order_status)) {
      return res.json({
        result: false,
        msg: "Invalid order_status",
      });
    }

    const data = await DeliveryModel.getDriverAllOrdersList(
      driver_id,
      order_status,
    );

    if (!data) {
      return res.json({
        result: false,
        msg: "Invalid driver_id",
      });
    }

    if (!data.orders || data.orders.length === 0) {
      return res.json({
        result: true,
        msg: "No orders found",
        orders: [],
      });
    }

    return res.json({
      result: true,

      msg: "Driver orders fetched successfully",

      orders: data.orders,
    });
  } catch (err) {
    console.error("driverAllOrdersList Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function driverSaveBankDetails(req, res) {
  try {
    const {
      driver_id,
      acc_holder_name,
      account_number,
      branch_name,
      institution_number,
      tansit_number,
      branch_address,
    } = req.body || {};

    if (
      !driver_id ||
      !acc_holder_name ||
      !account_number ||
      !branch_name ||
      !institution_number ||
      !tansit_number ||
      !branch_address
    ) {
      return res.json({
        result: "false",
        msg: "required: (driver_id, acc_holder_name, account_number, branch_name, tansit_number, branch_address, institution_number)",
      });
    }

    const driver = await DeliveryModel.getDriverById(driver_id);

    if (!driver) {
      return res.json({
        result: "false",
        msg: "Wrong driver_id",
      });
    }

    const update = await DeliveryModel.updateDriverBankDetails(driver_id, {
      acc_holder_name,
      account_number,
      branch_name,
      institution_number,
      tansit_number,
      branch_address,
    });

    if (update.affectedRows > 0) {
      return res.json({
        result: "true",
        msg: "Bank details updated successfully",
      });
    }

    return res.json({
      result: "false",
      msg: "Something went wrong",
    });
  } catch (err) {
    console.error("driverSaveBankDetails Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
}

async function deliveryBoyLogout(req, res) {
  try {
    const { driver_id } = req.body || {};

    if (!driver_id) {
      return res.json({
        result: false,
        msg: "Required: driver_id",
      });
    }

    // Check driver
    const driver = await DeliveryModel.getDriverById(driver_id);

    if (!driver) {
      return res.json({
        result: false,
        msg: "Wrong driver_id",
      });
    }

    // Logout / Clear FCM
    const update = await DeliveryModel.logoutDriver(driver_id);

    if (update.affectedRows > 0) {
      return res.json({
        result: true,
        msg: "Logout successfully",
      });
    }

    return res.json({
      result: false,
      msg: "Something went wrong",
    });
  } catch (err) {
    console.error("deliveryBoyLogout Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

const restaurantOrderDetails = async (req, res) => {

    try {

        const order_id = req.body.order_id;

        // ==========================================
        // ORDER ID
        // ==========================================

        if (!order_id) {

            return res.json({
                result: false,
                msg: "Required: order_id"
            });
        }

        // ==========================================
        // ORDER
        // ==========================================

        const order =
            await DeliveryModel.getRestaurantOrder(order_id);

        if (!order) {

            return res.json({
                result: false,
                msg: "No pending order found for this order_id"
            });
        }

        // ==========================================
        // USER
        // ==========================================

        const user =
            await DeliveryModel.getUserById(order.user_id);

        // ==========================================
        // ADDRESS
        // ==========================================

        let address_row = null;

        if (order.address_id) {

            address_row =
                await DeliveryModel.getAddressById(
                    order.address_id
                );
        }

        // ==========================================
        // VENDOR
        // ==========================================

        const vendor =
            await DeliveryModel.getRestaurantById(
                order.vendor_id
            );

        // ==========================================
        // VENDOR ADDRESS
        // ==========================================

        const vendor_address =
            await DeliveryModel.getVendorAddress(
                order.vendor_id
            );

        // ==========================================
        // CART
        // ==========================================

        let CART = [];

        if (order.order_items) {

            try {

                CART =
                    typeof order.order_items === "string"
                        ? JSON.parse(order.order_items)
                        : order.order_items;

            } catch (error) {

                CART = [];
            }
        }

        if (!Array.isArray(CART)) {
            CART = [];
        }

        // ==========================================
        // PRODUCT LIST
        // ==========================================

        const product_list = [];

        let subtotal = 0.00;

        for (const item of CART) {

            const line_total =
                parseFloat(item.line_total || 0);

            subtotal += line_total;

            // ======================================
            // ADDONS
            // ======================================

            let addons_detail = [];

            if (item.addons) {

                const addon_ids = String(item.addons)
                    .split(",")
                    .map(id => parseInt(id))
                    .filter(id => !isNaN(id));

                if (addon_ids.length > 0) {

                    addons_detail =
                        await DeliveryModel.getAddonsByIds(
                            addon_ids
                        );
                }
            }

            // ======================================
            // PRODUCT
            // ======================================

            product_list.push({

                cart_id:
                    item.cart_id ?? "",

                item_id:
                    item.item_id ?? "",

                item_name:
                    item.item_name ?? "",

                item_image:
                    item.item_image ?? "",

                item_type:
                    item.item_type ?? "",

                description:
                    item.description ?? "",

                quantity:
                    parseInt(item.quantity ?? 1),

                price:
                    parseFloat(
                        item.price ?? 0
                    ).toFixed(2),

                line_total:
                    line_total.toFixed(2),

                addons:
                    addons_detail
            });
        }

        // ==========================================
        // COUPON
        // ==========================================

        let coupon_applied = 0;
        let coupon_code = "";
        let coupon_discount_pct = 0;
        let coupon_discount_amt = 0.00;

        if (
            order.coupon_applied &&
            order.coupon_applied == 1 &&
            order.coupon_id
        ) {

            const cpn =
                await DeliveryModel.getCouponById(
                    order.coupon_id
                );

            if (cpn) {

                coupon_applied = 1;

                coupon_code =
                    cpn.code ?? "";

                if (
                    (cpn.discount_type ?? "percent")
                    === "percent"
                ) {

                    coupon_discount_pct =
                        parseFloat(
                            cpn.cupon_price
                        );

                    coupon_discount_amt =
                        (
                            subtotal *
                            coupon_discount_pct
                        ) / 100;

                } else {

                    coupon_discount_amt =
                        parseFloat(
                            cpn.cupon_price
                        );

                    coupon_discount_pct =
                        subtotal > 0
                            ? Math.round(
                                (
                                    coupon_discount_amt /
                                    subtotal
                                ) * 100 * 100
                            ) / 100
                            : 0;
                }
            }
        }

        // ==========================================
        // AMOUNT
        // ==========================================

        const delivery_charge =
            parseFloat(
                order.delivery_charge ?? 0
            );

        const wallet_used =
            parseFloat(
                order.wallet_used ?? 0
            );

        const amount_after_discount =
            subtotal - coupon_discount_amt;

        const hst_percentage = 13;

        const hst_amount =
            (
                amount_after_discount *
                hst_percentage
            ) / 100;

        const total_amount =
            amount_after_discount +
            hst_amount +
            delivery_charge -
            wallet_used;

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.json({

            result: true,

            msg:
                "Pending order details fetched successfully",

            data: {

                order_id:
                    String(order.id),

                order_number:
                    order.order_number ?? "",

                order_status:
                    order.order_status ?? "",

                payment_status:
                    order.payment_status ?? "",

                payment_method:
                    order.payment_method ?? "",

                order_date:
                    order.order_date ?? "",

                order_time:
                    order.order_time ?? "",

                created_at:
                    order.created_at ?? "",

                delivery_otp:
                    order.delivery_otp ?? "",

                notes:
                    order.notes ?? "",

                // ==================================
                // USER
                // ==================================

                user: {

                    user_id:
                        String(user?.id ?? ""),

                    user_name:
                        `${user?.fname ?? ""} ${user?.lname ?? ""}`
                        .trim(),

                    mobile:
                        user?.mobile ?? "",

                    email:
                        user?.email ?? "",

                    image:
                        user?.image ?? ""
                },

                // ==================================
                // DELIVERY ADDRESS
                // ==================================

                delivery_address: {

                    address_id:
                        String(
                            order.address_id ?? ""
                        ),

                    address:
                        order.drop_address ??
                        address_row?.address ??
                        "",

                    latitude:
                        order.user_latitude ??
                        address_row?.lat ??
                        "",

                    longitude:
                        order.user_longitude ??
                        address_row?.lang ??
                        ""
                },

                // ==================================
                // RESTAURANT
                // ==================================

                restaurant: {

                    restaurant_id:
                        String(
                            vendor?.id ?? ""
                        ),

                    business_name:
                        vendor?.business_name ?? "",

                    name:
                        vendor?.name ?? "",

                    image:
                        vendor?.image ?? "",

                    mobile:
                        vendor?.mobile ?? "",

                    email:
                        vendor?.email ?? "",

                    minimum_delivery_time:
                        vendor?.minimum_delivery_time ?? "",

                    maximum_delivery_time:
                        vendor?.maximum_delivery_time ?? "",

                    delivery_time_type:
                        vendor?.delivery_time_type ?? ""
                },

                // ==================================
                // RESTAURANT ADDRESS
                // ==================================

                restaurant_address: {

                    address:
                        vendor_address?.address ??
                        vendor?.address ??
                        "",

                    latitude:
                        vendor_address?.lat ??
                        vendor?.lat ??
                        "",

                    longitude:
                        vendor_address?.lang ??
                        vendor?.long ??
                        ""
                },

                // ==================================
                // PRODUCTS
                // ==================================

                item_count:
                    product_list.length,

                product_list:
                    product_list,

                // ==================================
                // COUPON
                // ==================================

                coupon_applied:
                    coupon_applied,

                coupon_code:
                    coupon_code,

                discount_percent:
                    coupon_discount_pct,

                discount_string:
                    coupon_discount_pct + "%",

                discount_amount:
                    coupon_discount_amt.toFixed(2),

                // ==================================
                // AMOUNTS
                // ==================================

                subtotal:
                    subtotal.toFixed(2),

                amount_after_discount:
                    amount_after_discount.toFixed(2),

                delivery_charge:
                    delivery_charge.toFixed(2),

                wallet_used:
                    wallet_used.toFixed(2),

                hst:
                    hst_percentage + "%",

                hst_amount:
                    hst_amount.toFixed(2),

                total_amount:
                    total_amount.toFixed(2)
            }
        });

    } catch (error) {

        console.error(
            "restaurant_pending_order_details:",
            error
        );

        return res.status(500).json({

            result: false,

            msg: "Something went wrong",

            error: error.message
        });
    }
}


module.exports = {
  deliveryBoySignup,
  deliveryBoyLogin,
  deliveryBoyVerifyOtp,
  deliveryBoyUpdateProfile,
  driverAvailabilityStatus,
  deliveryGetProfile,
  updateDriverLiveLocation,
  driverAcceptRejectOrder,
  driverPreparingOrders,
  driverReadyForPickup,
  driverReadyForPickupOrdersShow,
  driverOnTheWayOrder,
  driverHomeData,
  driverEarningsDashboard,
  driverAllOrdersList,
  driverSaveBankDetails,
  deliveryBoyLogout,
  restaurantOrderDetails,
};
