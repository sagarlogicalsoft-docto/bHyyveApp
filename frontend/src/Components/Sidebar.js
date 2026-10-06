import React, { useState } from "react";
import "./sidebar.css";
import { Link, useNavigate } from "react-router-dom";
// import "./manubar.css";
import {
  Sidebar as ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
} from "react-pro-sidebar";

import {
  FaHome,
  FaStore,
  FaUserShield,
  FaUsers,
  FaUserTie,
  FaStar,
  FaThLarge,
  FaImages,
  FaCalendarCheck,
  FaConciergeBell,
  FaFileInvoice,
  FaBell,
  FaClock,
  FaChartLine,
  FaTicketAlt,
  FaShieldAlt,
  FaBullhorn,
  FaCity,
  FaQuestionCircle,
  FaUserCircle,
  FaChevronRight,
} from "react-icons/fa";

const Sidebarr = ({ sidebarOpen, setSidebarOpen }) => {
  // const [sidebarOpenLocal, setSidebarOpenLocal] = useState(true);
  // const sidebarOpen = props.sidebarOpen ?? sidebarOpenLocal;
  // const setSidebarOpen = props.setSidebarOpen ?? setSidebarOpenLocal;
  const navigate = useNavigate();

  // Menu items
  const sidebarItems = [
    {
      label: "Dashboard",
      path: "/home",
      icon: FaHome,
    },
    {
      label: "Restaurant",
      path: "/restaurant/dashboard",
      icon: FaStore,
    },
    {
      label: "Sub Admin",
      path: "/sub-admin",
      icon: FaUserShield,
      children: [
        { label: "Subadmin List", path: "/subadmin_list" },
        { label: "Role", path: "/subadmin/role" },
      ],
    },
    {
      label: "Vendor Management",
      path: "/vendormanage",
      icon: FaUsers,
      children: [
        { label: "Vendor List", path: "/vendor_list" },
        { label: "Nearby", path: "/nearby_vendor" },
      ],
    },
    {
      label: "User Management",
      path: "/userlist",
      icon: FaUsers,
      children: [
        { label: "All Users", path: "/users" },
      ],
    },
    {
      label: "Expert Management",
      path: "/Expert Management",
      icon: FaUserTie,
      children: [
        { label: "Add Expert", path: "/add_new_expert" },
        { label: "View Experts", path: "/view_experts" },
      ],
    },
    {
      label: "Reviews",
      path: "/Customer Reviews",
      icon: FaStar,
      children: [
        { label: "App Rating", path: "/app_reviews" },
      ],
    },
    {
      label: "Category Management",
      path: "/Cetagory",
      icon: FaThLarge,
      children: [
        { label: "Category List", path: "/category_list" },
        { label: "Add Category", path: "/add_category" },
        { label: "Sub Category List", path: "/sub_category_list" },
        { label: "Add Sub Category", path: "/add_sub_category" },
      ],
    },
    {
      label: "Vendor Images Slider Images",
      path: "/add_banner",
      icon: FaImages,
      children: [
        { label: "Add Images", path: "/add_vendor_images" },
        { label: "Manage Slider", path: "/all_ven_images" },
      ],
    },
    {
      label: "Booking",
      path: "/Booking",
      icon: FaCalendarCheck,
      children: [
        { label: "New Booking", path: "/new_booking" },
        { label: "Inprogress Bookings", path: "/inprogress_bookings" },
        { label: "Completed Bookings", path: "/completed_bookings" },
        { label: "Rejected Bookings", path: "/rejected_bookings" },
      ],
    },
    {
      label: "AI Booking Manage",
      path: "/AI Booking Manage",
      icon: FaCalendarCheck,
      children: [
        { label: "AI text", path: "/ai_text" },
        { label: "AI Questions", path: "/ai_questions" },
        { label: "Pricing Management", path: "/pricing_management" },
      ],
    },
    {
      label: "Services",
      path: "/Services",
      icon: FaConciergeBell,
      children: [
        { label: "All Services", path: "/services" },
      ],
    },
    {
      label: "Estimates",
      path: "/Estimates",
      icon: FaFileInvoice,
      children: [
        { label: "All Estimates", path: "/estimates" },
        { label: "Create Estimate", path: "/create_estimate" },
        { label: "Mode Type", path: "/mode_type" },
        { label: "Estimate Receipts", path: "/estimate_receipts" },
      ],
    },
    {
      label: "Order Notification",
      path: "/notifications",
      icon: FaBell,
      notificationCount: 291,
    },
    {
      label: "Manage Time Slots",
      path: "/time_slots",
      icon: FaClock,
      children: [
        { label: "All Time Slots", path: "/time_slots" },
      ],
    },
    {
      label: "Revenue Management",
      path: "/overviewsale",
      icon: FaChartLine,
      children: [
        { label: "All Revenue", path: "/all_revenue" },
      ],
    },
    {
      label: "Home Sliders",
      path: "/banners",
      icon: FaImages,
      children: [
        { label: "Add New Sliders", path: "/add_new_slider" },
        { label: "Manage Sliders", path: "/manage_sliders" },
      ],
    },
    {
      label: "Coupon Codes",
      path: "/coupanupdate",
      icon: FaTicketAlt,
      children: [
        { label: "Add New Coupon", path: "/add_coupon" },
        { label: "Manage Coupons", path: "/manage_coupons" },
      ],
    },
    {
      label: "Warranty",
      path: "/Warranty",
      icon: FaShieldAlt,
      children: [
        { label: "Claim Reason", path: "/claim_reason" },
        { label: "Warranty Claims", path: "/warranty_claims" },
      ],
    },
    {
      label: "Advertisement",
      path: "/Add Advertisement",
      icon: FaBullhorn,
      children: [
        { label: "Add New Package", path: "/add_new_package" },
        { label: "Manage Packges/Ads", path: "/manage_packages" },
        { label: "Subscription Transactions", path: "/subscription_transactions" },
      ],
    },
    {
      label: "Cities",
      path: "/Cities",
      icon: FaCity,
      children: [
        { label: "Add New City", path: "/add_new_city" },
        { label: "Manage Cities", path: "/manage_cities" },
      ],
    },
    {
      label: "Help & Support",
      path: "/Contact Us",
      icon: FaQuestionCircle,
      children: [
        { label: "User Chats", path: "/user_chats" },
        { label: "Vendor Chats", path: "/vendor_chats" },
        { label: "User Feedback", path: "/user_feedback" },
        { label: "About Company", path: "/about_company" },
        { label: "FAQ", path: "/faq" },
        { label: "Contact Us", path: "/contact_us" },
        { label: "Help Center", path: "/help_center" },
        { label: "Delivery Charge", path: "/delivery_charge" },
        { label: "Bonus Gift", path: "/bonus_gift" },
        { label: "Referral By User", path: "/referral" },
      ],
    },
  ];

  const renderMenuItems = () => {
    return sidebarItems.map((item) => {
      const Icon = item.icon;


      if (item.children && item.children.length > 0) {
        return (
          <SubMenu
            key={item.label}
            label={item.label}
            icon={<Icon className="sidebar-menu-icon" />}
          >
            {item.children.map((child) => (
              <MenuItem
                key={child.label}
                icon={<FaChevronRight className="child-arrow-icon" />}
                onClick={() => navigate(child.path)}
              >
                {child.label}
              </MenuItem>
            ))}
          </SubMenu>
        );
      }

      // Normal menu item
      return (
        // Normal menu item
        <MenuItem
          key={item.label}
          icon={<Icon className="sidebar-menu-icon" />}
          onClick={() => navigate(item.path)}
          className={`sidebar-menu-item ${item.notificationCount ? "notification-menu-item" : ""
            }`}
        >
          <span className="sidebar-menu-label">
            <span>{item.label}</span>

            {item.notificationCount > 0 && (
              <span className="sidebar-notification-badge">
                {item.notificationCount}
              </span>
            )}
          </span>
        </MenuItem>
      );
  });
};

return (
  <aside
    className={`sidenav ${sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"
      }`}
  >
    {/* Sidebar Header */}
    <div className="sidebar-header">
      {sidebarOpen && (
        <Link to="/home" className="sidebar-logo text-decoration-none">
          <div className="fw-semibold fs-4 text-white">Admin</div>

          <p className="text-white-50">Control Center</p>
        </Link>
      )}

      {/* Toggle Button */}
      <button
        type="button"
        className="sidebar-toggle-btn"
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {sidebarOpen ? "×" : "☰"}
      </button>
    </div>

    {/* Sidebar Menu */}
    <div className="sidebar-menu-wrapper">
      <ProSidebar
        collapsed={!sidebarOpen}
        width="280px"
        collapsedWidth="64px"
        backgroundColor="#073b74"
      >
        <Menu>{renderMenuItems()}</Menu>
      </ProSidebar>
    </div>
  </aside>
);
};

export default Sidebarr;
