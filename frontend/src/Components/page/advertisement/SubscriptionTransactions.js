import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";

import "./subscriptionTransactions.css";

const SubscriptionTransactions = () => {
  // =========================================================
  // TEMPORARY SUBSCRIPTION TRANSACTION DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [subscriptionData, setSubscriptionData] = useState([
    {
      id: 1,
      vendor: "Velvet Touch Cleaning Co.",
      price: 299,
      package: "Videography Package",
      startDate: "10-08-2026",
      endDate: "17-08-2026",
      remainingDays: 3,
      status: "Active",
    },
    {
      id: 2,
      vendor: "Elite Clean Group",
      price: 379,
      package: "Professional Branding",
      startDate: "05-08-2026",
      endDate: "19-08-2026",
      remainingDays: 5,
      status: "Active",
    },
    {
      id: 3,
      vendor: "Happy Homes Cleaning Company",
      price: 499,
      package:
        "Professional Website with Marketing Content",
      startDate: "01-07-2026",
      endDate: "01-07-2027",
      remainingDays: 322,
      status: "Active",
    },
    {
      id: 4,
      vendor: "TrueFresh Cleaning Systems",
      price: 299,
      package: "Videography Package",
      startDate: "20-07-2026",
      endDate: "27-07-2026",
      remainingDays: 0,
      status: "Expired",
    },
  ]);

  // =========================================================
  // SELECTED TRANSACTIONS
  // =========================================================

  const [selectedTransactions, setSelectedTransactions] =
    useState([]);

  // =========================================================
  // SELECT ALL
  // =========================================================

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedTransactions(
        subscriptionData.map((item) => item.id),
      );
    } else {
      setSelectedTransactions([]);
    }
  };

  // =========================================================
  // SELECT SINGLE TRANSACTION
  // =========================================================

  const handleSelectTransaction = (id) => {
    setSelectedTransactions((previous) =>
      previous.includes(id)
        ? previous.filter((itemId) => itemId !== id)
        : [...previous, id],
    );
  };

  // =========================================================
  // DELETE SINGLE TRANSACTION
  // =========================================================

  const handleDelete = (row) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the subscription transaction for "${row.vendor}"?`,
    );

    if (!confirmed) return;

    setSubscriptionData((previous) =>
      previous.filter((item) => item.id !== row.id),
    );

    setSelectedTransactions((previous) =>
      previous.filter((itemId) => itemId !== row.id),
    );

    console.log("Delete Subscription Transaction:", row);

    // =======================================================
    // API DELETE CALL WILL BE CONNECTED HERE LATER
    // =======================================================
  };

  // =========================================================
  // DELETE SELECTED TRANSACTIONS
  // =========================================================

  const handleDeleteSelected = () => {
    if (selectedTransactions.length === 0) {
      alert("Please select at least one transaction.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedTransactions.length} selected transaction(s)?`,
    );

    if (!confirmed) return;

    setSubscriptionData((previous) =>
      previous.filter(
        (item) => !selectedTransactions.includes(item.id),
      ),
    );

    console.log(
      "Delete Selected Subscription Transactions:",
      selectedTransactions,
    );

    setSelectedTransactions([]);

    // =======================================================
    // API DELETE CALL WILL BE CONNECTED HERE LATER
    // =======================================================
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: (
          <div className="subscription-transactions-select-header">
            <input
              type="checkbox"
              className="subscription-transactions-checkbox"
              checked={
                subscriptionData.length > 0 &&
                selectedTransactions.length ===
                  subscriptionData.length
              }
              onChange={handleSelectAll}
            />

            <span>All</span>
            <span>Select</span>
          </div>
        ),
        width: "115px",
        sortable: false,

        render: (_, row) => (
          <input
            type="checkbox"
            className="subscription-transactions-checkbox"
            checked={selectedTransactions.includes(row.id)}
            onChange={() =>
              handleSelectTransaction(row.id)
            }
          />
        ),
      },

      {
        key: "serial",
        label: "Sr.No",
        width: "80px",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      {
        key: "vendor",
        label: "Vendor",
        width: "210px",
        sortable: true,

        render: (value) => (
          <div className="subscription-transactions-vendor">
            {value}
          </div>
        ),
      },

      {
        key: "price",
        label: "Price",
        width: "110px",
        sortable: true,

        render: (value) => (
          <strong className="subscription-transactions-price">
            ₹{Number(value).toFixed(2)}
          </strong>
        ),
      },

      {
        key: "package",
        label: "Package",
        width: "230px",
        sortable: true,

        render: (value) => (
          <div className="subscription-transactions-package">
            {value}
          </div>
        ),
      },

      {
        key: "startDate",
        label: "Start Date",
        width: "130px",
        sortable: true,

        render: (value) => (
          <span className="subscription-transactions-date">
            {value}
          </span>
        ),
      },

      {
        key: "endDate",
        label: "End Date",
        width: "130px",
        sortable: true,

        render: (value) => (
          <span className="subscription-transactions-date">
            {value}
          </span>
        ),
      },

      {
        key: "remainingDays",
        label: "Remaining Days",
        width: "145px",
        sortable: true,

        render: (value) => (
          <span
            className={
              value > 0
                ? "subscription-transactions-days-active"
                : "subscription-transactions-days-expired"
            }
          >
            {value}
          </span>
        ),
      },

      {
        key: "status",
        label: "Status",
        width: "120px",
        sortable: true,

        render: (value) => (
          <span
            className={
              value === "Active"
                ? "subscription-transactions-status-active"
                : "subscription-transactions-status-expired"
            }
          >
            {value}
          </span>
        ),
      },

      {
        key: "actions",
        label: "Action",
        width: "110px",
        sortable: false,

        render: (_, row) => (
          <div className="subscription-transactions-actions">
            <button
              type="button"
              className="subscription-transactions-delete-btn"
              onClick={() => handleDelete(row)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [subscriptionData, selectedTransactions],
  );

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="subscription-transactions-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="subscription-transactions-header">

        <h2 className="subscription-transactions-title">
          Subscription Transactions
        </h2>

        <div className="subscription-transactions-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="subscription-transactions-breadcrumb-active">
            Subscription Transactions
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="subscription-transactions-card">

        <div className="subscription-transactions-table-wrapper">

          <DataTable
            columns={columns}
            data={subscriptionData}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />

        </div>

        {/* ===================================================
            DELETE SELECTED - BOTTOM RIGHT
        =================================================== */}

        {selectedTransactions.length > 0 && (
          <div className="subscription-transactions-bottom-actions">

            <button
              type="button"
              className="subscription-transactions-delete-selected-btn"
              onClick={handleDeleteSelected}
            >
              Delete Selected (
              {selectedTransactions.length}
              )
            </button>

          </div>
        )}

      </div>

    </div>
  );
};

export default SubscriptionTransactions;