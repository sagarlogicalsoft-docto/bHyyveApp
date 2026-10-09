import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { FaTags, FaEye, FaEdit, FaImage, FaTimes } from "react-icons/fa";

import DataTable from "../../../../Components/common/DataTable";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";
import { getImage } from "../../../../Components/utils/images";
import api from "../../../../config/api";
import "./categoryList.css";
import BreadCrumbs from "../../common/BreadCrumbs";

// =========================================================
// FIXED RESTAURANT CATEGORY (cannot be changed by the user)
// =========================================================

// eslint-disable-next-line no-unused-vars
const RESTAURANT_CATEGORY_ID = 118;

const EMPTY_FORM = {
  name: "",
  description: "",
  homeService: false,
  homeServiceDetail: "",
  onSiteService: false,
  onSiteServiceDetail: "",
  image: null,
};

const categoryService = {
  async fetchCategories() {
    const response = await api.get("/restaurant/categories");
    return response.data;
  },

  async updateCategory(id, form) {
    const formData = new FormData();

    formData.append("cat_id", id);
    formData.append("name", form.name);
    formData.append("sort_description", form.description);
    formData.append("showHomeService", form.homeService ? 1 : 0);
    formData.append("showOnSiteService", form.onSiteService ? 1 : 0);

    if (form.image) {
      formData.append("file", form.image);
    }

    const response = await api.patch(`/restaurant/categories/${id}`, formData);

    return response.data;
  },

  async updateCategoryStatus(id, status) {
    const response = await api.patch(`/restaurant/categories/${id}/status`, {
      status,
    });

    return response.data;
  },
};

// =========================================================
// CATEGORY LIST
// =========================================================

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [viewCategory, setViewCategory] = useState(null);

  // edit popup
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef(null);

  const [successModal, setSuccessModal] = useState({
    show: false,
    title: "Success!",
    message: "",
  });

  const [statusModal, setStatusModal] = useState({
    show: false,
    category: null,
    newStatus: null,
  });

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await categoryService.fetchCategories();

      if (response?.success) {
        setCategories(response.categories || []);
        setSelectedCategories([]);
      } else {
        setCategories([]);
        setErrorMessage(response?.message || "Failed to load categories.");
      }
    } catch (error) {
      console.error("Fetch categories error:", error?.response?.data || error);

      setCategories([]);
      setErrorMessage(
        error?.response?.data?.message || "Failed to load categories.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleStatusChange = (row) => {
    const newStatus = Number(row.status) === 1 ? 0 : 1;

    setStatusModal({
      show: true,
      category: row,
      newStatus,
    });
  };

  const closeStatusModal = () => {
    if (isUpdatingStatus) return;

    setStatusModal({
      show: false,
      category: null,
      newStatus: null,
    });
  };

  const confirmStatusChange = async () => {
    if (!statusModal.category) return;

    try {
      setIsUpdatingStatus(true);

      const response = await categoryService.updateCategoryStatus(
        statusModal.category.id,
        statusModal.newStatus,
      );

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to update category status",
        );
      }

      setStatusModal({
        show: false,
        category: null,
        newStatus: null,
      });

      setSuccessModal({
        show: true,
        title: "Status Updated",
        message: `Category ${
          statusModal.newStatus === 1 ? "activated" : "deactivated"
        } successfully.`,
      });

      await fetchCategories();
    } catch (error) {
      console.error(
        "Update category status error:",
        error?.response?.data || error,
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // =========================================================
  // SELECTED ROWS
  // =========================================================

  const handleSelectCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((category) => category.id));
    }
  };

  // =========================================================
  // EDIT POPUP
  // =========================================================

  // preview of a newly chosen file (revoked on change / unmount)
  const previewUrl = useMemo(
    () => (form.image ? URL.createObjectURL(form.image) : ""),
    [form.image],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const openEditModal = (row) => {
    setForm({
      name: row.category_name || row.name || "",
      description: row.sort_description || "",
      homeService: Number(row.showHomeService) === 1,
      homeServiceDetail: "",
      onSiteService: Number(row.showOnSiteService) === 1,
      onSiteServiceDetail: "",
      image: null,
    });

    setFormError("");
    setEditCategory(row);
  };

  const closeEditModal = useCallback(() => {
    if (isSaving) return;
    setEditCategory(null);
  }, [isSaving]);

  // focus the first field and close on Escape
  useEffect(() => {
    if (!editCategory) return undefined;

    nameInputRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeEditModal();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [editCategory, closeEditModal]);

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormError("");
  };

  const handleImageChange = (event) => {
    setForm((prev) => ({ ...prev, image: event.target.files?.[0] || null }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      homeServiceDetail: form.homeServiceDetail.trim(),
      onSiteServiceDetail: form.onSiteServiceDetail.trim(),
    };

    if (!payload.name) {
      setFormError("Please enter the category name.");
      nameInputRef.current?.focus();
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      const response = await categoryService.updateCategory(
        editCategory.id,
        payload,
      );

      if (!response?.success) {
        throw new Error(response?.message || "Failed to update category");
      }

      setEditCategory(null);

      setSuccessModal({
        show: true,
        title: "Category Updated",
        message: "Category updated successfully.",
      });

      fetchCategories();
    } catch (error) {
      console.error("Update category error:", error?.response?.data || error);

      setFormError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update category. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const closeSuccessModal = () => {
    setSuccessModal((prev) => ({ ...prev, show: false }));
  };

  // =========================================================
  // TABLE COLUMNS
  // (fixed widths for the small columns; Name takes a share and
  //  Description takes whatever is left, so nothing needs a slider)
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: (
          <input
            type="checkbox"
            className="category-checkbox"
            checked={
              categories.length > 0 &&
              selectedCategories.length === categories.length
            }
            onChange={handleSelectAll}
            aria-label="Select all categories"
          />
        ),
        width: 40,
        sortable: false,
        render: (_, row) => (
          <input
            type="checkbox"
            className="category-checkbox"
            checked={selectedCategories.includes(row.id)}
            onChange={() => handleSelectCategory(row.id)}
            aria-label={`Select ${row.name}`}
          />
        ),
      },

      {
        key: "serial",
        label: "Sr.No",
        width: 62,
        sortable: false,
        render: (value) => <span className="category-serial">{value}</span>,
      },

      {
        key: "image",
        label: "Image",
        width: 120,
        sortable: false,
        render: (_, row) => {
          const imageUrl = getImage(row.category_image);

          return imageUrl ? (
            <img
              className="category-thumb"
              src={imageUrl}
              alt={row.category_name || row.name || "Category"}
            />
          ) : (
            <div className="category-thumb category-thumb-placeholder">
              <FaImage />
            </div>
          );
        },
      },

      {
        key: "name",
        label: "Name",
        width: 120,
        sortable: true,
        render: (_, row) => (
          <span className="category-name">
            {row.category_name || row.name || "-"}
          </span>
        ),
      },

      {
        key: "description",
        label: "Description",
        // width: 150,
        sortable: false,
        render: (_, row) => (
          <span className="category-desc">
            {row.sort_description || row.description || "-"}
          </span>
        ),
      },

      {
        key: "status",
        label: "Status",
        width: 120, 
        sortable: true,
        render: (_, row) => {
          const isActive = Number(row.status) === 1;

          return (
            <span
              className={`category-status-badge ${
                isActive
                  ? "category-status-badge-active"
                  : "category-status-badge-inactive"
              }`}
              onClick={() => handleStatusChange(row)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleStatusChange(row);
                }
              }}
              role="button"
              tabIndex={0}
              title={isActive ? "Click to deactivate" : "Click to activate"}
            >
              <span className="category-status-dot"></span>
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },

      {
        key: "actions",
        label: "Action",
        width: 90,
        sortable: false,
        render: (_, row) => (
          <div className="category-action-buttons">
            <button
              type="button"
              className="category-action-btn category-edit-btn"
              title="Edit category"
              onClick={() => openEditModal(row)}
            >
              <FaEdit />
            </button>

            <button
              type="button"
              className="category-action-btn category-view-btn"
              title="View category"
              onClick={() => setViewCategory(row)}
            >
              <FaEye />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, selectedCategories],
  );

  // =========================================================
  // PAGE
  // =========================================================

  const shownImage =
    previewUrl || (editCategory ? getImage(editCategory.category_image) : "");

  return (
    <>
          <div className="breadcrumb-wrapper">
        <BreadCrumbs
          items={[
            {
              label: "Category",
            },
            {
              label: "Category List",
            },
          ]}
        />
      </div>
    <div className="category-list-page">
  
      {/* PAGE HEADER */}

      <div className="category-page-header">
        <div className="category-page-title-wrapper">
          <div className="category-title-icon">
            <FaTags />
          </div>

          <div>
            <h1 className="category-page-title">Category List</h1>

            <p className="category-page-subtitle">
              Browse the categories available under Restaurant.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CARD */}

      <div className="category-main-card">
        <div className="category-card-header">
          <div className="category-card-title-wrapper">
            <h2 className="category-card-title">Total Categories</h2>

            <span className="category-count-badge">{categories.length}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="category-empty-state">
            <div className="category-empty-icon">
              <FaTags />
            </div>

            <h3>Loading categories…</h3>
          </div>
        ) : errorMessage ? (
          <div className="category-empty-state">
            <div className="category-empty-icon">
              <FaTags />
            </div>

            <h3>Couldn’t load categories</h3>

            <p>{errorMessage}</p>

            <button
              type="button"
              className="category-retry-btn"
              onClick={fetchCategories}
            >
              Try again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="category-empty-state">
            <div className="category-empty-icon">
              <FaTags />
            </div>

            <h3>No categories found</h3>

            <p>There are no categories under Restaurant yet.</p>
          </div>
        ) : (
          <div className="category-table-wrapper">
            <DataTable
              columns={columns}
              data={categories}
              entriesPerPageOptions={[10, 25, 50, 100]}
              searchable={true}
              sortable={true}
              searchKeys={["category_name", "sort_description"]}
            />
          </div>
        )}

        {/* SELECTED BAR */}

        {selectedCategories.length > 0 && (
          <div className="category-bottom-action-bar">
            <div className="category-selected-info">
              <span className="selected-dot"></span>

              <span>
                {selectedCategories.length} categor
                {selectedCategories.length > 1 ? "ies" : "y"} selected
              </span>
            </div>

            <button
              type="button"
              className="category-clear-btn"
              onClick={() => setSelectedCategories([])}
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* =====================================================
          VIEW POPUP (read-only)
      ===================================================== */}

      {viewCategory && (
        <div
          className="category-overlay"
          role="presentation"
          onClick={() => setViewCategory(null)}
        >
          <div
            className="category-modal"
            role="dialog"
            aria-modal="true"
            aria-label={viewCategory.name}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="category-modal-head">
              <h3>
                {viewCategory.category_name || viewCategory.name || "Category"}
              </h3>

              <button
                type="button"
                className="category-modal-close"
                onClick={() => setViewCategory(null)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            {getImage(viewCategory.category_image) && (
              <img
                className="category-modal-img"
                src={getImage(viewCategory.category_image)}
                alt={
                  viewCategory.category_name || viewCategory.name || "Category"
                }
              />
            )}

            <p className="category-modal-desc">
              {viewCategory.sort_description ||
                viewCategory.description ||
                "No description added."}
            </p>

            <span
              className={`category-badge ${
                Number(viewCategory.status) === 1
                  ? "category-badge-active"
                  : "category-badge-inactive"
              }`}
            >
              {Number(viewCategory.status) === 1 ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT POPUP
      ===================================================== */}

      {editCategory && (
        <div
          className="category-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditModal();
          }}
        >
          <form
            className="category-modal category-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-edit-title"
            onSubmit={handleFormSubmit}
            noValidate
          >
            <div className="category-edit-head">
              <h3 id="category-edit-title">Update Category</h3>

              <button
                type="button"
                className="category-modal-close"
                onClick={closeEditModal}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="category-edit-body">
              <div className="category-form-grid">
                <div className="category-field">
                  <label htmlFor="category-name">Category Name</label>
                  <input
                    id="category-name"
                    ref={nameInputRef}
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Enter category name"
                    aria-invalid={Boolean(formError)}
                    autoComplete="off"
                  />
                </div>

                <div className="category-field">
                  <label htmlFor="category-home-detail">Home Service</label>
                  <div className="category-service-row">
                    <input
                      type="checkbox"
                      name="homeService"
                      className="category-checkbox"
                      checked={form.homeService}
                      onChange={handleFormChange}
                      aria-label="Home service available"
                    />
                    <input
                      id="category-home-detail"
                      type="text"
                      name="homeServiceDetail"
                      value={form.homeServiceDetail}
                      onChange={handleFormChange}
                      placeholder="Enter home service detail"
                      disabled={!form.homeService}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="category-field">
                  <label htmlFor="category-onsite-detail">
                    On Site Service
                  </label>
                  <div className="category-service-row">
                    <input
                      type="checkbox"
                      name="onSiteService"
                      className="category-checkbox"
                      checked={form.onSiteService}
                      onChange={handleFormChange}
                      aria-label="On site service available"
                    />
                    <input
                      id="category-onsite-detail"
                      type="text"
                      name="onSiteServiceDetail"
                      value={form.onSiteServiceDetail}
                      onChange={handleFormChange}
                      placeholder="Enter on site service detail"
                      disabled={!form.onSiteService}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="category-field category-field-full">
                  <label htmlFor="category-description">
                    Short Description
                  </label>
                  <textarea
                    id="category-description"
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Enter short description"
                  />
                </div>

                <div className="category-field category-field-full">
                  <label htmlFor="category-image">Category Image</label>

                  <div className="category-upload">
                    <input
                      id="category-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>

                  {shownImage && (
                    <img
                      className="category-edit-preview"
                      src={shownImage}
                      alt="Category preview"
                    />
                  )}
                </div>
              </div>

              {formError && (
                <p className="category-form-error" role="alert">
                  {formError}
                </p>
              )}
            </div>

            <div className="category-edit-footer">
              <button
                type="button"
                className="category-cancel-btn"
                onClick={closeEditModal}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="category-submit-btn"
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Update"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================
          SUCCESS / RESULT MODAL
      ===================================================== */}
      <ConfirmModal
        show={statusModal.show}
        title={
          statusModal.newStatus === 1
            ? "Activate Category"
            : "Deactivate Category"
        }
        message={
          statusModal.category
            ? `Are you sure you want to ${
                statusModal.newStatus === 1 ? "activate" : "deactivate"
              } "${statusModal.category.category_name || statusModal.category.name}"?`
            : ""
        }
        confirmText={statusModal.newStatus === 1 ? "Activate" : "Deactivate"}
        cancelText="Cancel"
        onConfirm={confirmStatusChange}
        onCancel={closeStatusModal}
        loading={isUpdatingStatus}
      />
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

export default CategoryList;
