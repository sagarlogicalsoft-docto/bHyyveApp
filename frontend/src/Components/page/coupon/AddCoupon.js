import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import {
  FaUsers,
  FaTags,
  FaStore,
  FaBoxOpen,
  FaSave,
  FaRedo,
  FaGlobe,
  FaUser,
} from "react-icons/fa";

import "./addCoupon.css";

const AddCoupon = () => {
  const navigate = useNavigate();

  // =========================================================
  // FORM DATA
  // =========================================================

  const [couponData, setCouponData] = useState({
    title: "",
    couponCode: "",
    discount: "",
    discountType: "percentage",
    description: "",
    expiryDate: "",
    usageLimit: "1",
    userEligibility: "all",
  });

  // =========================================================
  // CATEGORY DATA
  // =========================================================

  const categories = [
    { id: 1, name: "Cleaning" },
    { id: 2, name: "Construction" },
    { id: 3, name: "Real Estate" },
    { id: 4, name: "Food & Beverage" },
    { id: 5, name: "Beauty & Wellness" },
    { id: 6, name: "Automotive" },
    { id: 7, name: "Cleaning" },
    { id: 8, name: "Construction" },
    { id: 9, name: "Real Estate" },
    { id: 10, name: "Food & Beverage" },
    { id: 11, name: "Beauty & Wellness" },
    { id: 12, name: "Automotive" },
  ];

  // =========================================================
  // VENDOR DATA
  // =========================================================

  const vendors = [
    {
      id: 1,
      name: "Velvet Touch Cleaning Co.",
      categoryId: 1,
    },
    {
      id: 2,
      name: "Elite Clean Group",
      categoryId: 1,
    },
    {
      id: 3,
      name: "Happy Homes Cleaning Company",
      categoryId: 1,
    },
    {
      id: 4,
      name: "TrueFresh Cleaning Systems",
      categoryId: 1,
    },
    {
      id: 5,
      name: "BuildRight Construction",
      categoryId: 2,
    },
    {
      id: 6,
      name: "Prime Construction Group",
      categoryId: 2,
    },
    {
      id: 7,
      name: "Urban Realty",
      categoryId: 3,
    },
    {
      id: 8,
      name: "Fresh Taste Restaurant",
      categoryId: 4,
    },
  ];

  // =========================================================
  // PRODUCT DATA
  // =========================================================

  const products = [
    {
      id: 1,
      name: "Standard Clean",
      vendorId: 1,
    },
    {
      id: 2,
      name: "Detailed Clean",
      vendorId: 1,
    },
    {
      id: 3,
      name: "Deep Staging Clean",
      vendorId: 1,
    },
    {
      id: 4,
      name: "Home Deep Cleaning",
      vendorId: 2,
    },
    {
      id: 5,
      name: "Office Cleaning",
      vendorId: 2,
    },
    {
      id: 6,
      name: "Premium Construction",
      vendorId: 5,
    },
    {
      id: 7,
      name: "Home Renovation",
      vendorId: 5,
    },
  ];

  // =========================================================
  // USER DATA
  // =========================================================

  const users = [
    {
      id: 1,
      name: "Sagar Malik",
      email: "sagarmalik8000@gmail.com",
      mobile: "6473906555",
    },
    {
      id: 2,
      name: "Rahul Testing",
      email: "rahultesting@gmail.com",
      mobile: "9876543210",
    },
    {
      id: 3,
      name: "John Customer",
      email: "johncustomer@gmail.com",
      mobile: "9876501234",
    },
    {
      id: 4,
      name: "Test User",
      email: "testuser@gmail.com",
      mobile: "9999999999",
    },
  ];

  // =========================================================
  // SELECTED ITEMS
  // =========================================================

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setCouponData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // CATEGORY SELECTION
  // =========================================================

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((previous) => {
      if (previous.includes(categoryId)) {
        return previous.filter((id) => id !== categoryId);
      }

      return [...previous, categoryId];
    });

    // Remove vendors that no longer belong to selected categories
    setSelectedVendors((previousVendors) =>
      previousVendors.filter((vendorId) => {
        const vendor = vendors.find((item) => item.id === vendorId);

        return (
          vendor &&
          selectedCategories.includes(vendor.categoryId)
        );
      }),
    );
  };

  // =========================================================
  // SELECT ALL CATEGORIES
  // =========================================================

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
      setSelectedVendors([]);
      setSelectedProducts([]);
      return;
    }

    setSelectedCategories(categories.map((category) => category.id));
  };

  // =========================================================
  // VISIBLE VENDORS
  // =========================================================

  const visibleVendors = useMemo(() => {
    return vendors.filter((vendor) =>
      selectedCategories.includes(vendor.categoryId),
    );
  }, [selectedCategories]);

  // =========================================================
  // VENDOR SELECTION
  // =========================================================

  const handleVendorChange = (vendorId) => {
    setSelectedVendors((previous) => {
      if (previous.includes(vendorId)) {
        return previous.filter((id) => id !== vendorId);
      }

      return [...previous, vendorId];
    });
  };

  // =========================================================
  // SELECT ALL VENDORS
  // =========================================================

  const handleSelectAllVendors = () => {
    if (selectedVendors.length === visibleVendors.length) {
      setSelectedVendors([]);
      setSelectedProducts([]);
      return;
    }

    setSelectedVendors(
      visibleVendors.map((vendor) => vendor.id),
    );
  };

  // =========================================================
  // VISIBLE PRODUCTS
  // =========================================================

  const visibleProducts = useMemo(() => {
    return products.filter((product) =>
      selectedVendors.includes(product.vendorId),
    );
  }, [selectedVendors]);

  // =========================================================
  // PRODUCT SELECTION
  // =========================================================

  const handleProductChange = (productId) => {
    setSelectedProducts((previous) => {
      if (previous.includes(productId)) {
        return previous.filter((id) => id !== productId);
      }

      return [...previous, productId];
    });
  };

  // =========================================================
  // SELECT ALL PRODUCTS
  // =========================================================

  const handleSelectAllProducts = () => {
    if (selectedProducts.length === visibleProducts.length) {
      setSelectedProducts([]);
      return;
    }

    setSelectedProducts(
      visibleProducts.map((product) => product.id),
    );
  };

  // =========================================================
  // USER SELECTION
  // =========================================================

  const handleUserChange = (userId) => {
    setSelectedUsers((previous) => {
      if (previous.includes(userId)) {
        return previous.filter((id) => id !== userId);
      }

      return [...previous, userId];
    });
  };

  // =========================================================
  // SELECT ALL USERS
  // =========================================================

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
      return;
    }

    setSelectedUsers(users.map((user) => user.id));
  };

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {
    setCouponData({
      title: "",
      couponCode: "",
      discount: "",
      discountType: "percentage",
      description: "",
      expiryDate: "",
      usageLimit: "1",
      userEligibility: "all",
    });

    setSelectedCategories([]);
    setSelectedVendors([]);
    setSelectedProducts([]);
    setSelectedUsers([]);
  };

  // =========================================================
  // SAVE COUPON
  // =========================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!couponData.title.trim()) {
      alert("Please enter coupon title.");
      return;
    }

    if (!couponData.couponCode.trim()) {
      alert("Please enter coupon code.");
      return;
    }

    if (!couponData.discount) {
      alert("Please enter discount.");
      return;
    }

    if (!couponData.expiryDate) {
      alert("Please select expiry date.");
      return;
    }

    if (selectedCategories.length === 0) {
      alert("Please select at least one category.");
      return;
    }

    if (selectedVendors.length === 0) {
      alert("Please select at least one vendor.");
      return;
    }

    if (
      couponData.userEligibility === "specific" &&
      selectedUsers.length === 0
    ) {
      alert("Please select at least one user.");
      return;
    }

    const payload = {
      ...couponData,
      categories: selectedCategories,
      vendors: selectedVendors,
      products: selectedProducts,
      users:
        couponData.userEligibility === "all"
          ? "all"
          : selectedUsers,
    };

    console.log("ADD COUPON API DATA:", payload);

    // =======================================================
    // BACKEND API WILL BE CONNECTED HERE
    // =======================================================

    alert("Coupon saved successfully.");

    // navigate("/coupons");
  };

  return (
    <div className="add-coupon-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="add-coupon-header">

        <h2 className="add-coupon-page-title">
          Add New Coupon Code
        </h2>

        <div className="add-coupon-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="add-coupon-breadcrumb-active">
            Add New Coupon
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="add-coupon-card">

        <h3 className="add-coupon-card-title">
          Add New Coupon Code
        </h3>

        <form onSubmit={handleSubmit}>

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="add-coupon-form-section">

            <div className="add-coupon-form-grid">

              {/* TITLE */}

              <div className="add-coupon-field">

                <label>
                  Title <span>*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter coupon title"
                  value={couponData.title}
                  onChange={handleChange}
                />

              </div>

              {/* COUPON CODE */}

              <div className="add-coupon-field">

                <label>
                  Coupon Code <span>*</span>
                </label>

                <input
                  type="text"
                  name="couponCode"
                  placeholder="Enter coupon code manually"
                  value={couponData.couponCode}
                  onChange={handleChange}
                />

              </div>

              {/* DISCOUNT */}

              <div className="add-coupon-field">

                <label>
                  Discount <span>*</span>
                </label>

                <div className="add-coupon-discount-row">

                  <input
                    type="number"
                    name="discount"
                    min="0"
                    placeholder="Enter discount"
                    value={couponData.discount}
                    onChange={handleChange}
                  />

                  <select
                    name="discountType"
                    value={couponData.discountType}
                    onChange={handleChange}
                  >
                    <option value="percentage">
                      % Percentage
                    </option>

                    <option value="fixed">
                      $ Fixed Amount
                    </option>
                  </select>

                </div>

                <small>
                  Enter discount value for the coupon.
                </small>

              </div>

              {/* DESCRIPTION */}

              <div className="add-coupon-field">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Enter coupon description"
                  value={couponData.description}
                  onChange={handleChange}
                  rows="3"
                />

              </div>

              {/* EXPIRY DATE */}

              <div className="add-coupon-field">

                <label>
                  Expiry Date <span>*</span>
                </label>

                <input
                  type="date"
                  name="expiryDate"
                  value={couponData.expiryDate}
                  onChange={handleChange}
                />

              </div>

              {/* USAGE LIMIT */}

              <div className="add-coupon-field">

                <label>
                  Usage Limit <span>*</span>
                </label>

                <input
                  type="number"
                  name="usageLimit"
                  min="1"
                  placeholder="Enter usage limit"
                  value={couponData.usageLimit}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* =================================================
                USER ELIGIBILITY
            ================================================= */}

            <div className="add-coupon-section-title">

              <FaUsers />

              <span>
                User Eligibility
              </span>

            </div>

            <div className="add-coupon-radio-row">

              <label className="add-coupon-radio-option">

                <input
                  type="radio"
                  name="userEligibility"
                  value="all"
                  checked={
                    couponData.userEligibility === "all"
                  }
                  onChange={handleChange}
                />

                <FaGlobe />

                <span>
                  All Users
                </span>

              </label>

              <label className="add-coupon-radio-option">

                <input
                  type="radio"
                  name="userEligibility"
                  value="specific"
                  checked={
                    couponData.userEligibility === "specific"
                  }
                  onChange={handleChange}
                />

                <FaUser />

                <span>
                  Specific Users
                </span>

              </label>

            </div>

            {/* =================================================
                SPECIFIC USERS
            ================================================= */}

            {couponData.userEligibility === "specific" && (
              <div className="add-coupon-selection-block">

                <div className="add-coupon-section-title">

                  <FaUsers />

                  <span>
                    Select Users
                  </span>

                </div>

                <div className="add-coupon-selection-list">

                  <div className="add-coupon-selection-actions">

                    <button
                      type="button"
                      onClick={handleSelectAllUsers}
                    >
                      Select All Users
                    </button>

                    <button
                      type="button"
                      className="add-coupon-deselect-btn"
                      onClick={() => setSelectedUsers([])}
                    >
                      Deselect All
                    </button>

                  </div>

                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="add-coupon-checkbox-row"
                    >

                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(
                          user.id,
                        )}
                        onChange={() =>
                          handleUserChange(user.id)
                        }
                      />

                      <FaUser />

                      <span>
                        {user.name}
                      </span>

                      <small>
                        {user.email} • {user.mobile}
                      </small>

                    </label>
                  ))}

                </div>

              </div>
            )}

            {/* =================================================
                CATEGORIES
            ================================================= */}

            <div className="add-coupon-section-title">

              <FaTags />

              <span>
                Select Categories (Multiple Selection)
              </span>

            </div>

            <div className="add-coupon-selection-list">

              <div className="add-coupon-selection-actions">

                <button
                  type="button"
                  onClick={handleSelectAllCategories}
                >
                  Select All Categories
                </button>

                <button
                  type="button"
                  className="add-coupon-deselect-btn"
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedVendors([]);
                    setSelectedProducts([]);
                  }}
                >
                  Deselect All
                </button>

              </div>

              {categories.map((category) => (
                <label
                  key={category.id}
                  className="add-coupon-checkbox-row"
                >

                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(
                      category.id,
                    )}
                    onChange={() =>
                      handleCategoryChange(category.id)
                    }
                  />

                  <span>
                    {category.name}
                  </span>

                </label>
              ))}

            </div>

            {/* =================================================
                VENDORS
                ONLY AFTER CATEGORY SELECTION
            ================================================= */}

            {selectedCategories.length > 0 && (
              <>

                <div className="add-coupon-section-title">

                  <FaStore />

                  <span>
                    Select Vendors (Multiple Selection)
                  </span>

                </div>

                <div className="add-coupon-selection-list">

                  <div className="add-coupon-selection-actions">

                    <button
                      type="button"
                      onClick={handleSelectAllVendors}
                    >
                      Select All Vendors
                    </button>

                    <button
                      type="button"
                      className="add-coupon-deselect-btn"
                      onClick={() => {
                        setSelectedVendors([]);
                        setSelectedProducts([]);
                      }}
                    >
                      Deselect All
                    </button>

                  </div>

                  {visibleVendors.length === 0 ? (
                    <div className="add-coupon-empty">
                      No vendors available for selected
                      categories.
                    </div>
                  ) : (
                    visibleVendors.map((vendor) => (
                      <label
                        key={vendor.id}
                        className="add-coupon-checkbox-row"
                      >

                        <input
                          type="checkbox"
                          checked={selectedVendors.includes(
                            vendor.id,
                          )}
                          onChange={() =>
                            handleVendorChange(vendor.id)
                          }
                        />

                        <FaStore />

                        <span>
                          {vendor.name}
                        </span>

                        <small>
                          (
                          {
                            categories.find(
                              (category) =>
                                category.id ===
                                vendor.categoryId,
                            )?.name
                          }
                          )
                        </small>

                      </label>
                    ))
                  )}

                </div>

              </>
            )}

            {/* =================================================
                PRODUCTS
                ONLY AFTER VENDOR SELECTION
            ================================================= */}

            {selectedVendors.length > 0 && (
              <>

                <div className="add-coupon-section-title">

                  <FaBoxOpen />

                  <span>
                    Select Products (Multiple Selection -
                    From Selected Vendors)
                  </span>

                </div>

                <div className="add-coupon-selection-list">

                  <div className="add-coupon-selection-actions">

                    <button
                      type="button"
                      onClick={handleSelectAllProducts}
                    >
                      Select All Products
                    </button>

                    <button
                      type="button"
                      className="add-coupon-deselect-btn"
                      onClick={() =>
                        setSelectedProducts([])
                      }
                    >
                      Deselect All
                    </button>

                  </div>

                  {selectedVendors.map((vendorId) => {

                    const vendor = vendors.find(
                      (item) => item.id === vendorId,
                    );

                    const vendorProducts =
                      visibleProducts.filter(
                        (product) =>
                          product.vendorId === vendorId,
                      );

                    if (!vendor) return null;

                    return (
                      <div
                        key={vendor.id}
                        className="add-coupon-product-group"
                      >

                        <div className="add-coupon-product-vendor">
                          <FaStore />
                          {vendor.name}
                        </div>

                        {vendorProducts.length === 0 ? (
                          <div className="add-coupon-empty">
                            No products available.
                          </div>
                        ) : (
                          vendorProducts.map((product) => (
                            <label
                              key={product.id}
                              className="add-coupon-checkbox-row add-coupon-product-row"
                            >

                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(
                                  product.id,
                                )}
                                onChange={() =>
                                  handleProductChange(
                                    product.id,
                                  )
                                }
                              />

                              <span>
                                {product.name}
                              </span>

                            </label>
                          ))
                        )}

                      </div>
                    );
                  })}

                </div>

              </>
            )}

          </div>

          {/* =================================================
              FORM BUTTONS
          ================================================= */}

          <div className="add-coupon-form-actions">

            <button
              type="submit"
              className="add-coupon-save-btn"
            >
              <FaSave />
              Save Coupon
            </button>

            <button
              type="button"
              className="add-coupon-reset-btn"
              onClick={handleReset}
            >
              <FaRedo />
              Reset
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddCoupon;