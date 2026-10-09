import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaTimes,
  FaLayerGroup,
} from "react-icons/fa";

import DataTable from "../../../../Components/common/DataTable";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";
import { getImage } from "../../../../Components/utils/images";
import Breadcrumbs from "../../common/BreadCrumbs";
import api from "../../../../config/api";
import "./subCategoryList.css";

// =========================================================
// FIXED RESTAURANT CATEGORY (cannot be changed by the user)
// =========================================================

const RESTAURANT_CATEGORY_ID = 118;
const RESTAURANT_CATEGORY_NAME = "Restaurant";

const EMPTY_FORM = { name: "", description: "", image: null };

// =========================================================
// SUB CATEGORY SERVICE
// TODO: confirm every path / field name below against the existing
// PHP/API. Only this object needs to change when you do.
// =========================================================

const subCategoryService = {
  async fetchSubCategories() {
    const response = await api.get("/restaurant/sub_categories");

    return response.data;
  },

async createSubCategory({ name, description, image }) {
  const formData = new FormData();

  formData.append("scat", name);
  formData.append("description", description);

  if (image) {
    formData.append("file", image);
  }

  const response = await api.post(
    "/restaurant/sub_categories",
    formData,
  );

  return response.data;
},

 async updateSubCategory(id, { name, description, image }) {
  const formData = new FormData();

  formData.append("name", name);
  formData.append("description", description);

  if (image) {
    formData.append("file", image);
  }

  const response = await api.patch(
    `/restaurant/sub_categories/${id}`,
    formData,
  );

  return response.data;
},

  async updateSubCategoryStatus(id) {
    const response = await api.patch(`/restaurant/sub_categories/${id}/status`);

    return response.data;
  },

  async deleteSubCategory(id) {
    const response = await api.delete(`/restaurant/sub_categories/${id}`);

    return response.data;
  },

  async deleteSubCategories(ids) {
    const response = await api.delete("/restaurant/sub_categories/bulk", {
      data: {
        sub_cat_id: ids,
      },
    });

    return response.data;
  },
};

// =========================================================
// SUB CATEGORY LIST
// =========================================================

const SubCategoryList = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // ADD / EDIT POPUP STATE
  // =========================================================

  const [formModal, setFormModal] = useState({ show: false, editId: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [existingImage, setExistingImage] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef(null);

  // =========================================================
  // CONFIRM / SUCCESS MODAL STATE
  // =========================================================

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: null,
    subCategoryId: null,
    subCategoryName: "",
  });

  const [successModal, setSuccessModal] = useState({
    show: false,
    title: "Success!",
    message: "",
  });

  const [modalLoading, setModalLoading] = useState(false);
  const [statusModal, setStatusModal] = useState({
    show: false,
    subCategory: null,
  });

  // =========================================================
  // FETCH SUB CATEGORIES
  // =========================================================

  const fetchSubCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await subCategoryService.fetchSubCategories();

      if (response?.success) {
        setSubCategories(response.subcategories || []);
      } else {
        setSubCategories([]);
        setErrorMessage(response?.message || "Failed to load sub categories.");
      }
    } catch (error) {
      console.error(
        "Fetch sub categories error:",
        error?.response?.data || error,
      );

      setSubCategories([]);
      setErrorMessage(
        error?.response?.data?.message || "Failed to load sub categories.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubCategories();
  }, [fetchSubCategories]);



  // =========================================================
  // SELECTED ROWS
  // =========================================================

  const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === subCategories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subCategories.map((item) => item.id));
    }
  };

  // =========================================================
  // ADD / EDIT POPUP
  // =========================================================

  // preview of the newly chosen file (revoked on change / unmount)
  const previewUrl = useMemo(
    () => (form.image ? URL.createObjectURL(form.image) : ""),
    [form.image],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const openAddModal = () => {
    setForm(EMPTY_FORM);
    setExistingImage("");
    setFormError("");
    setFormModal({ show: true, editId: null });
  };

  const openEditModal = (row) => {
    setForm({
      name: row.name || "",
      description: row.description || "",
      image: null,
    });
    setExistingImage(getImage(row.image) || "");
    setFormError("");
    setFormModal({ show: true, editId: row.id });
  };

  const closeFormModal = useCallback(() => {
    if (isSaving) return;
    setFormModal({ show: false, editId: null });
  }, [isSaving]);

  // focus the first field and close on Escape
  useEffect(() => {
    if (!formModal.show) return undefined;

    nameInputRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeFormModal();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [formModal.show, closeFormModal]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const handleImageChange = (event) => {
    setForm((prev) => ({ ...prev, image: event.target.files?.[0] || null }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image,
    };

    if (!payload.name) {
      setFormError("Please enter the sub category name.");
      nameInputRef.current?.focus();
      return;
    }

    const isEdit = formModal.editId !== null;

    try {
      setIsSaving(true);
      setFormError("");

      const response = isEdit
        ? await subCategoryService.updateSubCategory(formModal.editId, payload)
        : await subCategoryService.createSubCategory(payload);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save sub category");
      }

      setFormModal({ show: false, editId: null });

      setSuccessModal({
        show: true,
        title: isEdit ? "Sub Category Updated" : "Sub Category Added",
        message: isEdit
          ? "Sub category updated successfully."
          : "Sub category added successfully.",
      });

      fetchSubCategories();
    } catch (error) {
      console.error("Save sub category error:", error?.response?.data || error);

      setFormError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save sub category. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = (row) => {
    setStatusModal({
      show: true,
      subCategory: row,
    });
  };

  const closeStatusModal = () => {
    if (modalLoading) return;

    setStatusModal({
      show: false,
      subCategory: null,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusModal.subCategory) return;

    try {
      setModalLoading(true);

      const response = await subCategoryService.updateSubCategoryStatus(
        statusModal.subCategory.id,
      );

      if (!response?.success) {
        throw new Error(response?.message || "Failed to change status");
      }

      closeStatusModal();

      setSuccessModal({
        show: true,
        title: "Status Updated",
        message: "Sub category status changed successfully.",
      });

      await fetchSubCategories();
    } catch (error) {
      console.error(
        "Change sub category status error:",
        error?.response?.data || error,
      );

      closeStatusModal();

      setSuccessModal({
        show: true,
        title: "Status Update Failed",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to change status.",
      });
    } finally {
      setModalLoading(false);
    }
  };

  // =========================================================
  // DELETE (SINGLE + BULK)
  // =========================================================

  const openDeleteModal = (id) => {
    const item = subCategories.find((row) => row.id === id);

    if (!item) return;

    setConfirmModal({
      show: true,
      type: "single",
      subCategoryId: id,
      subCategoryName: item.name || "this sub category",
    });
  };

  const openBulkDeleteModal = () => {
    if (selectedIds.length === 0) return;

    setConfirmModal({
      show: true,
      type: "bulk",
      subCategoryId: null,
      subCategoryName: "",
    });
  };

  const closeConfirmModal = () => {
    if (modalLoading) return;

    setConfirmModal({
      show: false,
      type: null,
      subCategoryId: null,
      subCategoryName: "",
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.type) return;

    setModalLoading(true);

    try {
      if (confirmModal.type === "single") {
        const id = confirmModal.subCategoryId;

        const response = await subCategoryService.deleteSubCategory(id);

        if (!response?.success) {
          throw new Error(response?.message || "Failed to delete sub category");
        }

        setSubCategories((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((sid) => sid !== id));

        closeConfirmModal();

        setSuccessModal({
          show: true,
          title: "Sub Category Deleted",
          message: "Sub category deleted successfully.",
        });
      }

      if (confirmModal.type === "bulk") {
        const idsToDelete = [...selectedIds];

        const response =
          await subCategoryService.deleteSubCategories(idsToDelete);

        if (!response?.success) {
          throw new Error(
            response?.message || "Failed to delete sub categories",
          );
        }

        setSubCategories((prev) =>
          prev.filter((item) => !idsToDelete.includes(item.id)),
        );
        setSelectedIds([]);

        closeConfirmModal();

        setSuccessModal({
          show: true,
          title: "Sub Categories Deleted",
          message: `${idsToDelete.length} sub categor${
            idsToDelete.length > 1 ? "ies" : "y"
          } deleted successfully.`,
        });
      }
    } catch (error) {
      console.error(
        "Delete sub category error:",
        error?.response?.data || error,
      );

      closeConfirmModal();

      setSuccessModal({
        show: true,
        title: "Delete Failed",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete. Please try again.",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setSuccessModal((prev) => ({ ...prev, show: false }));
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
            className="subcat-checkbox"
            checked={
              subCategories.length > 0 &&
              selectedIds.length === subCategories.length
            }
            onChange={handleSelectAll}
            aria-label="Select all sub categories"
          />
        ),
        width: 44,
        sortable: false,
        render: (_, row) => (
          <input
            type="checkbox"
            className="subcat-checkbox"
            checked={selectedIds.includes(row.id)}
            onChange={() => handleSelectOne(row.id)}
            aria-label={`Select ${row.name}`}
          />
        ),
      },

      {
        key: "serial",
        label: "Sr.No",
        width: 70,
        sortable: false,
        render: (value) => <span className="subcat-serial">{value}</span>,
      },

      {
        key: "image",
        label: "Image",
        width: 100,
        sortable: false,
        render: (_, row) => {
          const imageUrl = getImage(row.image);

          return imageUrl ? (
            <img
              className="subcat-thumb"
              src={imageUrl}
              alt={row.name || "Sub category"}
            />
          ) : (
            <div className="subcat-thumb subcat-thumb-placeholder">
              <FaImage />
            </div>
          );
        },
      },

      {
        key: "name",
        label: "Name",
        width: 80,
        sortable: true,
        render: (_, row) => (
          <span className="subcat-name">{row.name || "-"}</span>
        ),
      },

      {
        key: "description",
        label: "Description",
        width: 250,
        sortable: false,
        render: (_, row) => (
          <span className="subcat-desc" title={row.description || ""}>
            {row.description || "-"}
          </span>
        ),
      },

      {
  key: "status",
  label: "Status",
  sortable: true,
  render: (_, row) => {
    const isActive = Number(row.status) === 1;

    return (
      <span
        className={`subcat-badge ${
          isActive ? "subcat-badge-active" : "subcat-badge-inactive"
        }`}
        onClick={() => handleStatusChange(row)}
        style={{ cursor: "pointer" }}
      >
        <span className="subcat-status-dot"></span>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  },
},

      {
        key: "actions",
        label: "Action",
        sortable: false,
        render: (_, row) => (
          <div className="subcat-action-buttons">
            <button
              type="button"
              className="subcat-action-btn subcat-edit-btn"
              title="Edit sub category"
              onClick={() => openEditModal(row)}
            >
              <FaEdit />
            </button>

            <button
              type="button"
              className="subcat-action-btn subcat-delete-btn"
              title="Delete sub category"
              onClick={() => openDeleteModal(row.id)}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subCategories, selectedIds],
  );

  // =========================================================
  // PAGE
  // =========================================================

  const isEdit = formModal.editId !== null;
  const shownImage = previewUrl || existingImage;

  return (
    <>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={[
            {
              label: "Category",
            },
            {
              label: "Sub Category List",
            },
          ]}
        />
      </div>
      <div className="subcat-list-page">
        {/* PAGE HEADER */}

        <div className="subcat-page-header">
          <div className="subcat-page-title-wrapper">
            <div className="subcat-title-icon">
              <FaLayerGroup />
            </div>

            <div>
              <h1 className="subcat-page-title">Sub Category List</h1>

              <p className="subcat-page-subtitle">
                Manage the sub categories available under Restaurant.
              </p>
            </div>
          </div>
        </div>

        {/* MAIN CARD */}

        <div className="subcat-main-card">
          <div className="subcat-card-header">
            <div className="subcat-card-title-wrapper">
              <h2 className="subcat-card-title">Total Sub Categories</h2>

              <span className="subcat-count-badge">{subCategories.length}</span>
            </div>

            <button
              type="button"
              className="subcat-add-btn"
              onClick={openAddModal}
            >
              <FaPlus />
              <span>Add Sub Category</span>
            </button>
          </div>

          {isLoading ? (
            <div className="subcat-empty-state">
              <div className="subcat-empty-icon">
                <FaLayerGroup />
              </div>

              <h3>Loading sub categories…</h3>
            </div>
          ) : errorMessage ? (
            <div className="subcat-empty-state">
              <div className="subcat-empty-icon">
                <FaLayerGroup />
              </div>

              <h3>Couldn’t load sub categories</h3>

              <p>{errorMessage}</p>

              <button
                type="button"
                className="subcat-add-btn"
                onClick={fetchSubCategories}
              >
                <span>Try again</span>
              </button>
            </div>
          ) : subCategories.length === 0 ? (
            <div className="subcat-empty-state">
              <div className="subcat-empty-icon">
                <FaLayerGroup />
              </div>

              <h3>No sub categories yet</h3>

              <p>Add your first sub category under Restaurant.</p>

              <button
                type="button"
                className="subcat-add-btn"
                onClick={openAddModal}
              >
                <FaPlus />
                <span>Add Sub Category</span>
              </button>
            </div>
          ) : (
            <div className="subcat-table-wrapper">
              <DataTable
                columns={columns}
                data={subCategories}
                entriesPerPageOptions={[10, 25, 50, 100]}
                searchable={true}
                sortable={true}
                searchKeys={["name", "description"]}
              />
            </div>
          )}

          {/* BULK DELETE BAR (bottom right) */}

          {selectedIds.length > 0 && (
            <div className="subcat-bottom-action-bar">
              <div className="subcat-selected-info">
                <span className="selected-dot"></span>

                <span>
                  {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""}{" "}
                  selected
                </span>
              </div>

              <button
                type="button"
                className="subcat-bulk-delete-btn"
                onClick={openBulkDeleteModal}
              >
                <FaTrash />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* =====================================================
          ADD / EDIT POPUP
      ===================================================== */}

        {formModal.show && (
          <div
            className="subcat-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeFormModal();
            }}
          >
            <form
              className="subcat-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="subcat-modal-title"
              onSubmit={handleFormSubmit}
              noValidate
            >
              <div className="subcat-modal-head">
                <h3 id="subcat-modal-title">
                  {isEdit ? "Edit Sub Category" : "Add New Sub Category"}
                </h3>

                <button
                  type="button"
                  className="subcat-modal-close"
                  onClick={closeFormModal}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="subcat-modal-body">
                <div className="subcat-form-grid">
                  <div className="subcat-field">
                    <label htmlFor="subcat-name">Sub Category Name</label>
                    <input
                      id="subcat-name"
                      ref={nameInputRef}
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      placeholder="Enter sub category name"
                      aria-invalid={Boolean(formError)}
                      autoComplete="off"
                    />
                  </div>

                  <div className="subcat-field">
                    <label htmlFor="subcat-category">Category Name</label>
                    <select
                      id="subcat-category"
                      value={RESTAURANT_CATEGORY_ID}
                      disabled
                    >
                      <option value={RESTAURANT_CATEGORY_ID}>
                        {RESTAURANT_CATEGORY_NAME}
                      </option>
                    </select>
                  </div>

                  <div className="subcat-field subcat-field-full">
                    <label htmlFor="subcat-description">
                      Short Description
                    </label>
                    <textarea
                      id="subcat-description"
                      name="description"
                      rows={3}
                      value={form.description}
                      onChange={handleFormChange}
                      placeholder="Enter short description"
                    />
                  </div>

                  <div className="subcat-field subcat-field-full">
                    <label htmlFor="subcat-image">Sub Category Image</label>

                    <div className="subcat-upload">
                      {shownImage ? (
                        <img
                          className="subcat-upload-preview"
                          src={shownImage}
                          alt="Sub category preview"
                        />
                      ) : (
                        <div className="subcat-upload-preview subcat-upload-empty">
                          <FaImage />
                        </div>
                      )}

                      <input
                        id="subcat-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                </div>

                {formError && (
                  <p className="subcat-form-error" role="alert">
                    {formError}
                  </p>
                )}
              </div>

              <div className="subcat-modal-footer">
                <button
                  type="button"
                  className="subcat-cancel-btn"
                  onClick={closeFormModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="subcat-submit-btn"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving…" : isEdit ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =====================================================
          CONFIRM MODAL
      ===================================================== */}
        <ConfirmModal
          show={statusModal.show}
          title={
            statusModal.subCategory &&
            Number(statusModal.subCategory.status) === 1
              ? "Deactivate Sub Category"
              : "Activate Sub Category"
          }
          message={
            statusModal.subCategory
              ? `Are you sure you want to ${
                  Number(statusModal.subCategory.status) === 1
                    ? "deactivate"
                    : "activate"
                } "${statusModal.subCategory.name}"?`
              : ""
          }
          confirmText={
            statusModal.subCategory &&
            Number(statusModal.subCategory.status) === 1
              ? "Deactivate"
              : "Activate"
          }
          cancelText="Cancel"
          onConfirm={handleConfirmStatusChange}
          onCancel={closeStatusModal}
          loading={modalLoading}
        />
        <ConfirmModal
          show={confirmModal.show}
          title={
            confirmModal.type === "bulk"
              ? "Delete Selected Sub Categories"
              : "Delete Sub Category"
          }
          message={
            confirmModal.type === "bulk"
              ? `Are you sure you want to delete ${selectedIds.length} selected sub categor${
                  selectedIds.length > 1 ? "ies" : "y"
                }? This action cannot be undone.`
              : `Are you sure you want to delete "${confirmModal.subCategoryName}"? This action cannot be undone.`
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

export default SubCategoryList;
