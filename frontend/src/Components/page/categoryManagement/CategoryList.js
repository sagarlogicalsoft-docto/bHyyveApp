import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaEllipsisH,
  FaEdit,
  FaTrash,
  FaFileExport,
  FaFileImport,
} from "react-icons/fa";

import { IoIosArrowForward } from "react-icons/io";
import DataTable from "../../common/DataTable";
import "./categoryList.css";
import useOutsideClick from "../../../hooks/UseOutsideClick";
import { getImage } from "../../utils/images";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }
  return payload;
};

async function updateCategoryStatus(id, status) {
  const response = await fetch(
    `${API_BASE_URL}/admin/categories/${id}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: status,
      }),
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      payload?.message || `Request failed (${response.status})`
    );
  }
  return payload;
};

async function deleteCategory(id) {
  const response = await fetch(
    `${API_BASE_URL}/admin/categories/${id}`,
    {
      method: "DELETE",
    }
  );
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      payload?.message || `Request failed (${response.status})`
    );
  }
  return payload;
}

async function deleteSelectedCategories(catIds) {
  const response = await fetch(
    `${API_BASE_URL}/admin/categories/selected`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cat_id: catIds,
      }),
    }
  );
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      payload?.message || `Request failed (${response.status})`
    );
  }
  return payload;
};

async function importCategories(file) {
  const formData = new FormData();

  formData.append("csv_file", file);

  const response = await fetch(
    `${API_BASE_URL}/admin/categories/import`,
    {
      method: "POST",
      body: formData,
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload?.message || `Request failed (${response.status})`
    );
  }

  return payload;
};

const CategoryList = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [openActionId, setOpenActionId] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [statusCategory, setStatusCategory] = useState(null);

  // =========================================================
  // TEMPORARY CATEGORY DATA
  // Later API data will come here
  // =========================================================

  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================================================
  // CLOSE ACTION MENU WHEN CLICKING OUTSIDE
  // =========================================================

  useOutsideClick(".category-action-menu", () => {
    setOpenActionId(null);
  });

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchCategories();

      console.log("CATEGORY API RESPONSE:", response);
      console.log("CATEGORY DATA:", response?.data);

      const data = Array.isArray(response?.data) ? response.data : [];

      const formattedCategories = data.map((item) => ({
        id: item.id,
        name: item.category_name || "—",
        image: getImage(item.category_image),
        services: item.name || "—",
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
  // =========================================================
  // SELECT / UNSELECT CATEGORY
  // =========================================================

  const handleSelectCategory = (id) => {
    setSelectedCategories((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });
  };

  // =========================================================
  // DELETE SINGLE CATEGORY
  // =========================================================

 const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this category?"
  );

  if (!confirmed) return;

  try {
    const response = await deleteCategory(id);

    console.log("DELETE CATEGORY API RESPONSE:", response);

    setCategoryData((previous) =>
      previous.filter((category) => category.id !== id)
    );

    setSelectedCategories((previous) =>
      previous.filter((categoryId) => categoryId !== id)
    );

    setOpenActionId(null);
  } catch (error) {
    console.error("Delete category error:", error);
    alert(error.message || "Failed to delete category.");
  }
};

  // =========================================================
  // DELETE SELECTED
  // =========================================================

const handleDeleteSelected = async () => {
  if (selectedCategories.length === 0) return;

  const confirmed = window.confirm(
    `Are you sure you want to delete ${selectedCategories.length} selected category(s)?`
  );

  if (!confirmed) return;

  try {
    const response = await deleteSelectedCategories(selectedCategories);

    console.log(
      "DELETE SELECTED CATEGORIES API RESPONSE:",
      response
    );

    setCategoryData((previous) =>
      previous.filter(
        (category) => !selectedCategories.includes(category.id)
      )
    );

    setSelectedCategories([]);
  } catch (error) {
    console.error("Delete selected categories error:", error);
    alert(
      error.message || "Failed to delete selected categories."
    );
  }
};
  // =========================================================
  // EDIT CATEGORY
  // =========================================================

  const handleEdit = (id) => {
    setOpenActionId(null);

    console.log("Edit Category:", id);

    // Later:
    // navigate(`/category/edit/${id}`);

    navigate(`/edit_category/${id}`);
  };

  // =========================================================
  // STATUS
  // =========================================================

const handleStatusChange = async () => {
  if (!statusCategory) return;
  const newStatus =
    statusCategory.status === "Active" ? 0 : 1;
  try {
    const response = await updateCategoryStatus(
      statusCategory.id,
      newStatus
    );

    console.log("CATEGORY STATUS API RESPONSE:", response);
    setCategoryData((previous) =>
      previous.map((category) =>
        category.id === statusCategory.id
          ? {
              ...category,
              status: newStatus === 1 ? "Active" : "Inactive",
            }
          : category
      )
    );

    setStatusCategory(null);
  } catch (error) {
    console.error("Category status update error:", error);
    alert(error.message || "Failed to update category status.");
  }
};


  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

 const handleImportFile = async (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  try {
    console.log("Import file:", file);

    const response = await importCategories(file);

    console.log("IMPORT CATEGORY API RESPONSE:", response);

    alert(response.message || "Categories imported successfully.");

    // Refresh category list after successful import
    await loadCategories();
  } catch (error) {
    console.error("Import categories error:", error);

    alert(error.message || "Failed to import categories.");
  } finally {
    // Allow selecting the same file again
    event.target.value = "";
  }
};

  const handleExport = async () => {
    try {
      const XLSX = await import("xlsx");
      const exportData = categoryData.map((item, index) => ({
        "Sr. No.": index + 1,
        Name: item.name,
        Services: item.services,
        Status: item.status,
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
      XLSX.writeFile(workbook, "category-list.xlsx");
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please make sure the xlsx package is installed.");
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: "Select",
        width: "20px",
        sortable: false,
        render: (_, row) => (
          <input
            type="checkbox"
            className="category-checkbox"
            checked={selectedCategories.includes(row.id)}
            onChange={() => handleSelectCategory(row.id)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },
      {
        key: "serial",
        label: "Sr. No.",
        width: "40px",
        sortable: false,
        render: (_, row, rowIndex) => rowIndex + 1,
      },
      {
        key: "image",
        label: "Image",
        width: "50px",
        sortable: false,
        render: (value) => (
          <div className="category-image-wrapper">
            <img src={value} alt="Category" className="category-image" />
          </div>
        ),
      },
      {
        key: "name",
        label: "Name",
        width: "60px",
        sortable: true,
      },
      {
        key: "services",
        label: "Services",
        width: "60px",
        sortable: true,
      },
      {
        key: "status",
        label: "Status",
        width: "40px",
        sortable: true,
        render: (value, row) => (
          <button
            type="button"
            className={`category-status ${
              value === "Active"
                ? "category-status-active"
                : "category-status-inactive"
            }`}
            onClick={() => setStatusCategory(row)}
          >
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
          <div className="category-action-menu">
            <button
              type="button"
              className="category-three-dot-btn"
              onClick={(event) => {
                event.stopPropagation();
                setOpenActionId(openActionId === row.id ? null : row.id);
              }}
            >
              <FaEllipsisH />
            </button>
            {openActionId === row.id && (
              <div className="category-action-dropdown">
                <button type="button" onClick={() => handleEdit(row.id)}>
                  <FaEdit />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="category-delete-action"
                  onClick={() => {
                    setOpenActionId(null);
                    handleDelete(row.id);
                  }}
                >
                  <FaTrash />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [openActionId, selectedCategories],
  );

  return (
    <div className="category-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="category-page-header">
        <div>
          <h2 className="category-page-title">Category List</h2>
          <div className="category-breadcrumb">
            <Link to="/home">Home</Link>
            <span>
              <IoIosArrowForward />
            </span>
            <span className="category-breadcrumb-active">Category List</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="category-card">
        {/* CARD HEADER */}
        <div className="category-card-header">
          <h3>Category Management</h3>
          <div className="category-header-actions">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="category-hidden-file"
              onChange={handleImportFile}
            />

            {/* IMPORT */}

            <button
              type="button"
              className="category-import-btn"
              onClick={handleImportClick}
              title="Import Categories"
            >
              <FaFileImport />
              <span>Import</span>
            </button>
            {/* EXPORT */}
            <button
              type="button"
              className="category-export-btn"
              onClick={handleExport}
              title="Export Categories"
            >
              <FaFileExport />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="category-table-wrapper">
          <div className="category-table-wrapper">
            {loading && (
              <p className="category-loading">Loading categories...</p>
            )}

            {error && <div className="category-error">{error}</div>}

            {!loading && !error && (
              <DataTable
                columns={columns}
                data={categoryData}
                entriesPerPageOptions={[5, 10, 25, 50, 100]}
                defaultEntriesPerPage={10}
                searchable={true}
                sortable={true}
              />
            )}
          </div>
        </div>

        {/* ===================================================
            DELETE SELECTED
        =================================================== */}

        {selectedCategories.length > 0 && (
          <div className="category-selected-footer">
            <button
              type="button"
              className="category-delete-selected-btn"
              onClick={handleDeleteSelected}
            >
              <FaTrash />
              Delete Selected
              <span>({selectedCategories.length})</span>
            </button>
          </div>
        )}
      </div>

      {statusCategory && (
        <div className="category-status-modal-overlay">
          <div className="category-status-modal">
            <div className="category-status-modal-icon">!</div>

            <h3>Are you sure?</h3>

            <p>
              You want to{" "}
              <strong>
                {statusCategory.status === "Active" ? "deactivate" : "activate"}
              </strong>{" "}
              this category?
            </p>

            <div className="category-status-modal-actions">
              <button
                type="button"
                className="category-status-confirm-btn"
                onClick={handleStatusChange}
              >
                Yes,{" "}
                {statusCategory.status === "Active" ? "Deactivate" : "Activate"}
              </button>
              <button
                type="button"
                className="category-status-cancel-btn"
                onClick={() => setStatusCategory(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;