import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaCheckCircle, FaTimes, FaTrash } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./allRevenue.css";

const AllRevenue = () => {
  // =========================================================
  // TEMPORARY REVENUE DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [revenueData, setRevenueData] = useState([
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
    {
      id: 2,
      bookingDate: "2026/08/13 11:30AM",
      bookingId: "BV656620",
      amount: 325.0,
      vendor: "Velvet Touch Cleaning Co.",
      vendorPhone: "6473906556",
      customer: "Rahul Testing",
      currentStatus: "Completed",
      penaltyStatus: "No Penalty",
    },
    {
      id: 3,
      bookingDate: "2026/08/13 09:15AM",
      bookingId: "BV656621",
      amount: 450.75,
      vendor: "One More Bite",
      vendorPhone: "6473906557",
      customer: "Amit Kumar",
      currentStatus: "Completed",
      penaltyStatus: "No Penalty",
    },
    {
      id: 4,
      bookingDate: "2026/08/12 05:45PM",
      bookingId: "BV656622",
      amount: 275.25,
      vendor: "bHyyve Marketplace",
      vendorPhone: "6473906558",
      customer: "Neha Sharma",
      currentStatus: "Completed",
      penaltyStatus: "No Penalty",
    },
    {
      id: 5,
      bookingDate: "2026/08/12 02:20PM",
      bookingId: "BV656623",
      amount: 699.99,
      vendor: "Virtual Home Photography",
      vendorPhone: "6473906555",
      customer: "Rohit Singh",
      currentStatus: "Completed",
      penaltyStatus: "No Penalty",
    },
    {
      id: 6,
      bookingDate: "2026/08/11 10:10AM",
      bookingId: "BV656624",
      amount: 185.5,
      vendor: "Velvet Touch Cleaning Co.",
      vendorPhone: "6473906556",
      customer: "Priya Patel",
      currentStatus: "Completed",
      penaltyStatus: "No Penalty",
    },
    {
      id: 7,
      bookingDate: "2026/08/10 04:35PM",
      bookingId: "BV656625",
      amount: 825.0,
      vendor: "One More Bite",
      vendorPhone: "6473906557",
      customer: "Karan Mehta",
      currentStatus: "Completed",
      penaltyStatus: "No Penalty",
    },
    {
      id: 8,
      bookingDate: "2026/08/10 12:40PM",
      bookingId: "BV656626",
      amount: 390.0,
      vendor: "bHyyve Marketplace",
      vendorPhone: "6473906558",
      customer: "Anjali Verma",
      currentStatus: "Completed",
      penaltyStatus: "No Penalty",
    },
  ]);

  // =========================================================
  // SELECTED REVENUE
  // =========================================================

  const [selectedRevenue, setSelectedRevenue] = useState([]);

  // =========================================================
  // PENALTY MODAL
  // =========================================================

  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [penaltyPercentage, setPenaltyPercentage] = useState("");

  // =========================================================
  // SELECT / UNSELECT SINGLE
  // =========================================================

  const handleSelectRevenue = (id) => {
    setSelectedRevenue((previous) => {
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
      revenueData.length > 0 &&
      selectedRevenue.length === revenueData.length
    ) {
      setSelectedRevenue([]);
      return;
    }

    setSelectedRevenue(revenueData.map((item) => item.id));
  };

  // =========================================================
  // DELETE SINGLE
  // =========================================================

  const handleDelete = (row) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this revenue record?",
    );

    if (!confirmed) return;

    setRevenueData((previous) =>
      previous.filter((item) => item.id !== row.id),
    );

    setSelectedRevenue((previous) =>
      previous.filter((item) => item !== row.id),
    );

    console.log("Delete Revenue:", row);

    // API DELETE CALL LATER
  };

  // =========================================================
  // DELETE SELECTED
  // =========================================================

  const handleDeleteSelected = () => {
    if (selectedRevenue.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedRevenue.length} selected revenue record(s)?`,
    );

    if (!confirmed) {
      return;
    }

    setRevenueData((previous) =>
      previous.filter(
        (item) => !selectedRevenue.includes(item.id),
      ),
    );

    console.log("Delete Selected Revenue:", selectedRevenue);

    setSelectedRevenue([]);

    // API DELETE CALL LATER
  };

  // =========================================================
  // VIEW
  // =========================================================

  const handleView = (row) => {
    console.log("View Revenue:", row);

    // Navigation can be connected here later.
  };

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

    if (
      Number.isNaN(penalty) ||
      penalty <= 0 ||
      penalty > 100
    ) {
      alert(
        "Please enter a valid penalty percentage between 1 and 100.",
      );
      return;
    }

    console.log("Add Penalty API Data:", {
      bookingId: selectedBooking?.bookingId,
      vendorId: 138,
      totalAmount: selectedBooking?.amount,
      penaltyPercentage: penalty,
    });

    setRevenueData((previous) =>
      previous.map((item) =>
        item.id === selectedBooking?.id
          ? {
              ...item,
              penaltyStatus: `${penalty}% Penalty`,
            }
          : item,
      ),
    );

    alert(`Penalty of ${penalty}% added successfully.`);

    handleClosePenalty();

    // API CALL WILL BE CONNECTED HERE LATER
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
          <div className="all-revenue-select-header">
            <input
              type="checkbox"
              className="all-revenue-checkbox"
              checked={
                revenueData.length > 0 &&
                selectedRevenue.length === revenueData.length
              }
              onChange={handleSelectAll}
            />

            <span>All</span>
            <span>Select</span>
          </div>
        ),
        width: "125px",
        sortable: false,

        render: (_, row) => (
          <input
            type="checkbox"
            className="all-revenue-checkbox"
            checked={selectedRevenue.includes(row.id)}
            onChange={() => handleSelectRevenue(row.id)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },

      // =====================================================
      // SERIAL NUMBER
      // =====================================================

      {
        key: "serial",
        label: "S.No.",
        width: "100px",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      // =====================================================
      // BOOKING DATE
      // =====================================================

      {
        key: "bookingDate",
        label: "Booking Date",
        width: "150px",
        sortable: true,

        render: (value) => (
          <div className="all-revenue-booking-date">
            {value}
          </div>
        ),
      },

      // =====================================================
      // BOOKING ID
      // =====================================================

      {
        key: "bookingId",
        label: "BookingID",
        width: "160px",
        sortable: true,

        render: (value) => (
          <span className="all-revenue-booking-id">
            {value}
          </span>
        ),
      },

      // =====================================================
      // AMOUNT
      // =====================================================

      {
        key: "amount",
        label: "Amount",
        width: "140px",
        sortable: true,

        render: (value) => (
          <strong className="all-revenue-amount">
            ${Number(value).toFixed(2)}
          </strong>
        ),
      },

      // =====================================================
      // VENDOR
      // =====================================================

      {
        key: "vendor",
        label: "Vendor",
        width: "180px",
        sortable: true,

        render: (value) => (
          <div className="all-revenue-vendor">
            {value}
          </div>
        ),
      },

      // =====================================================
      // VENDOR PHONE
      // =====================================================

      {
        key: "vendorPhone",
        label: "Vendor Phone",
        width: "160px",
        sortable: true,
      },

      // =====================================================
      // CUSTOMER
      // =====================================================

      {
        key: "customer",
        label: "Customer",
        width: "160px",
        sortable: true,
      },

      // =====================================================
      // CURRENT STATUS + PENALTY
      // =====================================================

      {
        key: "currentStatus",
        label: "Current Status",
        width: "150px",
        sortable: true,

        render: (value, row) => (
          <div className="all-revenue-status-wrapper">
            <span className="all-revenue-status">
              <FaCheckCircle />
              {value}
            </span>

            <span className="all-revenue-penalty-status">
              <FaCheckCircle />
              {row.penaltyStatus}
            </span>
          </div>
        ),
      },

      // =====================================================
      // ACTION
      // =====================================================

      {
        key: "actions",
        label: "Action",
        width: "145px",
        sortable: false,

        render: (_, row) => (
          <div className="all-revenue-actions">
            {/* VIEW */}

            <button
              type="button"
              className="all-revenue-btn all-revenue-view-btn"
              onClick={() => handleView(row)}
            >
              View
            </button>

            {/* DELETE */}

            <button
              type="button"
              className="all-revenue-btn all-revenue-delete-btn"
              onClick={() => handleDelete(row)}
            >
              Delete
            </button>

            {/* ADD PENALTY */}

            <button
              type="button"
              className="all-revenue-btn all-revenue-penalty-btn"
              onClick={() => handleOpenPenalty(row)}
            >
              Add Penalty
            </button>
          </div>
        ),
      },
    ],
    [revenueData, selectedRevenue],
  );

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="all-revenue-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="all-revenue-header">

        <h2 className="all-revenue-title">
          All Revenue
        </h2>

        <div className="all-revenue-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="all-revenue-breadcrumb-active">
            All Revenue
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="all-revenue-card">

        <DataTable
          columns={columns}
          data={revenueData}
          entriesPerPageOptions={[10, 25, 50, 100]}
          defaultEntriesPerPage={10}
          searchable={true}
          sortable={true}
        />

        {/* ===================================================
            DELETE SELECTED
        =================================================== */}

        {selectedRevenue.length > 0 && (
          <div className="all-revenue-selected-footer">

            <button
              type="button"
              className="all-revenue-delete-selected-btn"
              onClick={handleDeleteSelected}
            >
              <FaTrash />

              <span>
                Delete All
              </span>

              <span>
                ({selectedRevenue.length})
              </span>
            </button>

          </div>
        )}

      </div>

      {/* =====================================================
          PENALTY MODAL
      ===================================================== */}

      {showPenaltyModal && selectedBooking && (
        <div
          className="all-revenue-modal-overlay"
          onClick={handleClosePenalty}
        >

          <div
            className="all-revenue-penalty-modal"
            onClick={(event) => event.stopPropagation()}
          >

            {/* Modal Header */}

            <div className="all-revenue-modal-header">

              <h3>
                Add Penalty %
              </h3>

              <button
                type="button"
                className="all-revenue-modal-close"
                onClick={handleClosePenalty}
              >
                <FaTimes />
              </button>

            </div>

            {/* Modal Body */}

            <div className="all-revenue-modal-body">

              <div className="all-revenue-detail-row">

                <strong>
                  Booking ID:
                </strong>

                <span>
                  {selectedBooking.bookingId}
                </span>

              </div>

              <div className="all-revenue-detail-row">

                <strong>
                  Vendor ID:
                </strong>

                <span>
                  138
                </span>

              </div>

              <div className="all-revenue-detail-row">

                <strong>
                  Total Amount:
                </strong>

                <span>
                  $
                  {Number(
                    selectedBooking.amount,
                  ).toFixed(2)}
                </span>

              </div>

              {/* Penalty Input */}

              <div className="all-revenue-input-group">

                <label htmlFor="allRevenuePenaltyPercentage">
                  Add Penalty %
                </label>

                <input
                  id="allRevenuePenaltyPercentage"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Enter penalty percentage"
                  value={penaltyPercentage}
                  onChange={(event) =>
                    setPenaltyPercentage(
                      event.target.value,
                    )
                  }
                />

              </div>

            </div>

            {/* Modal Footer */}

            <div className="all-revenue-modal-footer">

              <button
                type="button"
                className="all-revenue-add-btn"
                onClick={handleAddPenalty}
              >
                Add
              </button>

              <button
                type="button"
                className="all-revenue-cancel-btn"
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

export default AllRevenue;