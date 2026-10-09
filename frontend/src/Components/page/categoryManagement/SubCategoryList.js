import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEllipsisH, FaEdit, FaTrash } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import DataTable from "../../common/DataTable";
import "./subCategoryList.css";
import useOutsideClick from "../../../hooks/UseOutsideClick";
import { getImage } from "../../utils/images";

const SubCategoryList = () => {
  const navigate = useNavigate();
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [openActionId, setOpenActionId] = useState(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [statusSubCategory, setStatusSubCategory] = useState(null);

  // =========================================================
  // TEMPORARY SUB CATEGORY DATA
  // Later API data will come here
  // =========================================================

  const [subCategoryData, setSubCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // CLOSE ACTION MENU WHEN CLICKING OUTSIDE
  // =========================================================

  useOutsideClick(".subcategory-action-menu", () => {
    setOpenActionId(null);
  });

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:5000/api/admin/sub-categories",
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch sub categories.");
        }

        const formattedData = result.data.map((item) => ({
          id: item.id,
          image: getImage(item.image),
          name: item.name,
          categoryName: item.category_name,
          status: Number(item.status) === 1 ? "Active" : "Inactive",
        }));

        setSubCategoryData(formattedData);
      } catch (error) {
        console.error("Fetch sub categories error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, []);

  // =========================================================
  // SELECT / UNSELECT SUB CATEGORY
  // =========================================================

  const handleSelectSubCategory = (id) => {
    setSelectedSubCategories((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });
  };

  // =========================================================
  // DELETE SINGLE SUB CATEGORY
  // =========================================================

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/sub-categories/${id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete sub category.");
      }

      setSubCategoryData((prevData) =>
        prevData.filter((item) => item.id !== id),
      );

      setSelectedSubCategories((prevSelected) =>
        prevSelected.filter((selectedId) => selectedId !== id),
      );

      setOpenActionId(null);

      console.log(result.message);
    } catch (error) {
      console.error("Delete sub category error:", error);
    }
  };

  // =========================================================
  // DELETE SELECTED
  // =========================================================

  const handleDeleteSelected = () => {
    if (selectedSubCategories.length === 0) {
      return;
    }

    // Only open confirmation modal
    setShowBulkDeleteModal(true);
  };

  // =========================================================
  // EDIT SUB CATEGORY
  // =========================================================

  const handleEdit = (id) => {
    setOpenActionId(null);

    console.log("Edit Sub Category:", id);

    navigate(`/edit_sub_category/${id}`);

    // API / edit page later
  };

  // =========================================================
  // STATUS CHANGE
  // =========================================================

const handleStatusChange = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/admin/sub-categories/${id}/status`,
      {
        method: "PUT",
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to change sub category status."
      );
    }

    setSubCategoryData((prevData) =>
      prevData.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                Number(result.data.status) === 1
                  ? "Active"
                  : "Inactive",
            }
          : item
      )
    );

    // Close popup after successful status change
    setStatusSubCategory(null);

  } catch (error) {
    console.error("Change sub category status error:", error);
  }
};

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: "Select",
        width: "50px",
        sortable: false,

        render: (_, row) => (
          <input
            type="checkbox"
            className="subcategory-checkbox"
            checked={selectedSubCategories.includes(row.id)}
            onChange={() => handleSelectSubCategory(row.id)}
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
        width: "80px",
        sortable: false,

        render: (value) => (
          <div className="subcategory-image-wrapper">
            <img src={value} alt="Sub Category" className="subcategory-image" />
          </div>
        ),
      },

      {
        key: "name",
        label: "Name",
        width: "100px",
        sortable: true,
      },

      {
        key: "categoryName",
        label: "Category Name",
        width: "100px",
        sortable: true,
      },

      {
        key: "status",
        label: "Status",
        width: "90px",
        sortable: true,

        render: (value, row) => (
          <button
            type="button"
            className={`subcategory-status ${
              value === "Active"
                ? "subcategory-status-active"
                : "subcategory-status-inactive"
            }`}
            onClick={() => setStatusSubCategory(row)}
          >
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
          <div className="subcategory-action-menu">
            <button
              type="button"
              className="subcategory-three-dot-btn"
              onClick={(event) => {
                event.stopPropagation();

                setOpenActionId(openActionId === row.id ? null : row.id);
              }}
            >
              <FaEllipsisH />
            </button>

            {openActionId === row.id && (
              <div className="subcategory-action-dropdown">
                <button type="button" onClick={() => handleEdit(row.id)}>
                  <FaEdit />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  className="subcategory-delete-action"
                  onClick={() => handleDelete(row.id)}
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
    [openActionId, selectedSubCategories],
  );

  const confirmDeleteSelected = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/sub-categories/selected",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sub_cat_id: selectedSubCategories,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete selected sub categories.",
        );
      }

      setSubCategoryData((prevData) =>
        prevData.filter((item) => !selectedSubCategories.includes(item.id)),
      );

      setSelectedSubCategories([]);
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error("Delete selected sub categories error:", error);
    }
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="subcategory-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="subcategory-page-header">
        <div>
          <h2 className="subcategory-page-title">Sub Category List</h2>

          <div className="subcategory-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="subcategory-breadcrumb-active">
              Sub Category List
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="subcategory-card">
        {/* CARD HEADER */}

        <div className="subcategory-card-header">
          <h3>Sub Category Management</h3>
        </div>

        {/* ===================================================
            DATATABLE
        =================================================== */}

        <div className="subcategory-table-wrapper">
          {loading ? (
            <div className="subcategory-loading">Loading sub categories...</div>
          ) : (
            <DataTable
              columns={columns}
              data={subCategoryData}
              entriesPerPageOptions={[5, 10, 25, 50, 100]}
              defaultEntriesPerPage={10}
              searchable={true}
              sortable={true}
            />
          )}
        </div>

        {/* ===================================================
            DELETE SELECTED
        =================================================== */}

        {selectedSubCategories.length > 0 && (
          <div className="subcategory-selected-footer">
            <button
              type="button"
              className="subcategory-delete-selected-btn"
              onClick={() => {
                console.log("DELETE SELECTED CLICKED");
                handleDeleteSelected();
              }}
              style={{
                position: "relative",
                zIndex: 1000000,
                pointerEvents: "auto",
                cursor: "pointer",
              }}
            >
              <FaTrash />
              Delete Selected
              <span>({selectedSubCategories.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* =====================================================
          STATUS MODAL
      ===================================================== */}

      {statusSubCategory && (
        <div className="subcategory-status-modal-overlay">
          <div className="subcategory-status-modal">
            <div className="subcategory-status-modal-icon">!</div>

            <h3>Are you sure?</h3>

            <p>
              You want to{" "}
              <strong>
                {statusSubCategory.status === "Active"
                  ? "deactivate"
                  : "activate"}
              </strong>{" "}
              this sub category?
            </p>

            <div className="subcategory-status-modal-actions">
              <button
                type="button"
                className="subcategory-status-confirm-btn"
                onClick={() => handleStatusChange(statusSubCategory.id)}
              >
                Yes,{" "}
                {statusSubCategory.status === "Active"
                  ? "Deactivate"
                  : "Activate"}
              </button>

              <button
                type="button"
                className="subcategory-status-cancel-btn"
                onClick={() => setStatusSubCategory(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showBulkDeleteModal && (
        <div className="subcategory-delete-modal-overlay">
          <div className="subcategory-delete-modal">
            <h3>Delete Selected Sub Categories?</h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedSubCategories.length}</strong> selected sub
              categor
              {selectedSubCategories.length === 1 ? "y" : "ies"}?
            </p>

            <div className="subcategory-delete-modal-actions">
              <button
                type="button"
                className="subcategory-delete-cancel-btn"
                onClick={() => setShowBulkDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="subcategory-delete-confirm-btn"
                onClick={confirmDeleteSelected}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategoryList;
