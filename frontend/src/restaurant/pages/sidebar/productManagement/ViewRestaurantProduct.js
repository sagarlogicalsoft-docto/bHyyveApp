import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./viewRestaurantProduct.css";
import api from "../../../../config/api";
import { getImage } from "../../../../Components/utils/images";

/* =========================================================================
 * API CALLS
 * Talks to the existing axios instance so this drops straight into the
 * project. Only the response-shaping helpers below need to change if the
 * backend's field names differ from what's assumed here.
 * ====================================================================== */

async function fetchRestaurantProduct(id) {
  const response = await api.get(`/restaurant/products/${id}`);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch product");
  }
  return response.data.data;
}

async function deleteRestaurantProduct(id) {
  const response = await api.delete(`/restaurant/products/${id}`);
  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to delete product");
  }
  return response.data;
}

function mapOptionGroup(group) {
  return {
    id: group.id,
    name: group.title,
    required: Number(group.is_required) === 1,
    options: (group.options || []).map((option) => ({
      id: option.id,
      name: option.name,
      price: Number(option.price || 0),
      image: option.image ? getImage(option.image) : null,
    })),
  };
}

function mapProduct(raw) {
  const unitPrice = Number(raw.unit_price || 0);
  const discountPrice =
    raw.discount_price !== null &&
    raw.discount_price !== undefined &&
    raw.discount_price !== ""
      ? Number(raw.discount_price)
      : null;

  const statusValue = raw.status;

  const isActive =
    statusValue === 1 ||
    statusValue === "1" ||
    String(statusValue).trim().toLowerCase() === "active";

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    menuName: raw.menu_name,
    image: raw.item_image ? getImage(raw.item_image) : null,
    pricing: { unitPrice, discountPrice },
    category: {
      category: raw.category_name,
      subCategory: raw.sub_cat_name,
      itemType: raw.item_type,
    },
    vendor: {
      name: raw.business_name || raw.vendor_name,
      status: isActive ? "Active" : "Inactive",
      addedDate: raw.created_at,
    },
    addons: (raw.addon_groups || []).map(mapOptionGroup),
    toppings: (raw.topping_groups || []).map(mapOptionGroup),
  };
}

/* =========================================================================
 * HELPERS
 * ====================================================================== */

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (Number.isNaN(amount)) return "—";
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================================
 * COMPONENT
 * ====================================================================== */

export default function ViewRestaurantProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError("");

    try {
      const raw = await fetchRestaurantProduct(id);
      setProduct(mapProduct(raw));
    } catch (err) {
      console.error("Fetch product error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch product details",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const goBack = () => navigate("/restaurant/product_list");
  const goEdit = () => navigate(`/restaurant/product/edit_restaurant_product/${id}`);

  if (isLoading) {
    return (
      <div className="vrp-page">
        <div className="vrp-state vrp-state--loading">
          <div className="vrp-spinner" aria-hidden="true" />
          <p>Loading item details…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="vrp-page">
        <div className="vrp-state vrp-state--error">
          <p className="vrp-state__title">Couldn't load this item</p>
          <p className="vrp-state__body">{error || "Product not found"}</p>
          <div className="vrp-header__actions">
            <button
              type="button"
              className="vrp-btn vrp-btn--ghost"
              onClick={goBack}
            >
              ← Back to list
            </button>
            <button
              type="button"
              className="vrp-btn vrp-btn--primary"
              onClick={loadProduct}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    name,
    description,
    menuName,
    image,
    pricing,
    category,
    vendor,
    addons,
    toppings,
  } = product;
  const hasDiscount = pricing.discountPrice !== null;

  return (
    <div className="vrp-page">
      <header className="vrp-header">
        <h1 className="vrp-header__title">Item Details</h1>
        <div className="vrp-header__actions">
          <button
            type="button"
            className="vrp-btn vrp-btn--ghost"
            onClick={goBack}
          >
            <span className="vrp-btn__icon" aria-hidden="true">
              ←
            </span>
            Back to list
          </button>
          <button
            type="button"
            className="vrp-btn vrp-btn--primary"
            onClick={goEdit}
          >
            <span className="vrp-btn__icon" aria-hidden="true">
              ✎
            </span>
            Edit item
          </button>
        </div>
      </header>

      <div className="vrp-layout">
        {/* ---------------- Left column ---------------- */}
        <div className="vrp-column vrp-column--side">
          <section className="vrp-card">
            <h2 className="vrp-card__title">Item Image</h2>
            <div className="vrp-image-frame">
              {image ? (
                <img src={image} alt={name || "Item"} className="vrp-image" />
              ) : (
                <div className="vrp-image-placeholder">No image uploaded</div>
              )}
            </div>
          </section>

          <section className="vrp-card">
            <h2 className="vrp-card__title">Pricing</h2>
            <div className="vrp-pricing">
              <div className="vrp-pricing__cell">
                <span className="vrp-pricing__label">Unit Price</span>
                <span className="vrp-pricing__value">
                  {formatCurrency(pricing.unitPrice)}
                </span>
              </div>
              <div className="vrp-pricing__cell">
                <span className="vrp-pricing__label">Discount Price</span>
                <span
                  className={
                    hasDiscount
                      ? "vrp-pricing__value vrp-pricing__value--discount"
                      : "vrp-pricing__value vrp-pricing__value--muted"
                  }
                >
                  {hasDiscount ? formatCurrency(pricing.discountPrice) : "None"}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ---------------- Right column ---------------- */}
        <div className="vrp-column vrp-column--main">
          <section className="vrp-card">
            <h2 className="vrp-card__title">General Information</h2>

            <div className="vrp-field">
              <span className="vrp-field__label">Item Name</span>
              <p className="vrp-field__value vrp-field__value--strong">
                {name || "—"}
              </p>
            </div>

            <div className="vrp-field">
              <span className="vrp-field__label">Description</span>
              <p className="vrp-field__value">{description || "—"}</p>
            </div>

            <div className="vrp-field">
              <span className="vrp-field__label">Menu Name</span>
              <p className="vrp-field__value">
                {menuName || <span className="vrp-field__empty">Not Set</span>}
              </p>
            </div>
          </section>

          <section className="vrp-card">
            <h2 className="vrp-card__title">Category Information</h2>
            <div className="vrp-meta-grid">
              <div className="vrp-field">
                <span className="vrp-field__label">Category</span>
                <div>
                  {category.category ? (
                    <span className="vrp-tag vrp-tag--outline">
                      {category.category}
                    </span>
                  ) : (
                    <span className="vrp-field__empty">—</span>
                  )}
                </div>
              </div>
              <div className="vrp-field">
                <span className="vrp-field__label">Sub-category</span>
                <div>
                  {category.subCategory ? (
                    <span className="vrp-tag vrp-tag--outline">
                      {category.subCategory}
                    </span>
                  ) : (
                    <span className="vrp-field__empty">—</span>
                  )}
                </div>
              </div>
              <div className="vrp-field">
                <span className="vrp-field__label">Item Type</span>
                <div>
                  {category.itemType ? (
                    <span
                      className={
                        category.itemType.toLowerCase() === "veg"
                          ? "vrp-tag vrp-tag--solid vrp-tag--veg"
                          : "vrp-tag vrp-tag--solid vrp-tag--nonveg"
                      }
                    >
                      {category.itemType}
                    </span>
                  ) : (
                    <span className="vrp-field__empty">—</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="vrp-card">
            <h2 className="vrp-card__title">Vendor & Status</h2>
            <div className="vrp-meta-grid">
              <div className="vrp-field">
                <span className="vrp-field__label">Vendor</span>
                <p className="vrp-field__value">{vendor.name || "—"}</p>
              </div>
              <div className="vrp-field">
                <span className="vrp-field__label">Status</span>
                <div>
                  <span
                    className={
                      vendor.status.toLowerCase() === "active"
                        ? "vrp-tag vrp-tag--outline vrp-tag--success"
                        : "vrp-tag vrp-tag--outline vrp-tag--neutral"
                    }
                  >
                    {vendor.status}
                  </span>
                </div>
              </div>
              <div className="vrp-field">
                <span className="vrp-field__label">Added Date</span>
                <p className="vrp-field__value">
                  {formatDate(vendor.addedDate)}
                </p>
              </div>
            </div>
          </section>

          {/* ---------------- Addons ---------------- */}
          <section className="vrp-card">
            <div className="vrp-card__header">
              <h2 className="vrp-card__title">Addons</h2>

              <span className="vrp-count-badge">
                {addons.length} Group{addons.length === 1 ? "" : "s"}
              </span>
            </div>

            {addons.length === 0 ? (
              <p className="vrp-empty-row">No addons added for this item.</p>
            ) : (
              <div className="vrp-group-list">
                {addons.map((group) => (
                  <div className="vrp-group" key={group.id}>
                    {/* Group Header */}
                    <div className="vrp-group__header">
                      <span className="vrp-group__name">{group.name}</span>

                      <span
                        className={
                          group.required
                            ? "vrp-tag vrp-tag--soft vrp-tag--required"
                            : "vrp-tag vrp-tag--soft vrp-tag--optional"
                        }
                      >
                        {group.required ? "Required" : "Optional"}
                      </span>
                    </div>

                    {/* Group Options */}
                    {group.options && group.options.length > 0 ? (
                      <table className="vrp-table">
                        <thead>
                          <tr>
                            <th className="vrp-table__num">#</th>
                            <th>Option Name</th>
                            <th className="vrp-table__price">Price</th>
                          </tr>
                        </thead>

                        <tbody>
                          {group.options.map((option, index) => (
                            <tr key={option.id}>
                              <td className="vrp-table__num">{index + 1}</td>

                              <td>{option.name}</td>

                              <td className="vrp-table__price">
                                <span className="vrp-price-pill">
                                  {formatCurrency(option.price)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="vrp-empty-row">No options in this group.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ---------------- Toppings ---------------- */}
          <section className="vrp-card">
            <div className="vrp-card__header">
              <h2 className="vrp-card__title">Toppings</h2>

              <span className="vrp-count-badge">
                {toppings.length} Group{toppings.length === 1 ? "" : "s"}
              </span>
            </div>

            {toppings.length === 0 ? (
              <p className="vrp-empty-row">No toppings added for this item.</p>
            ) : (
              <div className="vrp-group-list">
                {toppings.map((group) => (
                  <div className="vrp-group" key={group.id}>
                    {/* Group Header */}
                    <div className="vrp-group__header">
                      <span className="vrp-group__name">{group.name}</span>

                      <span
                        className={
                          group.required
                            ? "vrp-tag vrp-tag--soft vrp-tag--required"
                            : "vrp-tag vrp-tag--soft vrp-tag--optional"
                        }
                      >
                        {group.required ? "Required" : "Optional"}
                      </span>
                    </div>

                    {/* Topping Options */}
                    {group.options && group.options.length > 0 ? (
                      <div className="vrp-topping-grid">
                        {group.options.map((option) => (
                          <div className="vrp-topping-card" key={option.id}>
                            <div className="vrp-topping-card__image">
                              {option.image ? (
                                <img src={option.image} alt={option.name} />
                              ) : (
                                <div className="vrp-topping-card__placeholder">
                                  No Image
                                </div>
                              )}
                            </div>

                            <p className="vrp-topping-card__name">
                              {option.name}
                            </p>

                            <span className="vrp-price-pill">
                              {formatCurrency(option.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="vrp-empty-row">No options in this group.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
