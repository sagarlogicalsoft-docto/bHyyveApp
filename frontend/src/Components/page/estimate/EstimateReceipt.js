import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaCreditCard } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";
import "./estimateReceipt.css";

const EstimateReceipt = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [estimateReceipts, setEstimateReceipts] = useState([
    {
      id: 1,
      estimateNumber: "EST-2026040001",
      clientName: "Deepesh Lodhi",
      date: "09-04-2026",
      total: "$ 225.00",
      paymentMode: "UPI",
      notes: "—",
      status: "Completed",
    },

    {
      id: 2,
      estimateNumber: "EST-2026042026040002",
      clientName: "dfdgfdg",
      date: "09-04-2026",
      total: "$ 22.60",
      paymentMode: "Credit Card",
      notes: "tyrtyery",
      status: "Completed",
    },
  ]);

  const [loading, setLoading] = useState(false);

  // =========================================================
  // BACKEND / API
  // =========================================================
  //
  // When backend is ready, this function can be changed to:
  //
  // const response = await axios.get("/api/estimate-receipts");
  // setEstimateReceipts(response.data.data);
  //
  // No table changes will be required.
  // =========================================================

  const fetchEstimateReceipts = async () => {
    try {
      setLoading(true);

      /*
       * BACKEND LATER:
       *
       * const response = await axios.get(
       *   "/api/estimate-receipts"
       * );
       *
       * setEstimateReceipts(response.data.data);
       */

      console.log("Estimate Receipt API will be connected here.");
    } catch (error) {
      console.error(
        "Error fetching estimate receipts:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL DATA LOAD
  // =========================================================

  useEffect(() => {
    /*
     * Keep this ready for backend integration.
     *
     * Once API is connected:
     *
     * fetchEstimateReceipts();
     */

    // fetchEstimateReceipts();
  }, []);

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      // -------------------------------------------------------
      // SERIAL NUMBER
      // -------------------------------------------------------

      {
        key: "serial",
        label: "S.No",
        width: "80px",
        sortable: false,

        render: (_, row, rowIndex) => rowIndex + 1,
      },

      // -------------------------------------------------------
      // ESTIMATE NUMBER
      // -------------------------------------------------------

      {
        key: "estimateNumber",
        label: "Estimate #",
        width: "165px",
        sortable: true,

        render: (value) => (
          <span className="estimate-number">
            {value}
          </span>
        ),
      },

      // -------------------------------------------------------
      // CLIENT NAME
      // -------------------------------------------------------

      {
        key: "clientName",
        label: "Client Name",
        width: "105px",
        sortable: true,

        render: (value) => (
          <div className="estimate-client-name">
            {value}
          </div>
        ),
      },

      // -------------------------------------------------------
      // DATE
      // -------------------------------------------------------

      {
        key: "date",
        label: "Date",
        width: "85px",
        sortable: true,

        render: (value) => {
          const parts = value.split("-");

          if (parts.length !== 3) {
            return value;
          }

          return (
            <div className="estimate-date">
              <span>
                {parts[0]}-{parts[1]}-
              </span>

              <span>
                {parts[2]}
              </span>
            </div>
          );
        },
      },

      // -------------------------------------------------------
      // TOTAL
      // -------------------------------------------------------

      {
        key: "total",
        label: "Total",
        width: "85px",
        sortable: true,

        render: (value) => {
          const cleanedValue = String(value).trim();

          const parts = cleanedValue.split(" ");

          if (parts.length >= 2) {
            return (
              <div className="estimate-total">
                <span>{parts[0]}</span>
                <span>{parts.slice(1).join(" ")}</span>
              </div>
            );
          }

          return value;
        },
      },

      // -------------------------------------------------------
      // PAYMENT MODE
      // -------------------------------------------------------

      {
        key: "paymentMode",
        label: "Payment Mode",
        width: "120px",
        sortable: true,

        render: (value) => {
          const isUPI =
            String(value).toLowerCase() === "upi";

          return (
            <span
              className={`estimate-payment-badge ${
                isUPI
                  ? "estimate-payment-upi"
                  : "estimate-payment-card"
              }`}
            >
              <FaCreditCard />

              {value}
            </span>
          );
        },
      },

      // -------------------------------------------------------
      // NOTES
      // -------------------------------------------------------

      {
        key: "notes",
        label: "Notes",
        width: "130px",
        sortable: true,

        render: (value) => {
          if (!value || value === "—") {
            return (
              <span className="estimate-notes-empty">
                —
              </span>
            );
          }

          return (
            <span className="estimate-notes">
              <span className="estimate-notes-icon">
                ▣
              </span>

              {value}
            </span>
          );
        },
      },

      // -------------------------------------------------------
      // STATUS
      // -------------------------------------------------------

      {
        key: "status",
        label: "Status",
        width: "120px",
        sortable: true,

        render: (value) => (
          <span
            className={`estimate-status ${
              value === "Completed"
                ? "estimate-status-completed"
                : "estimate-status-other"
            }`}
          >
            <FaCheckCircle />

            <span>{value}</span>
          </span>
        ),
      },
    ],
    [],
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="estimate-receipt-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="estimate-receipt-page-header">

        <div>
          <h2 className="estimate-receipt-page-title">
            All Estimates Receipt
          </h2>

          <div className="estimate-receipt-breadcrumb">

            <Link to="/home">
              Home
            </Link>

            <span className="estimate-receipt-breadcrumb-arrow">
              <IoIosArrowForward />
            </span>

            <span className="estimate-receipt-breadcrumb-active">
              All Estimates Receipt
            </span>

          </div>
        </div>

      </div>


      {/* =====================================================
          CONTENT CARD
      ===================================================== */}

      <div className="estimate-receipt-card">

        <div className="estimate-receipt-card-header">
          <h3>
            All Estimates Receipt
          </h3>
        </div>


        {/* ===================================================
            DATA TABLE
        =================================================== */}

        <div className="estimate-receipt-table-wrapper">

          {loading ? (
            <div className="estimate-receipt-loading">
              Loading estimate receipts...
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={estimateReceipts}
              entriesPerPageOptions={[
                10,
                25,
                50,
                100,
              ]}
              defaultEntriesPerPage={10}
              searchable={true}
              sortable={true}
            />
          )}

        </div>

      </div>

    </div>
  );
};

export default EstimateReceipt;