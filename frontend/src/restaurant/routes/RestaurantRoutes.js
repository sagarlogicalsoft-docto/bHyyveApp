import React from "react";
import { Routes, Route } from "react-router-dom";

import RestaurantLayout from "../layouts/RestaurantLayout";
import RestaurantProfile from "../pages/profile/RestaurantProfile";
import RestaurantDashboard from "../pages/dashboard/RestaurantDashboard";
import NewStores from "../pages/sidebar/storeManagement/NewStores";
import AddStore from "../pages/sidebar/storeManagement/AddStore";
import StoreList from "../pages/sidebar/storeManagement/StoreList";
import StoreView from "../pages/sidebar/storeManagement/StoreView";
import StoreEdit from "../pages/sidebar/storeManagement/StoreEdit";
import StoreOrders from "../pages/sidebar/storeManagement/StoreOrders";
import StoreItems from "../pages/sidebar/storeManagement/StoreItems";
import StoreReviews from "../pages/sidebar/storeManagement/StoreReviews";
import StoreDiscount from "../pages/sidebar/storeManagement/StoreDiscount";
import StoreTransactions from "../pages/sidebar/storeManagement/StoreTransactions";
import StoreKeywords from "../pages/sidebar/storeManagement/storeKeywords";
import NearbyRestaurant from "../pages/sidebar/storeManagement/NearbyRestaurant";
import CategoryList from "../pages/sidebar/categoryManagement/CategoryList";
import SubCategoryList from "../pages/sidebar/categoryManagement/SubCategoryList";
import AllCoupons from "../pages/sidebar/couponsManagement/AllCoupons";
import ViewCoupon from "../pages/sidebar/couponsManagement/ViewCoupon";
import AddCoupon from "../pages/sidebar/couponsManagement/AddCoupon";
import EditCoupon from "../pages/sidebar/couponsManagement/EditCoupon";
import AddProduct from "../pages/sidebar/productManagement/AddProduct";
import MenuList from "../pages/sidebar/productManagement/MenuList";
import ProductList from "../pages/sidebar/productManagement/ProductList";
// import Payment from "../pages/sidebar/productManagement/Payment";
import ViewRestaurantProduct from "../pages/sidebar/productManagement/ViewRestaurantProduct";
import EditRestaurantItem from "../pages/sidebar/productManagement/EditRestaurantItem";
import AddDriver from "../pages/sidebar/driverSection/AddDriver";
import DriverList from "../pages/sidebar/driverSection/DriverList";
import ViewDriver from "../pages/sidebar/driverSection/ViewDriver";
import EditDriver from "../pages/sidebar/driverSection/EditDriver";
import DeliveryEstimateTime from "../pages/sidebar/driverSection/DeliveryEstimateTime";
import AddBanner from "../pages/sidebar/driverSection/AddBanner";
// import EditBanner from "../pages/sidebar/driverSection/EditBanner";
import OrderNotification from "../pages/sidebar/driverSection/OrderNotification";
import ViewNotification from "../pages/sidebar/driverSection/ViewNotification";
import AllOrders from "../pages/sidebar/orderManagement/AllOrders";
import AcceptedOrders from "../pages/sidebar/orderManagement/AcceptedOrders";
import PendingOrders from "../pages/sidebar/orderManagement/PendingOrders";
import CancelledOrders from "../pages/sidebar/orderManagement/CancelledOrders";
import PreparingOrders from "../pages/sidebar/orderManagement/PreparingOrders";
import ReadyOrders from "../pages/sidebar/orderManagement/ReadyOrders";
import PickedUpOrders from "../pages/sidebar/orderManagement/PickedUpOrders";
import OnTheWayOrders from "../pages/sidebar/orderManagement/OnTheWayOrders";
import DeliveredOrders from "../pages/sidebar/orderManagement/DeliveredOrders";
import DriverRejectedOrders from "../pages/sidebar/orderManagement/DriverRejected";
import OrderDetails from "../pages/common/OrderDetails";

const RestaurantRoutes = () => {
  return (
    <Routes>
      <Route path="/restaurant" element={<RestaurantLayout />}>
        <Route path="dashboard" element={<RestaurantDashboard />} />
        <Route path="profile" element={<RestaurantProfile />} />
        <Route path="stores_request" element={<NewStores />} />
        <Route path="store/add" element={<AddStore />} />
        <Route path="stores_list" element={<StoreList />} />
        <Route path="store/view_store/:id" element={<StoreView />} />
        <Route path="store/edit_store/:id" element={<StoreEdit />} />
        <Route path="nearby_restaurant" element={<NearbyRestaurant />} />
        <Route path="category_list" element={< CategoryList />} />
        <Route path="sub_category_list" element={< SubCategoryList/>} />
        <Route path="coupons" element={<AllCoupons />} />
        <Route path="coupon/create" element={<AddCoupon />} />
        <Route path="coupon/view_coupon/:id" element={<ViewCoupon />} />
        <Route path="coupon/edit_coupon/:id" element={<EditCoupon />} />
        <Route path="orders" element={<AllOrders />} />
        <Route path="store/orders/:id" element={<StoreOrders />} />
        <Route path="store/items/:id" element={<StoreItems />} />
        <Route path="store/reviews/:id" element={< StoreReviews />} />
        <Route path="store/discounts/:id" element={< StoreDiscount />} />
        <Route path="store/transactions/:id" element={< StoreTransactions />} />
        <Route path="store/keywords/:id" element={< StoreKeywords />} />
        <Route path="orders/accepted" element={<AcceptedOrders />} />
        <Route path="orders/pending" element={<PendingOrders />} />
        <Route path="orders/cancelled" element={<CancelledOrders />} />
        <Route path="orders/preparing" element={<PreparingOrders />} />
        <Route path="orders/ready_for_pickup" element={<ReadyOrders />} />
        <Route path="orders/picked_up" element={<PickedUpOrders />} />
        <Route path="orders/on_the_way" element={<OnTheWayOrders />} />
        <Route path="orders/delivered" element={<DeliveredOrders />} />
        <Route
          path="orders/driver_rejected"
          element={<DriverRejectedOrders />}
        />
        <Route
          path="/restaurant/orders/view/:orderId"
          element={<OrderDetails />}
        />

        <Route path="add_product" element={<AddProduct />} />
        <Route path="menu_list" element={<MenuList />} />
        <Route path="product_list" element={<ProductList />} />
        <Route path="product/view_restaurant_product/:id" element={< ViewRestaurantProduct/>} />
        <Route path="product/edit_restaurant_product/:id" element={< EditRestaurantItem />} />
        {/* <Route path="payments" element={<Payment />} /> */}
        <Route path="add_driver" element={<AddDriver />} />
        <Route path="driver_list" element={<DriverList />} /> 
        <Route path="view_driver/:driverId" element={< ViewDriver />} />
        <Route path="edit_driver/:driverId" element={< EditDriver />} />
        <Route path="delivery_estimate_time" element={<DeliveryEstimateTime />} />
        <Route path="banners" element={<AddBanner />} />
        {/* <Route path="banners/edit/:id" element={<EditBanner />} /> */}
        <Route path="order_notification" element={<OrderNotification />} />
        <Route path="order_notification/view/:notificationId" element={< ViewNotification />} />
      </Route>
    </Routes>
  );
};

export default RestaurantRoutes;
