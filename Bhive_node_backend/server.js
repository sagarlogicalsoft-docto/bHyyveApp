require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const http = require("http");
const db = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const UserRoutes = require("./routes/userRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");

const { initVendorOrderSocket } = require("./sockets/vendorOrders");
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/assets/", express.static(path.join(__dirname, "assets")));
// Home
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Bhyyve API Running",
  });
});

app.use("/api_admin", adminRoutes);
app.use("/Api_user", UserRoutes);
app.use("/Api_vendor", vendorRoutes);
app.use("/Api_delivery", deliveryRoutes);
app.use("/Api_vendor", restaurantRoutes);

// ADDED: plain app.listen() ki jagah http server banaya taaki
// socket.io usi port (env PORT) pe attach ho sake — same server, same port.
const server = http.createServer(app);
initVendorOrderSocket(server);

server.listen(process.env.PORT, () => {
  console.log(`🚀 Server Running:${process.env.PORT}`);
  console.log(`🔌 Socket.io ready on same port (connect: ws://<host>:${process.env.PORT}?restaurant_id=<vendor_id>)`);
});
