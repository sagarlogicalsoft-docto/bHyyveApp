import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEllipsisH,
  FaCopy,
  FaFileExcel,
  FaFileCsv,
  FaFilePdf,
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { getImage } from "../../utils/images";
import { FaEye } from "react-icons/fa";

import DataTable from "../../common/DataTable";
import "./viewExpert.css";
import useOutsideClick from "../../../hooks/UseOutsideClick";
import api from "../../../config/api";

const ViewExpert = () => {
  const navigate = useNavigate();

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openActionId, setOpenActionId] = useState(null);
  const [statusExpert, setStatusExpert] = useState(null);

  // =========================================================
  // CLOSE ACTION DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================================

  useOutsideClick(".expert-action-menu", () => {
    setOpenActionId(null);
  });

  // =========================================================
  // GET EXPERTS
  // =========================================================

  const fetchExperts = async () => {
    try {
      setLoading(true);

      const response = await api.get("/expert/experts");

      console.log("Experts API Response:", response.data);

      if (response.data.success) {
        setExperts(response.data.data || []);
      } else {
        setExperts([]);

        console.error(response.data.message || "Failed to fetch experts");
      }
    } catch (error) {
      console.error("Get experts error:", error);

      setExperts([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH EXPERTS ON PAGE LOAD
  // =========================================================

  useEffect(() => {
    fetchExperts();
  }, []);

  // =========================================================
  // DELETE EXPERT
  // =========================================================

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Expert?",
    );

    if (!confirmed) return;

    console.log("Delete Expert:", id);

    // Delete API will be integrated later
  };

  // =========================================================
  // EDIT EXPERT
  // =========================================================

  const handleEdit = (id) => {
    navigate(`/expert/edit/${id}`);
  };

  // =========================================================
  // MAP API DATA TO TABLE DATA
  // =========================================================

  const tableData = useMemo(() => {
    return experts.map((item) => ({
      ...item,

      // API image field
      photo: item.image || "",

      // API vendor field
      vendorName: item.vendor_name || "",

      // API category field
      categoryName: item.category_name || "",

      // API sub-category field
      subCategoryName: item.sub_category_name || "",

      // Expert name
      name: item.name || "",

      // Experience
      experience: item.experience || "",

      // API status: 1 = Active, 0 = Inactive
      currentStatus: Number(item.status) === 1 ? "Active" : "Inactive",
    }));
  }, [experts]);

  // =========================================================
  // EXPORT DATA
  // =========================================================

  const getExportData = () => {
    return tableData.map((item, index) => ({
      No: index + 1,
      Photo: item.photo,
      "Vendor Name": item.vendorName,
      "Category Name": item.categoryName,
      "Sub Category Name": item.subCategoryName,
      Name: item.name,
      Experience: item.experience,
      "Current Status": item.currentStatus,
    }));
  };

  // =========================================================
  // COPY
  // =========================================================

  const handleCopy = async () => {
    try {
      const data = getExportData();

      const text = data
        .map(
          (item) =>
            `${item.No}\t${item.Photo}\t${item["Vendor Name"]}\t${item["Category Name"]}\t${item["Sub Category Name"]}\t${item.Name}\t${item.Experience}\t${item["Current Status"]}`,
        )
        .join("\n");

      await navigator.clipboard.writeText(text);

      alert("Expert data copied!");
    } catch (error) {
      console.error("Copy expert data error:", error);
      alert("Failed to copy expert data.");
    }
  };

  // =========================================================
  // EXCEL
  // =========================================================

  const handleExcel = async () => {
    try {
      const XLSX = await import("xlsx");

      const worksheet = XLSX.utils.json_to_sheet(getExportData());

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Expert List");

      XLSX.writeFile(workbook, "expert-list.xlsx");
    } catch (error) {
      console.error("Excel export error:", error);
    }
  };

  // =========================================================
  // CSV
  // =========================================================

  const handleCSV = async () => {
    try {
      const XLSX = await import("xlsx");

      const worksheet = XLSX.utils.json_to_sheet(getExportData());

      const csv = XLSX.utils.sheet_to_csv(worksheet);

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "expert-list.csv";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV export error:", error);
    }
  };

  // =========================================================
  // PDF
  // =========================================================

  const handlePDF = async () => {
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF("landscape");

      doc.text("Expert List", 14, 15);

      autoTable(doc, {
        startY: 22,

        head: [
          [
            "No.",
            "Vendor Name",
            "Category Name",
            "Sub Category Name",
            "Name",
            "Experience",
            "Current Status",
          ],
        ],

        body: getExportData().map((item) => [
          item.No,
          item["Vendor Name"],
          item["Category Name"],
          item["Sub Category Name"],
          item.Name,
          item.Experience,
          item["Current Status"],
        ]),
      });

      doc.save("expert-list.pdf");
    } catch (error) {
      console.error("PDF export error:", error);
    }
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      // =====================================================
      // PHOTO
      // =====================================================

      {
        key: "photo",
        label: "Photo",
        width: "110px",
        sortable: false,

        render: (value, row) => {
          const imageSrc = getImage(value);

          return (
            <div className="expert-photo-wrapper">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={row.name || "Expert"}
                  className="expert-photo"
                />
              ) : (
                <div className="expert-photo">No Image</div>
              )}
            </div>
          );
        },
      },

      // =====================================================
      // VENDOR NAME
      // =====================================================

      {
        key: "vendorName",
        label: "Vendor Name",
        width: "150px",
        sortable: true,
      },

      // =====================================================
      // CATEGORY
      // =====================================================

      {
        key: "categoryName",
        label: "Category Name",
        width: "150px",
        sortable: true,
      },

      // =====================================================
      // SUB CATEGORY
      // =====================================================

      {
        key: "subCategoryName",
        label: "Sub Category Name",
        width: "150px",
        sortable: true,
      },

      // =====================================================
      // NAME
      // =====================================================

      {
        key: "name",
        label: "Name",
        width: "100px",
        sortable: true,
      },

      // =====================================================
      // EXPERIENCE
      // =====================================================

      {
        key: "experience",
        label: "Experience",
        width: "250px",
        sortable: true,

        render: (value) => (
          <div className="expert-experience">{value || "-"}</div>
        ),
      },

      // =====================================================
      // CURRENT STATUS
      // =====================================================

      {
        key: "currentStatus",
        label: "Current Status",
        width: "100px",
        sortable: true,

        render: (value, row) => (
          <button
            type="button"
            className={`expert-status ${
              value === "Active"
                ? "expert-status-active"
                : "expert-status-inactive"
            }`}
            onClick={() => setStatusExpert(row)}
          >
            {value}
          </button>
        ),
      },

      // =====================================================
      // ACTION
      // =====================================================

      {
        key: "actions",
        label: "Actions",
        sortable: false,
        width: "120px",

        render: (value, row) => (
          <button
            type="button"
            className="expert-view-btn"
            onClick={() => navigate(`/expert_details/${row.id}`)}
          >
            <FaEye />
            View Details
          </button>
        ),
      },
    ],
    [openActionId],
  );

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="expert-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="expert-page-header">
        <div>
          <h2 className="expert-page-title">Expert Management</h2>

          <div className="expert-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="expert-breadcrumb-active">View Expert</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTENT CARD
      ===================================================== */}

      <div className="expert-card">
        <div className="expert-card-header">
          <h3>Expert Management</h3>

          <div className="expert-header-actions">
            {/* =================================================
                EXPORT BUTTONS
            ================================================= */}

            <div className="expert-export-buttons">
              <button
                type="button"
                onClick={handleCopy}
                title="Copy"
                disabled={loading}
              >
                <FaCopy />
                Copy
              </button>

              <button
                type="button"
                onClick={handleExcel}
                title="Export Excel"
                disabled={loading}
              >
                <FaFileExcel />
                Excel
              </button>

              <button
                type="button"
                onClick={handleCSV}
                title="Export CSV"
                disabled={loading}
              >
                <FaFileCsv />
                CSV
              </button>

              <button
                type="button"
                onClick={handlePDF}
                title="Export PDF"
                disabled={loading}
              >
                <FaFilePdf />
                PDF
              </button>
            </div>

            {/* =================================================
                ADD EXPERT
            ================================================= */}

            <button
              type="button"
              className="expert-add-btn"
              onClick={() => navigate("/add_new_expert")}
            >
              <FaPlus />

              <span>Add Expert</span>
            </button>
          </div>
        </div>

        {/* =====================================================
            DATATABLE
        ===================================================== */}

        <div className="expert-table-wrapper">
          {loading ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
              }}
            >
              Loading experts...
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={tableData}
              entriesPerPageOptions={[5, 10, 25, 50, 100]}
              defaultEntriesPerPage={10}
              searchable={true}
              sortable={true}
            />
          )}
        </div>
      </div>

      {/* =====================================================
          STATUS MODAL
      ===================================================== */}

      {statusExpert && (
        <div className="expert-status-modal-overlay">
          <div className="expert-status-modal">
            <div className="expert-status-modal-icon">!</div>

            <h3>Are you sure?</h3>

            <p>
              You want to{" "}
              {statusExpert.currentStatus === "Active"
                ? "deactivate"
                : "activate"}{" "}
              this expert!
            </p>

            <div className="expert-status-modal-actions">
              <button
                type="button"
                className="expert-status-confirm-btn"
                onClick={() => {
                  console.log("Change Expert Status:", statusExpert.id);

                  // Status API will be integrated later

                  setStatusExpert(null);
                }}
              >
                Yes,{" "}
                {statusExpert.currentStatus === "Active"
                  ? "deactivate"
                  : "activate"}{" "}
                it!
              </button>
              <button
                type="button"
                className="expert-status-cancel-btn"
                onClick={() => setStatusExpert(null)}
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

export default ViewExpert;
