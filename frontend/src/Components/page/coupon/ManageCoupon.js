import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./manageCoupon.css";

const ManageCoupon = () => {
  const navigate = useNavigate();

  // =========================================================
  // TEMPORARY COUPON DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [couponData, setCouponData] = useState([
    {
      id: 1,
      title: "testing",
      code: "ABCD",
      discount: 25,
      discountType: "amount",
      description: "testing abcd",
      expiryDate: "24-06-2026",
      usage: 0,
      usageLimit: 10,
      status: "Expired",
    },

    {
      id: 2,
      title: "TTest",
      code: "CLEAN15",
      discount: 20,
      discountType: "amount",
      description: "wswstest",
      expiryDate: "26-05-2026",
      usage: 0,
      usageLimit: 1,
      status: "Expired",
    },

    {
      id: 3,
      title: "Brother Sister Offer",
      code: "BHAI50",
      discount: 50,
      discountType: "amount",
      description:
        "Exclusive Rakhi festive discount for family bookings. Enjoy special savings.",
      expiryDate: "14-05-2026",
      usage: 0,
      usageLimit: 8,
      status: "Expired",
    },

    {
      id: 4,
      title: "Welcome Offer",
      code: "WELCOME10",
      discount: 10,
      discountType: "percentage",
      description: "Welcome discount for new users.",
      expiryDate: "30-12-2026",
      usage: 4,
      usageLimit: 10,
      status: "Active",
    },
  ]);

  // =========================================================
  // SELECTED COUPONS
  // =========================================================

  const [selectedCoupons, setSelectedCoupons] = useState([]);

  // =========================================================
  // SELECT / DESELECT SINGLE COUPON
  // =========================================================

  const handleSelectCoupon = (id) => {
    setSelectedCoupons((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });
  };

  // =========================================================
  // SELECT / DESELECT ALL
  // =========================================================

  const handleSelectAll = () => {
    if (selectedCoupons.length === couponData.length) {
      setSelectedCoupons([]);
      return;
    }

    setSelectedCoupons(couponData.map((item) => item.id));
  };

  // =========================================================
  // DELETE SINGLE COUPON
  // =========================================================

  const handleDelete = (row) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete coupon "${row.code}"?`,
    );

    if (!confirmed) return;

    setCouponData((previous) =>
      previous.filter((item) => item.id !== row.id),
    );

    setSelectedCoupons((previous) =>
      previous.filter((item) => item !== row.id),
    );

    console.log("Delete Coupon:", row);

    // API DELETE CALL WILL BE CONNECTED HERE LATER
  };

  // =========================================================
  // DELETE SELECTED COUPONS
  // =========================================================

  const handleDeleteSelected = () => {
    if (selectedCoupons.length === 0) {
      alert("Please select at least one coupon.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedCoupons.length} selected coupon(s)?`,
    );

    if (!confirmed) return;

    setCouponData((previous) =>
      previous.filter((item) => !selectedCoupons.includes(item.id)),
    );

    console.log("Delete Selected Coupons:", selectedCoupons);

    setSelectedCoupons([]);

    // API BULK DELETE CALL WILL BE CONNECTED HERE LATER
  };

  // =========================================================
  // VIEW COUPON
  // =========================================================

  const handleView = (row) => {
    console.log("View Coupon:", row);

    // Navigation can be connected later
    // navigate(`/coupon/view/${row.id}`);
  };

  // =========================================================
  // EDIT COUPON
  // =========================================================

  const handleEdit = (row) => {
    console.log("Edit Coupon:", row);

    // Navigation can be connected later
    // navigate(`/coupon/edit/${row.id}`);
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: (
          <div className="manage-coupon-select-header">
            <input
              type="checkbox"
              className="manage-coupon-checkbox"
              checked={
                couponData.length > 0 &&
                selectedCoupons.length === couponData.length
              }
              onChange={handleSelectAll}
            />
          </div>
        ),
        width: "60px",
        sortable: false,

        render: (_, row) => (
          <input
            type="checkbox"
            className="manage-coupon-checkbox"
            checked={selectedCoupons.includes(row.id)}
            onChange={() => handleSelectCoupon(row.id)}
          />
        ),
      },

      {
        key: "serial",
        label: "#",
        width: "70px",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      {
        key: "title",
        label: "Title",
        width: "130px",
        sortable: true,

        render: (value) => (
          <strong className="manage-coupon-title">
            {value}
          </strong>
        ),
      },

      {
        key: "code",
        label: "Code",
        width: "120px",
        sortable: true,

        render: (value) => (
          <span className="manage-coupon-code">
            {value}
          </span>
        ),
      },

      {
        key: "discount",
        label: "Discount",
        width: "145px",
        sortable: true,

        render: (value, row) => (
          <span className="manage-coupon-discount">
            {row.discountType === "percentage"
              ? `${Number(value).toFixed(0)}%`
              : `$ ${Number(value).toFixed(2)}`}
          </span>
        ),
      },

      {
        key: "description",
        label: "Description",
        width: "190px",
        sortable: true,

        render: (value) => (
          <div className="manage-coupon-description">
            {value}
          </div>
        ),
      },

      {
        key: "expiryDate",
        label: "Expiry Date",
        width: "125px",
        sortable: true,

        render: (value) => (
          <div className="manage-coupon-expiry-date">
            {value}
          </div>
        ),
      },

      {
        key: "usage",
        label: "Usage",
        width: "120px",
        sortable: true,

        render: (value, row) => {
          const percentage =
            row.usageLimit > 0
              ? Math.min(
                  (Number(value) / Number(row.usageLimit)) * 100,
                  100,
                )
              : 0;

          return (
            <div className="manage-coupon-usage">
              <strong>
                {value}/{row.usageLimit}
              </strong>

              <div className="manage-coupon-progress">
                <div
                  className="manage-coupon-progress-bar"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        },
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
                ? "manage-coupon-status manage-coupon-status-active"
                : "manage-coupon-status manage-coupon-status-expired"
            }
          >
            {value === "Active" ? (
              <FaCheckCircle />
            ) : (
              <FaClock />
            )}

            {value}
          </span>
        ),
      },

      {
        key: "actions",
        label: "Action",
        width: "250px",
        sortable: false,

        render: (_, row) => (
          <div className="manage-coupon-actions">
            <button
              type="button"
              className="manage-coupon-btn manage-coupon-view-btn"
              onClick={() => handleView(row)}
            >
              <FaEye />
              View
            </button>

            <button
              type="button"
              className="manage-coupon-btn manage-coupon-edit-btn"
              onClick={() => handleEdit(row)}
            >
              <FaEdit />
              Edit
            </button>

            <button
              type="button"
              className="manage-coupon-btn manage-coupon-delete-btn"
              onClick={() => handleDelete(row)}
            >
              <FaTrash />
              Delete
            </button>
          </div>
        ),
      },
    ],
    [couponData, selectedCoupons],
  );

  return (
    <div className="manage-coupon-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="manage-coupon-header">

        <div>
          <h2 className="manage-coupon-title-heading">
            All Coupon Codes List
          </h2>

          <div className="manage-coupon-breadcrumb">
            <Link to="/home">
              Home
            </Link>

            <span>›</span>

            <span>
              Coupon Codes
            </span>
          </div>
        </div>

        <button
          type="button"
          className="manage-coupon-add-btn"
          onClick={() => navigate("/add_coupon")}
        >
          <FaPlus />
          Add New Coupon
        </button>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="manage-coupon-card">

        <DataTable
          columns={columns}
          data={couponData}
          entriesPerPageOptions={[10, 25, 50, 100]}
          defaultEntriesPerPage={10}
          searchable={true}
          sortable={true}
        />

        {/* ===================================================
            BOTTOM DELETE
        =================================================== */}

        <div className="manage-coupon-bottom-actions">

          <button
            type="button"
            className="manage-coupon-delete-selected-btn"
            onClick={handleDeleteSelected}
            disabled={selectedCoupons.length === 0}
          >
            <FaTrash />
            Delete Selected
          </button>

          {selectedCoupons.length > 0 && (
            <span className="manage-coupon-selected-count">
              {selectedCoupons.length} coupon
              {selectedCoupons.length > 1 ? "s" : ""} selected
            </span>
          )}

        </div>

      </div>

    </div>
  );
};

export default ManageCoupon;