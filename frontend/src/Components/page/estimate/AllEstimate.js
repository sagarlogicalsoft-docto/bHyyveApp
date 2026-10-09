import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";

import "./allEstimate.css";

const AllEstimate = () => {
  const navigate = useNavigate();

  // =========================================================
  // TEMPORARY ESTIMATE DATA
  // Later API data will come here
  // =========================================================

  const estimateData = [
    {
      id: 1,
      estimateNo: "EST-10001",
      clientName: "Sagar Malik",
      date: "11-08-2026",
      total: "$ 664.44",
      paymentMode: "Wallet",
      status: "Pending",
    },
    {
      id: 2,
      estimateNo: "EST-10002",
      clientName: "Michael Johnson",
      date: "08-08-2026",
      total: "$ 1,250.00",
      paymentMode: "Credit Card",
      status: "Approved",
    },
    {
      id: 3,
      estimateNo: "EST-10003",
      clientName: "Robin Christopher",
      date: "05-08-2026",
      total: "$ 875.50",
      paymentMode: "Wallet",
      status: "Pending",
    },
    {
      id: 4,
      estimateNo: "EST-10004",
      clientName: "Aman Sharma",
      date: "01-08-2026",
      total: "$ 2,150.75",
      paymentMode: "Credit Card",
      status: "Approved",
    },
    {
      id: 5,
      estimateNo: "EST-10005",
      clientName: "Ravi Singh",
      date: "28-07-2026",
      total: "$ 450.00",
      paymentMode: "Wallet",
      status: "Rejected",
    },
  ];

  // =========================================================
  // VIEW ESTIMATE
  // =========================================================

  const handleView = (id) => {
    console.log("View Estimate:", id);

    navigate(`/estimates/view/${id}`);
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "S.No",
        width: "90px",
        sortable: false,
        render: (_, row, rowIndex) => rowIndex + 1,
      },

      {
        key: "estimateNo",
        label: "Estimate#",
        width: "140px",
        sortable: true,
      },

      {
        key: "clientName",
        label: "Client Name",
        width: "180px",
        sortable: true,
      },

      {
        key: "date",
        label: "Date",
        width: "140px",
        sortable: true,
      },

      {
        key: "total",
        label: "Total",
        width: "140px",
        sortable: true,
      },

      {
        key: "paymentMode",
        label: "Payment Mode",
        width: "160px",
        sortable: true,
      },

      {
        key: "status",
        label: "Status",
        width: "140px",
        sortable: true,

        render: (value) => (
          <span
            className={`estimate-status estimate-status-${value
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            {value}
          </span>
        ),
      },

      {
        key: "action",
        label: "Action",
        width: "110px",
        sortable: false,

        render: (_, row) => (
          <div className="estimate-actions">
            <button
              type="button"
              className="estimate-view-btn"
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
    <div className="estimate-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="estimate-page-header">
        <div>
          <h2 className="estimate-page-title">
            All Estimates
          </h2>

          <div className="estimate-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="estimate-breadcrumb-active">
              Estimates
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="estimate-card">

        <div className="estimate-card-header">
          <h3>All Estimates</h3>
        </div>

        <div className="estimate-table-wrapper">
          <DataTable
            columns={columns}
            data={estimateData}
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

export default AllEstimate;