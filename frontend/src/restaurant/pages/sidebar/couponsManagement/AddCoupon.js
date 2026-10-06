import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./addCoupon.css";
import api from "../../../../config/api";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";

const LOCKED_CATEGORY = {
  id: 118,
  name: "Restaurants",
};

const DISCOUNT_TYPES = [
  { value: "percent", label: "%" },
  { value: "flat", label: "$" },
];

const emptyForm = {
  title: "",
  code: "",
  description: "",
  discountAmount: "0",
  discountType: "percent",
  usageLimit: "",
  expiryDate: "",
  eligibility: "all",
};

export default function AddCoupon({
  initialData = null,
  onBack,
  onSaved = () => {},
  lockedCategory = LOCKED_CATEGORY,
}) {
  const navigate = useNavigate();

  const handleBack = onBack || (() => navigate("/restaurant/coupons"));

  const isEditMode = Boolean(initialData && initialData.id);

  const [form, setForm] = useState({
    ...emptyForm,
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [listsError, setListsError] = useState(null);

  const [selectedVendorIds, setSelectedVendorIds] = useState(
    () => new Set(initialData?.vendorIds || []),
  );

  const [selectedProductIds, setSelectedProductIds] = useState(
    () => new Set(initialData?.productIds || []),
  );

  const [vendorSearch, setVendorSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLists() {
      setLoadingLists(true);
      setListsError(null);

      try {
        const response = await api.get("/restaurant/coupons/add-data", {
          signal: controller.signal,
        });

        const data = response.data;

        if (!data.success) {
          throw new Error(data.message || "Failed to load coupon data.");
        }

        setVendors(data.data?.vendors || []);
        setProducts(data.data?.products || []);
      } catch (err) {
        if (err.name !== "ERR_CANCELED") {
          console.error("Load coupon data error:", err);
          setListsError(
            "Couldn't load vendors and products. Please try again.",
          );
        }
      } finally {
        setLoadingLists(false);
      }
    }

    loadLists();

    return () => controller.abort();
  }, [lockedCategory.id]);

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => (prev[field] ? { ...prev, [field]: null } : prev));
  }, []);

  const validate = useCallback(() => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Coupon title is required.";
    }

    if (!form.code.trim()) {
      nextErrors.code = "Coupon code is required.";
    }

    if (form.discountAmount === "" || Number(form.discountAmount) <= 0) {
      nextErrors.discountAmount = "Enter a discount amount greater than 0.";
    }

    if (form.discountType === "percent" && Number(form.discountAmount) > 100) {
      nextErrors.discountAmount = "Percentage discount can't exceed 100%.";
    }

    if (!form.usageLimit || Number(form.usageLimit) <= 0) {
      nextErrors.usageLimit = "Usage limit is required.";
    }

    if (!form.expiryDate) {
      nextErrors.expiryDate = "Expiry date is required.";
    } else if (
      new Date(form.expiryDate) < new Date(new Date().toDateString())
    ) {
      nextErrors.expiryDate = "Expiry date can't be in the past.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form]);

  const filteredVendors = useMemo(
    () =>
      vendors.filter((v) =>
        String(v.name || "")
          .toLowerCase()
          .includes(vendorSearch.trim().toLowerCase()),
      ),
    [vendors, vendorSearch],
  );
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesVendor =
        selectedVendorIds.size === 0 ||
        selectedVendorIds.has(Number(product.vendor_id));

      const matchesSearch = String(product.name || "")
        .toLowerCase()
        .includes(productSearch.trim().toLowerCase());

      return matchesVendor && matchesSearch;
    });
  }, [products, selectedVendorIds, productSearch]);

  const visibleSelectedProductCount = filteredProducts.filter((product) =>
    selectedProductIds.has(product.id),
  ).length;

  const toggleOne = (setFn) => (id) => {
    setFn((prev) => {
      const next = new Set(prev);

      next.has(id) ? next.delete(id) : next.add(id);

      return next;
    });
  };

  const toggleVendor = toggleOne(setSelectedVendorIds);
  useEffect(() => {
    setSelectedProductIds((prev) => {
      // No vendor selected = keep product selections as they are
      if (selectedVendorIds.size === 0) {
        return prev;
      }

      const allowedProductIds = new Set(
        products
          .filter((product) => selectedVendorIds.has(Number(product.vendor_id)))
          .map((product) => product.id),
      );

      const next = new Set([...prev].filter((id) => allowedProductIds.has(id)));

      return next;
    });
  }, [selectedVendorIds, products]);
  const toggleProduct = toggleOne(setSelectedProductIds);

  const allVendorsSelected =
    vendors.length > 0 && selectedVendorIds.size === vendors.length;

  const allProductsSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((product) => selectedProductIds.has(product.id));

  const toggleSelectAllVendors = () => {
    setSelectedVendorIds(
      allVendorsSelected ? new Set() : new Set(vendors.map((v) => v.id)),
    );
  };

  const toggleSelectAllProducts = () => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);

      if (allProductsSelected) {
        // Remove only currently visible/filtered products
        filteredProducts.forEach((product) => {
          next.delete(product.id);
        });
      } else {
        // Select only currently visible/filtered products
        filteredProducts.forEach((product) => {
          next.add(product.id);
        });
      }

      return next;
    });
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    code: form.code.trim().toUpperCase(),
    discount_price: Number(form.discountAmount),
    discount_type: form.discountType === "flat" ? "amount" : form.discountType,
    description: form.description.trim(),
    expired_at: form.expiryDate,
    ...(form.usageLimit ? { usage_limit: Number(form.usageLimit) } : {}),
    user_type: form.eligibility || "all",
    categories: [lockedCategory.id],
    vendors: Array.from(selectedVendorIds),
    products: Array.from(selectedProductIds),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      const firstErrorEl = document.querySelector(".is-invalid");

      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      return;
    }

    // Validation passed → show confirmation popup
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = buildPayload();

      const response = initialData?.id
        ? await api.put(`/restaurant/coupons/${initialData.id}`, payload)
        : await api.post("/restaurant/coupons", payload);

      const saved = response.data;

      if (!saved.success) {
        throw new Error(saved.message || "Failed to save coupon.");
      }

      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Save coupon error:", err);

      setShowConfirmModal(false);

      setSubmitError(
        err.message || "Something went wrong while saving the coupon.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onSaved();
  };

  const handleReset = () => {
    setForm({
      ...emptyForm,
      ...initialData,
    });

    setSelectedVendorIds(new Set(initialData?.vendorIds || []));

    setSelectedProductIds(new Set(initialData?.productIds || []));

    setVendorSearch("");
    setProductSearch("");
    setErrors({});
    setSubmitError(null);
  };

  // const visibleSelectedProductCount = filteredProducts.filter((product) =>
  //   selectedProductIds.has(product.id),
  // ).length;

  return (
    <div className="coupon-page">
      <div className="coupon-page-header">
        <div className="coupon-page-header__title">
          <span className="coupon-page-header__icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </span>

          <div>
            <h1>
              {isEditMode
                ? "Edit Restaurant Coupon"
                : "Add New Restaurant Coupon"}
            </h1>

            <p>Fill in the details to create a new coupon</p>
          </div>
        </div>

        <button type="button" className="btn btn-back" onClick={handleBack}>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              d="M15 18l-6-6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back To List
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Section
          icon={
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
            </svg>
          }
          iconVariant="blue"
          title="Basic Information"
          subtitle="Coupon title, code and expiry details"
        >
          <div className="form-grid form-grid--2">
            <FormField label="Coupon Title" required error={errors.title}>
              <input
                type="text"
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                placeholder="e.g. Weekend Special Offer"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </FormField>

            <FormField label="Coupon Code" required error={errors.code}>
              <input
                type="text"
                className={`form-control form-control--code ${
                  errors.code ? "is-invalid" : ""
                }`}
                placeholder="e.g. SAVE20"
                value={form.code}
                onChange={(e) =>
                  updateField("code", e.target.value.toUpperCase())
                }
              />
            </FormField>
          </div>

          <FormField label="Description" hint="(optional)">
            <textarea
              className="form-control"
              rows={4}
              placeholder="Brief description about this coupon..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </FormField>
        </Section>

        <Section
          icon={
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.25L4 3a1 1 0 0 0-1 1l.25 5.59a2 2 0 0 0 .58 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.82Z" />
              <circle
                cx="7.5"
                cy="7.5"
                r="1.2"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          }
          iconVariant="green"
          title="Discount Settings"
          subtitle="Set discount type, amount and order conditions"
        >
          <div className="discount-panel">
            <div className="form-grid form-grid--3">
              <FormField
                label="Discount Amount"
                required
                error={errors.discountAmount}
              >
                <div
                  className={`input-combo ${
                    errors.discountAmount ? "is-invalid" : ""
                  }`}
                >
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.discountAmount}
                    onChange={(e) =>
                      updateField("discountAmount", e.target.value)
                    }
                  />

                  <select
                    className="input-combo__select"
                    value={form.discountType}
                    onChange={(e) =>
                      updateField("discountType", e.target.value)
                    }
                    aria-label="Discount type"
                  >
                    {DISCOUNT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </FormField>

              <FormField label="Usage Limit" required error={errors.usageLimit}>
                <input
                  type="number"
                  min="0"
                  className={`form-control ${
                    errors.usageLimit ? "is-invalid" : ""
                  }`}
                  placeholder="Enter Limit"
                  value={form.usageLimit}
                  onChange={(e) => updateField("usageLimit", e.target.value)}
                />
              </FormField>

              <FormField label="Expiry Date" required error={errors.expiryDate}>
                <input
                  type="date"
                  className={`form-control ${
                    errors.expiryDate ? "is-invalid" : ""
                  }`}
                  value={form.expiryDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => updateField("expiryDate", e.target.value)}
                />
              </FormField>
            </div>
          </div>
        </Section>

        <Section
          icon={
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="8" r="4" />
              <path
                d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"
                strokeLinecap="round"
              />
            </svg>
          }
          iconVariant="purple"
          title="User Eligibility"
          subtitle="Who can use this coupon?"
        >
          <div className="choice-grid">
            <ChoiceCard
              selected={form.eligibility === "all"}
              onClick={() => updateField("eligibility", "all")}
              title="All Users"
              description="Any registered user can apply"
            />

            <ChoiceCard
              selected={form.eligibility === "new"}
              onClick={() => updateField("eligibility", "new")}
              title="New Users Only"
              description="Only for first-time customers"
            />
          </div>
        </Section>

        <Section
          icon={
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="5" r="2" />
              <circle cx="5" cy="19" r="2" />
              <circle cx="19" cy="19" r="2" />
              <path d="M12 7v5m0 0-6 5m6-5 6 5" />
            </svg>
          }
          iconVariant="orange"
          title="Category"
          subtitle={`Restricted to ${lockedCategory.name.toLowerCase()} category only`}
          headerRight={
            <span className="badge badge--soft">
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 1 1 8 0v4" />
              </svg>
              ID: {lockedCategory.id} ({lockedCategory.name.replace(/s$/, "")})
            </span>
          }
        >
          <div className="locked-chip">
            <span className="locked-chip__checkbox" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path
                  d="M20 6 9 17l-5-5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <span className="locked-chip__label">{lockedCategory.name}</span>

            <span className="locked-chip__id">#{lockedCategory.id}</span>
          </div>

          <p className="hint-text">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
            </svg>
            Category is pre-selected and locked to{" "}
            {lockedCategory.name.toLowerCase()} segment.
          </p>
        </Section>

        <Section
          icon={
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M2 9h20l-2-5H4l-2 5Z"
                strokeLinejoin="round"
              />
              <path d="M9 20v-6h6v6" />
            </svg>
          }
          iconVariant="teal"
          title="Vendors"
          titleSuffix="(optional)"
          subtitle="Leave blank to apply for all vendors"
          headerRight={
            <span className="badge badge--soft">
              {selectedVendorIds.size > 0
                ? `${selectedVendorIds.size} selected`
                : `${vendors.length} vendor(s)`}
            </span>
          }
        >
          {listsError && <ErrorBanner message={listsError} />}

          <div className="list-toolbar">
            <label className="checkbox-row checkbox-row--strong">
              <input
                type="checkbox"
                checked={allVendorsSelected}
                onChange={toggleSelectAllVendors}
                disabled={loadingLists || vendors.length === 0}
              />
              <span>Select All Vendors</span>
            </label>

            <div className="search-box">
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3-3" strokeLinecap="round" />
              </svg>

              <input
                type="text"
                placeholder="Search vendors..."
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="checkbox-grid">
            {loadingLists ? (
              <SkeletonGrid count={9} />
            ) : filteredVendors.length === 0 ? (
              <EmptyState label="No vendors match your search." />
            ) : (
              filteredVendors.map((vendor) => (
                <label
                  key={vendor.id}
                  className={`checkbox-tile ${
                    selectedVendorIds.has(vendor.id) ? "is-checked" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedVendorIds.has(vendor.id)}
                    onChange={() => toggleVendor(vendor.id)}
                  />

                  <span>{vendor.name}</span>
                </label>
              ))
            )}
          </div>
        </Section>

        <Section
          icon={
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path
                d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          iconVariant="red"
          title="Products / Items"
          titleSuffix="(optional)"
          subtitle="Leave blank to apply for all products"
          headerRight={
            <span className="badge badge--soft">
              {visibleSelectedProductCount > 0
                ? `${visibleSelectedProductCount} selected`
                : `${filteredProducts.length} item(s)`}
            </span>
          }
        >
          <div className="list-toolbar">
            <label className="checkbox-row checkbox-row--strong">
              <input
                type="checkbox"
                checked={allProductsSelected}
                onChange={toggleSelectAllProducts}
                disabled={loadingLists || filteredProducts.length === 0}
              />
              <span>Select All Products</span>
            </label>

            <div className="search-box">
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3-3" strokeLinecap="round" />
              </svg>

              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="checkbox-grid checkbox-grid--scroll">
            {loadingLists ? (
              <SkeletonGrid count={16} />
            ) : filteredProducts.length === 0 ? (
              <EmptyState label="No products match your search." />
            ) : (
              filteredProducts.map((product) => (
                <label
                  key={product.id}
                  className={`checkbox-tile ${
                    selectedProductIds.has(product.id) ? "is-checked" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedProductIds.has(product.id)}
                    onChange={() => toggleProduct(product.id)}
                  />

                  <span>{product.name}</span>
                </label>
              ))
            )}
          </div>

          <div className="form-footer">
            {submitError && <ErrorBanner message={submitError} />}

            <div className="form-footer__actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleReset}
                disabled={submitting}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" />
                  <path
                    d="M3 4v5h5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Reset
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <path
                        d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"
                        strokeLinejoin="round"
                      />
                      <path d="M17 21v-8H7v8M7 3v5h8" strokeLinejoin="round" />
                    </svg>
                    Save Coupon
                  </>
                )}
              </button>
            </div>
          </div>
        </Section>
      </form>
      <ConfirmModal
        show={showConfirmModal}
        title={isEditMode ? "Update Coupon?" : "Create Coupon?"}
        message={
          isEditMode
            ? "Are you sure you want to update this coupon?"
            : "Are you sure you want to create this coupon?"
        }
        confirmText={isEditMode ? "Update" : "Create"}
        cancelText="Cancel"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmModal(false)}
        loading={submitting}
      />

      <SuccessModal
        show={showSuccessModal}
        title={isEditMode ? "Coupon Updated!" : "Coupon Created!"}
        message={
          isEditMode
            ? "The coupon has been updated successfully."
            : "The coupon has been created successfully."
        }
        buttonText="OK"
        onClose={handleSuccessClose}
      />
    </div>
  );
}

function Section({
  icon,
  iconVariant,
  title,
  titleSuffix,
  subtitle,
  headerRight,
  children,
}) {
  return (
    <section className="card-section">
      <div className="card-section__header">
        <span className={`icon-badge icon-badge--${iconVariant}`}>{icon}</span>

        <div className="card-section__titles">
          <h2>
            {title}{" "}
            {titleSuffix && (
              <span className="card-section__suffix">{titleSuffix}</span>
            )}
          </h2>

          <p>{subtitle}</p>
        </div>

        {headerRight && (
          <div className="card-section__header-right">{headerRight}</div>
        )}
      </div>

      <div className="card-section__divider" />

      <div className="card-section__body">{children}</div>
    </section>
  );
}

function FormField({ label, required, hint, error, children }) {
  return (
    <div className="form-field">
      <label className="form-field__label">
        {label}
        {required && <span className="form-field__required">*</span>}
        {hint && <span className="form-field__hint">{hint}</span>}
      </label>

      {children}

      {error && <div className="form-field__error">{error}</div>}
    </div>
  );
}

function ChoiceCard({ selected, onClick, title, description }) {
  return (
    <button
      type="button"
      className={`choice-card ${selected ? "is-selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="choice-card__radio" aria-hidden="true">
        <span className="choice-card__radio-dot" />
      </span>

      <span>
        <span className="choice-card__title">{title}</span>

        <span className="choice-card__description">{description}</span>
      </span>
    </button>
  );
}

function SkeletonGrid({ count }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="checkbox-tile checkbox-tile--skeleton" />
      ))}
    </>
  );
}

function EmptyState({ label }) {
  return <div className="empty-state">{label}</div>;
}

function ErrorBanner({ message }) {
  return (
    <div className="error-banner">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      >
        <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
        <path
          d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          strokeLinejoin="round"
        />
      </svg>

      {message}
    </div>
  );
}
