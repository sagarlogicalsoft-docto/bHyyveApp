import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  FaTag,
  FaTimes,
  FaFolder,
  FaStore,
  FaBoxOpen,
  FaEdit,
  FaGlobe,
} from "react-icons/fa";

import api from "../../../../config/api";
import "./viewCoupon.css";

// =========================================
// API CALLS
// =========================================

const getCouponDetails = async (id) => {
  const response = await api.get(`/restaurant/coupons/${id}`);
  return response.data;
};

const getCategoriesByIds = async (ids) => {
  const response = await api.get(
    `/restaurant/coupons/categories-by-ids?ids=${encodeURIComponent(ids)}`
  );
  return response.data;
};

const getVendorsByIds = async (ids) => {
  const response = await api.get(
    `/restaurant/coupons/vendors-by-ids?ids=${encodeURIComponent(ids)}`
  );
  return response.data;
};

const getProductsByIds = async (ids) => {
  const response = await api.get(
    `/restaurant/coupons/products-by-ids?ids=${encodeURIComponent(ids)}`
  );
  return response.data;
};

const ViewCoupon = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState(null);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================================
  // FETCH COUPON + RELATED DATA
  // =========================================

  const fetchCouponDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      // First get coupon
      const couponResponse = await getCouponDetails(id);
      if (!couponResponse?.success) {
        const message =
          couponResponse?.message || "Failed to load coupon details.";
        setError(message);
        toast.error(message);
        return;
      }

      const couponData =
        couponResponse.data?.coupon || couponResponse.data || null;
      setCoupon(couponData);

      // =========================================
      // GET CATEGORY / VENDOR / PRODUCT NAMES
      // =========================================

      const categoryIds = String(couponData?.category_ids || "").trim();
      const vendorIds = String(couponData?.vendor_ids || "").trim();
      const productIds = String(couponData?.product_ids || "").trim();

      // Categories
      if (categoryIds) {
        try {
          const response = await getCategoriesByIds(categoryIds);
          if (response?.success) {
            setCategories(response.data || []);
          } else {
            setCategories([]);
          }
        } catch (error) {
          console.error("Get Categories By IDs Error:", error);
          setCategories([]);
        }
      } else {
        setCategories([]);
      }

      // Vendors
      if (vendorIds) {
        try {
          const response = await getVendorsByIds(vendorIds);
          if (response?.success) {
            setVendors(response.data || []);
          } else {
            setVendors([]);
          }
        } catch (error) {
          console.error("Get Vendors By IDs Error:", error);
          setVendors([]);
        }
      } else {
        setVendors([]);
      }

      // Products
      if (productIds) {
        try {
          const response = await getProductsByIds(productIds);
          if (response?.success) {
            setProducts(response.data || []);
          } else {
            setProducts([]);
          }
        } catch (error) {
          console.error("Get Products By IDs Error:", error);
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Get Coupon Details Error:", err);
      const message =
        err.response?.data?.message || "Failed to load coupon details.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCouponDetails();
  }, [fetchCouponDetails]);

  // =========================================
  // NAVIGATION
  // =========================================

  const handleClose = () => {
    navigate("/restaurant/coupons");
  };

  const handleEdit = () => {
    navigate(`/restaurant/coupon/edit_coupon/${id}`);
  };

  // =========================================
  // DERIVED VALUES
  // =========================================

  const discountType = coupon?.discount_type || "amount";
  const discountValue =
    coupon?.discount_price !== undefined && coupon?.discount_price !== null
      ? coupon.discount_price
      : coupon?.cupon_price;

  const usageLimit = Number(coupon?.usage_limit) || 0;
  const usedCount = Number(coupon?.used_count) || 0;
  const usagePercentage =
    usageLimit > 0
      ? Math.min(100, Math.round((usedCount / usageLimit) * 100))
      : 0;

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isExpired = coupon?.expired_at
    ? new Date(coupon.expired_at) < new Date()
    : false;

  const statusLabel = isExpired
    ? "Expired"
    : Number(coupon?.status) === 1
      ? "Active"
      : "Inactive";

  const rawUserType = String(coupon?.user_type || "").trim().toLowerCase();
  const userTypeLabel =
    rawUserType === "all" || rawUserType === "all_users" || rawUserType === ""
      ? "All Users"
      : coupon?.user_type;

  const badgeClassForStatus =
    statusLabel === "Active"
      ? "view-coupon-badge-green"
      : statusLabel === "Expired"
        ? "view-coupon-badge-orange"
        : "view-coupon-badge-gray";

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="view-coupon-page">
      <Toaster position="top-right" />
      {/* BREADCRUMB */}
      <div className="view-coupon-breadcrumb">
        <Link to="/restaurant/dashboard">Home</Link>
        <span>/</span>
        <Link to="/restaurant/coupons">Coupon List</Link>
        <span>/</span>
        <span>Coupon Details</span>
      </div>

      <div className="view-coupon-card">
        {/* HEADER */}
        <div className="view-coupon-header">
          <div className="view-coupon-header-title">
            <FaTag />
            <span>Coupon Details</span>
          </div>
          <button
            type="button"
            className="view-coupon-close-icon"
            onClick={handleClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* BODY */}
        <div className="view-coupon-body">
          {loading ? (
            <div className="view-coupon-state">Loading coupon details...</div>
          ) : error ? (
            <div className="view-coupon-state view-coupon-state-error">
              {error}
            </div>
          ) : (
            <>
              {/* COUPON INFORMATION */}
              <div className="view-coupon-section">
                <div className="view-coupon-section-title">
                  <FaTag />
                  <span>Coupon Information</span>
                </div>
                <div className="view-coupon-info-list">
                  <div className="view-coupon-info-row">
                    <span className="view-coupon-label">Coupon ID:</span>
                    <span className="view-coupon-value">
                      #{coupon?.id ?? "-"}
                    </span>
                  </div>
                  <div className="view-coupon-info-row">
                    <span className="view-coupon-label">Title:</span>
                    <span className="view-coupon-value">
                      {coupon?.title || "-"}
                    </span>
                  </div>
                  <div className="view-coupon-info-row">
                    <span className="view-coupon-label">Code:</span>
                    <span className="view-coupon-code">
                      {coupon?.code || "-"}
                    </span>
                  </div>
                  <div className="view-coupon-info-row">
                    <span className="view-coupon-label">Discount:</span>
                    <span className="view-coupon-badge view-coupon-badge-blue">
                      {discountValue ?? "-"}
                      {discountType === "percent" ? "%" : ""}
                    </span>
                  </div>
                  <div className="view-coupon-info-row">
                    <span className="view-coupon-label">Description:</span>
                    <span className="view-coupon-value">
                      {coupon?.description || "-"}
                    </span>
                  </div>
                  <div className="view-coupon-info-row">
                    <span className="view-coupon-label">Usage Limit:</span>
                    <span className="view-coupon-value">
                      {usageLimit} times
                    </span>
                  </div>
                  <div className="view-coupon-info-row">
                    <span className="view-coupon-label">Used Count:</span>
                    <span className="view-coupon-value">
                      {usedCount} times
                    </span>
                  </div>
                  <div className="view-coupon-progress">
                    <div
                      className="view-coupon-progress-bar"
                      style={{ width: `${usagePercentage}%` }}
                    ></div>
                  </div>
                  <div className="view-coupon-info-row">
                    <span className="view-coupon-label">Created Date:</span>
                    <span className="view-coupon-value">
                      {formatDate(coupon?.created_at)}
                    </span>
                  </div>
                  <div className="view-coupon-info-row">
                    <span className="view-coupon-label">Expiry Date:</span>
                    <span className="view-coupon-value">
                      {formatDate(coupon?.expired_at)}
                    </span>
                    {isExpired && (
                      <span className="view-coupon-badge view-coupon-badge-orange view-coupon-inline-badge">
                        Expired
                      </span>
                    )}
                  </div>
                  <div className="view-coupon-info-row">
                    <span className="view-coupon-label">Status:</span>
                    <span className={`view-coupon-badge ${badgeClassForStatus}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="view-coupon-info-row">
                    <span className="view-coupon-label">User Eligibility:</span>
                    <span className="view-coupon-badge view-coupon-badge-teal">
                      <FaGlobe />
                      {userTypeLabel || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* APPLICABLE CATEGORIES */}
              <div className="view-coupon-section">
                <div className="view-coupon-section-title">
                  <FaFolder />
                  <span>Applicable Categories</span>
                </div>
                <div className="view-coupon-pill-group">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <span key={category.id} className="view-coupon-pill">
                        <FaFolder />
                        {category.category_name || "-"}
                      </span>
                    ))
                  ) : (
                    <span className="view-coupon-empty">
                      No categories restricted
                    </span>
                  )}
                </div>
              </div>

              {/* APPLICABLE VENDORS */}
              <div className="view-coupon-section">
                <div className="view-coupon-section-title">
                  <FaStore />
                  <span>Applicable Vendors</span>
                </div>
                <div className="view-coupon-pill-group">
                  {vendors.length > 0 ? (
                    vendors.map((vendor) => (
                      <span key={vendor.id} className="view-coupon-pill">
                        <FaStore />
                        {vendor.name || "-"}
                      </span>
                    ))
                  ) : (
                    <span className="view-coupon-empty">
                      No vendors restricted
                    </span>
                  )}
                </div>
              </div>

              {/* APPLICABLE PRODUCTS */}
              <div className="view-coupon-section">
                <div className="view-coupon-section-title">
                  <FaBoxOpen />
                  <span>Applicable Products</span>
                </div>
                <div className="view-coupon-pill-group">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <span key={product.id} className="view-coupon-pill">
                        <FaBoxOpen />
                        {product.name || "-"}
                      </span>
                    ))
                  ) : (
                    <span className="view-coupon-empty">
                      No products restricted
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="view-coupon-footer">
          <button type="button" className="view-coupon-btn-close" onClick={handleClose}>
            <FaTimes />
            <span>Close</span>
          </button>
          <button
            type="button"
            className="view-coupon-btn-edit"
            onClick={handleEdit}
            disabled={loading || !!error}
          >
            <FaEdit />
            <span>Edit Coupon</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCoupon;