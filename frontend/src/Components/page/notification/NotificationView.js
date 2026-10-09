import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./notificationView.css";

const NotificationView = () => {
  const { id } = useParams();

  // =========================================================
  // TEMPORARY DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [bookingData, setBookingData] = useState([
    {
      id: 1,
      bookingDate: "2026/08/14 03:05AM",
      bookingId: "BV656619",
      amount: 508.5,
      vendor: "Virtual Home Photography",
      vendorPhone: "6473906555",
      customer: "Sagar Malik",
      currentStatus: "Completed",
      penaltyStatus: "No Penalty",
    },
  ]);

  // =========================================================
  // PENALTY MODAL
  // =========================================================

  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [penaltyPercentage, setPenaltyPercentage] = useState("");

  // =========================================================
  // OPEN PENALTY MODAL
  // =========================================================

  const handleOpenPenalty = (row) => {
    setSelectedBooking(row);
    setPenaltyPercentage("");
    setShowPenaltyModal(true);
  };

  // =========================================================
  // CLOSE PENALTY MODAL
  // =========================================================

  const handleClosePenalty = () => {
    setShowPenaltyModal(false);
    setSelectedBooking(null);
    setPenaltyPercentage("");
  };

  // =========================================================
  // ADD PENALTY
  // =========================================================

  const handleAddPenalty = () => {
    if (!penaltyPercentage) {
      alert("Please enter penalty percentage.");
      return;
    }

    const penalty = Number(penaltyPercentage);

    if (Number.isNaN(penalty) || penalty <= 0 || penalty > 100) {
      alert("Please enter a valid penalty percentage between 1 and 100.");
      return;
    }

    console.log("Add Penalty API Data:", {
      bookingId: selectedBooking?.bookingId,
      vendorId: 138,
      totalAmount: selectedBooking?.amount,
      penaltyPercentage: penalty,
    });

    // =======================================================
    // API CALL WILL BE CONNECTED HERE LATER
    // =======================================================

    alert(`Penalty of ${penalty}% added successfully.`);

    handleClosePenalty();
  };

  // =========================================================
  // DELETE BOOKING
  // =========================================================

  const handleDelete = (row) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?",
    );

    if (!confirmed) return;

    setBookingData((previous) =>
      previous.filter((item) => item.id !== row.id),
    );

    console.log("Delete Notification:", row);

    // API DELETE CALL LATER
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: (
          <div className="notification-view-select-header">
            <input
              type="checkbox"
              className="notification-view-checkbox"
            />

            <span>All</span>
            <span>Select</span>
          </div>
        ),
        width: "125px",
        sortable: false,

        render: () => (
          <input
            type="checkbox"
            className="notification-view-checkbox"
          />
        ),
      },

      {
        key: "serial",
        label: "S.No.",
        width: "100px",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      {
        key: "bookingDate",
        label: "Booking Date",
        width: "150px",
        sortable: true,

        render: (value) => (
          <div className="notification-view-booking-date">
            {value}
          </div>
        ),
      },

      {
        key: "bookingId",
        label: "BookingID",
        width: "160px",
        sortable: true,

        render: (value) => (
          <span className="notification-view-booking-id">
            {value}
          </span>
        ),
      },

      {
        key: "amount",
        label: "Amount",
        width: "140px",
        sortable: true,

        render: (value) => (
          <strong className="notification-view-amount">
            ${Number(value).toFixed(2)}
          </strong>
        ),
      },

      {
        key: "vendor",
        label: "Vendor",
        width: "180px",
        sortable: true,

        render: (value) => (
          <div className="notification-view-vendor">
            {value}
          </div>
        ),
      },

      {
        key: "vendorPhone",
        label: "Vendor Phone",
        width: "160px",
        sortable: true,
      },

      {
        key: "customer",
        label: "Customer",
        width: "160px",
        sortable: true,
      },

      {
        key: "currentStatus",
        label: "Current Status",
        width: "150px",
        sortable: true,

        render: (value) => (
          <div className="notification-view-status-wrapper">
            <span className="notification-view-status">
              <FaCheckCircle />
              {value}
            </span>

            <span className="notification-view-penalty-status">
              <FaCheckCircle />
              No Penalty
            </span>
          </div>
        ),
      },

      {
        key: "actions",
        label: "Action",
        width: "145px",
        sortable: false,

        render: (_, row) => (
          <div className="notification-view-actions">

            <button
              type="button"
              className="notification-view-btn notification-view-view-btn"
              onClick={() =>
                console.log("View Booking:", row)
              }
            >
              View
            </button>

            <button
              type="button"
              className="notification-view-btn notification-view-delete-btn"
              onClick={() => handleDelete(row)}
            >
              Delete
            </button>

            <button
              type="button"
              className="notification-view-btn notification-view-penalty-btn"
              onClick={() => handleOpenPenalty(row)}
            >
              Add Penalty
            </button>

          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="notification-view-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="notification-view-header">

        <h2 className="notification-view-title">
          Order payment
        </h2>

        <div className="notification-view-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <Link to="/notifications">
            Notifications
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="notification-view-breadcrumb-active">
            Notification
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="notification-view-card">

        <DataTable
          columns={columns}
          data={bookingData}
          entriesPerPageOptions={[10, 25, 50, 100]}
          defaultEntriesPerPage={10}
          searchable={true}
          sortable={true}
        />

      </div>

      {/* =====================================================
          PENALTY MODAL
      ===================================================== */}

      {showPenaltyModal && selectedBooking && (
        <div
          className="notification-view-modal-overlay"
          onClick={handleClosePenalty}
        >

          <div
            className="notification-view-penalty-modal"
            onClick={(event) => event.stopPropagation()}
          >

            {/* Modal Header */}

            <div className="notification-view-modal-header">

              <h3>
                Add Penalty %
              </h3>

              <button
                type="button"
                className="notification-view-modal-close"
                onClick={handleClosePenalty}
              >
                <FaTimes />
              </button>

            </div>

            {/* Modal Body */}

            <div className="notification-view-modal-body">

              <div className="notification-view-detail-row">
                <strong>Booking ID:</strong>
                <span>
                  {selectedBooking.bookingId}
                </span>
              </div>

              <div className="notification-view-detail-row">
                <strong>Vendor ID:</strong>
                <span>
                  138
                </span>
              </div>

              <div className="notification-view-detail-row">
                <strong>Total Amount:</strong>
                <span>
                  ${Number(selectedBooking.amount).toFixed(2)}
                </span>
              </div>

              {/* Penalty Input */}

              <div className="notification-view-input-group">

                <label htmlFor="penaltyPercentage">
                  Add Penalty %
                </label>

                <input
                  id="penaltyPercentage"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Enter penalty percentage"
                  value={penaltyPercentage}
                  onChange={(event) =>
                    setPenaltyPercentage(event.target.value)
                  }
                />

              </div>

            </div>

            {/* Modal Footer */}

            <div className="notification-view-modal-footer">

              <button
                type="button"
                className="notification-view-add-btn"
                onClick={handleAddPenalty}
              >
                Add
              </button>

              <button
                type="button"
                className="notification-view-cancel-btn"
                onClick={handleClosePenalty}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default NotificationView;