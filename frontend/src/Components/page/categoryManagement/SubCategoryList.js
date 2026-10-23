import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaEllipsisH,
  FaGripVertical,
  FaPlus,
  FaSyncAlt,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import DataTable from "../../common/DataTable";
import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../../Components/common/modal/serviceModal/ServiceSuccessModal";
import ServiceConfirmModal from "../../../Components/common/modal/serviceModal/ServiceConfirmModal";
import useOutsideClick from "../../../hooks/UseOutsideClick";
import api from "../../../config/api";
import { getImage } from "../../utils/images";

import "./subCategoryList.css";

const ADD_SUB_CATEGORY_PATH = "/add_sub_category";
const EDIT_SUB_CATEGORY_PATH = "/edit_sub_category";

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

function isOk(result) {
  return (
    result?.success === true ||
    result?.success === 1 ||
    result?.success === "1" ||
    result?.status === true ||
    result?.status === "success"
  );
}

async function fetchSubCategories() {
  const result = await request({ method: "GET", url: "/admin/sub-categories" });

  if (!isOk(result)) {
    throw new Error(result?.message || "Failed to fetch sub categories.");
  }

  return (result.data || []).map((item) => ({
    id: item.id,
    image: getImage(item.image),
    name: item.name,
    categoryName: item.category_name,
    description: item.description,
    status: Number(item.status) === 1 ? "Active" : "Inactive",
  }));
}

async function updateSubCategoryOrder(orderIds) {
  const result = await request({
    method: "PUT",
    url: "/admin/sub-categories/order",
    data: { order_ids: orderIds },
  });

  // Backend reorder endpoint uses result: true/false.
  if (result?.result !== true) {
    throw new Error(result?.msg || "Failed to update sub category order.");
  }

  return result;
}

async function deleteSubCategory(id) {
  const result = await request({
    method: "DELETE",
    url: `/admin/sub-categories/${id}`,
  });

  if (!isOk(result)) {
    throw new Error(result?.message || "Failed to delete sub category.");
  }

  return result;
}

async function deleteSelectedSubCategories(ids) {
  const result = await request({
    method: "DELETE",
    url: "/admin/sub-categories/selected",
    data: { sub_cat_id: ids },
  });

  if (!isOk(result)) {
    throw new Error(
      result?.message || "Failed to delete selected sub categories.",
    );
  }

  return result;
}

async function changeSubCategoryStatus(id) {
  const result = await request({
    method: "PUT",
    url: `/admin/sub-categories/${id}/status`,
  });

  if (!isOk(result)) {
    throw new Error(result?.message || "Failed to change sub category status.");
  }

  return result;
}

/* =========================================================
   COMPONENT
========================================================= */

const SubCategoryList = () => {
  const navigate = useNavigate();

  const [subCategoryData, setSubCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openActionId, setOpenActionId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [reordering, setReordering] = useState(false);

  // confirm modals
  const [statusTarget, setStatusTarget] = useState(null); // row | null
  const [deleteTarget, setDeleteTarget] = useState(null); // row | null
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // success modal: { title, message } | null
  const [successInfo, setSuccessInfo] = useState(null);
  const [isReorderMode, setIsReorderMode] = useState(false);

  // close the action menu when clicking outside of it
  useOutsideClick(".sclp-action-menu", () => setOpenActionId(null));

  /* ---------------------------------------------------------
     LOAD LIST
  --------------------------------------------------------- */

  const loadSubCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setSubCategoryData(await fetchSubCategories());
    } catch (err) {
      console.error("Fetch sub categories error:", err);
      setError(err.message || "Failed to fetch sub categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubCategories();
  }, [loadSubCategories]);

  const handleReorder = useCallback(
    async (reorderedData) => {
      if (reordering) return;

      const previousData = subCategoryData;

      setError("");
      setReordering(true);
      setSubCategoryData(reorderedData);

      try {
        await updateSubCategoryOrder(reorderedData.map((item) => item.id));
      } catch (err) {
        console.error("Update sub category order error:", err);

        setSubCategoryData(previousData);
        setError(err.message || "Failed to update sub category order.");
      } finally {
        setReordering(false);
      }
    },
    [reordering, subCategoryData],
  );

  /* ---------------------------------------------------------
     SELECTION
  --------------------------------------------------------- */

  const handleSelect = useCallback((id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  }, []);

  /* ---------------------------------------------------------
     EDIT
  --------------------------------------------------------- */

  const handleEdit = useCallback(
    (id) => {
      navigate(`${EDIT_SUB_CATEGORY_PATH}/${id}`);
    },
    [navigate],
  );

  /* ---------------------------------------------------------
     STATUS CHANGE (after confirm)
  --------------------------------------------------------- */

  const confirmStatusChange = async () => {
    const target = statusTarget;
    if (!target) return;

    try {
      const result = await changeSubCategoryStatus(target.id);

      setSubCategoryData((previous) =>
        previous.map((item) =>
          item.id === target.id
            ? {
                ...item,
                status:
                  Number(result?.data?.status) === 1 ? "Active" : "Inactive",
              }
            : item,
        ),
      );

      setStatusTarget(null);
      setSuccessInfo({
        title: "Status Updated",
        message: result.message || "The sub category status has been changed.",
      });
    } catch (err) {
      console.error("Change sub category status error:", err);
      setStatusTarget(null);
      setError(err.message || "Failed to change sub category status.");
    }
  };

  /* ---------------------------------------------------------
     DELETE SINGLE (after confirm)
  --------------------------------------------------------- */

  const confirmDelete = async () => {
    const target = deleteTarget;
    if (!target) return;

    try {
      const result = await deleteSubCategory(target.id);

      setSubCategoryData((previous) =>
        previous.filter((item) => item.id !== target.id),
      );
      setSelectedIds((previous) => previous.filter((id) => id !== target.id));

      setDeleteTarget(null);
      setSuccessInfo({
        title: "Sub Category Deleted",
        message: result.message || "The sub category has been deleted.",
      });
    } catch (err) {
      console.error("Delete sub category error:", err);
      setDeleteTarget(null);
      setError(err.message || "Failed to delete sub category.");
    }
  };

  /* ---------------------------------------------------------
     DELETE SELECTED (after confirm)
  --------------------------------------------------------- */

  const confirmDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    try {
      const result = await deleteSelectedSubCategories(selectedIds);

      setSubCategoryData((previous) =>
        previous.filter((item) => !selectedIds.includes(item.id)),
      );
      setSelectedIds([]);

      setBulkDeleteOpen(false);
      setSuccessInfo({
        title: "Sub Categories Deleted",
        message:
          result.message || "The selected sub categories have been deleted.",
      });
    } catch (err) {
      console.error("Delete selected sub categories error:", err);
      setBulkDeleteOpen(false);
      setError(err.message || "Failed to delete selected sub categories.");
    }
  };

  const closeSuccess = useCallback(() => setSuccessInfo(null), []);

  /* ---------------------------------------------------------
     TABLE COLUMNS
  --------------------------------------------------------- */

  const columns = useMemo(
    () => [
      {
        key: "drag",
        label: "Move",
        width: "50px",
        sortable: false,
        render: (_, row, rowIndex, dragProps) => (
          <button
            type="button"
            className="sclp-drag-handle"
            title={
              isReorderMode
                ? "Drag to reorder"
                : "Click Reorder Sub Categories to enable moving"
            }
            aria-label={`Move sub category ${row.name}`}
            draggable={Boolean(
              isReorderMode && !reordering && dragProps?.draggable,
            )}
            disabled={!isReorderMode || reordering}
            onClick={(event) => event.stopPropagation()}
            onDragStart={(event) => {
              if (!isReorderMode || reordering) {
                event.preventDefault();
                return;
              }

              dragProps?.onDragStart(event);
            }}
          >
            <FaGripVertical />
          </button>
        ),
      },
      {
        key: "select",
        label: "Select",
        width: "50px",
        sortable: false,
        render: (_, row) => (
          <input
            type="checkbox"
            className="sclp-checkbox"
            checked={selectedIds.includes(row.id)}
            onChange={() => handleSelect(row.id)}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Select ${row.name}`}
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
        width: "80px",
        sortable: false,
        render: (value) => (
          <div className="sclp-image-wrapper">
            <img
              src={value}
              alt="Sub category"
              className="sclp-image"
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
          </div>
        ),
      },
      {
        key: "name",
        label: "Name",
        width: "120px",
        sortable: true,
        render: (value) => <span className="sclp-cell-text">{value}</span>,
      },
      {
        key: "categoryName",
        label: "Category Name",
        width: "120px",
        sortable: true,
        render: (value) => <span className="sclp-cell-text">{value}</span>,
      },
      {
        key: "description",
        label: "Description",
        width: "150px",
        sortable: true,
        render: (value) => (
          <span className="sclp-cell-text">{value || "—"}</span>
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
            className={`sclp-status-badge ${
              value === "Active"
                ? "sclp-status-badge-active"
                : "sclp-status-badge-inactive"
            }`}
            title={
              value === "Active" ? "Click to deactivate" : "Click to activate"
            }
            onClick={() => setStatusTarget(row)}
          >
            <span className="sclp-status-dot" />
            {value}
          </button>
        ),
      },
      {
        key: "actions",
        label: "Action",
        width: "90px",
        sortable: false,
        render: (_, row) => (
          <div className="sclp-action-buttons">
            <button
              type="button"
              className="sclp-icon-btn sclp-icon-btn-edit"
              title="Edit"
              aria-label={`Edit ${row.name}`}
              onClick={() => handleEdit(row.id)}
            >
              <FaEdit />
            </button>

            <button
              type="button"
              className="sclp-icon-btn sclp-icon-btn-delete"
              title="Delete"
              aria-label={`Delete ${row.name}`}
              onClick={() => setDeleteTarget(row)}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    [selectedIds, handleSelect, handleEdit, isReorderMode, reordering],
  );

  /* ---------------------------------------------------------
     COUNTS
  --------------------------------------------------------- */

  const activeCount = subCategoryData.filter(
    (item) => item.status === "Active",
  ).length;
  const inactiveCount = subCategoryData.length - activeCount;

  const statusWillActivate = statusTarget?.status !== "Active";

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <div className="sclp-page">
      {/* PAGE HEADER */}
      <div className="sclp-page-header">
        <div>
          <h2 className="sclp-page-title">Sub Category List</h2>
          <ServiceBreadcrumbs items={[{ label: "Sub Category List" }]} />
        </div>

        <button
          type="button"
          className="sclp-add-btn"
          onClick={() => navigate(ADD_SUB_CATEGORY_PATH)}
        >
          <FaPlus />
          Add Sub Category
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="sclp-card">
        <div className="sclp-card-header">
          <div>
            <h3>Sub Category Management</h3>
            <p>View, edit, activate or delete your sub categories.</p>
          </div>
          <button
            type="button"
            className="sclp-reorder-btn"
            onClick={() => setIsReorderMode((previous) => !previous)}
            disabled={
              loading ||
              Boolean(error) ||
              reordering ||
              subCategoryData.length === 0
            }
            title="Reorder Sub Categories"
          >
            <FaGripVertical />
            <span>
              {reordering
                ? "Saving..."
                : isReorderMode
                  ? "Done Reordering"
                  : "Reorder Sub Categories"}
            </span>
          </button>

          {!loading && subCategoryData.length > 0 && (
            <div className="sclp-chips">
              <span className="sclp-chip">
                Total <strong>{subCategoryData.length}</strong>
              </span>
              <span className="sclp-chip sclp-chip-active">
                Active <strong>{activeCount}</strong>
              </span>
              <span className="sclp-chip sclp-chip-inactive">
                Inactive <strong>{inactiveCount}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="sclp-card-body">
          {error && (
            <div className="sclp-alert" role="alert">
              <span>{error}</span>

              <div className="sclp-alert-actions">
                <button
                  type="button"
                  className="sclp-alert-retry"
                  onClick={loadSubCategories}
                >
                  <FaSyncAlt />
                  Retry
                </button>

                <button
                  type="button"
                  className="sclp-alert-close"
                  aria-label="Dismiss"
                  onClick={() => setError("")}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}

          <div className="sclp-table-wrapper">
            {loading ? (
              <div className="sclp-state">
                <span className="sclp-spinner" aria-hidden="true" />
                Loading sub categories...
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={subCategoryData}
                entriesPerPageOptions={[5, 10, 25, 50, 100]}
                defaultEntriesPerPage={10}
                searchable={true}
                sortable={true}
                reorderable={isReorderMode}
                onReorder={handleReorder}
                reorderDisabled={reordering}
              />
            )}
          </div>
        </div>

        {/* FLOATING SELECTED ACTION BAR */}
        {selectedIds.length > 0 && (
          <div className="sclp-selected-actions">
            <span className="sclp-selected-count">
              {selectedIds.length} selected
            </span>

            <div className="sclp-selected-buttons">
              <button
                type="button"
                className="sclp-selected-cancel-btn"
                onClick={() => setSelectedIds([])}
              >
                Cancel
              </button>

              <button
                type="button"
                className="sclp-selected-delete-btn"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <FaTrash />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STATUS CONFIRM */}
      <ServiceConfirmModal
        isOpen={Boolean(statusTarget)}
        title="Are you sure?"
        message={`You want to ${
          statusWillActivate ? "activate" : "deactivate"
        } "${statusTarget?.name || "this sub category"}"?`}
        confirmText={statusWillActivate ? "Yes, Activate" : "Yes, Deactivate"}
        variant="primary"
        onConfirm={confirmStatusChange}
        onCancel={() => setStatusTarget(null)}
      />

      {/* DELETE CONFIRM */}
      <ServiceConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Sub Category?"
        message={`Are you sure you want to delete "${
          deleteTarget?.name || "this sub category"
        }"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* BULK DELETE CONFIRM */}
      <ServiceConfirmModal
        isOpen={bulkDeleteOpen}
        title="Delete Selected Sub Categories?"
        message={`Are you sure you want to delete ${selectedIds.length} selected sub categor${
          selectedIds.length === 1 ? "y" : "ies"
        }? This action cannot be undone.`}
        confirmText="Yes, Delete"
        variant="danger"
        onConfirm={confirmDeleteSelected}
        onCancel={() => setBulkDeleteOpen(false)}
      />

      {/* SUCCESS MODAL */}
      <ServiceSuccessModal
        isOpen={Boolean(successInfo)}
        title={successInfo?.title}
        message={successInfo?.message}
        onClose={closeSuccess}
      />
    </div>
  );
};

export default SubCategoryList;
