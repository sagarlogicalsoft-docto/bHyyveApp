import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaPlus, FaSearch, FaExclamationCircle } from "react-icons/fa";
import "./addRole.css";
import api from "../../../config/api";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";

/* -----------------------------------------
   API SERVICE FUNCTIONS
   (kept inline; move to a service layer later
   without touching the component below)
----------------------------------------- */

const getRolesApi = async () => {
  const response = await api.get("/admin/roles");
  return response.data;
};

const createRoleApi = async (payload) => {
  const response = await api.post("/admin/roles", payload);
  return response.data;
};

const mapRole = (item) => ({
  id: item.id,
  name: item.role_name,
  description: item.responsibilities || "",
});

const AddRole = () => {
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [notice, setNotice] = useState(null); // error notice: { type: "error", text }
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: "" });

  // Stable reference so the modal's auto-close timer is not reset on every render
  const closeSuccessModal = useCallback(
    () => setSuccessModal({ isOpen: false, message: "" }),
    [],
  );

  // -----------------------------------------
  // FETCH ROLES
  // -----------------------------------------

  const fetchRoles = useCallback(async () => {
    try {
      setFetchLoading(true);
      setFetchError("");

      const data = await getRolesApi();

      if (data.success) {
        setRoles(data.data.map(mapRole));
      } else {
        setFetchError(data.message || "Could not load roles.");
      }
    } catch (error) {
      console.error("Fetch roles error:", error);
      setFetchError(
        error.response?.data?.message || "Could not load roles. Please try again.",
      );
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Auto-dismiss notice
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // -----------------------------------------
  // ADD ROLE
  // -----------------------------------------

  const handleAddRole = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) return;

    try {
      setLoading(true);
      setNotice(null);

      const data = await createRoleApi({
        role_name: roleName.trim(),
        responsibilities: description.trim(),
        status: 1,
      });

      if (data.success) {
        setSuccessModal({
          isOpen: true,
          message: data.message || "The role was added successfully.",
        });
        setRoleName("");
        setDescription("");
        fetchRoles();
      } else {
        setNotice({ type: "error", text: data.message || "Failed to add role." });
      }
    } catch (error) {
      console.error("Add role error:", error);
      setNotice({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to add role. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // FILTER
  // -----------------------------------------

  const filteredRoles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return roles;
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(term) ||
        role.description.toLowerCase().includes(term),
    );
  }, [roles, search]);

  return (
    <div className="role-page">
      <div className="role-header">
        <h2>Roles</h2>
        <p>Create and review the roles your administrators can hold.</p>
      </div>

      {notice && (
        <div className={`role-notice role-notice-${notice.type}`} role="status" aria-live="polite">
          <FaExclamationCircle />
          <span>{notice.text}</span>
        </div>
      )}

      <section className="role-card">
        <div className="role-card-title">
          <h3>Create role</h3>
        </div>

        <form onSubmit={handleAddRole} className="role-form">
          <div className="role-field">
            <label htmlFor="role-name">
              Role name <span>*</span>
            </label>
            <input
              id="role-name"
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Content manager"
              required
              disabled={loading}
            />
          </div>

          <div className="role-field">
            <label htmlFor="role-description">Description</label>
            <input
              id="role-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this role responsible for?"
              disabled={loading}
            />
          </div>

          <button type="submit" className="role-save-btn" disabled={loading || !roleName.trim()}>
            <FaPlus />
            {loading ? "Adding..." : "Add role"}
          </button>
        </form>
      </section>

      <section className="role-card">
        <div className="role-card-title role-card-title-row">
          <h3>
            All roles
            {!fetchLoading && !fetchError && (
              <span className="role-count">{roles.length}</span>
            )}
          </h3>

          <div className="role-search">
            <FaSearch />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles"
              aria-label="Search roles"
            />
          </div>
        </div>

        <div className="role-table-wrapper">
          {fetchLoading ? (
            <div className="role-state">
              <div className="role-spinner" />
              <span>Loading roles...</span>
            </div>
          ) : fetchError ? (
            <div className="role-state role-state-error">
              <span>{fetchError}</span>
              <button type="button" className="role-retry-btn" onClick={fetchRoles}>
                Try again
              </button>
            </div>
          ) : (
            <table className="role-table">
              <thead>
                <tr>
                  <th className="role-col-no">No.</th>
                  <th>Role name</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                {filteredRoles.map((role, index) => (
                  <tr key={role.id}>
                    <td className="role-col-no">{index + 1}</td>
                    <td className="role-name-cell">{role.name}</td>
                    <td>{role.description || "-"}</td>
                  </tr>
                ))}

                {filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan="3" className="role-empty">
                      {search.trim()
                        ? "No roles match your search."
                        : "No roles yet. Create your first role above."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <ServiceSuccessModal
        isOpen={successModal.isOpen}
        title="Role added"
        message={successModal.message}
        buttonText="Done"
        onClose={closeSuccessModal}
      />
    </div>
  );
};

export default AddRole;