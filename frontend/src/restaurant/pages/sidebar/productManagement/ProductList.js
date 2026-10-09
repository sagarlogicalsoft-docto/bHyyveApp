import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaEye,
  FaTrash,
  FaCheck,
  FaTimes,
  FaBoxOpen,
  FaImage,
} from "react-icons/fa";

import DataTable from "../../../../Components/common/DataTable";
import "./productList.css";
import { getImage } from "../../../../Components/utils/images";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";
import Breadcrumbs from "../../common/BreadCrumbs";
import api from "../../../../config/api";

// =========================================================
// ROUTES
// =========================================================

const ROUTES = {
  add: "/restaurant/add_product",
  edit: (id) => `/restaurant/product/edit_restaurant_product/${id}`,
  view: (id) => `/restaurant/product/view_restaurant_product/${id}`,
};

// =========================================================
// PRODUCT SERVICE
// =========================================================

const productService = {
  async fetchProducts() {
    const response = await api.get("/restaurant/products");
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/restaurant/products/${id}/status`, {
      status: Number(status),
    });

    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/restaurant/products/${id}`);
    return response.data;
  },

  async deleteProducts(ids) {
    const response = await api.delete("/restaurant/products/bulk", {
      data: {
        ids,
      },
    });

    return response.data;
  },
};

// =========================================================
// PRODUCT LIST
// =========================================================

const ProductList = () => {
  const navigate = useNavigate();

  // =========================================================
  // PRODUCT DATA
  // =========================================================

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // =========================================================
  // MODAL STATE
  // =========================================================

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: null,
    productId: null,
    productName: "",
  });

  const [successModal, setSuccessModal] = useState({
    show: false,
    title: "Success!",
    message: "",
  });

  const [modalLoading, setModalLoading] = useState(false);

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await productService.fetchProducts();

      if (response?.success) {
        setProducts(response.data || []);
      } else {
        setProducts([]);
        console.error(
          "Failed to fetch products:",
          response?.message || "Unknown error",
        );
      }
    } catch (error) {
      console.error("Fetch products error:", error?.response?.data || error);

      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // =========================================================
  // SELECTED ROWS
  // =========================================================

  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product) => product.id));
    }
  };

  // =========================================================
  // STATUS TOGGLE
  // =========================================================

  const handleStatusChange = async (id, nextStatus) => {
    const previousProducts = products;

    // Optimistic update
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              status: Number(nextStatus),
            }
          : product,
      ),
    );

    try {
      const response = await productService.updateStatus(id, nextStatus);

      if (!response?.success) {
        throw new Error(response?.message || "Status update failed");
      }

      setSuccessModal({
        show: true,
        title: "Status Updated",
        message:
          Number(nextStatus) === 1
            ? "Product activated successfully."
            : "Product deactivated successfully.",
      });
    } catch (error) {
      console.error(
        "Update product status error:",
        error?.response?.data || error,
      );

      // Restore previous state
      setProducts(previousProducts);

      setSuccessModal({
        show: true,
        title: "Update Failed",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update product status.",
      });
    }
  };

  // =========================================================
  // OPEN SINGLE DELETE MODAL
  // =========================================================

  const openDeleteModal = (id) => {
    const product = products.find((item) => item.id === id);

    if (!product) return;

    setConfirmModal({
      show: true,
      type: "single",
      productId: id,
      productName: product.name || "this product",
    });
  };

  // =========================================================
  // OPEN BULK DELETE MODAL
  // =========================================================

  const openBulkDeleteModal = () => {
    if (selectedProducts.length === 0) return;

    setConfirmModal({
      show: true,
      type: "bulk",
      productId: null,
      productName: "",
    });
  };

  // =========================================================
  // CLOSE CONFIRM MODAL
  // =========================================================

  const closeConfirmModal = () => {
    if (modalLoading) return;

    setConfirmModal({
      show: false,
      type: null,
      productId: null,
      productName: "",
    });
  };

  // =========================================================
  // CONFIRM DELETE
  // =========================================================

  const handleConfirmDelete = async () => {
    if (!confirmModal.type) return;

    setModalLoading(true);

    try {
      // -------------------------------------------------------
      // SINGLE DELETE
      // -------------------------------------------------------

      if (confirmModal.type === "single") {
        const id = confirmModal.productId;

        const response = await productService.deleteProduct(id);

        if (!response?.success) {
          throw new Error(response?.message || "Failed to delete product");
        }

        setProducts((prev) => prev.filter((product) => product.id !== id));

        setSelectedProducts((prev) => prev.filter((pid) => pid !== id));

        closeConfirmModal();

        setSuccessModal({
          show: true,
          title: "Product Deleted",
          message: "Product deleted successfully.",
        });
      }

      // -------------------------------------------------------
      // BULK DELETE
      // -------------------------------------------------------

      if (confirmModal.type === "bulk") {
        const idsToDelete = [...selectedProducts];

        const response = await productService.deleteProducts(idsToDelete);

        if (!response?.success) {
          throw new Error(response?.message || "Failed to delete products");
        }

        setProducts((prev) =>
          prev.filter((product) => !idsToDelete.includes(product.id)),
        );

        setSelectedProducts([]);

        closeConfirmModal();

        setSuccessModal({
          show: true,
          title: "Products Deleted",
          message: `${idsToDelete.length} product${
            idsToDelete.length > 1 ? "s" : ""
          } deleted successfully.`,
        });
      }
    } catch (error) {
      console.error("Delete product error:", error?.response?.data || error);

      closeConfirmModal();

      setSuccessModal({
        show: true,
        title: "Delete Failed",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete product. Please try again.",
      });
    } finally {
      setModalLoading(false);
    }
  };

  // =========================================================
  // CLOSE SUCCESS MODAL
  // =========================================================

  const closeSuccessModal = () => {
    setSuccessModal((prev) => ({
      ...prev,
      show: false,
    }));
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: (
          <input
            type="checkbox"
            className="product-checkbox"
            checked={
              products.length > 0 && selectedProducts.length === products.length
            }
            onChange={handleSelectAll}
            aria-label="Select all products"
          />
        ),
        width: 44,
        sortable: false,
        render: (_, row) => (
          <input
            type="checkbox"
            className="product-checkbox"
            checked={selectedProducts.includes(row.id)}
            onChange={() => handleSelectProduct(row.id)}
            aria-label={`Select ${row.name}`}
          />
        ),
      },

      {
        key: "serial",
        label: "Sr.No",
        width: 70,
        sortable: false,
        render: (value) => <span className="product-serial">{value}</span>,
      },

      {
        key: "itemInfo",
        label: "Item Info",
        width: 280,
        sortable: false,
        render: (_, row) => (
          <div className="product-item-info">
            <span className="product-item-name">{row.name || "-"}</span>

            <span className="product-item-desc">{row.description || "-"}</span>
          </div>
        ),
      },

      {
        key: "image",
        label: "Image",
        width: 76,
        sortable: false,
        render: (_, row) => {
          const imageUrl = getImage(row.item_image);

          return imageUrl ? (
            <img
              className="product-thumb"
              src={imageUrl}
              alt={row.name || "Product"}
            />
          ) : (
            <div className="product-thumb product-thumb-placeholder">
              <FaImage />
            </div>
          );
        },
      },

      {
        key: "category",
        label: "Category",
        sortable: true,
        render: (_, row) => (
          <span className="product-badge product-badge-category">
            {row.category_name || "-"}
          </span>
        ),
      },

      {
        key: "subCategory",
        label: "Sub-Category",
        sortable: true,
        render: (_, row) => (
          <span className="product-badge product-badge-category">
            {row.sub_cat_name || "-"}
          </span>
        ),
      },

      {
        key: "businessName",
        label: "Business Name",
        sortable: true,
        render: (_, row) => (
          <span className="product-business">{row.business_name || "-"}</span>
        ),
      },

      {
        key: "type",
        label: "Type",
        sortable: true,
        render: (_, row) => (
          <span
            className={`product-badge product-badge-type ${
              String(row.item_type).trim().toLowerCase() === "veg"
                ? "veg"
                : "non-veg"
            }`}
          >
            {row.item_type || "-"}
          </span>
        ),
      },

      {
        key: "unitPrice",
        label: "Unit Price",
        sortable: true,
        render: (_, row) => (
          <span className="product-price">
            ${Number(row.unit_price || 0).toFixed(2)}
          </span>
        ),
      },

      {
        key: "discount",
        label: "Discount",
        sortable: true,
        render: (_, row) => {
          const discount = Number(row.discount_price || 0);

          return discount > 0 ? (
            <span className="product-badge product-badge-discount">
              ${discount.toFixed(2)} OFF
            </span>
          ) : (
            <span className="product-badge product-badge-muted">
              No Discount
            </span>
          );
        },
      },

      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (_, row) => {
          const isActive = Number(row.status) === 1;

          return (
            <button
              type="button"
              className={`product-status-toggle ${
                isActive ? "active" : "inactive"
              }`}
              onClick={() => handleStatusChange(row.id, isActive ? 0 : 1)}
              title={isActive ? "Click to deactivate" : "Click to activate"}
              aria-pressed={isActive}
            >
              <span className="product-status-knob">
                {isActive ? <FaCheck /> : <FaTimes />}
              </span>
            </button>
          );
        },
      },

      {
        key: "actions",
        label: "Action",
        sortable: false,
        render: (_, row) => (
          <div className="product-action-buttons">
            <button
              type="button"
              className="product-action-btn product-edit-btn"
              title="Edit product"
              onClick={() => navigate(ROUTES.edit(row.id))}
            >
              <FaEdit />
            </button>

            <button
              type="button"
              className="product-action-btn product-view-btn"
              title="View product"
              onClick={() => navigate(ROUTES.view(row.id))}
            >
              <FaEye />
            </button>

            <button
              type="button"
              className="product-action-btn product-delete-btn"
              title="Delete product"
              onClick={() => openDeleteModal(row.id)}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    [products, selectedProducts, navigate],
  );

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={[
            {
              label: "Product Management",
            },
            {
              label: "Product List",
            },
          ]}
        />
      </div>
      <div className="product-list-page">
        {/* PAGE HEADER */}

        <div className="product-page-header">
          <div className="product-page-title-wrapper">
            <div className="product-title-icon">
              <FaBoxOpen />
            </div>

            <div>
              <h1 className="product-page-title">Products</h1>

              <p className="product-page-subtitle">
                Manage the items your restaurants sell, their pricing and
                availability.
              </p>
            </div>
          </div>
        </div>

        {/* MAIN CARD */}

        <div className="product-main-card">
          <div className="product-card-header">
            <div className="product-card-title-wrapper">
              <h2 className="product-card-title">Total Items</h2>

              <span className="product-count-badge">{products.length}</span>
            </div>

            <button
              type="button"
              className="product-add-btn"
              onClick={() => navigate(ROUTES.add)}
            >
              <FaPlus />
              <span>Add Product</span>
            </button>
          </div>

          {isLoading ? (
            <div className="product-empty-state">
              <div className="product-empty-icon">
                <FaBoxOpen />
              </div>

              <h3>Loading products…</h3>
            </div>
          ) : products.length === 0 ? (
            <div className="product-empty-state">
              <div className="product-empty-icon">
                <FaBoxOpen />
              </div>

              <h3>No products yet</h3>

              <p>Add your first product to start building your catalog.</p>

              <button
                type="button"
                className="product-add-btn"
                onClick={() => navigate(ROUTES.add)}
              >
                <FaPlus />
                <span>Add Product</span>
              </button>
            </div>
          ) : (
            <div className="product-table-wrapper">
              <DataTable
                columns={columns}
                data={products}
                entriesPerPageOptions={[10, 25, 50, 100]}
                searchable={true}
                sortable={true}
                searchKeys={[
                  "name",
                  "description",
                  "category_name",
                  "sub_cat_name",
                  "business_name",
                  "item_type",
                ]}
              />
            </div>
          )}

          {/* BULK DELETE BAR */}

          {selectedProducts.length > 0 && (
            <div className="product-bottom-action-bar">
              <div className="product-selected-info">
                <span className="selected-dot"></span>

                <span>
                  {selectedProducts.length} item
                  {selectedProducts.length > 1 ? "s" : ""} selected
                </span>
              </div>

              <button
                type="button"
                className="product-bulk-delete-btn"
                onClick={openBulkDeleteModal}
              >
                <FaTrash />
                <span>Delete Selected</span>
              </button>
            </div>
          )}
        </div>

        {/* =====================================================
          CONFIRM MODAL
      ===================================================== */}

        <ConfirmModal
          show={confirmModal.show}
          title={
            confirmModal.type === "bulk"
              ? "Delete Selected Products"
              : "Delete Product"
          }
          message={
            confirmModal.type === "bulk"
              ? `Are you sure you want to delete ${
                  selectedProducts.length
                } selected product${
                  selectedProducts.length > 1 ? "s" : ""
                }? This action cannot be undone.`
              : `Are you sure you want to delete "${confirmModal.productName}"? This action cannot be undone.`
          }
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={closeConfirmModal}
          loading={modalLoading}
        />

        {/* =====================================================
          SUCCESS / RESULT MODAL
      ===================================================== */}

        <SuccessModal
          show={successModal.show}
          title={successModal.title}
          message={successModal.message}
          buttonText="OK"
          onClose={closeSuccessModal}
        />
      </div>
    </>
  );
};

export default ProductList;
