import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaCopy,
  FaFileExcel,
  FaFileCsv,
  FaFilePdf,
  FaEye,
  FaUserTie,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

import DataTable from "../../common/DataTable";
import ServiceBreadcrumbs from "../../../Components/common/ServiceBreadcrumbs";
import { getImage } from "../../utils/images";
import api from "../../../config/api";
import "./viewExpert.css";

/* =========================================================
   CONFIG
========================================================= */

const ROUTES = {
  addExpert: "/add_new_expert",
  expertDetails: (id) => `/expert_details/${id}`,
};

/* =========================================================
   API SERVICE LAYER (swap endpoints here only)
========================================================= */

const expertService = {
  getAll: () => api.get("/admin/experts"),
};

/* =========================================================
   EXPERIENCE CELL (clamped to 4 lines, expands on click)
   Kept as a component because it needs its own state + measuring.
========================================================= */

const ExperienceCell = ({ value }) => {
  const textRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const element = textRef.current;

      // only measure while clamped; expanded text always overflows the clamp
      if (!element || expanded) return;

      setOverflowing(element.scrollHeight > element.clientHeight + 1);
    };

    measure();
    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, [value, expanded]);

  if (!value) return "-";

  return (
    <div className="expert-experience">
      <p
        ref={textRef}
        className={`expert-experience-text ${expanded ? "is-expanded" : ""}`}
      >
        {value}
      </p>

      {(overflowing || expanded) && (
        <button
          type="button"
          className="expert-experience-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((previous) => !previous)}
        >
          {expanded ? "View less" : "View more"}
        </button>
      )}
    </div>
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const ViewExpert = () => {
  const navigate = useNavigate();

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- fetch experts ---------- */

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);

        const response = await expertService.getAll();

        if (response.data.success) {
          setExperts(response.data.data || []);
        } else {
          setExperts([]);
          toast.error(response.data.message || "Failed to fetch experts");
        }
      } catch (error) {
        setExperts([]);
        toast.error(error.response?.data?.message || "Failed to fetch experts");
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  /* ---------- map API data to table data ---------- */

  const tableData = useMemo(
    () =>
      experts.map((item) => ({
        ...item,
        photo: item.image || "",
        vendorName: item.vendor_name || "",
        categoryName: item.category_name || "",
        subCategoryName: item.sub_category_name || "",
        name: item.name || "",
        experience: item.experience || "",
        // API status: 1 = Active, 0 = Inactive
        currentStatus: Number(item.status) === 1 ? "Active" : "Inactive",
      })),
    [experts],
  );

  /* =========================================================
     EXPORT
  ========================================================= */

  const getExportData = () =>
    tableData.map((item, index) => ({
      No: index + 1,
      Photo: item.photo,
      "Vendor Name": item.vendorName,
      "Category Name": item.categoryName,
      "Sub Category Name": item.subCategoryName,
      Name: item.name,
      Experience: item.experience,
      "Current Status": item.currentStatus,
    }));

  const handleCopy = async () => {
    try {
      const text = getExportData()
        .map((item) => Object.values(item).join("\t"))
        .join("\n");

      await navigator.clipboard.writeText(text);

      toast.success("Expert data copied");
    } catch (error) {
      toast.error("Failed to copy expert data");
    }
  };

  const handleExcel = async () => {
    try {
      const XLSX = await import("xlsx");

      const worksheet = XLSX.utils.json_to_sheet(getExportData());
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Expert List");
      XLSX.writeFile(workbook, "expert-list.xlsx");
    } catch (error) {
      toast.error("Excel export failed");
    }
  };

  const handleCSV = async () => {
    try {
      const XLSX = await import("xlsx");

      const worksheet = XLSX.utils.json_to_sheet(getExportData());
      const csv = XLSX.utils.sheet_to_csv(worksheet);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "expert-list.csv";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("CSV export failed");
    }
  };

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
      toast.error("PDF export failed");
    }
  };

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */

  const columns = useMemo(
    () => [
      {
        key: "photo",
        label: "Photo",
        width: "90px",
        sortable: false,
        render: (value, row) => {
          const imageSrc = getImage(value);

          return imageSrc ? (
            <img
              src={imageSrc}
              alt={row.name || "Expert"}
              className="expert-photo"
            />
          ) : (
            <div className="expert-photo expert-photo-empty">
              <FaUserTie />
            </div>
          );
        },
      },
      {
        key: "name",
        label: "Name",
        width: "170px",
        sortable: true,
        render: (value) => <span className="expert-name">{value || "-"}</span>,
      },
      {
        key: "vendorName",
        label: "Vendor Name",
        width: "150px",
        sortable: true,
      },
      {
        key: "categoryName",
        label: "Category Name",
        width: "150px",
        sortable: true,
      },
      {
        key: "subCategoryName",
        label: "Sub Category Name",
        width: "160px",
        sortable: true,
      },
      {
        key: "experience",
        label: "Experience",
        width: "260px",
        sortable: true,
        render: (value) => <ExperienceCell value={value} />,
      },
      {
        key: "currentStatus",
        label: "Current Status",
        width: "130px",
        sortable: true,
        render: (value) => (
          <span
            className={`expert-status ${
              value === "Active"
                ? "expert-status-active"
                : "expert-status-inactive"
            }`}
          >
            {value}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        width: "140px",
        sortable: false,
        render: (value, row) => (
          <button
            type="button"
            className="expert-view-btn"
            onClick={() => navigate(ROUTES.expertDetails(row.id))}
          >
            <FaEye />
            <span>View Details</span>
          </button>
        ),
      },
    ],
    [navigate],
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="expert-page">
      <Toaster position="top-right" />

      {/* ---------- PAGE HEADER ---------- */}

      <header className="expert-page-header">
        <h2 className="expert-page-title">Expert Management</h2>

        <ServiceBreadcrumbs
          items={[{ label: "Expert Management" }, { label: "View Expert" }]}
        />
      </header>

      {/* ---------- CONTENT CARD ---------- */}

      <div className="expert-card">
        <div className="expert-card-header">
          <div className="expert-card-title">
            <h3>All experts</h3>
            {!loading && <span className="expert-count">{tableData.length}</span>}
          </div>

          <div className="expert-header-actions">
            <div className="expert-export-buttons">
              <button
                type="button"
                onClick={handleCopy}
                disabled={loading || !tableData.length}
              >
                <FaCopy />
                <span>Copy</span>
              </button>

              <button
                type="button"
                onClick={handleExcel}
                disabled={loading || !tableData.length}
              >
                <FaFileExcel />
                <span>Excel</span>
              </button>

              <button
                type="button"
                onClick={handleCSV}
                disabled={loading || !tableData.length}
              >
                <FaFileCsv />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={handlePDF}
                disabled={loading || !tableData.length}
              >
                <FaFilePdf />
                <span>PDF</span>
              </button>
            </div>

            <button
              type="button"
              className="expert-add-btn"
              onClick={() => navigate(ROUTES.addExpert)}
            >
              <FaPlus />
              <span>Add Expert</span>
            </button>
          </div>
        </div>

        <div className="expert-table-wrapper">
          {loading ? (
            <div className="expert-loading">
              <i className="expert-spinner" aria-hidden="true" />
              <span>Loading experts…</span>
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
    </div>
  );
};

export default ViewExpert;