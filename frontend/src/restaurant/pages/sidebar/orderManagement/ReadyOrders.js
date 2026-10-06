import React from "react";
import OrdersPage from "../../common/OrdersPage";

export default function ReadyOrders() {
  return (
    <OrdersPage
      pageTitle="Ready For Pickup"
      orderStatus="ready_for_pickup"
    />
  );
}