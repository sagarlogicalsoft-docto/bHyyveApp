import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";

import "./appRatings.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

async function fetchAppReviews() {
  const response = await fetch(`${API_BASE_URL}/admin/app-reviews`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }
  return payload;
}

const AppRatings = () => {
  // =========================================================
  // APP REVIEWS DATA
  // =========================================================

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAppReviews();
      console.log("APP REVIEWS API RESPONSE:", response);
      const data = Array.isArray(response?.data) ? response.data : [];
      console.log("APP REVIEWS DATA:", data);

      const formattedReviews = data.map((item) => ({
        id: item.app_r_id,

        username: `${item.fname || ""} ${item.lname || ""}`.trim() || "—",

        userPicture: item.image || "",

        rating: item.rating ?? 0,

        review: item.review || "—",

        dated: item.r_dated || "—",

        testimonial:
          item.is_testimonial === true ||
          item.is_testimonial === "true" ||
          Number(item.is_testimonial) === 1,
      }));

      setReviews(formattedReviews);
    } catch (err) {
      console.error("Get app reviews error:", err);
      setError(err.message || "Could not load app reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleTestimonial = (row) => {
    const confirmed = window.confirm(
      `Do you want to mark "${row.username}" review as testimonial?`,
    );

    if (!confirmed) return;
    setReviews((previous) =>
      previous.map((review) =>
        review.id === row.id
          ? {
              ...review,
              testimonial: true,
            }
          : review,
      ),
    );
  };

  // =========================================================
  // DELETE REVIEW
  // =========================================================

  const handleDelete = (row) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this review?`,
    );
    if (!confirmed) return;
    setReviews((previous) => previous.filter((review) => review.id !== row.id));
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "Sno",
        sortable: true,
        render: (_, row, index) => index + 1,
      },
      {
        key: "username",
        label: "Username",
        sortable: true,
        render: (value) => (
          <span className="app-ratings-username">{value}</span>
        ),
      },
      {
        key: "userPicture",
        label: "User Picture",
        sortable: false,
        render: (value) => (
          <div className="app-ratings-picture-wrapper">
            <img src={value} alt="User" className="app-ratings-user-picture" />
          </div>
        ),
      },
      {
        key: "rating",
        label: "Rating",
        sortable: true,
        render: (value) => <span className="app-ratings-rating">{value}</span>,
      },
      {
        key: "review",
        label: "Review",
        sortable: true,
        render: (value) => <span className="app-ratings-review">{value}</span>,
      },
      {
        key: "dated",
        label: "Dated",
        sortable: true,
        render: (value) => <span className="app-ratings-date">{value}</span>,
      },
      {
        key: "actions",
        label: "Action",
        sortable: false,
        render: (_, row) => (
          <div className="app-ratings-actions">
            <button
              type="button"
              className="app-ratings-testimonial-btn"
              onClick={() => handleTestimonial(row)}
              disabled={row.testimonial}
            >
              <FaEye />

              {row.testimonial ? "Testimonial" : "Marks As Testimonial"}
            </button>

            <button
              type="button"
              className="app-ratings-delete-btn"
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

  const handleCopy = async () => {
    const text = reviews
      .map(
        (item, index) =>
          `${index + 1}\t${item.username}\t${item.rating}\t${item.review}\t${item.dated}`,
      )
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      alert("Reviews copied successfully.");
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const exportData = reviews.map((item, index) => ({
        Sno: index + 1,
        Username: item.username,
        Rating: item.rating,
        Review: item.review,
        Dated: item.dated,
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "App Reviews");
      XLSX.writeFile(workbook, "AppReviews.xlsx");
    } catch (error) {
      console.error("Excel export failed:", error);
    }
  };

  const handleCSV = async () => {
    try {
      const XLSX = await import("xlsx");
      const exportData = reviews.map((item, index) => ({
        Sno: index + 1,
        Username: item.username,
        Rating: item.rating,
        Review: item.review,
        Dated: item.dated,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "AppReviews.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV export failed:", error);
    }
  };

  const handlePDF = async () => {
    try {
      const jsPDFModule = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      const { jsPDF } = jsPDFModule;
      const doc = new jsPDF("landscape");
      const tableData = reviews.map((item, index) => [
        index + 1,
        item.username,
        item.rating,
        item.review,
        item.dated,
      ]);

      autoTableModule.default(doc, {
        head: [["Sno", "Username", "Rating", "Review", "Dated"]],
        body: tableData,
        startY: 20,
      });

      doc.save("AppReviews.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  return (
    <div className="app-ratings-page">
      <h2 className="app-ratings-title">App Reviews</h2>
      <div className="app-ratings-breadcrumb">
        <Link to="/home">Home</Link>
        <IoIosArrowForward className="app-ratings-breadcrumb-icon" />
        <span>App Reviews</span>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="app-ratings-card">
        <h2 className="app-ratings-title">All App Reviews list</h2>
        <div className="app-ratings-export-buttons">
          <button
            type="button"
            onClick={handleCopy}
            className="app-ratings-export-btn"
          >
            Copy
          </button>

          <button
            type="button"
            onClick={handleExcel}
            className="app-ratings-export-btn"
          >
            Excel
          </button>

          <button
            type="button"
            onClick={handleCSV}
            className="app-ratings-export-btn"
          >
            CSV
          </button>

          <button
            type="button"
            onClick={handlePDF}
            className="app-ratings-export-btn"
          >
            PDF
          </button>
        </div>
        {loading && (
          <p className="app-ratings-loading">Loading app reviews...</p>
        )}
        {error && <div className="app-ratings-error">{error}</div>}

        <div className="app-ratings-table-wrapper">
          {!loading && !error && (
            <DataTable
              columns={columns}
              data={reviews}
              entriesPerPageOptions={[10, 25, 50, 100]}
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

export default AppRatings;
