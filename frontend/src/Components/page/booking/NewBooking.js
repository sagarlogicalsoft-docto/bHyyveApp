import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";

import "./newBooking.css";

const NewBooking = () => {
  const navigate = useNavigate();

  // =========================================================
  // TEMPORARY DATA
  // Later API data will come here
  // =========================================================

  const bookingData = [
    {
      id: 1,
      bookedId: "BV303538",
      customerName: "Sagar Malik",
      bookingAddress: "20 Songsparrow Dr, Brampton, ON L6Y 3Z8, Canada",
      paidAmount: "$ 664.44",
      transaction: "Wallet",
      bookedDateTime: "11-08-2026 10:00AM",
      status: "Pending",
    },
    {
      id: 2,
      bookedId: "BV303537",
      customerName: "Sagar Malik",
      bookingAddress: "20 Songsparrow Dr, Brampton, ON L6Y 3Z8, Canada",
      paidAmount: "$ 3,678.15",
      transaction: "Wallet",
      bookedDateTime: "11-08-2026 10:00AM",
      status: "Pending",
    },
    {
      id: 3,
      bookedId: "BV475170",
      customerName: "Sagar Malik",
      bookingAddress: "20 Songsparrow Drive, Brampton, ON, Canada",
      paidAmount: "$ 157.07",
      transaction: "Wallet",
      bookedDateTime: "01-07-2026 10:00AM",
      status: "Pending",
    },
    {
      id: 4,
      bookedId: "BV434274",
      customerName: "Sagar Malik",
      bookingAddress: "20 Songsparrow Drive, Brampton, ON, Canada",
      paidAmount: "$ 664.44",
      transaction: "Wallet",
      bookedDateTime: "11-08-2026 10:00AM",
      status: "Pending",
    },
    {
      id: 5,
      bookedId: "BV434275",
      customerName: "Sagar Malik",
      bookingAddress: "20 Songsparrow Drive, Brampton, ON, Canada",
      paidAmount: "$ 250.00",
      transaction: "Wallet",
      bookedDateTime: "10-08-2026 10:00AM",
      status: "Pending",
    },
    {
      id: 6,
      bookedId: "BV434276",
      customerName: "Sagar Malik",
      bookingAddress: "20 Songsparrow Drive, Brampton, ON, Canada",
      paidAmount: "$ 450.00",
      transaction: "Wallet",
      bookedDateTime: "09-08-2026 10:00AM",
      status: "Pending",
    },
    {
      id: 7,
      bookedId: "BV434J487",
      customerName: "John Doe",
      bookingAddress: "39 APLAUT, PINCHART ROAD, BAKLOACT, USA 338840",
      paidAmount: "$ 10023.00",
      transaction: "UPI",
      bookedDateTime: "12-08-2026 10:00PM",
      status: "Success",
    },
  ];

  // =========================================================
  // VIEW BOOKING
  // =========================================================

  const handleView = (id) => {
    console.log("View Booking:", id);

    // Later API/detail page
    navigate(`/new_booking/view/${id}`);
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "Sno",
        width: "70px",
        sortable: false,

        render: (_, row, rowIndex) => rowIndex + 1,
      },

      {
        key: "bookedId",
        label: "Booked ID",
        width: "145px",
        sortable: true,
      },

      {
        key: "customerName",
        label: "Customer Name",
        width: "165px",
        sortable: true,
      },

      {
        key: "bookingAddress",
        label: "Booking Address",
        width: "230px",
        sortable: true,

        render: (value) => (
          <div className="booking-address">
            {value}
          </div>
        ),
      },

      {
        key: "paidAmount",
        label: "Paid Amount",
        width: "145px",
        sortable: true,
      },

      {
        key: "transaction",
        label: "Transaction",
        width: "145px",
        sortable: true,
      },

      {
        key: "bookedDateTime",
        label: "Booked DateTime",
        width: "160px",
        sortable: true,

        render: (value) => {
          const [date, time] = value.split(" ");

          return (
            <div className="booking-datetime">
              <span>{date}</span>
              <span>{time}</span>
            </div>
          );
        },
      },

      {
        key: "status",
        label: "Status",
        width: "115px",
        sortable: true,

        render: (value) => (
          <span
            className={`booking-status ${
              value === "Pending"
                ? "booking-status-pending"
                : value === "Completed"
                  ? "booking-status-completed"
                  : "booking-status-cancelled"
            }`}
          >
            {value}
          </span>
        ),
      },

      {
        key: "actions",
        label: "Action",
        width: "90px",
        sortable: false,

        render: (_, row) => (
          <button
            type="button"
            className="booking-view-btn"
            onClick={() => handleView(row.id)}
          >
            View
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="booking-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="booking-page-header">
        <div>
          <h2 className="booking-page-title">
            All New Bookings
          </h2>

          <div className="booking-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="booking-breadcrumb-active">
              New Bookings
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="booking-card">

        <div className="booking-card-header">
          <h3>All New Bookings</h3>
        </div>

        {/* ===================================================
            DATATABLE
        =================================================== */}

        <div className="booking-table-wrapper">
          <DataTable
            columns={columns}
            data={bookingData}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />
        </div>

      </div>
    </div>
  );
};

export default NewBooking;