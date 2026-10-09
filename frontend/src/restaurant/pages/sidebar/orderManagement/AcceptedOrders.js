import React from "react";
import OrdersPage from "../../common/OrdersPage";

export default function AcceptedOrders() {
  return (
    <OrdersPage
      pageTitle="Accepted Orders"
      orderStatus="accepted"
    />
  );
}