import React from "react";
import { Link, useParams } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import "./viewRejectedBookings.css";

const ViewRejectedBookings = () => {
  const { id } = useParams();

  // =========================================================
  // TEMPORARY BOOKING DATA
  // Later API data will come here
  // =========================================================

  const booking = {
    id: id || 1,

    bookedId: "BV934015",
    customerName: "Sagar Malik",

    bookingAddress:
      "Toronto Pearson International Airport (YYZ), YYZ Terminal 3, Mississauga, ON, Canada",

    paidAmount: "$ 3,678.15",

    transaction: "Wallet",

    bookedDate: "16-05-2026",
    bookedTime: "11:00AM",

    status: "Rejected",

    service: {
      image:
        "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=300",

      name: "2020 Mercedes-Benz S Class",

      description:
        "Experience executive-level luxury with this 2020 Mercedes-Benz S-Class — the ultimate blend of performance, comfort, and prestige, now available for daily rental. Step into a meticulously crafted interior featuring premium leather seating, ambient lighting, and cutting-edge technology designed to deliver a smooth, quiet, and refined ride.",

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
  };

  return (
    <div className="view-rejected-booking-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="view-rejected-booking-page-header">
        <div>
          <h2 className="view-rejected-booking-page-title">
            View Rejected Booking
          </h2>

          <div className="view-rejected-booking-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <Link to="/booking/rejected">
              Rejected Bookings
            </Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="view-rejected-booking-breadcrumb-active">
              View Booking
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="view-rejected-booking-card">

        {/* ===================================================
            BOOKING SUMMARY
        =================================================== */}

        <div className="rejected-booking-summary-wrapper">

          <table className="rejected-booking-summary-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Booked ID</th>
                <th>Customer Name</th>
                <th>Booking Address</th>
                <th>Paid Amount</th>
                <th>Transaction</th>
                <th>Booked DateTime</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>1</td>

                <td>{booking.bookedId}</td>

                <td>{booking.customerName}</td>

                <td className="rejected-booking-address">
                  {booking.bookingAddress}
                </td>

                <td>{booking.paidAmount}</td>

                <td>{booking.transaction}</td>

                <td>
                  {booking.bookedDate} {booking.bookedTime}
                </td>

                <td>
                  <span className="rejected-booking-status">
                    {booking.status}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

        </div>

        {/* ===================================================
            ORDER SERVICES DETAILS
        =================================================== */}

        <div className="rejected-order-services-title">
          Order Services Details
        </div>

        <div className="rejected-order-services-wrapper">

          <table className="rejected-order-services-table">

            <thead>
              <tr>
                <th className="rejected-service-image-column">
                  Image
                </th>

                <th className="rejected-service-name-column">
                  Service
                </th>

                <th className="rejected-service-description-column">
                  Description
                </th>

                <th className="rejected-service-rate-column">
                  Rate
                </th>

                <th className="rejected-service-qty-column">
                  Qty
                </th>

                <th className="rejected-service-amount-column">
                  Amount
                </th>

                <th className="rejected-service-total-column">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>

              {/* SERVICE */}

              <tr className="rejected-service-main-row">

                <td>
                  <div className="rejected-service-image-wrapper">
                    <img
                      src={booking.service.image}
                      alt={booking.service.name}
                    />
                  </div>
                </td>

                <td className="rejected-service-name">
                  {booking.service.name}
                </td>

                <td className="rejected-service-description">
                  {booking.service.description}
                </td>

                <td className="rejected-service-rate">
                  $ {booking.service.rate}
                </td>

                <td className="rejected-service-qty">
                  {booking.service.quantity}
                </td>

                <td className="rejected-service-amount">
                  $ {booking.service.amount}
                </td>

                <td className="rejected-service-total">
                  $ {booking.service.total}
                </td>

              </tr>

              {/* DISCOUNT */}

               <tr className="summary-row">
                <td colSpan={5} className="summary-label">
                  Discount
                </td>
                <td className="summary-percent">{booking.discount}</td>
                <td className="summary-amount">{booking.discountAmount}</td>
              </tr>

              {/* HST */}

              <tr className="summary-row">
                <td colSpan={5} className="summary-label">
                  HST
                </td>
                <td className="summary-percent">{booking.hst}</td>
                <td className="summary-amount">{booking.hstAmount}</td>
              </tr>

              {/* FINAL AMOUNT */}

              <tr className="final-amount-row">
                <td colSpan={5} className="final-amount-label">
                  Final Amount
                </td>
                <td colSpan={2} className="final-amount-value">
                  {booking.finalAmount}
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default ViewRejectedBookings;