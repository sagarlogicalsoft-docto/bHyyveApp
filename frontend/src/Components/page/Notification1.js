import React, { useMemo, useState } from "react";
import {
  FaBell,
  FaCheckDouble,
  FaSearch,
  FaTrash,
  FaShoppingCart,
  FaUserPlus,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaBoxOpen,
  FaCalendarAlt,
  FaChevronDown,
  FaArrowRight,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import "./notification1.css";

const Notification1 = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order",
      title: "New Order Received",
      message: "A new order #ORD-1024 has been placed by John Doe.",
      time: "2 minutes ago",
      date: "Today",
      read: false,
      path: "/admin/orders",
    },
    {
      id: 2,
      type: "vendor",
      title: "New Vendor Registration",
      message:
        "ABC Store has submitted a new vendor registration request.",
      time: "15 minutes ago",
      date: "Today",
      read: false,
      path: "/admin/vendors",
    },
    {
      id: 3,
      type: "claim",
      title: "New Warranty Claim",
      message: "Warranty claim #WC-204 requires your attention.",
      time: "1 hour ago",
      date: "Today",
      read: false,
      path: "/admin/warranty-claims",
    },
    {
      id: 4,
      type: "payment",
      title: "Payment Completed",
      message:
        "Vendor payment of ₹12,500 has been successfully processed.",
      time: "3 hours ago",
      date: "Today",
      read: true,
      path: "/admin/transactions",
    },
    {
      id: 5,
      type: "product",
      title: "Low Stock Alert",
      message:
        "Product 'Premium Headphones' has reached its minimum stock level.",
      time: "5 hours ago",
      date: "Today",
      read: false,
      path: "/admin/products",
    },
    {
      id: 6,
      type: "vendor",
      title: "Vendor Approval Required",
      message: "XYZ Electronics is waiting for admin approval.",
      time: "Yesterday",
      date: "Yesterday",
      read: true,
      path: "/admin/vendors",
    },
    {
      id: 7,
      type: "order",
      title: "Order Cancelled",
      message:
        "Order #ORD-1018 has been cancelled by the customer.",
      time: "Yesterday",
      date: "Yesterday",
      read: true,
      path: "/admin/orders",
    },
    {
      id: 8,
      type: "payment",
      title: "Withdrawal Request",
      message:
        "A vendor has submitted a new withdrawal request.",
      time: "2 days ago",
      date: "Earlier",
      read: true,
      path: "/admin/transactions",
    },
  ]);

  const filterOptions = [
    "All",
    "Unread",
    "Orders",
    "Vendors",
    "Payments",
    "Claims",
    "Products",
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <FaShoppingCart />;

      case "vendor":
        return <FaUserPlus />;

      case "claim":
        return <FaExclamationTriangle />;

      case "payment":
        return <FaMoneyBillWave />;

      case "product":
        return <FaBoxOpen />;

      default:
        return <FaBell />;
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case "order":
        return "notification-icon order";

      case "vendor":
        return "notification-icon vendor";

      case "claim":
        return "notification-icon claim";

      case "payment":
        return "notification-icon payment";

      case "product":
        return "notification-icon product";

      default:
        return "notification-icon";
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        notification.title.toLowerCase().includes(search) ||
        notification.message.toLowerCase().includes(search);

      let matchesFilter = true;

      if (activeFilter === "Unread") {
        matchesFilter = !notification.read;
      }

      if (activeFilter === "Orders") {
        matchesFilter = notification.type === "order";
      }

      if (activeFilter === "Vendors") {
        matchesFilter = notification.type === "vendor";
      }

      if (activeFilter === "Payments") {
        matchesFilter = notification.type === "payment";
      }

      if (activeFilter === "Claims") {
        matchesFilter = notification.type === "claim";
      }

      if (activeFilter === "Products") {
        matchesFilter = notification.type === "product";
      }

      return matchesSearch && matchesFilter;
    });
  }, [notifications, searchTerm, activeFilter]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const handleNotificationClick = (notification) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notification.id
          ? { ...item, read: true }
          : item
      )
    );

    if (notification.path) {
      navigate(notification.path);
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="notifications-page">

      {/* Breadcrumb */}

      <div className="notifications-breadcrumb">
        <Link to="/home">Home</Link>

        <FaArrowRight className="breadcrumb-arrow" />

        <span>Notifications</span>
      </div>

      {/* Page Header */}

      <div className="notifications-header">

        <div className="notifications-title-section">

          <div className="notifications-title-icon">
            <FaBell />
          </div>

          <div>
            <h2>Notifications</h2>

            <p>
              Stay updated with important activities and alerts.
            </p>
          </div>

        </div>

        <div className="notification-header-actions">

          {unreadCount > 0 && (
            <button
              type="button"
              className="mark-all-btn"
              onClick={handleMarkAllAsRead}
            >
              <FaCheckDouble />
              Mark All as Read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              className="clear-all-btn"
              onClick={handleClearAll}
            >
              <FaTrash />
              Clear All
            </button>
          )}

        </div>

      </div>

      {/* Summary */}

      <div className="notification-summary">

        <div className="summary-item">

          <div className="summary-icon">
            <FaBell />
          </div>

          <div>
            <span>Total Notifications</span>
            <strong>{notifications.length}</strong>
          </div>

        </div>

        <div className="summary-item">

          <div className="summary-icon unread">
            <FaExclamationTriangle />
          </div>

          <div>
            <span>Unread Notifications</span>
            <strong>{unreadCount}</strong>
          </div>

        </div>

      </div>

      {/* Notifications Card */}

      <div className="notifications-card">

        {/* Toolbar */}

        <div className="notifications-toolbar">

          <div className="notification-filters">

            {filterOptions.map((filter) => (
              <button
                type="button"
                key={filter}
                className={
                  activeFilter === filter
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() => setActiveFilter(filter)}
              >
                {filter}

                {filter === "Unread" && unreadCount > 0 && (
                  <span className="filter-count">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}

          </div>

          <div className="notification-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>

        </div>

        {/* Notification List */}

        <div className="notification-list">

          {filteredNotifications.length > 0 ? (

            filteredNotifications.map((notification) => (

              <div
                key={notification.id}
                className={
                  notification.read
                    ? "notification-row"
                    : "notification-row unread"
                }
              >

                <div
                  className={getNotificationClass(
                    notification.type
                  )}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                <div
                  className="notification-content"
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                >

                  <div className="notification-title-row">

                    <h4>{notification.title}</h4>

                    {!notification.read && (
                      <span className="unread-dot"></span>
                    )}

                  </div>

                  <p>{notification.message}</p>

                  <div className="notification-meta">

                    <span>
                      <FaCalendarAlt />
                      {notification.time}
                    </span>

                    <span>
                      {notification.date}
                    </span>

                  </div>

                </div>

                <div className="notification-actions">

                  {!notification.read && (
                    <button
                      type="button"
                      className="notification-action-btn"
                      title="Mark as read"
                      onClick={() =>
                        handleMarkAsRead(notification.id)
                      }
                    >
                      <FaCheckDouble />
                    </button>
                  )}

                  <button
                    type="button"
                    className="notification-action-btn delete"
                    title="Delete"
                    onClick={() =>
                      handleDeleteNotification(
                        notification.id
                      )
                    }
                  >
                    <FaTrash />
                  </button>

                  <button
                    type="button"
                    className="notification-view-btn"
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                  >
                    View
                    <FaArrowRight />
                  </button>

                </div>

              </div>

            ))

          ) : (

            <div className="empty-notifications">

              <div className="empty-notification-icon">
                <FaBell />
              </div>

              <h3>No Notifications Found</h3>

              <p>
                There are no notifications matching your
                current search or filter.
              </p>

              {(searchTerm || activeFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveFilter("All");
                  }}
                >
                  Clear Filters
                </button>
              )}

            </div>

          )}

        </div>

        {/* Footer */}

        {filteredNotifications.length > 0 && (
          <div className="notifications-footer">

            <span>
              Showing{" "}
              <strong>
                {filteredNotifications.length}
              </strong>{" "}
              notifications
            </span>

            <button type="button">
              Load More
              <FaChevronDown />
            </button>

          </div>
        )}

      </div>

    </div>
  );
};

export default Notification1;