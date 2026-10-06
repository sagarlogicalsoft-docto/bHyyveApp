import React from "react";
import OrdersPage from "../../common/OrdersPage";

export default function DeliveredOrders() {
  return (
    <OrdersPage
      pageTitle="Delivered Orders"
      orderStatus="delivered"
    />
  );
}