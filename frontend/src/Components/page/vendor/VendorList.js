import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEye,
  FaTrash,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import api from "../../../config/api";
import { getImage } from "../../utils/images";

import DataTable from "../../common/DataTable";
import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceConfirmModal from "../../common/modal/serviceModal/ServiceConfirmModal";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";
import "./vendorList.css";

const VendorList = () => {
  const navigate = useNavigate();
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [deleteVendor, setDeleteVendor] = useState(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kycVendor, setKycVendor] = useState(null);
  const [kycUpdating, setKycUpdating] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const showSuccess = useCallback((title, message) => {
    setSuccessModal({ isOpen: true, title, message });
  }, []);

  const closeSuccess = useCallback(() => {
    setSuccessModal((previous) => ({ ...previous, isOpen: false }));
  }, []);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);

      console.log("Fetching vendors...");

      const response = await api.get("/admin/vendors");

      console.log("Vendor API Response:", response.data);

      if (response.data.success) {
        const formattedVendors = response.data.data.map((vendor) => ({
          ...vendor,
          vendorName: vendor.name,
          shopName: vendor.shop_name || vendor.business_name || "-",
          category: vendor.category_name || "-",
          image: getImage(vendor.image),
          uploadDoc: true,
          kyc: Number(vendor.is_kyc_approved) === 1 ? "Approved" : "Pending",
        }));

        console.log("Formatted Vendors:", formattedVendors);

        setVendorData(formattedVendors);
      } else {
        console.error(response.data.message || "Failed to fetch vendors");
      }
    } catch (error) {
      console.error("Vendor API Error:", error);

      if (error.response) {
        console.error("Server Response:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // =========================================================
  // SELECT SINGLE VENDOR
  // =========================================================

  const handleSelectVendor = useCallback((id) => {
    setSelectedVendors((previous) => {
      if (previous.includes(id)) {
        return previous.filter((vendorId) => vendorId !== id);
      }
      return [...previous, id];
    });
  }, []);

  // =========================================================
  // KYC STATUS
  // =========================================================

  const handleKycStatusChange = useCallback((vendor) => {
    setKycVendor(vendor);
  }, []);

  const confirmKycStatusChange = async () => {
    if (!kycVendor?.id) {
      return;
    }

    const vendorName = kycVendor.name;
    const nextStatus = kycVendor.kyc === "Approved" ? "Pending" : "Approved";

    try {
      setKycUpdating(true);

      const response = await api.patch(
        `/admin/vendors/${kycVendor.id}/kyc-status`,
      );

      console.log("KYC status response:", response.data);

      if (response.data.success) {
        setKycVendor(null);
        fetchVendors();
        showSuccess(
          "Status Updated!",
          `KYC status for ${vendorName} is now ${nextStatus}.`,
        );
      } else {
        alert(response.data.message || "Failed to change KYC status.");
      }
    } catch (error) {
      console.error("KYC status error:", error.response?.data || error);

      alert(error.response?.data?.message || "Failed to change KYC status.");
    } finally {
      setKycUpdating(false);
    }
  };

  // =========================================================
  // SELECT ALL
  // =========================================================

  const allSelected =
    vendorData.length > 0 && selectedVendors.length === vendorData.length;
  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedVendors([]);
      return;
    }
    setSelectedVendors(vendorData.map((vendor) => vendor.id));
  }, [allSelected, vendorData]);

  // =========================================================
  // VIEW DETAIL
  // =========================================================

  const handleViewDetail = useCallback(
    (vendor) => {
      navigate(`/vendor/view/${vendor.id}`, {
        state: {
          vendor,
        },
      });
    },
    [navigate],
  );

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = useCallback((vendor) => {
    setDeleteVendor(vendor);
  }, []);

  const confirmDelete = async () => {
    if (!deleteVendor?.id) {
      return;
    }

    const vendorName = deleteVendor.vendorName;

    try {
      setLoading(true);

      const response = await api.delete(`/admin/vendors/${deleteVendor.id}`);

      console.log("Delete vendor response:", response.data);

      if (response.data.success) {
        setDeleteVendor(null);

        // Refresh vendor list
        await fetchVendors();

        // Agar deleted vendor selected tha to selection se bhi remove karo
        setSelectedVendors((previous) =>
          previous.filter((id) => id !== deleteVendor.id),
        );

        showSuccess(
          "Vendor Deleted!",
          `${vendorName} has been deleted successfully.`,
        );
      } else {
        console.error(response.data.message || "Failed to delete vendor.");
      }
    } catch (error) {
      console.error("Delete vendor error:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedVendors.length === 0) {
      return;
    }

    const deletedCount = selectedVendors.length;

    try {
      setLoading(true);

      const response = await api.delete("/admin/vendors/selected", {
        data: {
          vendor_ids: selectedVendors,
        },
      });

      console.log("Delete selected vendors response:", response.data);

      if (response.data.success) {
        // Clear selected vendors
        setSelectedVendors([]);
        setShowBulkDelete(false);

        // Refresh vendor list
        fetchVendors();

        showSuccess(
          "Vendors Deleted!",
          `${deletedCount} vendor${deletedCount > 1 ? "s have" : " has"} been deleted successfully.`,
        );
      } else {
        console.error(
          response.data.message || "Failed to delete selected vendors.",
        );
      }
    } catch (error) {
      console.error(
        "Delete selected vendors error:",
        error.response?.data || error,
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UPLOAD DOCUMENT
  // =========================================================

  const handleUploadDocument = useCallback(
    (vendor) => {
      navigate(`/vendor/upload_documents/${vendor.id}`, {
        state: {
          vendorId: vendor.id,
        },
      });
    },
    [navigate],
  );

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      // SELECT
      {
        key: "select",
        label: (
          <div className="venl-vendor-select-header">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              onClick={(event) => event.stopPropagation()}
            />

            <span>All</span>
            <span>Select</span>
          </div>
        ),
        width: "50px",
        sortable: false,
        render: (_, row) => (
          <input
            type="checkbox"
            className="venl-vendor-row-checkbox"
            checked={selectedVendors.includes(row.id)}
            onChange={() => handleSelectVendor(row.id)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },

      // SERIAL NUMBER
      {
        key: "serial",
        label: "Sr.No",
        width: "20px",
        sortable: false,
        render: (_, row, rowIndex) => (
          <span className="venl-vendor-serial">{rowIndex + 1}</span>
        ),
      },

      // IMAGE
      {
        key: "image",
        label: "Image",
        width: "120px",
        sortable: false,
        render: (value, row) => (
          <div className="venl-vendor-image-wrapper">
            <img
              src={value}
              alt={row.vendorName}
              className="venl-vendor-image"
            />
          </div>
        ),
      },

      // VENDOR NAME
      {
        key: "vendorName",
        label: "Vendor Name",
        width: "100px",
        sortable: true,
        render: (value) => <span className="venl-vendors-name">{value}</span>,
      },

      // SHOP NAME
      {
        key: "shopName",
        label: "Shop Name",
        width: "150px",
        sortable: true,
        render: (value) => (
          <div className="venl-vendor-shop-name">{value}</div>
        ),
      },

      // CATEGORY
      {
        key: "category",
        label: "Category",
        width: "120px",
        sortable: true,
        render: (value) => (
          <span className="venl-vendor-category">{value}</span>
        ),
      },

      // UPLOAD DOCUMENT
      {
        key: "uploadDoc",
        label: (
          <span className="venl-vendor-upload-header">
            Upload
            <br />
            Doc
          </span>
        ),
        width: "70px",
        sortable: false,
        render: (_, row) => (
          <button
            type="button"
            className="venl-vendor-upload-btn"
            title="Upload Document"
            onClick={() => handleUploadDocument(row)}
          >
            <FaCloudUploadAlt />
          </button>
        ),
      },

      // KYC
      {
        key: "kyc",
        label: "KYC",
        width: "130px",
        sortable: true,
        render: (value, row) => (
          <button
            type="button"
            className={
              value === "Approved"
                ? "venl-vendor-kyc-approved"
                : "venl-vendor-kyc-pending"
            }
            onClick={() => handleKycStatusChange(row)}
            title="Change KYC Status"
          >
            {value === "Approved" ? <FaCheckCircle /> : <FaClock />}
            {value}
          </button>
        ),
      },

      // ACTION
      {
        key: "actions",
        label: "Action",
        width: "100px",
        sortable: false,
        render: (_, row) => (
          <div className="venl-vendor-actions">
            <button
              type="button"
              className="venl-vendor-view-btn"
              onClick={() => handleViewDetail(row)}
            >
              <FaEye />
              <span>View Detail</span>
            </button>
            <button
              type="button"
              className="venl-vendor-delete-btn"
              onClick={() => handleDelete(row)}
            >
              <FaTrash />
              <span>Delete</span>
            </button>
          </div>
        ),
      },
    ],
    [
      selectedVendors,
      allSelected,
      handleSelectAll,
      handleSelectVendor,
      handleUploadDocument,
      handleViewDetail,
      handleDelete,
      handleKycStatusChange,
    ],
  );

  return (
    <div className="venl-vendor-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="venl-vendor-page-header">
        <div>
          <h2 className="venl-vendor-page-title">Vendor List</h2>
          <ServiceBreadcrumbs items={[{ label: "Vendor List" }]} />
        </div>
      </div>

      {/* =====================================================
          CONTENT CARD
      ===================================================== */}
      <div className="venl-vendor-card">
        <div className="venl-vendor-card-header">
          <h3>
            Vendor List
            {!loading && (
              <span className="venl-vendor-count">{vendorData.length}</span>
            )}
          </h3>
          <button
            type="button"
            className="venl-vendor-add-btn"
            onClick={() => navigate("/vendor/add")}
          >
            <FaPlus />
            <span>Add Vendor</span>
          </button>
        </div>

        {/* ===================================================
            COMMON DATATABLE
        =================================================== */}

        <div className="venl-vendor-table-wrapper">
          {loading ? (
            <div className="venl-vendor-loading">
              <span
                className="venl-vendor-loading-spinner"
                aria-hidden="true"
              />
              Loading vendors...
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={vendorData}
              entriesPerPageOptions={[5, 10, 25, 50, 100]}
              defaultEntriesPerPage={10}
              searchable={true}
              sortable={true}
            />
          )}
        </div>
      </div>

      {/* =====================================================
          SELECTED ACTION BAR
      ===================================================== */}
      {selectedVendors.length > 0 && (
        <div className="venl-vendor-selected-actions">
          <span className="venl-vendor-selected-count">
            {selectedVendors.length} vendor
            {selectedVendors.length > 1 ? "s" : ""} selected
          </span>

          <button
            type="button"
            className="venl-vendor-selected-delete-btn"
            onClick={() => setShowBulkDelete(true)}
          >
            <FaTrash />({selectedVendors.length}) Delete Selected
          </button>
        </div>
      )}

      {/* =====================================================
          CONFIRM + SUCCESS MODALS
      ===================================================== */}
      <ServiceConfirmModal
        isOpen={Boolean(deleteVendor)}
        variant="danger"
        title="Delete Vendor?"
        message={`You want to delete ${deleteVendor?.vendorName || "this vendor"}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteVendor(null)}
      />

      <ServiceConfirmModal
        isOpen={showBulkDelete}
        variant="danger"
        title="Delete Selected Vendors?"
        message={`You are about to delete ${selectedVendors.length} selected vendor${selectedVendors.length > 1 ? "s" : ""}. This action cannot be undone.`}
        confirmText="Yes, Delete All"
        cancelText="Cancel"
        onConfirm={handleDeleteSelected}
        onCancel={() => setShowBulkDelete(false)}
      />

      <ServiceConfirmModal
        isOpen={Boolean(kycVendor)}
        variant="primary"
        title="Change KYC Status?"
        message={`Do you want to change KYC status for ${kycVendor?.name || "this vendor"} to ${kycVendor?.kyc === "Approved" ? "Pending" : "Approved"}?`}
        confirmText="Yes, Change"
        cancelText="No"
        isLoading={kycUpdating}
        onConfirm={confirmKycStatusChange}
        onCancel={() => setKycVendor(null)}
      />

      <ServiceSuccessModal
        isOpen={successModal.isOpen}
        title={successModal.title}
        message={successModal.message}
        onClose={closeSuccess}
      />
    </div>
  );
};

export default VendorList;
