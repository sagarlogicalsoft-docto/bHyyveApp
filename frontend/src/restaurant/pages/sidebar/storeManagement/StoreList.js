import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  FaFilter,
  FaStore,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaSearch,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./storeList.css";
import { getImage } from "../../../../Components/utils/images";
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";
import useOutsideClick from "../../../../hooks/UseOutsideClick";
import BreadCrumbs from "../../common/BreadCrumbs";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// =========================================================
// STORE LOGO — falls back to an icon if the image errors out
// (kept as its own tiny component only because each row needs
// its own independent error state, which hooks can't do inline
// inside a .map() callback)
// =========================================================
const StoreLogo = ({ src, name }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="store-logo">
        <FaStore />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || "Store"}
      className="store-logo"
      onError={() => setFailed(true)}
    />
  );
};

const StoreList = () => {
  const navigate = useNavigate();

  // =========================================================
  // STATES
  // =========================================================
  const [openExport, setOpenExport] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    inactiveStores: 0,
    newStores: 0,
  });

  const { id } = useParams();
  const location = useLocation();
  const [store, setStore] = useState(null);

  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [statusStore, setStatusStore] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [deleteStore, setDeleteStore] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useOutsideClick(".store-export-wrapper", () => {
    setOpenExport(false);
  });

  // =========================================================
  // FETCH STORES
  // =========================================================
  const fetchStores = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/restaurant/stores`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch restaurant stores");
      }

      const apiStores = result.data?.stores || [];

      const formattedStores = apiStores.map((store, index) => ({
        id: store.id,
        srNo: index + 1,
        storeName: store.business_name || store.name || "N/A",
        storeLogo: getImage(store.image) || "",
        ownerName: store.name || "N/A",
        phone: store.mobile || "N/A",
        email: store.email_id || "N/A",
        status: Number(store.is_kyc_approved) === 1,
      }));

      setStores(formattedStores);

      setStats({
        totalStores: Number(result.data?.totalStores || 0),
        activeStores: Number(result.data?.activeStores || 0),
        inactiveStores: Number(result.data?.inactiveStores || 0),
        newStores: Number(result.data?.newStores || 0),
      });
    } catch (err) {
      console.error("Fetch restaurant stores error:", err);
      setError(err.message || "Unable to load restaurant stores.");
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const fetchStoreById = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/restaurant/stores/${id}`);

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch store");
        }

        setStore(result.data);
      } catch (err) {
        console.error("Fetch store by ID error:", err);
        setError(err.message || "Unable to load store.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStoreById();
    }
  }, [id]);

  // =========================================================
  // FILTER STORES
  // =========================================================
  const filteredStores = useMemo(() => {
    const filtered = stores.filter((store) => {
      const search = searchTerm.toLowerCase();
      return (
        String(store.storeName).toLowerCase().includes(search) ||
        String(store.ownerName).toLowerCase().includes(search) ||
        String(store.email).toLowerCase().includes(search) ||
        String(store.phone).includes(search)
      );
    });

    if (!sortConfig.key) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [stores, searchTerm, sortConfig]);

  // =========================================================
  // STATISTICS (from backend)
  // =========================================================
  const {
    totalStores,
    activeStores,
    inactiveStores,
    newStores: newlyJoinedStores,
  } = stats;

  // =========================================================
  // SELECT ALL
  // =========================================================
  const isAllSelected =
    filteredStores.length > 0 &&
    filteredStores.every((store) => selectedStores.includes(store.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStores((prev) =>
        prev.filter((id) => !filteredStores.some((store) => store.id === id)),
      );
    } else {
      setSelectedStores((prev) => [
        ...new Set([...prev, ...filteredStores.map((store) => store.id)]),
      ]);
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
  // STATUS TOGGLE
  // =========================================================

  const handleStatusToggle = (store) => {
    // Store the complete store object
    setStatusStore(store);

    // Open confirmation popup
    setShowStatusConfirm(true);
  };

  // =========================================================
  // CONFIRM STATUS UPDATE
  // =========================================================

  const confirmStatusUpdate = async () => {
    if (!statusStore) {
      return;
    }

    try {
      setStatusLoading(true);

      // status is BOOLEAN
      //
      // true  = currently Active  -> send 0 (Deactivate)
      // false = currently Inactive -> send 1 (Activate)

      const newStatus = statusStore.status ? 0 : 1;

      console.log("Current status:", statusStore.status);
      console.log("Sending new status:", newStatus);
      console.log("Store ID:", statusStore.id);

      const response = await fetch(
        `${API_BASE_URL}/restaurant/stores/${statusStore.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_kyc_approved: newStatus,
          }),
        },
      );

      const result = await response.json();

      console.log("Status API response:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update store status");
      }

      // ---------------------------------------------------------
      // Update local store immediately
      // ---------------------------------------------------------

      setStores((prevStores) =>
        prevStores.map((store) =>
          store.id === statusStore.id
            ? {
                ...store,
                status: newStatus === 1,
              }
            : store,
        ),
      );

      // ---------------------------------------------------------
      // Close confirmation popup
      // ---------------------------------------------------------

      setShowStatusConfirm(false);
      setStatusStore(null);

      // ---------------------------------------------------------
      // Show success popup
      // ---------------------------------------------------------

      setSuccessMessage(
        newStatus === 1
          ? "Store has been activated successfully."
          : "Store has been deactivated successfully.",
      );

      setShowSuccessModal(true);

      // ---------------------------------------------------------
      // Refresh backend data
      // ---------------------------------------------------------

      await fetchStores();
    } catch (error) {
      console.error("Status update error:", error);

      setShowStatusConfirm(false);
      setStatusStore(null);

      alert(error.message || "Failed to update store status.");
    } finally {
      setStatusLoading(false);
    }
  };

  // =========================================================
  // DELETE SINGLE STORE
  // =========================================================
  const handleDeleteStore = (store) => {
    setDeleteType("single");
    setDeleteStore(store);
    setShowDeleteConfirm(true);
  };

  // =========================================================
  // BULK DELETE
  // =========================================================
  const handleBulkDelete = () => {
    if (selectedStores.length === 0) return;

    setDeleteType("bulk");
    setDeleteStore(null);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);

      if (deleteType === "single") {
        const id = deleteStore.id;

        const response = await fetch(
          `${API_BASE_URL}/restaurant/stores/${id}`,
          {
            method: "DELETE",
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to delete store");
        }

        setStores((prev) => prev.filter((store) => store.id !== id));

        setSelectedStores((prev) => prev.filter((storeId) => storeId !== id));

        setShowDeleteConfirm(false);
        setDeleteType(null);
        setDeleteStore(null);

        setSuccessMessage("Store deleted successfully.");
        setShowSuccessModal(true);

        await fetchStores();
      }

      if (deleteType === "bulk") {
        const idsToDelete = [...selectedStores];

        const response = await fetch(`${API_BASE_URL}/restaurant/stores/bulk`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            store_ids: idsToDelete,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to delete stores");
        }

        setStores((prev) =>
          prev.filter((store) => !idsToDelete.includes(store.id)),
        );

        setSelectedStores([]);

        setShowDeleteConfirm(false);
        setDeleteType(null);
        setDeleteStore(null);

        setSuccessMessage(
          `${idsToDelete.length} store${
            idsToDelete.length > 1 ? "s" : ""
          } deleted successfully.`,
        );

        setShowSuccessModal(true);

        await fetchStores();
      }
    } catch (err) {
      console.error("Delete store error:", err);

      setShowDeleteConfirm(false);
      setDeleteType(null);
      setDeleteStore(null);

      setSuccessMessage(err.message || "Failed to delete store.");
      setShowSuccessModal(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================================================
  // SORT
  // =========================================================
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // =========================================================
  // SORT ICON
  // =========================================================
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <span className="store-sort-neutral">
          <FaChevronUp />
          <FaChevronDown />
        </span>
      );
    }
    return sortConfig.direction === "asc" ? (
      <FaChevronUp className="store-sort-active" />
    ) : (
      <FaChevronDown className="store-sort-active" />
    );
  };

  // =========================================================
  // EXPORT
  // =========================================================
  const handleExportCSV = () => {
    const headers = [
      "SR NO",
      "Store Name",
      "Store ID",
      "Owner Name",
      "Phone",
      "Email",
      "Status",
    ];
    const rows = filteredStores.map((store) => [
      store.srNo,
      store.storeName,
      store.id,
      store.ownerName,
      store.phone,
      store.email,
      store.status ? "Active" : "Inactive",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stores-list.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setOpenExport(false);
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import("xlsx");

      const exportData = filteredStores.map((store) => ({
        "SR NO": store.srNo,
        "Store Name": store.storeName,
        "Store ID": store.id,
        "Owner Name": store.ownerName,
        Phone: store.phone,
        Email: store.email,
        Status: store.status ? "Active" : "Inactive",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Stores");

      XLSX.writeFile(workbook, "stores-list.xlsx");

      setOpenExport(false);
    } catch (error) {
      console.error("Excel export failed:", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF("landscape");

      doc.setFontSize(16);
      doc.text("Stores List", 14, 15);

      const tableData = filteredStores.map((store) => [
        store.srNo,
        store.storeName,
        store.id,
        store.ownerName,
        store.phone,
        store.email,
        store.status ? "Active" : "Inactive",
      ]);

      autoTable(doc, {
        startY: 22,
        head: [
          [
            "SR NO",
            "Store Name",
            "Store ID",
            "Owner Name",
            "Phone",
            "Email",
            "Status",
          ],
        ],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 9,
        },
      });

      doc.save("stores-list.pdf");

      setOpenExport(false);
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  // =========================================================
  // CLEAR SEARCH
  // =========================================================
  const clearSearch = () => {
    setSearchTerm("");
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <>
      {/* breadcrumbs */}

      <div className="breadcrumb-wrapper">
        <BreadCrumbs
          items={[
            {
              label: "Store Management",
            },
            {
              label: "Stores",
            },
          ]}
        />
      </div>

      <div className="store-list-page">
        {/* PAGE HEADER */}
        <div className="store-page-header">
          <div className="store-page-title-wrapper">
            <div className="store-page-title-icon">
              <FaFilter />
            </div>
            <div>
              <div className="store-page-title-row">
                <h1>Stores</h1>
                <span className="store-count-badge">{totalStores}</span>
              </div>
              <p>Manage all your restaurant stores from one place.</p>
            </div>
          </div>
          <Link to="/restaurant/store/add" className="store-add-button">
            <FaPlus />
            <span>Add Store</span>
          </Link>
        </div>

        {/* STATISTICS CARDS */}
        <section className="store-statistics-grid">
          <div className="store-stat-card total">
            <div className="store-stat-content">
              <strong>{totalStores}</strong>
              <span>Total stores</span>
            </div>
            <div className="store-stat-icon">
              <FaStore />
            </div>
          </div>

          <div className="store-stat-card active">
            <div className="store-stat-content">
              <strong>{activeStores}</strong>
              <span>Active stores</span>
            </div>
            <div className="store-stat-icon">
              <FaCheckCircle />
            </div>
          </div>

          <div className="store-stat-card inactive">
            <div className="store-stat-content">
              <strong>{inactiveStores}</strong>
              <span>Inactive stores</span>
            </div>
            <div className="store-stat-icon">
              <FaTimesCircle />
            </div>
          </div>

          <div className="store-stat-card newly-joined">
            <div className="store-stat-content">
              <strong>{newlyJoinedStores}</strong>
              <span>Newly joined stores</span>
            </div>
            <div className="store-stat-icon">
              <FaPlus />
            </div>
          </div>
        </section>

        {/* TRANSACTION SUMMARY */}
        <section className="store-summary-bar">
          <div className="store-summary-item">
            <div className="store-summary-icon blue">
              <FaFileInvoiceDollar />
            </div>
            <div>
              <span>Total Transactions</span>
              <strong>0</strong>
            </div>
          </div>

          <div className="store-summary-divider" />

          <div className="store-summary-item">
            <div className="store-summary-icon green">
              <FaCheckCircle />
            </div>
            <div>
              <span>Commission Earned</span>
              <strong>$ 0.00</strong>
            </div>
          </div>

          <div className="store-summary-divider" />

          <div className="store-summary-item">
            <div className="store-summary-icon red">
              <FaMoneyBillWave />
            </div>
            <div>
              <span>Total Store Withdraws</span>
              <strong>$ 0.00</strong>
            </div>
          </div>
        </section>

        {/* STORE TABLE CARD */}
        <section className="store-table-card">
          {/* TABLE HEADER */}
          <div className="store-table-header">
            <div>
              <h2>Stores List</h2>
              <p>View and manage all registered stores.</p>
            </div>
            <div className="store-table-actions">
              <div className="store-search-box">
                <input
                  type="text"
                  placeholder="Search store name or email"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="store-search-clear"
                    onClick={clearSearch}
                    title="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
                <button
                  type="button"
                  className="store-search-button"
                  title="Search"
                >
                  <FaSearch />
                </button>
              </div>
              <div className="store-export-wrapper">
                <button
                  type="button"
                  className="store-export-button"
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
                  <div className="store-export-menu">
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

          {/* TABLE */}
          <div className="store-table-wrapper">
            <table className="store-table">
              <thead>
                <tr>
                  <th className="store-checkbox-column">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th onClick={() => handleSort("srNo")} className="sortable">
                    <span>SR NO</span>
                    {renderSortIcon("srNo")}
                  </th>
                  <th
                    onClick={() => handleSort("storeName")}
                    className="sortable store-information-column"
                  >
                    <span>Store Information</span>
                    {renderSortIcon("storeName")}
                  </th>
                  <th
                    onClick={() => handleSort("ownerName")}
                    className="sortable owner-information-column"
                  >
                    <span>Owner Information</span>
                    {renderSortIcon("ownerName")}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="sortable status-column"
                  >
                    <span>Status</span>
                    {renderSortIcon("status")}
                  </th>
                  <th className="action-column">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="store-empty-state">
                      <div>
                        <FaStore />
                        <h3>Loading stores...</h3>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="store-empty-state">
                      <div>
                        <FaStore />
                        <h3>Something went wrong</h3>
                        <p>{error}</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStores.length > 0 ? (
                  filteredStores.map((store) => (
                    <tr
                      key={store.id}
                      className={
                        selectedStores.includes(store.id)
                          ? "store-row-selected"
                          : ""
                      }
                      onClick={() =>
                        navigate(`/restaurant/store/view_store/${store.id}`, {
                          state: { store },
                        })
                      }
                    >
                      <td
                        className="store-checkbox-column"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStores.includes(store.id)}
                          onChange={() => handleSelectStore(store.id)}
                        />
                      </td>
                      <td className="store-sr-number">{store.srNo}</td>
                      <td className="store-information">
                        <div className="store-info-wrapper">
                          <StoreLogo
                            src={store.storeLogo}
                            name={store.storeName}
                          />
                          <div className="store-info-text">
                            <strong>{store.storeName}</strong>
                            <span>Id: {store.id}</span>
                          </div>
                        </div>
                      </td>
                      <td
                        className="owner-information"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <strong>{store.ownerName}</strong>
                        <a href={`tel:${store.phone}`}>{store.phone}</a>
                        <a href={`mailto:${store.email}`}>{store.email}</a>
                      </td>
                      <td
                        className="status-column"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className={`store-status-toggle ${store.status ? "active" : "inactive"}`}
                          onClick={() => handleStatusToggle(store)}
                          title={
                            store.status ? "Deactivate store" : "Activate store"
                          }
                        >
                          <span />
                        </button>
                      </td>
                      <td
                        className="action-column"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="store-action-buttons">
                          <button
                            type="button"
                            className="store-action-btn view"
                            title="View Store"
                            onClick={() => {
                              navigate(
                                `/restaurant/store/view_store/${store.id}`,
                                { state: { store } },
                              );
                            }}
                          >
                            <FaEye />
                          </button>
                          <button
                            type="button"
                            className="store-action-btn edit"
                            title="Edit Store"
                            onClick={() => {
                              navigate(
                                `/restaurant/store/edit_store/${store.id}`,
                                { state: { store } },
                              );
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            className="store-action-btn delete"
                            title="Delete Store"
                            onClick={() => handleDeleteStore(store)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="store-empty-state">
                      <div>
                        <FaStore />
                        <h3>No stores found</h3>
                        <p>Try changing your search or add a new store.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* BULK ACTION BAR - APPEARS ONLY WHEN CHECKBOXES ARE SELECTED */}
        {selectedStores.length > 0 && (
          <div className="store-bulk-action-bar">
            <div className="store-bulk-info">
              <div className="store-bulk-selected-icon">
                <FaCheckCircle />
              </div>
              <div>
                <strong>
                  {selectedStores.length} store
                  {selectedStores.length > 1 ? "s" : ""} selected
                </strong>
                <span>Choose an action for the selected stores.</span>
              </div>
            </div>
            <div className="store-bulk-actions">
              <button
                type="button"
                className="store-bulk-cancel"
                onClick={() => setSelectedStores([])}
              >
                Cancel
              </button>
              <button
                type="button"
                className="store-bulk-delete"
                onClick={handleBulkDelete}
              >
                <FaTrash />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
    DELETE CONFIRMATION MODAL
========================================================= */}

        <ConfirmModal
          show={showDeleteConfirm}
          title={
            deleteType === "bulk" ? "Delete Selected Stores?" : "Delete Store?"
          }
          message={
            deleteType === "bulk"
              ? `Are you sure you want to delete ${selectedStores.length} selected store${
                  selectedStores.length > 1 ? "s" : ""
                }?`
              : `Are you sure you want to delete "${
                  deleteStore?.storeName || "this store"
                }"?`
          }
          confirmText="Yes"
          cancelText="No"
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => {
            if (deleteLoading) return;

            setShowDeleteConfirm(false);
            setDeleteType(null);
            setDeleteStore(null);
          }}
        />
        {/* =========================================================
    STATUS CONFIRMATION MODAL
========================================================= */}

        <ConfirmModal
          show={showStatusConfirm}
          title={statusStore?.status ? "Deactivate Store?" : "Activate Store?"}
          message={
            statusStore?.status
              ? "Are you sure you want to deactivate this store?"
              : "Are you sure you want to activate this store?"
          }
          confirmText="Yes"
          cancelText="No"
          loading={statusLoading}
          onConfirm={confirmStatusUpdate}
          onCancel={() => {
            setShowStatusConfirm(false);
            setStatusStore(null);
          }}
        />
        {/* =========================================================
    SUCCESS MODAL
========================================================= */}

        <SuccessModal
          show={showSuccessModal}
          title="Successfully Done!"
          message={successMessage}
          buttonText="OK"
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessMessage("");
          }}
        />
      </div>
    </>
  );
};

export default StoreList;
