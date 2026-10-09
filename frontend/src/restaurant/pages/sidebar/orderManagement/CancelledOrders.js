import React from "react";
import OrdersPage from "../../common/OrdersPage";

export default function CancelledOrders() {
  return (
    <OrdersPage
      pageTitle="Cancelled Orders"
      orderStatus="cancelled"
    />
  );
}