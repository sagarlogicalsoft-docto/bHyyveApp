import React from "react";
import OrdersPage from "../../common/OrdersPage";

export default function PickedUpOrders() {
  return (
    <OrdersPage
      pageTitle="Picked Up Orders"
      orderStatus="picked_up"
    />
  );
}