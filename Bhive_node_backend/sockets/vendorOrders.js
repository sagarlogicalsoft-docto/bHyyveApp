const { Server } = require("socket.io");
const RestaurantModel = require("../models/restaurantModel");

let io = null;
const vendorFingerprints = {}; // vendor_id => last known fingerprint

// server.js se ek baar call hoga
function initVendorOrderSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", async (socket) => {
    const vendorId = Number(socket.handshake.query.restaurant_id);

    if (!vendorId) {
      socket.emit("error", { result: false, message: "restaurant_id required in query" });
      socket.disconnect();
      return;
    }

    const exists = await RestaurantModel.vendorExists(vendorId);
    if (!exists) {
      socket.emit("error", { result: false, message: "Invalid restaurant_id" });
      socket.disconnect();
      return;
    }

    // Har vendor apne alag room me — isliye ek vendor ko dusre ka data kabhi nahi jayega
    socket.join(`vendor_${vendorId}`);
    console.log(`[socket] vendor connected: ${vendorId} (${socket.id})`);

    // Connect hote hi turant current orders bhejo + fingerprint save karo
    vendorFingerprints[vendorId] = await RestaurantModel.getOrdersFingerprint(vendorId);
    await emitVendorOrders(vendorId);

    socket.on("get_orders", async () => {
      await emitVendorOrders(vendorId);
    });

    socket.on("disconnect", () => {
      console.log(`[socket] vendor disconnected: ${vendorId} (${socket.id})`);
    });
  });

  // ADDED: PHP (ya kahin se bhi) naya order INSERT kare to bhi pakadne ke liye
  // har 3 second connected vendors ka fingerprint check karo, change ho to push karo
  setInterval(async () => {
    for (const room of io.sockets.adapter.rooms.keys()) {
      if (!room.startsWith("vendor_")) continue; // socket.io internal rooms skip karo

      const vendorId = Number(room.replace("vendor_", ""));
      if (!vendorId) continue;

      try {
        const currentFingerprint = await RestaurantModel.getOrdersFingerprint(vendorId);

        if (vendorFingerprints[vendorId] !== currentFingerprint) {
          vendorFingerprints[vendorId] = currentFingerprint;
          await emitVendorOrders(vendorId);
          console.log(`[socket] change detected -> pushed: vendor_${vendorId}`);
        }
      } catch (e) {
        console.log(`[socket] fingerprint check error vendor_${vendorId}:`, e.message);
      }
    }
  }, 3000);

  return io;
}

// Yahi function order create/update hone ke baad kahin se bhi call karo
async function emitVendorOrders(vendorId) {
  if (!io) return;

  const room = `vendor_${vendorId}`;
  const roomSockets = await io.in(room).fetchSockets();
  if (roomSockets.length === 0) return; // koi vendor connected hi nahi, DB query bachao

  const orders = await RestaurantModel.getVendorOrdersHome(vendorId);

  io.to(room).emit("restaurant_orders_data", {
    result: true,
    msg: orders.length ? "Orders fetched successfully" : "No orders found",
    total: orders.length,
    restaurant_id: vendorId,
    orders,
    updated_at: new Date(),
  });
}

module.exports = { initVendorOrderSocket, emitVendorOrders };