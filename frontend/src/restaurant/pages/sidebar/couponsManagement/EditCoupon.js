import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  FaArrowLeft,
  FaInfoCircle,
  FaPercentage,
  FaUserShield,
  FaFolder,
  FaStore,
  FaBoxOpen,
  FaLock,
} from "react-icons/fa";

import api from "../../../../config/api";
import "./editCoupon.css";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";

// =========================================
// API CALLS
// =========================================

const getCouponDetails = async (id) => {
  const response = await api.get(`/restaurant/coupons/${id}/edit`);
  return response.data;
};

const updateCoupon = async (id, payload) => {
  const response = await api.put(`/restaurant/coupons/${id}`, payload);
  return response.data;
};

// =========================================
// COMPONENT
// =========================================

const EditCoupon = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    discountValue: "",
    discountType: "percent",
    usageLimit: "",
    expiryDate: "",
    userType: "all",
    status: 1,
  });

  const [category, setCategory] = useState(null);

  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);

  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // =========================================
  // FETCH COUPON EDIT DATA
  // =========================================

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getCouponDetails(id);

      if (!response?.success || !response?.data?.coupon) {
        throw new Error(response?.message || "Failed to load coupon details.");
      }

      const {
        coupon,
        categories = [],
        vendors = [],
        products = [],
      } = response.data;

      // =========================================
      // BASIC FORM DATA
      // =========================================

      setFormData({
        title: coupon?.title || "",
        code: coupon?.code || "",
        description: coupon?.description || "",

        discountValue:
          coupon?.discount_price !== undefined &&
          coupon?.discount_price !== null
            ? coupon.discount_price
            : (coupon?.cupon_price ?? ""),

        discountType: coupon?.discount_type || "percent",

        usageLimit: coupon?.usage_limit ?? "",

        expiryDate: coupon?.expired_at
          ? new Date(coupon.expired_at).toISOString().split("T")[0]
          : "",

        userType:
          String(coupon?.user_type || "")
            .trim()
            .toLowerCase() === "new_users"
            ? "new_users"
            : "all",

        status: Number(coupon?.status) === 1 ? 1 : 0,
      });

      // =========================================
      // CATEGORY
      // =========================================

      const categoryData = categories[0];

      setCategory(
        categoryData
          ? {
              id: categoryData.id,
              name: categoryData.category_name,
            }
          : {
              id: 118,
              name: "Restaurants",
            },
      );

      // =========================================
      // VENDORS
      // =========================================

      setVendors(vendors);

      const vendorIds = String(coupon?.vendor_ids || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      setSelectedVendors(vendorIds);

      // =========================================
      // PRODUCTS
      // =========================================

      setProducts(products);

      const productIds = String(coupon?.product_ids || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      setSelectedProducts(productIds);
    } catch (err) {
      console.error("Get Coupon Edit Data Error:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to load coupon details.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =========================================
  // FIELD HANDLERS
  // =========================================

  const handleFieldChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================================
  // VENDOR HANDLERS
  // =========================================

  const handleToggleVendor = (vendorId) => {
    setSelectedVendors((previous) =>
      previous.includes(vendorId)
        ? previous.filter((value) => value !== vendorId)
        : [...previous, vendorId],
    );
  };

  const handleSelectAllVendors = () => {
    if (selectedVendors.length === vendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(vendors.map((vendor) => String(vendor.id)));
    }
  };

  // =========================================
  // PRODUCT HANDLERS
  // =========================================

  const handleToggleProduct = (productId) => {
    setSelectedProducts((previous) =>
      previous.includes(productId)
        ? previous.filter((value) => value !== productId)
        : [...previous, productId],
    );
  };

  const handleSelectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product) => String(product.id)));
    }
  };

  const allVendorsSelected =
    vendors.length > 0 && selectedVendors.length === vendors.length;

  const allProductsSelected =
    products.length > 0 && selectedProducts.length === products.length;

  // =========================================
  // CANCEL
  // =========================================

  const handleCancel = () => {
    navigate("/restaurant/coupons");
  };

  // =========================================
  // SUBMIT / UPDATE
  // =========================================

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter coupon title.");
      return;
    }

    if (!formData.code.trim()) {
      toast.error("Please enter coupon code.");
      return;
    }

    if (
      formData.discountValue === "" ||
      formData.discountValue === null ||
      formData.discountValue === undefined
    ) {
      toast.error("Please enter discount value.");
      return;
    }

    if (!formData.expiryDate) {
      toast.error("Please select expiry date.");
      return;
    }

    if (!formData.usageLimit) {
      toast.error("Please enter usage limit.");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      setUpdateLoading(true);

      const payload = {
        title: formData.title.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description,
        discount_type: formData.discountType,
        discount_price: formData.discountValue,
        usage_limit: formData.usageLimit,
        expired_at: formData.expiryDate,
        user_type: formData.userType,
        status: formData.status,
        categories: category?.id ? [category.id] : [],
        vendors: selectedVendors,
        products: selectedProducts,
      };

      const response = await updateCoupon(id, payload);

      if (!response?.success) {
        toast.error(response?.message || "Failed to update coupon.");
        return;
      }

      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Update Coupon Error:", error);

      toast.error(error?.response?.data?.message || "Failed to update coupon.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="edit-coupon-page">
        <div className="edit-coupon-state">Loading coupon details...</div>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="edit-coupon-page">
        <div className="edit-coupon-state edit-coupon-state-error">{error}</div>
      </div>
    );
  }

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="edit-coupon-page">
      <Toaster position="top-right" />

      {/* PAGE HEADER */}

      <div className="edit-coupon-page-header">
        <h1>Edit Restaurant Coupon</h1>

        <button
          type="button"
          className="edit-coupon-back-button"
          onClick={handleCancel}
        >
          <FaArrowLeft />
          <span>Back To List</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* BASIC INFORMATION */}

        <div className="edit-coupon-card">
          <div className="edit-coupon-card-header">
            <div className="edit-coupon-card-title">
              <FaInfoCircle />
              <span>Basic Information</span>
            </div>

            <span className="edit-coupon-card-subtitle">
              Update coupon title, code and expiry
            </span>
          </div>

          <div className="edit-coupon-card-body">
            <div className="edit-coupon-grid-2">
              <div className="edit-coupon-field">
                <label>
                  Coupon Title <span className="edit-coupon-required">*</span>
                </label>

                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) =>
                    handleFieldChange("title", event.target.value)
                  }
                  placeholder="e.g. Weekend Dining Deal"
                />
              </div>

              <div className="edit-coupon-field">
                <label>
                  Coupon Code <span className="edit-coupon-required">*</span>
                </label>

                <input
                  type="text"
                  className="edit-coupon-code-input"
                  value={formData.code}
                  onChange={(event) =>
                    handleFieldChange("code", event.target.value.toUpperCase())
                  }
                  placeholder="e.g. SAVE25"
                />
              </div>
            </div>

            <div className="edit-coupon-field">
              <label>Description</label>

              <textarea
                rows={4}
                value={formData.description}
                onChange={(event) =>
                  handleFieldChange("description", event.target.value)
                }
                placeholder="Write a short description for this coupon"
              />
            </div>
          </div>
        </div>

        {/* DISCOUNT SETTINGS */}

        <div className="edit-coupon-card">
          <div className="edit-coupon-card-header">
            <div className="edit-coupon-card-title">
              <FaPercentage />
              <span>Discount Settings</span>
            </div>

            <span className="edit-coupon-card-subtitle">
              Update discount type and amount
            </span>
          </div>

          <div className="edit-coupon-card-body">
            <div className="edit-coupon-highlight-box edit-coupon-grid-3">
              <div className="edit-coupon-field">
                <label>
                  Discount <span className="edit-coupon-required">*</span>
                </label>

                <div className="edit-coupon-discount-input">
                  <input
                    type="number"
                    min="0"
                    value={formData.discountValue}
                    onChange={(event) =>
                      handleFieldChange("discountValue", event.target.value)
                    }
                  />

                  <select
                    value={formData.discountType}
                    onChange={(event) =>
                      handleFieldChange("discountType", event.target.value)
                    }
                  >
                    <option value="percent">%</option>
                    <option value="amount">$</option>
                  </select>
                </div>
              </div>

              <div className="edit-coupon-field">
                <label>
                  Usage Limit <span className="edit-coupon-required">*</span>
                </label>

                <input
                  type="number"
                  min="0"
                  value={formData.usageLimit}
                  onChange={(event) =>
                    handleFieldChange("usageLimit", event.target.value)
                  }
                />
              </div>

              <div className="edit-coupon-field">
                <label>
                  Expiry Date <span className="edit-coupon-required">*</span>
                </label>

                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(event) =>
                    handleFieldChange("expiryDate", event.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* USER & STATUS SETTINGS */}

        <div className="edit-coupon-card">
          <div className="edit-coupon-card-header">
            <div className="edit-coupon-card-title">
              <FaUserShield />
              <span>User &amp; Status Settings</span>
            </div>
          </div>

          <div className="edit-coupon-card-body">
            <div className="edit-coupon-grid-2">
              <div className="edit-coupon-field">
                <label>User Eligibility</label>

                <div className="edit-coupon-radio-group">
                  <label className="edit-coupon-radio">
                    <input
                      type="radio"
                      name="userType"
                      checked={formData.userType === "all"}
                      onChange={() => handleFieldChange("userType", "all")}
                    />
                    <span className="edit-coupon-radio-dot"></span>
                    All Users
                  </label>

                  <label className="edit-coupon-radio">
                    <input
                      type="radio"
                      name="userType"
                      checked={formData.userType === "new_users"}
                      onChange={() =>
                        handleFieldChange("userType", "new_users")
                      }
                    />
                    <span className="edit-coupon-radio-dot"></span>
                    New Users Only
                  </label>
                </div>
              </div>

              <div className="edit-coupon-field">
                <label>Status</label>

                <select
                  value={formData.status}
                  onChange={(event) =>
                    handleFieldChange("status", Number(event.target.value))
                  }
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY */}

        <div className="edit-coupon-card">
          <div className="edit-coupon-card-header">
            <div className="edit-coupon-card-title">
              <FaFolder />
              <span>Category</span>
            </div>

            <span className="edit-coupon-badge">
              Restricted to Restaurant Category
            </span>
          </div>

          <div className="edit-coupon-card-body">
            <div className="edit-coupon-locked-row">
              <label className="edit-coupon-checkbox-tile edit-coupon-checkbox-tile-locked">
                <input type="checkbox" checked readOnly disabled />

                <span className="edit-coupon-checkbox-box">
                  <FaLock />
                </span>

                <span className="edit-coupon-checkbox-label">
                  {category?.name}
                </span>

                <span className="edit-coupon-checkbox-id">#{category?.id}</span>
              </label>
            </div>

            <p className="edit-coupon-hint">
              Category is locked to restaurant segment.
            </p>
          </div>
        </div>

        {/* VENDORS */}

        <div className="edit-coupon-card">
          <div className="edit-coupon-card-header">
            <div className="edit-coupon-card-title">
              <FaStore />

              <span>Vendors</span>

              <span className="edit-coupon-optional">(optional)</span>
            </div>

            <span className="edit-coupon-badge">
              {vendors.length} vendor(s)
            </span>
          </div>

          <div className="edit-coupon-card-body">
            <label className="edit-coupon-select-all">
              <input
                type="checkbox"
                checked={allVendorsSelected}
                onChange={handleSelectAllVendors}
              />
              <span className="edit-coupon-checkbox-box"></span>
              Select All Vendors
            </label>

            <div className="edit-coupon-scroll-grid">
              {vendors.map((vendor) => (
                <label key={vendor.id} className="edit-coupon-checkbox-tile">
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes(String(vendor.id))}
                    onChange={() => handleToggleVendor(String(vendor.id))}
                  />

                  <span className="edit-coupon-checkbox-box"></span>

                  <span className="edit-coupon-checkbox-label">
                    {vendor.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* PRODUCTS / ITEMS */}

        <div className="edit-coupon-card">
          <div className="edit-coupon-card-header">
            <div className="edit-coupon-card-title">
              <FaBoxOpen />

              <span>Products / Items</span>

              <span className="edit-coupon-optional">(optional)</span>
            </div>

            <span className="edit-coupon-badge">{products.length} item(s)</span>
          </div>

          <div className="edit-coupon-card-body">
            <label className="edit-coupon-select-all">
              <input
                type="checkbox"
                checked={allProductsSelected}
                onChange={handleSelectAllProducts}
              />
              <span className="edit-coupon-checkbox-box"></span>
              Select All Products
            </label>

            <div className="edit-coupon-scroll-grid edit-coupon-scroll-grid-products">
              {products.map((product) => (
                <label key={product.id} className="edit-coupon-checkbox-tile">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(String(product.id))}
                    onChange={() => handleToggleProduct(String(product.id))}
                  />

                  <span className="edit-coupon-checkbox-box"></span>

                  <span className="edit-coupon-checkbox-label">
                    {product.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}

        <div className="edit-coupon-footer">
          <button
            type="button"
            className="edit-coupon-btn-cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="edit-coupon-btn-update"
            disabled={saving}
          >
            {saving ? "Updating..." : "Update"}
          </button>
        </div>
      </form>

      <ConfirmModal
        show={showConfirmModal}
        title="Update Coupon"
        message="Are you sure you want to update this coupon?"
        confirmText="Update"
        cancelText="Cancel"
        onConfirm={handleConfirmUpdate}
        onCancel={() => setShowConfirmModal(false)}
        loading={updateLoading}
      />

      <SuccessModal
        show={showSuccessModal}
        title="Success"
        message="Coupon updated successfully!"
        buttonText="OK"
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/restaurant/coupons");
        }}
      />
    </div>
  );
};

export default EditCoupon;
