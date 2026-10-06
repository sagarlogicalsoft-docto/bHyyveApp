import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Breadcrumbs from "../../common/BreadCrumbs";

import {
  FaTag,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCheck,
  FaTrashAlt,
  FaClock,
  FaMinus,
} from "react-icons/fa";

import DataTable from "../../../../Components/common/DataTable";
import api from "../../../../config/api";
import "./allCoupons.css";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";

const AllCoupons = () => {
  const navigate = useNavigate();

  const [couponData, setCouponData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [deleteCouponId, setDeleteCouponId] = useState(null);
  const [deleteCouponTitle, setDeleteCouponTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusCouponId, setStatusCouponId] = useState(null);
  const [statusCouponTitle, setStatusCouponTitle] = useState("");
  const [statusCurrentValue, setStatusCurrentValue] = useState(null);

  // =========================================
  // FORMAT COUPONS (pure helper, kept inline)
  // =========================================

  const formatCoupons = (coupons) => {
    const formatted = coupons.map((coupon, index) => {
      const discountType = coupon.discount_type || "amount";

      const discountPrice =
        coupon.discount_price !== undefined && coupon.discount_price !== null
          ? coupon.discount_price
          : coupon.cupon_price;

      const expiryDate = coupon.expired_at ? new Date(coupon.expired_at) : null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isExpired =
        expiryDate && !Number.isNaN(expiryDate.getTime()) && expiryDate < today;

      const daysLeft =
        expiryDate && !Number.isNaN(expiryDate.getTime())
          ? Math.floor(
              (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            )
          : null;

      const rawUserType = String(coupon.user_type || "")
        .trim()
        .toLowerCase();

      const userType =
        rawUserType === "all" ||
        rawUserType === "all_users" ||
        rawUserType === "all users" ||
        rawUserType === ""
          ? "All Users"
          : coupon.user_type;

      return {
        ...coupon,
        serial: index + 1,
        title: coupon.title || "-",
        description: coupon.description || "-",
        code: coupon.code || "-",
        discount: discountPrice,
        discountType,
        usage: Number(coupon.used_count) || 0,
        usageLimit: Number(coupon.usage_limit) || 0,
        userType,
        expiry: expiryDate
          ? expiryDate.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
        isExpired,
        daysLeft,
        statusValue: Number(coupon.status) === 1 ? 1 : 0,
        status: isExpired
          ? "Expired"
          : Number(coupon.status) === 1
            ? "Active"
            : "Inactive",
      };
    });

    // SORT: Active -> Expired -> Inactive, then newest first within each group
    const sorted = formatted.sort((a, b) => {
      const statusOrder = { Active: 1, Expired: 2, Inactive: 3 };

      const statusDifference =
        (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);

      if (statusDifference !== 0) {
        return statusDifference;
      }

      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();

      return dateB - dateA;
    });

    // FIX SERIAL NUMBERS AFTER SORTING
    return sorted.map((coupon, index) => ({
      ...coupon,
      serial: index + 1,
    }));
  };

  // =========================================
  // FETCH COUPONS
  // =========================================

  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const response = await api.get("/restaurant/coupons");

      if (response.data?.success) {
        const coupons = response.data?.data?.coupons || [];
        const finalCoupons = formatCoupons(coupons);

        setCouponData(finalCoupons);
      } else {
        toast.error(
          response.data?.message || "Failed to fetch restaurant coupons.",
        );
      }
    } catch (error) {
      console.error("Get Restaurant Coupons Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to fetch restaurant coupons.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // =========================================
  // TOGGLE STATUS (activate / deactivate)
  // =========================================

  const handleToggleStatus = (id, title, currentStatus) => {
    setStatusCouponId(id);
    setStatusCouponTitle(title);
    setStatusCurrentValue(currentStatus);
    setShowStatusModal(true);
  };

  const handleConfirmStatusToggle = async () => {
    const newStatus = statusCurrentValue === 1 ? 0 : 1;

    try {
      setStatusLoading(true);

      const response = await api.patch(
        `/restaurant/coupons/${statusCouponId}/status`,
        { status: newStatus },
      );

      if (response.data?.success) {
        setCouponData((previous) =>
          previous.map((coupon) =>
            coupon.id === statusCouponId
              ? {
                  ...coupon,
                  statusValue: newStatus,
                  status: newStatus === 1 ? "Active" : "Inactive",
                }
              : coupon,
          ),
        );

        setShowStatusModal(false);

        setSuccessMessage(
          response.data?.message ||
            (newStatus === 1
              ? "Coupon activated successfully."
              : "Coupon deactivated successfully."),
        );

        setShowSuccessModal(true);
      } else {
        toast.error(
          response.data?.message || "Failed to update coupon status.",
        );
      }
    } catch (error) {
      console.error("Update Coupon Status Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update coupon status.",
      );
    } finally {
      setStatusLoading(false);
    }
  };

  // =========================================
  // SELECT SINGLE COUPON
  // =========================================

  const handleSelectCoupon = (id) => {
    setSelectedCoupons((previous) => {
      if (previous.includes(id)) {
        return previous.filter((couponId) => couponId !== id);
      }

      return [...previous, id];
    });
  };

  //for handle days left

  const formatDaysLeft = (days) => {
    if (days === null || days < 0) return null;

    if (days === 0) return "Expires today";
    if (days === 1) return "1 day left";
    if (days < 30) return `${days} days left`;

    const months = Math.floor(days / 30);
    if (months === 1) return "1 month left";
    return `${months} months left`;
  };

  // =========================================
  // SELECT ALL
  // =========================================

  const handleSelectAll = () => {
    if (selectedCoupons.length === couponData.length) {
      setSelectedCoupons([]);
    } else {
      setSelectedCoupons(couponData.map((coupon) => coupon.id));
    }
  };

  // =========================================
  // CLEAR SELECTION
  // =========================================

  const handleClearSelection = () => {
    setSelectedCoupons([]);
  };

  // =========================================
  // DELETE SELECTED
  // =========================================

  const handleDeleteSelected = () => {
    if (selectedCoupons.length === 0) {
      toast.error("Please select at least one coupon.");
      return;
    }

    setDeleteType("bulk");
    setShowConfirmModal(true);
  };

  // =========================================
  // DELETE SINGLE COUPON
  // =========================================

  const handleDeleteCoupon = (id, title) => {
    setDeleteType("single");
    setDeleteCouponId(id);
    setDeleteCouponTitle(title);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);

      if (deleteType === "single") {
        const response = await api.delete(
          `/restaurant/coupons/${deleteCouponId}`,
        );

        if (!response.data?.success) {
          toast.error(response.data?.message || "Failed to delete coupon.");
          return;
        }

        setCouponData((previous) =>
          previous.filter((coupon) => coupon.id !== deleteCouponId),
        );

        setSelectedCoupons((previous) =>
          previous.filter((couponId) => couponId !== deleteCouponId),
        );

        setSuccessMessage(
          response.data?.message || "Coupon deleted successfully!",
        );
      }

      if (deleteType === "bulk") {
        const response = await api.delete("/restaurant/coupons/bulk", {
          data: {
            coupon_ids: selectedCoupons,
          },
        });

        if (!response.data?.success) {
          toast.error(
            response.data?.message || "Failed to delete selected coupons.",
          );
          return;
        }

        setCouponData((previous) =>
          previous.filter((coupon) => !selectedCoupons.includes(coupon.id)),
        );

        setSuccessMessage(
          response.data?.message ||
            `${selectedCoupons.length} coupon(s) deleted successfully!`,
        );

        setSelectedCoupons([]);
      }

      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Delete Coupon Error:", error);

      toast.error(error.response?.data?.message || "Failed to delete coupon.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================================
  // NAVIGATION
  // =========================================

  const handleAddCoupon = () => {
    navigate("/restaurant/coupon/create");
  };

  const handleViewCoupon = (id) => {
    navigate(`/restaurant/coupon/view_coupon/${id}`);
  };

  const handleEditCoupon = (id) => {
    navigate(`/restaurant/coupon/edit_coupon/${id}`);
  };

  // =========================================
  // TABLE COLUMNS
  // =========================================

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: (
          <button
            type="button"
            className={`coupon-select-all ${
              selectedCoupons.length === couponData.length &&
              couponData.length > 0
                ? "selected"
                : ""
            }`}
            onClick={(event) => {
              event.stopPropagation();
              handleSelectAll();
            }}
            title="Select all"
          >
            {selectedCoupons.length === couponData.length &&
            couponData.length > 0 ? (
              <FaCheck />
            ) : selectedCoupons.length > 0 ? (
              <FaMinus className="coupon-minus-icon" />
            ) : (
              ""
            )}
          </button>
        ),
        sortable: false,
        width: "55px",
        render: (_, row) => (
          <button
            type="button"
            className={`coupon-row-checkbox ${
              selectedCoupons.includes(row.id) ? "selected" : ""
            }`}
            onClick={() => handleSelectCoupon(row.id)}
            aria-label={`Select ${row.title}`}
          >
            {selectedCoupons.includes(row.id) && <FaCheck />}
          </button>
        ),
      },

      {
        key: "serial",
        label: "#",
        sortable: false,
        width: "55px",
      },

      {
        key: "title",
        label: "Title",
        width: "300px",
        render: (value, row) => (
          <div className="coupon-title-cell">
            <div className="coupon-title">{value}</div>
            <div className="coupon-description">{row.description}</div>
          </div>
        ),
      },

      {
        key: "code",
        label: "Code",
        width: "130px",
        render: (value) => <span className="coupon-code">{value}</span>,
      },

      {
        key: "discount",
        label: "Discount",
        width: "130px",
        render: (value, row) => (
          <span className="coupon-discount">
            {value}
            {row.discountType === "percent" ? "%" : ""}
          </span>
        ),
      },

      {
        key: "usage",
        label: "Usage",
        width: "150px",
        render: (value, row) => {
          const percentage =
            row.usageLimit > 0
              ? Math.min(100, Math.round((row.usage / row.usageLimit) * 100))
              : 0;

          return (
            <div className="coupon-usage">
              <div className="coupon-usage-info">
                <span>
                  {row.usage}/{row.usageLimit}
                </span>
                <span>{percentage}%</span>
              </div>

              <div className="coupon-progress">
                <div
                  className="coupon-progress-bar"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        },
      },

      {
        key: "userType",
        label: "User Type",
        width: "140px",
        render: (value) => <span className="coupon-user-type">{value}</span>,
      },

      {
        key: "expiry",
        label: "Expiry",
        width: "180px",
        render: (value, row) => (
          <div className="coupon-expiry-cell">
            <div
              className={`coupon-expiry-date ${
                row.isExpired ? "expired" : "active"
              }`}
            >
              <FaCalendarAlt />
              <span>{value}</span>
            </div>

            {row.isExpired ? (
              <div className="coupon-expired-text">
                <FaExclamationTriangle />
                <span>Expired</span>
              </div>
            ) : row.daysLeft !== null ? (
              <div className="coupon-days-left">
                <FaClock />
                <span>{formatDaysLeft(row.daysLeft)}</span>
              </div>
            ) : null}
          </div>
        ),
      },

      {
        key: "status",
        label: "Status",
        width: "150px",
        render: (value, row) => (
          <button
            type="button"
            className={`coupon-status ${
              value.toLowerCase() === "active" ? "active" : "expired"
            }`}
            disabled={row.isExpired}
            title={
              row.isExpired
                ? "Expired coupons cannot be toggled"
                : "Click to toggle"
            }
            onClick={() =>
              !row.isExpired &&
              handleToggleStatus(row.id, row.title, row.statusValue)
            }
          >
            <span className="coupon-status-dot"></span>
            {value}
          </button>
        ),
      },

      {
        key: "actions",
        label: "Action",
        sortable: false,
        width: "150px",
        render: (_, row) => (
          <div className="coupon-actions">
            <button
              type="button"
              className="coupon-action-button view"
              title="View"
              onClick={() => handleViewCoupon(row.id)}
            >
              <FaEye />
            </button>

            <button
              type="button"
              className="coupon-action-button edit"
              title="Edit"
              onClick={() => handleEditCoupon(row.id)}
            >
              <FaEdit />
            </button>

            <button
              type="button"
              className="coupon-action-button delete"
              title="Delete"
              onClick={() => handleDeleteCoupon(row.id, row.title)}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    [selectedCoupons, couponData],
  );

  return (
    <>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={[
            {
              label: "Coupons Management",
            },
            {
              label: "Coupons",
            },
          ]}
        />
      </div>
      <div className="all-coupons-page">
        <div className="all-coupons-header">
          <div className="all-coupons-title-wrapper">
            <div className="all-coupons-title-icon">
              <FaTag />
            </div>

            <div>
              <h1>Restaurant Coupon Management</h1>
              <p>Manage all restaurant discount coupons</p>
            </div>
          </div>
        </div>

        <div className="all-coupons-card">
          <div className="all-coupons-card-header">
            <div className="all-coupons-card-title">
              <h2>All Coupons</h2>
              <span className="coupon-count">{couponData.length}</span>
            </div>

            <button
              type="button"
              className="add-coupon-button"
              onClick={handleAddCoupon}
            >
              <FaPlus />
              <span>Add Coupon</span>
            </button>
          </div>

          {loading ? (
            <div className="coupon-loading">Loading coupons...</div>
          ) : (
            <DataTable
              columns={columns}
              data={couponData}
              entriesPerPageOptions={[5, 10, 25, 50, 100]}
              defaultEntriesPerPage={10}
              searchable={true}
              sortable={true}
            />
          )}
        </div>

        {selectedCoupons.length > 0 && (
          <div className="coupon-bulk-action-bar">
            <div className="coupon-selected-info">
              <div className="coupon-selected-icon">
                <FaCheck />
              </div>

              <strong>
                {selectedCoupons.length} coupon
                {selectedCoupons.length > 1 ? "s" : ""} selected
              </strong>

              <button
                type="button"
                className="clear-selection-button"
                onClick={handleClearSelection}
              >
                Clear Selection
              </button>
            </div>

            <button
              type="button"
              className="delete-selected-button"
              onClick={handleDeleteSelected}
            >
              <FaTrashAlt />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
        <ConfirmModal
          show={showConfirmModal}
          title={
            deleteType === "bulk" ? "Delete Selected Coupons" : "Delete Coupon"
          }
          message={
            deleteType === "bulk"
              ? `Are you sure you want to delete ${selectedCoupons.length} selected coupon(s)?`
              : `Are you sure you want to delete "${deleteCouponTitle}"?`
          }
          confirmText="Delete"
          cancelText="Cancel"
          loading={deleteLoading}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            if (!deleteLoading) {
              setShowConfirmModal(false);
            }
          }}
        />
        <ConfirmModal
          show={showStatusModal}
          title={
            statusCurrentValue === 1 ? "Deactivate Coupon" : "Activate Coupon"
          }
          message={`Are you sure you want to ${
            statusCurrentValue === 1 ? "deactivate" : "activate"
          } "${statusCouponTitle}"?`}
          confirmText={statusCurrentValue === 1 ? "Deactivate" : "Activate"}
          cancelText="Cancel"
          loading={statusLoading}
          onConfirm={handleConfirmStatusToggle}
          onCancel={() => {
            if (!statusLoading) setShowStatusModal(false);
          }}
        />

        <SuccessModal
          show={showSuccessModal}
          title="Success!"
          message={successMessage}
          buttonText="OK"
          onClose={() => setShowSuccessModal(false)}
        />
      </div>
    </>
  );
};

export default AllCoupons;
