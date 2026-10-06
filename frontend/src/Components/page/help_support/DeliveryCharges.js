import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaEdit, FaPlus } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./deliveryCharges.css";

const DeliveryCharge = () => {
  const navigate = useNavigate();

  // =========================================================
  // TEMPORARY DELIVERY CHARGE DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [deliveryChargeData] = useState([
    {
      id: 1,
      deliveryCharge: 10,
      deliveryChargePerKm: 2.5,
    },
    {
      id: 2,
      deliveryCharge: 15,
      deliveryChargePerKm: 3,
    },
    {
      id: 3,
      deliveryCharge: 20,
      deliveryChargePerKm: 3.5,
    },
    {
      id: 4,
      deliveryCharge: 25,
      deliveryChargePerKm: 4,
    },
    {
      id: 5,
      deliveryCharge: 30,
      deliveryChargePerKm: 4.5,
    },
  ]);

  // =========================================================
  // ADD DELIVERY CHARGE
  // =========================================================

  const handleAdd = () => {
    navigate("/delivery-charge/add");
  };

  // =========================================================
  // EDIT DELIVERY CHARGE
  // =========================================================

  const handleEdit = (row) => {
    navigate(`/delivery-charge/edit/${row.id}`, {
      state: {
        deliveryCharge: row,
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
        width: "110px",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      // =====================================================
      // DELIVERY CHARGE
      // =====================================================

      {
        key: "deliveryCharge",
        label: "Delivery Charge",
        width: "220px",
        sortable: true,

        render: (value) => (
          <div className="delivery-charge-value">
            ${Number(value).toFixed(2)}
          </div>
        ),
      },

      // =====================================================
      // DELIVERY CHARGE / KM
      // =====================================================

      {
        key: "deliveryChargePerKm",
        label: "Delivery Charge / Km",
        width: "250px",
        sortable: true,

        render: (value) => (
          <div className="delivery-charge-per-km">
            ${Number(value).toFixed(2)}
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
          <div className="delivery-charge-actions">
            <button
              type="button"
              className="delivery-charge-edit-btn"
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
    <div className="delivery-charge-page">

      {/* =====================================================
          PAGE HEADER / BREADCRUMB
      ===================================================== */}

      <div className="delivery-charge-header">

        <h2 className="delivery-charge-title">
          Delivery Charge
        </h2>

        <div className="delivery-charge-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span className="delivery-charge-breadcrumb-arrow">
            <IoIosArrowForward />
          </span>

          <span className="delivery-charge-breadcrumb-active">
            Delivery Charge
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="delivery-charge-card">

        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="delivery-charge-card-header">

          <h3>
            All Delivery Charge
          </h3>

          <button
            type="button"
            className="delivery-charge-add-btn"
            onClick={handleAdd}
          >
            <FaPlus />
            <span>Add</span>
          </button>

        </div>

        {/* ===================================================
            DATA TABLE
        =================================================== */}

        <div className="delivery-charge-table-wrapper">

          <DataTable
            columns={columns}
            data={deliveryChargeData}
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

export default DeliveryCharge;