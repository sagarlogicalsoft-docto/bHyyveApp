import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaTrash } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./notificationList.css";

const NotificationList = () => {
      const navigate = useNavigate();
  // =========================================================
  // TEMPORARY NOTIFICATION DATA
  // =========================================================
  // Later this data can come directly from backend API.
  // =========================================================

  const [notificationData, setNotificationData] = useState([
    {
      id: 1,
      title: "Order Accepted",
      message: "Your Order Has Been Accepted by Service Provider",
      sender: "Vendor",
      receiver: "user",
      type: "booking",
      status: "Unseen",
    },
    {
      id: 2,
      title: "New Service Booking",
      message:
        "You have received a new service booking from Sagar Malik for Virtual Home Photography.",
      sender: "user",
      receiver: "vendor",
      type: "booking",
      status: "Unseen",
    },
    {
      id: 3,
      title: "Order Booked",
      message:
        "Your Order Received Successfully & Order Otp is 6320. Remember Your Order otp.",
      sender: "vendor",
      receiver: "user",
      type: "booking",
      status: "Unseen",
    },
    {
      id: 4,
      title: "New Service Booking",
      message:
        "You have received a new service booking from Rahul Testing for Rahul Developer.",
      sender: "user",
      receiver: "vendor",
      type: "booking",
      status: "Unseen",
    },
    {
      id: 5,
      title: "Order Accepted",
      message:
        "Your Order Has Been Accepted by Service Provider.",
      sender: "Vendor",
      receiver: "user",
      type: "booking",
      status: "Unseen",
    },
    {
      id: 6,
      title: "New Service Booking",
      message:
        "You have received a new service booking from customer.",
      sender: "user",
      receiver: "vendor",
      type: "booking",
      status: "Unseen",
    },
    {
      id: 7,
      title: "Order Booked",
      message:
        "Your Order Received Successfully. Remember Your Order otp.",
      sender: "vendor",
      receiver: "user",
      type: "booking",
      status: "Unseen",
    },
  ]);

  // =========================================================
  // SELECTED NOTIFICATIONS
  // =========================================================

  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // =========================================================
  // SELECT / UNSELECT SINGLE NOTIFICATION
  // =========================================================

  const handleSelectNotification = (id) => {
    setSelectedNotifications((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });
  };

  // =========================================================
  // SELECT ALL
  // =========================================================

  const handleSelectAll = () => {
    if (
      notificationData.length > 0 &&
      selectedNotifications.length === notificationData.length
    ) {
      setSelectedNotifications([]);
      return;
    }

    setSelectedNotifications(
      notificationData.map((notification) => notification.id),
    );
  };

  // =========================================================
  // DELETE SELECTED NOTIFICATIONS
  // =========================================================

  const handleDeleteSelected = () => {
    if (selectedNotifications.length === 0) {
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedNotifications.length} selected notification(s)?`,
    );

    if (!confirmed) {
      return;
    }
    setNotificationData((previous) =>
      previous.filter(
        (notification) =>
          !selectedNotifications.includes(notification.id),
      ),
    );

    console.log(
      "Delete Selected Notifications:",
      selectedNotifications,
    );

    setSelectedNotifications([]);

    // =======================================================
    // BACKEND API WILL COME HERE LATER
    // =======================================================
    // Example:
    // await deleteNotificationsAPI(selectedNotifications);
    //
    // =======================================================
  };

  // =========================================================
  // OPEN NOTIFICATION
  // =========================================================

const handleOpenNotification = (row) => {
  navigate(`/notification/view/${row.id}`, {
    state: {
      notification: row,
    },
  });
};
  

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      // =====================================================
      // SELECT
      // =====================================================

      {
        key: "select",
        label: (
          <div className="notification-select-header">
            <input
              type="checkbox"
              className="notification-checkbox"
              checked={
                notificationData.length > 0 &&
                selectedNotifications.length ===
                  notificationData.length
              }
              onChange={handleSelectAll}
            />

            <span>All Select</span>
          </div>
        ),

        width: "135px",
        sortable: false,

        render: (_, row) => (
          <input
            type="checkbox"
            className="notification-checkbox"
            checked={selectedNotifications.includes(row.id)}
            onChange={() =>
              handleSelectNotification(row.id)
            }
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },

      // =====================================================
      // SERIAL NUMBER
      // =====================================================

      {
        key: "id",
        label: "Sr.No",
        width: "115px",
        sortable: true,
      },

      // =====================================================
      // TITLE
      // =====================================================

      {
        key: "title",
        label: "Title",
        width: "170px",
        sortable: true,

        render: (value) => (
          <div className="notification-title">
            {value}
          </div>
        ),
      },

      // =====================================================
      // MESSAGE
      // =====================================================

      {
        key: "message",
        label: "Message",
        width: "330px",
        sortable: true,

        render: (value) => (
          <div className="notification-message">
            {value}
          </div>
        ),
      },

      // =====================================================
      // SENDER
      // =====================================================

      {
        key: "sender",
        label: "Sender",
        width: "130px",
        sortable: true,

        render: (value) => (
          <div className="notification-text">
            {value}
          </div>
        ),
      },

      // =====================================================
      // RECEIVER
      // =====================================================

      {
        key: "receiver",
        label: "Receiver",
        width: "145px",
        sortable: true,

        render: (value) => (
          <div className="notification-text">
            {value}
          </div>
        ),
      },

      // =====================================================
      // TYPE
      // =====================================================

      {
        key: "type",
        label: "Type",
        width: "120px",
        sortable: true,

        render: (value) => (
          <div className="notification-text">
            {value}
          </div>
        ),
      },

      // =====================================================
      // STATUS
      // =====================================================

      {
        key: "status",
        label: "Status",
        width: "125px",
        sortable: true,
        render: (value) => (
          <span
            className={`notification-status ${
              value.toLowerCase() === "seen"
                ? "notification-status-seen"
                : "notification-status-unseen"
            }`}
          >
            {value}
          </span>
        ),
      },

      // =====================================================
      // ACTION
      // =====================================================

      {
        key: "actions",
        label: "Action",
        width: "115px",
        sortable: false,
        render: (_, row) => (
          <button
            type="button"
            className="notification-open-btn"
            onClick={() => handleOpenNotification(row)}
          >
            Open
          </button>
        ),
      },
    ],
    [notificationData, selectedNotifications],
  );

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="notification-page">

      {/* =====================================================
          PAGE HEADER / BREADCRUMB
      ===================================================== */}

      <div className="notification-page-header">
        <div className="notification-breadcrumb">
          <Link to="/home">
            Home
          </Link>
          <span className="notification-breadcrumb-arrow">
            <IoIosArrowForward />
          </span>
          <span className="notification-breadcrumb-active">
            Notification List
          </span>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="notification-card">

        {/* ===================================================
            CARD TITLE
        =================================================== */}

        <div className="notification-card-header">
          <h2>
            All Notification Data
          </h2>
        </div>

        {/* ===================================================
            DATA TABLE
        =================================================== */}

        <div className="notification-table-wrapper">
          <DataTable
            columns={columns}
            data={notificationData}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />
        </div>

        {/* ===================================================
            DELETE SELECTED
            ONLY SHOW WHEN SOMETHING IS SELECTED
        =================================================== */}

        {selectedNotifications.length > 0 && (
          <div className="notification-selected-footer">

            <button
              type="button"
              className="notification-delete-selected-btn"
              onClick={handleDeleteSelected}
            >
              <FaTrash />

              <span>
                Delete All
              </span>

              <span>
                ({selectedNotifications.length})
              </span>
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;