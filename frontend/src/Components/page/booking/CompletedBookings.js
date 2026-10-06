import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaFilePdf } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./completedBookings.css";

const CompletedBookings = () => {
  const navigate = useNavigate();

  // =========================================================
  // TEMPORARY BOOKING DATA
  // Later API data will come here
  // =========================================================

  const [bookingData] = useState([
    {
      id: 1,
      bookedId: "BV303538",
      customerName: "Sagar Malik",
      bookingAddress:
        "20 Songsparrow Dr, Brampton, ON L6Y 3Z8, Canada",
      paidAmount: "$ 664.44",
      transaction: "Wallet",
      bookedDate: "11-08-2026",
      bookedTime: "10:00AM",
      status: "Completed",

      service: {
        name: "2020 Mercedes-Benz S Class",
        rate: "588.00",
        quantity: "1",
        amount: "588.00",
        total: "588.00",
      },

      discount: "0%",
      discountAmount: "0.00",

      hst: "13%",
      hstAmount: "76.44",

      finalAmount: "$ 664.44",
    },

    {
      id: 2,
      bookedId: "BV934015",
      customerName: "Sagar Malik",
      bookingAddress:
        "Toronto Pearson International Airport (YYZ), Terminal 3, Mississauga, ON, Canada",
      paidAmount: "$ 3,678.15",
      transaction: "Wallet",
      bookedDate: "16-05-2026",
      bookedTime: "11:00AM",
      status: "Completed",

      service: {
        name: "Premium Car Rental",
        rate: "3,250.00",
        quantity: "1",
        amount: "3,250.00",
        total: "3,250.00",
      },

      discount: "0%",
      discountAmount: "0.00",

      hst: "13%",
      hstAmount: "422.50",

      finalAmount: "$ 3,672.50",
    },

    {
      id: 3,
      bookedId: "BV172327",
      customerName: "Sagar Malik",
      bookingAddress:
        "24 Main Street, Toronto, Ontario, Canada",
      paidAmount: "$ 2,657.76",
      transaction: "Wallet",
      bookedDate: "04-05-2026",
      bookedTime: "09:00AM",
      status: "Completed",

      service: {
        name: "Luxury Vehicle Service",
        rate: "2,350.00",
        quantity: "1",
        amount: "2,350.00",
        total: "2,350.00",
      },

      discount: "0%",
      discountAmount: "0.00",

      hst: "13%",
      hstAmount: "305.50",

      finalAmount: "$ 2,655.50",
    },

    {
      id: 4,
      bookedId: "BV023767",
      customerName: "shiii dev",
      bookingAddress:
        "100 Queen Street West, Toronto, Ontario, Canada",
      paidAmount: "$ 22.60",
      transaction: "Wallet",
      bookedDate: "24-04-2026",
      bookedTime: "08:00PM",
      status: "Completed",

      service: {
        name: "Home Cleaning Service",
        rate: "20.00",
        quantity: "1",
        amount: "20.00",
        total: "20.00",
      },

      discount: "0%",
      discountAmount: "0.00",

      hst: "13%",
      hstAmount: "2.60",

      finalAmount: "$ 22.60",
    },

    {
      id: 5,
      bookedId: "BV953628",
      customerName: "Sagar Malik",
      bookingAddress:
        "200 King Street East, Toronto, Ontario, Canada",
      paidAmount: "$ 221.48",
      transaction: "Wallet",
      bookedDate: "20-03-2026",
      bookedTime: "03:00PM",
      status: "Completed",

      service: {
        name: "Professional Cleaning Service",
        rate: "195.99",
        quantity: "1",
        amount: "195.99",
        total: "195.99",
      },

      discount: "0%",
      discountAmount: "0.00",

      hst: "13%",
      hstAmount: "25.48",

      finalAmount: "$ 221.47",
    },
  ]);

  // =========================================================
  // VIEW BOOKING
  // =========================================================

  const handleView = (id) => {
    console.log("View Completed Booking:", id);

    navigate(`/completed_bookings/view/${id}`);
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const handleDownloadPDF = async (id) => {
    try {
      const booking = bookingData.find((item) => item.id === id);

      if (!booking) {
        alert("Booking details not found.");
        return;
      }

      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF("landscape");

      // =====================================================
      // TITLE
      // =====================================================

      doc.setFontSize(18);
      doc.text("Completed Booking", 14, 15);

      doc.setFontSize(10);

      // =====================================================
      // BOOKING DETAILS
      // =====================================================

      autoTable(doc, {
        startY: 22,

        head: [
          [
            "Booked ID",
            "Customer Name",
            "Booking Address",
            "Paid Amount",
            "Transaction",
            "Booked DateTime",
            "Status",
          ],
        ],

        body: [
          [
            booking.bookedId,
            booking.customerName,
            booking.bookingAddress,
            booking.paidAmount,
            booking.transaction,
            `${booking.bookedDate} ${booking.bookedTime}`,
            booking.status,
          ],
        ],

        styles: {
          fontSize: 8,
          cellPadding: 4,
        },

        headStyles: {
          fontStyle: "bold",
        },
      });

      // =====================================================
      // SERVICE DETAILS
      // =====================================================

      const serviceStartY =
        doc.lastAutoTable.finalY + 10;

      doc.setFontSize(13);
      doc.text("Order Services Details", 14, serviceStartY);

      autoTable(doc, {
        startY: serviceStartY + 5,

        head: [
          [
            "Service",
            "Rate($)",
            "Qty",
            "Amount($)",
            "Total($)",
          ],
        ],

        body: [
          [
            booking.service.name,
            `$ ${booking.service.rate}`,
            booking.service.quantity,
            `$ ${booking.service.amount}`,
            `$ ${booking.service.total}`,
          ],
        ],

        styles: {
          fontSize: 9,
          cellPadding: 4,
        },

        headStyles: {
          fontStyle: "bold",
        },
      });

      // =====================================================
      // BILL SUMMARY
      // =====================================================

      const summaryStartY =
        doc.lastAutoTable.finalY + 8;

      autoTable(doc, {
        startY: summaryStartY,

        body: [
          [
            "Discount",
            booking.discount,
            booking.discountAmount,
          ],

          [
            "HST",
            booking.hst,
            booking.hstAmount,
          ],

          [
            "Final Amount",
            "",
            booking.finalAmount,
          ],
        ],

        columnStyles: {
          0: {
            halign: "right",
            fontStyle: "bold",
          },

          1: {
            halign: "center",
          },

          2: {
            halign: "center",
          },
        },

        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
      });

      // =====================================================
      // SAVE
      // =====================================================

      doc.save(
        `completed-booking-${booking.bookedId}.pdf`,
      );
    } catch (error) {
      console.error("PDF generation error:", error);

      alert(
        "Unable to generate PDF. Please make sure jspdf and jspdf-autotable are installed.",
      );
    }
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "Sr.No",
        width: "70px",
        sortable: false,

        render: (_, row, rowIndex) => rowIndex + 1,
      },

      {
        key: "bookedId",
        label: "Booked ID",
        width: "125px",
        sortable: true,
      },

      {
        key: "customerName",
        label: "Customer Name",
        width: "150px",
        sortable: true,
      },

      {
        key: "bookingAddress",
        label: "Booking Address",
        width: "220px",
        sortable: true,

        render: (value) => (
          <div className="completed-booking-address">
            {value}
          </div>
        ),
      },

      {
        key: "paidAmount",
        label: "Paid Amount",
        width: "130px",
        sortable: true,
      },

      {
        key: "transaction",
        label: "Transaction",
        width: "110px",
        sortable: true,
      },

      {
        key: "bookedDateTime",
        label: "Booked DateTime",
        width: "145px",
        sortable: true,

        render: (_, row) => (
          <div className="completed-booking-datetime">
            <div>{row.bookedDate}</div>
            <div>{row.bookedTime}</div>
          </div>
        ),
      },

      {
        key: "status",
        label: "Status",
        width: "110px",
        sortable: true,

        render: (value) => (
          <span className="completed-booking-status">
            {value}
          </span>
        ),
      },

      // =====================================================
      // PDF
      // =====================================================

      {
        key: "pdf",
        label: "PDF",
        width: "90px",
        sortable: false,

        render: (_, row) => (
          <button
            type="button"
            className="completed-booking-pdf-btn"
            onClick={() => handleDownloadPDF(row.id)}
            title="Download PDF"
          >
            <FaFilePdf />
            PDF
          </button>
        ),
      },

      // =====================================================
      // VIEW
      // =====================================================

      {
        key: "action",
        label: "Action",
        width: "90px",
        sortable: false,

        render: (_, row) => (
          <button
            type="button"
            className="completed-booking-view-btn"
            onClick={() => handleView(row.id)}
          >
            View
          </button>
        ),
      },
    ],
    [bookingData]
  );

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="completed-booking-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="completed-booking-page-header">
        <div>
          <h2 className="completed-booking-page-title">
            All Completed Bookings
          </h2>

          <div className="completed-booking-breadcrumb">
            <Link to="/home">
              Home
            </Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="completed-booking-breadcrumb-active">
              Completed Bookings
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="completed-booking-card">

        <div className="completed-booking-card-header">
          <h3>
            All Completed Bookings
          </h3>
        </div>

        {/* ===================================================
            DATATABLE
        =================================================== */}

        <div className="completed-booking-table-wrapper">

          <DataTable
            columns={columns}
            data={bookingData}
            entriesPerPageOptions={[
              5,
              10,
              25,
              50,
              100,
            ]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />

        </div>

      </div>

    </div>
  );
};

export default CompletedBookings;