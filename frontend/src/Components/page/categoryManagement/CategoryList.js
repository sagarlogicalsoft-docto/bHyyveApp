import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  FaEdit,
  FaTrash,
  FaFileExport,
  FaFileImport,
  FaTimes,
  FaGripVertical,
} from "react-icons/fa";

import DataTable from "../../common/DataTable";
import { getImage } from "../../utils/images";

import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceConfirmModal from "../../../Components/common/modal/serviceModal/ServiceConfirmModal";
import ServiceSuccessModal from "../../../Components/common/modal/serviceModal/ServiceSuccessModal";
import api from "../../../config/api";

import "./categoryList.css";

async function request(config) {
  try {
    const response = await api.request(config);
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        err?.message ||
        `Request failed (${err?.response?.status || "network error"})`,
    );
  }
}

function fetchCategories() {
  return request({ method: "GET", url: "/admin/categories" });
}

function updateCategoryStatus(id, status) {
  return request({
    method: "PUT",
    url: `/admin/categories/${id}/status`,
    data: { status },
  });
}

function deleteCategory(id) {
  return request({ method: "DELETE", url: `/admin/categories/${id}` });
}

function deleteSelectedCategories(catIds) {
  return request({
    method: "DELETE",
    url: "/admin/categories/selected",
    data: { cat_id: catIds },
  });
}

function importCategories(file) {
  const formData = new FormData();
  formData.append("csv_file", file);

  return request({
    method: "POST",
    url: "/admin/categories/import",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

function updateCategoryOrder(orderIds) {
  return request({
    method: "PUT",
    url: "/admin/categories/order",
    data: { order_ids: orderIds },
  });
}

/* =========================================================
   COMPONENT
========================================================= */

const CategoryList = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const selectAllRef = useRef(null);

  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategories, setSelectedCategories] = useState([]);

  // confirm modal: { type: "delete" | "deleteSelected" | "status", category? }
  const [confirmState, setConfirmState] = useState(null);
  // success modal: { title, message }
  const [successState, setSuccessState] = useState(null);
  // inline error banner for failed actions
  const [actionError, setActionError] = useState("");
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  /* ---------------------------------------------------------
     LOAD
  --------------------------------------------------------- */

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchCategories();
      const data = Array.isArray(response?.data) ? response.data : [];

      const formattedCategories = data.map((item) => ({
        id: item.id,
        name: item.category_name || "—",
        image: getImage(item.category_image),
        description: item.sort_description || "—",
        status: Number(item.status) === 1 ? "Active" : "Inactive",
      }));

      setCategoryData(formattedCategories);
    } catch (err) {
      console.error("Get categories error:", err);
      setError(err.message || "Could not load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleReorderCategories = async (reorderedCategories) => {
    const previousCategories = categoryData;

    setActionError("");
    setSavingOrder(true);
    setCategoryData(reorderedCategories);

    try {
      const response = await updateCategoryOrder(
        reorderedCategories.map((category) => category.id),
      );

      if (response?.result !== true) {
        throw new Error(response?.msg || "Failed to save category order.");
      }
    } catch (err) {
      setCategoryData(previousCategories);
      setActionError(
        err.message || "Failed to save category order. Please try again.",
      );
      throw err;
    } finally {
      setSavingOrder(false);
    }
  };

  /* ---------------------------------------------------------
     SELECT
  --------------------------------------------------------- */

  const allSelected =
    categoryData.length > 0 &&
    selectedCategories.length === categoryData.length;
  const someSelected = selectedCategories.length > 0 && !allSelected;

  // partial ("-") state for the header checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected, loading]);

  const handleSelectCategory = useCallback((id) => {
    setSelectedCategories((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedCategories(
      allSelected ? [] : categoryData.map((category) => category.id),
    );
  }, [allSelected, categoryData]);

  const clearSelection = useCallback(() => setSelectedCategories([]), []);

  /* ---------------------------------------------------------
     CONFIRM MODAL ACTIONS
  --------------------------------------------------------- */

  const closeConfirm = useCallback(() => setConfirmState(null), []);
  const closeSuccess = useCallback(() => setSuccessState(null), []);

  const handleConfirm = async () => {
    if (!confirmState) return;

    setActionError("");

    try {
      if (confirmState.type === "delete") {
        const id = confirmState.category.id;
        await deleteCategory(id);

        setCategoryData((previous) =>
          previous.filter((category) => category.id !== id),
        );
        setSelectedCategories((previous) =>
          previous.filter((categoryId) => categoryId !== id),
        );
        setSuccessState({
          title: "Category Deleted",
          message: "The category has been deleted successfully.",
        });
      }

      if (confirmState.type === "deleteSelected") {
        await deleteSelectedCategories(selectedCategories);

        setCategoryData((previous) =>
          previous.filter(
            (category) => !selectedCategories.includes(category.id),
          ),
        );
        setSelectedCategories([]);
        setSuccessState({
          title: "Categories Deleted",
          message: "The selected categories have been deleted successfully.",
        });
      }

      if (confirmState.type === "status") {
        const { category } = confirmState;
        const newStatus = category.status === "Active" ? 0 : 1;

        await updateCategoryStatus(category.id, newStatus);

        setCategoryData((previous) =>
          previous.map((item) =>
            item.id === category.id
              ? { ...item, status: newStatus === 1 ? "Active" : "Inactive" }
              : item,
          ),
        );
        setSuccessState({
          title: "Status Updated",
          message: `The category has been ${
            newStatus === 1 ? "activated" : "deactivated"
          } successfully.`,
        });
      }
    } catch (err) {
      console.error("Category action error:", err);
      setActionError(err.message || "Something went wrong. Please try again.");
    } finally {
      setConfirmState(null);
    }
  };

  // Text / variant for the confirm modal
  const confirmContent = useMemo(() => {
    if (!confirmState) {
      return {
        title: "Are you sure?",
        message: "",
        confirmText: "Confirm",
        variant: "primary",
      };
    }

    if (confirmState.type === "delete") {
      return {
        title: "Delete Category?",
        message:
          "This category will be permanently deleted. This action cannot be undone.",
        confirmText: "Yes, Delete",
        variant: "danger",
      };
    }

    if (confirmState.type === "deleteSelected") {
      return {
        title: "Delete Selected Categories?",
        message: `You are about to delete ${selectedCategories.length} selected categor${
          selectedCategories.length === 1 ? "y" : "ies"
        }. This action cannot be undone.`,
        confirmText: "Yes, Delete All",
        variant: "danger",
      };
    }

    const isActive = confirmState.category.status === "Active";

    return {
      title: isActive ? "Deactivate Category?" : "Activate Category?",
      message: `Do you want to ${
        isActive ? "deactivate" : "activate"
      } this category?`,
      confirmText: isActive ? "Yes, Deactivate" : "Yes, Activate",
      variant: isActive ? "danger" : "primary",
    };
  }, [confirmState, selectedCategories.length]);

  /* ---------------------------------------------------------
     IMPORT / EXPORT
  --------------------------------------------------------- */

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setActionError("");

    try {
      const response = await importCategories(file);

      setSuccessState({
        title: "Import Successful",
        message: response?.message || "Categories imported successfully.",
      });

      await loadCategories();
    } catch (err) {
      console.error("Import categories error:", err);
      setActionError(err.message || "Failed to import categories.");
    } finally {
      // allow selecting the same file again
      event.target.value = "";
    }
  };

  const handleExport = async () => {
    try {
      const XLSX = await import("xlsx");

      const exportData = categoryData.map((item, index) => ({
        "Sr. No.": index + 1,
        Name: item.name,
        Description: item.description,
        Status: item.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
      XLSX.writeFile(workbook, "category-list.xlsx");
    } catch (err) {
      console.error("Export error:", err);
      setActionError(
        "Export failed. Please make sure the xlsx package is installed.",
      );
    }
  };

  /* ---------------------------------------------------------
     TABLE COLUMNS
  --------------------------------------------------------- */

  const columns = useMemo(
    () => [
      {
        key: "move",
        label: "Move",
        width: "20px",
        sortable: false,
        render: (_, row, rowIndex, dragProps) => (
          <button
            type="button"
            className="datatable-drag-handle"
            title="Drag to reorder"
            aria-label={`Move category ${row.name}`}
            draggable={Boolean(
              isReorderMode && !savingOrder && dragProps?.draggable,
            )}
            disabled={!isReorderMode || savingOrder}
            onClick={(event) => event.stopPropagation()}
            onDragStart={(event) => {
              console.log("HANDLE DRAG START:", row.id);
              event.dataTransfer.effectAllowed = "move";
              dragProps?.onDragStart(event);
            }}
          >
            <FaGripVertical aria-hidden="true" />
          </button>
        ),
      },
      {
        key: "select",
        label: (
          <input
            ref={selectAllRef}
            type="checkbox"
            className="ctgl-checkbox"
            title="Select all"
            aria-label="Select all categories"
            checked={allSelected}
            onChange={handleSelectAll}
            onClick={(event) => event.stopPropagation()}
          />
        ),
        width: "40px",
        sortable: false,
        render: (_, row) => (
          <input
            type="checkbox"
            className="ctgl-checkbox"
            checked={selectedCategories.includes(row.id)}
            onChange={() => handleSelectCategory(row.id)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },
      {
        key: "serial",
        label: "Sr. No.",
        width: "50px",
        sortable: false,
        render: (_, row, rowIndex) => rowIndex + 1,
      },
      {
        key: "image",
        label: "Image",
        width: "120px",
        sortable: false,
        render: (value) => (
          <div className="ctgl-image-wrapper">
            <img src={value} alt="Category" className="ctgl-image" />
          </div>
        ),
      },
      {
        key: "name",
        label: "Name",
        width: "80px",
        sortable: true,
      },
      {
        key: "description",
        label: "Description",
        width: "120px",
        sortable: true,
        render: (value) => (
          <span className="ctgl-description" title={value}>
            {value}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        width: "90px",
        sortable: true,
        render: (value, row) => (
          <button
            type="button"
            className={`ctgl-status ${
              value === "Active" ? "ctgl-status-active" : "ctgl-status-inactive"
            }`}
            title={
              value === "Active" ? "Click to deactivate" : "Click to activate"
            }
            onClick={() => setConfirmState({ type: "status", category: row })}
          >
            <span className="ctgl-status-dot" />
            {value}
          </button>
        ),
      },
      {
        key: "actions",
        label: "Action",
        width: "80px",
        sortable: false,
        render: (_, row) => (
          <div className="ctgl-action-buttons">
            <button
              type="button"
              className="ctgl-btn ctgl-btn-edit"
              title="Edit"
              aria-label="Edit category"
              onClick={() => navigate(`/edit_category/${row.id}`)}
            >
              <FaEdit />
            </button>

            <button
              type="button"
              className="ctgl-btn ctgl-btn-delete"
              title="Delete"
              aria-label="Delete category"
              onClick={() => setConfirmState({ type: "delete", category: row })}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    [
      allSelected,
      selectedCategories,
      handleSelectAll,
      handleSelectCategory,
      navigate,
      isReorderMode,
      savingOrder,
    ],
  );

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <div className="ctgl-page">
      {/* PAGE HEADER */}
      <div className="ctgl-page-header">
        <h2 className="ctgl-page-title">Category List</h2>
        <ServiceBreadcrumbs items={[{ label: "Category List" }]} />
      </div>

      {/* MAIN CARD */}
      <div className="ctgl-card">
        <div className="ctgl-card-header">
          <div className="ctgl-card-heading">
            <h3>Category Management</h3>
            {!loading && !error && (
              <span className="ctgl-count-badge">
                {categoryData.length} total
              </span>
            )}
          </div>

          <div className="ctgl-header-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="ctgl-hidden-file"
              onChange={handleImportFile}
            />
            <button
              type="button"
              className="ctgl-export-btn"
              onClick={() => setIsReorderMode((previous) => !previous)}
              disabled={
                loading ||
                Boolean(error) ||
                savingOrder ||
                categoryData.length === 0
              }
              title="Reorder Categories"
            >
              <span>
                {savingOrder
                  ? "Saving..."
                  : isReorderMode
                    ? "Done Reordering"
                    : "Reorder Categories"}
              </span>
            </button>
            <button
              type="button"
              className="ctgl-import-btn"
              onClick={handleImportClick}
              title="Import Categories"
            >
              <FaFileImport />
              <span>Import</span>
            </button>

            <button
              type="button"
              className="ctgl-export-btn"
              onClick={handleExport}
              title="Export Categories"
              disabled={categoryData.length === 0}
            >
              <FaFileExport />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* ACTION ERROR BANNER */}
        {actionError && (
          <div className="ctgl-alert" role="alert">
            <span>{actionError}</span>
            <button
              type="button"
              className="ctgl-alert-close"
              aria-label="Dismiss"
              onClick={() => setActionError("")}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* TABLE */}
        <div className="ctgl-table-wrapper">
          {loading && (
            <div className="ctgl-state ctgl-loading">
              <span className="ctgl-spinner" aria-hidden="true" />
              Loading categories...
            </div>
          )}

          {error && (
            <div className="ctgl-state ctgl-error">
              <span>{error}</span>
              <button
                type="button"
                className="ctgl-retry-btn"
                onClick={loadCategories}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <DataTable
              columns={columns}
              data={categoryData}
              entriesPerPageOptions={[5, 10, 25, 50, 100]}
              defaultEntriesPerPage={10}
              searchable={true}
              sortable={true}
              reorderable={isReorderMode}
              onReorder={handleReorderCategories}
              reorderDisabled={savingOrder}
            />
          )}
        </div>
      </div>

      {/* FLOATING SELECTED ACTION BAR */}
      {selectedCategories.length > 0 && (
        <div className="ctgl-selected-actions">
          <span className="ctgl-selected-count">
            {selectedCategories.length} selected
          </span>

          <div className="ctgl-selected-buttons">
            <button
              type="button"
              className="ctgl-selected-cancel-btn"
              onClick={clearSelection}
            >
              Cancel
            </button>

            <button
              type="button"
              className="ctgl-selected-delete-btn"
              onClick={() => setConfirmState({ type: "deleteSelected" })}
            >
              <FaTrash />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ServiceConfirmModal
        isOpen={Boolean(confirmState)}
        title={confirmContent.title}
        message={confirmContent.message}
        confirmText={confirmContent.confirmText}
        variant={confirmContent.variant}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />

      {/* SUCCESS MODAL */}
      <ServiceSuccessModal
        isOpen={Boolean(successState)}
        title={successState?.title}
        message={successState?.message}
        onClose={closeSuccess}
      />
    </div>
  );
};

export default CategoryList;
