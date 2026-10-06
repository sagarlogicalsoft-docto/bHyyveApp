const { sendNotification } = require("../services/notificationService");
const UserModel = require("../models/userModel");

async function onBooked(userRow, vendorRow, booking_id, otp) {
  /* =========================
     1. NOTIFY USER
  ========================= */
  const userTitle = "Order Booked";
  const userBody = `Your Order Recieved Successfully & Order Otp is ${otp}.`;

  const userNotificationPayload = {
    title: userTitle,
    body: userBody,
    userid: userRow.id,
    vendorId: vendorRow.id,
    Booked_id: booking_id,
    status: "0",
    otp: otp,
  };

  await sendNotification({ title: userTitle, body: userBody }, userRow.fcm_id);

  await UserModel.insertBookingNotification({
    booked_id: booking_id,
    vendor_id: vendorRow.id,
    sender_id: vendorRow.id,
    reciever_id: userRow.id,
    title: "Order Booked",
    message: `Your Order Recieved Successfully & Order Otp is ${otp}. Remember Your Order otp.`,
    sender_type: "vendor",
    receiver_type: "user",
    types: "booking",
    meta_data: JSON.stringify(userNotificationPayload),
  });

  /* =========================
     2. NOTIFY VENDOR (New Order)
  ========================= */
  const vendorTitle = "New Order";
  const vendorBody = `You Have New Order By ${userRow.fname} ${userRow.lname}`;

  const vendorNotificationPayload = {
    title: vendorTitle,
    body: vendorBody,
    userid: userRow.id,
    vendorId: vendorRow.id,
    Booked_id: booking_id,
    status: "0",
    otp: otp,
  };

  await sendNotification({ title: vendorTitle, body: vendorBody }, vendorRow.fcm_id);

  const vendorName = vendorRow.name || "Vendor";
  const customerName = `${userRow.fname || ""} ${userRow.lname || ""}`.trim();

  await UserModel.insertBookingNotification({
    booked_id: booking_id,
    vendor_id: vendorRow.id,
    sender_id: userRow.id,
    reciever_id: vendorRow.id,
    title: "New Service Booking",
    message: `You have received a new service booking from ${customerName || "a customer"} for ${vendorName}.`,
    sender_type: "user",
    receiver_type: "vendor",
    types: "booking",
    meta_data: JSON.stringify(vendorNotificationPayload),
  });
}

module.exports = { onBooked };