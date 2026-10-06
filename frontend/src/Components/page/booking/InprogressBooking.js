import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";

import "./inprogressBooking.css";

const InprogressBooking = () => {
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState([
    {
      id: 1,
      bookedId: "BV934015",
      customerName: "Sagar Malik",
      bookingAddress:
        "Toronto Pearson International Airport (YYZ), YYZ Terminal 3, Mississauga, ON, Canada",
      paidAmount: "$ 3,678.15",
      transaction: "Wallet",
      bookedDate: "16-05-2026",
      bookedTime: "11:00AM",
      status: "In Progress",
    },
    {
      id: 2,
      bookedId: "BV172327",
      customerName: "Sagar Malik",
      bookingAddress:
        "20 Songsparrow Dr, Brampton, ON L6Y 3Z8, Canada",
      paidAmount: "$ 3,678.15",
      transaction: "Wallet",
      bookedDate: "15-05-2026",
      bookedTime: "01:00PM",
      status: "In Progress",
    },
    {
      id: 3,
      bookedId: "BV659994",
      customerName: "Sagar Malik",
      bookingAddress:
        "Toronto Pearson International Airport, Terminal 3, Mississauga, Ontario, Canada",
      paidAmount: "$ 2,657.76",
      transaction: "Wallet",
      bookedDate: "04-05-2026",
      bookedTime: "09:00AM",
      status: "In Progress",
    },
    {
      id: 4,
      bookedId: "BV023767",
      customerName: "shiii dev",
      bookingAddress:
        "24 Main Street, Toronto, Ontario, Canada",
      paidAmount: "$ 22.60",
      transaction: "Wallet",
      bookedDate: "24-04-2026",
      bookedTime: "08:00PM",
      status: "In Progress",
    },
    {
      id: 5,
      bookedId: "BV953628",
      customerName: "Sagar Malik",
      bookingAddress:
        "100 Queen Street West, Toronto, Ontario, Canada",
      paidAmount: "$ 221.48",
      transaction: "Wallet",
      bookedDate: "20-03-2026",
      bookedTime: "03:00PM",
      status: "In Progress",
    },
  ]);

  // =========================================================
  // VIEW BOOKING
  // =========================================================

  const handleView = (id) => {
    console.log("View Booking:", id);

    navigate(`/inprogress_bookings/view/${id}`);
  };

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  const handleCancel = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    setBookingData((previous) =>
      previous.filter((booking) => booking.id !== id)
    );

    console.log("Cancel Booking:", id);

    // API call later
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "Sr.No",
        width: "90px",
        sortable: false,
        render: (_, row, rowIndex) => rowIndex + 1,
      },

      {
        key: "bookedId",
        label: "Booked ID",
        width: "140px",
        sortable: true,
      },

      {
        key: "customerName",
        label: "Customer Name",
        width: "160px",
        sortable: true,
      },

      {
        key: "bookingAddress",
        label: "Booking Address",
        width: "220px",
        sortable: true,

        render: (value) => (
          <div className="inprogress-booking-address">
            {value}
          </div>
        ),
      },

      {
        key: "paidAmount",
        label: "Paid Amount",
        width: "150px",
        sortable: true,
      },

      {
        key: "transaction",
        label: "Transaction",
        width: "140px",
        sortable: true,
      },

      {
        key: "bookedDateTime",
        label: "Booked DateTime",
        width: "160px",
        sortable: true,

        render: (_, row) => (
          <div className="inprogress-booking-datetime">
            <div>{row.bookedDate}</div>
            <div>{row.bookedTime}</div>
          </div>
        ),
      },

      {
        key: "status",
        label: "Status",
        width: "140px",
        sortable: true,

        render: (value) => (
          <span className="inprogress-booking-status">
            {value}
          </span>
        ),
      },

      {
        key: "action",
        label: "Action",
        width: "120px",
        sortable: false,

        render: (_, row) => (
          <div className="inprogress-booking-actions">
            <button
              type="button"
              className="inprogress-cancel-btn"
              onClick={() => handleCancel(row.id)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="inprogress-view-btn"
              onClick={() => handleView(row.id)}
            >
              View
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="inprogress-booking-page">

      {/* PAGE HEADER */}

      <div className="inprogress-booking-page-header">
        <div>
          <h2 className="inprogress-booking-page-title">
            All Inprocessing Bookings
          </h2>

          <div className="inprogress-booking-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="inprogress-booking-breadcrumb-active">
              Inprocessing Bookings
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CARD */}

      <div className="inprogress-booking-card">

        <div className="inprogress-booking-card-header">
          <h3>All Inprocessing Bookings</h3>
        </div>

        <div className="inprogress-booking-table-wrapper">
          <DataTable
            columns={columns}
            data={bookingData}
            entriesPerPageOptions={[5, 10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />
        </div>

      </div>
    </div>
  );
};

export default InprogressBooking;