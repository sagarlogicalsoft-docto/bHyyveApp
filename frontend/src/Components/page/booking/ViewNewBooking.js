import React from "react";
import { Link, useParams } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import "./viewNewBooking.css";

const ViewNewBooking = () => {
  const { id } = useParams();

  // =========================================================
  // TEMPORARY BOOKING DATA
  // Later API data will come here
  // =========================================================

  const booking = {
    id: id || 1,

    bookedId: "BV303538",
    customerName: "Sagar Malik",

    bookingAddress: "20 Songsparrow Dr, Brampton, ON L6Y 3Z8, Canada",

    paidAmount: "$ 664.44",

    transaction: "Wallet",

    bookedDate: "11-08-2026",
    bookedTime: "10:00AM",

    status: "Pending",

    service: {
      image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=300",

      name: "2020 Mercedes-Benz S Class",

      description:
        "Experience executive-level luxury with this 2020 Mercedes-Benz S-Class — the ultimate blend of performance, comfort, and prestige, now available for daily rental. Step into a meticulously crafted interior featuring premium leather seating, ambient lighting, and cutting-edge technology designed to deliver a smooth, quiet, and refined ride. Whether you're attending an important meeting, special event, or simply want to elevate your driving experience, the S-Class delivers unmatched sophistication. Under the hood, you’ll find powerful yet seamless performance, paired with advanced safety features and Intelligent driving assistance systems to ensure both confidence and comfort on every journey. Highlights: Ultra-luxurious interior with heated, ventilated, and massaging seats, Panoramic sunroof & customizable ambient lighting, Advanced infotainment system with navigation & premium sound, Smooth, powerful performance with top-tier ride quality.",

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
    <div className="view-booking-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="view-booking-page-header">
        <div>
          <h2 className="view-booking-page-title">View New Booking</h2>

          <div className="view-booking-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <Link to="/booking/new">New Bookings</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="view-booking-breadcrumb-active">View Booking</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="view-booking-card">
        {/* ===================================================
            BOOKING SUMMARY
        =================================================== */}

        <div className="booking-summary-wrapper">
          <table className="booking-summary-table">
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

                <td>{booking.bookingAddress}</td>

                <td>{booking.paidAmount}</td>

                <td>{booking.transaction}</td>

                <td>
                  {booking.bookedDate} {booking.bookedTime}
                </td>

                <td>
                  <span className="view-booking-status">{booking.status}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===================================================
            ORDER SERVICES DETAILS
        =================================================== */}

        <div className="order-services-title">Order Services Details</div>

        <div className="order-services-wrapper">
          <table className="order-services-table">
            <thead>
              <tr>
                <th className="service-image-column">Image</th>

                <th className="service-name-column">Service</th>

                <th className="service-description-column">Description</th>

                <th className="service-rate-column">Rate($)</th>

                <th className="service-qty-column">Qty</th>

                <th className="service-amount-column">Amount($)</th>

                <th className="service-total-column">Total($)</th>
              </tr>
            </thead>

            <tbody>
              {/* SERVICE */}

              <tr className="service-main-row">
                <td>
                  <div className="service-image-wrapper">
                    <img
                      src={booking.service.image}
                      alt={booking.service.name}
                    />
                  </div>
                </td>

                <td className="service-name">{booking.service.name}</td>

                <td className="service-description">
                  {booking.service.description}
                </td>

                <td className="service-rate">$ {booking.service.rate}</td>

                <td className="service-qty">{booking.service.quantity}</td>

                <td className="service-amount">$ {booking.service.amount}</td>

                <td className="service-total">$ {booking.service.total}</td>
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

export default ViewNewBooking;
