import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimesCircle,
  FaUserTag,
  FaListUl,
  FaTimes,
  FaCheck,
  FaRedo,
} from "react-icons/fa";

import api from "../../../config/api";
import DataTable from "../../common/DataTable";
import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";
import ServiceConfirmModal from "../../common/modal/serviceModal/ServiceConfirmModal";
import "./role.css";

/* =========================================
   API SERVICE FUNCTIONS
   (kept inline; move to a service file later
   by cutting everything in this block)
========================================= */

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const mapRole = (item) => ({
  id: item.id,
  role: item.role_name,
  responsibilities: item.responsibilities || "",
  status: Number(item.status) === 1 ? "Active" : "Inactive",
});

const fetchRolesRequest = async () => {
  const response = await api.get("/admin/roles");

  return response.data; // { success, message, data: [] }
};

const updateRoleRequest = async (id, payload) => {
  const response = await api.put(`/admin/roles/${id}`, payload);

  return response.data; // { success, message }
};

const updateRoleStatusRequest = async (id, status) => {
  const response = await api.put(`/admin/roles/${id}/status`, { status });

  return response.data; // { success, message }
};

const deleteRoleRequest = async (id) => {
  const response = await api.delete(`/admin/roles/${id}/delete`);

  return response.data; // { success | status, message }
};

/* =========================================
   COMPONENT
========================================= */

const Role = () => {
  // -----------------------------------------
  // ROLE DATA
  // -----------------------------------------

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------------------
  // MODAL STATES
  // -----------------------------------------

  const [statusRole, setStatusRole] = useState(null);
  const [deleteRole, setDeleteRole] = useState(null);
  const [editRole, setEditRole] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // success modal: { title, message } | null
  const [successInfo, setSuccessInfo] = useState(null);

  const [editForm, setEditForm] = useState({
    role: "",
    responsibilities: "",
  });

  // -----------------------------------------
  // LOAD ROLES
  // -----------------------------------------

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await fetchRolesRequest();

      if (result.success) {
        setRoles(result.data.map(mapRole));
      } else {
        setError(result.message || "Failed to fetch roles.");
      }
    } catch (err) {
      console.error("Fetch roles error:", err);

      setError(getErrorMessage(err, "Unable to fetch roles."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // -----------------------------------------
  // CLOSE EDIT MODAL WITH ESCAPE
  // -----------------------------------------

  useEffect(() => {
    if (!editRole) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isUpdating) {
        setEditRole(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [editRole, isUpdating]);

  // useCallback keeps the success auto-close timer from restarting on re-render
  const handleSuccessClose = useCallback(() => setSuccessInfo(null), []);

  // -----------------------------------------
  // OPEN EDIT MODAL
  // -----------------------------------------

  const handleEdit = (role) => {
    setEditRole(role);

    setEditForm({
      role: role.role,
      responsibilities: role.responsibilities || "",
    });
  };

  // -----------------------------------------
  // EDIT FORM CHANGE
  // -----------------------------------------

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // -----------------------------------------
  // UPDATE ROLE
  // -----------------------------------------

  const handleUpdateRole = async () => {
    if (!editRole) {
      return;
    }

    if (!editForm.role.trim()) {
      toast.error("Role name is required.");
      return;
    }

    try {
      setIsUpdating(true);

      const result = await updateRoleRequest(editRole.id, {
        role_name: editForm.role.trim(),
        responsibilities: editForm.responsibilities.trim(),
      });

      if (result.success) {
        setRoles((previousRoles) =>
          previousRoles.map((item) =>
            item.id === editRole.id
              ? {
                  ...item,
                  role: editForm.role.trim(),
                  responsibilities: editForm.responsibilities.trim(),
                }
              : item,
          ),
        );

        setEditRole(null);

        setSuccessInfo({
          title: "Role updated",
          message: result.message || "Role updated successfully.",
        });
      } else {
        toast.error(result.message || "Failed to update role.");
      }
    } catch (err) {
      console.error("Update role error:", err);

      toast.error(getErrorMessage(err, "Failed to update role."));
    } finally {
      setIsUpdating(false);
    }
  };

  // -----------------------------------------
  // CHANGE STATUS (runs when confirm modal is accepted)
  // -----------------------------------------

  const handleStatusChange = async () => {
    if (!statusRole) {
      return;
    }

    const newStatus = statusRole.status === "Active" ? 0 : 1;

    try {
      const result = await updateRoleStatusRequest(statusRole.id, newStatus);

      if (result.success) {
        setRoles((previousRoles) =>
          previousRoles.map((item) =>
            item.id === statusRole.id
              ? { ...item, status: newStatus === 1 ? "Active" : "Inactive" }
              : item,
          ),
        );

        setSuccessInfo({
          title: newStatus === 1 ? "Role activated" : "Role deactivated",
          message: result.message || "Status updated successfully.",
        });
      } else {
        toast.error(result.message || "Failed to update status.");
      }
    } catch (err) {
      console.error("Update role status error:", err);

      toast.error(getErrorMessage(err, "Failed to update role status."));
    } finally {
      setStatusRole(null);
    }
  };

  // -----------------------------------------
  // DELETE ROLE (runs when confirm modal is accepted)
  // -----------------------------------------

  const confirmDeleteRole = async () => {
    if (!deleteRole) {
      return;
    }

    try {
      const result = await deleteRoleRequest(deleteRole.id);

      // Check successful API response
      if (result.success === true || result.status === "success") {
        // Remove role from table
        setRoles((previousRoles) =>
          previousRoles.filter((item) => item.id !== deleteRole.id),
        );

        setSuccessInfo({
          title: "Role deleted",
          message: result.message || "Role deleted successfully.",
        });
      } else {
        toast.error(result.message || "Failed to delete role.");
      }
    } catch (err) {
      console.error("Delete role error:", err);

      toast.error(getErrorMessage(err, "Failed to delete role."));
    } finally {
      setDeleteRole(null);
    }
  };

  // -----------------------------------------
  // TABLE COLUMNS
  // -----------------------------------------

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "Sr.No",
        width: "50px",
        sortable: false,

        render: (_, row, rowIndex) => rowIndex + 1,
      },

      {
        key: "role",
        label: "Role",
        width: "100px",
        sortable: true,
      },

      {
        key: "responsibilities",
        label: "Responsibilities",
        width: "120px",
        sortable: true,

        render: (value) =>
          value ? (
            <span className="role-responsibilities">{value}</span>
          ) : (
            <span className="role-no-responsibility">
              — No responsibilities defined —
            </span>
          ),
      },

      {
        key: "status",
        label: "Status",
        width: "60px",
        sortable: true,

        // clicking the badge opens the status confirmation
        render: (value, row) => (
          <button
            type="button"
            className={`role-status-badge ${
              value === "Active"
                ? "role-status-badge-active"
                : "role-status-badge-inactive"
            }`}
            title={
              value === "Active" ? "Click to deactivate" : "Click to activate"
            }
            onClick={() => setStatusRole(row)}
          >
            <span className="role-status-dot" />

            {value}
          </button>
        ),
      },

      {
        key: "actions",
        label: "Actions",
        width: "80px",
        sortable: false,

        render: (_, row) => (
          <div className="role-action-buttons">
            {/* EDIT */}

            <button
              type="button"
              className="role-btn role-btn-edit"
              onClick={() => handleEdit(row)}
            >
              <FaEdit />
              Edit
            </button>

            {/* DELETE */}

            <button
              type="button"
              className="role-btn role-btn-delete"
              onClick={() => setDeleteRole(row)}
            >
              <FaTrash />
              Delete
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const deactivating = statusRole?.status === "Active";

  return (
    <div className="role-page">
      <Toaster position="top-right" />

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="role-page-header">
        <h1>Role Management</h1>

        <ServiceBreadcrumbs items={[{ label: "Role Management" }]} />
      </div>

      {/* =========================================
          ROLE LIST CARD
      ========================================= */}

      <section className="role-card">
        {/* HEADER */}

        <div className="role-card-header">
          <h2>Roles List</h2>

          <Link to="/subadmin/add_role" className="add-role-button">
            <FaPlus />
            Add New Role
          </Link>
        </div>

        {/* DATATABLE / STATES */}

        {loading ? (
          <div className="role-state" role="status">
            <span className="role-spinner" />
            <p>Loading roles...</p>
          </div>
        ) : error ? (
          <div className="role-state role-state-error" role="alert">
            <FaTimesCircle className="role-state-icon" />
            <p>{error}</p>

            <button
              type="button"
              className="role-retry-btn"
              onClick={fetchRoles}
            >
              <FaRedo />
              Try again
            </button>
          </div>
        ) : (
          <div className="role-table-wrapper">
            <DataTable
              columns={columns}
              data={roles}
              entriesPerPageOptions={[10, 25, 50, 100]}
              searchable={true}
              sortable={true}
            />
          </div>
        )}
      </section>

      {/* =========================================
          CHANGE STATUS CONFIRM
      ========================================= */}

      <ServiceConfirmModal
        isOpen={Boolean(statusRole)}
        variant={deactivating ? "warning" : "success"}
        title={deactivating ? "Deactivate this role?" : "Activate this role?"}
        message={
          statusRole
            ? `"${statusRole.role}" will change from ${statusRole.status} to ${
                deactivating ? "Inactive" : "Active"
              }.`
            : ""
        }
        confirmText={deactivating ? "Yes, deactivate" : "Yes, activate"}
        onConfirm={handleStatusChange}
        onCancel={() => setStatusRole(null)}
      />

      {/* =========================================
          DELETE CONFIRM
      ========================================= */}

      <ServiceConfirmModal
        isOpen={Boolean(deleteRole)}
        variant="danger"
        title="Delete role?"
        message={
          deleteRole
            ? `"${deleteRole.role}" will be removed and this can't be undone.`
            : ""
        }
        confirmText="Yes, delete"
        onConfirm={confirmDeleteRole}
        onCancel={() => setDeleteRole(null)}
      />

      {/* =========================================
          SUCCESS MODAL
      ========================================= */}

      <ServiceSuccessModal
        isOpen={Boolean(successInfo)}
        title={successInfo?.title}
        message={successInfo?.message}
        onClose={handleSuccessClose}
      />

      {/* =========================================
          EDIT ROLE MODAL
      ========================================= */}

      {editRole && (
        <div
          className="role-modal-overlay"
          onClick={() => !isUpdating && setEditRole(null)}
        >
          <div
            className="role-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-edit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="role-edit-title">Edit Role</h2>

            {/* ROLE NAME */}

            <div className="role-form-group">
              <label htmlFor="role-edit-name">
                <FaUserTag />
                Role Name <span>*</span>
              </label>

              <input
                id="role-edit-name"
                type="text"
                name="role"
                value={editForm.role}
                onChange={handleEditChange}
                placeholder="Enter role name"
                maxLength={100}
              />
            </div>

            {/* RESPONSIBILITIES */}

            <div className="role-form-group">
              <label htmlFor="role-edit-responsibilities">
                <FaListUl />
                Responsibilities
              </label>

              <textarea
                id="role-edit-responsibilities"
                name="responsibilities"
                value={editForm.responsibilities}
                onChange={handleEditChange}
                placeholder="Enter role responsibilities"
                maxLength={500}
              />

              <div className="role-character-count">
                {editForm.responsibilities.length}/500 characters
              </div>
            </div>

            {/* MODAL BUTTONS */}

            <div className="role-edit-actions">
              <button
                type="button"
                className="role-cancel-button"
                onClick={() => setEditRole(null)}
                disabled={isUpdating}
              >
                <FaTimes />
                Cancel
              </button>

              <button
                type="button"
                className="role-update-button"
                onClick={handleUpdateRole}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <span className="role-btn-spinner" aria-hidden="true" />
                ) : (
                  <FaCheck />
                )}
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Role;