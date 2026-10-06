import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaEdit, FaPlus } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./helpCenter.css";

const HelpCenter = () => {
  const navigate = useNavigate();

  // =========================================================
  // TEMPORARY HELP CENTER DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [helpCenterData] = useState([
    {
      id: 1,
      name: "Sagar Malik",
      email: "sagar@example.com",
      phone: "9876543210",
    },
    {
      id: 2,
      name: "Rahul Testing",
      email: "rahul@example.com",
      phone: "9876543211",
    },
    {
      id: 3,
      name: "Amit Sharma",
      email: "amit@example.com",
      phone: "9876543212",
    },
    {
      id: 4,
      name: "Priya Singh",
      email: "priya@example.com",
      phone: "9876543213",
    },
    {
      id: 5,
      name: "Neha Verma",
      email: "neha@example.com",
      phone: "9876543214",
    },
    {
      id: 6,
      name: "Vikas Kumar",
      email: "vikas@example.com",
      phone: "9876543215",
    },
    {
      id: 7,
      name: "Rohit Gupta",
      email: "rohit@example.com",
      phone: "9876543216",
    },
  ]);

  // =========================================================
  // ADD HELP CENTER
  // =========================================================

  const handleAdd = () => {
    navigate("/help-center/add");
  };

  // =========================================================
  // EDIT HELP CENTER
  // =========================================================

  const handleEdit = (row) => {
    navigate(`/help-center/edit/${row.id}`, {
      state: {
        helpCenter: row,
      },
    });
  };

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
        width: "100px",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      // =====================================================
      // NAME
      // =====================================================

      {
        key: "name",
        label: "Name",
        width: "200px",
        sortable: true,

        render: (value) => (
          <div className="help-center-name">
            {value}
          </div>
        ),
      },

      // =====================================================
      // EMAIL
      // =====================================================

      {
        key: "email",
        label: "Email",
        width: "250px",
        sortable: true,

        render: (value) => (
          <div className="help-center-email">
            {value}
          </div>
        ),
      },

      // =====================================================
      // PHONE
      // =====================================================

      {
        key: "phone",
        label: "Phone",
        width: "180px",
        sortable: true,

        render: (value) => (
          <div className="help-center-phone">
            {value}
          </div>
        ),
      },

      // =====================================================
      // ACTION
      // =====================================================

      {
        key: "actions",
        label: "Action",
        width: "120px",
        sortable: false,

        render: (_, row) => (
          <div className="help-center-actions">
            <button
              type="button"
              className="help-center-edit-btn"
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
    <div className="help-center-page">

      {/* =====================================================
          PAGE HEADER / BREADCRUMB
      ===================================================== */}

      <div className="help-center-header">

        <h2 className="help-center-title">
          Help Center
        </h2>

        <div className="help-center-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span className="help-center-breadcrumb-arrow">
            <IoIosArrowForward />
          </span>

          <span className="help-center-breadcrumb-active">
            Help Center
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="help-center-card">

        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="help-center-card-header">

          <h3>
            All Help Center
          </h3>

          <button
            type="button"
            className="help-center-add-btn"
            onClick={handleAdd}
          >
            <FaPlus />
            <span>Add</span>
          </button>

        </div>

        {/* ===================================================
            DATA TABLE
        =================================================== */}

        <div className="help-center-table-wrapper">

          <DataTable
            columns={columns}
            data={helpCenterData}
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

export default HelpCenter;