import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import api from "../../config/api";

import {
  FaUserPlus,
  FaImage,
  FaBell,
  FaPlus,
  FaTachometerAlt,
  FaStore,
  FaPlusCircle,
  FaThLarge,
  FaMapMarkedAlt,
  FaGift,
  FaShoppingCart,
  FaList,
  FaUsers,
  FaTags,
  FaCreditCard,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaFire,
  FaBoxOpen,
  FaHandHolding,
  FaMotorcycle,
  FaCheckDouble,
  FaUserTimes,
  FaShoppingBag,
  FaListUl, 
} from "react-icons/fa";

import "./restaurantSidebar.css";

const RestaurantSidebar = ({ sidebarOpen, toggleSidebar }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [orderCounts, setOrderCounts] = useState({});
  const [notificationCount, setNotificationCount] = useState(0);
  const [newNotification, setNewNotification] = useState(false);

  // Store animation timers so they can be cleaned up
  const animationStartTimer = useRef(null);
  const animationStopTimer = useRef(null);

  const toggleDropdown = (dropdownName) => {
    if (!sidebarOpen) {
      toggleSidebar();
      setOpenDropdown(dropdownName);
      return;
    }

    setOpenDropdown((current) =>
      current === dropdownName ? null : dropdownName,
    );
  };

  // ============================================================
  // ORDER COUNTS
  // ============================================================
  useEffect(() => {
    const fetchOrderCounts = async () => {
      try {
        const response = await api.get("/restaurant/orders");

        if (response.data?.success) {
          setOrderCounts(response.data.counts || {});
        }
      } catch (error) {
        console.error("Failed to load restaurant order counts:", error);
      }
    };

    fetchOrderCounts();
  }, []);

  // ============================================================
  // NOTIFICATION ANIMATION
  // ============================================================
  const triggerNotificationAnimation = () => {
    // Clear previous timers
    if (animationStartTimer.current) {
      clearTimeout(animationStartTimer.current);
    }

    if (animationStopTimer.current) {
      clearTimeout(animationStopTimer.current);
    }

    // Remove class first so animation can restart
    setNewNotification(false);

    // Small delay to allow CSS animation to restart
    animationStartTimer.current = setTimeout(() => {
      setNewNotification(true);

      // Keep animation active for 3 seconds
      animationStopTimer.current = setTimeout(() => {
        setNewNotification(false);
      }, 3000);
    }, 50);
  };

  // ============================================================
  // FETCH NOTIFICATION COUNT
  // ============================================================
  const fetchNotificationCount = async (isInitialLoad = false) => {
    try {
      const response = await api.get("/restaurant/notifications/unread-count");

      const count = Number(response.data?.count ?? 0);

      setNotificationCount((previousCount) => {
        if (count > previousCount) {
          triggerNotificationAnimation();
        } else if (!isInitialLoad && count > 0) {
          triggerNotificationAnimation();
        }

        return count;
      });

      if (isInitialLoad && count > 0) {
        triggerNotificationAnimation();
      }
    } catch (error) {
      console.error("Failed to load restaurant notification count:", error);

      setNotificationCount(0);
      setNewNotification(false);
    }
  };

  // ============================================================
  // NOTIFICATION POLLING
  // Every 10 seconds
  // ============================================================
  useEffect(() => {
    // Initial load
    fetchNotificationCount(true);

    // Check every 10 seconds
    const interval = setInterval(() => {
      fetchNotificationCount(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ============================================================
  // CLEANUP ANIMATION TIMERS
  // ============================================================
  useEffect(() => {
    return () => {
      if (animationStartTimer.current) {
        clearTimeout(animationStartTimer.current);
      }

      if (animationStopTimer.current) {
        clearTimeout(animationStopTimer.current);
      }
    };
  }, []);

  // ============================================================
  // NORMAL SIDEBAR LINK
  // ============================================================
  const SidebarLink = ({ icon, title, path }) => (
    <li className="restaurant-sidebar-menu-item">
      <NavLink
        to={path}
        title={!sidebarOpen ? title : ""}
        className={({ isActive }) =>
          `restaurant-sidebar-link ${
            isActive ? "restaurant-sidebar-link-active" : ""
          }`
        }
      >
        <span className="restaurant-sidebar-link-icon">{icon}</span>

        {sidebarOpen && (
          <span className="restaurant-sidebar-link-text">{title}</span>
        )}
      </NavLink>
    </li>
  );

  // ============================================================
  // NOTIFICATION LINK
  // ============================================================
  const NotificationLink = ({ title, icon, path, count }) => (
    <li className="restaurant-sidebar-menu-item">
      <NavLink
        to={path}
        title={!sidebarOpen ? title : ""}
        className={({ isActive }) =>
          `restaurant-sidebar-link restaurant-sidebar-notification-link ${
            isActive ? "restaurant-sidebar-link-active" : ""
          }`
        }
      >
        <span className="restaurant-sidebar-notification-icon">
          {icon}

          {/* COLLAPSED SIDEBAR */}
          {!sidebarOpen && (
            <span
              className={`restaurant-sidebar-notification-badge restaurant-sidebar-notification-badge-collapsed ${
                newNotification ? "notification-badge-reflex" : ""
              }`}
            >
              {count ?? 0}
            </span>
          )}
        </span>

        {/* EXPANDED SIDEBAR */}
        {sidebarOpen && (
          <>
            <span className="restaurant-sidebar-link-text">{title}</span>

            <span
              className={`restaurant-sidebar-notification-badge restaurant-sidebar-notification-badge-expanded ${
                newNotification ? "notification-badge-reflex" : ""
              }`}
            >
              {count ?? 0}
            </span>
          </>
        )}
      </NavLink>
    </li>
  );

  // ============================================================
  // DROPDOWN MENU
  // ============================================================
  const DropdownMenu = ({ name, icon, title, children }) => {
    const isOpen = openDropdown === name;

    return (
      <li className="restaurant-sidebar-menu-item restaurant-sidebar-dropdown">
        <button
          type="button"
          title={!sidebarOpen ? title : ""}
          className={`restaurant-sidebar-link restaurant-sidebar-dropdown-btn ${
            isOpen ? "restaurant-sidebar-dropdown-open" : ""
          }`}
          onClick={() => toggleDropdown(name)}
        >
          <span className="restaurant-sidebar-link-icon">{icon}</span>

          {sidebarOpen && (
            <>
              <span className="restaurant-sidebar-link-text">{title}</span>

              <FaChevronDown
                className={`restaurant-sidebar-dropdown-arrow ${
                  isOpen ? "restaurant-sidebar-dropdown-arrow-open" : ""
                }`}
              />
            </>
          )}
        </button>

        {sidebarOpen && isOpen && (
          <ul className="restaurant-sidebar-submenu">{children}</ul>
        )}
      </li>
    );
  };

  // ============================================================
  // ORDER STATUS LINK
  // ============================================================
  const OrderStatusLink = ({ title, icon, count, path, highlight }) => (
    <li className="restaurant-sidebar-order-status-item">
      <NavLink to={path} className="restaurant-sidebar-order-status-link">
        <span className="restaurant-sidebar-order-status-name">
          <span className="restaurant-sidebar-order-status-icon">{icon}</span>

          {title}
        </span>

        <span
          className={`restaurant-sidebar-order-count ${
            highlight ? "restaurant-sidebar-order-count-highlight" : ""
          }`}
        >
          {count}
        </span>
      </NavLink>
    </li>
  );

  // ============================================================
  // SIDEBAR UI
  // ============================================================
  return (
    <aside
      className={`restaurant-sidebar ${
        sidebarOpen
          ? "restaurant-sidebar-expanded"
          : "restaurant-sidebar-collapsed"
      }`}
    >
      {/* HEADER */}
      <div className="restaurant-sidebar-header">
        <div className="restaurant-sidebar-logo">
          <span className="restaurant-sidebar-logo-icon">🍽️</span>

          {sidebarOpen && (
            <div className="restaurant-sidebar-logo-text">
              <strong>Restaurant</strong>
              <small>Management</small>
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="restaurant-sidebar-nav">
        <ul className="restaurant-sidebar-menu">
          <SidebarLink
            title="Dashboard"
            icon={<FaTachometerAlt />}
            path="/restaurant/dashboard"
          />
        </ul>

        {/* STORE MANAGEMENT */}
        <div className="restaurant-sidebar-section-title">
          {sidebarOpen ? "STORE MANAGEMENT" : "STORE"}
        </div>

        <ul className="restaurant-sidebar-menu">
          <SidebarLink
            title="New Stores"
            icon={<FaStore />}
            path="/restaurant/stores_request"
          />

          <SidebarLink
            title="Add Store"
            icon={<FaPlusCircle />}
            path="/restaurant/store/add"
          />

          <SidebarLink
            title="Stores List"
            icon={<FaThLarge />}
            path="/restaurant/stores_list"
          />

          <SidebarLink
            title="Restaurant Nearby"
            icon={<FaMapMarkedAlt />}
            path="/restaurant/nearby_restaurant"
          />
        </ul>

        {/* CATEGORY MANAGEMENT */}
        <div className="restaurant-sidebar-section-title">
          {sidebarOpen ? "CATEGORY MANAGEMENT" : "CATEGORY"}
        </div>

        <ul className="restaurant-sidebar-menu">
          <DropdownMenu name="category" title="Category" icon={<FaThLarge />}>
            <SidebarLink
              title="Category List"
              icon={<FaListUl  />}
              path="/restaurant/category_list"
            />

            <SidebarLink
              title="Subcategory List"
              icon={<FaListUl  />}
              path="/restaurant/sub_category_list"
            />
          </DropdownMenu>
        </ul>

        {/* COUPONS MANAGEMENT */}
        <div className="restaurant-sidebar-section-title">
          {sidebarOpen ? "COUPONS MANAGEMENT" : "COUPONS"}
        </div>

        <ul className="restaurant-sidebar-menu">
          <DropdownMenu name="coupons" title="Coupons" icon={<FaGift />}>
            <SidebarLink
              title="All Coupons"
              icon={<FaTags />}
              path="/restaurant/coupons"
            />

            <SidebarLink
              title="Create Coupon"
              icon={<FaPlusCircle />}
              path="/restaurant/coupon/create"
            />
          </DropdownMenu>
        </ul>

        {/* ORDER MANAGEMENT */}
        <div className="restaurant-sidebar-section-title">
          {sidebarOpen ? "ORDER MANAGEMENT" : "ORDERS"}
        </div>

        <ul className="restaurant-sidebar-menu">
          <DropdownMenu name="orders" title="Orders" icon={<FaShoppingCart />}>
            <OrderStatusLink
              title="All Orders"
              count={orderCounts.all ?? 0}
              icon={<FaShoppingBag />}
              path="/restaurant/orders"
            />

            <OrderStatusLink
              title="Pending"
              count={orderCounts.pending ?? 0}
              icon={<FaClock />}
              path="/restaurant/orders/pending"
            />

            <OrderStatusLink
              title="Accepted"
              count={orderCounts.accepted ?? 0}
              icon={<FaCheckCircle />}
              path="/restaurant/orders/accepted"
            />

            <OrderStatusLink
              title="Cancelled"
              count={orderCounts.cancelled ?? 0}
              icon={<FaTimesCircle />}
              path="/restaurant/orders/cancelled"
            />

            <OrderStatusLink
              title="Preparing"
              count={orderCounts.processing ?? 0}
              icon={<FaFire />}
              path="/restaurant/orders/preparing"
            />

            <OrderStatusLink
              title="Ready For Pickup"
              count={orderCounts.ready_for_pickup ?? 0}
              icon={<FaBoxOpen />}
              path="/restaurant/orders/ready_for_pickup"
              highlight
            />

            <OrderStatusLink
              title="Picked Up"
              count={orderCounts.picked_up ?? 0}
              icon={<FaHandHolding />}
              path="/restaurant/orders/picked_up"
              highlight
            />

            <OrderStatusLink
              title="On The Way"
              count={orderCounts.on_the_way ?? 0}
              icon={<FaMotorcycle />}
              path="/restaurant/orders/on_the_way"
            />

            <OrderStatusLink
              title="Delivered"
              count={orderCounts.delivered ?? 0}
              icon={<FaCheckDouble />}
              path="/restaurant/orders/delivered"
              highlight
            />

            <OrderStatusLink
              title="Driver Rejected"
              count={orderCounts.driver_rejected ?? 0}
              icon={<FaUserTimes />}
              path="/restaurant/orders/driver_rejected"
              highlight
            />
          </DropdownMenu>
        </ul>

        {/* PRODUCT MANAGEMENT */}
        <div className="restaurant-sidebar-section-title">
          {sidebarOpen ? "PRODUCT MANAGEMENT" : "MANAGE"}
        </div>

        <ul className="restaurant-sidebar-menu">
          <DropdownMenu
            name="product-management"
            title="Product Setup"
            icon={<FaShoppingCart />}
          >
            <SidebarLink
              title="Add Product"
              icon={<FaPlus />}
              path="/restaurant/add_product"
            />

            <SidebarLink
              title="Menu List"
              icon={<FaList />}
              path="/restaurant/menu_list"
            />

            <SidebarLink
              title="Product List"
              icon={<FaBoxOpen />}
              path="/restaurant/product_list"
            />

            {/* <SidebarLink
              title="Payments"
              icon={<FaCreditCard />}
              path="/restaurant/payments"
            /> */}
          </DropdownMenu>
        </ul>

        {/* DRIVER SECTION */}
        <div className="restaurant-sidebar-section-title">
          {sidebarOpen ? "DRIVER SECTION" : "DRIVER"}
        </div>

        <ul className="restaurant-sidebar-menu">
          <SidebarLink
            title="Add Driver"
            icon={<FaUserPlus />}
            path="/restaurant/add_driver"
          />

          <SidebarLink
            title="Driver List"
            icon={<FaUsers />}
            path="/restaurant/driver_list"
          />

          <SidebarLink
            title="Delivery Estimate Time"
            icon={<FaClock />}
            path="/restaurant/delivery_estimate_time"
          />

          <SidebarLink
            title="Banners"
            icon={<FaImage />}
            path="/restaurant/banners"
          />

          {/* ORDER NOTIFICATION */}
          <NotificationLink
            title="Order Notification"
            icon={<FaBell />}
            path="/restaurant/order_notification"
            count={notificationCount}
          />
        </ul>
      </nav>

      {/* FOOTER */}
      <div className="restaurant-sidebar-footer">
        <button
          type="button"
          className="restaurant-sidebar-collapse-btn"
          onClick={toggleSidebar}
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <span className="restaurant-sidebar-collapse-icon">
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </span>

          {sidebarOpen && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
};

export default RestaurantSidebar;
