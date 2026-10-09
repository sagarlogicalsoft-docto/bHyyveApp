const bcrypt = require("bcrypt");
const pool = require("../config/db");
const path = require("path");
const fs = require("fs");
const UserModel = require("../models/userModel");
const { sendOTP } = require("../utils/sms");
const {
  sendNotification,
  sendPayloadNotification,
} = require("../services/notificationService");

const { calculateDistanceUser } = require("../utils/distance");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const { bhiveSendSmtpMail } = require("../services/mailService");
const { onBooked } = require("../services/bookingNotificationService");

const BCRYPT_ROUNDS = 10;
const baseUrl = "http://192.168.1.12:6010";
const BASE_URL = process.env.BASE_URL || "http://192.168.1.12:6010";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + Number(days));
  return result;
}

function formatDateYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(date) {
  // "M d, Y" jaisa PHP me tha -> "Jan 05, 2026"
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const m = months[date.getMonth()];
  const d = String(date.getDate()).padStart(2, "0");
  const y = date.getFullYear();
  return `${m} ${d}, ${y}`;
}

function diffInDays(fromDate, toDate) {
  // PHP: $today->diff($expiry)->format('%r%a') -> signed day difference
  const msPerDay = 24 * 60 * 60 * 1000;
  const utcFrom = Date.UTC(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate(),
  );
  const utcTo = Date.UTC(
    toDate.getFullYear(),
    toDate.getMonth(),
    toDate.getDate(),
  );
  return Math.round((utcTo - utcFrom) / msPerDay);
}

function getCurrentDateTime() {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace("T", " ");
}

function generateBookingUniqueId() {
  const ts = Date.now().toString();
  return "BV" + ts.slice(-6);
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
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

function formatTimeDifference(seconds) {
  if (seconds <= 0) return "just now";

  let remaining = seconds;

  const years = Math.floor(remaining / (365 * 24 * 60 * 60));
  remaining %= 365 * 24 * 60 * 60;

  const months = Math.floor(remaining / (30 * 24 * 60 * 60));
  remaining %= 30 * 24 * 60 * 60;

  const days = Math.floor(remaining / (24 * 60 * 60));
  remaining %= 24 * 60 * 60;

  const hours = Math.floor(remaining / (60 * 60));
  remaining %= 60 * 60;

  const minutes = Math.floor(remaining / 60);
  remaining %= 60;

  const parts = [];

  if (years) parts.push(`${years}Y`);
  if (months) parts.push(`${months}M`);
  if (days) parts.push(`${days}D`);
  if (hours) parts.push(`${hours}H`);
  if (minutes) parts.push(`${minutes}MIN`);
  if (remaining) parts.push(`${remaining}S`);

  return parts.length ? parts.join(" ") + " ago" : "just now";
}

const toFloat = (v) => parseFloat(v) || 0;

// PHP (int) cast
const toInt = (v) => parseInt(v, 10) || 0;

//................new code 19-09-26.................//

function isEmpty(value) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "0" ||
    value === 0
  );
}

function isNumeric(value) {
  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== "" &&
    isFinite(Number(value))
  );
}

function stringifyValues(row) {
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] =
      typeof value === "number" || typeof value === "bigint"
        ? String(value)
        : value;
  }
  return out;
}

const str = (v) => (v === null || v === undefined ? v : String(v));

async function getAddressFromLatLngRestaurant(lat, lng) {
  try {
    if (!GOOGLE_MAPS_API_KEY) return "";

    const url =
      "https://maps.googleapis.com/maps/api/geocode/json" +
      `?latlng=${encodeURIComponent(lat)},${encodeURIComponent(lng)}` +
      `&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await response.json();

    return data?.results?.[0]?.formatted_address || "";
  } catch (error) {
    console.error("Geocode Error:", error.message);
    return "";
  }
}

function buildImageUrl(image) {
  return !isEmpty(image) ? `${BASE_URL}/assets/images/${image}` : "";
}

function normalizeRowValues(row) {
  const pad = (n) => String(n).padStart(2, "0");
  const out = {};

  for (const [key, value] of Object.entries(row)) {
    if (value instanceof Date) {
      out[key] = isNaN(value.getTime())
        ? null
        : `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ` +
          `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
    } else if (typeof value === "number" || typeof value === "bigint") {
      out[key] = String(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function parseAddonIds(value) {
  if (isEmpty(value)) return [];

  const ids = String(value)
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "" && /^\d+$/.test(s))
    .map((s) => String(parseInt(s, 10)));

  return [...new Set(ids)];
}

function nowMysql() {
	const d = new Date();
	const pad = (n) => String(n).padStart(2, "0");
	return (
		`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
		`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
	);
}

function looseIn(value, list) {
	const a = String(value).trim();
	return list.some((x) => {
		const b = String(x).trim();
		return isNumeric(a) && isNumeric(b) ? Number(a) === Number(b) : a === b;
	});
}

function splitIds(value) {
	return !isEmpty(value)
		? String(value)
				.split(",")
				.filter((s) => s !== "" && s !== "0")
		: [];
}

async function userSignup(req, res) {
  try {
    const {
      fname,
      lname,
      email,
      password,
      phone,
      country_code,
      post_code,
      fcm_id,
      referral_code,
    } = req.body;

    if (
      !fname ||
      !lname ||
      !email ||
      !password ||
      !phone ||
      !country_code ||
      !post_code ||
      !fcm_id
    ) {
      return res.json({
        result: false,
        msg: "Please give parameters (fname,lname,email,password,phone,country_code,post_code,fcm_id)",
      });
    }

    const existing = await UserModel.findByEmailOrMobile(email, phone);
    if (existing.length > 0) {
      return res.json({
        result: false,
        msg: "User Already Exits On email Or Phone",
      });
    }

    let isValidCode = false;
    let codeOwnerId = null;
    let codeOwnerWallet = 0;

    if (referral_code) {
      const owners = await UserModel.findByReferralCode(referral_code);

      if (owners.length === 0) {
        return res.json({ result: false, msg: "Referral code is invalid." });
      }

      const codeOwner = owners[0];
      codeOwnerId = codeOwner.id;
      codeOwnerWallet = codeOwner.wallet || 0;

      const usageCount = await UserModel.countReferralUsage(codeOwnerId);
      if (usageCount >= 20) {
        return res.json({
          result: false,
          msg: "This referral code has already been used 20 times. Please enter a new referral code.",
        });
      }

      isValidCode = true;
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const userData = {
      fname,
      lname,
      email,
      password: hashedPassword,
      plan_password: password,
      mobile: phone,
      country_code,
      post_code,
      otp,
      verify_otp: 0,
      fcm_id,
      referral_code: Date.now().toString(),
    };

    const smsSent = await sendOTP(`+${country_code}`, phone, otp);

    const lastId = await UserModel.insertUser(userData);
    if (!lastId) {
      return res.json({ result: false, msg: "Could Not saved" });
    }

    let isReferredSuccess = "false";

    if (isValidCode) {
      await UserModel.insertReferralHistory(codeOwnerId, lastId);
      isReferredSuccess = "true";

      const newOwnerWallet = codeOwnerWallet + 10;
      await UserModel.updateWallet(codeOwnerId, newOwnerWallet);
      await UserModel.updateWallet(lastId, 10);

      await UserModel.insertWalletDetail(
        codeOwnerId,
        10,
        "reffered_and_earned",
        "credit",
      );
      await UserModel.insertWalletDetail(
        lastId,
        10,
        "reffered_and_earned",
        "credit",
      );
    }

    return res.json({
      result: true,
      msg: "saved Successfully",
      otp,
      userid: lastId,
      is_reffered_success: isReferredSuccess,
      // sms_sent: smsSent
    });
  } catch (err) {
    console.error("userSignup error:", err);
    return res
      .status(500)
      .json({ result: false, msg: "Something went wrong. Please try later." });
  }
}

async function userLogin(req, res) {
  try {
    const { mobile, password, fcm_id, lat, lang } = req.body;

    if (!mobile || !password || !fcm_id || !lat || !lang) {
      return res.json({
        result: false,
        msg: "Please provide parameters(mobile,password,fcm_id,lat,lang)",
      });
    }

    const users = await UserModel.findByMobile(mobile);

    if (!users || users.length === 0) {
      return res.json({
        result: false,
        msg: "User Not Found",
      });
    }

    const user = users[0];

    let isPasswordMatch = false;

    if (user.password.startsWith("$2")) {
      isPasswordMatch = await bcrypt.compare(password, user.password);
    } else {
      isPasswordMatch = user.password === password;
    }

    if (!isPasswordMatch) {
      return res.json({
        result: false,
        msg: "User Not Found",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    // Update Login Details
    await UserModel.updateLogin(user.id, {
      lat,
      lang,
      fcm_id,
      otp,
      verify_otp: 0,
    });

    // Send OTP
    let smsResponse = {};
    try {
      smsResponse = await sendOTP(`+${user.country_code}`, user.mobile, otp);
    } catch (e) {
      console.log("SMS Error:", e.message);
      smsResponse = {};
    }

    return res.json({
      ...smsResponse,
      result: true,
      otp: otp,
      msg: "Please verify otp",
      userid: user.id,
      name: `${user.fname} ${user.lname}`,
      phone: user.mobile,
      status: user.status,
      data: user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong.",
    });
  }
}

async function verifyOTP(req, res) {
  try {
    const { user_id, otp } = req.body;

    if (!user_id || !otp) {
      return res.json({
        result: false,
        msg: "Parameter required: user_id, otp",
      });
    }

    const users = await UserModel.findById(user_id);

    if (users.length === 0) {
      return res.json({
        result: false,
        msg: "Wrong User ID",
      });
    }

    let user = users[0];

    if (Number(user.verify_otp) === 1) {
      return res.json({
        result: true,
        msg: "OTP already verified",
        data: user,
      });
    }

    const otpUser = await UserModel.findByIdAndOTP(user_id, otp);

    if (otpUser.length === 0) {
      return res.json({
        result: false,
        msg: "Sorry, OTP not valid.",
      });
    }

    const USERID = otpUser[0].id;

    await UserModel.updateVerifyOTP(USERID);

    const freshUser = await UserModel.findById(USERID);
    user = freshUser[0];

    if (
      user &&
      Number(user.verify_otp) === 1 &&
      Number(user.signup_notification) === 0 &&
      user.fcm_id
    ) {
      await UserModel.insertNotification({
        sender_id: USERID,
        message: "Welcome to bHyyve! Your registration was successful.",
        sender_type: "customer",
        receiver_type: "Admin",
        types: "Registration",
      });

      const notificationSent = await sendNotification(
        {
          title: "Welcome to bHyyve!",
          body: "Your registration was successful.",
        },
        user.fcm_id,
      );

      if (notificationSent) {
        await UserModel.updateSignupNotification(USERID);
      }
    }

    const latestUser = await UserModel.findById(USERID);

    return res.json({
      result: true,
      msg: "OTP verified successfully",
      data: latestUser[0],
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      result: false,
      msg: "Something went wrong.",
    });
  }
}

async function resendOTP(req, res) {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.json({
        result: false,
        msg: "Please provide parameters(user_id)",
      });
    }

    const users = await UserModel.findById(user_id);

    if (users.length === 0) {
      return res.json({
        result: false,
        msg: "Wrong user_id",
      });
    }

    const user = users[0];

    const otp = Math.floor(1000 + Math.random() * 9000);

    const updated = await UserModel.updateOTP(user_id, otp);

    if (!updated.affectedRows) {
      return res.json({
        result: false,
        msg: "Something Went Wrong",
      });
    }

    let smsResponse = {};

    try {
      smsResponse = await sendOTP(`+${user.country_code}`, user.mobile, otp);
    } catch (err) {
      console.log(err.message);
    }

    return res.json({
      result: true,
      otp: otp,
      msg: "Please verify otp",
      user_id: user.id,
      name: user.fname,
      mobile: user.mobile,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function getCategories(req, res) {
  try {
    const categories = await UserModel.getCategories();

    if (categories.length > 0) {
      return res.json({
        result: true,
        msg: "get successfully",
        data: categories,
      });
    }

    return res.json({
      result: false,
      msg: "User Not Found",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function getHomeSlider(req, res) {
  try {
    const sliders = await UserModel.getHomeSliders();

    if (sliders.length > 0) {
      return res.json({
        result: true,
        msg: "get successfully",
        data: sliders,
      });
    }

    return res.json({
      result: false,
      msg: "No slider Found",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function getProducts(req, res) {
  try {
    const { vendor_id, userid, scat_name } = req.body;

    if (!vendor_id || !userid || !scat_name) {
      return res.json({
        result: false,
        msg: "Please provide parameters(vendor_id, userid, scat_name)",
      });
    }

    const subCategory = await UserModel.getSubCategoryByName(
      scat_name.toLowerCase(),
    );

    if (subCategory.length === 0) {
      return res.json({
        result: false,
        msg: "No Sub Category Found",
      });
    }

    const scat_id = subCategory[0].id;

    const vendor = await UserModel.getVendor(vendor_id);

    if (vendor.length === 0) {
      return res.json({
        result: false,
        msg: "Wrong vendor_id",
      });
    }

    const cat_name = vendor[0].category_name;

    const startFrom = await UserModel.getStartFrom(vendor_id);

    const products = await UserModel.getProducts(vendor_id, userid, scat_id);

    if (products.length === 0) {
      return res.json({
        result: false,
        msg: "No Data Found",
      });
    }

    products.forEach((item) => {
      item.image = item.image
        ? item.image.split(",").map((img) => img.trim())
        : [];
    });

    const cart = await UserModel.getCartTotal(userid);

    return res.json({
      result: true,
      msg: "get successfully",
      cart_total: Number(cart.total || 0),
      cat_name: cat_name,
      start_from: startFrom.start_from,
      data: products,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

// async function getVendors(req, res) {
//   try {
//     const { userid, cat_id } = req.body;

//     if (!userid || !cat_id) {
//       return res.json({
//         result: false,

//         msg: "REQ: userid, cat_id",
//       });
//     }

//     const users = await UserModel.getUserById(userid);

//     if (users.length === 0) {
//       return res.json({
//         result: false,

//         msg: "Wrong userid",
//       });
//     }

//     const user = users[0];

//     const vendors = await UserModel.getVendors(cat_id);

//     const filtered = [];

//     vendors.forEach((vendor) => {
//       const radius = parseFloat(String(vendor.redius).replace(" KM", ""));

//       const distance = calculateDistance(
//         Number(user.lat),

//         Number(user.lang),

//         Number(vendor.lat),

//         Number(vendor.long),
//       );

//       if (distance <= radius) {
//         vendor.distance = distance.toFixed(2) + " KM";

//         filtered.push(vendor);
//       }
//     });

//     if (filtered.length > 0) {
//       return res.json({
//         result: true,

//         msg: "Get Successfully",

//         cat_name: filtered[0].cat_name,

//         cat_id: filtered[0].cat_id,

//         data: filtered,
//       });
//     }

//     return res.json({
//       result: false,

//       msg: "No Vendor Found in Range",
//     });
//   } catch (err) {
//     console.log(err);

//     return res.status(500).json({
//       result: false,

//       msg: "Something Went Wrong",
//     });
//   }
// }

async function getVendors(req, res) {
	try {
		const { userid, cat_id, subcategory_id } = req.body;

		if (!userid || !cat_id) {
			return res.json({
				result: false,

				msg: "REQ: userid, cat_id",
			});
		}

		const users = await UserModel.getUserById(userid);

		if (users.length === 0) {
			return res.json({
				result: false,

				msg: "Wrong userid",
			});
		}

		const user = users[0];

		const vendors = await UserModel.getVendors(cat_id, subcategory_id);

		const filtered = [];

		vendors.forEach((vendor) => {
			const radius = parseFloat(String(vendor.redius).replace(" KM", ""));

			const distance = calculateDistance(
				Number(user.lat),

				Number(user.lang),

				Number(vendor.lat),

				Number(vendor.long),
			);

			if (distance <= radius) {
				vendor.distance = distance.toFixed(2) + " KM";

				filtered.push(vendor);
			}
		});

		if (filtered.length > 0) {
			return res.json({
				result: true,

				msg: "Get Successfully",

				cat_name: filtered[0].cat_name,

				cat_id: filtered[0].cat_id,

				data: filtered,
			});
		}

		return res.json({
			result: false,

			msg: "No Vendor Found in Range",
		});
	} catch (err) {
		console.log(err);

		return res.status(500).json({
			result: false,

			msg: "Something Went Wrong",
		});
	}
}


async function addToCart(req, res) {
  const {
    vendor_id,
    cat_id,
    product_id,
    userid,
    qty,
    addons,
    warrenty_status,
    service_type,
  } = req.body;

  if (!vendor_id || !cat_id || !product_id || !userid) {
    return res.json({
      result: "false",
      msg: "Please provide parameters(vendor_id,cat_id,product_id,qty,userid)",
    });
  }

  try {
    const [productRows] = await pool.query(
      "SELECT * FROM products WHERE id=?",
      [product_id],
    );

    if (productRows.length === 0) {
      return res.json({
        result: "false",
        msg: "No Any Product Found on this Id ",
      });
    }
    const product = productRows[0];

    const msg = await UserModel.preCartData(
      vendor_id,
      cat_id,
      userid,
      product_id,
    );

    if (msg === 0) {
      // ================= FIX START =================
      if (!qty || Number(qty) <= 0) {
      // ================= FIX END =================
        return UserModel._removeAndRespond(
          res,
          vendor_id,
          cat_id,
          userid,
          product_id,
        );
      }

      const { addonIds, addonPrice } = await UserModel._getAddonData(addons);

      const DB = {
        user_id: userid,
        vendor_id: vendor_id,
        product_id: product_id,
        name: product.product_name,
        image: product.image,
        price: product.rate,
        quantity: qty,
      };
      if (addonIds !== null) {
        DB.addon = addonIds;
        DB.addon_price = addonPrice;
      }
      if (warrenty_status !== undefined && warrenty_status !== null) {
        DB.warrenty_status =
          warrenty_status === "true" || Number(warrenty_status) === 1 ? 1 : 0;
      }
      if (service_type) {
        DB.service_type = service_type;
      }

      const total = await UserModel._computeAmount(
        userid,
        qty,
        product.rate,
        addonPrice,
      );
      DB.total_amount = total;
      DB.final_amount = total;

      const [insertResult] = await pool.query("INSERT INTO cart SET ?", [DB]);

      if (insertResult.affectedRows > 0) {
        const detail = await UserModel.cartDetail(
          vendor_id,
          cat_id,
          userid,
          product_id,
        );
        return res.json({
          result: "true",
          msg: "Added Successfully",
          cart_total: detail.cart_total,
          qty: detail.qty,
          addon_price: detail.addon_price,
          product_total_price: detail.product_total_price,
        });
      }

      return res.json({ result: "false", msg: "Adding Failed to Cart" });
    } else if (msg === 1) {
      // ================= FIX START =================
      if (!qty || Number(qty) <= 0) {
      // ================= FIX END =================
        return UserModel._removeAndRespond(
          res,
          vendor_id,
          cat_id,
          userid,
          product_id,
        );
      }

      const [existingRows] = await pool.query(
        "SELECT * FROM cart WHERE user_id=? AND product_id=?",
        [userid, product_id],
      );

      const { addonIds, addonPrice } = await UserModel._getAddonData(addons);

      const DB = {
        user_id: userid,
        product_id: product_id,
        name: product.product_name,
        image: product.image,
        price: product.rate,
        quantity: qty,
      };
      if (addonIds !== null) {
        DB.addon = addonIds;
        DB.addon_price = addonPrice;
      }
      if (warrenty_status !== undefined && warrenty_status !== null) {
        DB.warrenty_status =
          warrenty_status === "true" || Number(warrenty_status) === 1 ? 1 : 0;
      }
      if (service_type) {
        DB.service_type = service_type;
      }

      const total = await UserModel._computeAmount(
        userid,
        qty,
        product.rate,
        addonPrice,
      );
      DB.total_amount = total;
      DB.final_amount = total;

      if (existingRows.length > 0) {
        await pool.query("UPDATE cart SET ? WHERE product_id=? AND user_id=?", [
          DB,
          product_id,
          userid,
        ]);

        const detail = await UserModel.cartDetail(
          vendor_id,
          cat_id,
          userid,
          product_id,
        );
        return res.json({
          result: "true",
          msg: "Update Successfully",
          cart_total: detail.cart_total,
          qty: detail.qty,
          addon_price: detail.addon_price,
          product_total_price: detail.product_total_price,
        });
      }

      DB.vendor_id = vendor_id;
      const [insertResult] = await pool.query("INSERT INTO cart SET ?", [DB]);

      if (insertResult.affectedRows > 0) {
        const detail = await UserModel.cartDetail(
          vendor_id,
          cat_id,
          userid,
          product_id,
        );
        return res.json({
          result: "true",
          msg: "Added Successfully",
          cart_total: detail.cart_total,
          qty: detail.qty,
          addon_price: detail.addon_price,
          product_total_price: detail.product_total_price,
        });
      }

      return res.json({ result: "false", msg: "Adding Failed to Cart" });
    } else {
      return res.json({ result: "false", msg: "Something Went Wrong" });
    }
  } catch (err) {
    console.error("addToCart error:", err);
    return res.status(500).json({ result: "false", msg: "Server Error" });
  }
}

async function showCart(req, res) {
  const { userid } = req.body;

  if (!userid) {
    return res.json({
      result: "false",
      msg: "Please provide parameters(userid)",
    });
  }

  try {
    const [cartRows] = await pool.query(
      `SELECT
						cart.*,
						cart.service_type AS selected_service_type,

						products.vendor_id,
						products.category_id,
						products.product_name,
						products.image,
						products.rate,
						products.about,
						products.status,
						products.service_type AS product_service_type

				 FROM cart
				 JOIN products
						ON products.id = cart.product_id

				 WHERE cart.user_id = ?`,
      [userid],
    );

    if (cartRows.length === 0) {
      return res.json({
        result: "false",
        msg: "cart is empty",
      });
    }

    let TOTAL_AMOUNT = 0;
    let DISCOUNT_PERCENT = 0;
    let DISCOUNT_AMOUNT = 0;
    let VENDOR_ID = "";
    let CAT_ID = "";
    let COUPON_CODE_ID = "";
    let COUPON_CODE_NAME = "";
    const CART_PRODUCT_LIST = [];

    for (const row of cartRows) {
      if (row.coupon_applied == 1 && row.coupon_id) {
        COUPON_CODE_ID = row.coupon_id;
        break;
      }
    }

    let coupon = null;
    if (COUPON_CODE_ID) {
      const [couponRows] = await pool.query(
        `SELECT * FROM cupon_code WHERE id=? LIMIT 1`,
        [COUPON_CODE_ID],
      );

      if (couponRows.length > 0) {
        coupon = couponRows[0];
        DISCOUNT_PERCENT = coupon.cupon_price;
        COUPON_CODE_NAME = coupon.title;
      }
    }

    for (const row of cartRows) {
      const product_total = Number(row.quantity) * Number(row.rate);
      TOTAL_AMOUNT += product_total;

      VENDOR_ID = row.vendor_id;
      CAT_ID = row.category_id;

      let apply_discount = false;
      let product_discount = 0;

      if (coupon) {
        const coupon_categories = (coupon.category_ids || "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        const coupon_vendors = (coupon.vendor_ids || "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        const coupon_products = (coupon.product_ids || "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);

        const match_category =
          coupon_categories.length === 0 ||
          coupon_categories.includes(String(row.category_id));
        const match_vendor =
          coupon_vendors.length === 0 ||
          coupon_vendors.includes(String(row.vendor_id));
        const match_product =
          coupon_products.length === 0 ||
          coupon_products.includes(String(row.product_id));

        if (match_category && match_vendor && match_product) {
          apply_discount = true;
        }

        if (apply_discount) {
          if (coupon.discount_type == "percentage") {
            product_discount = (product_total * coupon.cupon_price) / 100;
          } else {
            product_discount = Number(coupon.cupon_price);
          }
          DISCOUNT_AMOUNT += product_discount;
        }
      }

      let first_image = "";
      if (row.image) {
        const imgs = String(row.image).split(",");
        first_image = imgs[0].trim();
      }

      CART_PRODUCT_LIST.push({
        id: row.product_id,
        selected_service_type: row.service_type,
        product_name: row.product_name,
        image: first_image,
        rate: row.rate,
        about: row.about,
        status: row.status,
        quantity: row.quantity,
        coupon_applied: row.coupon_applied,
        coupon_id: String(row.coupon_id ?? ""),
        category_id: String(row.category_id ?? ""),
      });
    }

    let REFERRAL_DISCOUNT_AMOUNT = 0;
    let REFERRAL_DISCOUNT_PERCENT = 0;

    const [bookingRows] = await pool.query(
      `SELECT id FROM booking WHERE userid=? LIMIT 1`,
      [userid],
    );
    const has_previous_booking = bookingRows.length > 0;

    const [referralRows] = await pool.query(
      `SELECT * FROM referrel_history WHERE code_owner_userid=?`,
      [userid],
    );
    const referral_exists = referralRows.length > 0;

    if (!has_previous_booking && referral_exists) {
      REFERRAL_DISCOUNT_PERCENT = 10;
      REFERRAL_DISCOUNT_AMOUNT = ((TOTAL_AMOUNT - DISCOUNT_AMOUNT) * 10) / 100;
    }

    const sub_total = TOTAL_AMOUNT - DISCOUNT_AMOUNT - REFERRAL_DISCOUNT_AMOUNT;

    const HST_AMOUNT = (sub_total * 13) / 100;

    const price_final = sub_total + HST_AMOUNT;

    return res.json({
      result: "true",
      msg: "Updated Successfully",
      item_total: TOTAL_AMOUNT,
      amount_after_discount: sub_total.toFixed(2),
      hst: "13%",
      hst_amount: HST_AMOUNT.toFixed(2),
      discount: DISCOUNT_AMOUNT.toFixed(2),
      wallet: ((TOTAL_AMOUNT * 2) / 100).toFixed(2),
      discount_percent: String(DISCOUNT_PERCENT),
      cart_total: sub_total.toFixed(2),
      vendor_id: VENDOR_ID,
      cat_id: CAT_ID,
      coupon_id: COUPON_CODE_ID,
      coupon_code_name: COUPON_CODE_NAME,
      cart_products: CART_PRODUCT_LIST,
      dist_price: HST_AMOUNT.toFixed(2),
      price_final: price_final.toFixed(2),
      referral_discount_percent: REFERRAL_DISCOUNT_PERCENT,
      referral_discount_amount: REFERRAL_DISCOUNT_AMOUNT.toFixed(2),
      referral_discount_note:
        REFERRAL_DISCOUNT_PERCENT > 0 ? "10% referral discount applied" : "",
    });
  } catch (err) {
    console.error("showCart error:", err);
    return res.status(500).json({ result: "false", msg: "Server Error" });
  }
}

async function shareBonusGift(req, res) {
  try {
    const bonus = await UserModel.getShareBonusGift();

    if (bonus.length > 0) {
      return res.json({
        result: true,
        msg: "success",
        data: bonus[0],
      });
    }

    return res.json({
      result: false,
      msg: "error",
    });
  } catch (err) {
    console.log("shareBonusGift Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function getMyAddresses(req, res) {
  const { userid } = req.body;

  if (!userid) {
    return res.json({ result: false, msg: "REQ: userid" });
  }

  try {
    const [cartItems] = await pool.query("SELECT * FROM cart WHERE user_id=?", [
      userid,
    ]);

    if (cartItems.length === 0) {
      return res.json({ result: false, msg: "Cart not found" });
    }

    let service_types = [];
    let vendor_ids = [];
    let category_id = "";
    let category_name = "";
    let vendor_lat = "";
    let vendor_long = "";

    for (const cart of cartItems) {
      vendor_ids.push(cart.vendor_id);

      if (cart.service_type) {
        const types = String(cart.service_type).toLowerCase().trim().split(",");
        for (const t of types) {
          service_types.push(t.trim());
        }
      }

      if (!category_id) {
        const [productRows] = await pool.query(
          "SELECT * FROM products WHERE id=?",
          [cart.product_id],
        );

        if (productRows.length > 0) {
          const product = productRows[0];
          category_id = product.category_id;

          const [categoryRows] = await pool.query(
            "SELECT * FROM category WHERE id=?",
            [category_id],
          );

          if (categoryRows.length > 0) {
            category_name = categoryRows[0].category_name;
          }
        }
      }
    }

    service_types = [...new Set(service_types)];
    vendor_ids = [...new Set(vendor_ids)];

    if (vendor_ids.length > 0) {
      const placeholders = vendor_ids.map(() => "?").join(",");
      const [vendorRows] = await pool.query(
        `SELECT * FROM vendor WHERE id IN (${placeholders}) LIMIT 1`,
        vendor_ids,
      );

      if (vendorRows.length > 0) {
        vendor_lat = vendorRows[0].lat;
        vendor_long = vendorRows[0].long;
      }
    }

    const [userAddressList] = await pool.query(
      "SELECT * FROM address WHERE user_id=? ORDER BY id DESC",
      [userid],
    );

    const userdata = userAddressList.map((addr) => {
      const distance = calculateDistance(
        addr.lat,
        addr.lang,
        vendor_lat,
        vendor_long,
      );

      return {
        ...addr,
        distance_km: Number(distance).toFixed(2),
      };
    });

    const [radiusRows] = await pool.query("SELECT * FROM nearby LIMIT 1");
    let allowed_radius = 0;
    if (radiusRows.length > 0 && radiusRows[0].redius) {
      allowed_radius =
        parseFloat(String(radiusRows[0].redius).replace(/[^0-9.]/g, "")) || 0;
    }

    let vendordata = [];
    if (vendor_ids.length > 0) {
      const placeholders = vendor_ids.map(() => "?").join(",");
      const [vendorAddressList] = await pool.query(
        `SELECT * FROM vendor_address WHERE vendor_id IN (${placeholders}) ORDER BY id DESC`,
        vendor_ids,
      );

      for (const vaddr of vendorAddressList) {
        let is_in_range = false;
        let nearest_distance = 0;

        for (const uaddr of userdata) {
          const distance = parseFloat(
            calculateDistance(uaddr.lat, uaddr.lang, vaddr.lat, vaddr.long),
          );

          if (distance <= allowed_radius) {
            is_in_range = true;
            nearest_distance = distance;
            break;
          }
        }

        if (is_in_range) {
          vendordata.push({
            ...vaddr,
            distance_km: parseFloat(nearest_distance).toFixed(2),
          });
        }
      }
    }

    let final_user = [];
    let final_vendor = [];

    if (service_types.includes("home")) {
      final_user = userdata;
    }
    if (service_types.includes("onsite")) {
      final_vendor = vendordata;
    }
    if (final_user.length === 0 && final_vendor.length === 0) {
      final_user = userdata;
    }

    let wallet = 0;
    const [userRows] = await pool.query("SELECT * FROM users WHERE id=?", [
      userid,
    ]);
    if (userRows.length > 0) {
      wallet = userRows[0].wallet;
    }

    const [deliveryChargeRows] = await pool.query(
      "SELECT * FROM delivery_charge_manage LIMIT 1",
    );
    let charge_km_Delivery = "0.00";
    let charge = 0;
    let charge_km = 0;

    if (deliveryChargeRows.length > 0) {
      charge = parseFloat(deliveryChargeRows[0].charge) || 0;
      charge_km = parseFloat(deliveryChargeRows[0].km) || 0;

      if (charge_km > 0) {
        let value = charge / charge_km;
        value = Math.floor(value * 100) / 100;
        charge_km_Delivery = value.toFixed(2);
      }
    }

    return res.json({
      result: true,
      msg: "Get Successfully",
      radius: `${allowed_radius} KM`,
      wallet: wallet,
      category_id: category_id,
      categoryName: category_name,
      charge: charge_km_Delivery ?? 0,
      charge_msg: `Delivery charges also apply: \u20b9${charge}/${charge_km}Km`,
      userdata: final_user,
      vendordata: final_vendor,
    });
  } catch (err) {
    console.error("getMyAddresses error:", err);
    return res.status(500).json({ result: false, msg: "Server Error" });
  }
}

async function timeSlots(req, res) {
  const { date, vendor_id, userid } = req.body;

  if (!date || !vendor_id || !userid) {
    return res.json({
      result: false,
      msg: "Required fields: date, vendor_id, userid",
    });
  }

  try {
    const [vendorRows] = await pool.query("SELECT * FROM vendor WHERE id=?", [
      vendor_id,
    ]);

    if (vendorRows.length === 0) {
      return res.json({ result: false, msg: "Invalid vendor_id" });
    }
    const vendor = vendorRows[0];

    let vendor_slot_ids = [];
    if (vendor.vendor_slote_id) {
      vendor_slot_ids = String(vendor.vendor_slote_id)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }

    if (vendor_slot_ids.length === 0) {
      return res.json({ result: false, msg: "No Slots Assigned To Vendor" });
    }

    const placeholders = vendor_slot_ids.map(() => "?").join(",");
    const [timeSlotRows] = await pool.query(
      `SELECT
            time_slote,
            id,
            DATE_FORMAT(time_slote, '%h:%i %p') as booking_time
         FROM time_slots
         WHERE id IN (${placeholders})`,
      vendor_slot_ids,
    );

    if (timeSlotRows.length === 0) {
      return res.json({ result: false, msg: "No Slots Found" });
    }

    const [bookedSlots] = await pool.query(
      `SELECT time_slote_id, date as booking_date
         FROM booking
         WHERE vendor_id=?
         AND (status = 0 OR status = 1)`,
      [vendor_id],
    );

    const running_time_slots = [];
    for (const booked of bookedSlots) {
      const bookedDateStr =
        booked.booking_date instanceof Date
          ? booked.booking_date.toISOString().slice(0, 10)
          : String(booked.booking_date);

      if (bookedDateStr == date) {
        running_time_slots.push(booked.time_slote_id);
      }
    }

    const current_date = new Date().toISOString().slice(0, 10);
    if (new Date(date).getTime() < new Date(current_date).getTime()) {
      return res.json({
        result: false,
        msg: "Please select the current date or a future date",
      });
    }

    const final_result = timeSlotRows.map((time) => ({
      time_slote: time.time_slote,
      id: time.id,
      booking_time: time.booking_time,
      is_booked: running_time_slots.includes(time.id) ? "true" : "false",
    }));

    const [userRows] = await pool.query("SELECT * FROM users WHERE id=?", [
      userid,
    ]);
    const user_wallet = userRows.length > 0 ? userRows[0] : null;

    const [cartItems] = await pool.query(
      "SELECT service_type FROM cart WHERE user_id=?",
      [userid],
    );

    const types = cartItems.map((c) => c.service_type);
    const uniqueTypes = [...new Set(types)];

    let finalServiceType;
    if (uniqueTypes.length === 1) {
      finalServiceType = uniqueTypes[0];
    } else {
      finalServiceType = "both";
    }

    return res.json({
      result: true,
      wallet: user_wallet ? user_wallet.wallet : null,
      selected_service_type: finalServiceType,
      data: final_result,
    });
  } catch (err) {
    console.error("timeSlots error:", err);
    return res.status(500).json({ result: false, msg: "Server Error" });
  }
}

async function getCouponCodes(req, res) {
  try {
    const { userid } = req.body;

    if (!userid) {
      return res.json({
        result: false,
        msg: "REQ: userid",
      });
    }

    const user = await UserModel.getUserById(userid);

    if (user.length === 0) {
      return res.json({
        result: false,
        msg: "Wrong userid",
      });
    }

    const cartRows = await UserModel.getCartProducts(userid);

    if (cartRows.length === 0) {
      return res.json({
        result: false,
        msg: "Cart Empty",
      });
    }

    const userProductIds = cartRows.map((item) => item.product_id);
    const userVendorIds = [...new Set(cartRows.map((item) => item.vendor_id))];

    const categories = await UserModel.getProductCategories(userProductIds);

    const userCategoryIds = [
      ...new Set(categories.map((item) => item.category_id)),
    ];

    const coupons = await UserModel.getActiveCoupons();

    const finalCoupons = [];

    for (const coupon of coupons) {
      if (coupon.user_type === "specific") continue;

      const couponCategoryIds = coupon.category_ids
        ? coupon.category_ids
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : [];

      const couponVendorIds = coupon.vendor_ids
        ? coupon.vendor_ids
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : [];

      const couponProductIds = coupon.product_ids
        ? coupon.product_ids
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : [];

      let categoryMatch = !coupon.category_ids;

      if (!categoryMatch) {
        categoryMatch = userCategoryIds.some((id) =>
          couponCategoryIds.includes(String(id)),
        );
      }

      if (!categoryMatch) continue;

      let vendorMatch = !coupon.vendor_ids;

      if (!vendorMatch) {
        vendorMatch = userVendorIds.some((id) =>
          couponVendorIds.includes(String(id)),
        );
      }

      if (!vendorMatch) continue;

      let productMatch = !coupon.product_ids;

      if (!productMatch) {
        productMatch = userProductIds.some((id) =>
          couponProductIds.includes(String(id)),
        );
      }

      if (!productMatch) continue;

      const applied = await UserModel.isCouponApplied(userid, coupon.id);

      coupon.is_applied = applied ? "true" : "false";

      finalCoupons.push(coupon);
    }

    if (finalCoupons.length > 0) {
      return res.json({
        result: true,
        msg: "Get Successfully",
        data: finalCoupons,
      });
    }

    return res.json({
      result: false,
      msg: "No Coupon Code Found",
    });
  } catch (err) {
    console.log("getCouponCodes Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function homeSignupLastDate(req, res) {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.json({
        data: false,
        msg: "Parameter user_id is required",
      });
    }

    const user = await UserModel.getUserLastLogin(user_id);

    if (user.length === 0) {
      return res.json({
        data: false,
        msg: "User not found",
      });
    }

    let timeDifference = "just now";

    if (user[0].last_login_date) {
      const lastLogin = new Date(user[0].last_login_date);
      const now = new Date();

      const diffSeconds = Math.floor((now - lastLogin) / 1000);

      timeDifference = formatTimeDifference(diffSeconds);
    }

    await UserModel.updateLastLogin(user_id, new Date(), timeDifference);

    return res.json({
      data: true,
      msg: "Login time updated successfully",
    });
  } catch (err) {
    console.log("homeSignupLastDate Error:", err);

    return res.status(500).json({
      data: false,
      msg: "Something Went Wrong",
    });
  }
}

async function getAiText(req, res) {
  try {
    const aiTexts = await UserModel.getAiText();

    if (aiTexts.length > 0) {
      return res.json({
        result: true,
        msg: "AI Text fetched successfully",
        data: aiTexts,
      });
    }

    return res.json({
      result: false,
      msg: "No AI Text found",
      data: [],
    });
  } catch (err) {
    console.log("getAiText Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
      data: [],
    });
  }
}

async function userLogout(req, res) {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.json({
        result: false,
        msg: "parameter required user_id",
      });
    }

    const logout = await UserModel.userLogout(user_id);

    if (logout) {
      return res.json({
        result: true,
        msg: "Logout from Application.",
      });
    }

    return res.json({
      result: false,
      msg: "something went wrong!!",
    });
  } catch (err) {
    console.log("userLogout Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function addAddress(req, res) {
  try {
    const { userid, address, lat, lang } = req.body;

    if (!userid || !address || !lat || !lang) {
      return res.json({
        result: false,
        msg: "REQ: userid, address, lat, lang",
      });
    }

    const response = await UserModel.addAddress({
      userid,
      address,
      lat,
      lang,
    });

    return res.json(response);
  } catch (err) {
    console.log("addAddress Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function getProfile(req, res) {
  try {
    const { userid } = req.body;

    if (!userid) {
      return res.json({
        result: "false",
        msg: "required: userid",
      });
    }

    const user = await UserModel.getProfile(userid);

    if (user) {
      return res.json({
        result: "true",
        path: `${baseUrl}/assets/images/`,
        msg: "get successfully",
        data: user,
      });
    }

    return res.json({
      result: "false",
      msg: "Data Not Found",
    });
  } catch (err) {
    console.log("getProfile Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function updateProfile(req, res) {
  try {
    const {
      userid,
      fname,
      lname,
      email,
      password,
      phone,
      country_code,
      post_code,
    } = req.body;

    if (!userid) {
      return res.json({
        result: "false",
        msg: "REQ: userid, OPTIONAL: (fname,lname,email,password,mobile,country_code,post_code,image)",
      });
    }

    const user = await UserModel.getProfile(userid);

    if (!user) {
      return res.json({
        result: "false",
        msg: "Wrong userid",
      });
    }

    let imageName = null;

    if (req.file) {
      imageName = req.file.filename;

      if (user.image) {
        const oldImage = path.join(__dirname, "../assets/images/", user.image);

        if (fs.existsSync(oldImage)) {
          fs.unlinkSync(oldImage);
        }
      }
    }

    const updateData = {};

    if (fname) updateData.fname = fname;
    if (lname) updateData.lname = lname;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (phone) updateData.mobile = phone;
    if (country_code) updateData.country_code = country_code;
    if (post_code) updateData.post_code = post_code;
    if (imageName) updateData.image = imageName;

    await UserModel.updateProfile(userid, updateData);

    return res.json({
      result: true,
      msg: "Updated Successfully",
    });
  } catch (err) {
    console.log("updateProfile Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function getWalletHistory(req, res) {
  try {
    const { user_id } = req.body;

    // Required validation
    if (!user_id) {
      return res.json({
        result: false,
        msg: "REQ: user_id",
        data: [],
      });
    }

    const walletData = await UserModel.getWalletHistory(user_id);

    // Wrong user ID
    if (!walletData.userExists) {
      return res.json({
        result: false,
        msg: "Wrong user_id",
        data: [],
      });
    }

    // No wallet history
    if (walletData.data.length === 0) {
      return res.json({
        result: false,
        msg: "No Wallet History Available",
        wallet_amount: walletData.walletAmount,
        data: [],
      });
    }

    // Success
    return res.json({
      result: true,
      msg: "Get Successfully",
      wallet_amount: walletData.walletAmount,
      data: walletData.data,
    });
  } catch (err) {
    console.error("getWalletHistory Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
      data: [],
    });
  }
}

async function changePassword(req, res) {
  try {
    const { user_id, old_password, new_password, confirm_password } = req.body;

    // Required parameters
    if (!user_id || !old_password || !new_password || !confirm_password) {
      return res.json({
        result: "false",
        msg: "Please provide parameters (user_id, old_password, new_password, confirm_password)",
      });
    }

    // Confirm password check
    if (new_password !== confirm_password) {
      return res.json({
        result: "false",
        msg: "New Password and Confirm Password Do Not Match",
      });
    }

    const result = await UserModel.changePassword(
      user_id,
      old_password,
      new_password,
    );

    // User not found
    if (!result.success && result.type === "USER_NOT_FOUND") {
      return res.json({
        result: "false",
        msg: "User Not Found",
      });
    }

    // Old password incorrect
    if (!result.success && result.type === "INCORRECT_OLD_PASSWORD") {
      return res.json({
        result: "false",
        msg: "Incorrect Old Password",
      });
    }

    // Update failed
    if (!result.success && result.type === "UPDATE_FAILED") {
      return res.json({
        result: "false",
        msg: "Password Could Not Be Changed, Please Try Again...",
      });
    }

    // Success
    return res.json({
      result: "true",
      msg: "Password Changed Successfully",
      userid: result.user.id,
      name: `${result.user.fname || ""} ${result.user.lname || ""}`.trim(),
      phone: result.user.mobile,
      status: result.user.status,

      // As per your old API
      new_password: result.newPassword,
    });
  } catch (err) {
    console.error("changePassword Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

// Add Contact Us
async function addContactUs(req, res) {
  try {
    const { user_id, title, description } = req.body;

    // Required parameters
    if (!user_id || !title || !description) {
      return res.json({
        result: "false",
        msg: "Parameter required: user_id, title, and description",
      });
    }

    // Add contact
    const result = await UserModel.addContactUs(user_id, title, description);

    // User not found
    if (!result.success && result.type === "USER_NOT_FOUND") {
      return res.json({
        result: "false",
        msg: "User not found",
      });
    }

    // Insert failed
    if (!result.success && result.type === "INSERT_FAILED") {
      return res.json({
        result: "false",
        msg: "Failed to submit contact details, please try again",
      });
    }

    // Success
    return res.json({
      result: "true",
      msg: "Contact details submitted successfully",
      data: result.data,
    });
  } catch (err) {
    console.error("addContactUs Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function appRatingReview(req, res) {
  try {
    const ratingReview = await UserModel.getAppRatingReview();

    if (ratingReview.length > 0) {
      return res.json({
        result: "true",
        msg: "get successfully",
        data: ratingReview,
      });
    }

    return res.json({
      result: "false",
      msg: "No Data Found",
    });
  } catch (err) {
    console.error("appRatingReview Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function getFaq(req, res) {
  try {
    const faq = await UserModel.getFaq();

    if (faq.length > 0) {
      return res.json({
        result: "true",
        msg: "get successfully",
        data: faq,
      });
    }

    return res.json({
      result: "false",
      msg: "Data Not Found",
    });
  } catch (err) {
    console.error("getFaq Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function aboutCompany(req, res) {
  try {
    const companyData = await UserModel.getAboutCompany();

    return res.json({
      result: "true",
      privacy_policy: companyData.privacy_policy,
      terms_conditions: companyData.terms_conditions,
      about_us: companyData.about_us,
    });
  } catch (err) {
    console.error("aboutCompany Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function contactUs(req, res) {
  try {
    const contactData = await UserModel.getContactUs();

    if (contactData.length > 0) {
      return res.json({
        result: "true",
        data: contactData[0],
      });
    }

    return res.json({
      result: "false",
      msg: "data not found",
    });
  } catch (err) {
    console.error("contactUs Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function saveAppReview(req, res) {
  try {
    const { userid, rating, msg } = req.body;

    if (!userid || !rating) {
      return res.json({
        result: false,
        msg: "Req: userid, rating OPTIONAL(msg)",
      });
    }

    const result = await UserModel.saveAppReview(userid, rating, msg);

    if (!result.success && result.type === "WRONG_USERID") {
      return res.json({
        result: false,
        msg: "Wrong userid",
      });
    }

    if (!result.success && result.type === "INSERT_FAILED") {
      return res.json({
        result: false,
        msg: "Failed to save feedback",
      });
    }

    if (!result.success && result.type === "NOTIFICATION_FAILED") {
      return res.json({
        result: false,
        msg: "Failed to save feedback",
      });
    }

    if (result.fcm_id) {
      let notificationTitle;
      let notificationBody;

      if (Number(rating) >= 4) {
        notificationTitle = "Thank you for your feedback!";

        notificationBody = "We’re glad you’re enjoying our service.";
      } else {
        notificationTitle = "Thanks for your review";

        notificationBody = "We’ll use your feedback to improve our services.";
      }

      const notification = {
        title: notificationTitle,
        body: notificationBody,
      };

      const notificationSent = await sendNotification(
        notification,
        result.fcm_id,
      );

      console.log("Review Notification Status:", notificationSent);
    }

    return res.json({
      result: true,
      msg: "Success",
    });
  } catch (err) {
    console.error("saveAppReview Error:", err);

    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function nearbyBookings(req, res) {
  try {
    const { user_id, lat, lang } = req.body;

    // Required validation
    if (!user_id || !lat || !lang) {
      return res.json({
        result: "false",
        msg: "Please provide parameters(user_id,lat,lang)",
      });
    }

    const radius = 5000; // in km

    const completedBooking = await UserModel.getNearbyBookings(
      user_id,
      lat,
      lang,
      radius,
    );

    const TEMP = {
      count: completedBooking,
      msg: `Total Booking Near by ${radius} km`,
    };

    return res.json({
      result: "true",
      data: TEMP,
    });
  } catch (err) {
    console.error("nearbyBookings Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function getTestimonials(req, res) {
  try {
    const { user_id } = req.body;

    // Required validation
    if (!user_id) {
      return res.json({
        result: "false",
        msg: "Req: (user_id)",
      });
    }

    const testimonials = await UserModel.getTestimonials();

    if (testimonials.length > 0) {
      return res.json({
        result: "true",
        msg: "get successfully",
        data: testimonials,
      });
    }

    return res.json({
      result: "false",
      msg: "No Data Found",
    });
  } catch (err) {
    console.error("getTestimonials Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function getExpertVideos(req, res) {
  try {
    const { vendor_id } = req.body;

    if (!vendor_id) {
      return res.json({
        result: "false",
        msg: "REQ: vendor_id",
      });
    }

    const [vendor] = await pool.query(
      `
      SELECT *
      FROM vendor
      WHERE id = ?
      `,
      [vendor_id],
    );

    if (vendor.length === 0) {
      return res.json({
        result: "false",
        msg: "Wrong vendor_id",
      });
    }

    const finalData = await UserModel.getExpertVideos(vendor_id);

    if (finalData.length === 0) {
      return res.json({
        result: "false",
        msg: "No Data Found",
      });
    }

    return res.json({
      result: "true",
      msg: "Get Successfully",
      data: finalData,
    });
  } catch (err) {
    console.error("getExpertVideos Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function getScatByVendor(req, res) {
  try {
    const { vendor_id } = req.body;

    if (!vendor_id) {
      return res.json({
        result: "false",
        msg: "Please provide the parameter (vendor_id)",
      });
    }

    const result = await UserModel.getScatByVendor(vendor_id);

    if (result.status === "wrong_vendor") {
      return res.json({
        result: "false",
        msg: "Wrong vendor_id",
      });
    }

    if (result.status === "no_data") {
      return res.json({
        result: "false",
        msg: "No data found",
      });
    }

    if (result.status === "no_services") {
      return res.json({
        result: "false",
        msg: "No services created for the vendor",
      });
    }

    if (result.status === "no_subcategories") {
      return res.json({
        result: "false",
        msg: "No subcategories found for the vendor",
      });
    }

    return res.json({
      result: "true",
      path: `${process.env.BASE_URL || ""}/assets/images/`,
      msg: "Data retrieved successfully",
      facebook_ink: result.facebook_ink,
      vendor_mobile: result.vendor_mobile,
      data: result.data,
    });
  } catch (err) {
    console.error("getScatByVendor Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function vendorRatingReview(req, res) {
  try {
    const { vendor_id } = req.body;

    if (!vendor_id) {
      return res.json({
        result: "false",
        msg: "Please provide parameters(vendor_id)",
      });
    }

    const ratingReview = await UserModel.getVendorRatingReview(vendor_id);

    if (ratingReview.length > 0) {
      return res.json({
        result: "true",
        msg: "get successfully",
        data: ratingReview,
      });
    }

    return res.json({
      result: "false",
      msg: "No Data Found",
    });
  } catch (err) {
    console.error("vendorRatingReview Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function deleteCart(req, res) {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.json({
        result: "false",
        msg: "param required user_id",
      });
    }

    const result = await UserModel.deleteCart(user_id);

    if (result) {
      return res.json({
        result: "true",
        msg: "Deleted from cart",
      });
    }

    return res.json({
      result: "true",
      msg: "Somethings went Wrong",
    });
  } catch (err) {
    console.error("deleteCart Error:", err);

    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function applyCoupon(req, res) {
  try {
    const { userid, coupon_code_id } = req.body;

    if (!userid || !coupon_code_id) {
      return res.json({
        result: false,
        msg: "userid & coupon_code_id required",
      });
    }

    const users = await UserModel.findById(userid);

    if (!users || users.length === 0) {
      return res.json({
        result: false,
        msg: "Invalid user",
      });
    }

    const cart = await UserModel.getCartByUserId(userid);

    if (cart.length === 0) {
      return res.json({
        result: false,
        msg: "Cart empty",
      });
    }

    let coupon;

    if (!isNaN(coupon_code_id)) {
      coupon = await UserModel.getCouponById(coupon_code_id);
    } else {
      coupon = await UserModel.getCouponByCode(coupon_code_id);
    }

    if (!coupon) {
      return res.json({
        result: false,
        msg: "Coupon not found",
      });
    }

    const alreadyApplied = await UserModel.checkCouponApplied(
      userid,
      coupon.id,
    );

    if (alreadyApplied.length > 0) {
      return res.json({
        result: false,
        msg: "Coupon already applied",
      });
    }

    const couponProducts = coupon.product_ids
      ? coupon.product_ids.split(",").filter(Boolean)
      : [];

    const couponVendors = coupon.vendor_ids
      ? coupon.vendor_ids.split(",").filter(Boolean)
      : [];

    const couponCategories = coupon.category_ids
      ? coupon.category_ids.split(",").filter(Boolean)
      : [];

    let total = 0;

    for (const item of cart) {
      const pid = String(item.product_id);
      const vid = String(item.vendor_id);
      const cid = String(item.category_id);

      total += Number(item.final_amount);

      let productMatch = false;
      let vendorMatch = false;
      let categoryMatch = false;

      if (couponProducts.length > 0 && couponProducts.includes(pid)) {
        productMatch = true;
      }

      if (couponVendors.length > 0 && couponVendors.includes(vid)) {
        vendorMatch = true;
      }

      if (couponCategories.length > 0 && couponCategories.includes(cid)) {
        categoryMatch = true;
      }

      if (
        couponProducts.length > 0 ||
        couponVendors.length > 0 ||
        couponCategories.length > 0
      ) {
        if (!productMatch && !vendorMatch && !categoryMatch) {
          return res.json({
            result: false,
            msg: "Coupon not valid for selected cart items",
          });
        }
      }
    }

    if (coupon.min_amount && total < coupon.min_amount) {
      return res.json({
        result: false,
        msg: "Minimum order not reached",
      });
    }

    let discount = 0;

    if (coupon.discount_type === "percentage") {
      discount = (total * coupon.cupon_price) / 100;
    } else {
      discount = Number(coupon.cupon_price);
    }

    const finalAmount = Math.max(0, total - discount);

    await UserModel.deleteAppliedCoupon(userid, coupon.id);
    await UserModel.insertAppliedCoupon(userid, coupon.id, coupon.code);
    await UserModel.updateCartCoupon(userid, coupon.id);

    return res.json({
      result: true,
      msg: "Coupon applied successfully",
      data: {
        total_amount: total,
        discount: discount,
        final_amount: finalAmount,
      },
    });
  } catch (err) {
    console.error("applyCoupon Error:", err);
    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function removeCoupon(req, res) {
  try {
    const { userid } = req.body;

    if (!userid) {
      return res.json({
        result: "false",
        msg: "Please provide parameters(userid)",
      });
    }

    await UserModel.removeCouponFromCart(userid);

    return res.json({
      result: "true",
      msg: "Coupon Code Removed",
    });
  } catch (err) {
    console.error("removeCoupon Error:", err);
    return res.status(500).json({
      result: "false",
      msg: "Something Went Wrong",
    });
  }
}

async function checkCartVendorInRange(req, res) {
  try {
    const { user_id, address_id } = req.body;

    if (!user_id || !address_id) {
      return res.json({
        result: false,
        msg: "REQ: user_id, address_id",
      });
    }

    const address = await UserModel.getAddressByIdAndUser(address_id, user_id);

    if (!address) {
      return res.json({
        result: false,
        msg: "Invalid address_id",
      });
    }

    const cartItems = await UserModel.getCartItemsByUser(user_id);

    if (cartItems.length === 0) {
      return res.json({
        result: false,
        msg: "Cart is empty",
      });
    }

    const userLat = address.lat;
    const userLng = address.lang;

    const radiusRow = await UserModel.getDeliveryRadius();

    const radius = radiusRow
      ? parseFloat(String(radiusRow.redius).replace(" KM", ""))
      : 0;

    let vendorAvailable = false;
    let vendorDetails = {};

    for (const cart of cartItems) {
      const vendor = await UserModel.getApprovedVendorById(cart.vendor_id);

      if (!vendor) {
        continue;
      }

      const distance = calculateDistanceUser(
        userLat,
        userLng,
        vendor.lat,
        vendor.long,
      );

      if (distance <= radius) {
        vendorAvailable = true;

        vendorDetails = {
          vendor_id: vendor.id,
          vendor_name: vendor.business_name,
          vendor_lat: vendor.lat,
          vendor_long: vendor.long,
          distance: `${distance.toFixed(2)} KM`,
          delivery_range: `${radius} KM`,
        };

        break;
      }
    }

    return res.json({
      result: true,
      vendor_available: vendorAvailable,
      msg: vendorAvailable
        ? "Vendor Available In Range"
        : "Vendor Out Of Delivery Range",
      // data: vendorDetails
    });
  } catch (err) {
    console.error("checkCartVendorInRange Error:", err);
    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function newPaymentProcess(req, res) {
  try {
    const { userid, amount, currency } = req.body;

    if (!userid || !amount || !currency) {
      return res.json({
        status: false,
        message: "Missing required fields: userid, amount, currency",
      });
    }

    const user = await UserModel.findUserByIdForPayment(userid);

    if (!user) {
      return res.json({
        status: false,
        message: "User not found",
      });
    }

    const userEmail = user.email;

    try {
      const customer = await stripe.customers.create({
        description: "Customer for stripe",
        email: userEmail,
      });

      let paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        customer: customer.id,
        automatic_payment_methods: { enabled: true },
      });

      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: "2020-08-27" },
      );

      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);

      const transactionId = paymentIntent ? paymentIntent.id : null;

      const data = {
        userid: userid,
        amount: amount,
        currency: currency,
        status: "success",
        response: JSON.stringify(paymentIntent),
        created_on: getCurrentDateTime(),
      };

      const paymentId = await UserModel.insertSquarePayment(data);
      return res.json({
        status: "success",
        message: "Payment Intent Created Successfully",
        publishKey: process.env.STRIPE_PUBLISHABLE_KEY,
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        payment_id: paymentId,
        transaction_id: transactionId,
      });
    } catch (stripeError) {
      const data = {
        userid: userid,
        amount: amount,
        currency: currency,
        status: "failed",
        response: JSON.stringify({ error: stripeError.message }),
        created_on: getCurrentDateTime(),
      };

      await UserModel.insertSquarePayment(data);

      return res.json({
        status: "error",
        message: stripeError.message,
      });
    }
  } catch (err) {
    console.error("newPaymentProcess Error:", err);
    return res.status(500).json({
      status: false,
      message: "Something Went Wrong",
    });
  }
}

async function ServicesbookNow(req, res) {
  try {
    const body = req.body;

    const {
      vendor_id,
      userid,
      transaction_id,
      amount,
      product_id,
      cat_id,
      wallet_type,
      address_id,
      vendor_address_id,
      time_slote_id,
      pickup_type,
      DeliveryCharge,
      date,
      onsite_date,
      onsite_time_slote_id,
      service_type,
      totalAmount,
      qty,
    } = body;

    if (
      !vendor_id ||
      !userid ||
      !transaction_id ||
      !amount ||
      !product_id ||
      !cat_id ||
      !wallet_type
    ) {
      return res.json({
        result: false,
        msg: "REQ: vendor_id,address_id,date,time_slote_id,userid,transaction_id,amount, cat_id,lat,lang,product_id",
      });
    }

    const userRow = await UserModel.getUserRawById(userid);
    if (!userRow) {
      return res.json({ result: false, msg: "Wrong userid" });
    }

    const vendorRow = await UserModel.getVendorRawById(vendor_id);
    if (!vendorRow) {
      return res.json({ result: false, msg: "Wrong vendor_id" });
    }

    const existingCart = await UserModel.getCartCountByUser(userid);

    if (existingCart.length === 0) {
      let directProducts = product_id;
      directProducts = Array.isArray(directProducts)
        ? directProducts
        : String(directProducts).split(",");
      directProducts = directProducts.map((v) => v.trim()).filter(Boolean);

      let directQtys = qty;
      directQtys = Array.isArray(directQtys)
        ? directQtys
        : directQtys
          ? [directQtys]
          : [];

      for (let index = 0; index < directProducts.length; index++) {
        const pid = directProducts[index];

        const directProduct = await UserModel.getProductById(pid);
        if (!directProduct) continue;

        const directQty =
          directQtys[index] !== undefined ? directQtys[index] : 1;

        const dbDirect = {
          user_id: userid,
          vendor_id: vendor_id,
          product_id: pid,
          name: directProduct.product_name,
          image: directProduct.image,
          price: directProduct.rate,
          quantity: directQty,
        };

        if (service_type) {
          dbDirect.service_type = service_type;
        }

        const directTotal = Number(directQty) * Number(directProduct.rate);
        dbDirect.total_amount = directTotal;
        dbDirect.final_amount = directTotal;

        await UserModel.insertCartItem(dbDirect);
      }
    }

    const cartCheck = await UserModel.getCartCountByUser(userid);
    if (cartCheck.length === 0) {
      return res.json({
        result: false,
        msg: "Wrong Please Add Some Item in Cart Before Book Now",
      });
    }

    const cartData = await UserModel.getCartWithProductRate(userid);

    let productIdStr = product_id;
    if (Array.isArray(productIdStr)) {
      productIdStr = productIdStr.join(",");
    }

    const paymentData = {
      transaction: transaction_id,
      amount: amount,
      userid: userid,
    };
    const payment_id = await UserModel.insertPaymentDetails(paymentData);

    const otp = Math.floor(1000 + Math.random() * 9000);

    const B = {
      booking_uniqe_id: generateBookingUniqueId(),
      userid: userid,
      date: date || null,
      time_slote_id: time_slote_id || null,
      payment_id: payment_id,
      cart_meta_data: JSON.stringify(cartData),
      cat_id: cat_id,
      vendor_id: vendor_id,
      otp: otp,
      product_id: productIdStr,
      pending_date: todayDate(),
    };

    if (address_id !== "" && address_id !== undefined && address_id !== null) {
      B.address_id = address_id;
    }
    if (
      vendor_address_id !== "" &&
      vendor_address_id !== undefined &&
      vendor_address_id !== null
    ) {
      B.vendor_address_id = vendor_address_id;
    }
    if (
      pickup_type !== "" &&
      pickup_type !== undefined &&
      pickup_type !== null
    ) {
      B.pickup_type = pickup_type;
    }
    if (
      DeliveryCharge !== "" &&
      DeliveryCharge !== undefined &&
      DeliveryCharge !== null
    ) {
      B.DeliveryCharge = DeliveryCharge;
    }
    if (
      onsite_date !== "" &&
      onsite_date !== undefined &&
      onsite_date !== null
    ) {
      B.onsite_date = onsite_date;
    }
    if (
      onsite_time_slote_id !== "" &&
      onsite_time_slote_id !== undefined &&
      onsite_time_slote_id !== null
    ) {
      B.onsite_time_slote_id = onsite_time_slote_id;
    }

    const fetchAddress = await UserModel.getAddressLatLng(address_id);

    B.lat = fetchAddress ? fetchAddress.lat : null;
    B.lang = fetchAddress ? fetchAddress.lang : null;

    const userWallet = userRow.wallet || 0;

    let walletAmount = 0;
    let payable_amount = totalAmount;

    if (wallet_type === "true") {
      walletAmount = Math.min(userWallet, totalAmount);
      payable_amount = totalAmount - walletAmount;

      if (walletAmount > 0) {
        await UserModel.decrementUserWallet(userid, walletAmount);

        await UserModel.insertWalletDetail(
          userid,
          walletAmount,
          undefined,
          "debit",
        );
      }
    }

    B.total_amount = totalAmount;
    B.walletAmount = walletAmount;
    B.payable_amount = payable_amount;

    const booking_id = await UserModel.insertBooking(B);
    const cartTotal = await UserModel.getCartFinalAmountSum(userid);

    if (cartTotal > 0) {
      const cashbackAmount = (cartTotal * 2) / 100;

      await UserModel.insertWalletDetail(
        userid,
        Number(cashbackAmount).toFixed(2),
        undefined,
        "credit",
      );

      const userWalletRow = await UserModel.getUserWalletOnly(userid);

      if (userWalletRow) {
        const newBalance =
          Number(userWalletRow.wallet) + Number(cashbackAmount);
        await UserModel.updateUserWalletBalance(userid, newBalance);
      }
    }

    const bookingCount = await UserModel.countUserBookings(userid);

    if (bookingCount === 1) {
      await UserModel.updateBookingReferralDiscount(booking_id);
    }

    await UserModel.updatePaymentDetailsBookingId(payment_id, booking_id);

    await UserModel.deleteCart(userid);

    const booking = await UserModel.getBookingById(booking_id);

    if (!booking) {
      return res.json({ result: false, msg: "Something Went Wrong" });
    }

    const userDetails = await UserModel.getUserEmailDetails(userid);

    let fname = "";
    let email_id = "";

    if (userDetails) {
      fname = userDetails.fname;
      email_id = userDetails.email;
    }

    const addressDetails = await UserModel.getAddressDetails(
      booking.address_id,
    );

    let productRows = "";
    let subtotal = 0;

    if (booking.cart_meta_data) {
      const items = JSON.parse(booking.cart_meta_data);

      for (const item of items) {
        const name = item.name || "Service";
        const itemQty = item.quantity || 1;
        const price = item.final_amount || 0;
        subtotal += Number(price);

        productRows += `
        <tr>
            <td style='padding: 10px; border-bottom: 1px solid #ddd;'>${name}</td>
            <td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: center;'>${itemQty}</td>
            <td style='padding: 10px; border-bottom: 1px solid #ddd; text-align: right;'>$${Number(
              price,
            ).toFixed(2)}</td>
        </tr>`;
      }
    }

    /* =========================
       EMAIL HTML
    ========================= */
    const subject =
      "Order Confirmed! - bHyyve Order #" + booking.booking_uniqe_id;

    let addressHtml = "";
    if (addressDetails) {
      addressHtml = `<p><strong>Shipping Address:</strong><br>
                ${fname}<br>
                ${addressDetails.address}<br>
                ${addressDetails.city}, ${addressDetails.state} ${addressDetails.pin_code}<br>
                </p>`;
    }

    const orderDate = new Date(booking.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const message = `
<!DOCTYPE html>
<html>
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <style>
       body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
       .container { max-width: 600px; margin: 0 auto; padding: 20px; }
       .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
       .header h1 { margin: 0; font-size: 24px; }
       .content { background-color: #ffffff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
       .order-info { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
       .order-info p { margin: 5px 0; }
       .order-summary { width: 100%; border-collapse: collapse; margin: 20px 0; }
       .order-summary th { background-color: #f2f2f2; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
       .order-summary td { padding: 12px; border-bottom: 1px solid #ddd; }
       .total-section { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; color: #4CAF50; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
       .footer { margin-top: 30px; padding: 20px; text-align: center; background-color: #f9f9f9; border-radius: 5px; font-size: 14px; color: #666; }
       .footer a { color: #4CAF50; text-decoration: none; margin: 0 10px; }
       hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
   </style>
</head>
<body>
   <div class="container">
       <div class="header">
           <h1><span style="color:#4CAF50;">&#10004;</span> Order Confirmed!</h1>
       </div>
       <div class="content">
           <p style="font-size: 16px;">Hi ${fname},</p>
           <div class="order-info">
               <p><strong>Order Number:</strong> ${booking.booking_uniqe_id}</p>
               <p><strong>Order Date:</strong> ${orderDate}</p>
               <p><strong>Payment Method:</strong> ${booking.payment_type || "Online"}</p>
               ${addressHtml}
           </div>
           <h3 style="margin-top: 30px;">Order Summary</h3>
           <table class="order-summary">
               <thead>
                   <tr><th>Product</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Price</th></tr>
               </thead>
               <tbody>${productRows}</tbody>
           </table>
           <div class="total-section">
               <strong>Total: $${Number(booking.total_amount).toFixed(2)}</strong>
           </div>
           <hr>
           <p style="margin-top: 20px;">If you need to make changes to your order or have any questions, please contact our support team at <a href="mailto:support@bhyyve.com" style="color: #4CAF50;">support@bhyyve.com</a> and reference your order number above.</p>
           <p>We'll notify you once your order has shipped, along with tracking information so you can follow its progress.</p>
           <p style="margin-top: 30px;">Thank you again for shopping with bHyyve — we're grateful to have you as a customer.</p>
           <p style="margin-top: 30px;">Warm regards,<br><strong>The bHyyve Team</strong></p>
           <div class="footer">
               <a href="https://bhyyve.com">www.bhyyve.com</a> |
               <a href="mailto:support@bhyyve.com">support@bhyyve.com</a> |
               <a href="tel:+919876543210">+91-9876543210</a>
           </div>
       </div>
   </div>
</body>
</html>`;

    if (email_id) {
      await bhiveSendSmtpMail({
        to: email_id,
        subject,
        htmlBody: message,
        fromEmail: "bhyyve@gmail.com",
        fromName: "bHyyve",
        smtpUser: process.env.SMTP_USER,
        smtpPass: process.env.SMTP_PASS,
      });
    } else {
      console.log("User email not found, skipping confirmation mail");
    }
    //FINAL RESPONSE + NOTIFICATIONS

    if (booking_id) {
      await onBooked(userRow, vendorRow, booking_id, otp);

      return res.json({
        result: true,
        msg: "Booked Successfully",
      });
    } else {
      return res.json({
        result: false,
        msg: "Something Went Wrong",
      });
    }
  } catch (err) {
    console.error("bookNow Error:", err);
    return res.status(500).json({
      result: false,
      msg: "Something Went Wrong",
    });
  }
}

async function categoryByUserSubcategoryList(req, res) {
  try {
    const { category_id } = req.body;

    if (!category_id) {
      return res.json({
        result: "false",
        msg: "Required parameter: category_id",
      });
    }

    const category_data = await UserModel.getCategoryById(category_id);

    if (!category_data) {
      return res.json({
        result: "false",
        msg: "Category not found",
      });
    }

    const sub_category_data =
      await UserModel.getSubCategoriesByCategoryId(category_id);

    return res.json({
      result: "true",
      msg: "Category and sub-category fetched successfully",
      data: {
        category: category_data,
        sub_category: sub_category_data,
      },
    });
  } catch (error) {
    console.error("categoryByUserSubcategoryList Error:", error);
    return res.status(500).json({
      result: "false",
      msg: "Something went wrong",
    });
  }
}

async function getUpcomingBooking(req, res) {
  try {
    const { userid } = req.body;

    if (!userid) {
      return res.json({ result: false, msg: "REQ: userid" });
    }

    const user_data = await UserModel.getUserRawById(userid);
    if (!user_data) {
      return res.json({ result: false, msg: "Wrong userid" });
    }

    let final_data = [];

    // ══════════════ SERVICE BOOKINGS ══════════════
    const booking_rows = await UserModel.getUpcomingServiceBookings(userid);

    for (const book_row of booking_rows) {
      let CART = [];
      try {
        CART =
          typeof book_row.cart_meta_data === "string"
            ? JSON.parse(book_row.cart_meta_data)
            : book_row.cart_meta_data || [];
      } catch (e) {
        CART = [];
      }
      if (!Array.isArray(CART)) CART = [];

      let TOTAL_AMOUNT = 0;
      let total_quantity = 0;
      const product_names = [];
      let coupon_discount_percentage = 0;

      for (const value of CART) {
        const item_amount = parseFloat(value.final_amount || 0);
        const quantity = parseFloat(value.quantity || 1);

        total_quantity += quantity;

        let warranty_amount = 0;
        const warrenty_status = parseInt(value.warrenty_status || 0);
        const product_id = value.product_id || null;

        if (warrenty_status === 1 && product_id) {
          const warranty_price =
            await UserModel.getWarrantyPriceByProductId(product_id);
          if (warranty_price !== null) {
            warranty_amount = parseFloat(warranty_price) * quantity;
          }
        }

        TOTAL_AMOUNT += item_amount + warranty_amount;

        if (value.name) {
          product_names.push(value.name);
        }

        if (value.coupon_id) {
          const cupon_price = await UserModel.getCouponPriceById(
            value.coupon_id,
          );
          if (cupon_price !== null) {
            coupon_discount_percentage = parseFloat(cupon_price);
          }
        }
      }

      const discount_amount = 0;
      const DISCOUNT_PERCENT = 0;

      const amount_after_discount = TOTAL_AMOUNT - discount_amount;
      const hst_amount = (amount_after_discount * 13) / 100;
      const final_total = hst_amount + TOTAL_AMOUNT;

      book_row.product_names = product_names.join(", ");
      book_row.item_count = parseInt(total_quantity);
      book_row.item_total = TOTAL_AMOUNT.toFixed(2);
      book_row.hst = "13%";
      book_row.referral_discount =
        discount_amount > 0 ? `${DISCOUNT_PERCENT}%` : "0%";
      book_row.referral_amount = discount_amount.toFixed(2);
      book_row.hst_amount = hst_amount.toFixed(2);
      book_row.total_amount = final_total.toFixed(2);
      book_row.booking_type = "service";

      final_data.push(book_row);
    }

    // ══════════════ RESTAURANT ORDERS ══════════════
    const restaurant_rows = await UserModel.getUpcomingRestaurantOrders(userid);

    for (const row of restaurant_rows) {
      let CART = [];
      try {
        CART =
          typeof row.cart_meta_data === "string"
            ? JSON.parse(row.cart_meta_data)
            : row.cart_meta_data || [];
      } catch (e) {
        CART = [];
      }
      if (!Array.isArray(CART)) CART = [];

      let total_quantity = 0;
      const product_names = [];
      const subtotal = parseFloat(row.subtotal || 0);

      for (const item of CART) {
        total_quantity += parseInt(item.quantity || 1);
        if (item.item_name) {
          product_names.push(item.item_name);
        }
      }

      let coupon_discount_pct = 0;
      let coupon_discount_amt = 0;

      if (row.coupon_applied && row.coupon_applied == 1 && row.coupon_id) {
        const cpn = await UserModel.getRestaurantCouponById(row.coupon_id);
        if (cpn) {
          if ((cpn.discount_type || "percent") === "percent") {
            coupon_discount_pct = parseFloat(cpn.cupon_price);
            coupon_discount_amt = (subtotal * coupon_discount_pct) / 100;
          } else {
            coupon_discount_amt = parseFloat(cpn.cupon_price);
            coupon_discount_pct =
              subtotal > 0
                ? Math.round((coupon_discount_amt / subtotal) * 100 * 100) / 100
                : 0;
          }
        }
      }

      const amount_after_discount = subtotal - coupon_discount_amt;
      const hst_amount = (amount_after_discount * 13) / 100;
      const final_total = amount_after_discount + hst_amount;

      const delivery_charge = 5;

      let delivery_charge_amount;
      if (row.order_booking_type && row.order_booking_type === "Delivery") {
        delivery_charge_amount = final_total + delivery_charge;
      } else {
        delivery_charge_amount = final_total;
      }

      row.item_count = parseInt(total_quantity);
      row.product_names = product_names.join(", ");
      row.item_total = subtotal.toFixed(2);
      row.hst = "13%";
      row.referral_discount =
        coupon_discount_pct > 0 ? `${coupon_discount_pct}%` : "0%";
      row.referral_amount = coupon_discount_amt.toFixed(2);
      row.hst_amount = hst_amount.toFixed(2);
      row.total_amount = delivery_charge_amount.toFixed(2);

      delete row.subtotal;
      delete row.raw_total;
      delete row.wallet_used;
      delete row.coupon_id;
      delete row.coupon_applied;

      final_data.push(row);
    }

    // ══════════════ MERGE + SORT (latest first) ══════════════
    if (final_data.length > 0) {
      final_data.sort((a, b) => {
        const dt_a = a.sort_datetime || "1970-01-01 00:00:00";
        const dt_b = b.sort_datetime || "1970-01-01 00:00:00";

        const ts_a = new Date(dt_a).getTime();
        const ts_b = new Date(dt_b).getTime();

        return ts_b - ts_a; // DESC — latest first
      });
    }

    final_data = final_data.map((row) => {
      const { sort_datetime, ...rest } = row;
      return rest;
    });

    if (final_data.length > 0) {
      return res.json({
        result: true,
        msg: "Get Successfully",
        data: final_data,
      });
    } else {
      return res.json({
        result: false,
        msg: "No Booking Yet",
      });
    }
  } catch (error) {
    console.error("getUpcomingBooking Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function getCompletedBooking(req, res) {
  try {
    const userid = req.body.userid;

    if (!userid) {
      return res.json({ result: false, msg: "REQ: userid" });
    }

    const user_data = await UserModel.getUserRawById(userid);
    if (!user_data) {
      return res.json({ result: false, msg: "Wrong userid" });
    }

    let final_data = [];

    // ══════════════ SERVICE BOOKINGS ══════════════
    const service_rows = await UserModel.getCompletedServiceBookings(userid);

    for (const book_row of service_rows) {
      let CART = [];
      try {
        CART =
          typeof book_row.cart_meta_data === "string"
            ? JSON.parse(book_row.cart_meta_data)
            : book_row.cart_meta_data || [];
      } catch (e) {
        CART = [];
      }
      if (!Array.isArray(CART)) CART = [];

      let TOTAL_AMOUNT = 0;
      const product_list = [];
      let COUPON_ID = 0;
      let last_value = null; // PHP me loop ke bahar $value use ho raha tha, wahi behavior yahan bhi rakha hai

      for (const value of CART) {
        if (value.coupon_id) {
          COUPON_ID = value.coupon_id;
        }

        const item_amount = parseFloat(value.final_amount || 0);
        const quantity = parseFloat(value.quantity || 1);

        let warranty_amount = 0;
        const warrenty_status = parseInt(value.warrenty_status || 0);
        const product_id = value.product_id || null;

        if (warrenty_status === 1 && product_id) {
          const warranty_price =
            await UserModel.getWarrantyPriceByProductId(product_id);
          if (warranty_price !== null) {
            warranty_amount = parseFloat(warranty_price) * quantity;
          }
        }

        TOTAL_AMOUNT += item_amount + warranty_amount;

        const TEMP = {
          product_id: value.product_id || "",
          name: value.name || "",
          image: value.image || "",
          quantity: value.quantity || "",
          final_amount: parseFloat(value.final_amount || 0).toFixed(2),
          addon_price: value.addon_price || 0,
          addons: [],
        };

        if (value.addon) {
          const addons = await UserModel.getAddonProductsByIds(value.addon);
          if (addons.length > 0) {
            TEMP.addons = addons;
          }
        }

        product_list.push(TEMP);
        last_value = value;
      }

      let discount = 0;

      if (COUPON_ID > 0) {
        const coupon = await UserModel.getCouponById(COUPON_ID);
        if (coupon) {
          discount = parseFloat(coupon.cupon_price);
        }
      }

      const discount_amount = (TOTAL_AMOUNT * discount) / 100;

      let ref_amount = 0;

      // PHP wale code me yeh loop ke bahar, last $value ke product_id se product fetch hota tha
      let product_rate = 0;
      if (last_value && last_value.product_id) {
        const product_detail = await UserModel.getProductById(
          last_value.product_id,
        );
        if (product_detail) {
          product_rate = parseFloat(product_detail.rate);
        }
      }

      if (book_row.referral_discount == 1) {
        ref_amount = (product_rate * 10) / 100;
      }

      const gst_base = TOTAL_AMOUNT - discount_amount;
      const gst_amount = (gst_base * 13) / 100;
      const final = gst_base + gst_amount;

      book_row.product_list = product_list;
      book_row.item_count = CART.length;
      book_row.total_amount = final.toFixed(2);
      book_row.referral_discount_amount = ref_amount.toFixed(2);
      book_row.referral_discount_string =
        ref_amount > 0 ? "10% Referral Discount Applied" : "";

      book_row.hst = "13%";
      book_row.hst_amount = gst_amount.toFixed(2);
      book_row.discount = discount;
      book_row.item_total = final.toFixed(2);

      final_data.push(book_row);
    }

    // ══════════════ RESTAURANT ORDERS ══════════════
    const restaurant_rows =
      await UserModel.getCompletedRestaurantOrders(userid);

    for (const row of restaurant_rows) {
      let CART = [];
      try {
        CART =
          typeof row.cart_meta_data === "string"
            ? JSON.parse(row.cart_meta_data)
            : row.cart_meta_data || [];
      } catch (e) {
        CART = [];
      }
      if (!Array.isArray(CART)) CART = [];

      const TOTAL_AMOUNT = parseFloat(row.subtotal || 0);
      const product_list = [];

      for (const item of CART) {
        const TEMP = {
          product_id: item.item_id || "",
          name: item.item_name || "",
          image: item.item_image || "",
          quantity: item.quantity || "",
          final_amount: parseFloat(item.line_total || 0).toFixed(2),
          addon_price: 0,
          addons: [],
        };
        product_list.push(TEMP);
      }

      const gst_amount = (TOTAL_AMOUNT * 13) / 100;
      let final = TOTAL_AMOUNT + gst_amount;

      const delivery_charge = 5;
      let delivery_charge_amount;

      if (row.order_booking_type && row.order_booking_type === "Delivery") {
        delivery_charge_amount = final + delivery_charge;
        final = TOTAL_AMOUNT + gst_amount + delivery_charge;
      } else {
        delivery_charge_amount = 0;
        final = TOTAL_AMOUNT + gst_amount;
      }

      row.product_list = product_list;
      row.item_count = CART.length;
      row.total_amount = final.toFixed(2);
      row.referral_discount_amount = "0.00";
      row.referral_discount_string = "";
      row.hst = "13%";
      row.hst_amount = gst_amount.toFixed(2);
      row.discount = 0;
      row.item_total = final.toFixed(2);

      final_data.push(row);
    }

    // ══════════════ MERGE + SORT (latest first) ══════════════
    if (final_data.length > 0) {
      final_data.sort((a, b) => {
        const ts_a = new Date(a.sort_datetime).getTime();
        const ts_b = new Date(b.sort_datetime).getTime();
        return ts_b - ts_a;
      });

      final_data = final_data.map((row) => {
        const { sort_datetime, ...rest } = row;
        return rest;
      });

      return res.json({
        result: true,
        msg: "Get Successfully",
        data: final_data,
      });
    }

    return res.json({
      result: false,
      msg: "No Completed Booking Yet",
    });
  } catch (error) {
    console.error("getCompletedBooking Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function getCancelledBookings(req, res) {
  try {
    const { userid } = req.body;

    if (!userid) {
      return res.json({ result: false, msg: "REQ: userid" });
    }

    const user_data = await UserModel.getUserRawById(userid);
    if (!user_data) {
      return res.json({ result: false, msg: "Wrong userid" });
    }

    let final_data = [];

    // ══════════════ SERVICE BOOKINGS ══════════════
    const service_rows = await UserModel.getCancelledServiceBookings(userid);

    for (const book_row of service_rows) {
      let CART = [];
      try {
        CART =
          typeof book_row.cart_meta_data === "string"
            ? JSON.parse(book_row.cart_meta_data)
            : book_row.cart_meta_data || [];
      } catch (e) {
        CART = [];
      }
      if (!Array.isArray(CART)) CART = [];

      book_row.item_count = CART.length;
      book_row.total_amount = 0;
      book_row.discount = 0;
      let COUPON_ID = 0;
      const product_names = [];
      let last_value = null; // PHP me loop ke bahar $value use ho raha tha, wahi behavior yahan bhi rakha hai

      for (const value of CART) {
        const item_amount = parseFloat(value.final_amount || 0);
        const quantity = parseFloat(value.quantity || 1);

        let warranty_amount = 0;
        const warrenty_status = parseInt(value.warrenty_status || 0);
        const product_id = value.product_id || null;

        if (warrenty_status === 1 && product_id) {
          const warranty_price =
            await UserModel.getWarrantyPriceByProductId(product_id);
          if (warranty_price !== null) {
            warranty_amount = parseFloat(warranty_price) * quantity;
          }
        }

        book_row.total_amount += item_amount + warranty_amount;

        if (value.name) {
          product_names.push(value.name);
        }

        if (value.coupon_id) {
          COUPON_ID = value.coupon_id;
        }

        last_value = value;
      }

      if (COUPON_ID) {
        const coupon = await UserModel.getCouponById(COUPON_ID);
        if (coupon) {
          book_row.discount = parseFloat(coupon.cupon_price);
        }
      }

      book_row.product_names = product_names.join(",");
      book_row.item_total = book_row.total_amount.toFixed(2);

      const coupon_discount_amount =
        (book_row.total_amount * book_row.discount) / 100;

      let referral_discount_amount = 0;

      // PHP wale code me yeh loop ke bahar, last $value ke product_id se product fetch hota tha
      let product_rate = 0;
      if (last_value && last_value.product_id) {
        const product_detail = await UserModel.getProductById(
          last_value.product_id,
        );
        if (product_detail) {
          product_rate = parseFloat(product_detail.rate);
        }
      }

      if (book_row.referral_discount == 1) {
        referral_discount_amount = (product_rate * 10) / 100;

        book_row.referral_discount_amount = referral_discount_amount.toFixed(2);
        book_row.referral_discount_string = "10% Referral Discount Applied";
      } else {
        book_row.referral_discount_amount = "0.00";
        book_row.referral_discount_string = "";
      }

      const amount_after_discount =
        book_row.total_amount - coupon_discount_amount;

      book_row.hst = "13%";

      book_row.hst_amount = ((amount_after_discount * 13) / 100).toFixed(2);

      const final_total =
        amount_after_discount + parseFloat(book_row.hst_amount);

      book_row.total_amount = final_total.toFixed(2);
      book_row.booking_type = "service";

      final_data.push(book_row);
    }

    // ══════════════ RESTAURANT ORDERS ══════════════
    const restaurant_rows =
      await UserModel.getCancelledRestaurantOrders(userid);

    for (const row of restaurant_rows) {
      let CART = [];
      try {
        CART =
          typeof row.cart_meta_data === "string"
            ? JSON.parse(row.cart_meta_data)
            : row.cart_meta_data || [];
      } catch (e) {
        CART = [];
      }
      if (!Array.isArray(CART)) CART = [];

      row.item_count = CART.length;
      const product_names = [];

      for (const item of CART) {
        if (item.item_name) {
          product_names.push(item.item_name);
        }
      }

      row.product_names = product_names.join(",");
      row.discount = 0;

      let delivery_charge = 0;

      if (row.order_booking_type && row.order_booking_type === "Delivery") {
        delivery_charge = 5;
      }

      row.item_total = parseFloat(row.subtotal || 0).toFixed(2);

      row.referral_discount_amount = "0.00";
      row.referral_discount_string = "";

      row.hst = "13%";

      const hst_amount = (parseFloat(row.subtotal || 0) * 13) / 100;

      row.hst_amount = hst_amount.toFixed(2);

      // Delivery charge add hoga sirf Delivery order me
      row.total_amount = (
        parseFloat(row.total_amount || 0) + delivery_charge
      ).toFixed(2);

      final_data.push(row);
    }

    // ══════════════ SORT (latest first) ══════════════
    final_data.sort((a, b) => {
      let dateA = 0;
      let dateB = 0;

      if (a.date && a.booked_time) {
        dateA = new Date(`${a.date} ${a.booked_time}`).getTime();
      } else if (a.date) {
        dateA = new Date(a.date).getTime();
      }

      if (b.date && b.booked_time) {
        dateB = new Date(`${b.date} ${b.booked_time}`).getTime();
      } else if (b.date) {
        dateB = new Date(b.date).getTime();
      }

      return dateB - dateA;
    });

    if (final_data.length > 0) {
      return res.json({
        result: true,
        msg: "Get Successfully",
        data: final_data,
      });
    }

    return res.json({
      result: false,
      msg: "No Booking Yet",
    });
  } catch (error) {
    console.error("getCancelledBookings Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function getMyWarrantiesBooking(req, res) {
  try {
    const { userid } = req.body;

    if (!userid) {
      return res.json({ result: false, msg: "REQ: userid" });
    }

    const user = await UserModel.getUserRawById(userid);
    if (!user) {
      return res.json({ result: false, msg: "Wrong userid" });
    }

    // type: all | active | expiring | expired | archived | claims
    const type = (req.body.type || "all").toString().toLowerCase().trim();

    const EXPIRING_SOON_WITHIN_DAYS = 30;

    const bookings = await UserModel.getWarrantyBookings(userid);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let active_count = 0;
    let expiring_count = 0;
    let expired_count = 0;
    let archive_count = 0;
    let claim_count = 0;

    const response = [];

    for (const booking of bookings) {
      let cart = [];
      try {
        cart =
          typeof booking.cart_meta_data === "string"
            ? JSON.parse(booking.cart_meta_data)
            : booking.cart_meta_data || [];
      } catch (e) {
        cart = [];
      }
      if (!Array.isArray(cart)) cart = [];

      for (const item of cart) {
        const warrenty_status = parseInt(item.warrenty_status || 0);

        if (warrenty_status !== 1) {
          continue;
        }

        const product_id = item.product_id || 0;

        if (!product_id) {
          continue;
        }

        const product = await UserModel.getProductWarrantyDetails(product_id);

        if (!product) {
          continue;
        }

        if (
          !booking.completed_date ||
          booking.completed_date === "0000-00-00"
        ) {
          continue;
        }

        const completed = new Date(booking.completed_date);
        const expiry = addDays(completed, product.warranty_duration);

        const days = diffInDays(today, expiry);

        let status, status_key;

        if (days < 0) {
          status = "Expired";
          status_key = "expired";
          expired_count++;
        } else if (days <= EXPIRING_SOON_WITHIN_DAYS) {
          status = "Expiring Soon";
          status_key = "expiring";
          expiring_count++;
        } else {
          status = "Active";
          status_key = "active";
          active_count++;
        }

        // archived
        const archive = await UserModel.getWarrantyArchive(
          userid,
          booking.booking_id,
          product_id,
        );

        let is_archived = false;

        if (archive.length > 0) {
          is_archived = true;
          archive_count++;
        }

        // claim
        const claim = await UserModel.getWarrantyClaim(
          userid,
          booking.booking_id,
          product_id,
        );

        let claim_status = "";

        if (claim.length > 0) {
          claim_count++;
          claim_status = claim[0].status;
        }

        // reminder
        const reminder = await UserModel.getWarrantyReminder(
          userid,
          booking.booking_id,
          product_id,
        );

        let reminder_enabled = 0;

        if (reminder.length > 0) {
          reminder_enabled = parseInt(reminder[0].is_enabled);
        }

        if (type === "active" && status_key !== "active") {
          continue;
        }

        if (type === "expiring" && status_key !== "expiring") {
          continue;
        }

        if (type === "expired" && status_key !== "expired") {
          continue;
        }

        if (type === "archived" && !is_archived) {
          continue;
        }

        if (type === "claims" && claim.length === 0) {
          continue;
        }

        const qty = parseFloat(item.quantity || 1);

        response.push({
          booking_id: booking.booking_id,
          booking_id_string: booking.booking_uniqe_id,

          product_id: product.id,

          item_name: item.name || product.product_name,

          image: item.image
            ? `${BASE_URL}assets/images/${item.image}`
            : `${BASE_URL}assets/images/${product.image}`,

          vendor_id: booking.vendor_id,
          installed_by: booking.vendor_name,
          vendor_image: `${BASE_URL}assets/images/${booking.vendor_image}`,
          vendor_rating: booking.vendor_rating || "0.0",
          vendor_verified: parseInt(booking.vendor_verified),

          coverage: product.warranty_note,

          warranty_price: (parseFloat(product.warranty_price) * qty).toFixed(2),

          completed_date: formatDateYmd(completed),

          expiry_date: formatDateYmd(expiry),

          expiry_date_display: formatDateDisplay(expiry),

          days_remaining: Math.max(0, days),

          status: status,

          is_archived: is_archived ? 1 : 0,

          reminder_enabled: reminder_enabled,

          claim_status: claim_status,

          can_claim_warranty: status !== "Expired" ? 1 : 0,

          has_invoice: 1,

          has_photos: 0,

          has_warranty_card: 1,
        });
      }
    }

    response.sort((a, b) => {
      return (
        new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
      );
    });

    return res.json({
      result: true,
      msg: "Get Successfully",
      counts: {
        active: active_count,
        expiring: expiring_count,
        expired: expired_count,
        claims: claim_count,
        archived: archive_count,
      },
      data: response,
    });
  } catch (error) {
    console.error("getMyWarrantiesBooking Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function getBookDetail(req, res) {
  try {
    const { userid, booked_id } = req.body;

    if (!userid || !booked_id) {
      return res.json({ result: false, msg: "REQ: userid, booked_id" });
    }

    const user_data = await UserModel.getUserRawById(userid);
    if (!user_data) {
      return res.json({ result: false, msg: "Wrong userid" });
    }

    const booked_rows = await UserModel.getBookingById(booked_id);
    if (booked_rows.length === 0) {
      return res.json({ result: false, msg: "Wrong booked_id" });
    }

    const cart_rows = await UserModel.getBookDetailFull(booked_id);

    if (cart_rows.length === 0) {
      return res.json({ result: false, msg: "No Booking Yet" });
    }

    for (const book_row of cart_rows) {
      const rating_count = await UserModel.countRatingReviewByBookingId(
        book_row.Booking_id,
      );
      book_row.is_customer_rated = rating_count > 0 ? "true" : "false";

      let CART = [];
      try {
        CART =
          typeof book_row.cart_meta_data === "string"
            ? JSON.parse(book_row.cart_meta_data)
            : book_row.cart_meta_data || [];
      } catch (e) {
        CART = [];
      }
      if (!Array.isArray(CART)) CART = [];

      book_row.item_count = CART.length;
      book_row.total_amount = 0;

      const product_list = [];
      let last_value = null; // PHP me loop ke bahar $value use ho raha tha (warranty aur referral ke liye)

      for (const value of CART) {
        let warranty_price = 0;
        let warranty_note = "";
        const warrenty_status = parseInt(value.warrenty_status || 0);

        if (warrenty_status === 1 && value.product_id) {
          const prod = await UserModel.getProductWarrantyPriceAndNote(
            value.product_id,
          );
          if (prod) {
            warranty_price = parseFloat(prod.warranty_price);
            warranty_note = prod.warranty_note;
          }
        }

        book_row.total_amount +=
          parseFloat(value.final_amount || 0) + warranty_price;

        let service_type = "";
        if (value.service_type) {
          service_type = String(value.service_type).toLowerCase().trim();
        }

        const TEMP = {
          product_id: value.product_id,
          name: value.name,
          image: value.image,
          quantity: value.quantity,
          final_amount: parseFloat(value.price || 0).toFixed(2),
          addon_price: value.addon_price,
          service_type: service_type,
          addons: [],
        };

        if (value.addon) {
          const addons = await UserModel.getAddonProductsByIdsCsv(value.addon);
          if (addons.length > 0) TEMP.addons = addons;
        }

        product_list.push(TEMP);

        last_value = value;

        // last iteration ke warranty_price/note ko bahar carry karna hai (PHP behavior)
        book_row.__last_warrenty_status = warrenty_status;
        book_row.__last_warranty_price = warranty_price;
        book_row.__last_warranty_note = warranty_note;
      }

      book_row.product_list = product_list;

      book_row.warrenty_status = book_row.__last_warrenty_status || 0;
      book_row.warranty_price = (book_row.__last_warranty_price || 0).toFixed(
        2,
      );
      book_row.warranty_note = book_row.__last_warranty_note || "";

      delete book_row.__last_warrenty_status;
      delete book_row.__last_warranty_price;
      delete book_row.__last_warranty_note;

      // ---------- COUPON ----------
      const COUPON_ID = (last_value && last_value.coupon_id) || 0;
      let discount = 0;

      if (COUPON_ID) {
        const coupon = await UserModel.getCouponPriceOnlyById(COUPON_ID);
        if (coupon) {
          discount = parseFloat(coupon.cupon_price);
        }
      }

      book_row.discount = discount;
      book_row.discount_string = `${discount}%`;

      const discount_amount = (book_row.total_amount * book_row.discount) / 100;
      book_row.discount_amount = discount_amount.toFixed(2);

      // ---------- GST ----------
      book_row.item_total = book_row.total_amount.toFixed(2);
      book_row.hst = "13%";
      book_row.hst_amount = (
        ((book_row.total_amount - discount_amount) * 13) /
        100
      ).toFixed(2);

      // ---------- FINAL ----------
      const final =
        book_row.total_amount -
        discount_amount +
        parseFloat(book_row.hst_amount);

      // ---------- REFERRAL ----------
      if (book_row.referral_discount == 1) {
        const ref_amount =
          ((last_value ? parseFloat(last_value.price || 0) : 0) * 10) / 100;
        book_row.referral_discount_amount = ref_amount.toFixed(2);
        book_row.referral_discount_string = "10% Referral Discount Applied";
      } else {
        book_row.referral_discount_amount = "0.00";
        book_row.referral_discount_string = "";
      }

      book_row.total_amount = final.toFixed(2);
    }

    return res.json({
      result: true,
      msg: "Get Successfully",
      data: cart_rows,
    });
  } catch (error) {
    console.error("getBookDetail Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function messageCount(req, res) {
  try {
    const { userid } = req.body;

    if (!userid) {
      return res.json({ result: false, msg: "Req: userid" });
    }

    const user_data = await UserModel.getUserRawById(userid);
    if (!user_data) {
      return res.json({ result: false, msg: "Wrong userid" });
    }

    const count = await UserModel.countUnseenMessages(userid);

    return res.json({
      result: true,
      data: count,
    });
  } catch (error) {
    console.error("messageCount Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function getNotifications(req, res) {
  try {
    const { userid } = req.body;

    if (!userid) {
      return res.json({
        result: "false",
        msg: "required parameters: userid",
      });
    }

    const data = await UserModel.getUserNotifications(userid);

    if (data.length > 0) {
      const count = await UserModel.countUnseenNotifications(userid);

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
}

async function markAsSeen(req, res) {
  try {
    const { userid } = req.body;

    if (!userid) {
      return res.json({ result: false, msg: "REQ: userid" });
    }

    const user_data = await UserModel.getUserRawById(userid);
    if (!user_data) {
      return res.json({ result: false, msg: "Wrong userid" });
    }

    await UserModel.markNotificationsAsSeen(userid);

    return res.json({
      result: true,
      msg: "Successfully",
    });
  } catch (error) {
    console.error("markAsSeen Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

//..............new 19-09-26 ........................//

async function searchSubcategoryServices(req, res) {
  try {
    const { userid } = req.body;

    if (!userid) {
      return res.json({
        result: false,
        msg: "Parameter required: userid",
      });
    }

    // user location
    const user = await UserModel.getUserLocationById(userid);
    if (!user) {
      return res.json({
        result: false,
        msg: "User not found",
      });
    }

    // nearby radius
    const nearby = await UserModel.getNearbyRadius();
    if (!nearby) {
      return res.json({
        result: false,
        msg: "Nearby radius not set",
      });
    }

    const userLat = parseFloat(user.lat);
    const userLon = parseFloat(user.lang);
    const radius = parseFloat(nearby.redius);

    const records = await UserModel.getServiceRecords();

    const vendors = new Map();

    for (const row of records) {
      const vendorLat = parseFloat(row.vendor_lat);
      const vendorLon = parseFloat(row.vendor_lon);

      if (isNaN(vendorLat) || isNaN(vendorLon)) continue;

      const distance = calculateDistance(
        userLat,
        userLon,
        vendorLat,
        vendorLon,
      );

      if (distance <= radius) {
        if (!vendors.has(row.vendor_id)) {
          vendors.set(row.vendor_id, {
            vendor_id: row.vendor_id,
            vendor_name: row.vendor_name,
            business_name: row.business_name,
            category_id: row.category_id,
            scat_id: row.scat_id,
            category_name: row.category_name,
            vendor_lat: row.vendor_lat,
            vendor_lon: row.vendor_lon,
            distance: Number(distance.toFixed(2)) + " KM",
            products: [],
          });
        }

        vendors.get(row.vendor_id).products.push({
          product_id: row.product_id,
          product_name: row.product_name,
          subcategory_name: row.sub_category_name,
          restaurant_item: row.item_name,
          image: row.image,
        });
      }
    }

    if (vendors.size > 0) {
      return res.json({
        result: true,
        msg: "Service found successfully",
        path: `${BASE_URL}/assets/images/`,
        data: Array.from(vendors.values()),
      });
    }

    return res.json({
      result: false,
      msg: "No service found in nearby locations",
    });
  } catch (error) {
    console.error("searchSubcategoryServices Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function searchRestorent(req, res) {
  try {
    const { lat, lang } = req.body;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lang);

    if (
      lat === undefined ||
      lat === null ||
      lang === undefined ||
      lang === null ||
      isNaN(latitude) ||
      isNaN(longitude)
    ) {
      return res.json({
        result: false,
        msg: "parameter required lat,lang",
      });
    }

    const result = await UserModel.searchRestorent(latitude, longitude);

    if (result && result.length > 0) {
      return res.json({
        result: true,
        msg: "All Restaurant List!",
        data: result,
      });
    }

    return res.json({
      result: false,
      msg: "no record found!",
    });
  } catch (error) {
    console.error("searchRestorent Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function restaurantGetVendors(req, res) {
  try {
    const userid = String(req.body.userid ?? "").trim();
    const userLatStr = String(req.body.lat ?? "").trim();
    const userLngStr = String(req.body.lng ?? "").trim();

    if (isEmpty(userid) || isEmpty(userLatStr) || isEmpty(userLngStr)) {
      return res.json({
        result: false,
        msg: "userid, lat and lng are required",
      });
    }

    const userLat = parseFloat(userLatStr);
    const userLng = parseFloat(userLngStr);

    // user check
    const user = await UserModel.getUserRawById(userid);
    if (!user) {
      return res.json({
        result: false,
        msg: "Invalid userid",
      });
    }

    // nearby radius
    const nearbyRow = await UserModel.getActiveRestaurantNearbyKm();
    if (!nearbyRow) {
      return res.json({
        result: false,
        msg: "Nearby radius not configured",
      });
    }

    const globalRadius = parseFloat(nearbyRow.nearby_km) || 0;

    // driver estimate time (ordered by range_km ASC)
    const estimateRows = await UserModel.getDriverEstimateTimes();

    // vendors with rating
    const vendors = await UserModel.getRestaurantVendorsWithRating();

    const filtered = [];

    for (const row of vendors) {
      if (isEmpty(row.lat) || isEmpty(row.long)) {
        continue;
      }

      const distance = calculateDistance(
        userLat,
        userLng,
        parseFloat(row.lat),
        parseFloat(row.long),
      );

      if (isNaN(distance) || distance > globalRadius) {
        continue;
      }

      // extra time from driver estimate
      let extraTime = 0;
      for (const est of estimateRows) {
        if (distance <= parseFloat(est.range_km)) {
          extraTime = parseInt(est.from_time, 10) || 0;
          break;
        }
      }

      const minTime =
        (parseInt(row.minimum_delivery_time, 10) || 0) + extraTime;
      const maxTime =
        (parseInt(row.maximum_delivery_time, 10) || 0) + extraTime;

      filtered.push({
        _distance: distance, // only for sorting, removed below
        item: {
          id: String(row.id),
          vendor_id: String(row.vendor_id),
          name: row.name ?? "",
          image: row.image ?? "",
          about: row.about ?? "",
          shop_name: row.shop_name ?? "",
          business_description: row.business_description ?? "",
          shopaddress: row.shopaddress ?? "",
          lat: String(row.lat ?? ""),
          long: String(row.long ?? ""),

          dining_option: !isEmpty(row.dining_option)
            ? String(row.dining_option).split(",")
            : [],

          minimum_delivery_time: String(minTime),
          maximum_delivery_time: String(maxTime),

          review: (parseFloat(row.review) || 0).toFixed(1),
          total_reviews: String(row.total_reviews ?? 0),

          distance: distance.toFixed(2) + " KM",
          nearby_radius: globalRadius.toFixed(2) + " KM",
        },
      });
    }

    // nearest first
    filtered.sort((a, b) => a._distance - b._distance);
    const data = filtered.map((f) => f.item);

    return res.json({
      result: true,
      msg:
        data.length > 0
          ? "Restaurant Get Successfully"
          : "No Vendor Found In Range",
      radius: globalRadius.toFixed(2) + " KM",
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("restaurantGetVendors Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function restaurantGetItems(req, res) {
  try {
    const { userid, vendor_id } = req.body || {};

    if (isEmpty(userid) || isEmpty(vendor_id)) {
      return res.json({
        result: false,
        msg: "Required: userid, vendor_id",
      });
    }

    // user
    const user = await UserModel.getUserLocationById(userid);
    if (!user) {
      return res.json({
        result: false,
        msg: "Invalid userid",
      });
    }

    // vendor
    const vendor = await UserModel.getVendorById(vendor_id);
    if (!vendor) {
      return res.json({
        result: false,
        msg: "Invalid vendor_id",
      });
    }

    // nearby radius
    const nearbyRow = await UserModel.getActiveRestaurantNearbyKm();
    if (!nearbyRow || isEmpty(nearbyRow.nearby_km)) {
      return res.json({
        result: false,
        msg: "Nearby radius not configured",
        data: [],
      });
    }

    const vendorRadius =
      parseFloat(String(nearbyRow.nearby_km).replace(" KM", "")) || 0;

    // distance (invalid coordinates = "infinite" distance)
    let distance;
    if (![user.lat, user.lang, vendor.lat, vendor.long].every(isNumeric)) {
      distance = Number.MAX_SAFE_INTEGER;
    } else {
      distance = calculateDistance(
        Number(user.lat),
        Number(user.lang),
        Number(vendor.lat),
        Number(vendor.long),
      );
    }

    if (distance > vendorRadius) {
      return res.json({
        result: false,
        msg: "Vendor out of range",
      });
    }

    // driver estimate time
    const estimateRows = await UserModel.getActiveDriverEstimateTimes();

    let estimateFromTime = 0;
    let estimateRangeKm = 0;

    for (const est of estimateRows) {
      const estRange = parseFloat(est.range_km) || 0;
      if (distance <= estRange) {
        estimateFromTime = parseInt(est.from_time, 10) || 0;
        estimateRangeKm = estRange;
        break;
      }
    }

    const minDelivery = parseInt(vendor.minimum_delivery_time ?? 0, 10) || 0;
    const maxDelivery = parseInt(vendor.maximum_delivery_time ?? 0, 10) || 0;
    const totalDeliveryTime = minDelivery + maxDelivery + estimateFromTime;

    // cart (all rows of this user + vendor)
    const cartRows = await UserModel.getRestaurantCartRows(userid, vendor_id);

    const restaurantCart = cartRows.length > 0;
    const restaurantCount = cartRows.length;

    // first cart row per item (same as CI ->row())
    const cartByItem = new Map();
    for (const c of cartRows) {
      const key = String(c.item_id);
      if (!cartByItem.has(key)) cartByItem.set(key, c);
    }

    // shop address (google)
    const shopAddress = await getAddressFromLatLngRestaurant(
      vendor.lat,
      vendor.long,
    );

    // quick orders (set of item ids)
    const quickIds = await UserModel.getQuickOrderItemIds(userid, vendor_id);
    const quickSet = new Set(quickIds.map((q) => String(q.item_id)));

    // addons grouped by item id
    const addonRows = await UserModel.getVendorAddons(vendor_id);
    const addonsByItem = new Map();
    for (const a of addonRows) {
      const { item_id, ...rest } = a;
      const key = String(item_id);
      if (!addonsByItem.has(key)) addonsByItem.set(key, []);
      addonsByItem.get(key).push(stringifyValues(rest));
    }

    const distanceText = Number(distance.toFixed(2)) + " KM";

    // menus -> items
    const menus = await UserModel.getRestaurantMenusByVendor(vendor_id);
    const finalData = [];

    for (const menu of menus) {
      const rows = await UserModel.getRestaurantItemsByMenu(vendor_id, menu.id);

      const items = rows.map((row) => {
        const item = stringifyValues(row);
        const itemKey = String(row.id);

        // quick order
        item.quick_status = quickSet.has(itemKey);

        // cart
        item.cart_quantity = 0;
        item.is_cart_added = false;
        let selectedIds = [];

        const cart = cartByItem.get(itemKey);
        if (cart) {
          item.cart_quantity = parseInt(cart.quantity, 10) || 0;
          item.is_cart_added = true;

          if (!isEmpty(cart.addons)) {
            selectedIds = String(cart.addons)
              .split(",")
              .map((s) => s.trim());
          }
        }

        // addons
        const addons = (addonsByItem.get(itemKey) || []).map((addon) => ({
          ...addon,
          is_selected: selectedIds.includes(String(addon.id)),
        }));

        item.item_image = !isEmpty(item.item_image)
          ? `${BASE_URL}/assets/images/${item.item_image}`
          : "";

        item.addons = addons;
        item.distance = distanceText;
        item.shopaddress = shopAddress;

        return item;
      });

      finalData.push({
        menu_id: Number(menu.id) ? String(menu.id) : 1,
        menu_name: isEmpty(menu.name) ? "Today's Specials" : menu.name,
        items,
      });
    }

    if (finalData.length > 0) {
      return res.json({
        result: true,
        msg: "Restaurant Items Fetch Successfully",
        restaurant_cart_count: restaurantCount,
        restaurant_cart: restaurantCart,
        distance: distanceText,
        shopaddress: shopAddress,
        minimum_delivery_time: minDelivery + " min",
        maximum_delivery_time: maxDelivery + " min",
        estimate_range_km: estimateRangeKm + " KM",
        estimate_from_time: estimateFromTime + " min",
        total_delivery_time: totalDeliveryTime + " min",
        vendor_lat: str(vendor.lat),
        vendor_long: str(vendor.long),
        data: finalData,
      });
    }

    return res.json({
      result: false,
      msg: "No items found",
    });
  } catch (error) {
    console.error("restaurantGetItems Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function getRestaurantBanners(req, res) {
  try {
    const body = req.body || {};

    const userid = String(body.userid ?? "").trim();
    const userLatStr = String(body.lat ?? "").trim();
    const userLngStr = String(body.lng ?? "").trim();

    if (userid === "" || userLatStr === "" || userLngStr === "") {
      return res.json({
        result: false,
        msg: "userid, lat and lng are required",
        data: [],
      });
    }

    if (!isNumeric(userLatStr) || !isNumeric(userLngStr)) {
      return res.json({
        result: false,
        msg: "lat and lng must be numeric values",
        data: [],
      });
    }

    const userLat = Number(userLatStr);
    const userLng = Number(userLngStr);

    // user
    const user = await UserModel.getUserIdById(userid);
    if (!user) {
      return res.json({
        result: false,
        msg: "Invalid userid",
        data: [],
      });
    }

    // nearby radius
    const nearbyRow = await UserModel.getActiveRestaurantNearbyKm();
    if (!nearbyRow || isEmpty(nearbyRow.nearby_km)) {
      return res.json({
        result: false,
        msg: "Nearby radius not configured",
        data: [],
      });
    }

    const globalRadius = toFloat(nearbyRow.nearby_km);

    // driver estimate time
    const estimateRows = await UserModel.getDriverEstimateTimes();

    // banners
    const banners = await UserModel.getActiveRestaurantBanners();

    // vendors + ratings for all banners (batched)
    const vendorIds = [...new Set(banners.map((b) => b.vendor_id))];

    const vendorRows = await UserModel.getVendorsByIds(vendorIds);
    const vendorMap = new Map(vendorRows.map((v) => [String(v.id), v]));

    const ratingRows = await UserModel.getVendorRatingsByIds(vendorIds);
    const ratingMap = new Map(ratingRows.map((r) => [String(r.vendor_id), r]));

    const filtered = [];

    for (const banner of banners) {
      const vendor = vendorMap.get(String(banner.vendor_id));

      if (
        !vendor ||
        vendor.lat === null ||
        vendor.lat === "" ||
        vendor.long === null ||
        vendor.long === ""
      ) {
        continue;
      }

      const distance = calculateDistance(
        userLat,
        userLng,
        toFloat(vendor.lat),
        toFloat(vendor.long),
      );

      if (distance > globalRadius) {
        continue;
      }

      // extra time from driver estimate
      let extraTime = 0;
      for (const est of estimateRows) {
        if (distance <= toFloat(est.range_km)) {
          extraTime = toInt(est.from_time);
          break;
        }
      }
      if (extraTime === 0 && estimateRows.length > 0) {
        extraTime = toInt(estimateRows[estimateRows.length - 1].from_time);
      }

      const minTime = toInt(vendor.minimum_delivery_time) + extraTime;
      const maxTime = toInt(vendor.maximum_delivery_time) + extraTime;

      // rating (no reviews => 0 / 0)
      const ratingData = ratingMap.get(String(banner.vendor_id));
      const averageRating = ratingData ? toFloat(ratingData.average_rating) : 0;
      const totalReviews = ratingData ? ratingData.total_reviews : 0;

      const bannerImage = !isEmpty(banner.image)
        ? `${BASE_URL}/assets/images/${banner.image}`
        : "";

      filtered.push({
        _distanceValue: Number(distance.toFixed(2)), // only for sorting
        item: {
          id: String(banner.id),
          vendor_id: String(banner.vendor_id),
          title: banner.title ?? "",
          image: bannerImage,

          restaurant_name: vendor.restaurant_name ?? "",
          restaurant_address: vendor.restaurant_address ?? "",
          business_description: vendor.business_description ?? "",

          lat: String(vendor.lat ?? ""),
          long: String(vendor.long ?? ""),

          minimum_delivery_time: String(minTime),
          maximum_delivery_time: String(maxTime),

          average_rating: averageRating.toFixed(1),
          total_reviews: String(totalReviews),

          distance: distance.toFixed(2) + " KM",
          nearby_radius: globalRadius.toFixed(2) + " KM",
        },
      });
    }

    // nearest first
    filtered.sort((a, b) => a._distanceValue - b._distanceValue);
    const data = filtered.map((f) => f.item);

    return res.json({
      result: true,
      msg:
        data.length > 0
          ? "Restaurant banners fetched successfully"
          : "No active restaurant banners found in your nearby range",
      radius: globalRadius.toFixed(2) + " KM",
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("getRestaurantBanners Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
      data: [],
    });
  }
}

async function allRestaurants(req, res) {
  try {
    const body = req.body || {};

    const userid = String(body.userid ?? "").trim();
    const userLatStr = String(body.lat ?? "").trim();
    const userLngStr = String(body.lng ?? "").trim();

    if (userid === "" || userLatStr === "" || userLngStr === "") {
      return res.json({
        result: false,
        msg: "userid, lat and lng are required",
        data: [],
      });
    }

    if (!isNumeric(userLatStr) || !isNumeric(userLngStr)) {
      return res.json({
        result: false,
        msg: "lat and lng must be numeric values",
        data: [],
      });
    }

    const userLat = Number(userLatStr);
    const userLng = Number(userLngStr);

    // user
    const user = await UserModel.getUserIdById(userid);
    if (!user) {
      return res.json({
        result: false,
        msg: "Invalid userid",
        data: [],
      });
    }

    // nearby radius
    const nearbyRow = await UserModel.getActiveRestaurantNearbyKm();
    if (!nearbyRow || isEmpty(nearbyRow.nearby_km)) {
      return res.json({
        result: false,
        msg: "Nearby radius not configured",
        data: [],
      });
    }

    const globalRadius = toFloat(nearbyRow.nearby_km);

    // driver estimate time
    const estimateRows = await UserModel.getDriverEstimateTimes();

    // vendors
    const vendors = await UserModel.getAllRestaurantVendors();

    const filtered = [];

    for (const row of vendors) {
      if (
        row.lat === null ||
        row.lat === "" ||
        row.long === null ||
        row.long === ""
      ) {
        continue;
      }

      const distance = calculateDistance(
        userLat,
        userLng,
        toFloat(row.lat),
        toFloat(row.long),
      );

      if (distance > globalRadius) {
        continue;
      }

      // extra time from driver estimate
      let extraTime = 0;
      for (const est of estimateRows) {
        if (distance <= toFloat(est.range_km)) {
          extraTime = toInt(est.from_time);
          break;
        }
      }
      if (extraTime === 0 && estimateRows.length > 0) {
        extraTime = toInt(estimateRows[estimateRows.length - 1].from_time);
      }

      const minTime = toInt(row.minimum_delivery_time) + extraTime;
      const maxTime = toInt(row.maximum_delivery_time) + extraTime;

      const vendorImage = !isEmpty(row.image)
        ? `${BASE_URL}/assets/images/${row.image}`
        : "";

      filtered.push({
        _distanceValue: Number(distance.toFixed(2)), // only for sorting
        item: {
          id: String(row.id),
          vendor_id: String(row.vendor_id),

          name: row.name ?? "",
          image: vendorImage,
          about: row.about ?? "",

          shop_name: row.shop_name ?? "",
          business_description: row.business_description ?? "",
          shopaddress: row.shopaddress ?? "",

          lat: String(row.lat ?? ""),
          long: String(row.long ?? ""),

          // explode -> trim -> array_filter (removes "" and "0") -> array_values
          dining_option: !isEmpty(row.dining_option)
            ? String(row.dining_option)
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s !== "" && s !== "0")
            : [],

          minimum_delivery_time: String(minTime),
          maximum_delivery_time: String(maxTime),

          review: toFloat(row.review).toFixed(1),
          total_reviews: String(row.total_reviews ?? 0),
          total_items: String(row.total_items ?? 0),

          distance: distance.toFixed(2) + " KM",
          nearby_radius: globalRadius.toFixed(2) + " KM",
        },
      });
    }

    // nearest first
    filtered.sort((a, b) => a._distanceValue - b._distanceValue);
    const data = filtered.map((f) => f.item);

    return res.json({
      result: true,
      msg:
        data.length > 0
          ? "Restaurant vendors fetched successfully"
          : "No restaurant found in your nearby range",
      radius: globalRadius.toFixed(2) + " KM",
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("allRestaurants Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
      data: [],
    });
  }
}

async function subCategoryRestaurant(req, res) {
  try {
    const { category_id } = req.body || {};

    // PHP empty(): "", "0", 0, null, undefined
    if (!category_id || category_id === "0") {
      return res.json({
        result: "false",
        status: 422,
        msg: "Please provide the parameter (category_id)",
        data: [],
      });
    }

    const category = await UserModel.getCategoryNameById(category_id);

    if (!category) {
      return res.json({
        result: "false",
        status: 404,
        msg: "Wrong category_id",
        data: [],
      });
    }

    const rows = await UserModel.getRestaurantSubCategories(category_id);

    if (rows.length > 0) {
      const data = rows.map((row) => ({
        id: String(row.id),
        cat_id: String(row.cat_id),
        sub_category_name: row.sub_category_name,
        image: row.image ? `${BASE_URL}/assets/images/${row.image}` : "",
        status: String(row.status),
        category_name: row.category_name,
      }));

      return res.json({
        result: "true",
        status: 200,
        msg: "Restaurant subcategories found successfully",
        category_id: String(category.id),
        category_name: category.category_name,
        data,
      });
    }

    return res.json({
      result: "false",
      status: 404,
      msg: "No restaurant subcategories found for this category",
      category_id: String(category.id),
      category_name: category.category_name,
      data: [],
    });
  } catch (error) {
    console.error("subCategoryRestaurant Error:", error);
    return res.status(500).json({
      result: "false",
      status: 500,
      msg: "Something went wrong",
      data: [],
    });
  }
}

async function restaurantOfferByVendor(req, res) {
  try {
    const { userid, vendor_id } = req.body || {};

    if (isEmpty(userid) || isEmpty(vendor_id) || !isNumeric(vendor_id)) {
      return res.status(400).json({
        status: false,
        message: "userid and vendor_id are required, vendor_id must be numeric",
      });
    }

    // user
    const user = await UserModel.getUserLocationById(userid);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Invalid userid",
      });
    }

    // vendor
    const vendor = await UserModel.getVendorById(vendor_id);
    if (!vendor) {
      return res.status(404).json({
        status: false,
        message: "Vendor not found",
      });
    }

    // distance (invalid coordinates = "infinite" distance)
    let distance;
    if (![user.lat, user.lang, vendor.lat, vendor.long].every(isNumeric)) {
      distance = Number.MAX_SAFE_INTEGER;
    } else {
      distance = calculateDistance(
        Number(user.lat),
        Number(user.lang),
        Number(vendor.lat),
        Number(vendor.long),
      );
    }
    const distanceText = Number(distance.toFixed(2)) + " KM";

    // shop address (google)
    const shopAddress = await getAddressFromLatLngRestaurant(
      vendor.lat,
      vendor.long,
    );

    // banners
    const banners = await UserModel.getVendorOfferBanners(vendor_id);

    // quick orders (set of item ids)
    const quickIds = await UserModel.getQuickOrderItemIds(userid, vendor_id);
    const quickSet = new Set(quickIds.map((q) => String(q.item_id)));

    // cart rows -> first row per item (same as CI ->row())
    const cartRows = await UserModel.getRestaurantCartRows(userid, vendor_id);
    const cartByItem = new Map();
    for (const c of cartRows) {
      const key = String(c.item_id);
      if (!cartByItem.has(key)) cartByItem.set(key, c);
    }

    // addons grouped by item id
    const addonRows = await UserModel.getVendorAddons(vendor_id);
    const addonsByItem = new Map();
    for (const a of addonRows) {
      const { item_id, ...rest } = a;
      const key = String(item_id);
      if (!addonsByItem.has(key)) addonsByItem.set(key, []);
      addonsByItem.get(key).push(stringifyValues(rest));
    }

    const data = banners.map((row) => {
      const banner = stringifyValues(row);
      const itemKey = String(row.item_id);

      banner.full_image_url = buildImageUrl(row.banner_image);
      banner.item_full_image_url = buildImageUrl(row.item_image);

      // quick order
      banner.quick_status = quickSet.has(itemKey);

      // cart
      banner.cart_quantity = 0;
      banner.is_cart_added = false;
      let selectedIds = [];

      const cart = cartByItem.get(itemKey);
      if (cart) {
        banner.cart_quantity = parseInt(cart.quantity, 10) || 0;
        banner.is_cart_added = true;

        if (!isEmpty(cart.addons)) {
          selectedIds = String(cart.addons)
            .split(",")
            .map((s) => s.trim());
        }
      }

      // addons
      banner.addons = (addonsByItem.get(itemKey) || []).map((addon) => ({
        ...addon,
        is_selected: selectedIds.includes(String(addon.id)),
      }));

      banner.distance = distanceText;
      banner.shopaddress = shopAddress;

      return banner;
    });

    return res.status(200).json({
      status: true,
      message: "Restaurant banners fetched successfully",
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("restaurantOfferByVendor Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
}

async function getQuickOrder(req, res) {
  try {
    const { user_id, vendor_id } = req.body || {};

    if (isEmpty(user_id) || isEmpty(vendor_id)) {
      return res.json({
        result: false,
        msg: "user_id, vendor_id required",
      });
    }

    const quickOrders = await UserModel.getQuickOrdersByUserVendor(
      user_id,
      vendor_id,
    );

    // addon ids of every quick order -> one query
    const parsed = quickOrders.map((row) => ({
      row,
      addonIds: parseAddonIds(row.addion),
    }));

    const allAddonIds = [...new Set(parsed.flatMap((p) => p.addonIds))];

    const addonRows = await UserModel.getVendorAddonsByIds(
      vendor_id,
      allAddonIds,
    );
    const allAddons = addonRows.map(normalizeRowValues);

    const finalData = parsed.map(({ row, addonIds }) => {
      const { live_item_name, live_item_image, ...rest } = row;
      const item = normalizeRowValues(rest);

      item.name = !isEmpty(row.item_name)
        ? item.item_name
        : (live_item_name ?? "");

      item.item_image = !isEmpty(row.item_image)
        ? item.item_image
        : (live_item_image ?? "");

      const idSet = new Set(addonIds);
      item.addons = allAddons.filter((a) => idSet.has(String(a.id)));

      return item;
    });

    return res.json({
      result: true,
      msg: "Quick Order Get Successfully",
      total: finalData.length,
      data: finalData,
    });
  } catch (error) {
    console.error("getQuickOrder Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function restaurantAddToCart(req, res) {
  try {
    const { user_id, vendor_id, item_id, quantity, addons } = req.body || {};

    if (isEmpty(user_id) || isEmpty(vendor_id) || isEmpty(item_id)) {
      return res.json({
        result: false,
        msg: "Required: user_id, vendor_id, item_id",
      });
    }

    // one restaurant per cart: remove items of other vendors
    await UserModel.deleteRestaurantCartOtherVendors(user_id, vendor_id);

    // quantity 0 => remove this item
    if (quantity === "0" || quantity === 0) {
      await UserModel.deleteRestaurantCartItem(user_id, vendor_id, item_id);

      return res.json({
        result: true,
        msg: "Item removed from cart",
      });
    }

    if (quantity === null || quantity === undefined || quantity === "") {
      return res.json({
        result: false,
        msg: "Required: quantity",
      });
    }

    // item
    const item = await UserModel.getRestaurantItemById(item_id);
    if (!item) {
      return res.json({
        result: false,
        msg: "Invalid item_id",
      });
    }

    const basePrice = parseFloat(item.discount_price) || 0;
    const qty = parseInt(quantity, 10) || 0;

    // addon ids: explode -> intval -> array_filter -> unique -> sort
    let addonIds = [];
    if (!isEmpty(addons)) {
      const addonsStr = Array.isArray(addons)
        ? addons.join(",")
        : String(addons);

      addonIds = [
        ...new Set(
          addonsStr
            .split(",")
            .map((s) => parseInt(s, 10) || 0)
            .filter((n) => n !== 0),
        ),
      ].sort((a, b) => a - b);
    }

    let addonTotal = 0;
    const addonsDetail = [];

    if (addonIds.length > 0) {
      const addonRows = await UserModel.getItemAddonsByIds(
        vendor_id,
        item_id,
        addonIds,
      );

      for (const addon of addonRows) {
        addonTotal += parseFloat(addon.price) || 0;

        addonsDetail.push({
          id: String(addon.id),
          name: addon.name,
          price: String(addon.price),
        });
      }
    }

    const singlePrice = basePrice + addonTotal;
    const totalPrice = singlePrice * qty;
    const addonsSave = addonIds.join(",");

    const exist = await UserModel.getRestaurantCartItem(
      user_id,
      vendor_id,
      item_id,
    );

    if (exist) {
      await UserModel.updateRestaurantCartById(exist.id, {
        quantity: qty,
        price: basePrice, // same as PHP update (base price only)
        total_price: totalPrice,
        addons: addonsSave,
      });

      const cartRow = await UserModel.getRestaurantCartById(exist.id);
      const cartData = normalizeRowValues(cartRow);
      cartData.addons_details = addonsDetail;

      return res.json({
        result: true,
        msg: "Cart updated successfully",
        data: cartData,
      });
    }

    const insertId = await UserModel.insertRestaurantCart({
      user_id,
      vendor_id,
      item_id,
      quantity: qty,
      price: singlePrice, // same as PHP insert (base + addons)
      total_price: totalPrice,
      addons: addonsSave,
    });

    const cartRow = await UserModel.getRestaurantCartById(insertId);
    const cartData = normalizeRowValues(cartRow);
    cartData.addons_details = addonsDetail;

    return res.json({
      result: true,
      msg: "Item added to cart successfully",
      data: cartData,
    });
  } catch (error) {
    console.error("restaurantAddToCart Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function addionsToppingsByRestaurant(req, res) {
  try {
    const { item_id, user_id } = req.body || {};

    if (isEmpty(item_id)) {
      return res.json({
        result: false,
        msg: "Required parameter: item_id",
      });
    }

    if (isEmpty(user_id)) {
      return res.json({
        result: false,
        msg: "Required parameter: user_id",
      });
    }

    // item
    const itemRow = await UserModel.getItemForAddons(item_id);
    if (!itemRow) {
      return res.json({
        result: false,
        msg: "Restaurant item not found",
      });
    }
    const item = normalizeRowValues(itemRow);

    // vendor
    const vendorRow = await UserModel.getVendorById(itemRow.vendor_id);
    const vendor = vendorRow ? normalizeRowValues(vendorRow) : null;

    // latest cart row of this item
    const cartRow = await UserModel.getLatestRestaurantCartForItem(
      user_id,
      item_id,
    );
    const cart = cartRow ? normalizeRowValues(cartRow) : null;

    // selected addon ids: explode -> trim -> array_filter ("" and "0" removed) -> unique
    let selectedIds = new Set();
    if (cart && !isEmpty(cart.addons)) {
      selectedIds = new Set(
        String(cart.addons)
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "" && s !== "0"),
      );
    }

    // groups + addons of all groups (one query)
    const groupRows = await UserModel.getAddonGroupsByItemId(item_id);

    const addonRows = await UserModel.getAddonsByGroupIds(
      item_id,
      groupRows.map((g) => g.id),
    );

    const addonsByGroup = new Map();
    for (const a of addonRows) {
      const key = String(a.group_id);
      if (!addonsByGroup.has(key)) addonsByGroup.set(key, []);
      addonsByGroup.get(key).push(normalizeRowValues(a));
    }

    const baseAddons = [];
    const toppings = [];

    for (const groupRow of groupRows) {
      const group = normalizeRowValues(groupRow);
      const type = String(groupRow.type ?? "")
        .trim()
        .toLowerCase();

      if (type !== "addon" && type !== "topping") continue;

      const addonList = (addonsByGroup.get(group.id) || []).map((addon) => {
        const entry = {
          id: addon.id,
          group_id: addon.group_id,
          item_id: addon.item_id,
          name: addon.name,
          price: addon.price,
        };

        if (type === "topping") entry.image = addon.image;

        entry.selected = selectedIds.has(addon.id);
        return entry;
      });

      if (type === "addon") {
        group.addons = addonList;
        baseAddons.push(group);
      } else {
        group.toppings = addonList;
        toppings.push(group);
      }
    }

    return res.json({
      result: true,
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

        vendor: {
          id: vendor ? vendor.id : "",
          name: vendor ? vendor.name : "",
        },

        cart: {
          cart_id: cart ? cart.id : "",
          quantity: cart ? cart.quantity : 0,
        },

        base_addons: baseAddons,
        base_toppings: toppings,
      },
    });
  } catch (error) {
    console.error("addionsToppingsByRestaurant Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function restaurantQuickOrder(req, res) {
  try {
    const { user_id, vendor_id, item_id } = req.body || {};

    if (isEmpty(user_id) || isEmpty(vendor_id) || isEmpty(item_id)) {
      return res.json({
        result: false,
        msg: "Required: user_id, vendor_id, item_id",
      });
    }

    // item (must belong to this vendor)
    const itemRow = await UserModel.getItemByIdAndVendor(item_id, vendor_id);
    if (!itemRow) {
      return res.json({
        result: false,
        msg: "Invalid item_id or item does not belong to this vendor",
      });
    }
    const item = normalizeRowValues(itemRow); // strings + formatted dates, like PHP

    // addion ids: explode -> trim -> keep numeric -> unique
    let addionIds = [];
    if (!isEmpty(itemRow.addion)) {
      addionIds = [
        ...new Set(
          String(itemRow.addion)
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== "" && isNumeric(s)),
        ),
      ];
    }
    const addionCommaSeparated = addionIds.join(",");

    // item must be active (status = 1)
    if (itemRow.status !== null && itemRow.status !== undefined) {
      const s = String(itemRow.status);
      if (!(isNumeric(s) && Number(s) === 1)) {
        return res.json({
          result: false,
          msg: "This item is currently unavailable",
        });
      }
    }

    // already a quick order => remove it (toggle)
    const existing = await UserModel.getQuickOrderRow(
      user_id,
      vendor_id,
      item_id,
    );

    if (existing) {
      await UserModel.deleteQuickOrderById(existing.id);

      return res.json({
        result: true,
        action: "remove",
        status: 0,
        msg: "Quick Order Removed Successfully",
      });
    }

    // add quick order
    const qty = 1;

    const unitPrice = !isEmpty(itemRow.unit_price)
      ? parseFloat(itemRow.unit_price) || 0
      : 0;
    const discountPrice = !isEmpty(itemRow.discount_price)
      ? parseFloat(itemRow.discount_price) || 0
      : 0;

    const finalPrice = discountPrice > 0 ? discountPrice : unitPrice;
    const total = finalPrice * qty;

    // date column value or null (empty / invalid / 0000-00-00 => null)
    const dateOrNull = (v) =>
      v instanceof Date && !isNaN(v.getTime()) ? v : null;

    const insertId = await UserModel.insertQuickOrder({
      user_id,
      vendor_id,
      item_id: itemRow.id,
      quantity: qty,
      price: finalPrice,
      total_price: total,
      created_at: new Date(),

      item_name: itemRow.name ?? "",
      item_description: itemRow.description ?? "",
      item_image: itemRow.item_image ?? "",
      item_type: itemRow.item_type ?? "",
      addion: addionCommaSeparated,
      unit_price: unitPrice,
      discount_price: discountPrice,
      sub_cat_id: itemRow.sub_cat_id ?? null,
      item_status: itemRow.status ?? "",
      item_created_at: dateOrNull(itemRow.created_at),
      item_updated_at: dateOrNull(itemRow.updated_at),
    });

    return res.json({
      result: true,
      action: "add",
      status: 1,
      msg: "Quick Order Added Successfully",
      quick_order_id: insertId,
      data: {
        item_id: item.id,
        vendor_id: item.vendor_id,
        item_name: item.name ?? "",
        description: item.description ?? "",
        item_image: item.item_image ?? "",
        item_type: item.item_type ?? "",
        addion: item.addion ?? "",
        quantity: qty,
        unit_price: unitPrice,
        discount_price: discountPrice,
        price: finalPrice,
        total: total,
        sub_cat_id: item.sub_cat_id ?? null,
        item_status: item.status ?? "",
        created_at: item.created_at ?? null,
        updated_at: item.updated_at ?? null,
      },
    });
  } catch (error) {
    console.error("restaurantQuickOrder Error:", error);
    return res.status(500).json({
      result: false,
      msg: "Something went wrong",
    });
  }
}

async function removeRestaurantCoupon(userid) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      "UPDATE restaurant_cart SET coupon_applied = 0, coupon_id = NULL WHERE user_id = ?",
      [userid],
    );

    await conn.query("DELETE FROM restaurant_apply_coupan WHERE user_id = ?", [
      userid,
    ]);

    await conn.commit();
    return true;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function restaurantApplyCoupon(req, res) {
	try {
		const { userid, coupon_code_id } = req.body || {};
		const num = (v) => parseFloat(v) || 0;
 
		if (isEmpty(userid) || isEmpty(coupon_code_id)) {
			return res.json({
				result: false,
				msg: "userid & coupon_code_id required",
			});
		}
 
		// user
		const user = await UserModel.getUserIdById(userid);
		if (!user) {
			return res.json({
				result: false,
				msg: "Invalid user",
			});
		}
 
		// cart
		const cartRows = await UserModel.getRestaurantCartByUser(userid);
		if (cartRows.length === 0) {
			return res.json({
				result: false,
				msg: "Cart empty",
			});
		}
 
		// coupon (numeric => id, otherwise => code)
		const coupon = isNumeric(coupon_code_id)
			? await UserModel.getRestaurantCouponById(coupon_code_id)
			: await UserModel.getRestaurantCouponByCode(coupon_code_id);
 
		if (!coupon) {
			return res.json({
				result: false,
				msg: "Coupon not found",
			});
		}
 
		// usage limit (result is the string "false" here, same as PHP)
		if (num(coupon.used_count) >= num(coupon.usage_limit)) {
			return res.json({
				result: "false",
				msg: "Coupon usage limit exceeded",
			});
		}
 
		// same as PHP: used_count is increased here, BEFORE the remaining checks
		await UserModel.incrementRestaurantCouponUsed(coupon.id);
 
		const today = nowMysql();
 
		const statusText = String(coupon.status ?? "");
		if (!(isNumeric(statusText) && Number(statusText) === 1)) {
			return res.json({
				result: false,
				msg: "Coupon inactive",
			});
		}
 
		if (!isEmpty(coupon.created_at_raw) && coupon.created_at_raw > today) {
			return res.json({
				result: false,
				msg: "Coupon not started yet",
			});
		}
 
		if (!isEmpty(coupon.expired_at_raw) && coupon.expired_at_raw < today) {
			return res.json({
				result: false,
				msg: "Coupon expired",
			});
		}
 
		// already applied
		const check = await UserModel.getRestaurantAppliedCoupon(userid, coupon.id);
		if (check.length > 0) {
			return res.json({
				result: false,
				msg: "Coupon already applied",
			});
		}
 
		const couponProducts = splitIds(coupon.product_ids);
		const couponVendors = splitIds(coupon.vendor_ids);
		const couponCategories = splitIds(coupon.category_ids);
 
		const staticCategoryId = 118;
 
		let total = 0;
		let validCoupon = false;
 
		for (const item of cartRows) {
			// PHP picks total_price in every branch (or 0 when it is null)
			total += num(item.total_price);
 
			const productMatch = couponProducts.length === 0 || looseIn(item.item_id, couponProducts);
			const vendorMatch = couponVendors.length === 0 || looseIn(item.vendor_id, couponVendors);
			const categoryMatch =
				couponCategories.length === 0 || looseIn(staticCategoryId, couponCategories);
 
			if (productMatch && vendorMatch && categoryMatch) {
				validCoupon = true;
			}
		}
 
		if (!validCoupon) {
			return res.json({
				result: false,
				msg: "Coupon not valid for selected cart items",
			});
		}
 
		if (!isEmpty(coupon.min_amount) && total < num(coupon.min_amount)) {
			return res.json({
				result: false,
				msg: "Minimum order amount not reached",
			});
		}
 
		// discount (discountNum = for maths, discountOut = value shown in response like PHP)
		let discountNum;
		let discountOut;
 
		if (coupon.discount_type === "percentage") {
			discountNum = (total * num(coupon.cupon_price)) / 100;
			discountOut = discountNum;
		} else {
			discountNum = num(coupon.cupon_price);
			discountOut = coupon.cupon_price === null ? null : String(coupon.cupon_price);
		}
 
		if (!isEmpty(coupon.max_discount) && discountNum > num(coupon.max_discount)) {
			discountNum = num(coupon.max_discount);
			discountOut = String(coupon.max_discount);
		}
 
		const finalAmount = Math.max(0, total - discountNum);
 
		// save applied coupon + mark cart
		await UserModel.applyRestaurantCoupon(userid, coupon.id, coupon.code);
 
		return res.json({
			result: true,
			msg: "Coupon applied successfully",
			data: {
				coupon_id: String(coupon.id),
				coupon_code: coupon.code,
				total_amount: total,
				discount: discountOut,
				final_amount: finalAmount,
			},
		});
	} catch (error) {
		console.error("restaurantApplyCoupon Error:", error);
		return res.status(500).json({
			result: false,
			msg: "Something went wrong",
		});
	}
}

module.exports = {
  userSignup,
  userLogin,
  verifyOTP,
  resendOTP,
  getCategories,
  getHomeSlider,
  getProducts,
  getVendors,
  addToCart,
  showCart,
  shareBonusGift,
  getMyAddresses,
  timeSlots,
  getCouponCodes,
  homeSignupLastDate,
  getAiText,
  userLogout,
  addAddress,
  getProfile,
  updateProfile,
  getWalletHistory,
  changePassword,
  addContactUs,
  appRatingReview,
  getFaq,
  aboutCompany,
  contactUs,
  saveAppReview,
  nearbyBookings,
  getTestimonials,
  getExpertVideos,
  getScatByVendor,
  vendorRatingReview,
  deleteCart,
  applyCoupon,
  removeCoupon,
  checkCartVendorInRange,
  newPaymentProcess,
  ServicesbookNow,
  categoryByUserSubcategoryList,
  getUpcomingBooking,
  getCompletedBooking,
  getCancelledBookings,
  getMyWarrantiesBooking,
  getBookDetail,
  messageCount,
  getNotifications,
  markAsSeen,
  searchSubcategoryServices,
  searchRestorent,
  restaurantGetVendors,
  restaurantGetItems,
  getRestaurantBanners,
  allRestaurants,
  subCategoryRestaurant,
  restaurantOfferByVendor,
  getQuickOrder,
  restaurantAddToCart,
  addionsToppingsByRestaurant,
  restaurantQuickOrder,
  removeRestaurantCoupon,
  restaurantApplyCoupon
  
};
