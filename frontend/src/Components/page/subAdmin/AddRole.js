import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import "./addRole.css";
import api from "../../../config/api";

const AddRole = () => {
  const [roles, setRoles] = useState([]);

  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // -----------------------------------------
  // FETCH ROLES
  // -----------------------------------------

  const fetchRoles = async () => {
    try {
      setFetchLoading(true);

      const response = await api.get("/admin/roles");

      if (response.data.success) {
        setRoles(
          response.data.data.map((item) => ({
            id: item.id,
            name: item.role_name,
            description: item.responsibilities || "",
          })),
        );
      }
    } catch (error) {
      console.error("Fetch roles error:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // -----------------------------------------
  // ADD ROLE
  // -----------------------------------------

  const handleAddRole = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) return;

    try {
      setLoading(true);

      const response = await api.post("/admin/roles", {
        role_name: roleName.trim(),
        responsibilities: description.trim(),
        status: 1,
      });

      if (response.data.success) {
        alert(response.data.message);

        setRoleName("");
        setDescription("");

        // Refresh list so newly added role appears
        fetchRoles();
      } else {
        alert(response.data.message || "Failed to add role.");
      }
    } catch (error) {
      console.error("Add role error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to add role. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-page">

      <div className="role-header">
        <div>
          <h2>Roles</h2>
          <p>Manage administrator roles</p>
        </div>
      </div>

      <div className="role-card">

        <div className="role-card-title">
          <h3>Create Role</h3>
        </div>

        <form onSubmit={handleAddRole} className="role-form">

          <div className="role-field">
            <label>
              Role Name <span>*</span>
            </label>

            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Enter role name"
              required
              disabled={loading}
            />
          </div>

          <div className="role-field">
            <label>Description</label>

            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter role description"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="role-save-btn"
            disabled={loading}
          >
            <FaPlus />
            {loading ? "Adding..." : "Add Role"}
          </button>

        </form>

      </div>

      <div className="role-card">

        <div className="role-card-title">
          <h3>All Roles</h3>
        </div>

        <div className="role-table-wrapper">

          {fetchLoading ? (
            <div>Loading roles...</div>
          ) : (
            <table className="role-table">

              <thead>
                <tr>
                  <th>No.</th>
                  <th>Role Name</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                {roles.map((role, index) => (
                  <tr key={role.id}>
                    <td>{index + 1}</td>
                    <td>{role.name}</td>
                    <td>{role.description || "-"}</td>
                  </tr>
                ))}

                {roles.length === 0 && (
                  <tr>
                    <td colSpan="3">No roles found.</td>
                  </tr>
                )}
              </tbody>

            </table>
          )}

        </div>

      </div>

    </div>
  );
};

export default AddRole;