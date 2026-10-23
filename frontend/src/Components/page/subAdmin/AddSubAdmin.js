import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaFolder, FaCheck, FaTimes } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";

import api from "../../../config/api";
import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";

import "./addSubAdmin.css";

/* =========================================
   API SERVICE FUNCTIONS
   (kept inline; move to a service file later
   by cutting everything in this block)
========================================= */

const saveSubAdminRequest = async (payload) => {
  const response = await api.post("/admin/save_subadmin", payload);

  return response.data; // { success, message }
};

/* =========================================
   STATIC DATA
========================================= */

const ROLES = [
  "Marketing Manager",
  "Finance Associate",
  "Customer",
  "Employee",
  "Vendor",
];

const PERMISSION_GROUPS = [
  {
    title: "Core Management",
    permissions: ["Dashboard", "Sub Admin"],
  },
  {
    title: "User Management",
    permissions: ["Vendor Management", "User Management", "Expert Management"],
  },
  {
    title: "Content Management",
    permissions: [
      "Reviews",
      "Category Management",
      "Vendor Images Slider Images",
      "Home Sliders",
    ],
  },
  {
    title: "Business Operations",
    permissions: ["Booking", "Services", "Estimates", "Order Notification"],
  },
  {
    title: "System Settings",
    permissions: ["Settings", "Configuration"],
  },
  {
    title: "Marketing & Support",
    permissions: ["Offers", "Support"],
  },
];

const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((group) => group.permissions);

const TOTAL_PERMISSIONS = ALL_PERMISSIONS.length;

const EMPTY_FORM = {
  role: "",
  name: "",
  email: "",
  password: "",
  employeeSince: "",
};

/* =========================================
   COMPONENT
========================================= */

const AddSubAdmin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const selectedPercent = Math.round(
    (selectedPermissions.length / TOTAL_PERMISSIONS) * 100,
  );

  // =========================================
  // HANDLE INPUT CHANGE
  // =========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================
  // HANDLE PERMISSION CHANGE
  // =========================================

  const handlePermissionChange = (permission) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((item) => item !== permission);
      }

      return [...prev, permission];
    });
  };

  // =========================================
  // SELECT ALL
  // =========================================

  const handleSelectAll = () => {
    setSelectedPermissions(ALL_PERMISSIONS);
  };

  // =========================================
  // RESET
  // =========================================

  const handleReset = () => {
    setFormData(EMPTY_FORM);

    setSelectedPermissions([]);
  };

  // =========================================
  // SUCCESS MODAL CLOSE -> GO TO LIST
  // (useCallback keeps the auto-close timer from restarting on re-render)
  // =========================================

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);

    navigate("/subadmin_list");
  }, [navigate]);

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -----------------------------------------
    // Frontend validation
    // -----------------------------------------

    if (!formData.name.trim()) {
      toast.error("Admin name is required.");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required.");
      return;
    }

    if (!formData.password.trim()) {
      toast.error("Password is required.");
      return;
    }

    if (!formData.role) {
      toast.error("Please select a role.");
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission.");
      return;
    }

    try {
      setLoading(true);

      // -----------------------------------------
      // API REQUEST
      // -----------------------------------------

      const result = await saveSubAdminRequest({
        admin_name: formData.name.trim(),
        admin_email: formData.email.trim(),
        admin_password: formData.password,
        role_id: formData.role,
        permission: selectedPermissions,
        employee_since: formData.employeeSince || null,
      });

      // -----------------------------------------
      // SUCCESS
      // -----------------------------------------

      if (result.success) {
        setSuccessMessage(result.message || "Sub Admin added successfully.");

        handleReset();

        setShowSuccess(true);
      } else {
        toast.error(result.message || "Failed to add Sub Admin.");
      }
    } catch (error) {
      console.error("Add Sub Admin error:", error);

      toast.error(error.response?.data?.message || "Failed to add Sub Admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-subadmin-page">
      <Toaster position="top-right" />

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="add-subadmin-page-header">
        <h2>Add Subadmin</h2>

        <ServiceBreadcrumbs
          items={[
            { label: "Sub Admin List", to: "/subadmin_list" },
            { label: "Add New Admin" },
          ]}
        />
      </div>

      {/* =========================================
          MAIN CARD
      ========================================= */}

      <div className="add-subadmin-card">
        <div className="add-subadmin-card-header">
          <div>
            <h3>Add New Subadmin</h3>

            
          </div>

          <button type="button" onClick={() => navigate("/subadmin_list")}>
            Sub Admin List
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* =========================================
              BASIC FIELDS
          ========================================= */}

          <div className="form-grid">
            {/* ROLE */}

            <div className="form-group">
              <label htmlFor="asa-role">
                Roles <span>*</span>
              </label>

              <select
                id="asa-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">.. Select Role ..</option>

                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* NAME */}

            <div className="form-group">
              <label htmlFor="asa-name">
                Sub Admin Name <span>*</span>
              </label>

              <input
                id="asa-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Name"
                required
              />
            </div>

            {/* EMAIL */}

            <div className="form-group">
              <label htmlFor="asa-email">
                Email <span>*</span>
              </label>

              <input
                id="asa-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                required
              />
            </div>

            {/* PASSWORD */}

            <div className="form-group">
              <label htmlFor="asa-password">
                Password <span>*</span>
              </label>

              <input
                id="asa-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                autoComplete="new-password"
                required
              />
            </div>

            {/* EMPLOYEE SINCE */}

            <div className="form-group">
              <label htmlFor="asa-employee-since">
                Employee Since (Full Date)
              </label>

              <input
                id="asa-employee-since"
                type="date"
                name="employeeSince"
                value={formData.employeeSince}
                onChange={handleChange}
              />

              <small>Select the exact date when employee joined</small>
            </div>
          </div>

          {/* =========================================
              PERMISSIONS
          ========================================= */}

          <div className="permissions-box">
            <div className="permissions-title">
              <FaLock />

              <h3>Assign Permissions</h3>
            </div>

            <div className="permission-actions">
              <button
                type="button"
                className="permission-select-all"
                onClick={handleSelectAll}
              >
                <FaCheck /> Select All
              </button>

              <button
                type="button"
                className="permission-deselect-all"
                onClick={() => setSelectedPermissions([])}
              >
                <FaTimes /> Deselect All
              </button>
            </div>

            <div className="permissions-grid">
              {PERMISSION_GROUPS.map((group) => (
                <PermissionGroup
                  key={group.title}
                  title={group.title}
                  permissions={group.permissions}
                  selectedPermissions={selectedPermissions}
                  onPermissionChange={handlePermissionChange}
                />
              ))}
            </div>

            <div className="permission-count">
              <div className="permission-count-text">
                <strong>{selectedPermissions.length}</strong> out of{" "}
                <strong>{TOTAL_PERMISSIONS}</strong> permissions selected
              </div>

              <div className="permission-progress" aria-hidden="true">
                <span style={{ width: `${selectedPercent}%` }} />
              </div>
            </div>
          </div>

          {/* =========================================
              BUTTONS
          ========================================= */}

          <div className="add-subadmin-actions">
            <button
              type="submit"
              className="save-subadmin-btn"
              disabled={loading}
            >
              {loading && <span className="save-spinner" aria-hidden="true" />}
              {loading ? "Saving..." : "Save Sub Admin"}
            </button>

            <button
              type="button"
              className="reset-subadmin-btn"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* =========================================
          SUCCESS MODAL
      ========================================= */}

      <ServiceSuccessModal
        isOpen={showSuccess}
        title="Sub admin added"
        message={successMessage}
        onClose={handleSuccessClose}
      />
    </div>
  );
};

// =========================================
// PERMISSION GROUP
// =========================================

const PermissionGroup = ({
  title,
  permissions,
  selectedPermissions,
  onPermissionChange,
}) => {
  return (
    <div className="permission-group">
      <h4>
        <FaFolder />
        {title}
      </h4>

      {permissions.map((permission) => {
        const isChecked = selectedPermissions.includes(permission);

        return (
          <label
            key={permission}
            className={`permission-item${
              isChecked ? " permission-item--checked" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onPermissionChange(permission)}
            />

            <span>{permission}</span>
          </label>
        );
      })}
    </div>
  );
};

export default AddSubAdmin;