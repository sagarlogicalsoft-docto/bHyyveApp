import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../config/api";

import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaCopy,
  FaFileExcel,
  FaFileCsv,
  FaFilePdf,
  FaRedo,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import DataTable from "../../common/DataTable";
import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import "./subAdminList.css";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";
import ServiceConfirmModal from "../../common/modal/serviceModal/ServiceConfirmModal";

/* =========================================
   API SERVICE FUNCTIONS
   (kept inline; move to a service file later
   by cutting everything in this block)
========================================= */

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const mapSubAdmin = (admin) => ({
  id: admin.admin_id,
  name: admin.admin_name,
  email: admin.admin_email,
  role: admin.role_name || admin.role_id || "-",
  employeeSince: admin.employee_since || "-",
  password: admin.admin_password || "",
  status: String(admin.admin_status) === "1" ? "Active" : "Inactive",
  permissions: admin.permission || "-",
});

const fetchSubAdminsRequest = async () => {
  const { data } = await api.get("/admin/subadmins");

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch sub admins.");
  }

  return data.data.map(mapSubAdmin);
};

const deleteSubAdminRequest = async (id) => {
  const { data } = await api.delete(`/admin/subadmins/${id}`);

  if (!data.success) {
    throw new Error(data.message || "Failed to delete sub admin.");
  }

  return data; // { success, message }
};

const toggleSubAdminStatusRequest = async (id) => {
  const { data } = await api.put(`/admin/subadmins/${id}/status`);

  if (!data.success) {
    throw new Error(data.message || "Failed to update admin status.");
  }

  return data; // { success, message, status }
};

/* =========================================
   COMPONENT
========================================= */

const MAX_VISIBLE_PERMISSIONS = 3;

const SubAdminList = () => {
  const navigate = useNavigate();

  const [subAdminData, setSubAdminData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [visiblePasswordId, setVisiblePasswordId] = useState(null);
  const [expandedPermissionIds, setExpandedPermissionIds] = useState([]);

  // dialog: { kind: "delete" | "status", admin } | null
  // dialog: { kind: "delete" | "status", admin } | null
  const [dialog, setDialog] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const [toast, setToast] = useState(null);

  /* ---------- load ---------- */

  const loadSubAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSubAdminData(await fetchSubAdminsRequest());
    } catch (err) {
      console.error("Fetch sub admins error:", err);
      setError(getErrorMessage(err, "Unable to fetch sub admins."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubAdmins();
  }, [loadSubAdmins]);

  /* ---------- toast auto-hide ---------- */

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  

  /* ---------- confirm (delete + status share one dialog) ---------- */

  const handleConfirm = async () => {
    if (!dialog) return;

    const { kind, admin } = dialog;

    try {
      if (kind === "delete") {
        const result = await deleteSubAdminRequest(admin.id);

        setSubAdminData((prev) => prev.filter((item) => item.id !== admin.id));
        setSuccessInfo({
          title: "Sub admin deleted",
          message: result.message || `${admin.name} has been removed.`,
        });
      } else {
        const result = await toggleSubAdminStatusRequest(admin.id);
        const isActive = Number(result.status) === 1;

        setSubAdminData((prev) =>
          prev.map((item) =>
            item.id === admin.id
              ? { ...item, status: isActive ? "Active" : "Inactive" }
              : item,
          ),
        );
        setSuccessInfo({
          title: isActive ? "Admin activated" : "Admin deactivated",
          message: result.message || "Status updated successfully.",
        });
      }
    } catch (err) {
      console.error(`${kind} sub admin error:`, err);
      setToast({
        type: "error",
        message: getErrorMessage(
          err,
          "Something went wrong. Please try again.",
        ),
      });
    } finally {
      setDialog(null);
    }
  };

  // useCallback keeps the success auto-close timer from restarting on re-render
  const handleSuccessClose = useCallback(() => setSuccessInfo(null), []);

  /* ---------- export ---------- */

  const getExportData = () =>
    subAdminData.map((item, index) => ({
      No: index + 1,
      Name: item.name,
      Email: item.email,
      Role: item.role,
      "Employee Since": item.employeeSince,
      Password: item.password,
      Status: item.status,
      Permissions: item.permissions,
    }));

  const handleCopy = async () => {
    const text = getExportData()
      .map((item) => Object.values(item).join("\t"))
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setToast({ type: "success", message: "Sub admin data copied." });
    } catch (err) {
      setToast({ type: "error", message: "Couldn't copy to clipboard." });
    }
  };

  const handleExcel = async () => {
    const XLSX = await import("xlsx");

    const worksheet = XLSX.utils.json_to_sheet(getExportData());
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sub Admin");
    XLSX.writeFile(workbook, "sub-admin-list.xlsx");
  };

  const handleCSV = async () => {
    const XLSX = await import("xlsx");

    const worksheet = XLSX.utils.json_to_sheet(getExportData());
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "sub-admin-list.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const handlePDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF("landscape");

    doc.text("Sub Admin List", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [
        [
          "No.",
          "Name",
          "Email",
          "Role",
          "Employee Since",
          "Password",
          "Status",
          "Permissions",
        ],
      ],
      body: getExportData().map((item) => Object.values(item)),
    });

    doc.save("sub-admin-list.pdf");
  };

  const togglePermissions = (id) =>
    setExpandedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  /* ---------- derived ---------- */

  const stats = useMemo(() => {
    const active = subAdminData.filter((a) => a.status === "Active").length;
    return {
      total: subAdminData.length,
      active,
      inactive: subAdminData.length - active,
    };
  }, [subAdminData]);

  const dialogContent = useMemo(() => {
    if (!dialog) return null;

    const { kind, admin } = dialog;

    if (kind === "delete") {
      return {
        variant: "danger",
        title: "Delete sub admin?",
        text: `${admin.name} will lose access and this can't be undone.`,
        confirmLabel: "Yes, delete",
      };
    }

    const deactivating = admin.status === "Active";

    return {
      variant: "primary",
      title: deactivating ? "Deactivate this admin?" : "Activate this admin?",
      text: deactivating
        ? `You want to deactivate ${admin.name}.`
        : `You want to activate ${admin.name}.`,
      confirmLabel: deactivating ? "Yes, deactivate" : "Yes, activate",
    };
  }, [dialog]);

  /* ---------- table columns ---------- */

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "No.",
        width: "70px",
        sortable: false,
        render: (_, row, rowIndex) => rowIndex + 1,
      },

      {
        key: "name",
        label: "Name",
        width: "210px",
        sortable: true,
        render: (value) => (
          <div className="subadmin-name-cell">
            <span className="subadmin-avatar" aria-hidden="true">
              {String(value || "?")
                .trim()
                .charAt(0)
                .toUpperCase()}
            </span>
            <span className="subadmin-name-text">{value}</span>
          </div>
        ),
      },

      {
        key: "email",
        label: "Email",
        width: "240px",
        sortable: true,
        render: (value) => <span className="subadmin-email">{value}</span>,
      },

      {
        key: "role",
        label: "Role",
        width: "140px",
        sortable: true,
        render: (value) => <span className="subadmin-role">{value}</span>,
      },

      {
        key: "employeeSince",
        label: "Employee Since",
        width: "150px",
        sortable: true,
      },

      {
        key: "password",
        label: "Password",
        width: "170px",
        sortable: false,
        render: (value, row) => {
          const visible = visiblePasswordId === row.id;

          return (
            <div className="password-cell">
              <span className="password-text">
                {visible ? value : "••••••••"}
              </span>

              <button
                type="button"
                className="password-toggle-btn"
                aria-label={visible ? "Hide password" : "Show password"}
                title={visible ? "Hide password" : "Show password"}
                onClick={() => setVisiblePasswordId(visible ? null : row.id)}
              >
                {visible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          );
        },
      },

      {
        key: "status",
        label: "Status",
        width: "130px",
        sortable: true,
        render: (value, row) => (
          <button
            type="button"
            className={`subadmin-status ${
              value === "Active"
                ? "subadmin-status-active"
                : "subadmin-status-inactive"
            }`}
            title={
              value === "Active" ? "Click to deactivate" : "Click to activate"
            }
            onClick={() => setDialog({ kind: "status", admin: row })}
          >
            <span className="subadmin-status-dot" />
            {value}
          </button>
        ),
      },

      {
        key: "permissions",
        label: "Permissions",
        width: "240px",
        sortable: true,
        render: (value, row) => {
          const list =
            !value || value === "-"
              ? []
              : String(value)
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean);

          if (list.length === 0)
            return <span className="subadmin-muted">-</span>;

          const expanded = expandedPermissionIds.includes(row.id);
          const extra = list.length - MAX_VISIBLE_PERMISSIONS;
          const shown = expanded
            ? list
            : list.slice(0, MAX_VISIBLE_PERMISSIONS);

          return (
            <div className="permissions-cell">
              {shown.map((item) => (
                <span key={item} className="permission-chip">
                  {item}
                </span>
              ))}

              {extra > 0 && (
                <button
                  type="button"
                  className="permission-chip permission-chip-more"
                  aria-expanded={expanded}
                  title={
                    expanded ? "Show fewer permissions" : "Show all permissions"
                  }
                  onClick={() => togglePermissions(row.id)}
                >
                  {expanded ? "Show less" : `+${extra}`}
                </button>
              )}
            </div>
          );
        },
      },

      {
        key: "actions",
        label: "Actions",
        width: "110px",
        sortable: false,
        render: (_, row) => (
          <div className="subadmin-row-actions">
            <button
              type="button"
              className="row-action-btn"
              aria-label={`Edit ${row.name}`}
              title="Edit"
              onClick={() => navigate(`/subadmin/edit/${row.id}`)}
            >
              <FaEdit />
            </button>

            <button
              type="button"
              className="row-action-btn row-action-danger"
              aria-label={`Delete ${row.name}`}
              title="Delete"
              onClick={() => setDialog({ kind: "delete", admin: row })}
            >
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    [visiblePasswordId, expandedPermissionIds, navigate],
  );

  /* ---------- render ---------- */

  return (
    <div className="subadmin-page">
      {/* PAGE HEADER */}
      <div className="subadmin-page-header">
        <div>
          <h2 className="subadmin-page-title">Sub Admin</h2>

          <ServiceBreadcrumbs items={[{ label: "All Subadmin" }]} />
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="subadmin-card">
        <div className="subadmin-card-header">
          <h3 className="subadmin-card-title">Sub Admin Management</h3>

          <button
            type="button"
            className="subadmin-add-btn"
            onClick={() => navigate("/subadmin/add")}
          >
            <FaPlus />
            <span>Add admin</span>
          </button>

          <div className="subadmin-stats">
            {!loading && !error && (
              <>
                <span className="subadmin-stat">{stats.total} total</span>
                <span className="subadmin-stat subadmin-stat-active">
                  {stats.active} active
                </span>
                <span className="subadmin-stat subadmin-stat-inactive">
                  {stats.inactive} inactive
                </span>
              </>
            )}
          </div>

          <div
            className="subadmin-export-buttons"
            role="group"
            aria-label="Export options"
          >
            <button
              type="button"
              onClick={handleCopy}
              disabled={!subAdminData.length}
            >
              <FaCopy />
              <span>Copy</span>
            </button>

            <button
              type="button"
              onClick={handleExcel}
              disabled={!subAdminData.length}
            >
              <FaFileExcel />
              <span>Excel</span>
            </button>

            <button
              type="button"
              onClick={handleCSV}
              disabled={!subAdminData.length}
            >
              <FaFileCsv />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePDF}
              disabled={!subAdminData.length}
            >
              <FaFilePdf />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* DATATABLE / STATES */}
        {loading ? (
          <div className="subadmin-state" role="status">
            <span className="subadmin-spinner" />
            <p>Loading sub admins...</p>
          </div>
        ) : error ? (
          <div className="subadmin-state subadmin-state-error" role="alert">
            <FaTimesCircle className="subadmin-state-icon" />
            <p>{error}</p>
            <button
              type="button"
              className="subadmin-retry-btn"
              onClick={loadSubAdmins}
            >
              <FaRedo />
              <span>Try again</span>
            </button>
          </div>
        ) : (
          <div className="subadmin-table-wrapper">
            <DataTable
              columns={columns}
              data={subAdminData}
              entriesPerPageOptions={[10, 25, 50, 100]}
              defaultEntriesPerPage={10}
              searchable={true}
              sortable={true}
            />
          </div>
        )}
      </div>

      {/* CONFIRM + SUCCESS MODALS */}
      <ServiceConfirmModal
        isOpen={Boolean(dialog)}
        variant={dialogContent?.variant}
        title={dialogContent?.title}
        message={dialogContent?.text}
        confirmText={dialogContent?.confirmLabel}
        onConfirm={handleConfirm}
        onCancel={() => setDialog(null)}
      />

      <ServiceSuccessModal
        isOpen={Boolean(successInfo)}
        title={successInfo?.title}
        message={successInfo?.message}
        onClose={handleSuccessClose}
      />

      {/* TOAST */}
      {toast && (
        <div
          className={`subadmin-toast subadmin-toast-${toast.type}`}
          role="status"
          aria-live="polite"
        >
          {toast.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default SubAdminList;
