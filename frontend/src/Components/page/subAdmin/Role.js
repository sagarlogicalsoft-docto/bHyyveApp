import React, { useEffect, useMemo, useState } from "react";
import api from "../../../config/api";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaSyncAlt,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaUserTag,
  FaListUl,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

import DataTable from "../../common/DataTable";
import "./role.css";

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
  const [editRole, setEditRole] = useState(null);

  const [deleteRole, setDeleteRole] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editForm, setEditForm] = useState({
    role: "",
    responsibilities: "",
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/roles");

      if (response.data.success) {
        const formattedRoles = response.data.data.map((item) => ({
          id: item.id,
          role: item.role_name,
          responsibilities: item.responsibilities || "",
          status: Number(item.status) === 1 ? "Active" : "Inactive",
        }));

        setRoles(formattedRoles);
      } else {
        setError(response.data.message || "Failed to fetch roles.");
      }
    } catch (error) {
      console.error("Fetch roles error:", error);

      setError(error.response?.data?.message || "Unable to fetch roles.");
    } finally {
      setLoading(false);
    }
  };
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
    if (!editRole || !editForm.role.trim()) {
      return;
    }

    try {
      const response = await api.put(`/admin/roles/${editRole.id}`, {
        role_name: editForm.role.trim(),
        responsibilities: editForm.responsibilities.trim(),
      });

      if (response.data.success) {
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

        alert(response.data.message);
        setEditRole(null);
      } else {
        alert(response.data.message || "Failed to update role.");
      }
    } catch (error) {
      console.error("Update role error:", error);

      alert(error.response?.data?.message || "Failed to update role.");
    }
  };

  // -----------------------------------------
  // CHANGE STATUS
  // -----------------------------------------

  const handleStatusChange = async () => {
    if (!statusRole) {
      return;
    }

    try {
      const newStatus = statusRole.status === "Active" ? 0 : 1;

      const response = await api.put(`/admin/roles/${statusRole.id}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        setRoles((previousRoles) =>
          previousRoles.map((item) =>
            item.id === statusRole.id
              ? {
                  ...item,
                  status: newStatus === 1 ? "Active" : "Inactive",
                }
              : item,
          ),
        );

        alert(response.data.message);
        setStatusRole(null);
      } else {
        alert(response.data.message || "Failed to update status.");
      }
    } catch (error) {
      console.error("Update role status error:", error);

      alert(error.response?.data?.message || "Failed to update role status.");
    }
  };

  // -----------------------------------------
  // DELETE ROLE
  // -----------------------------------------

  const handleDelete = (role) => {
    setDeleteRole(role);
    setShowDeleteModal(true);
  };

const confirmDeleteRole = async () => {
  if (!deleteRole) return;

  try {
    const response = await api.delete(
      `/admin/roles/${deleteRole.id}/delete`
    );

    // Check successful API response
    if (
      response.data.success === true ||
      response.data.status === "success"
    ) {
      // Remove role from table
      setRoles((previousRoles) =>
        previousRoles.filter((item) => item.id !== deleteRole.id)
      );

      // Close modal immediately after successful deletion
      setShowDeleteModal(false);
      setDeleteRole(null);

      alert(response.data.message || "Role deleted successfully");
    } else {
      alert(response.data.message || "Failed to delete role.");
    }
  } catch (error) {
    console.error("Delete role error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to delete role."
    );
  }
};

  const cancelDeleteRole = () => {
    setDeleteRole(null);
    setShowDeleteModal(false);
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
        width: "100px",
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
        width: "100px",
        sortable: true,

        render: (value) => (
          <span
            className={`role-status-badge ${
              value === "Active" ? "role-status-active" : "role-status-inactive"
            }`}
          >
            {value === "Active" ? <FaCheckCircle /> : <FaTimesCircle />}

            {value}
          </span>
        ),
      },

      {
        key: "actions",
        label: "Actions",
        width: "100px",
        sortable: false,

        render: (_, row) => (
          <div className="role-action-buttons">
            {/* STATUS */}

            <button
              type="button"
              className="role-btn role-btn-status"
              onClick={() => setStatusRole(row)}
            >
              <FaSyncAlt />
              Status
            </button>

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
              onClick={() => handleDelete(row)}
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

  return (
    <div className="role-page">
      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="role-page-header">
        <div>
          <h1>Role Management</h1>

          <div className="role-breadcrumb">
            <Link to="/home">Home</Link>

            <span>/</span>

            <span>Role Management</span>
          </div>
        </div>
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

        {/* DATATABLE */}

        {loading ? (
          <div className="text-center py-4">Loading roles...</div>
        ) : error ? (
          <div className="text-center py-4 text-danger">{error}</div>
        ) : (
          <DataTable
            columns={columns}
            data={roles}
            entriesPerPageOptions={[10, 25, 50, 100]}
            searchable={true}
            sortable={true}
          />
        )}
      </section>

      {/* =========================================
          CHANGE STATUS MODAL
      ========================================= */}

      {statusRole && (
        <div className="role-modal-overlay" onClick={() => setStatusRole(null)}>
          <div
            className="role-status-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Change Status</h2>

            <div className="role-status-modal-icon">
              <FaTimes />
            </div>

            <p className="role-status-message">
              You are about to change status of role:
            </p>

            <strong className="role-status-role-name">
              "{statusRole.role}"
            </strong>

            <div className="role-status-information">
              <div className="role-status-row">
                <span>Current Status:</span>

                <span
                  className={`role-status-badge ${
                    statusRole.status === "Active"
                      ? "role-status-active"
                      : "role-status-inactive"
                  }`}
                >
                  {statusRole.status === "Active" ? (
                    <FaCheckCircle />
                  ) : (
                    <FaTimesCircle />
                  )}

                  {statusRole.status}
                </span>
              </div>

              <div className="role-status-row">
                <span>New Status:</span>

                <span
                  className={`role-status-badge ${
                    statusRole.status === "Active"
                      ? "role-status-inactive"
                      : "role-status-active"
                  }`}
                >
                  {statusRole.status === "Active" ? (
                    <FaTimesCircle />
                  ) : (
                    <FaCheckCircle />
                  )}

                  {statusRole.status === "Active" ? "Inactive" : "Active"}
                </span>
              </div>
            </div>

            <div className="role-modal-actions">
              <button
                type="button"
                className="role-modal-cancel"
                onClick={() => setStatusRole(null)}
              >
                <FaTimes />
                No, Cancel
              </button>

              <button
                type="button"
                className="role-modal-confirm"
                onClick={handleStatusChange}
              >
                <FaCheck />
                Yes, Change to{" "}
                {statusRole.status === "Active" ? "Inactive" : "Active"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          EDIT ROLE MODAL
      ========================================= */}

      {editRole && (
        <div className="role-modal-overlay" onClick={() => setEditRole(null)}>
          <div
            className="role-edit-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Edit Role</h2>

            {/* ROLE NAME */}

            <div className="role-form-group">
              <label>
                <FaUserTag />
                Role Name <span>*</span>
              </label>

              <input
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
              <label>
                <FaListUl />
                Responsibilities
              </label>

              <textarea
                name="responsibilities"
                value={editForm.responsibilities}
                onChange={handleEditChange}
                placeholder="Enter role responsibilities"
                maxLength={500}
              />

              <div className="role-character-count">
                {editForm.responsibilities.length} characters
              </div>
            </div>

            {/* MODAL BUTTONS */}

            <div className="role-edit-actions">
              <button
                type="button"
                className="role-update-button"
                onClick={handleUpdateRole}
              >
                <FaCheck />
                Update
              </button>

              <button
                type="button"
                className="role-cancel-button"
                onClick={() => setEditRole(null)}
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && deleteRole && (
        <div className="role-modal-overlay">
          <div className="role-confirm-modal">
            <h2>Delete Role</h2>

            <div className="role-delete-icon">
              <FaTrash />
            </div>

            <p>Are you sure you want to delete this role?</p>

            <strong>"{deleteRole.role}"</strong>

            <div className="role-modal-actions">
              <button
                type="button"
                className="role-cancel-btn"
                onClick={cancelDeleteRole}
              >
                <FaTimes />
                No, Cancel
              </button>

              <button
                type="button"
                className="role-delete-confirm-btn"
                onClick={confirmDeleteRole}
              >
                <FaTrash />
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Role;
