import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaUtensils,
} from "react-icons/fa";
import api from "../../../../config/api";
import DataTable from "../../../../Components/common/DataTable";
import "./menuList.css";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";
import Breadcrumbs from "../../common/BreadCrumbs";

const MenuList = () => {
  // =========================================================
  // MODAL STATE
  // =========================================================

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuModalMode, setMenuModalMode] = useState("add");
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuName, setMenuName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // =========================================================
  // MENU DATA
  // =========================================================

  const [menuData, setMenuData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // =========================================================
  // SELECTED ROWS
  // =========================================================

  const [selectedMenus, setSelectedMenus] = useState([]);

  // =========================================================
  // FETCH MENUS
  // =========================================================

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const response = await api.get("/restaurant/menus");

      const menus = response.data.data || [];

      setMenuData(
        menus.map((menu) => ({
          id: menu.id,
          menuName: menu.name,
          status: Number(menu.status) === 1,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch menus:", error);

      setLoadError(error.response?.data?.message || "Failed to load menus");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // =========================================================
  // SELECT / UNSELECT SINGLE MENU
  // =========================================================

  const handleSelectMenu = (id) => {
    setSelectedMenus((prev) =>
      prev.includes(id)
        ? prev.filter((menuId) => menuId !== id)
        : [...prev, id],
    );
  };

  // =========================================================
  // SELECT / UNSELECT ALL
  // =========================================================

  const handleSelectAll = () => {
    if (selectedMenus.length === menuData.length) {
      setSelectedMenus([]);
    } else {
      setSelectedMenus(menuData.map((menu) => menu.id));
    }
  };

  // =========================================================
  // STATUS TOGGLE
  // =========================================================

  const handleStatusChange = (id, nextStatus) => {
    setConfirmAction({
      type: "status",
      id,
      nextStatus,
    });

    setShowConfirmModal(true);
  };

  const confirmStatusChange = async () => {
    if (!confirmAction) return;

    const { id, nextStatus } = confirmAction;

    setConfirmLoading(true);

    try {
      await api.patch(`/restaurant/menus/${id}/status`, {
        status: nextStatus ? 1 : 0,
      });

      setMenuData((previous) =>
        previous.map((menu) =>
          menu.id === id ? { ...menu, status: nextStatus } : menu,
        ),
      );

      setShowConfirmModal(false);
      setConfirmAction(null);

      setSuccessMessage(
        nextStatus
          ? "Menu activated successfully."
          : "Menu deactivated successfully.",
      );

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setConfirmLoading(false);
    }
  };

  // =========================================================
  // OPEN ADD MENU MODAL
  // =========================================================

  const handleAddMenu = () => {
    setMenuModalMode("add");
    setEditingMenu(null);
    setMenuName("");
    setShowMenuModal(true);
  };

  // =========================================================
  // OPEN EDIT MENU MODAL
  // =========================================================

  const handleEdit = (menu) => {
    setMenuModalMode("edit");
    setEditingMenu(menu);
    setMenuName(menu.menuName);
    setShowMenuModal(true);
  };

  // =========================================================
  // CLOSE MENU MODAL
  // =========================================================

  const handleCloseMenuModal = () => {
    if (isSaving) return;

    setShowMenuModal(false);
    setMenuModalMode("add");
    setEditingMenu(null);
    setMenuName("");
  };

  // =========================================================
  // ADD / UPDATE MENU
  // =========================================================

  const handleMenuSubmit = async (e) => {
    e.preventDefault();

    const trimmedMenuName = menuName.trim();

    if (!trimmedMenuName) return;

    setIsSaving(true);

    try {
      if (menuModalMode === "edit" && editingMenu) {
        const response = await api.put(`/restaurant/menus/${editingMenu.id}`, {
          name: trimmedMenuName,
        });

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to update menu");
        }

        setMenuData((prev) =>
          prev.map((menu) =>
            menu.id === editingMenu.id
              ? {
                  ...menu,
                  menuName: trimmedMenuName,
                }
              : menu,
          ),
        );
      } else {
        const response = await api.post("/restaurant/menus", {
          name: trimmedMenuName,
        });

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to add menu");
        }

        const createdMenu = response.data.menu;

        setMenuData((prev) => [
          {
            id: createdMenu.id,
            menuName: createdMenu.name,
            status: Number(createdMenu.status) === 1,
          },
          ...prev,
        ]);
      }

      handleCloseMenuModal();
    } catch (error) {
      console.error("Save menu error:", error);
      console.error(
        error.response?.data?.message || error.message || "Failed to save menu",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================
  // DELETE SINGLE MENU
  // =========================================================

  const handleDelete = (id) => {
    setConfirmAction({
      type: "delete",
      id,
    });

    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!confirmAction) return;

    setConfirmLoading(true);

    try {
      await api.delete(`/restaurant/menus/${confirmAction.id}`);

      setMenuData((previous) =>
        previous.filter((menu) => menu.id !== confirmAction.id),
      );

      setSelectedMenus((previous) =>
        previous.filter((id) => id !== confirmAction.id),
      );

      setShowConfirmModal(false);
      setConfirmAction(null);

      setSuccessMessage("Menu deleted successfully.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Delete menu error:", error);
    } finally {
      setConfirmLoading(false);
    }
  };

  // =========================================================
  // DELETE SELECTED MENUS
  // =========================================================

  const handleBulkDelete = () => {
    if (selectedMenus.length === 0) return;

    setConfirmAction({
      type: "bulkDelete",
    });

    setShowConfirmModal(true);
  };

  const confirmBulkDelete = async () => {
    setConfirmLoading(true);

    try {
      await api.delete("/restaurant/menus/bulk", {
        data: {
          ids: selectedMenus,
        },
      });

      setMenuData((previous) =>
        previous.filter((menu) => !selectedMenus.includes(menu.id)),
      );

      setSelectedMenus([]);

      setShowConfirmModal(false);
      setConfirmAction(null);

      setSuccessMessage(
        `${selectedMenus.length} menu(s) deleted successfully.`,
      );

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Bulk delete error:", error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === "status") {
      confirmStatusChange();
    }

    if (confirmAction.type === "delete") {
      confirmDelete();
    }

    if (confirmAction.type === "bulkDelete") {
      confirmBulkDelete();
    }
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
            className="menu-checkbox"
            checked={
              menuData.length > 0 && selectedMenus.length === menuData.length
            }
            onChange={handleSelectAll}
            aria-label="Select all menus"
          />
        ),
        sortable: false,

        render: (_, row) => (
          <input
            type="checkbox"
            className="menu-checkbox"
            checked={selectedMenus.includes(row.id)}
            onChange={() => handleSelectMenu(row.id)}
            aria-label={`Select ${row.menuName}`}
          />
        ),
      },

      {
        key: "serial",
        label: "Sr.No",
        sortable: false,
      },

      {
        key: "menuName",
        label: "Menu Name",
        sortable: true,

        render: (_, row) => <span className="menu-name">{row.menuName}</span>,
      },

      {
        key: "status",
        label: "Status",
        sortable: true,

        render: (_, row) => (
          <button
            type="button"
            className={`menu-status-toggle ${
              row.status ? "active" : "inactive"
            }`}
            onClick={() => handleStatusChange(row.id, !row.status)}
            title={row.status ? "Click to deactivate" : "Click to activate"}
            aria-pressed={row.status}
            disabled={confirmLoading}
          >
            <span className="menu-status-knob">
              {row.status ? <FaCheck /> : <FaTimes />}
            </span>
          </button>
        ),
      },

      {
        key: "actions",
        label: "Action",
        sortable: false,

        render: (_, row) => (
          <div className="menu-action-buttons">
            <button
              type="button"
              className="menu-action-btn menu-edit-btn"
              title="Edit menu"
              onClick={() => handleEdit(row)}
              disabled={confirmLoading}
            >
              <FaEdit />
            </button>

            <button
              type="button"
              className="menu-action-btn menu-delete-btn"
              title="Delete menu"
              onClick={() => handleDelete(row.id)}
              disabled={confirmLoading}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    [menuData, selectedMenus, confirmLoading],
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
              label: "Menu List",
            },
          ]}
        />
      </div>
      <div className="menu-list-page">
        {/* PAGE HEADER */}
        <div className="menu-page-header">
          <div className="menu-page-title-wrapper">
            <div className="menu-title-icon">
              <FaUtensils />
            </div>

            <div>
              <h1 className="menu-page-title">Menu</h1>

              <p className="menu-page-subtitle">
                Manage your restaurant menus and their availability.
              </p>
            </div>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="menu-main-card">
          <div className="menu-card-header">
            <div className="menu-card-title-wrapper">
              <h2 className="menu-card-title">Total Menu</h2>

              <span className="menu-count-badge">{menuData.length}</span>
            </div>

            <button
              type="button"
              className="menu-add-btn"
              onClick={handleAddMenu}
            >
              <FaPlus />
              <span>Add Menu</span>
            </button>
          </div>

          {/* LOADING */}
          {isLoading ? (
            <div className="menu-empty-state">
              <div className="menu-empty-icon">
                <FaUtensils />
              </div>

              <h3>Loading menus...</h3>
              <p>Please wait while menus are being loaded.</p>
            </div>
          ) : loadError ? (
            /* ERROR */
            <div className="menu-empty-state">
              <div className="menu-empty-icon">
                <FaTimes />
              </div>

              <h3>Unable to load menus</h3>

              <p>{loadError}</p>

              <button
                type="button"
                className="menu-add-btn"
                onClick={fetchMenus}
              >
                Try Again
              </button>
            </div>
          ) : menuData.length === 0 ? (
            /* EMPTY */
            <div className="menu-empty-state">
              <div className="menu-empty-icon">
                <FaUtensils />
              </div>

              <h3>No menus yet</h3>

              <p>Create your first menu to start organizing your restaurant.</p>

              <button
                type="button"
                className="menu-add-btn"
                onClick={handleAddMenu}
              >
                <FaPlus />
                <span>Add Menu</span>
              </button>
            </div>
          ) : (
            /* TABLE */
            <div className="menu-table-wrapper">
              <DataTable
                columns={columns}
                data={menuData}
                entriesPerPageOptions={[10, 25, 50, 100]}
                searchable={true}
                sortable={true}
              />
            </div>
          )}

          {/* BULK DELETE */}
          {selectedMenus.length > 0 && (
            <div className="menu-bottom-action-bar">
              <div className="menu-selected-info">
                <span className="selected-dot"></span>

                <span>
                  {selectedMenus.length} menu
                  {selectedMenus.length > 1 ? "s" : ""} selected
                </span>
              </div>

              <button
                type="button"
                className="menu-bulk-delete-btn"
                onClick={handleBulkDelete}
                disabled={confirmLoading}
              >
                <FaTrash />

                <span>
                  {handleBulkDelete ? "Delete Selected" : "Deleting.."}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* ADD / EDIT MENU MODAL */}
        {showMenuModal && (
          <div
            className="menu-modal-overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseMenuModal();
              }
            }}
          >
            <div className="menu-edit-modal" role="dialog" aria-modal="true">
              <div className="menu-modal-header">
                <div>
                  <h3>{menuModalMode === "edit" ? "Edit Menu" : "Add Menu"}</h3>

                  <p>
                    {menuModalMode === "edit"
                      ? "Update the menu information below."
                      : "Create a new menu for your restaurant."}
                  </p>
                </div>

                <button
                  type="button"
                  className="menu-modal-close"
                  onClick={handleCloseMenuModal}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <form className="menu-modal-form" onSubmit={handleMenuSubmit}>
                <div className="menu-form-group">
                  <label htmlFor="menuName">
                    Menu Name <span>*</span>
                  </label>

                  <input
                    id="menuName"
                    type="text"
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    placeholder="Enter menu name"
                    autoFocus
                    disabled={isSaving}
                  />
                </div>

                <div className="menu-modal-footer">
                  <button
                    type="button"
                    className="menu-modal-cancel-btn"
                    onClick={handleCloseMenuModal}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="menu-modal-update-btn"
                    disabled={isSaving || !menuName.trim()}
                  >
                    {isSaving
                      ? "Saving..."
                      : menuModalMode === "edit"
                        ? "Update"
                        : "Add Menu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <ConfirmModal
          show={showConfirmModal}
          title={
            confirmAction?.type === "status"
              ? confirmAction.nextStatus
                ? "Activate Menu"
                : "Deactivate Menu"
              : confirmAction?.type === "bulkDelete"
                ? "Delete Selected Menus"
                : "Delete Menu"
          }
          message={
            confirmAction?.type === "status"
              ? confirmAction.nextStatus
                ? "Are you sure you want to activate this menu?"
                : "Are you sure you want to deactivate this menu?"
              : confirmAction?.type === "bulkDelete"
                ? `Are you sure you want to delete ${selectedMenus.length} selected menu(s)?`
                : "Are you sure you want to delete this menu?"
          }
          confirmText={
            confirmAction?.type === "status" ? "Yes, Change" : "Yes, Delete"
          }
          cancelText="Cancel"
          onConfirm={handleConfirmAction}
          onCancel={() => {
            if (!confirmLoading) {
              setShowConfirmModal(false);
              setConfirmAction(null);
            }
          }}
          loading={confirmLoading}
        />

        <SuccessModal
          show={showSuccessModal}
          title="Success!"
          message={successMessage}
          buttonText="OK"
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessMessage("");
          }}
        />
      </div>
    </>
  );
};

export default MenuList;