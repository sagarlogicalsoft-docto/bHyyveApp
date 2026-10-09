import React from "react";
import OrdersPage from "../../common/OrdersPage";

export default function PendingOrders() {
  return (
    <OrdersPage
      pageTitle="Pending Orders"
      orderStatus="pending"
    />
  );
}