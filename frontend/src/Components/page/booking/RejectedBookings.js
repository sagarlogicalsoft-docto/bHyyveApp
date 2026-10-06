import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";

import "./rejectedBookings.css";

const RejectedBookings = () => {
  const navigate = useNavigate();

  // =========================================================
  // TEMPORARY BOOKING DATA
  // Later API data will come here
  // =========================================================

  const [bookingData] = useState([
    {
      id: 1,
      bookedId: "BV839421",
      customerName: "Sagar Malik",
      bookingAddress:
        "Toronto Pearson International Airport (YYZ), YYZ Terminal 3, Mississauga, ON, Canada",
      paidAmount: "$ 3,678.15",
      transaction: "Wallet",
      bookedDate: "16-05-2026",
      bookedTime: "11:00AM",
      status: "Rejected",
    },

    {
      id: 2,
      bookedId: "BV472918",
      customerName: "Sagar Malik",
      bookingAddress:
        "20 Songsparrow Dr, Brampton, ON L6Y 3Z8, Canada",
      paidAmount: "$ 2,657.76",
      transaction: "Wallet",
      bookedDate: "15-05-2026",
      bookedTime: "01:00PM",
      status: "Rejected",
    },

    {
      id: 3,
      bookedId: "BV659994",
      customerName: "shiii dev",
      bookingAddress:
        "Toronto Pearson International Airport, Terminal 3, Mississauga, Ontario, Canada",
      paidAmount: "$ 22.60",
      transaction: "Wallet",
      bookedDate: "04-05-2026",
      bookedTime: "09:00AM",
      status: "Rejected",
    },

    {
      id: 4,
      bookedId: "BV023767",
      customerName: "Robin Christopher",
      bookingAddress:
        "24 Main Street, Toronto, Ontario, Canada",
      paidAmount: "$ 221.48",
      transaction: "Wallet",
      bookedDate: "24-04-2026",
      bookedTime: "08:00PM",
      status: "Rejected",
    },

    {
      id: 5,
      bookedId: "BV953628",
      customerName: "Michael Johnson",
      bookingAddress:
        "100 Queen Street West, Toronto, Ontario, Canada",
      paidAmount: "$ 664.44",
      transaction: "Wallet",
      bookedDate: "20-03-2026",
      bookedTime: "03:00PM",
      status: "Rejected",
    },
  ]);

  // =========================================================
  // VIEW BOOKING
  // =========================================================

  const handleView = (id) => {
    console.log("View Rejected Booking:", id);

    navigate(`/rejected_bookings/view/${id}`);
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
          <div className="rejected-booking-address">
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
          <div className="rejected-booking-datetime">
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
          <span className="rejected-booking-status">
            {value}
          </span>
        ),
      },

      {
        key: "action",
        label: "Action",
        width: "100px",
        sortable: false,

        render: (_, row) => (
          <div className="rejected-booking-actions">

            <button
              type="button"
              className="rejected-view-btn"
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
    <div className="rejected-booking-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="rejected-booking-page-header">

        <div>

          <h2 className="rejected-booking-page-title">
            All Rejected Bookings
          </h2>

          <div className="rejected-booking-breadcrumb">

            <Link to="/home">
              Home
            </Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="rejected-booking-breadcrumb-active">
              Rejected Bookings
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="rejected-booking-card">

        <div className="rejected-booking-card-header">

          <h3>
            All Rejected Bookings
          </h3>

        </div>


        {/* ===================================================
            DATATABLE
        =================================================== */}

        <div className="rejected-booking-table-wrapper">

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

export default RejectedBookings;