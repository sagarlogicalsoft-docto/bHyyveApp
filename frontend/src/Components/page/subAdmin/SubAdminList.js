import React, { useEffect, useMemo, useState } from "react";
import api from "../../../config/api";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { FaEllipsisH } from "react-icons/fa";
import { FaCopy, FaFileExcel, FaFileCsv, FaFilePdf } from "react-icons/fa";

import DataTable from "../../common/DataTable";
import "./subAdminList.css";
import useOutsideClick from "../../../hooks/UseOutsideClick";

const SubAdminList = () => {
  const navigate = useNavigate();
  const [openActionId, setOpenActionId] = useState(null);
  const [statusAdmin, setStatusAdmin] = useState(null);
  const [visiblePasswordId, setVisiblePasswordId] = useState(null);
  const [subAdminData, setSubAdminData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useOutsideClick(".subadmin-action-menu", () => {
    setOpenActionId(null);
  });

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/subadmins");

      if (response.data.success) {
        const formattedData = response.data.data.map((admin) => ({
          id: admin.admin_id,
          name: admin.admin_name,
          email: admin.admin_email,
          role: admin.role_name || admin.role_id || "-",
          employeeSince: admin.employee_since || "-",
          password: admin.admin_password || "",
          status: String(admin.admin_status) === "1" ? "Active" : "Inactive",
          permissions: admin.permission || "-",
        }));

        console.log("Formatted Sub Admin Data:", formattedData);

        setSubAdminData(formattedData);
      } else {
        setError(response.data.message || "Failed to fetch sub admins.");
      }
    } catch (error) {
      console.error("Fetch sub admins error:", error);

      setError(error.response?.data?.message || "Unable to fetch sub admins.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // DELETE
  // -----------------------------------------

 const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this Sub Admin?"
  );

  if (!confirmed) return;

  try {
    const response = await api.delete(`/admin/subadmins/${id}`);

    if (response.data.success) {
      // Remove deleted admin from table immediately
      setSubAdminData((prevData) =>
        prevData.filter((admin) => admin.id !== id)
      );

      setOpenActionId(null);

      alert(response.data.message);
    } else {
      alert(response.data.message || "Failed to delete Sub Admin.");
    }
  } catch (error) {
    console.error("Delete Sub Admin error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to delete Sub Admin. Please try again."
    );
  }
};

  // -----------------------------------------
  // VIEW
  // -----------------------------------------

  const handleView = (id) => {
    console.log("View Sub Admin:", id);

    // Later route
    // navigate(`/subadmin/view/${id}`);
  };

  // -----------------------------------------
  // EDIT
  // -----------------------------------------

  const handleEdit = (id) => {
    navigate(`/subadmin/edit/${id}`);
  };

  const getExportData = () => {
    return subAdminData.map((item, index) => ({
      No: index + 1,
      Name: item.name,
      Email: item.email,
      Role: item.role,
      "Employee Since": item.employeeSince,
      Password: item.password,
      Status: item.status,
      Permissions: item.permissions,
    }));
  };

  const handleCopy = async () => {
    const data = getExportData();

    const text = data
      .map(
        (item) =>
          `${item.No}\t${item.Name}\t${item.Email}\t${item.Role}\t${item["Employee Since"]}\t${item.Password}\t${item.Status}\t${item.Permissions}`,
      )
      .join("\n");

    await navigator.clipboard.writeText(text);

    alert("Sub Admin data copied!");
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

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

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

      body: getExportData().map((item) => [
        item.No,
        item.Name,
        item.Email,
        item.Role,
        item["Employee Since"],
        item.Password,
        item.Status,
        item.Permissions,
      ]),
    });

    doc.save("sub-admin-list.pdf");
  };

  // -----------------------------------------
  // TABLE COLUMNS
  // -----------------------------------------

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
        width: "180px",
        sortable: true,
      },

      {
        key: "email",
        label: "Email",
        width: "230px",
        sortable: true,
      },

      {
        key: "role",
        label: "Role",
        width: "130px",
        sortable: true,
      },

      {
        key: "employeeSince",
        label: "Employee Since",
        width: "160px",
        sortable: true,
      },

      {
        key: "password",
        label: "Password",
        width: "150px",
        sortable: false,

        render: (value, row) => (
          <div className="password-cell">
            <span>{visiblePasswordId === row.id ? value : "••••••••"}</span>

            <button
              type="button"
              className="password-toggle-btn"
              onClick={() =>
                setVisiblePasswordId(
                  visiblePasswordId === row.id ? null : row.id,
                )
              }
            >
              {visiblePasswordId === row.id ? "Hide" : "Show"}
            </button>
          </div>
        ),
      },

      {
        key: "status",
        label: "Status",
        width: "110px",
        sortable: true,

        render: (value, row) => (
          <button
            type="button"
            className={`subadmin-status ${
              value === "Active"
                ? "subadmin-status-active"
                : "subadmin-status-inactive"
            }`}
            onClick={() => setStatusAdmin(row)}
          >
            {value}
          </button>
        ),
      },

      {
        key: "permissions",
        label: "Permissions",
        width: "200px",
        sortable: true,
        render: (value) => (
          <div className="permissions-cell">{value || "-"}</div>
        ),
      },

      {
        key: "actions",
        label: "Actions",
        width: "100px",
        sortable: false,

        render: (_, row) => (
          <div className="subadmin-action-menu">
            {/* THREE DOT */}
            <button
              type="button"
              className="three-dot-btn"
              onClick={(event) => {
                event.stopPropagation();

                setOpenActionId(openActionId === row.id ? null : row.id);
              }}
            >
              <FaEllipsisH />
            </button>

            {/* DROPDOWN */}
            {openActionId === row.id && (
              <div className="action-dropdown">
                {/* EDIT */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenActionId(null);
                    handleEdit(row.id);
                  }}
                >
                  <FaEdit />
                  <span>Edit</span>
                </button>

                {/* DELETE */}
                <button
                  type="button"
                  className="delete-action"
                  onClick={() => {
                    setOpenActionId(null);
                    handleDelete(row.id);
                  }}
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
    [openActionId, visiblePasswordId],
  );

  return (
    <div className="subadmin-page">
      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="subadmin-page-header">
        <div>
          <h2 className="subadmin-page-title">Sub Admin</h2>

          <div className="breadcrumb-wrapper">
            <Link to="/home">Home</Link>

            <span className="breadcrumb-active">
              <IoIosArrowForward />
            </span>

            <span className="breadcrumb-active">All Subadmin</span>
          </div>
        </div>
      </div>

      {/* =========================================
          CONTENT CARD
      ========================================= */}

      <div className="subadmin-card">
        <div className="subadmin-card-header">
          <h3>Sub Admin Management</h3>
          <div className="subadmin-header-actions">
            <div className="subadmin-export-buttons">
              <button type="button" onClick={handleCopy} title="Copy">
                <FaCopy />
                Copy
              </button>

              <button type="button" onClick={handleExcel} title="Export Excel">
                <FaFileExcel />
                Excel
              </button>

              <button type="button" onClick={handleCSV} title="Export CSV">
                <FaFileCsv />
                CSV
              </button>

              <button type="button" onClick={handlePDF} title="Export PDF">
                <FaFilePdf />
                PDF
              </button>
            </div>
            <button
              type="button"
              className="subadmin-add-btn"
              onClick={() => navigate("/subadmin/add")}
            >
              <FaPlus />
              <span> Admin</span>
            </button>
          </div>
        </div>

        {/* =========================================
            DATATABLE
        ========================================= */}

        {loading ? (
          <div className="text-center py-4">Loading sub admins...</div>
        ) : error ? (
          <div className="text-center py-4 text-danger">{error}</div>
        ) : (
          <DataTable
            columns={columns}
            data={subAdminData}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />
        )}
      </div>
      {statusAdmin && (
        <div className="status-modal-overlay">
          <div className="status-modal">
            <div className="status-modal-icon">!</div>

            <h3>Are you sure?</h3>

            <p>
              You want to{" "}
              {statusAdmin.status === "Active" ? "deactivate" : "activate"} this
              admin!
            </p>

            <div className="status-modal-actions">
              <button
                type="button"
                className="status-confirm-btn"
                onClick={async () => {
                  try {
                    const response = await api.put(
                      `/admin/subadmins/${statusAdmin.id}/status`,
                    );

                    if (response.data.success) {
                      // Update the row immediately
                      setSubAdminData((prevData) =>
                        prevData.map((admin) =>
                          admin.id === statusAdmin.id
                            ? {
                                ...admin,
                                status:
                                  Number(response.data.status) === 1
                                    ? "Active"
                                    : "Inactive",
                              }
                            : admin,
                        ),
                      );

                      alert(response.data.message);
                    }
                  } catch (error) {
                    console.error("Change status error:", error);

                    alert(
                      error.response?.data?.message ||
                        "Failed to update admin status.",
                    );
                  } finally {
                    setStatusAdmin(null);
                  }
                }}
              >
                Yes,{" "}
                {statusAdmin.status === "Active" ? "deactivate" : "activate"}{" "}
                it!
              </button>

              <button
                type="button"
                className="status-cancel-btn"
                onClick={() => setStatusAdmin(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminList;
