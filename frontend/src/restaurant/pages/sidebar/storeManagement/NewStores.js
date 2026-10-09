import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFilter,
  FaSearch,
  FaDownload,
  FaChevronDown,
  FaEye,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
} from "react-icons/fa";
import api from "../../../../config/api";
import { getImage } from "../../../../Components/utils/images";
import "./newStores.css";
import useOutsideClick from "../../../../hooks/UseOutsideClick";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";
import Breadcrumbs from "../../common/BreadCrumbs";

const NewStores = () => {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // STATES
  // =========================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStores, setSelectedStores] = useState([]);
  const [openExport, setOpenExport] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [selectedStore, setSelectedStore] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);

  const [deleteType, setDeleteType] = useState(null);

  useOutsideClick(".new-stores-export-wrapper", () => {
    setOpenExport(false);
  });

  // =========================================================
  // FETCH PENDING STORES
  // =========================================================

  useEffect(() => {
    const fetchPendingStores = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/restaurant/stores/pending");

        console.log("Pending Stores API Response:", response.data);

        if (response.data.success) {
          setStores(response.data.stores || []);
        } else {
          setError(response.data.message || "Failed to fetch stores.");
        }
      } catch (error) {
        console.error("Pending stores API error:", error);

        setError(
          error.response?.data?.message || "Failed to fetch pending stores.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPendingStores();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredStores = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return stores;
    }

    return stores.filter((store) =>
      [
        store.business_name,
        store.email_id,
        store.name,
        store.mobile,
        store.city_name,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(search),
      ),
    );
  }, [stores, searchTerm]);

  // =========================================================
  // SELECT ALL
  // =========================================================

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedStores(filteredStores.map((store) => store.id));
    } else {
      setSelectedStores([]);
    }
  };

  // =========================================================
  // SELECT SINGLE STORE
  // =========================================================

  const handleSelectStore = (id) => {
    setSelectedStores((prev) =>
      prev.includes(id)
        ? prev.filter((storeId) => storeId !== id)
        : [...prev, id],
    );
  };

  // =========================================================
  // VIEW STORE
  // =========================================================

  const handleViewStore = (id) => {
    navigate(`/restaurant/store/view_store/${id}`);
  };

  // =========================================================
  // APPROVE STORE
  // =========================================================

  const handleApproveStore = async () => {
    if (!selectedStore) return;

    try {
      setApproveLoading(true);

      const response = await api.patch(
        `/restaurant/stores/${selectedStore.id}/status`,
        {
          is_kyc_approved: 1,
        },
      );

      if (response.data.success) {
        setStores((prevStores) =>
          prevStores.filter((store) => store.id !== selectedStore.id),
        );

        setSelectedStores((prev) =>
          prev.filter((id) => id !== selectedStore.id),
        );

        setShowConfirmModal(false);
        setSelectedStore(null);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Approve store error:", error);

      alert(error.response?.data?.message || "Failed to approve store.");
    } finally {
      setApproveLoading(false);
    }
  };

  // =========================================================
  // OPEN DELETE CONFIRMATION
  // =========================================================

  const handleDeleteStore = (store) => {
    setSelectedStore(store);
    setDeleteType("single");
    setShowConfirmModal(true);
  };

  // =========================================================
  // OPEN BULK DELETE CONFIRMATION
  // =========================================================

  const handleBulkDelete = () => {
    if (selectedStores.length === 0) return;

    setSelectedStore(null);
    setDeleteType("bulk");
    setShowConfirmModal(true);
  };

  // =========================================================
  // DELETE STORE
  // =========================================================

  const confirmDeleteStore = async () => {
    try {
      setDeleteLoading(true);

      // -------------------------------------------------------
      // SINGLE DELETE
      // -------------------------------------------------------

      if (deleteType === "single" && selectedStore) {
        const response = await api.delete(
          `/restaurant/stores/${selectedStore.id}`,
        );

        if (response.data.success) {
          setStores((prevStores) =>
            prevStores.filter((store) => store.id !== selectedStore.id),
          );

          setSelectedStores((prev) =>
            prev.filter((id) => id !== selectedStore.id),
          );

          setShowConfirmModal(false);
          setSelectedStore(null);
          setDeleteType(null);
          setShowSuccessModal(true);
        }

        return;
      }

      // -------------------------------------------------------
      // BULK DELETE
      // -------------------------------------------------------

      if (deleteType === "bulk") {
        const response = await api.delete("/restaurant/stores/bulk", {
          data: {
            store_ids: selectedStores,
          },
        });

        if (response.data.success) {
          setStores((prevStores) =>
            prevStores.filter((store) => !selectedStores.includes(store.id)),
          );

          setSelectedStores([]);

          setShowConfirmModal(false);
          setDeleteType(null);
          setShowSuccessModal(true);
        }
      }
    } catch (error) {
      console.error("Delete store error:", error);

      alert(error.response?.data?.message || "Failed to delete store.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================================================
  // EXPORT CSV
  // =========================================================

  const handleExportCSV = () => {
    const headers = [
      "Sr No",
      "Store Name",
      "Store Email",
      "Owner Name",
      "Owner Email",
      "Owner Phone",
      "City",
      "Registered Date",
      "Status",
    ];

    const rows = filteredStores.map((store, index) => [
      index + 1,
      store.business_name || "",
      store.email_id || "",
      store.name || "",
      store.email_id || "",
      store.mobile || "",
      store.city_name || "",
      store.created_at || "",
      "Pending",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value || "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "new-stores.csv";
    link.click();

    URL.revokeObjectURL(url);
    setOpenExport(false);
  };

  // =========================================================
  // EXPORT EXCEL
  // =========================================================

  const handleExportExcel = async () => {
    try {
      const XLSX = await import("xlsx");

      const exportData = filteredStores.map((store, index) => ({
        "Sr No": index + 1,
        "Store Name": store.business_name || "",
        "Store Email": store.email_id || "",
        "Owner Name": store.name || "",
        "Owner Email": store.email_id || "",
        "Owner Phone": store.mobile || "",
        City: store.city_name || "",
        "Registered Date": store.created_at || "",
        Status: "Pending",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "New Stores");

      XLSX.writeFile(workbook, "new-stores.xlsx");

      setOpenExport(false);
    } catch (error) {
      console.error("Excel export failed:", error);
    }
  };

  // =========================================================
  // EXPORT PDF
  // =========================================================

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF("landscape");

      doc.setFontSize(16);
      doc.text("New Stores", 14, 15);

      const tableData = filteredStores.map((store, index) => [
        index + 1,
        store.business_name || "",
        store.name || "",
        store.email_id || "",
        store.city_name || "",
        store.created_at || "",
        "Pending",
      ]);

      autoTable(doc, {
        startY: 22,
        head: [
          [
            "Sr No",
            "Store Name",
            "Owner",
            "Owner Email",
            "City",
            "Registered",
            "Status",
          ],
        ],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [0, 85, 85],
        },
      });

      doc.save("new-stores.pdf");
      setOpenExport(false);
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  return (
    <>
      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

    <div className="breadcrumb-wrapper">
      <Breadcrumbs
        items={[
          {
            label: "Store Management",
          },
          {
            label: "New Stores",
          },
        ]}
      />
    </div>
    <div className="new-stores-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="new-stores-page-header">
        <div className="new-stores-page-title">
          <span className="new-stores-title-icon">
            <FaFilter />
          </span>

          <div>
            <h1>New Joining Requests</h1>
            <p>Review and manage new restaurant joining requests.</p>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="new-stores-card">
        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="new-stores-card-header">
          <div className="new-stores-card-title">
            <h2>New Stores</h2>

            <span className="new-stores-count">{filteredStores.length}</span>
          </div>

          <div className="new-stores-card-actions">
            {/* SEARCH */}

            <div className="new-stores-search">
              <input
                type="text"
                placeholder="Search Store Name or Email"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              <button type="button" aria-label="Search">
                <FaSearch />
              </button>
            </div>

            {/* EXPORT */}

            <div className="new-stores-export-wrapper">
              <button
                type="button"
                className="new-stores-export-btn"
                onClick={() => setOpenExport((prev) => !prev)}
              >
                <FaDownload />

                <span>Export</span>

                <FaChevronDown
                  className={
                    openExport ? "export-arrow rotate" : "export-arrow"
                  }
                />
              </button>

              {openExport && (
                <div className="new-stores-export-menu">
                  <button
                    type="button"
                    className="export-csv"
                    onClick={handleExportCSV}
                  >
                    <FaFileCsv />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    className="export-excel"
                    onClick={handleExportExcel}
                  >
                    <FaFileExcel />
                    <span>Export Excel</span>
                  </button>

                  <button
                    type="button"
                    className="export-pdf"
                    onClick={handleExportPDF}
                  >
                    <FaFilePdf />
                    <span>Export PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="new-stores-table-wrapper">
          <table className="new-stores-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={
                      filteredStores.length > 0 &&
                      selectedStores.length === filteredStores.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>

                <th>Sr No</th>

                <th>Store Information</th>

                <th>Owner Information</th>

                <th>Status</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="new-stores-empty">
                    <div className="empty-state">
                      <h3>Loading stores...</h3>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="new-stores-empty">
                    <div className="empty-state">
                      <h3>{error}</h3>
                    </div>
                  </td>
                </tr>
              ) : filteredStores.length > 0 ? (
                filteredStores.map((store, index) => (
                  <tr key={store.id}>
                    {/* CHECKBOX */}

                    <td className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={selectedStores.includes(store.id)}
                        onChange={() => handleSelectStore(store.id)}
                      />
                    </td>

                    {/* SERIAL */}

                    <td>
                      <span className="store-serial">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </td>

                    {/* STORE INFORMATION */}

                    <td>
                      <div
                        className="store-info clickable-info"
                        onClick={() => handleViewStore(store.id)}
                      >
                        <div className="store-avatar">
                          <img
                            src={getImage(store.image)}
                            alt={store.business_name || "Store"}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>

                        <div className="store-info-content">
                          <strong>{store.business_name || "N/A"}</strong>

                          <span>Id: {store.id}</span>

                          <small>{store.city_name || "N/A"}</small>
                        </div>
                      </div>
                    </td>

                    {/* OWNER INFORMATION */}

                    <td>
                      <div className="owner-info">
                        <strong>{store.name || "N/A"}</strong>

                        <span>{store.mobile || "N/A"}</span>

                        <small>{store.email_id || "N/A"}</small>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td>
                      <button
                        type="button"
                        className="store-status pending status-button"
                        onClick={() => {
                          setSelectedStore(store);
                          setDeleteType(null);
                          setShowConfirmModal(true);
                        }}
                      >
                        <span className="status-dot"></span>
                        Pending
                      </button>
                    </td>

                    {/* ACTION */}

                    <td>
                      <div className="store-actions">
                        {/* VIEW */}

                        <button
                          type="button"
                          className="store-view-btn"
                          onClick={() => handleViewStore(store.id)}
                          aria-label="View store"
                          title="View Store"
                        >
                          <FaEye />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="store-delete-btn"
                          onClick={() => handleDeleteStore(store)}
                          aria-label="Delete store"
                          title="Delete Store"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="new-stores-empty">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <FaSearch />
                      </div>

                      <h3>No stores found</h3>

                      <p>Try changing your search keyword.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ===================================================
    BULK DELETE
=================================================== */}

        {selectedStores.length > 0 && (
          <div className="new-stores-bulk-delete-wrapper">
            <button
              type="button"
              className="new-stores-bulk-delete-btn"
              onClick={handleBulkDelete}
            >
              <FaTrash />
              Delete Selected ({selectedStores.length})
            </button>
          </div>
        )}
        {/* ===================================================
            TABLE FOOTER
        =================================================== */}

        <div className="new-stores-table-footer">
          <div className="table-result-info">
            Showing <strong>{filteredStores.length}</strong> of{" "}
            <strong>{stores.length}</strong> stores
          </div>

          <div className="table-pagination">
            <button type="button" disabled aria-label="Previous page">
              <FaChevronLeft />
            </button>

            <button type="button" className="active-page">
              1
            </button>

            <button type="button" disabled aria-label="Next page">
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          APPROVE CONFIRM MODAL
      ===================================================== */}

      <ConfirmModal
        show={showConfirmModal && !deleteType}
        title="Approve Store?"
        message={
          selectedStore
            ? `Are you sure you want to approve "${
                selectedStore.business_name || selectedStore.name
              }"?`
            : "Are you sure you want to approve this store?"
        }
        confirmText="Yes, Approve"
        cancelText="Cancel"
        loading={approveLoading}
        onConfirm={handleApproveStore}
        onCancel={() => {
          if (!approveLoading) {
            setShowConfirmModal(false);
            setSelectedStore(null);
          }
        }}
      />

      {/* =====================================================
          DELETE CONFIRM MODAL
      ===================================================== */}

      <ConfirmModal
        show={showConfirmModal && deleteType === "single"}
        title="Delete Store?"
        message={
          selectedStore
            ? `Are you sure you want to delete "${
                selectedStore.business_name || selectedStore.name
              }"?`
            : "Are you sure you want to delete this store?"
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={confirmDeleteStore}
        onCancel={() => {
          if (!deleteLoading) {
            setShowConfirmModal(false);
            setSelectedStore(null);
            setDeleteType(null);
          }
        }}
      />

      {/* =====================================================
          BULK DELETE CONFIRM MODAL
      ===================================================== */}

      <ConfirmModal
        show={showConfirmModal && deleteType === "bulk"}
        title="Delete Selected Stores?"
        message={`Are you sure you want to delete ${selectedStores.length} selected store${
          selectedStores.length > 1 ? "s" : ""
        }?`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={confirmDeleteStore}
        onCancel={() => {
          if (!deleteLoading) {
            setShowConfirmModal(false);
            setDeleteType(null);
          }
        }}
      />

      {/* =====================================================
          SUCCESS MODAL
      ===================================================== */}

      <SuccessModal
        show={showSuccessModal}
        title="Success!"
        message={
          deleteType
            ? "Store deleted successfully."
            : "The store has been approved successfully and moved to the Store List."
        }
        buttonText="OK"
        onClose={() => {
          setShowSuccessModal(false);
          setDeleteType(null);
        }}
      />
    </div>
  </>
  );
};

export default NewStores;
