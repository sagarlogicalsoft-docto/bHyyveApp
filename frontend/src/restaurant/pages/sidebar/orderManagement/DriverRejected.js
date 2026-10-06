import React from "react";
import OrdersPage from "../../common/OrdersPage";

export default function DriverRejectedOrders() {
  return (
    <OrdersPage
      pageTitle="Driver Rejected Orders"
      orderStatus="rejected"
    />
  );
}