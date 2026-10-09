import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../../../config/api";
import "./addProduct.css";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";

/* ------------------------------------------------------------------ */
/* Icons                                                              */
/* ------------------------------------------------------------------ */

const ChevronLeft = (props) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const UtensilsCrossed = (props) => (
  <svg
    width={22}
    height={22}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
    <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3" />
    <path d="m2.1 21.8 6.4-6.3" />
    <path d="m19 15-6 6" />
  </svg>
);

const ClipboardList = (props) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="15" y2="16" />
    <line x1="9" y1="8" x2="11" y2="8" />
  </svg>
);

const Tags = (props) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L4 3a1 1 0 0 0-1 1l.24 5.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.34-4.34a2 2 0 0 0 .01-2.83Z" />
    <circle cx="7.5" cy="7.5" r="1.2" />
  </svg>
);

const ImagePlus = (props) => (
  <svg
    width={28}
    height={28}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
    <path d="M19 16v6" />
    <path d="M16 19h6" />
  </svg>
);

const Lock = (props) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UploadCloud = (props) => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 16l-4-4-4 4" />
    <path d="M12 12v9" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const X = (props) => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Loader2 = (props) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* API service                                                        */
/* ------------------------------------------------------------------ */

const restaurantItemService = {
  getAddRestaurantItemData: () => api.get("/restaurant/products/add"),

  createRestaurantItem: (formData) =>
    api.post("/restaurant/products", formData),
};

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const FIXED_CATEGORY = {
  id: 118,
  label: "Restaurants",
};

const ITEM_TYPES = [
  {
    id: "veg",
    name: "Veg",
  },
  {
    id: "non_veg",
    name: "Non Veg",
  },
];

const MAX_IMAGE_MB = 1;

const RECOMMENDED_RATIO = 2;
const RATIO_TOLERANCE = 0.05;

const ACCEPTED_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const INITIAL_FORM = {
  itemName: "",
  description: "",
  vendorId: "",
  subCategoryId: "",
  menuId: "",
  itemType: "",
  unitPrice: "",
  discountPrice: "",
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function AddProduct({ onCreated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [imageWarning, setImageWarning] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const [vendors, setVendors] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [menus, setMenus] = useState([]);

  const [loadingPageData, setLoadingPageData] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdItem, setCreatedItem] = useState(null);

  /* ---------------------------------------------------------------- */
  /* Load Add Restaurant Item Page Data                               */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    const loadPageData = async () => {
      setLoadingPageData(true);

      try {
        const res = await restaurantItemService.getAddRestaurantItemData();

        if (!mounted) return;

        const data = res?.data?.data ?? res?.data ?? {};

        setVendors(Array.isArray(data.vendors) ? data.vendors : []);

        setSubCategories(
          Array.isArray(data.sub_categories) ? data.sub_categories : [],
        );

        setMenus(Array.isArray(data.menus) ? data.menus : []);
      } catch (error) {
        if (!mounted) return;

        setVendors([]);
        setSubCategories([]);
        setMenus([]);
      } finally {
        if (mounted) {
          setLoadingPageData(false);
        }
      }
    };

    loadPageData();

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Form change                                                      */
  /* ---------------------------------------------------------------- */

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    /*
     * Clear existing field error while typing/changing.
     */
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, formData[field]),
    }));
  };

  /* ---------------------------------------------------------------- */
  /* Validation                                                       */
  /* ---------------------------------------------------------------- */

  const validateField = (field, value) => {
    switch (field) {
      case "itemName":
        return value.trim() ? "" : "Item name is required.";
      case "description":
        return value.trim() ? "" : "Description is required.";
      case "vendorId":
        return value ? "" : "Select a vendor.";
      case "subCategoryId":
        return value ? "" : "Select a sub-category.";
      case "menuId":
        return value ? "" : "Select a menu.";
      case "itemType":
        return value ? "" : "Select an item type.";
      case "unitPrice":
        return value !== "" && Number(value) > 0
          ? ""
          : "Enter a valid unit price.";

      case "discountPrice":
        return value === "" || Number(value) >= 0
          ? ""
          : "Enter a valid discount price.";

      default:
        return "";
    }
  };

  const validateAll = () => {
    const requiredFields = [
      "itemName",
      "description",
      "vendorId",
      "subCategoryId",
      "menuId",
      "itemType",
      "unitPrice",
    ];

    const nextErrors = {};

    requiredFields.forEach((field) => {
      const message = validateField(field, formData[field]);

      if (message) {
        nextErrors[field] = message;
      }
    });
    if (formData.discountPrice === "") {
      nextErrors.discountPrice = "Discount price is required.";
    }

    if (!imageFile) {
      nextErrors.image = "Item image is required.";
    }

    setErrors(nextErrors);
    setTouched({
      itemName: true,
      description: true,
      vendorId: true,
      subCategoryId: true,
      menuId: true,
      itemType: true,
      unitPrice: true,
      discountPrice: true,
      image: true,
    });

    return Object.keys(nextErrors).length === 0;
  };

  /* ---------------------------------------------------------------- */
  /* Image validation                                                 */
  /* ---------------------------------------------------------------- */

  const validateImage = (file) =>
    new Promise((resolve) => {
      if (!ACCEPTED_MIME.includes(file.type)) {
        resolve({
          error: "Only JPG, JPEG, PNG, WEBP or GIF files are allowed.",
        });
        return;
      }

      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        resolve({
          error: `Image must be smaller than ${MAX_IMAGE_MB}MB.`,
        });
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const ratio = img.width / img.height;
        URL.revokeObjectURL(objectUrl);
        const offRatio = Math.abs(ratio - RECOMMENDED_RATIO) > RATIO_TOLERANCE;
        resolve({
          error: "",
          warning: offRatio
            ? "For best results, use an image with a 2:1 aspect ratio."
            : "",
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);

        resolve({
          error: "",
        });
      };

      img.src = objectUrl;
    });

  const applyImageFile = useCallback(async (file) => {
    if (!file) return;
    const { error, warning } = await validateImage(file);

    if (error) {
      setImageError(error);
      setImageWarning("");
      return;
    }

    setImageError("");
    setImageWarning(warning || "");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    applyImageFile(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    applyImageFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
    setImageWarning("");
    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  };

  /* ---------------------------------------------------------------- */
  /* Build PHP-compatible FormData                                    */
  /* ---------------------------------------------------------------- */

  const buildPayload = () => {
    const payload = new FormData();
    payload.append("vendor_id", formData.vendorId);
    payload.append("name", formData.itemName.trim());
    payload.append("description", formData.description.trim());
    payload.append("item_type", formData.itemType);
    payload.append("unit_price", formData.unitPrice);
    payload.append("discount_price", formData.discountPrice);
    payload.append("sub_cat_id", formData.subCategoryId);
    payload.append("menu_id", formData.menuId);

    /*
     * PHP expects:
     *
     * $_FILES['item_image']
     */

    payload.append("item_image", imageFile);

    return payload;
  };

  /* ---------------------------------------------------------------- */
  /* Submit                                                           */
  /* ---------------------------------------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res =
        await restaurantItemService.createRestaurantItem(buildPayload());

      if (res?.data?.result) {
        const item = res.data.data;

        setCreatedItem(item);
        setSubmitSuccess(true);
        onCreated?.(item);
      } else {
        setSubmitError(res?.data?.msg || "Unable to save restaurant item.");
      }
    } catch (err) {
      setSubmitError(
        err?.response?.data?.msg ||
          "Something went wrong while saving this item. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Reset                                                           */
  /* ---------------------------------------------------------------- */

  const handleReset = () => {
    if (isSubmitting) return;

    setFormData(INITIAL_FORM);
    setErrors({});
    setTouched({});
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
    setImageWarning("");
    setSubmitError("");
    setSubmitSuccess(false);
    setCreatedItem(null);
    setSubCategories([]);
    setMenus([]);
  };

  const fieldError = (field) =>
    touched[field] && errors[field] ? errors[field] : "";

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="arp-page">
      {/* ------------------------------------------------------------ */}
      {/* Header                                                       */}
      {/* ------------------------------------------------------------ */}

      <header className="arp-header">
        <h1 className="arp-title">
          <UtensilsCrossed size={22} strokeWidth={2} />
          Add New Restaurant Item
        </h1>

        <button
          type="button"
          className="arp-back-btn"
          onClick={() => navigate("/restaurant/product_list")}
          disabled={isSubmitting}
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          Back To List
        </button>
      </header>

      {/* ------------------------------------------------------------ */}
      {/* Messages                                                     */}
      {/* ------------------------------------------------------------ */}

      {submitSuccess && (
        <div className="arp-banner arp-banner--success" role="status">
          Item saved successfully.
        </div>
      )}

      {submitError && (
        <div className="arp-banner arp-banner--error" role="alert">
          {submitError}
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* Main form                                                    */}
      {/* ------------------------------------------------------------ */}

      {!createdItem && (
        <form className="arp-form" onSubmit={handleSubmit} noValidate>
          {/* ======================================================== */}
          {/* General Information                                     */}
          {/* ======================================================== */}

          <section className="arp-card">
            <div className="arp-card-header">
              <div className="arp-card-heading">
                <ClipboardList size={18} strokeWidth={2.25} />

                <h2>General Information</h2>
              </div>

              <p className="arp-card-subtext">
                Insert the basic information of the item
              </p>
            </div>

            <div className="arp-card-body arp-general-grid">
              <div className="arp-fields-col">
                {/* Item Name */}

                <div className="arp-field">
                  <label htmlFor="itemName">
                    Item Name <span className="arp-required">*</span>
                  </label>

                  <input
                    id="itemName"
                    type="text"
                    placeholder="Enter item name"
                    value={formData.itemName}
                    onChange={handleChange("itemName")}
                    onBlur={handleBlur("itemName")}
                    className={
                      fieldError("itemName")
                        ? "arp-input arp-input--error"
                        : "arp-input"
                    }
                  />

                  {fieldError("itemName") && (
                    <span className="arp-error-text">
                      {fieldError("itemName")}
                    </span>
                  )}
                </div>

                {/* Description */}

                <div className="arp-field">
                  <label htmlFor="description">
                    Description <span className="arp-required">*</span>
                  </label>

                  <textarea
                    id="description"
                    rows={5}
                    placeholder="Enter item description"
                    value={formData.description}
                    onChange={handleChange("description")}
                    onBlur={handleBlur("description")}
                    className={
                      fieldError("description")
                        ? "arp-input arp-input--error"
                        : "arp-input"
                    }
                  />

                  {fieldError("description") && (
                    <span className="arp-error-text">
                      {fieldError("description")}
                    </span>
                  )}
                </div>
              </div>

              {/* Image */}

              <div className="arp-field arp-image-field">
                <label>
                  Item Image <span className="arp-required">*</span>
                </label>

                <p className="arp-image-hint">
                  JPG, JPEG, PNG, WEBP or GIF less than 1MB (2:1 ratio
                  recommended)
                </p>

                {imagePreview ? (
                  <div className="arp-image-preview">
                    <img src={imagePreview} alt="Item preview" />

                    <button
                      type="button"
                      className="arp-image-remove"
                      onClick={handleRemoveImage}
                      aria-label="Remove image"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={
                      isDragging
                        ? "arp-dropzone arp-dropzone--active"
                        : "arp-dropzone"
                    }
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <ImagePlus
                      size={28}
                      strokeWidth={1.5}
                      className="arp-dropzone-icon"
                    />

                    <span className="arp-dropzone-link">
                      <UploadCloud size={14} strokeWidth={2} />
                      Click to upload
                    </span>

                    <span className="arp-dropzone-text">Or drag and drop</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={handleFileInputChange}
                  hidden
                />

                {(imageError || fieldError("image")) && (
                  <span className="arp-error-text">
                    {imageError || fieldError("image")}
                  </span>
                )}

                {!imageError && imageWarning && (
                  <span className="arp-warning-text">{imageWarning}</span>
                )}
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* Category & Pricing                                      */}
          {/* ======================================================== */}

          <section className="arp-card">
            <div className="arp-card-header">
              <div className="arp-card-heading">
                <Tags size={18} strokeWidth={2.25} />

                <h2>Category &amp; Pricing</h2>
              </div>

              <p className="arp-card-subtext">
                Select category, sub-category and set pricing
              </p>
            </div>

            <div className="arp-card-body arp-fields-grid">
              {/* Vendor */}

              <div className="arp-field">
                <label htmlFor="vendorId">
                  Vendor <span className="arp-required">*</span>
                </label>

                <select
                  id="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange("vendorId")}
                  onBlur={handleBlur("vendorId")}
                  className={
                    fieldError("vendorId")
                      ? "arp-input arp-input--error"
                      : "arp-input"
                  }
                  disabled={loadingPageData}
                >
                  <option value="">
                    {loadingPageData ? "Loading vendors..." : "Select vendor"}
                  </option>

                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.business_name || vendor.name}
                    </option>
                  ))}
                </select>

                {fieldError("vendorId") && (
                  <span className="arp-error-text">
                    {fieldError("vendorId")}
                  </span>
                )}
              </div>

              {/* Category */}

              <div className="arp-field">
                <label htmlFor="category">Category</label>
                <div
                  className="arp-locked-select"
                  id="category"
                  data-category-id={FIXED_CATEGORY.id}
                >
                  {FIXED_CATEGORY.label}
                </div>
                <span className="arp-lock-hint">
                  <Lock size={12} strokeWidth={2.5} />
                  Fixed category
                </span>
              </div>

              {/* Sub Category */}

              <div className="arp-field">
                <label htmlFor="subCategoryId">
                  Sub-Category <span className="arp-required">*</span>
                </label>
                <select
                  id="subCategoryId"
                  value={formData.subCategoryId}
                  onChange={handleChange("subCategoryId")}
                  onBlur={handleBlur("subCategoryId")}
                  className={
                    fieldError("subCategoryId")
                      ? "arp-input arp-input--error"
                      : "arp-input"
                  }
                  disabled={loadingPageData}
                >
                  <option value="">
                    {loadingPageData ? "Loading..." : "Select sub-category"}
                  </option>
                  {subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                {fieldError("subCategoryId") && (
                  <span className="arp-error-text">
                    {fieldError("subCategoryId")}
                  </span>
                )}
              </div>

              {/* Menu */}

              <div className="arp-field">
                <label htmlFor="menuId">
                  Menu Name <span className="arp-required">*</span>
                </label>
                <select
                  id="menuId"
                  value={formData.menuId}
                  onChange={handleChange("menuId")}
                  onBlur={handleBlur("menuId")}
                  className={
                    fieldError("menuId")
                      ? "arp-input arp-input--error"
                      : "arp-input"
                  }
                  disabled={loadingPageData}
                >
                  <option value="">
                    {loadingPageData ? "Loading..." : "Select Menu"}
                  </option>
                  {menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
                {fieldError("menuId") && (
                  <span className="arp-error-text">{fieldError("menuId")}</span>
                )}
              </div>

              {/* Item Type */}

              <div className="arp-field">
                <label htmlFor="itemType">
                  Item Type <span className="arp-required">*</span>
                </label>
                <select
                  id="itemType"
                  value={formData.itemType}
                  onChange={handleChange("itemType")}
                  onBlur={handleBlur("itemType")}
                  className={
                    fieldError("itemType")
                      ? "arp-input arp-input--error"
                      : "arp-input"
                  }
                >
                  <option value="">Select type</option>
                  {ITEM_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {fieldError("itemType") && (
                  <span className="arp-error-text">
                    {fieldError("itemType")}
                  </span>
                )}
              </div>

              {/* Unit Price */}

              <div className="arp-field">
                <label htmlFor="unitPrice">
                  Unit Price <span className="arp-required">*</span>
                </label>
                <div
                  className={
                    fieldError("unitPrice")
                      ? "arp-prefix-input arp-prefix-input--error"
                      : "arp-prefix-input"
                  }
                >
                  <span className="arp-prefix">$</span>
                  <input
                    id="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.unitPrice}
                    onChange={handleChange("unitPrice")}
                    onBlur={handleBlur("unitPrice")}
                  />
                </div>
                {fieldError("unitPrice") && (
                  <span className="arp-error-text">
                    {fieldError("unitPrice")}
                  </span>
                )}
              </div>

              {/* Discount Price */}

              <div className="arp-field">
                <label htmlFor="discountPrice">
                  Discount Price <span className="arp-required">*</span>
                </label>
                <div
                  className={
                    fieldError("discountPrice")
                      ? "arp-prefix-input arp-prefix-input--error"
                      : "arp-prefix-input"
                  }
                >
                  <span className="arp-prefix">$</span>
                  <input
                    id="discountPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.discountPrice}
                    onChange={handleChange("discountPrice")}
                    onBlur={handleBlur("discountPrice")}
                  />
                </div>

                {fieldError("discountPrice") && (
                  <span className="arp-error-text">
                    {fieldError("discountPrice")}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* Actions                                                   */}
          {/* ======================================================== */}

          <div className="arp-actions">
            <button
              type="button"
              className="arp-btn arp-btn--ghost"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              className="arp-btn arp-btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 size={16} className="arp-spin" />}
              {isSubmitting ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------ */}
      {/* Item successfully created                                    */}
      {/* ------------------------------------------------------------ */}

      {createdItem && (
        <section className="arp-card">
          <div className="arp-card-header">
            <div className="arp-card-heading">
              <ClipboardList size={18} strokeWidth={2.25} />
              <span style={{ fontSize: "14px", fontWeight: 600 }}>
                Item Details
              </span>
            </div>

            <p
              className="arp-card-subtext"
              style={{
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Item ID: {createdItem.id}
            </p>
          </div>

          <div className="arp-card-body">
            <div
              style={{
                padding: "18px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                background: "#fafafa",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  marginBottom: "5px",
                }}
              >
                Item Name
              </div>

              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1f2937",
                }}
              >
                {createdItem.name}
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  color: "#065d2d",
                  fontWeight: 500,
                }}
              >
                Item created successfully.
              </div>
            </div>
          </div>
        </section>
      )}
      <SuccessModal
        show={submitSuccess}
        title="Success"
        message="Restaurant item added successfully."
        buttonText="OK"
        onClose={() => {
          setSubmitSuccess(false);
        }}
      />
    </div>
  );
}
