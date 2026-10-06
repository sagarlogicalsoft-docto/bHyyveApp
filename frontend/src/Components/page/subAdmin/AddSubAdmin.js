import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaLock, FaFolder } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";

import api from "../../../config/api";

import "./addSubAdmin.css";

const AddSubAdmin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "",
    name: "",
    email: "",
    password: "",
    employeeSince: "",
  });

  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [loading, setLoading] = useState(false);

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
    const allPermissions = [
      "Dashboard",
      "Sub Admin",

      "Vendor Management",
      "User Management",
      "Expert Management",

      "Reviews",
      "Category Management",
      "Vendor Images Slider Images",
      "Home Sliders",

      "Booking",
      "Services",
      "Estimates",
      "Order Notification",

      "Settings",
      "Configuration",

      "Offers",
      "Support",
    ];

    setSelectedPermissions(allPermissions);
  };

  // =========================================
  // RESET
  // =========================================

  const handleReset = () => {
    setFormData({
      role: "",
      name: "",
      email: "",
      password: "",
      employeeSince: "",
    });

    setSelectedPermissions([]);
  };

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

      const response = await api.post("/admin/save_subadmin", {
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

      if (response.data.success) {
        toast.success(response.data.message || "Sub Admin added successfully.");

        handleReset();

        setTimeout(() => {
          navigate("/subadmin_list");
        }, 1000);
      } else {
        toast.error(response.data.message || "Failed to add Sub Admin.");
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

        <div className="breadcrumb-wrapper">
          <Link to="/home">Home</Link>

          <span className="breadcrumb-active">
            <IoIosArrowForward />
          </span>

          <Link to="/subadmin_list">All Subadmin</Link>

          <span className="breadcrumb-active">
            <IoIosArrowForward />
          </span>

          <span className="breadcrumb-current">Add New Admin</span>
        </div>
      </div>

      {/* =========================================
          MAIN CARD
      ========================================= */}

      <div className="add-subadmin-card">
        <div className="add-subadmin-card-header">
          <h3>Add New Subadmin</h3>

          <button type="button" onClick={() => navigate("/subadmin_list")}>
            List Sub Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* =========================================
              ROLE
          ========================================= */}

          <div className="form-group">
            <label>
              Roles <span>*</span>
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">.. Select Role ..</option>
              <option value="Marketing Manager">Marketing Manager</option>
              <option value="Finance Associate">Finance Associate</option>
              <option value="Customer">Customer</option>
              <option value="Employee">Employee</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>

          {/* =========================================
              NAME
          ========================================= */}

          <div className="form-group">
            <label>
              Sub Admin Name <span>*</span>
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Name"
              required
            />
          </div>

          {/* =========================================
              EMAIL
          ========================================= */}

          <div className="form-group">
            <label>
              Email <span>*</span>
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              required
            />
          </div>

          {/* =========================================
              PASSWORD
          ========================================= */}

          <div className="form-group">
            <label>
              Password <span>*</span>
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Password"
              required
            />
          </div>

          {/* =========================================
              EMPLOYEE SINCE
          ========================================= */}

          <div className="form-group">
            <label>Employee Since (Full Date)</label>

            <input
              type="date"
              name="employeeSince"
              value={formData.employeeSince}
              onChange={handleChange}
            />

            <small>Select the exact date when employee joined</small>
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
              <button type="button" onClick={handleSelectAll}>
                ✓ Select All
              </button>

              <button type="button" onClick={() => setSelectedPermissions([])}>
                ✕ Deselect All
              </button>
            </div>

            <div className="permissions-grid">
              {/* CORE */}

              <PermissionGroup
                title="Core Management"
                permissions={["Dashboard", "Sub Admin"]}
                selectedPermissions={selectedPermissions}
                onPermissionChange={handlePermissionChange}
              />

              {/* USER */}

              <PermissionGroup
                title="User Management"
                permissions={[
                  "Vendor Management",
                  "User Management",
                  "Expert Management",
                ]}
                selectedPermissions={selectedPermissions}
                onPermissionChange={handlePermissionChange}
              />

              {/* CONTENT */}

              <PermissionGroup
                title="Content Management"
                permissions={[
                  "Reviews",
                  "Category Management",
                  "Vendor Images Slider Images",
                  "Home Sliders",
                ]}
                selectedPermissions={selectedPermissions}
                onPermissionChange={handlePermissionChange}
              />

              {/* BUSINESS */}

              <PermissionGroup
                title="Business Operations"
                permissions={[
                  "Booking",
                  "Services",
                  "Estimates",
                  "Order Notification",
                ]}
                selectedPermissions={selectedPermissions}
                onPermissionChange={handlePermissionChange}
              />

              {/* SYSTEM */}

              <PermissionGroup
                title="System Settings"
                permissions={["Settings", "Configuration"]}
                selectedPermissions={selectedPermissions}
                onPermissionChange={handlePermissionChange}
              />

              {/* MARKETING */}

              <PermissionGroup
                title="Marketing & Support"
                permissions={["Offers", "Support"]}
                selectedPermissions={selectedPermissions}
                onPermissionChange={handlePermissionChange}
              />
            </div>

            <div className="permission-count">
              {selectedPermissions.length} permissions selected
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

      {permissions.map((permission) => (
        <label key={permission} className="permission-item">
          <input
            type="checkbox"
            checked={selectedPermissions.includes(permission)}
            onChange={() => onPermissionChange(permission)}
          />

          <span>{permission}</span>
        </label>
      ))}
    </div>
  );
};

export default AddSubAdmin;
