const messaging = require("../config/firebase");

// SIMPLE NOTIFICATION

async function sendNotification(notification, token) {
  try {
    if (!token) {
      console.log("FCM Token not found");
      return false;
    }

    const message = {
      token,

      notification: {
        title: notification.title || "",
        body: notification.body || "",
      },

      android: {
        priority: "high",
        notification: {
          sound: "default",
        },
      },

      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    };

    const response = await messaging.send(message);

    console.log("Simple Notification Sent:", response);

    return true;
  } catch (err) {
    console.log("Simple Notification Error:", err.message);
    return false;
  }
}

//PAYLOAD NOTIFICATION

async function sendPayloadNotification(notification, token, data = {}) {
  try {
    if (!token) {
      console.log("FCM Token not found");
      return false;
    }
    e;
    const payloadData = {};

    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (value !== undefined && value !== null) {
        payloadData[key] =
          typeof value === "string" ? value : JSON.stringify(value);
      }
    });

    const message = {
      token,

      // Notification
      notification: {
        title: notification.title || "",
        body: notification.body || "",
      },

      // Custom Payload
      data: payloadData,

      android: {
        priority: "high",

        notification: {
          sound: "default",
        },
      },

      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    };

    console.log("Payload Notification:", JSON.stringify(message, null, 2));

    const response = await messaging.send(message);

    console.log("Payload Notification Sent:", response);

    return true;
  } catch (err) {
    console.log("Payload Notification Error:", err.message);
    return false;
  }
}

module.exports = {
  sendNotification,
  sendPayloadNotification,
};
