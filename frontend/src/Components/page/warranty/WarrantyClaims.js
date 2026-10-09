import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";

import "./warrantyClaims.css";

const WarrantyClaims = () => {

  // =========================================================
  // TEMPORARY WARRANTY CLAIM DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [warrantyClaimsData, setWarrantyClaimsData] = useState([
    {
      id: 1,
      booking: "BV656619",
      customer: "Sagar Malik",
      product: "Virtual Home Photography",
      vendor: "Testing Vendor",
      reason: "Product/service issue reported by customer.",
      status: "Pending",
      createdDate: "2026/08/14 03:05 AM",
    },
    {
      id: 2,
      booking: "BV656620",
      customer: "Rahul Testing",
      product: "Home Cleaning Service",
      vendor: "Clean Home Services",
      reason: "Service was not completed properly.",
      status: "Approved",
      createdDate: "2026/08/13 11:30 AM",
    },
    {
      id: 3,
      booking: "BV656621",
      customer: "Amit Kumar",
      product: "AC Repair Service",
      vendor: "Quick Repair",
      reason: "Customer reported an issue after service completion.",
      status: "Rejected",
      createdDate: "2026/08/12 04:45 PM",
    },
    {
      id: 4,
      booking: "BV656622",
      customer: "Priya Sharma",
      product: "Car Washing Service",
      vendor: "Premium Car Care",
      reason: "Service quality did not meet customer expectations.",
      status: "Pending",
      createdDate: "2026/08/11 01:20 PM",
    },
  ]);

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      // =====================================================
      // SERIAL NUMBER
      // =====================================================

      {
        key: "serial",
        label: "Sr.No",
        width: "90px",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      // =====================================================
      // BOOKING
      // =====================================================

      {
        key: "booking",
        label: "Booking",
        width: "150px",
        sortable: true,

        render: (value) => (
          <span className="warranty-claims-booking">
            {value}
          </span>
        ),
      },

      // =====================================================
      // CUSTOMER
      // =====================================================

      {
        key: "customer",
        label: "Customer",
        width: "170px",
        sortable: true,

        render: (value) => (
          <div className="warranty-claims-text">
            {value}
          </div>
        ),
      },

      // =====================================================
      // PRODUCT
      // =====================================================

      {
        key: "product",
        label: "Product",
        width: "210px",
        sortable: true,

        render: (value) => (
          <div className="warranty-claims-product">
            {value}
          </div>
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
          <div className="warranty-claims-text">
            {value}
          </div>
        ),
      },

      // =====================================================
      // REASON
      // =====================================================

      {
        key: "reason",
        label: "Reason",
        width: "300px",
        sortable: true,

        render: (value) => (
          <div className="warranty-claims-reason">
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
        width: "130px",
        sortable: true,

        render: (value) => {
          const statusClass =
            value.toLowerCase() === "approved"
              ? "warranty-claims-status-approved"
              : value.toLowerCase() === "rejected"
                ? "warranty-claims-status-rejected"
                : "warranty-claims-status-pending";

          return (
            <span
              className={`warranty-claims-status ${statusClass}`}
            >
              {value}
            </span>
          );
        },
      },

      // =====================================================
      // CREATED DATE
      // =====================================================

      {
        key: "createdDate",
        label: "Created Date",
        width: "180px",
        sortable: true,

        render: (value) => (
          <div className="warranty-claims-date">
            {value}
          </div>
        ),
      },
    ],
    [],
  );

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="warranty-claims-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="warranty-claims-header">

        <h2 className="warranty-claims-title">
          Warranty Claims
        </h2>

        <div className="warranty-claims-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="warranty-claims-breadcrumb-active">
            Warranty Claims
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="warranty-claims-card">

        <div className="warranty-claims-card-header">
          <h3>
            All Warranty Claims
          </h3>
        </div>

        {/* ===================================================
            DATA TABLE
        =================================================== */}

        <div className="warranty-claims-table-wrapper">

          <DataTable
            columns={columns}
            data={warrantyClaimsData}
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

export default WarrantyClaims;