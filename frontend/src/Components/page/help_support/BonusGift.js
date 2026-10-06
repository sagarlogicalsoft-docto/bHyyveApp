import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaEdit } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./bonusGift.css";

const BonusGift = () => {
  // =========================================================
  // TEMPORARY BONUS GIFT DATA
  // =========================================================

  const [bonusGiftData, setBonusGiftData] = useState([
    {
      id: 1,
      bonus: "$50",
      title: "Welcome Bonus",
      description: "Get $50 bonus on your first booking.",
      date: "2026/08/15",
    },
    {
      id: 2,
      bonus: "$25",
      title: "Referral Bonus",
      description: "Earn $25 bonus when you refer a new customer.",
      date: "2026/08/14",
    },
    {
      id: 3,
      bonus: "$100",
      title: "Special Gift",
      description: "Receive a special $100 bonus on selected services.",
      date: "2026/08/13",
    },
    {
      id: 4,
      bonus: "$30",
      title: "Weekend Bonus",
      description: "Enjoy an additional bonus on weekend bookings.",
      date: "2026/08/12",
    },
    {
      id: 5,
      bonus: "$75",
      title: "Loyalty Bonus",
      description: "Special bonus for our regular customers.",
      date: "2026/08/11",
    },
  ]);

  // =========================================================
  // EDIT BONUS
  // =========================================================

  const handleEdit = (row) => {
    console.log("Edit Bonus Gift:", row);

    // Navigation / edit API can be added later.
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "Sr.No",
        width: "100px",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      {
        key: "bonus",
        label: "Bonus",
        width: "150px",
        sortable: true,

        render: (value) => (
          <span className="bonus-gift-bonus">
            {value}
          </span>
        ),
      },

      {
        key: "title",
        label: "Title",
        width: "200px",
        sortable: true,

        render: (value) => (
          <div className="bonus-gift-title">
            {value}
          </div>
        ),
      },

      {
        key: "description",
        label: "Description",
        width: "350px",
        sortable: true,

        render: (value) => (
          <div className="bonus-gift-description">
            {value}
          </div>
        ),
      },

      {
        key: "date",
        label: "Date",
        width: "150px",
        sortable: true,

        render: (value) => (
          <span className="bonus-gift-date">
            {value}
          </span>
        ),
      },

      {
        key: "actions",
        label: "Action",
        width: "120px",
        sortable: false,

        render: (_, row) => (
          <div className="bonus-gift-actions">
            <button
              type="button"
              className="bonus-gift-edit-btn"
              onClick={() => handleEdit(row)}
            >
              <FaEdit />
              <span>Edit</span>
            </button>
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
    <div className="bonus-gift-page">

      {/* =====================================================
          PAGE HEADER / BREADCRUMB
      ===================================================== */}

      <div className="bonus-gift-header">

        <h2 className="bonus-gift-title-heading">
          Bonus Gift
        </h2>

        <div className="bonus-gift-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="bonus-gift-breadcrumb-active">
            Bonus Gift
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="bonus-gift-card">

        <div className="bonus-gift-card-header">
          <h3>
            All Bonus Gift
          </h3>
        </div>

        {/* ===================================================
            DATA TABLE
        =================================================== */}

        <div className="bonus-gift-table-wrapper">

          <DataTable
            columns={columns}
            data={bonusGiftData}
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

export default BonusGift;