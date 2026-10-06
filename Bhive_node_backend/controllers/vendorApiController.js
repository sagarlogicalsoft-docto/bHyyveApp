const bcrypt = require("bcrypt");
const pool = require("../config/db");
const fs = require("fs");
const path = require("path");
const vendorModel = require("../models/vendorModel");
const { sendOTP } = require("../utils/sms");
const TruAnonService = require("../services/truAnonService");
const {
  sendNotification,
  sendPayloadNotification,
} = require("../services/notificationService");

const BCRYPT_ROUNDS = 10;

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function numberFormat2(value) {
	const n = Number(value) || 0;
	const abs = Math.abs(n);
	const rounded = Number(Math.round(Number(abs + "e2")) + "e-2");
	return ((n < 0 ? -1 : 1) * (isNaN(rounded) ? abs : rounded)).toFixed(2);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
 
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
 
async function removeOrderFromAllBroadcastedDrivers(order, exceptDriverId = null, extraDriverIds = []) {
  let driverIds = [];
 
  if (order.broadcasted_driver_ids) {
    try {
      const decoded = JSON.parse(order.broadcasted_driver_ids);
      if (Array.isArray(decoded)) driverIds = decoded;
    } catch (e) {
      driverIds = [];
    }
  }
 
  driverIds = [...new Set([...driverIds, ...extraDriverIds])];
 
  for (const driverId of driverIds) {
    if (exceptDriverId !== null && String(driverId) === String(exceptDriverId)) {
      continue;
    }
    try {
      await admin
        .database()
        .ref(`assigned_driver_orders/${driverId}/${order.id}`)
        .remove();
    } catch (e) {}
  }
}

async function vendorSignup(req, res) {
  try {
    const {
      name,
      fname,
      lname,
      email,
      password,
      phone,
      country_code,
      post_code,
      fcm_id,
    } = req.body;

    let firstName = name || fname || "";
    let lastName = lname || "";

    firstName = firstName.trim();
    lastName = lastName.trim();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phone ||
      !country_code ||
      !fcm_id
    ) {
      return res.json({
        result: false,
        msg: "Please give parameters (name,lname,email,password,phone,country_code,post_code,fcm_id)",
      });
    }

    const existing = await vendorModel.findByEmailOrMobile(email, phone);

    if (existing.length > 0) {
      return res.json({
        result: false,
        msg: "User Already Exits On email Or Phone",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const timeSlots = await vendorModel.getAllTimeSlots();

    let vendorSlotId = "";
    if (timeSlots && timeSlots.length > 0) {
      const slotIds = timeSlots.map((slot) => slot.id);

      vendorSlotId = slotIds.join(",");
    }

    const vendorData = {
      name: `${firstName} ${lastName}`,
      email_id: email,
      password: hashedPassword,
      plain_password: password,
      mobile: phone,
      country_code: country_code,
      otp: otp,
      fcm_id: fcm_id,
      verify_otp: 0,
      page_status: 1,
    };

    if (post_code !== undefined && post_code !== null) {
      vendorData.post_code = post_code;
    }

    if (vendorSlotId) {
      vendorData.vendor_slote_id = vendorSlotId;
    }
    const lastId = await vendorModel.insertVendor(vendorData);

    if (!lastId) {
      return res.json({
        result: false,
        msg: "Could Not saved",
      });
    }

    let smsResponse = {};
    try {
      smsResponse = await sendOTP(`+${country_code}`, phone, otp);
    } catch (smsError) {
      console.log("Signup SMS Error:", smsError.message);
      smsResponse = {};
    }

    return res.json({
      result: true,
      msg: "saved Successfully",
      vendor_id: lastId,
      otp: otp,
    });
  } catch (err) {
    console.error("userSignup error:", err);

    return res.status(500).json({
      result: false,

      msg: "Something went wrong. Please try later.",
    });
  }
}

async function vendorLogin(req, res) {
  try {
    const { mobile, password, fcm_id } = req.body;

    if (!mobile || !password || !fcm_id) {
      return res.json({
        result: false,

        msg: "Please provide parameters(mobile,password,fcm_id)",
      });
    }

    const vendors = await vendorModel.findByMobile(mobile);
    if (!vendors || vendors.length === 0) {
      return res.json({
        result: false,

        msg: "No Vendor Found, Please Try Again",

        account_status: 0,
      });
    }

    const vendor = vendors[0];
    let isPasswordMatch = false;

    if (vendor.password && vendor.password.startsWith("$2")) {
      isPasswordMatch = await bcrypt.compare(password, vendor.password);
    } else {
      isPasswordMatch = vendor.password === password;
    }

    if (!isPasswordMatch) {
      return res.json({
        result: false,
        msg: "No Vendor Found, Please Try Again",

        account_status: 0,
      });
    }

    if (Number(vendor.is_kyc_approved) === 0) {
      return res.json({
        result: false,
        msg: "Please Wait 24hr Your KYC is Under Review",
      });
    }

    await vendorModel.updateVendor(vendor.id, {
      fcm_id: fcm_id,
    });

    const catId = vendor.cat_id || 0;

    let catName = "";

    if (catId) {
      const category = await vendorModel.getCategory(catId);

      if (category) {
        catName = category.category_name || "";
      }
    }

    return res.json({
      result: true,
      msg: "success",
      vendor_id: vendor.id,
      name: vendor.name,
      mobile: vendor.mobile,
      cat_id: catId,
      cat_name: catName,
      account_status: vendor.status,
      data: {
        ...vendor,
        fcm_id: fcm_id,
      },
    });
  } catch (err) {
    console.error("userLogin error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something went wrong.",
    });
  }
}

async function saveDetail(req, res) {
  try {
    const {
      vendor_id,
      business_name,
      hst_number,
      cat_id,
      city_id,
      province_id,
      facebook_ink,
      instagram_link,
      linkdin_link,
      business_description,
      dining_option,
      minimum_delivery_time,
      maximum_delivery_time,
      delivery_time_type,
    } = req.body;

    if (!vendor_id || !business_name || !hst_number) {
      return res.json({
        result: false,
        msg: "required: vendor_id, business_name, hst_number  --- optional(cat_id, city_id, profile_image, id_proof, id_proof_two, pad_file, province_id, facebook_ink, instagram_link, linkdin_link)",
      });
    }

    const vendor = await vendorModel.getVendorById(vendor_id);

    if (!vendor) {
      return res.json({
        result: false,
        msg: "Wrong Vendor id",
      });
    }

    const DATA = {};

    if (business_name) {
      DATA.business_name = business_name;
    }

    if (hst_number) {
      DATA.hst_number = hst_number;
    }

    if (cat_id) {
      DATA.cat_id = cat_id;

      if (String(cat_id) === "118") {
        DATA.vendor_type = "restaurant";
      }
    }

    if (city_id !== undefined && city_id !== null && city_id !== "") {
      if (Array.isArray(city_id)) {
        DATA.city_id = city_id.join(",");
      } else {
        DATA.city_id = city_id;
      }
    }

    if (province_id) {
      DATA.province_id = province_id;
    }

    if (facebook_ink) {
      DATA.facebook_ink = facebook_ink;
    }

    if (instagram_link) {
      DATA.instagram_link = instagram_link;
    }

    if (linkdin_link) {
      DATA.linkdin_link = linkdin_link;
    }

    if (business_description) {
      DATA.business_description = business_description;
    }

    if (
      dining_option !== undefined &&
      dining_option !== null &&
      dining_option !== ""
    ) {
      if (Array.isArray(dining_option)) {
        DATA.dining_option = dining_option.join(",");
      } else {
        DATA.dining_option = dining_option;
      }
    }

    if (minimum_delivery_time) {
      DATA.minimum_delivery_time = minimum_delivery_time;
    }

    if (maximum_delivery_time) {
      DATA.maximum_delivery_time = maximum_delivery_time;
    }

    if (delivery_time_type) {
      DATA.delivery_time_type = "min";
    }

    DATA.page_status = 2;

    if (req.files) {
      if (req.files.profile_image && req.files.profile_image.length > 0) {
        DATA.image = req.files.profile_image[0].filename;
      }

      if (req.files.id_proof && req.files.id_proof.length > 0) {
        DATA.id_proof = req.files.id_proof[0].filename;
      }

      if (req.files.id_proof_two && req.files.id_proof_two.length > 0) {
        DATA.id_proof_two = req.files.id_proof_two[0].filename;
      }

      if (req.files.pad_file && req.files.pad_file.length > 0) {
        DATA.pad_file = req.files.pad_file[0].filename;
      }
    }

    await vendorModel.updateVendor(vendor_id, DATA);

    const updatedVendor = await vendorModel.findById(vendor_id);

    return res.json({
      result: true,
      msg: "update successfully",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("saveDetail error:", error);

    return res.status(500).json({
      result: false,
      msg: "Something went wrong. Please try later.",
    });
  }
}

const saveBankDetail = async (req, res) => {
  try {
    const {
      vendor_id,
      acc_holder_name,
      account_number,
      branch_name,
      tansit_number,
      branch_address,
      institution_number,
    } = req.body;

    if (
      !vendor_id ||
      !acc_holder_name ||
      !account_number ||
      !branch_name ||
      !tansit_number ||
      !branch_address ||
      !institution_number
    ) {
      return res.json({
        result: "false",
        msg: "required: (vendor_id, acc_holder_name, account_number, branch_name, tansit_number,branch_address,institution_number)",
      });
    }

    const vendor = await vendorModel.getVendorById(vendor_id);

    if (!vendor) {
      return res.json({
        result: "false",
        msg: "Wrong vendor_id",
      });
    }

    const bankData = {
      acc_holder_name: acc_holder_name,
      account_number: account_number,
      branch_name: branch_name,
      institution_number: institution_number,
      tansit_number: tansit_number,
      branch_address: branch_address,
    };

    await vendorModel.updateVendor(vendor_id, bankData);

    // ============================================================
    // NOTIFICATION + MAIL
    // COMMENTED AS REQUESTED
    // ============================================================

    /*
		const updatedVendor = await vendorModel.getVendorById(vendor_id);

		if (updatedVendor && updatedVendor.fcm_id) {

			const Userfcm_id = updatedVendor.fcm_id;

			const notificationData = {
				sender_id: vendor_id,
				message: "Registration successful!  Pending KYC.",
				sender_type: "customer",
				receiver_type: "Admin",
				types: "Registration"
			};

			await vendorModel.insertNotification(notificationData);

			const title = "Welcome to Our App!";
			const body = "Registration successful!  Pending KYC.";
			const to_email = "bhyyve@gmail.com";

			const notification = {
				title: title,
				body: body
			};

			// Firebase notification
			await sendNotification(
				notification,
				Userfcm_id,
				messaging
			);

			// Email
			await sendMailNotification(
				to_email,
				title,
				body
			);
		}
		*/

    return res.json({
      result: "true",
      msg: "update successfully",
    });
  } catch (error) {
    console.error("saveBankDetail Error:", error);

    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { vendor_id, otp } = req.body;

    if (!vendor_id || !otp) {
      return res.json({
        result: "false",
        msg: "required: vendor_id, otp",
      });
    }

    const vendor = await vendorModel.getVendorById(vendor_id);

    if (!vendor) {
      return res.json({
        result: "false",
        msg: "Wrong Vendor id",
      });
    }

    const verifiedVendor = await vendorModel.getVendorByIdAndOtpVerified(
      vendor_id,
      otp,
    );

    if (verifiedVendor) {
      return res.json({
        result: "true",
        msg: "Otp already verify",
        data: verifiedVendor,
      });
    }

    const otpVendor = await vendorModel.getVendorByOtp(vendor_id, otp);

    if (otpVendor) {
      await vendorModel.updateVendor(otpVendor.id, {
        verify_otp: 1,
      });

      const updatedVendor = await vendorModel.getVendorById(otpVendor.id);

      return res.json({
        result: "true",
        msg: "Otp verify Successfully",
        data: updatedVendor,
      });
    }

    return res.json({
      result: "false",
      msg: "sorry otp not valid.",
    });
  } catch (error) {
    console.error("verifyOtp Error:", error);

    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await vendorModel.getAllCategories();

    if (categories.length > 0) {
      return res.json({
        result: "true",
        msg: "get successfully",
        data: categories,
      });
    } else {
      return res.json({
        result: "false",
        msg: "No Category Found",
      });
    }
  } catch (error) {
    console.error("getCategories Error:", error);

    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

const getCities = async (req, res) => {
  try {
    const cities = await vendorModel.getAllCities();

    if (cities.length > 0) {
      return res.json({
        result: "true",
        msg: "Fetched successfully",
        data: cities,
      });
    } else {
      return res.json({
        result: "false",
        msg: "No cities found",
      });
    }
  } catch (error) {
    console.error("getCities Error:", error);

    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

const getLoginStatus = async (req, res) => {
  try {
    const { vendor_id } = req.body;
    if (vendor_id === undefined || vendor_id === null) {
      return res.json({
        result: "false",
        msg: "Parameter vendor_id is required",
      });
    }
    const fetchData = await vendorModel.getLoginStatus(vendor_id);
    if (fetchData) {
      return res.json({
        result: "true",
        msg: "Login Status",
        data: fetchData,
      });
    }
    return res.json({
      result: "false",
      msg: "No Status",
    });
  } catch (error) {
    console.error("getLoginStatus Error:", error);

    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

const getPendingBooking = async (req, res) => {
  try {
    const { vendor_id } = req.body;

    if (!vendor_id) {
      return res.json({
        result: false,
        msg: "Please give parameters (vendor_id)",
      });
    }

    const vendor = await vendorModel.getVendorById(vendor_id);
    if (!vendor) {
      return res.json({ result: false, msg: "Wrong vendor_id" });
    }
    const business_name = vendor.business_name;

    const bookings = await vendorModel.getPendingBookings(vendor_id);
    if (bookings.length === 0) {
      return res.json({ result: false, msg: "No Booking Yet" });
    }

    for (const book_row of bookings) {
      let CART = [];
      try {
        CART = JSON.parse(book_row.cart_meta_data || "[]");
      } catch (e) {
        CART = [];
      }

      let discount = 0,
        discount_code = "",
        TOTAL = 0;
      book_row.item_count = CART.length;
      book_row.hst = "13%";
      book_row.discount = 0;

      const product_list = [];
      let lastProductId = null;

      for (const value of CART) {
        TOTAL += parseFloat(value.final_amount || 0);

        let warranty_amount = 0;
        const warrenty_status = parseInt(value.warrenty_status || 0, 10);

        if (warrenty_status === 1 && value.product_id) {
          const product = await vendorModel.getProductById(value.product_id);
          if (product) {
            warranty_amount =
              parseFloat(product.warranty_price || 0) *
              parseFloat(value.quantity || 1);
          }
        }
        TOTAL += warranty_amount;

        if (value.coupon_id && discount === 0) {
          const coupon = await vendorModel.getCouponById(value.coupon_id);
          if (coupon) {
            discount = parseFloat(coupon.cupon_price);
            discount_code = coupon.code;
            book_row.discount = discount + "%";
          }
        }

        let service_type = value.service_type
          ? String(value.service_type).toLowerCase().trim()
          : "";

        const TEMP = {
          product_id: value.product_id,
          name: value.name,
          image: value.image,
          quantity: value.quantity,
          selected_service_type: service_type,
          final_amount: parseFloat(value.final_amount || 0).toFixed(2),
          warrenty_status: warrenty_status,
          warranty_amount: warranty_amount.toFixed(2),
        };

        if (value.addon) {
          TEMP.addons = await vendorModel.getAddonsByIds(value.addon);
          TEMP.addon_price = value.addon_price;
        } else {
          TEMP.addons = [];
          TEMP.addon_price = value.addon_price;
        }

        product_list.push(TEMP);
        lastProductId = value.product_id;
      }

      const product_detail = lastProductId
        ? await vendorModel.getProductById(lastProductId)
        : null;
      const product_rate = product_detail
        ? parseFloat(product_detail.rate || 0)
        : 0;

      book_row.total_amount = TOTAL;
      book_row.item_total = TOTAL.toFixed(2);

      const discount_amount = (TOTAL * discount) / 100;
      book_row.discount_amount = discount_amount.toFixed(2);
      book_row.promo_code = discount_code;

      const amount_after_discount = TOTAL - discount_amount;
      const hst_amount = (amount_after_discount * 13) / 100;
      book_row.hst_amount = hst_amount.toFixed(2);

      let cart_total = amount_after_discount + hst_amount;

      if (book_row.referral_discount == 1) {
        book_row.referral_discount_amount = ((product_rate * 10) / 100).toFixed(
          2,
        );
        book_row.referral_discount_string = "10% Referral Discount Applied";
      } else {
        book_row.referral_discount_amount = "0.00";
        book_row.referral_discount_string = "";
      }

      book_row.total_amount = cart_total.toFixed(2);
      book_row.product_list = product_list;
      delete book_row.cart_meta_data;
    }

    return res.json({
      result: true,
      msg: "Get Successfully",
      Bussiness_name: business_name,
      data: bookings,
    });
  } catch (error) {
    console.error("getPendingBooking Error:", error);
    return res.status(500).json({ result: false, msg: "Something went wrong" });
  }
};

const getBusinessName = async (req, res) => {
  try {
    const { vendor_id } = req.body;

    if (!vendor_id) {
      return res.json({
        result: "false",
        msg: "Parameter vendor_id is required",
      });
    }

    const fetch_data = await vendorModel.getBusinessName(vendor_id);

    if (fetch_data) {
      return res.json({
        result: "true",
        msg: "Business Name",
        data: fetch_data,
      });
    } else {
      return res.json({
        result: "false",
        msg: "No Business Name",
      });
    }
  } catch (error) {
    console.error("getBusinessName Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { vendor_id } = req.body;

    if (!vendor_id) {
      return res.json({
        result: "false",
        msg: "required parameters: vendor_id",
      });
    }

    const data = await vendorModel.getNotifications(vendor_id);

    if (data.length > 0) {
      const count = await vendorModel.getUnseenNotificationCount(vendor_id);

      return res.json({
        result: "true",
        msg: "get successfully",
        data: data,
        count: count,
      });
    } else {
      return res.json({
        result: "false",
        msg: "No Notification Yet",
        count: "0",
      });
    }
  } catch (error) {
    console.error("getNotifications Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

const markAsSeenNf = async (req, res) => {
  try {
    const { vendor_id } = req.body;

    if (!vendor_id) {
      return res.json({
        result: "false",
        msg: "Please provide parameters(vendor_id)",
      });
    }

    await vendorModel.markNotificationsAsSeen(vendor_id);

    return res.json({
      result: "true",
      msg: "success",
    });
  } catch (error) {
    console.error("markAsSeenNf Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

const getBookDetail = async (req, res) => {
  try {
    const { vendor_id, booked_id } = req.body;

    if (!vendor_id || !booked_id) {
      return res.json({ result: false, msg: "REQ: vendor_id, booked_id" });
    }

    const vendor = await vendorModel.getVendorById(vendor_id);
    if (!vendor) {
      return res.json({ result: false, msg: "Wrong vendor_id" });
    }

    const booking = await vendorModel.getBookingById(booked_id);
    if (!booking) {
      return res.json({ result: false, msg: "Wrong booked_id" });
    }

    const cartData = await vendorModel.getBookingDetailById(booked_id);

    if (cartData.length === 0) {
      return res.json({ result: false, msg: "No Booking Yet" });
    }

    for (const book_row of cartData) {
      let CART = [];
      try {
        CART = JSON.parse(book_row.cart_meta_data || "[]");
      } catch (e) {
        CART = [];
      }

      book_row.item_count = CART.length;

      let SUB_TOTAL = 0;
      let DISCOUNT_PERCENT = 0;
      let COUPON_CODE_ID = "";
      let COUPON_CODE_NAME = "";
      let IS_APPLIED_COUPON = false;

      // ---------- FIRST PASS: subtotal + coupon ----------
      for (const value of CART) {
        const item_amount = parseFloat(value.final_amount || 0);
        const quantity = parseFloat(value.quantity || 1);

        let warranty_amount = 0;
        const warrenty_status = parseInt(value.warrenty_status || 0, 10);
        const product_id = value.product_id || null;

        if (warrenty_status === 1 && product_id) {
          const product = await vendorModel.getProductById(product_id);
          if (product) {
            const warranty_price = parseFloat(product.warranty_price || 0);
            warranty_amount = warranty_price * quantity;
          }
        }

        SUB_TOTAL += item_amount + warranty_amount;

        if (value.coupon_applied == 1 && !IS_APPLIED_COUPON) {
          IS_APPLIED_COUPON = true;
          COUPON_CODE_ID = value.coupon_id;

          const coupon = await vendorModel.getCouponById(COUPON_CODE_ID);
          if (coupon) {
            DISCOUNT_PERCENT = parseFloat(coupon.cupon_price);
            COUPON_CODE_NAME = coupon.title;
          }
        }
      }

      // ---------- DISCOUNT ----------
      const DISCOUNTED_AMOUNT = (SUB_TOTAL * DISCOUNT_PERCENT) / 100;
      const AFTER_DISCOUNT = SUB_TOTAL - DISCOUNTED_AMOUNT;

      // ---------- GST ----------
      const HST_AMOUNT = (AFTER_DISCOUNT * 13) / 100;

      // ---------- FINAL TOTAL ----------
      const FINAL_AMOUNT = AFTER_DISCOUNT + HST_AMOUNT;

      book_row.hst_amount = HST_AMOUNT.toFixed(2);
      book_row.hst_percent = "13%";
      book_row.total_amount = FINAL_AMOUNT.toFixed(2);

      // ---------- PRODUCT LIST ----------
      const product_list = [];
      for (const value of CART) {
        let service_type = "";
        if (value.service_type) {
          service_type = String(value.service_type).toLowerCase().trim();
        }

        const TEMP = {
          product_id: value.product_id,
          name: value.name,
          image: value.image,
          quantity: value.quantity,
          selected_service_type: service_type,
          final_amount: parseFloat(value.final_amount || 0).toFixed(2),
          addon_price: value.addon_price,
        };

        TEMP.addons = value.addon
          ? await vendorModel.getAddonsByIds(value.addon)
          : [];

        product_list.push(TEMP);
      }

      book_row.product_list = product_list;
      delete book_row.cart_meta_data;
    }

    return res.json({
      result: true,
      msg: "Get Successfully",
      data: cartData,
    });
  } catch (error) {
    console.error("getBookDetail Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { vendor_id, booking_id, reason } = req.body;

    if (!vendor_id || !booking_id || !reason) {
      return res.json({
        result: "false",
        msg: "required parameters: vendor_id,otp,booking_id, reason",
      });
    }

    // check booking is valid or not
    const booking_data = await vendorModel.getBookingWithUserById(booking_id);
    if (!booking_data) {
      return res.json({ result: "false", msg: "Invalid otp" });
    }
    const bokingorder_id = booking_data.booking_uniqe_id;

    // check vendor is valid or not
    const vendor_data = await vendorModel.getVendorById(vendor_id);
    if (!vendor_data) {
      return res.json({ result: "false", msg: "Invalid Vendor_id" });
    }

    await vendorModel.cancelBooking(booking_id, vendor_id, reason);

    // Sending Notification to the user whose booking got cancelled
    // NOTE: best-effort reconstruction of Nf_Model->On_order_canceled —
    // share that PHP model function if you want an exact match.
    try {
      await pool.query(
        `INSERT INTO notifications
					(sender_id, reciever_id, sender_type, receiver_type, types, title, message, booked_id, date)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          vendor_id,
          booking_data.userid,
          "vendor",
          "user",
          "Booking",
          "Booking Cancelled",
          `Your booking ${bokingorder_id} has been cancelled. Reason: ${reason}`,
          booking_id,
        ],
      );

      if (booking_data.fcm_id) {
        await sendNotification(
          {
            title: "Booking Cancelled",
            body: `Your booking ${bokingorder_id} has been cancelled.`,
          },
          booking_data.fcm_id,
        );
      }
    } catch (nfErr) {
      console.error("cancelBooking Notification Error:", nfErr);
      // notification failure should not block the cancel response
    }

    return res.json({
      result: "true",
      msg: "Order Canceled Successfully",
    });
  } catch (error) {
    console.error("cancelBooking Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

const orderAccept = async (req, res) => {
  try {
    const { vendor_id, booking_id } = req.body;

    if (!vendor_id || !booking_id) {
      return res.json({ result: false, msg: "REQ: vendor_id,booking_id" });
    }

    const vendor_data = await vendorModel.getVendorById(vendor_id);
    if (!vendor_data) {
      return res.json({ result: false, msg: "Wrong vendor_id" });
    }

    const booking_data = await vendorModel.getFullBookingById(booking_id);
    if (!booking_data) {
      return res.json({ result: false, msg: "Wrong booking_id" });
    }

    const userid = booking_data.userid;
    const user_data = await vendorModel.getUserById(userid);
    if (!user_data) {
      return res.json({ result: false, msg: "Wrong userid" });
    }

    const updateResult = await vendorModel.acceptBooking(booking_id);

    if (updateResult.affectedRows > 0) {
      // Sending Notification to the user that vendor accepted the order
      // NOTE: best-effort reconstruction of Nf_Model->On_order_accept —
      // share that PHP model function if you want an exact match.
      try {
        await pool.query(
          `INSERT INTO notifications
						(sender_id, reciever_id, sender_type, receiver_type, types, title, message, booked_id, date)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            vendor_id,
            userid,
            "vendor",
            "user",
            "Booking",
            "Order Accepted",
            `Your order has been accepted by ${vendor_data.name || "the vendor"}.`,
            booking_id,
          ],
        );

        if (user_data.fcm_id) {
          await sendNotification(
            {
              title: "Order Accepted",
              body: `Your order has been accepted by ${vendor_data.name || "the vendor"}.`,
            },
            user_data.fcm_id,
          );
        }
      } catch (nfErr) {
        console.error("orderAccept Notification Error:", nfErr);
      }

      return res.json({
        result: true,
        msg: "Order Status Updated Successfully",
      });
    } else {
      return res.json({
        result: false,
        msg: "Something Went Wrong",
      });
    }
  } catch (error) {
    console.error("orderAccept Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
};

const getInprocessingBookings = async (req, res) => {
  try {
    const { vendor_id, type, start_date, end_date } = req.body;

    if (!vendor_id || !type) {
      return res.json({
        result: false,
        msg: "Please give parameters (vendor_id, type)",
      });
    }

    const vendor_data = await vendorModel.getVendorById(vendor_id);
    if (!vendor_data) {
      return res.json({ result: false, msg: "Wrong vendor_id" });
    }

    // Convert dates to Y-m-d, same as PHP's date('Y-m-d', strtotime(...))
    let formattedStart = null;
    let formattedEnd = null;
    if (start_date) {
      const d = new Date(start_date);
      if (!isNaN(d.getTime())) formattedStart = d.toISOString().slice(0, 10);
    }
    if (end_date) {
      const d = new Date(end_date);
      if (!isNaN(d.getTime())) formattedEnd = d.toISOString().slice(0, 10);
    }

    const bookings = await vendorModel.getInprocessingBookings(vendor_id, {
      startDate: formattedStart,
      endDate: formattedEnd,
      type,
    });

    if (bookings.length === 0) {
      return res.json({ result: false, msg: "No Data Found" });
    }

    let Rating_review = 0;
    let Earning = 0;
    let ORDER_COUNT = 0;

    for (const book_row of bookings) {
      Rating_review = book_row.rating;

      let CART = [];
      try {
        const parsed = JSON.parse(book_row.cart_meta_data || "[]");
        CART = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        CART = [];
      }

      book_row.item_count = CART.length;
      book_row.hst = "13%";
      book_row.total_amount = 0;

      const product_list = [];
      const product_names = [];
      let discount_percent = 0;
      let coupon_code = "";
      let product_detail = null; // NOTE: intentionally kept outside the loop, matches PHP behavior (uses last cart item's product)

      for (const value of CART) {
        if (value.coupon_applied == 1) {
          const coupon = await vendorModel.getCouponById(value.coupon_id);
          if (coupon) {
            discount_percent = coupon.cupon_price;
            coupon_code = coupon.code;
          }
        }

        if (!value.product_id) continue;

        product_detail = await vendorModel.getProductById(value.product_id);

        let service_type = "";
        if (value.service_type) {
          service_type = String(value.service_type).toLowerCase().trim();
        }

        const item_final_amount = parseFloat(value.final_amount || 0);

        let warranty_amount = 0;
        const warrenty_status = parseInt(value.warrenty_status || 0, 10);
        if (
          warrenty_status === 1 &&
          product_detail &&
          product_detail.warranty_price
        ) {
          warranty_amount =
            parseFloat(product_detail.warranty_price) *
            parseFloat(value.quantity || 0);
        }

        product_list.push({
          product_id: value.product_id || "",
          name: value.name || "",
          image: value.image || "",
          quantity: value.quantity || 0,
          selected_service_type: service_type,
          final_amount: item_final_amount.toFixed(2),
          warrenty_status,
          warranty_amount: warranty_amount.toFixed(2),
        });

        book_row.total_amount += item_final_amount + warranty_amount;
        product_names.push(value.name || "");
      }

      let cart_total = book_row.total_amount;

      const DISCOUNTED_AMOUNT = (cart_total * discount_percent) / 100;
      cart_total -= DISCOUNTED_AMOUNT;

      const product_rate = product_detail
        ? parseFloat(product_detail.rate || 0)
        : 0;

      if (book_row.referral_discount == 1) {
        const referral_discount_amount = (product_rate * 10) / 100;
        book_row.referral_discount_amount = referral_discount_amount.toFixed(2);
        book_row.referral_discount_string = "10% Referral Discount Applied";
      } else {
        book_row.referral_discount_amount = "0.00";
        book_row.referral_discount_string = "";
      }

      const HST = (cart_total * 13) / 100;
      book_row.hst_amount = HST.toFixed(2);

      const FINAL = cart_total + HST;

      const penaltyRow = await vendorModel.getVendorPenalty(
        vendor_id,
        book_row.Booking_id,
      );
      const totalPenalty = parseFloat(penaltyRow.total_penalty || 0);

      const amount_before_penalty = FINAL;
      const amount_after_penalty = Math.max(
        0,
        amount_before_penalty - totalPenalty,
      );

      book_row.penalty_amount = totalPenalty.toFixed(2);
      book_row.amount_before_penalty = amount_before_penalty.toFixed(2);
      book_row.total_amount = amount_after_penalty.toFixed(2);

      book_row.discount = discount_percent;
      book_row.discount_amount = DISCOUNTED_AMOUNT.toFixed(2);
      book_row.promo_code = coupon_code;

      Earning += parseFloat(book_row.total_amount);
      ORDER_COUNT++;

      book_row.product_list = product_list;
      book_row.product_names = product_names.join(",");

      delete book_row.cart_meta_data;
    }

    return res.json({
      result: true,
      msg: "Get Successfully",
      total_earning: Earning.toFixed(2),
      total_order: String(ORDER_COUNT),
      rating: Rating_review,
      data: bookings,
    });
  } catch (error) {
    console.error("getInprocessingBookings Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
};

const getServices = async (req, res) => {
  try {
    const { vendor_id } = req.body;

    if (!vendor_id) {
      return res.json({
        result: "false",
        msg: "Please provide parameters(vendor_id)",
      });
    }

    const services = await vendorModel.getServices(vendor_id);

    if (services.length > 0) {
      // Same API response me image ko array me convert
      for (const row of services) {
        if (row.image) {
          row.image = row.image.split(",").map((img) => img.trim());
        } else {
          row.image = [];
        }
      }

      return res.json({
        result: "true",
        msg: "get successfully",
        data: services,
      });
    } else {
      return res.json({
        result: "false",
        msg: "No Service Found",
      });
    }
  } catch (error) {
    console.error("getServices Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

const getSubCategories = async (req, res) => {
  try {
    const { cat_id } = req.body;

    if (!cat_id) {
      return res.json({
        result: "false",
        msg: "Please provide parameters(cat_id)",
      });
    }

    const sub_categories = await vendorModel.getSubCategories(cat_id);

    if (sub_categories.length > 0) {
      return res.json({
        result: "true",
        msg: "get successfully",
        data: sub_categories,
      });
    } else {
      return res.json({
        result: "false",
        msg: "No Sub Category Found",
      });
    }
  } catch (error) {
    console.error("getSubCategories Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

function filterValidateBooleanLike(val) {
  const truthy = ["1", "true", "on", "yes"];
  const falsy = ["0", "false", "off", "no", ""];
  const v = String(val).toLowerCase().trim();
  if (truthy.includes(v)) return true;
  if (falsy.includes(v)) return false;
  return null; // invalid
}

const addService = async (req, res) => {
  try {
    const body = req.body || {};
    const {
      vendor_id,
      sub_cat_id,
      service_name,
      price,
      description,
      service_type,
      warranty_status,
      warranty_note,
      warranty_price,
      warranty_duration,
    } = body;
    if (
      !vendor_id ||
      !sub_cat_id ||
      !service_name ||
      !req.files ||
      req.files.length === 0 ||
      !price ||
      !description ||
      !service_type
    ) {
      return res.json({
        result: "false",
        msg: "Req: vendor_id,  sub_cat_id,  service_name,  image,  price,  description service_type ( home / onsite / both )",
      });
    }

    const vendor = await vendorModel.getVendorById(vendor_id);
    if (!vendor) {
      return res.json({ result: "false", msg: "Vendor Not Found" });
    }

    let warrantyStatusBool = false;
    if (warranty_status !== undefined) {
      const parsed = filterValidateBooleanLike(warranty_status);
      if (parsed === null) {
        return res.json({
          result: "false",
          msg: "warranty_status must be true or false",
        });
      }
      warrantyStatusBool = parsed;
    }

    const postData = {
      vendor_id,
      category_id: vendor.cat_id,
      product_name: service_name,
      about: description,
      rate: price,
      scat_id: sub_cat_id,
      service_type,
      warranty_status: warrantyStatusBool ? 1 : 0,
      warranty_price: String(warranty_price || "").trim(),
      warranty_note: warrantyStatusBool
        ? String(warranty_note || "").trim()
        : "",
      warranty_duration: String(warranty_duration || "").trim(),
    };

    const lastId = await vendorModel.insertProduct(postData);

    if (!lastId) {
      return res.json({ result: "false", msg: "Something Went Wrong" });
    }

    const imageNames = req.files.map((file) => file.filename);
    await vendorModel.updateProduct(lastId, { image: imageNames.join(",") });

    return res.json({
      result: "true",
      msg: "Service Created",
    });
  } catch (error) {
    console.error("addService Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong. Please try later.",
    });
  }
};

const saveShopDetail = async (req, res) => {
  try {
    const { vendor_id, name, email, shop_name } = req.body || {};

    if (!vendor_id) {
      return res.json({
        result: "false",
        msg: "REQUIRED:vendor_id, OPTIONAL: name,shop_name,email,image,id_proof,id_proof_two",
      });
    }

    const vendor = await vendorModel.getVendorById(vendor_id);
    if (!vendor) {
      return res.json({ result: "false", msg: "No Vendor Found on this id" });
    }

    const DATA = {};
    if (name) DATA.name = name;
    if (email) DATA.email_id = email;
    if (shop_name) DATA.business_name = shop_name;

    if (Object.keys(DATA).length > 0) {
      await vendorModel.updateVendor(vendor_id, DATA);
    }

    if (req.files) {
      if (req.files.image && req.files.image.length > 0) {
        await vendorModel.updateVendor(vendor_id, {
          image: req.files.image[0].filename,
        });
      }
      if (req.files.id_proof && req.files.id_proof.length > 0) {
        await vendorModel.updateVendor(vendor_id, {
          id_proof: req.files.id_proof[0].filename,
        });
      }
      if (req.files.id_proof_two && req.files.id_proof_two.length > 0) {
        await vendorModel.updateVendor(vendor_id, {
          id_proof_two: req.files.id_proof_two[0].filename,
        });
      }
    }

    if (shop_name) {
      const shop = await vendorModel.getShopDetailByVendorId(vendor_id);
      if (shop) {
        await vendorModel.updateShopDetailByVendorId(vendor_id, { shop_name });
      } else {
        await vendorModel.insertShopDetail({
          shop_name,
          vendor_id,
          category_id: vendor.cat_id,
        });
      }
    }

    const updatedVendor = await vendorModel.getVendorById(vendor_id);

    return res.json({
      result: "true",
      msg: "Updated Successfully",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("saveShopDetail Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong. Please try later.",
    });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const { vendor_id } = req.body || {};

    if (!vendor_id) {
      return res.json({ result: "false", msg: "required: vendor_id" });
    }

    const vendorData = await vendorModel.getVendorFullDetail(vendor_id);

    if (!vendorData) {
      return res.json({ result: "false", msg: "Data Not Found" });
    }

    return res.json({
      result: "true",
      msg: "get successfully",
      data: vendorData,
    });
  } catch (error) {
    console.error("getUserDetail Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong. Please try later.",
    });
  }
};

const vendorLogout = async (req, res) => {
  try {
    const { vendor_id } = req.body || {};

    if (!vendor_id) {
      return res.json({ result: "false", msg: "parameter required vendor_id" });
    }

    await vendorModel.updateVendor(vendor_id, { fcm_id: "" });

    return res.json({
      result: "true",
      msg: "Logout from Application.",
    });
  } catch (error) {
    console.error("vendorLogout Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "something went wrong!!",
    });
  }
};

const getMyAddressVendor = async (req, res) => {
  try {
    const { vendor_id } = req.body || {};

    if (!vendor_id) {
      return res.json({ result: "false", msg: "REQ: vendor_id" });
    }

    const addressList = await vendorModel.getAddressListByVendorId(vendor_id);

    if (addressList.length === 0) {
      return res.json({ result: "false", msg: "No address found" });
    }

    return res.json({
      result: "true",
      msg: "Get Successfully",
      data: addressList,
    });
  } catch (error) {
    console.error("getMyAddressVendor Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong. Please try later.",
    });
  }
};

const getBankDetail = async (req, res) => {
  try {
    const { vendor_id } = req.body || {};

    if (!vendor_id) {
      return res.json({ result: "false", msg: "required: (vendor_id)" });
    }

    const vendorData = await vendorModel.getBankDetailByVendorId(vendor_id);

    if (!vendorData) {
      return res.json({ result: "false", msg: "Wrong vendor_id" });
    }

    return res.json({
      result: "true",
      msg: "update successfully",
      data: vendorData,
    });
  } catch (error) {
    console.error("getBankDetail Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong. Please try later.",
    });
  }
};

const getEarningDetail = async (req, res) => {
  try {
    const { vendor_id, start_date, end_date } = req.body || {};

    if (!vendor_id) {
      return res.json({
        result: false,
        msg: "Please give parameters (vendor_id)",
      });
    }

    const vendor = await vendorModel.getVendorById(vendor_id);
    if (!vendor) {
      return res.json({ result: false, msg: "Wrong vendor_id" });
    }

    let formattedStart = null;
    let formattedEnd = null;
    if (start_date) {
      const d = new Date(start_date);
      if (!isNaN(d.getTime())) formattedStart = d.toISOString().slice(0, 10);
    }
    if (end_date) {
      const d = new Date(end_date);
      if (!isNaN(d.getTime())) formattedEnd = d.toISOString().slice(0, 10);
    }

    const bookings = await vendorModel.getEarningDetail(vendor_id, {
      startDate: formattedStart,
      endDate: formattedEnd,
    });

    if (bookings.length === 0) {
      return res.json({ result: false, msg: "No Data Found" });
    }

    let Earning = 0;
    const ORDER_COUNT = bookings.length;

    for (const book_row of bookings) {
      let CART = [];
      try {
        const parsed = JSON.parse(book_row.cart_meta_data || "[]");
        CART = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        CART = [];
      }

      book_row.item_count = CART.length;
      book_row.hst = "13%";
      book_row.total_amount = 0;

      const product_names = [];
      for (const value of CART) {
        book_row.total_amount += parseFloat(value.final_amount || 0);
        product_names.push(value.name || "");
      }

      const amount = parseFloat(book_row.amount || 0);
      const HST = (amount * 13) / 100;

      book_row.hst_amount = HST.toFixed(2);
      book_row.total_amount = (amount + HST).toFixed(2);

      Earning += amount;

      book_row.product_names = product_names.join(",");

      delete book_row.cart_meta_data;
    }

    return res.json({
      result: true,
      msg: "Get Successfully",
      total_earning: Earning.toFixed(2),
      order_count: String(ORDER_COUNT),
      all_ratings: "5.0",
      data: bookings,
    });
  } catch (error) {
    console.error("getEarningDetail Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong. Please try later.",
    });
  }
};

const getAdvertisinglist = async (req, res) => {
  try {
    const { vendor_id } = req.body || {};

    if (!vendor_id) {
      return res.json({ result: false, msg: "Please give vendor_id" });
    }

    const vendor = await vendorModel.getVendorById(vendor_id);
    if (!vendor) {
      return res.json({ result: false, msg: "Wrong vendor_id" });
    }

    const ads = await vendorModel.getAllAds();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let any_subscription = false;

    for (const row of ads) {
      row.is_buyed = false;
      row.remaining_days = 0;
      row.subscription_status = "not_subscribed";
      row.start_date = "";
      row.end_date = "";

      const sub = await vendorModel.getSubscriptionByVendorAndPackage(
        vendor_id,
        row.id,
      );

      if (sub) {
        const end = new Date(sub.end_date);
        end.setHours(0, 0, 0, 0);

        if (today > end) {
          await vendorModel.expireSubscription(sub.id);
          row.subscription_status = "expired";
        } else {
          row.is_buyed = true;
          row.subscription_status = "active";
          any_subscription = true;

          const diffMs = end.getTime() - today.getTime();
          row.remaining_days = Math.round(diffMs / (1000 * 60 * 60 * 24));
        }

        row.start_date = sub.start_date;
        row.end_date = sub.end_date;
      }
    }

    return res.json({
      result: true,
      msg: "Get Successfully",
      vendor_id,
      any_buyed: any_subscription,
      data: ads,
    });
  } catch (error) {
    console.error("getAdvertisinglist Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong. Please try later.",
    });
  }
};

const deleteVideoVendor = async (req, res) => {
  try {
    const { vendor_id, video_id } = req.body || {};

    if (!vendor_id || !video_id) {
      return res.json({
        result: false,
        msg: "Required: vendor_id and video_id",
      });
    }

    const vendor = await vendorModel.getVendorById(vendor_id);
    if (!vendor) {
      return res.json({ result: false, msg: "Invalid vendor_id" });
    }

    const video = await vendorModel.getVideoByVendorAndId(vendor_id, video_id);

    if (video) {
      const filePath = path.join("assets/videos", video.video);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await vendorModel.deleteVideoById(video_id);

      return res.json({
        result: true,
        msg: "Video deleted successfully.",
      });
    } else {
      return res.json({
        result: false,
        msg: "Video not found for the given vendor_id and video_id.",
      });
    }
  } catch (error) {
    console.error("deleteVideoVendor Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong. Please try later.",
    });
  }
};

const getVideoVendor = async (req, res) => {
  try {
    const { vendor_id } = req.body || {};

    if (!vendor_id) {
      return res.json({ result: false, msg: "Required: vendor_id" });
    }

    const vendor = await vendorModel.getVendorById(vendor_id);
    if (!vendor) {
      return res.json({ result: false, msg: "Invalid vendor_id" });
    }

    const videos = await vendorModel.getVideosByVendorId(vendor_id);

    if (videos.length > 0) {
      const base_url = `${req.protocol}://${req.get("host")}/`;

      return res.json({
        result: true,
        msg: "Videos fetched successfully",
        path: `${base_url}assets/videos/`,
        data: videos,
      });
    } else {
      return res.json({
        result: false,
        msg: "No videos found for this vendor",
      });
    }
  } catch (error) {
    console.error("getVideoVendor Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong. Please try later.",
    });
  }
};

const addVideoVendor = async (req, res) => {
  try {
    const { vendor_id } = req.body || {};

    if (!vendor_id || !req.file) {
      return res.json({
        result: false,
        msg: "vendor_id ID and video upload are required.",
      });
    }

    const insert_data = {
      video: req.file.filename,
      vendor_id,
    };

    await vendorModel.insertVideo(insert_data);

    return res.json({
      result: true,
      msg: "New video added successfully.",
    });
  } catch (error) {
    console.error("addVideoVendor Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong. Please try later.",
    });
  }
};

const deleteImagesVendor = async (req, res) => {
  try {
    const { vendor_id, image_id } = req.body || {};

    if (!vendor_id || !image_id) {
      return res.json({
        result: false,
        msg: "Required: vendor_id and image_id",
      });
    }

    const vendor = await vendorModel.getVendorById(vendor_id);
    if (!vendor) {
      return res.json({ result: false, msg: "Invalid vendor_id" });
    }

    const vendorImage = await vendorModel.getVendorImageByVendorAndId(
      vendor_id,
      image_id,
    );

    if (vendorImage) {
      const filePath = path.join("assets/videos", vendorImage.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await vendorModel.deleteVendorImageById(image_id);

      return res.json({
        result: true,
        msg: "Images deleted successfully.",
      });
    } else {
      return res.json({
        result: false,
        msg: "Images not found for the given vendor_id and video_id.",
      });
    }
  } catch (error) {
    console.error("deleteImagesVendor Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong. Please try later.",
    });
  }
};

const getImagesVendor = async (req, res) => {
  try {
    const { vendor_id } = req.body || {};

    if (!vendor_id) {
      return res.json({ result: false, msg: "Required: vendor_id" });
    }

    const vendor = await vendorModel.getVendorById(vendor_id);
    if (!vendor) {
      return res.json({ result: false, msg: "Invalid vendor_id" });
    }

    const vendorImages = await vendorModel.getVendorImagesByVendorId(vendor_id);

    if (vendorImages.length > 0) {
      const base_url = `${req.protocol}://${req.get("host")}/`;

      return res.json({
        result: true,
        msg: "Images fetched successfully",
        path: `${base_url}assets/images/`,
        data: vendorImages,
      });
    } else {
      return res.json({
        result: false,
        msg: "No videos found for this vendor",
      });
    }
  } catch (error) {
    console.error("getImagesVendor Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong. Please try later.",
    });
  }
};

const addImagesVendor = async (req, res) => {
  try {
    const { vendor_id } = req.body || {};

    if (!vendor_id || !req.file) {
      return res.json({
        result: false,
        msg: "vendor_id ID and image upload are required.",
      });
    }

    const insert_data = {
      image: req.file.filename,
      vendor_id,
    };

    await vendorModel.insertVendorImage(insert_data);

    return res.json({
      result: true,
      msg: "New Image added successfully.",
    });
  } catch (error) {
    console.error("addImagesVendor Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong. Please try later.",
    });
  }
};

async function vendorTimeSlots(req, res) {
  try {
    const { vendor_id } = req.body;

    const data = await vendorModel.getAllTimeSlots();

    if (!data || data.length === 0) {
      return res.json({
        result: false,
        msg: "No Slots Found",
      });
    }

    let vendorSelectedIds = [];

    if (vendor_id) {
      const vendor = await vendorModel.getVendorSlotIds(vendor_id);

      if (vendor && vendor.vendor_slote_id) {
        vendorSelectedIds = vendor.vendor_slote_id
          .split(",")
          .map((v) => v.trim());
      }
    }

    const finalData = data.map((row) => ({
      ...row,
      is_available: vendorSelectedIds.includes(String(row.id)),
    }));

    return res.json({
      result: true,
      msg: "Vendor All Slot Get Successfully",
      data: finalData,
    });
  } catch (err) {
    console.error("vendorTimeSlots Error:", err);
    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function saveAppReview(req, res) {
  try {
    const { vendor_id, rating, msg } = req.body;

    if (!vendor_id || !rating) {
      return res.json({
        result: false,
        msg: "Req: vendor_id, rating OPTIONAL(msg)",
      });
    }

    const vendorData = await vendorModel.getVendorRawByIdCheck(vendor_id);

    if (vendorData.length === 0) {
      return res.json({
        result: false,
        msg: "Wrong vendor_id",
      });
    }

    const DATA = {
      vendor_id: vendor_id,
      rating: rating,
    };

    if (msg) {
      DATA.review = msg;
    }

    const result = await vendorModel.insertAppRatingReview(DATA);

    if (result.affectedRows > 0) {
      return res.json({
        result: true,
        msg: "Success",
      });
    } else {
      return res.json({
        result: false,
        msg: "failed",
      });
    }
  } catch (err) {
    console.error("saveAppReview Error:", err);
    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function getPolicies(req, res) {
  try {
    const privacy = await vendorModel.getRuleByType("Privacy");
    const term = await vendorModel.getRuleByType("term");
    const about = await vendorModel.getRuleByType("about");

    if (about) {
      return res.json({
        result: "true",
        privacy: privacy,
        term: term,
        about: about,
      });
    } else {
      return res.json({
        result: "false",
        msg: "Data Not Found",
      });
    }
  } catch (err) {
    console.error("getPolicies Error:", err);
    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function vendorTimeSlotsUpdate(req, res) {
  try {
    const { vendor_id, vendor_slote_id, type } = req.body;

    // Required validation
    if (!vendor_id || !type || !vendor_slote_id) {
      return res.json({
        result: "false",
        msg: "Required: vendor_id, vendor_slote_id, type",
      });
    }

    // Check vendor
    const vendor = await vendorModel.getVendorById(vendor_id);

    if (!vendor) {
      return res.json({
        result: "false",
        msg: "Invalid vendor_id",
      });
    }

    // Existing slots
    let currentSlots = [];

    if (
      vendor.vendor_slote_id !== null &&
      vendor.vendor_slote_id !== undefined &&
      vendor.vendor_slote_id !== ""
    ) {
      currentSlots = String(vendor.vendor_slote_id)
        .split(",")
        .map((slot) => slot.trim())
        .filter((slot) => slot !== "");
    }

    // Input slots
    const inputSlots = String(vendor_slote_id)
      .split(",")
      .map((slot) => slot.trim())
      .filter((slot) => slot !== "");

    if (type === "add") {
      for (const slotId of inputSlots) {
        if (!currentSlots.includes(slotId)) {
          currentSlots.push(slotId);
        }
      }

      // Remove duplicate slots
      const newSlots = [...new Set(currentSlots)].join(",");

      await vendorModel.updateVendorSlots(vendor_id, newSlots);

      return res.json({
        result: "true",
        msg: "Slots Added Successfully",
        vendor_slote_id: newSlots,
      });
    }

    if (type === "remove") {
      const updatedSlots = [];

      for (const slotId of currentSlots) {
        if (!inputSlots.includes(slotId)) {
          updatedSlots.push(slotId);
        }
      }

      const newSlots = updatedSlots.join(",");

      await vendorModel.updateVendorSlots(vendor_id, newSlots);

      return res.json({
        result: "true",
        msg: "Slots Removed Successfully",
        vendor_slote_id: newSlots,
      });
    }

    return res.json({
      result: "false",
      msg: "Invalid type",
    });
  } catch (err) {
    console.error("vendorTimeSlotsUpdate Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function completeOrderNow(req, res) {
  try {
    const { vendor_id, otp, booking_id, review, rating, user_id } = req.body;

    if (!vendor_id || !otp || !booking_id) {
      return res.json({
        result: "false",
        msg: "required parameters: vendor_id,otp,booking_id, OPTIONAL(review,rating,user_id)",
      });
    }

    // Check OTP
    const bookingData = await vendorModel.getBookingByOtp(booking_id, otp);

    if (!bookingData || bookingData.length === 0) {
      return res.json({
        result: "false",
        msg: "Invalid otp",
      });
    }

    // Check Vendor
    const vendorData = await vendorModel.getVendorById(vendor_id);

    if (!vendorData || vendorData.length === 0) {
      return res.json({
        result: "false",
        msg: "Invalid Vendor_id",
      });
    }

    // Complete Booking
    await vendorModel.completeBooking(booking_id, vendor_id);

    // Rating / Review
    const Rating = {};

    if (review) {
      Rating.review = review;
    }

    if (vendor_id) {
      Rating.vendor_id = vendor_id;
    }

    if (rating) {
      Rating.rating = rating;
    }

    if (user_id) {
      Rating.user_id = user_id;
    }

    if (booking_id) {
      Rating.booked_id = booking_id;
    }

    if (Object.keys(Rating).length > 0) {
      await vendorModel.addRatingReview(
        Rating.review,
        Rating.vendor_id,
        Rating.rating,
        Rating.user_id,
        Rating.booked_id,
      );
    }

    return res.json({
      result: "true",
      msg: "Order Completed Successfully",
    });
  } catch (err) {
    console.error("completeOrderNow Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function activeDeactiveService(req, res) {
  try {
    const { service_id } = req.body;

    if (!service_id) {
      return res.json({
        result: false,
        msg: "Req: service_id",
      });
    }

    const data = await vendorModel.activeDeactiveService(service_id);

    if (!data.success) {
      return res.json({
        result: false,
        msg: data.msg || "Something Went Wrong",
      });
    }

    return res.json({
      result: true,
      msg: "Status Changed",
      status: data.status,
    });
  } catch (err) {
    console.error("activeDeactiveService Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function restaurantHomeDashboard(req, res) {
	try {
		const { restaurant_id } = req.body || {};
 
		// PHP empty(): "", "0", 0, null, undefined
		if (!restaurant_id || restaurant_id === "0") {
			return res.json({
				result: false,
				msg: "Required: restaurant_id",
			});
		}
 
		const restaurant = await vendorModel.getRestaurantVendorById(restaurant_id);
 
		if (!restaurant) {
			return res.json({
				result: false,
				msg: "Invalid restaurant_id",
			});
		}
 
		// today's date in India time (PHP: date_default_timezone_set('Asia/Kolkata'))
		const todayDate = new Date().toLocaleDateString("en-CA", {
			timeZone: "Asia/Kolkata",
		}); // YYYY-MM-DD
 
		const stats = await vendorModel.getTodayOrderStats(restaurant_id, todayDate);
 
		return res.json({
			result: true,
			msg: "Restaurant dashboard fetched successfully",
			data: {
				restaurant_id: String(restaurant.id),
				name: String(restaurant.name ?? ""),
				business_name: String(restaurant.business_name ?? ""),
				restaurant_status: String(restaurant.restaurant_status ?? ""),
				today_date: todayDate,
				today_total_earning: stats.earning.toFixed(2),
 
				today_orders: {
					pending: stats.pending,
					preparing: stats.preparing,
					delivered: stats.delivered,
				},
			},
		});
	} catch (error) {
		console.error("restaurantHomeDashboard Error:", error);
		return res.status(500).json({
			result: false,
			msg: "Something went wrong",
		});
	}
}

async function restaurantAllOrdersHome(req, res) {
	try {
		const { restaurant_id } = req.body || {};
 
		// PHP empty(): "", "0", 0, null, undefined
		if (!restaurant_id || restaurant_id === "0") {
			return res.json({
				result: false,
				msg: "Required: restaurant_id",
			});
		}
 
		const restaurant = await vendorModel.getRestaurantVendorById(restaurant_id);
 
		if (!restaurant) {
			return res.json({
				result: false,
				msg: "Invalid restaurant_id",
			});
		}
 
		const orders = await vendorModel.getRestaurantOrdersWithUser(restaurant_id);
 
		if (orders.length === 0) {
			return res.json({
				result: true,
				msg: "No orders found",
				total: 0,
				orders: [],
			});
		}
 
		// coupons of orders that have an applied coupon (one query)
		const hasCoupon = (o) =>
			!!o.coupon_id && String(o.coupon_id) !== "0" && parseInt(o.coupon_applied, 10) === 1;
 
		const couponIds = [...new Set(orders.filter(hasCoupon).map((o) => o.coupon_id))];
		const couponRows = await vendorModel.getRestaurantCouponsByIds(couponIds);
		const couponMap = new Map(couponRows.map((c) => [String(c.id), c]));
 
		const finalOrders = orders.map((order) => {
			// ---------- items: count + subtotal ----------
			let itemCount = 0;
			let subtotal = 0;
 
			if (order.order_items) {
				let decoded = null;
				try {
					decoded = JSON.parse(order.order_items);
				} catch (e) {
					decoded = null;
				}
 
				// PHP is_array(): JSON list or JSON object
				const list = Array.isArray(decoded)
					? decoded
					: decoded && typeof decoded === "object"
						? Object.values(decoded)
						: null;
 
				if (list) {
					itemCount = list.length;
 
					for (const raw of list) {
						const item = raw && typeof raw === "object" ? raw : {};
 
						const line =
							item.line_total !== undefined && item.line_total !== null
								? parseFloat(item.line_total) || 0
								: (parseFloat(item.price ?? 0) || 0) *
									(parseInt(item.quantity ?? 1, 10) || 0);
 
						subtotal += line;
					}
				}
			}
 
			// ---------- coupon discount ----------
			let discount = 0;
 
			if (hasCoupon(order)) {
				const coupon = couponMap.get(String(order.coupon_id));
 
				if (coupon) {
					const price = parseFloat(coupon.cupon_price) || 0;
 
					if (coupon.discount_type === "percentage" || coupon.discount_type === "percent") {
						discount = (subtotal * price) / 100;
					} else {
						discount = price;
					}
 
					if (discount > subtotal) {
						discount = subtotal;
					}
				}
			}
 
			// ---------- totals ----------
			const amountAfterDiscount = subtotal - discount;
 
			const hstPercent = 13;
			const hstAmount = (amountAfterDiscount * hstPercent) / 100;
 
			const deliveryCharge = String(order.orderBookingType ?? "") === "Delivery" ? 5 : 0;
 
			const finalTotal = amountAfterDiscount + hstAmount + deliveryCharge;
 
			return {
				order_id: String(order.id),
				order_number: String(order.order_number ?? ""),
				fname: String(order.fname ?? ""),
				lname: String(order.lname ?? ""),
				order_status: String(order.order_status ?? ""),
				order_date: String(order.order_date ?? ""),
				order_time: String(order.order_time ?? ""),
				item_count: itemCount,
				total_amount: numberFormat2(finalTotal),
			};
		});
 
		return res.json({
			result: true,
			msg: "Orders fetched successfully",
			total: finalOrders.length,
			orders: finalOrders,
		});
	} catch (error) {
		console.error("restaurantAllOrdersHome Error:", error);
		return res.status(500).json({
			result: false,
			msg: "Something went wrong",
		});
	}
}


// ======================================================
// SAVE TRUANON USERNAME
// ======================================================
// ==============================================
// API 1: Get/Build Webview URL
// ==============================================
const getTruAnonWebviewUrl = async (req, res) => {
  try {
    const { vendor_id: vendorId } = req.query;

    if (!vendorId) {
      return res.status(400).json({ status: false, message: "required: vendor_id" });
    }

    const vendor = await vendorModel.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ status: false, message: "Vendor not found" });
    }

    let username = vendor.truanon_username;
    if (!username || !username.trim()) {
      username = `bhive_vendor_${vendor.id}`;
      await vendorModel.updateTruAnonUsername(vendorId, username);
    }

    let profile = null;
    try {
      profile = await TruAnonService.getProfile(username);
    } catch (profileError) {
      const code = profileError.response?.data?.code;
      if (profileError.response?.status !== 404 || code !== "member_unknown") {
        throw profileError;
      }
      console.log(`TruAnon: ${username} not anchored yet, proceeding to get_token`);
    }

    if (profile && profile.rank && profile.rank !== "Unknown") {
      await vendorModel.updateTruAnonVerification(vendorId, {
        is_anchored: 1,
        truanon_rank: profile.rank,
        truanon_score: profile.score,
      });

      return res.status(200).json({
        status: true,
        message: "Already anchored",
        data: { already_anchored: true, profile },
      });
    }

    // const tokenData = await TruAnonService.getToken(username);
    // const token = tokenData.token;

    const tokenData = await TruAnonService.getToken(username);
console.log("TruAnon get_token raw response:", JSON.stringify(tokenData));

const token = tokenData.id;

    const callbackUrl = encodeURIComponent(
      `${process.env.BASE_URL}/Api_vendor/truanon/callback?vendor_id=${vendorId}`
    );

    const webviewUrl =
      `https://truanon.com/api/verifyProfile?id=${username}` +
      `&service=${process.env.TRUANON_SERVICE_NAME}` +
      `&token=${token}` +
      `&callback=${callbackUrl}`;

    return res.status(200).json({
      status: true,
      data: { already_anchored: false, webview_url: webviewUrl },
    });

  } catch (error) {
    console.error("getTruAnonWebviewUrl error:", error.response?.data || error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.response?.data?.detail || error.message,
    });
  }
};

// ==============================================
// API 2: Callback (TruAnon redirects here)
// ==============================================
const truAnonCallback = async (req, res) => {
  return res.send(`
    <html>
      <body style="text-align:center;font-family:sans-serif;padding:40px;">
        <h3>Verification complete</h3>
        <p>You can close this window now.</p>
      </body>
    </html>
  `);
};

// ==============================================
// API 3: Verify (fetch result & save)
// ==============================================
const verifyTruAnon = async (req, res) => {
  try {
    const { vendor_id: vendorId } = req.body || {};

    if (!vendorId) {
      return res.status(400).json({ status: false, message: "required: vendor_id" });
    }

    const vendor = await vendorModel.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ status: false, message: "Vendor not found" });
    }

    if (!vendor.truanon_username || !vendor.truanon_username.trim()) {
      return res.status(400).json({ status: false, message: "Please save TruAnon username first" });
    }

    const truanonResult = await TruAnonService.getProfile(vendor.truanon_username.trim());

    if (!truanonResult) {
      return res.status(400).json({ status: false, message: "TruAnon verification failed" });
    }

    const isAnchored =
      truanonResult.is_anchored ??
      truanonResult.anchored ??
      (truanonResult.anchors && truanonResult.anchors.length > 0 ? 1 : 0);

    const rank = truanonResult.rank ?? "Unknown";
    const score = truanonResult.score ?? 0;

    // Trustworthy ranks only — Dangerous/Cautioned/Unknown are NOT verified
    const RANK_ORDER = ["Dangerous", "Cautioned", "Credible", "Reliable", "Genuine"];
    const MIN_VERIFIED_RANK = "Credible";
    const truanonVerified =
      rank !== "Unknown" &&
      RANK_ORDER.indexOf(rank) >= RANK_ORDER.indexOf(MIN_VERIFIED_RANK);

    await vendorModel.updateTruAnonVerification(vendorId, {
      is_anchored: isAnchored ? 1 : 0,
      truanon_rank: rank,
      truanon_score: score,
    });

    const updatedData = await vendorModel.getTruAnonData(vendorId);

    return res.status(200).json({
      status: true,
      message: "TruAnon verification completed successfully",
      data: {
        vendor_id: vendorId,
        truanonVerified,
        truanon: updatedData,
        profile: truanonResult,
      },
    });

  } catch (error) {
    console.error("verifyTruAnon error:", error);
    return res.status(500).json({ status: false, message: "TruAnon verification failed", error: error.message });
  }
};


async function restaurantOpenCloseStatus(req, res) {
	try {
		const { restaurant_id, status } = req.body;
		const normalizedStatus = (status || "").toString().trim().toLowerCase();

		if (!restaurant_id || !normalizedStatus) {
			return res.json({
				result: false,
				msg: "Required: restaurant_id, status",
			});
		}

		const allowedStatus = ["open", "close"];

		if (!allowedStatus.includes(normalizedStatus)) {
			return res.json({
				result: false,
				msg: "Allowed status only: open, close",
			});
		}

		const restaurant = await vendorModel.findById(restaurant_id);

		if (!restaurant) {
			return res.json({
				result: false,
				msg: "Invalid restaurant_id",
			});
		}

		const dbStatus = normalizedStatus === "open" ? "Open" : "Closed";

		const update = await vendorModel.updateVendor(restaurant_id, {
			restaurant_status: dbStatus,
			updated_at: new Date(),
		});

		if (!update || !update.affectedRows) {
			return res.json({
				result: false,
				msg: "Failed to update restaurant status",
			});
		}

		const updatedData = await vendorModel.findById(restaurant_id);

		return res.json({
			result: true,
			msg: "Restaurant status updated successfully",
			data: {
				restaurant_id: updatedData.id,
				restaurant_name: updatedData.business_name || "",
				restaurant_status: updatedData.restaurant_status || dbStatus,
				updated_at: updatedData.updated_at || new Date(),
			},
		});
	} catch (err) {
		console.log("Restaurant Open/Close Status Error:", err.message);
		return res.status(500).json({
			result: false,
			msg: "Something went wrong. Please try later.",
		});
	}
}

async function restaurantGetItems(req, res) {
	try {
		const { vendor_id } = req.body;

		if (!vendor_id) {
			return res.json({
				result: false,
				msg: "Required: vendor_id",
			});
		}

		const items = await vendorModel.getRestaurantItemsByVendorId(vendor_id);

		return res.json({
			result: true,
			msg: "Item list",
			data: items,
		});
	} catch (err) {
		console.log("Restaurant Get Items Error:", err.message);
		return res.status(500).json({
			result: false,
			msg: "Something went wrong. Please try later.",
		});
	}
}

const restaurantItemAdd = async (req, res) => {
	try {
		const {
			vendor_id,
			name,
			description,
			item_type,
			unit_price,
			discount_price,
			sub_cat_id,
		} = req.body || {};

		if (
			vendor_id === undefined || vendor_id === null || vendor_id === "" ||
			!name ||
			!description ||
			!item_type ||
			unit_price === undefined || unit_price === "" ||
			discount_price === undefined || discount_price === "" ||
			!sub_cat_id
		) {
			return res.json({
				result: false,
				msg: "Required: vendor_id, name, description, item_type, unit_price, discount_price, sub_cat_id, item_image",
			});
		}

		if (!req.file) {
			return res.json({
				result: false,
				msg: "item_image required",
			});
		}

		const insert_data = {
			vendor_id,
			name,
			description,
			item_type,
			unit_price,
			discount_price,
			sub_cat_id,
			item_image: req.file.filename,
		};

		const insert_id = await vendorModel.insertRestaurantItem(insert_data);

		if (!insert_id) {
			return res.json({
				result: false,
				msg: "Database insert failed",
			});
		}

		const data = await vendorModel.findRestaurantItemById(insert_id);

		return res.json({
			result: true,
			msg: "Item added successfully",
			data,
		});
	} catch (error) {
		console.error("restaurantItemAdd Error:", error);
		return res.status(500).json({
			result: false,
			msg: "Something went wrong. Please try later.",
		});
	}
};

const getSubCategoryByReasaurant = async (req, res) => {
	try {
		const { category_id } = req.body || {};

		if (!category_id) {
			return res.json({
				result: false,
				msg: "Required: category_id",
			});
		}

		const data = await vendorModel.getSubCategoryByRestaurant(category_id);

		if (data && data.length > 0) {
			return res.json({
				result: true,
				msg: "Sub Category list",
				data,
			});
		} else {
			return res.json({
				result: false,
				msg: "No sub category found",
			});
		}
	} catch (error) {
		console.error("getSubCategoryByReasaurant Error:", error);
		return res.status(500).json({
			result: false,
			msg: "Something went wrong. Please try later.",
		});
	}
};

const restaurantItemStatusUpdate = async (req, res) => {
	try {
		const { item_id, status } = req.body || {};

		if (
			item_id === undefined || item_id === null || item_id === "" ||
			status === undefined || status === null || status === ""
		) {
			return res.json({
				result: false,
				msg: "Required: item_id, status",
			});
		}

		if (!["0", "1", 0, 1].includes(status)) {
			return res.json({
				result: false,
				msg: "Status must be 0 (inactive) or 1 (active)",
			});
		}

		const check = await vendorModel.findRestaurantItemById(item_id);

		if (!check) {
			return res.json({
				result: false,
				msg: "Invalid item_id",
			});
		}

		await vendorModel.updateRestaurantItemStatus(item_id, status);

		const data = await vendorModel.findRestaurantItemById(item_id);

		return res.json({
			result: true,
			msg: "Status updated successfully",
			data,
		});
	} catch (error) {
		console.error("restaurantItemStatusUpdate Error:", error);
		return res.status(500).json({
			result: false,
			msg: "Something went wrong. Please try later.",
		});
	}
};

const restaurantOrderBooking = async (req, res) => {
	try {
		const { restaurant_id, type } = req.body || {};

		if (!restaurant_id || !type) {
			return res.json({
				result: false,
				msg: "Required: restaurant_id, type",
			});
		}

		const status_map = {
			pending: ["Pending", "Accepted", "Preparing", "Ready_for_pickup", "Picked_up", "On_the_way", "Rejected", "Missed"],
			completed: ["Delivered"],
			cancelled: ["Cancelled"],
		};

		if (!Object.prototype.hasOwnProperty.call(status_map, type)) {
			return res.json({
				result: false,
				msg: "Allowed type: pending, completed, cancelled",
			});
		}

		const vendor = await vendorModel.findRestaurantVendorById(restaurant_id);

		if (!vendor) {
			return res.json({
				result: false,
				msg: "Invalid restaurant_id",
			});
		}

		const db_status_list = status_map[type];

		const orders = await vendorModel.getRestaurantOrdersByStatus(restaurant_id, db_status_list);

		if (!orders || orders.length === 0) {
			return res.json({
				result: false,
				msg: "No orders found",
			});
		}

		const final = [];

		for (const row of orders) {
			const user = await vendorModel.getUserBriefById(row.user_id);

			let items = [];
			try {
				items = row.order_items ? JSON.parse(row.order_items) : [];
			} catch (e) {
				items = [];
			}
			const item_count = Array.isArray(items) ? items.length : 0;

			const item_details = [];

			if (items && items.length > 0) {
				for (const item of items) {
					let addons_detail = [];

					if (item.addons) {
						const addon_ids = item.addons
							.toString()
							.split(",")
							.map((id) => parseInt(id, 10))
							.filter((id) => !isNaN(id) && id);

						if (addon_ids.length > 0) {
							addons_detail = await vendorModel.getAddonsByIds(addon_ids);
						}
					}

					// const restaurant_item = await vendorModel.getRestaurantItemBrief(item.item_id);
const restaurant_item = item.item_id
	? await vendorModel.getRestaurantItemBrief(item.item_id)
	: null;

					item_details.push({
						cart_id: item.cart_id || "",
						item_id: item.item_id || "",
						item_name: restaurant_item ? restaurant_item.name || "" : "",
						item_image: restaurant_item ? restaurant_item.item_image || "" : "",
						item_type: restaurant_item ? restaurant_item.item_type || "" : "",
						price: Number(restaurant_item ? restaurant_item.discount_price || 0 : 0).toFixed(2),
						quantity: item.quantity || "",
						addons: addons_detail,
					});
				}
			}

			let driver_data = null;

			if (row.delivery_boy_id) {
				const driver = await vendorModel.getDriverBriefById(row.delivery_boy_id);

				if (driver) {
					driver_data = {
						driver_id: driver.id,
						driver_name: `${driver.first_name || ""} ${driver.last_name || ""}`.trim(),
						driver_email: driver.email,
						driver_phone: driver.phone,
						driver_address: driver.address,
						driver_lat: driver.lat,
						driver_long: driver.long,
						driver_image: driver.profile_image,
						driver_available: driver.is_available,
						driver_current_order_id: driver.current_order_id,
					};
				}
			}

			final.push({
				id: row.id,
				order_number: row.order_number,
				restaurant_id: row.vendor_id,
				type,

				user_name: user ? `${user.fname || ""} ${user.lname || ""}`.trim() : "",
				mobile: user ? user.mobile : "",
				email: user ? user.email : "",
				user_address: row.address ? row.address : (user ? user.address : ""),

				item_count,
				item_details,
				date: row.order_date,
				time: row.order_time,
				total_amount: row.total_amount,
				payment_status: row.payment_status,
				order_status: row.order_status,
				orderBookingType: row.orderBookingType,
				canceled_reason: row.canceled_reason,
				pickupTime: row.time_slot,
				table_note: row.table_note,
				guests: row.guests,
				driver: driver_data,
			});
		}

		const pending_count = await vendorModel.countRestaurantOrdersByStatus(restaurant_id, status_map.pending);
		const completed_count = await vendorModel.countRestaurantOrdersByStatus(restaurant_id, status_map.completed);
		const cancelled_count = await vendorModel.countRestaurantOrdersByStatus(restaurant_id, status_map.cancelled);
		const total_booking_count = await vendorModel.countRestaurantOrdersByStatus(restaurant_id, db_status_list);

		return res.json({
			result: true,
			msg: "Order list fetched successfully",
			restaurant_id,
			restaurant_name: vendor.business_name,
			type,
			total_booking_count,
			pending_count,
			completed_count,
			cancelled_count,
			data: final,
		});
	} catch (error) {
		console.error("restaurantOrderBooking Error:", error);
		return res.status(500).json({
			result: false,
			msg: "Something went wrong. Please try later.",
		});
	}
};


const restaurantAcceptDeclineOrder = async (req, res) => {
	try {
		const { order_id, status } = req.body || {};
		const canceled_reason = (req.body?.canceled_reason || "").toString().trim();

		if (!order_id || !status) {
			return res.json({ result: false, msg: "Required: order_id, status" });
		}

		const update_status_map = {
			accept: "Accepted",
			reject: "Cancelled",
		};

		if (!Object.prototype.hasOwnProperty.call(update_status_map, status)) {
			return res.json({ result: false, msg: "Allowed status only: accept, reject" });
		}

		const order = await vendorModel.findOrderById(order_id);
		if (!order) {
			return res.json({ result: false, msg: "Invalid order_id" });
		}

		const userRow = await vendorModel.getFullUserById(order.user_id);
		const vendorRow = await vendorModel.findById(order.vendor_id);

		const business_name = vendorRow ? vendorRow.business_name || "" : "";
		const username = userRow
			? `${userRow.fname || ""} ${userRow.lname || ""}`.trim()
			: "";

		const final_db_status = update_status_map[status];

		// ===== CANCEL / REJECT FLOW =====
		if (final_db_status === "Cancelled") {
			const now = new Date();
			const updateData = {
				order_status: "Cancelled",
				rejected_at: now,
				cancelled_date: now,
			};
			if (canceled_reason) {
				updateData.canceled_reason = canceled_reason;
			}

			await vendorModel.updateOrder(order_id, updateData);

			const notification_title = "Order Cancelled";
			const notification_msg = `Your order from ${business_name} has been cancelled.`;
			const notification_user = { order_id, type: "restaurant_order" };

			const nf_user = {
				booked_id: order_id,
				vendor_id: vendorRow ? vendorRow.id : null,
				sender_id: vendorRow ? vendorRow.id : null,
				reciever_id: userRow ? userRow.id : null,
				title: notification_title,
				message: notification_msg,
				sender_type: "vendor",
				receiver_type: "user",
				types: "restaurant_order",
				meta_data: JSON.stringify(notification_user),
			};

			await vendorModel.insertNotification(nf_user);

			if (userRow && userRow.fcm_id) {
				try {
					await sendNotification(
						{ title: notification_title, body: notification_msg },
						userRow.fcm_id,
					);
				} catch (e) {}
			}

			await removeOrderFromAllBroadcastedDrivers(order);

			return res.json({ result: true, msg: "Order cancelled successfully" });
		}

		// ===== ACCEPT FLOW =====
		if (order.delivery_boy_id) {
			return res.json({ result: false, msg: "Driver already assigned" });
		}

		if (!order.vendor_id) {
			return res.json({ result: false, msg: "Vendor ID missing in order" });
		}

		const vendor = await vendorModel.findById(order.vendor_id);
		if (!vendor) {
			return res.json({ result: false, msg: "Vendor not found" });
		}

		if (!vendor.lat || !vendor.long) {
			return res.json({ result: false, msg: "Vendor location missing" });
		}

		const booking_type = (order.orderBookingType || "").toString().trim();

		// ----- NON-DELIVERY FLOW -----
		if (booking_type !== "Delivery") {
			let msg;

			if (order.order_status === "Pending") {
				await vendorModel.updateOrder(order_id, {
					order_status: "Accepted",
					accepted_at: new Date(),
				});

				const notification_title = "Order Received";
				const notification_msg = `Thanks for your order from ${business_name}! Your order has been received and is being prepared.`;
				const notification_user = { order_id, type: "restaurant_order" };

				const nf_user = {
					booked_id: order_id,
					vendor_id: vendorRow ? vendorRow.id : null,
					sender_id: vendorRow ? vendorRow.id : null,
					reciever_id: userRow ? userRow.id : null,
					title: notification_title,
					message: notification_msg,
					sender_type: "vendor",
					receiver_type: "user",
					types: "restaurant_order",
					meta_data: JSON.stringify(notification_user),
				};

				await vendorModel.insertNotification(nf_user);

				if (userRow && userRow.fcm_id) {
					try {
						await sendNotification(
							{ title: notification_title, body: notification_msg },
							userRow.fcm_id,
						);
					} catch (e) {}
				}

				msg = `Order accepted successfully. Driver not required for ${order.orderBookingType}`;
			} else if (order.order_status === "Accepted") {
				await vendorModel.updateOrder(order_id, {
					order_status: "Delivered",
					delivered_at: new Date(),
				});

				const notification_title = "Delivered";
				const notification_msg = `Enjoy your meal, ${username}! Your order from ${business_name} has been delivered.`;
				const notification_user = { order_id, type: "restaurant_order" };

				const nf_user = {
					booked_id: order_id,
					vendor_id: vendorRow ? vendorRow.id : null,
					sender_id: vendorRow ? vendorRow.id : null,
					reciever_id: userRow ? userRow.id : null,
					title: notification_title,
					message: notification_msg,
					sender_type: "vendor",
					receiver_type: "user",
					types: "restaurant_order",
					meta_data: JSON.stringify(notification_user),
				};

				await vendorModel.insertNotification(nf_user);

				if (userRow && userRow.fcm_id) {
					try {
						await sendNotification(
							{ title: notification_title, body: notification_msg },
							userRow.fcm_id,
						);
					} catch (e) {}
				}

				msg = "Order delivered successfully.";
			} else {
				return res.json({
					result: false,
					msg: `Order is already ${order.order_status}`,
				});
			}

			const updated = await vendorModel.findOrderById(order_id);
			return res.json({ result: true, msg, data: updated });
		}

		// ----- DELIVERY FLOW: BROADCAST -----
		const vendor_address = await vendorModel.getVendorAddress(order.vendor_id);
		const pickup_address = vendor_address ? vendor_address.address || "" : "";
		const pickup_latitude = vendor_address ? vendor_address.lat || "" : "";
		const pickup_longitude = vendor_address ? vendor_address.lang || "" : "";

		let drop_address = "";
		let user_latitude = "";
		let user_longitude = "";

		if (order.address_id) {
			const address_row = await vendorModel.getAddressById(parseInt(order.address_id, 10));
			if (address_row) {
				drop_address = address_row.address || "";
				user_latitude = address_row.lat || "";
				user_longitude = address_row.lang || "";
			}
		}

		let order_items = [];
		try {
			order_items = order.order_items ? JSON.parse(order.order_items) : [];
		} catch (e) {
			order_items = [];
		}
		const item_count = Array.isArray(order_items) ? order_items.length : 0;

		const drivers = await vendorModel.getAvailableDrivers();
		if (!drivers || drivers.length === 0) {
			return res.json({ result: false, msg: "No available drivers found" });
		}

		const BROADCAST_RADIUS_KM = 20.0;
		const nearby_drivers = [];

		for (const driver of drivers) {
			if (!driver.lat || !driver.long) continue;

			const distance = calculateDistance(
				parseFloat(driver.lat),
				parseFloat(driver.long),
				parseFloat(vendor.lat),
				parseFloat(vendor.long),
			);

			if (distance <= BROADCAST_RADIUS_KM) {
				driver.distance_km = distance;
				nearby_drivers.push(driver);
			}
		}

		if (nearby_drivers.length === 0) {
			return res.json({
				result: false,
				msg: `No drivers found within ${BROADCAST_RADIUS_KM} km`,
			});
		}

		nearby_drivers.sort((a, b) => a.distance_km - b.distance_km);
		const broadcasted_driver_ids = nearby_drivers.map((d) => d.id);

		await vendorModel.updateOrder(order_id, {
			order_status: "Accepted",
			accepted_at: new Date(),
			drop_address,
			user_latitude,
			user_longitude,
			broadcasted_driver_ids: JSON.stringify(broadcasted_driver_ids),
		});

		// ===== Notification to user =====
		{
			const notification_title = "Order Received";
			const notification_msg = `Thanks for your order from ${business_name}! Your order has been received and is being prepared.`;
			const notification_user = { order_id, type: "restaurant_order" };

			const nf_user = {
				booked_id: order_id,
				vendor_id: vendorRow ? vendorRow.id : null,
				sender_id: vendorRow ? vendorRow.id : null,
				reciever_id: userRow ? userRow.id : null,
				title: notification_title,
				message: notification_msg,
				sender_type: "vendor",
				receiver_type: "user",
				types: "restaurant_order",
				meta_data: JSON.stringify(notification_user),
			};

			await vendorModel.insertNotification(nf_user);

			if (userRow && userRow.fcm_id) {
				try {
					await sendNotification(
						{ title: notification_title, body: notification_msg },
						userRow.fcm_id,
					);
				} catch (e) {}
			}
		}

		let broadcast_count = 0;

		for (const driver of nearby_drivers) {
			const firebase_data = {
				order_id: String(order.id),
				order_number: String(order.order_number),
				driver_id: String(driver.id),
				pickup_address: String(pickup_address),
				pickup_lat: String(pickup_latitude),
				pickup_long: String(pickup_longitude),
				drop_address: String(drop_address),
				user_lat: String(user_latitude),
				user_long: String(user_longitude),
				total_amount: String(order.total_amount || "0"),
				item_count: String(item_count),
				distance_km: String(driver.distance_km.toFixed(2)),
				order_status: "Accepted",
				message: "New order available. Accept or reject.",
				accepted_at: new Date().toISOString().slice(0, 19).replace("T", " "),
			};

			try {
				await admin
					.database()
					.ref(`assigned_driver_orders/${driver.id}/${order.id}`)
					.set(firebase_data);
				broadcast_count++;
			} catch (e) {}

			const driver_notification_title = "New Order Available";
			const driver_notification_msg = `New order from ${business_name}, ${pickup_address} se pickup ke liye. Amount: ${order.total_amount}`;

			// NOTE: driver DB notification insert PHP me bhi commented out hai, isliye yahan bhi skip kiya

			if (driver.fcm_id) {
				try {
					await sendNotification(
						{ title: driver_notification_title, body: driver_notification_msg },
						driver.fcm_id,
					);
				} catch (e) {}
			}
		}

		const updated = await vendorModel.findOrderById(order_id);

		return res.json({
			result: true,
			msg: "Order accepted and broadcasted to nearby drivers",
			drivers_notified: broadcast_count,
			data: updated,
		});
	} catch (error) {
		console.error("restaurantAcceptDeclineOrder Error:", error);
		return res.status(500).json({
			result: false,
			msg: "Something went wrong. Please try later.",
		});
	}
};

const restaurantOrderDetails = async (req, res) => {
	try {
		const { order_id } = req.body || {};

		if (!order_id) {
			return res.json({ result: false, msg: "Required: order_id" });
		}

		const order = await vendorModel.getRestaurantOrderDetailsById(order_id);

		if (!order) {
			return res.json({ result: false, msg: "Invalid order_id" });
		}

		let address_row = null;
		if (order.address_id) {
			address_row = await vendorModel.getAddressById(parseInt(order.address_id, 10));
		}

		let delivery_boy = null;
		if (order.delivery_boy_id) {
			delivery_boy = await vendorModel.getDriverBriefById(order.delivery_boy_id);
		}

		let decoded_items = [];
		if (order.order_items) {
			try {
				decoded_items = JSON.parse(order.order_items);
			} catch (e) {
				decoded_items = [];
			}
		}
		if (!Array.isArray(decoded_items)) {
			decoded_items = [];
		}

		const final_items = [];
		const subtotal = Number(order.subtotal) || 0;

		for (const item of decoded_items) {
			let addons_detail = [];

			if (item.addons) {
				const addon_ids = item.addons
					.toString()
					.split(",")
					.map((id) => parseInt(id, 10))
					.filter((id) => !isNaN(id) && id);

				if (addon_ids.length > 0) {
					addons_detail = await vendorModel.getAddonsByIdsForOrder(addon_ids);
				}
			}

			const restaurant_item = await vendorModel.getRestaurantItemPriceById(item.item_id);

			const item_price =
				restaurant_item && restaurant_item.discount_price
					? Number(restaurant_item.discount_price)
					: Number(item.discount_price || 0);

			const item_total =
				item.total_price !== undefined
					? Number(item.total_price)
					: item_price * (parseInt(item.quantity, 10) || 1);

			final_items.push({
				cart_id: item.cart_id || "",
				product_id: item.item_id || "",
				item_name: item.item_name || "",
				item_image: item.item_image || "",
				price: item_price.toFixed(2),
				quantity: parseInt(item.quantity, 10) || 0,
				addons: addons_detail,
				service_type: item.item_type || "",
				description: item.description || "",
				total_price: item_total.toFixed(2),
			});
		}

		let discount = 0;
		let discount_percent = 0;
		let coupon_name = "";
		let coupon_code = "";

		if (order.coupon_id && order.coupon_applied == 1) {
			const coupon = await vendorModel.getRestaurantCouponById(order.coupon_id);

			if (coupon) {
				coupon_name = coupon.title || "";
				coupon_code = coupon.code || "";

				if (coupon.discount_type === "percentage" || coupon.discount_type === "percent") {
					discount_percent = Number(coupon.cupon_price);
					discount = (subtotal * discount_percent) / 100;
				} else {
					discount = Number(coupon.cupon_price);
					if (subtotal > 0) {
						discount_percent = (discount / subtotal) * 100;
					}
				}
			}
		}

		if (discount > subtotal) {
			discount = subtotal;
		}

		const amount_after_discount = subtotal - discount;
		const hst_percent = 13;
		const hst_amount = (amount_after_discount * hst_percent) / 100;
		const wallet_used = Number(order.wallet_used || 0);

		let delivery_charge = 0;
		if (order.orderBookingType && order.orderBookingType === "Delivery") {
			delivery_charge = 5;
		}

		const final_total = amount_after_discount + hst_amount + delivery_charge;

		const status_map = {
			Pending: "Pending",
			Accepted: "Accepted",
			Cancelled: "Cancelled",
			Preparing: "Preparing",
			Ready_for_pickup: "Ready for Pickup",
			Picked_up: "Picked Up",
			On_the_way: "On The Way",
			Delivered: "Delivered",
			Rejected: "Rejected",
			Missed: "Missed",
		};

		const status_string = status_map[order.order_status] || order.order_status;

		const ratingCount = await vendorModel.countRatingReviewByBookingId(order.id);
		const is_rated = ratingCount > 0 ? "true" : "false";

		const formatDate = (d) => {
			if (!d) return "";
			const dt = new Date(d);
			const dd = String(dt.getDate()).padStart(2, "0");
			const mm = String(dt.getMonth() + 1).padStart(2, "0");
			const yyyy = dt.getFullYear();
			return `${dd}-${mm}-${yyyy}`;
		};

		const formatTime = (t) => {
			if (!t) return "";
			const dt = new Date(`1970-01-01T${t}`);
			if (isNaN(dt.getTime())) return "";
			let hours = dt.getHours();
			const minutes = String(dt.getMinutes()).padStart(2, "0");
			const ampm = hours >= 12 ? "PM" : "AM";
			hours = hours % 12 || 12;
			return `${hours}:${minutes} ${ampm}`;
		};

		return res.json({
			result: true,
			msg: "Order details fetched successfully",

			order_details: {
				id: order.id,
				order_number: order.order_number,
				order_status: order.order_status,
				orderBookingType: order.orderBookingType,
				canceled_reason: order.canceled_reason,
				status_in_string: status_string,
				payment_status: order.payment_status,
				payment_id: order.payment_id,
				order_date: order.order_date,
				order_time: order.order_time,
				created_at: order.created_at,
				booked_date: order.order_date ? formatDate(order.order_date) : "",
				booked_time: order.order_time ? formatTime(order.order_time) : "",
				address: order.address,
				address_id: order.address_id,
				drop_address: order.drop_address || (address_row ? address_row.address : "") || "",
				user_latitude: order.user_latitude,
				user_longitude: order.user_longitude,
				vendor_latitude: order.vendor_latitude,
				vendor_longitude: order.vendor_longitude,
				delivery_charge: delivery_charge.toFixed(2),
				wallet_used: wallet_used.toFixed(2),
				payable_amount: Number(order.payable_amount || 0).toFixed(2),
				otp: order.otp,
				order_note: order.order_note,
				pending_date: order.created_at || "",
				accept_date: order.accepted_at || "",
				preparing_date: order.preparing_at || "",
				ready_pickup_date: order.ready_at || "",
				picked_up_date: order.picked_up_at || "",
				on_the_way_date: order.on_the_way_at || "",
				completed_date: order.delivered_at || "",
				cancelled_date: order.rejected_at || "",
			},

			customer_details: {
				user_id: order.user_id,
				fname: order.fname,
				lname: order.lname,
				full_name: `${order.fname || ""} ${order.lname || ""}`.trim(),
				email: order.email,
				mobile: order.mobile,
				image: order.user_image,
				address: order.user_address,
			},

			vendor_details: {
				vendor_id: order.vendor_id,
				vendor_name: order.vendor_name,
				vendor_email: order.vendor_email,
				vendor_mobile: order.vendor_mobile,
				vendor_image: order.vendor_image,
				business_name: order.business_name,
				business_description: order.business_description,
				vendor_lat: order.vendor_lat,
				vendor_long: order.vendor_long,
				dining_option: order.dining_option,
				minimum_delivery_time: order.minimum_delivery_time,
				maximum_delivery_time: order.maximum_delivery_time,
				delivery_time_type: order.delivery_time_type,
				vendor_type: order.vendor_type,
			},

			delivery_boy: delivery_boy
				? {
						id: String(delivery_boy.id),
						name: `${delivery_boy.first_name || ""} ${delivery_boy.last_name || ""}`.trim(),
						phone: delivery_boy.phone || "",
						email: delivery_boy.email || "",
						image: delivery_boy.profile_image || "",
						lat: delivery_boy.lat || "",
						long: delivery_boy.long || "",
						is_available: delivery_boy.is_available || "",
						current_order_id: delivery_boy.current_order_id || "",
					}
				: null,

			restaurant_items: final_items,

			billing: {
				subtotal: subtotal.toFixed(2),
				coupon_id: order.coupon_id,
				coupon_name,
				coupon_code,
				discount_percent: discount_percent.toFixed(2),
				discount_string: `${discount_percent.toFixed(2)}%`,
				discount_amount: discount.toFixed(2),
				amount_after_discount: amount_after_discount.toFixed(2),
				delivery_charge: delivery_charge,
				wallet_used: wallet_used.toFixed(2),
				hst: "13%",
				hst_amount: hst_amount.toFixed(2),
				total_amount: final_total.toFixed(2),
			},

			is_customer_rated: is_rated,
		});
	} catch (error) {
		console.error("restaurantOrderDetails Error:", error);
		return res.status(500).json({
			result: false,
			msg: "Something went wrong. Please try later.",
		});
	}
};

const vendorAddAddonGroup = async (req, res) => {
  try {
    const vendor_id   = (req.body.vendor_id || "").toString().trim();
    const item_id     = (req.body.item_id || "").toString().trim();
    const sub_cat_id  = (req.body.sub_cat_id || "").toString().trim();
    const type        = (req.body.type || "").toString().trim();
    const title       = (req.body.title || "").toString().trim();
    const is_required = req.body.is_required ? 1 : 0;
    let group_id      = (req.body.group_id || "").toString().trim(); // empty = create, filled = update

    const options_raw = req.body.options; // raw JSON string

    // ---- basic validation ----
    if (!vendor_id || !item_id || !type || title === "" || !options_raw) {
      return res.json({
        result: "false",
        msg: "Required: vendor_id, item_id, type, title, options",
      });
    }

    if (!["addon", "topping"].includes(type)) {
      return res.json({
        result: "false",
        msg: "Invalid type. Must be addon or topping.",
      });
    }

    // ---- decode options JSON string ----
    let options;
    try {
      options = JSON.parse(options_raw);
    } catch (e) {
      return res.json({
        result: "false",
        msg: "Invalid options JSON. Expected format: [{\"name\":\"Regular\",\"price\":\"0\"}, ...]",
        debug_error: e.message,
        debug_raw: options_raw,
      });
    }

    if (!Array.isArray(options) || options.length === 0) {
      return res.json({
        result: "false",
        msg: "Invalid options JSON. Expected format: [{\"name\":\"Regular\",\"price\":\"0\"}, ...]",
        debug_raw: options_raw,
      });
    }

    // ---- security check: ye item isi vendor ka hai ya nahi ----
    const item = await vendorModel.getRestaurantItemByVendor(item_id, vendor_id);

    if (!item) {
      return res.json({
        result: "false",
        msg: "Item not found for this vendor",
      });
    }

    const is_update = !!group_id;

    if (is_update) {
      // ---- verify group exists & belongs to this item + vendor ----
      const group = await vendorModel.getAddonGroupByIdItemVendor(
        group_id,
        item_id,
        vendor_id
      );

      if (!group) {
        return res.json({
          result: "false",
          msg: "Group not found for this item",
        });
      }

      await vendorModel.updateAddonGroup(group_id, title, is_required);

      // purane options hatao, neeche fresh set insert karenge (full replace)
      await vendorModel.deleteAddonsByGroupId(group_id);
    } else {
      // ---- create new group ----
      group_id = await vendorModel.insertAddonGroup({
        item_id,
        vendor_id,
        sub_cat_id,
        type,
        title,
        is_required,
      });
    }

    
    const uploaded_images = {}; // idx => saved_filename

    if (type === "topping" && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file) => {
        const match = file.fieldname.match(/^image_(\d+)$/);
        if (match) {
          const idx = match[1];
          uploaded_images[idx] = file.filename; // multer ne already unique filename generate kar diya
        }
      });
    }

    // ---- build options (name/price/image) ----
    const insertData = [];

    options.forEach((opt, idx) => {
      const name = opt && opt.name ? String(opt.name).trim() : "";
      if (name === "") return;

      const price = opt && opt.price ? parseFloat(opt.price) : 0;

      // pehle purani (existing) image path le lo agar update mode me JSON me bheji gayi ho
      let image_path =
        opt && opt.existing_image ? String(opt.existing_image).trim() : null;

      // agar isi index ke liye nayi image upload hui hai, to use replace kar do
      if (uploaded_images[idx] !== undefined) {
        image_path = uploaded_images[idx];
      }

      insertData.push([
        group_id,
        name,
        price,
        vendor_id,
        item_id,
        image_path,
      ]);
    });

    if (insertData.length === 0) {
      // koi valid option bacha hi nahi -> poora group hata do
      await vendorModel.deleteAddonGroupById(group_id);

      return res.json({
        result: "true",
        msg: "All options removed, group deleted",
        data: {
          deleted: true,
          group_id: group_id,
          type: type,
        },
      });
    }

    await vendorModel.insertAddonsBatch(insertData);

    const saved_options = await vendorModel.getAddonsByGroupId(group_id);

    return res.json({
      result: "true",
      msg: is_update
        ? `${capitalize(type)} group updated successfully`
        : `${capitalize(type)} group added successfully`,
      data: {
        group_id: group_id,
        type: type,
        title: title,
        is_required: is_required,
        options: saved_options,
      },
    });
  } catch (error) {
    console.error("vendorAddAddonGroup Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

const vendorGetItemAddons = async (req, res) => {
  try {
    const vendor_id = (req.body.vendor_id || req.query.vendor_id || "")
      .toString()
      .trim();
    const item_id = (req.body.item_id || req.query.item_id || "")
      .toString()
      .trim();

    if (!vendor_id || !item_id) {
      return res.json({
        result: "false",
        msg: "vendor_id and item_id are required",
      });
    }

    // ---- item detail ----
    const item = await vendorModel.getItemBasicByVendor(item_id, vendor_id);

    if (!item) {
      return res.json({
        result: "false",
        msg: "Item not found for this vendor",
      });
    }

    // ---- is item ke saare groups (addon + topping dono) ----
    const groups = await vendorModel.getAddonGroupsByItemVendor(
      item_id,
      vendor_id
    );

    const base_addons = [];
    const toppings = [];

    for (const group of groups) {
      const type_lc = (group.type || "").toString().trim().toLowerCase();

      const addons = await vendorModel.getAddonsByGroupAndItem(
        group.id,
        item_id,
        type_lc
      );

      const addon_list = [];

      for (const addon of addons) {
        if (type_lc === "addon") {
          addon_list.push({
            id: addon.id,
            group_id: addon.group_id,
            item_id: addon.item_id,
            name: addon.name,
            price: addon.price,
          });
        } else if (type_lc === "topping") {
          addon_list.push({
            id: addon.id,
            group_id: addon.group_id,
            item_id: addon.item_id,
            name: addon.name,
            price: addon.price,
            image: addon.image,
          });
        }
      }

      const group_data = {
        id: group.id,
        item_id: group.item_id,
        title: group.title,
        is_required: group.is_required,
        type: group.type,
      };

      if (type_lc === "addon") {
        group_data.addons = addon_list;
        base_addons.push(group_data);
      } else if (type_lc === "topping") {
        group_data.toppings = addon_list;
        toppings.push(group_data);
      }
    }

    return res.json({
      result: "true",
      msg: "Addon and topping list",
      data: {
        item: {
          id: item.id,
          name: item.name,
          unit_price: item.unit_price,
          discount_price: item.discount_price,
          description: item.description,
          item_image: item.item_image,
        },
        base_addons: base_addons,
        base_toppings: toppings,
      },
    });
  } catch (error) {
    console.error("vendorGetItemAddons Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

const restaurantItemsKeywordList = async (req, res) => {
  try {
    const product_id = (req.body.product_id || "").toString().trim();

    if (!product_id) {
      return res.json({
        result: "false",
        msg: "Parameter product_id is required",
      });
    }

    const product = await vendorModel.getRestaurantItemById(product_id);

    if (!product) {
      return res.json({
        result: "false",
        msg: "Restaurant item not found",
      });
    }

    const keywords = await vendorModel.getKeywordsByItemId(product_id);

    return res.json({
      result: "true",
      msg: "Keyword list successfully fetched",
      product_id: product_id,
      data: keywords,
    });
  } catch (error) {
    console.error("restaurantItemsKeywordList Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};

const addRestaurantItemsKeyword = async (req, res) => {
  try {
    const product_id = (req.body.product_id || "").toString().trim();
    const keyword = (req.body.keyword || "").toString().trim();

    if (!product_id) {
      return res.json({
        result: "false",
        msg: "Parameter product_id is required",
      });
    }

    if (!keyword) {
      return res.json({
        result: "false",
        msg: "Parameter keyword is required",
      });
    }

    const product = await vendorModel.getRestaurantItemById(product_id);

    if (!product) {
      return res.json({
        result: "false",
        msg: "Restaurant item not found",
      });
    }

    const vendor_id = product.vendor_id;

    if (!vendor_id) {
      return res.json({
        result: "false",
        msg: "Vendor ID not found",
      });
    }

    const existing = await vendorModel.getKeywordByItemAndKeyword(
      product_id,
      keyword
    );

    if (existing) {
      return res.json({
        result: "false",
        msg: "Keyword already exists",
        id: existing.id,
        product_id: product_id,
        vendor_id: vendor_id,
        keyword: existing.keyword,
      });
    }

    const insert_id = await vendorModel.insertRestaurantItemKeyword({
      restaurant_item_id: product_id,
      vendor_id: vendor_id,
      keyword: keyword,
    });

    if (insert_id) {
      return res.json({
        result: "true",
        msg: "Successfully added restaurant item keyword",
        id: insert_id,
        product_id: product_id,
        vendor_id: vendor_id,
        keyword: keyword,
      });
    } else {
      return res.json({
        result: "false",
        msg: "Failed to add restaurant item keyword",
      });
    }
  } catch (error) {
    console.error("addRestaurantItemsKeyword Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
};


module.exports = {
  vendorSignup,
  vendorLogin,
  saveDetail,
  saveBankDetail,
  verifyOtp,
  getCategories,
  getCities,
  getLoginStatus,
  getPendingBooking,
  getBusinessName,
  getNotifications,
  markAsSeenNf,
  getBookDetail,
  cancelBooking,
  orderAccept,
  getInprocessingBookings,
  getServices,
  getSubCategories,
  addService,
  saveShopDetail,
  getUserDetail,
  vendorLogout,
  getMyAddressVendor,
  getBankDetail,
  getEarningDetail,
  getAdvertisinglist,
  deleteVideoVendor,
  getVideoVendor,
  addVideoVendor,
  deleteImagesVendor,
  getImagesVendor,
  addImagesVendor,
  vendorTimeSlots,
  saveAppReview,
  getPolicies,
  vendorTimeSlotsUpdate,
  completeOrderNow,
  activeDeactiveService,
  restaurantHomeDashboard,
  restaurantAllOrdersHome,
  getTruAnonWebviewUrl,
  truAnonCallback,
  verifyTruAnon,
  restaurantOpenCloseStatus,
  restaurantGetItems,
  restaurantItemAdd,
  getSubCategoryByReasaurant,
  restaurantItemStatusUpdate,
  restaurantOrderBooking,
  restaurantAcceptDeclineOrder,
  restaurantOrderDetails,
  vendorAddAddonGroup,
  vendorGetItemAddons,
  restaurantItemsKeywordList,
  addRestaurantItemsKeyword
};
