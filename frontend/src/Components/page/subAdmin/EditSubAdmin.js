import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./editSubAdmin.css";
import api from "../../../config/api";
import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";

// ---------------------------------------------------------------------------
// FETCH SUB ADMIN
// ---------------------------------------------------------------------------
const fetchSubAdmin = async (subAdminId) => {
  const response = await api.get(`/admin/subadmins/${subAdminId}`);

  return response.data;
};

// ---------------------------------------------------------------------------
// UPDATE SUB ADMIN
// ---------------------------------------------------------------------------
const updateSubAdmin = async (subAdminId, payload) => {
  const response = await api.put(`/admin/subadmins/${subAdminId}`, payload);

  return response.data;
};

// ---------------------------------------------------------------------------
// PERMISSION GROUPS
// ---------------------------------------------------------------------------
const PERMISSION_GROUPS = [
  {
    title: "Core Management",
    permissions: [
      { key: "dashboard", label: "Dashboard" },
      { key: "sub_admin", label: "Sub Admin" },
    ],
  },

  {
    title: "User Management",
    permissions: [
      { key: "vendor_management", label: "Vendor Management" },
      { key: "user_management", label: "User Management" },
      { key: "expert_management", label: "Expert Management" },
    ],
  },

  {
    title: "Content Management",
    permissions: [
      { key: "reviews", label: "Reviews" },
      { key: "category_management", label: "Category Management" },
      {
        key: "vendor_images_slider_images",
        label: "Vendor Images Slider Images",
      },
      { key: "home_sliders", label: "Home Sliders" },
    ],
  },

  {
    title: "Business Operations",
    permissions: [
      { key: "booking", label: "Booking" },
      { key: "services", label: "Services" },
      { key: "estimates", label: "Estimates" },
      { key: "order_notification", label: "Order Notification" },
    ],
  },

  {
    title: "System Settings",
    permissions: [
      { key: "manage_time_slots", label: "Manage Time Slots" },
      { key: "revenue_management", label: "Revenue Management" },
      { key: "offers", label: "Offers" },
      { key: "coupon_codes", label: "Coupon Codes" },
    ],
  },

  {
    title: "Marketing & Support",
    permissions: [
      { key: "advertisement", label: "Advertisement" },
      { key: "cities", label: "Cities" },
      { key: "help_support", label: "Help & Support" },
    ],
  },
];

const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((group) => group.permissions);

const TOTAL_PERMISSIONS = ALL_PERMISSIONS.length;

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
export default function EditSubAdmin() {
  const navigate = useNavigate();

  // IMPORTANT:
  // ID comes from /subadmin/edit/:id
  const { id: subAdminId } = useParams();

  // -------------------------------------------------------------------------
  // ROLES
  // -------------------------------------------------------------------------
  const [roles] = useState([
    {
      value: "1",
      label: "Marketing Manager",
    },
    {
      value: "2",
      label: "Finance Associate",
    },
    {
      value: "3",
      label: "Customer",
    },
    {
      value: "4",
      label: "Employee",
    },
    {
      value: "5",
      label: "Vendor",
    },
  ]);

  // -------------------------------------------------------------------------
  // FORM DATA
  // -------------------------------------------------------------------------
  const [formData, setFormData] = useState({
    role: "",
    name: "",
    email: "",
    password: "",
    employeeSince: "",
  });

  // -------------------------------------------------------------------------
  // PERMISSIONS
  // -------------------------------------------------------------------------
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // -------------------------------------------------------------------------
  // SUCCESS MODAL
  // -------------------------------------------------------------------------
  const [showSuccess, setShowSuccess] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  // -------------------------------------------------------------------------
  // LIST PAGE
  // -------------------------------------------------------------------------
  const handleListSubAdmin = () => {
    navigate("/subadmin_list");
  };

  // -------------------------------------------------------------------------
  // SUCCESS MODAL CLOSE -> GO TO LIST
  // (useCallback keeps the auto-close timer from restarting on re-render)
  // -------------------------------------------------------------------------
  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);

    navigate("/subadmin_list");
  }, [navigate]);

  // -------------------------------------------------------------------------
  // LOAD SUB ADMIN
  // -------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const loadSubAdmin = async () => {
      if (!subAdminId) {
        setErrorMessage("Sub Admin ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        console.log("Loading Sub Admin ID:", subAdminId);

        const response = await fetchSubAdmin(subAdminId);

        console.log("Edit Sub Admin API Response:", response);

        if (!isMounted) {
          return;
        }

        if (!response.success) {
          throw new Error(response.message || "Failed to fetch sub admin.");
        }

        // Your backend response is expected to be:
        //
        // {
        //   success: true,
        //   data: {
        //      admin_id,
        //      admin_name,
        //      admin_email,
        //      role_id,
        //      employee_since,
        //      permission
        //   }
        // }

        const subAdmin = response.data;

        if (!subAdmin) {
          throw new Error("Sub admin data not found.");
        }

        // -------------------------------------------------------------------
        // SET BASIC INFORMATION
        // -------------------------------------------------------------------
        setFormData({
          role: String(subAdmin.role_id ?? ""),
          name: subAdmin.admin_name ?? "",
          email: subAdmin.admin_email ?? "",
          password: "",
          employeeSince: subAdmin.employee_since
            ? String(subAdmin.employee_since).substring(0, 10)
            : "",
        });

        // -------------------------------------------------------------------
        // SET PERMISSIONS
        // -------------------------------------------------------------------

        let permissions = [];

        if (Array.isArray(subAdmin.permission)) {
          permissions = subAdmin.permission;
        } else if (typeof subAdmin.permission === "string") {
          permissions = subAdmin.permission
            .split(",")
            .map((permission) => permission.trim())
            .filter(Boolean);
        }

        console.log("Existing Permissions:", permissions);

        const permissionKeys = permissions
          .map((permission) => {
            const foundPermission = ALL_PERMISSIONS.find(
              (item) => item.label.toLowerCase() === permission.toLowerCase(),
            );

            return foundPermission?.key;
          })
          .filter(Boolean);

        console.log("Permission Keys:", permissionKeys);

        setSelectedPermissions(new Set(permissionKeys));
      } catch (error) {
        console.error("Load Sub Admin Error:", error);

        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Failed to load sub admin details.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSubAdmin();

    return () => {
      isMounted = false;
    };
  }, [subAdminId]);

  // -------------------------------------------------------------------------
  // FIELD CHANGE
  // -------------------------------------------------------------------------
  const handleFieldChange = (field) => (event) => {
    setFormData((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  // -------------------------------------------------------------------------
  // TOGGLE PERMISSION
  // -------------------------------------------------------------------------
  const togglePermission = (key) => {
    setSelectedPermissions((previous) => {
      const next = new Set(previous);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  // -------------------------------------------------------------------------
  // SELECT ALL
  // -------------------------------------------------------------------------
  const selectAllPermissions = () => {
    setSelectedPermissions(
      new Set(ALL_PERMISSIONS.map((permission) => permission.key)),
    );
  };

  // -------------------------------------------------------------------------
  // DESELECT ALL
  // -------------------------------------------------------------------------
  const deselectAllPermissions = () => {
    setSelectedPermissions(new Set());
  };

  // -------------------------------------------------------------------------
  // SUBMIT / UPDATE
  // -------------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!subAdminId) {
        setErrorMessage("Sub Admin ID is missing.");
        return;
      }

      try {
        setIsSaving(true);
        setErrorMessage("");

        // ---------------------------------------------------------------
        // CONVERT PERMISSION KEYS TO LABELS
        // ---------------------------------------------------------------
        const permissionLabels = Array.from(selectedPermissions)
          .map((key) => {
            const permission = ALL_PERMISSIONS.find((item) => item.key === key);

            return permission?.label;
          })
          .filter(Boolean);

        // ---------------------------------------------------------------
        // UPDATE PAYLOAD
        // ---------------------------------------------------------------
        const payload = {
          admin_name: formData.name.trim(),
          admin_email: formData.email.trim(),
          role_id: formData.role === "" ? null : formData.role,
          permission: permissionLabels,
          employee_since: formData.employeeSince || null,
        };

        // Only send password if admin entered a new password.
        if (formData.password.trim()) {
          payload.admin_password = formData.password;
        }

        console.log("Updating Sub Admin:", subAdminId);
        console.log("Update Payload:", payload);

        const result = await updateSubAdmin(subAdminId, payload);

        console.log("Update Response:", result);

        if (result.success) {
          setSuccessMessage(
            result.message || "Sub Admin updated successfully.",
          );

          setShowSuccess(true);
        } else {
          setErrorMessage(result.message || "Failed to update sub admin.");
        }
      } catch (error) {
        console.error("Update Sub Admin Error:", error);

        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Failed to update sub admin. Please try again.",
        );
      } finally {
        setIsSaving(false);
      }
    },
    [formData, selectedPermissions, subAdminId],
  );

  // -------------------------------------------------------------------------
  // LOADING
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="esa-page">
        <div className="esa-card esa-loading">Loading sub admin details...</div>
      </div>
    );
  }

  const selectedPercent = Math.round(
    (selectedPermissions.size / TOTAL_PERMISSIONS) * 100,
  );

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------
  return (
    <div className="esa-page">
      {/* PAGE HEADER */}
      <div className="esa-page-header">
        <h2 className="esa-page-title">Edit Subadmin</h2>

        <ServiceBreadcrumbs
          items={[
            { label: "All Subadmin", to: "/subadmin_list" },
            { label: "Edit Sub Admin" },
          ]}
        />
      </div>

      <form className="esa-card" onSubmit={handleSubmit}>
        {/* HEADER */}
        <div className="esa-header">
          <h3 className="esa-title">Sub Admin Details</h3>

          <button
            type="button"
            className="esa-btn esa-btn-list"
            onClick={handleListSubAdmin}
          >
            List Sub Admin
          </button>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="esa-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        {/* BASIC FIELDS */}
        <div className="esa-field-grid">
          {/* ROLE */}
          <div className="esa-field">
            <label className="esa-label" htmlFor="esa-role">
              Roles
            </label>

            <select
              id="esa-role"
              className="esa-input"
              value={formData.role}
              onChange={handleFieldChange("role")}
            >
              <option value="">--- Select Role ---</option>

              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* NAME */}
          <div className="esa-field">
            <label className="esa-label" htmlFor="esa-name">
              Sub Admin Name <span className="esa-required">*</span>
            </label>

            <input
              id="esa-name"
              type="text"
              className="esa-input"
              value={formData.name}
              onChange={handleFieldChange("name")}
              required
            />
          </div>

          {/* EMAIL */}
          <div className="esa-field">
            <label className="esa-label" htmlFor="esa-email">
              Email <span className="esa-required">*</span>
            </label>

            <input
              id="esa-email"
              type="email"
              className="esa-input"
              value={formData.email}
              onChange={handleFieldChange("email")}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="esa-field">
            <label className="esa-label" htmlFor="esa-password">
              New Password (optional)
            </label>

            <div className="esa-password-wrap">
              <input
                id="esa-password"
                type={showPassword ? "text" : "password"}
                className="esa-input esa-password-input"
                placeholder="Leave empty to keep current password"
                value={formData.password}
                onChange={handleFieldChange("password")}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="esa-show-btn"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <p className="esa-hint">
              Only enter if you want to change the password
            </p>
          </div>

          {/* EMPLOYEE SINCE */}
          <div className="esa-field">
            <label className="esa-label" htmlFor="esa-employee-since">
              Employee Since (Full Date)
            </label>

            <input
              id="esa-employee-since"
              type="date"
              className="esa-input"
              value={formData.employeeSince}
              onChange={handleFieldChange("employeeSince")}
            />

            <p className="esa-hint">
              Select the exact date when employee joined
            </p>
          </div>
        </div>

        {/* PERMISSIONS */}
        <div className="esa-permissions-panel">
          <div className="esa-permissions-heading">
            <span className="esa-lock-icon" aria-hidden="true">
              🔒
            </span>

            <h2 className="esa-permissions-title">Assign Permissions</h2>
          </div>

          {/* BULK ACTIONS */}
          <div className="esa-bulk-actions">
            <button
              type="button"
              className="esa-btn esa-btn-select-all"
              onClick={selectAllPermissions}
            >
              <span aria-hidden="true">✓</span> Select All
            </button>

            <button
              type="button"
              className="esa-btn esa-btn-deselect-all"
              onClick={deselectAllPermissions}
            >
              <span aria-hidden="true">✕</span> Deselect All
            </button>
          </div>

          {/* PERMISSION GROUPS */}
          <div className="esa-groups-grid">
            {PERMISSION_GROUPS.map((group) => (
              <div className="esa-group" key={group.title}>
                <h3 className="esa-group-title">
                  <span className="esa-folder-icon" aria-hidden="true">
                    📂
                  </span>

                  {group.title}
                </h3>

                <div className="esa-permission-list">
                  {group.permissions.map((permission) => {
                    const isChecked = selectedPermissions.has(permission.key);

                    return (
                      <label
                        key={permission.key}
                        className={`esa-permission-item${
                          isChecked ? " esa-permission-item--checked" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(permission.key)}
                        />

                        <span>{permission.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* COUNT */}
          <div className="esa-count-banner">
            <span className="esa-count-icon" aria-hidden="true">
              📈
            </span>
            <span className="esa-count-number">{selectedPermissions.size}</span>{" "}
            out of <span className="esa-count-number">{TOTAL_PERMISSIONS}</span>{" "}
            permissions selected
            <div className="esa-count-progress" aria-hidden="true">
              <span style={{ width: `${selectedPercent}%` }} />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="esa-footer-actions">
          <button
            type="submit"
            className="esa-btn esa-btn-update"
            disabled={isSaving}
          >
            {isSaving && <span className="esa-spinner" aria-hidden="true" />}
            {isSaving ? "Updating..." : "Update Sub Admin"}
          </button>

          <button
            type="button"
            className="esa-btn esa-btn-cancel"
            onClick={() => navigate("/subadmin_list")}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* SUCCESS MODAL */}
      <ServiceSuccessModal
        isOpen={showSuccess}
        title="Sub admin updated"
        message={successMessage}
        onClose={handleSuccessClose}
      />
    </div>
  );
}