import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEye,
  FaTrash,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import api from "../../../config/api";
import { getImage } from "../../utils/images";

import DataTable from "../../common/DataTable";
import "./vendorList.css";

const VendorList = () => {
  const navigate = useNavigate();
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [deleteVendor, setDeleteVendor] = useState(null);
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kycVendor, setKycVendor] = useState(null);
  const [kycUpdating, setKycUpdating] = useState(false);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);

      console.log("Fetching vendors...");

      const response = await api.get("/vendor/vendors");

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

  const handleKycStatusChange = useCallback((vendor) => {
    setKycVendor(vendor);
  }, []);

  const confirmKycStatusChange = async () => {
    if (!kycVendor?.id) {
      return;
    }

    try {
      setKycUpdating(true);

      const response = await api.patch(
        `/vendor/vendors/${kycVendor.id}/kyc-status`,
      );

      console.log("KYC status response:", response.data);

      if (response.data.success) {
        setKycVendor(null);
        fetchVendors();
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

  try {
    setLoading(true);

    const response = await api.delete(
      `/vendor/vendors/${deleteVendor.id}`
    );

    console.log("Delete vendor response:", response.data);

    if (response.data.success) {
      setDeleteVendor(null);

      // Refresh vendor list
      await fetchVendors();

      // Agar deleted vendor selected tha to selection se bhi remove karo
      setSelectedVendors((previous) =>
        previous.filter((id) => id !== deleteVendor.id)
      );
    } else {
      console.error(
        response.data.message || "Failed to delete vendor."
      );
    }
  } catch (error) {
    console.error(
      "Delete vendor error:",
      error.response?.data || error
    );
  } finally {
    setLoading(false);
  }
};

  const handleDeleteSelected = async () => {
    if (selectedVendors.length === 0) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.delete("/vendor/vendors/selected", {
        data: {
          vendor_ids: selectedVendors,
        },
      });

      console.log("Delete selected vendors response:", response.data);

      if (response.data.success) {
        // Clear selected vendors
        setSelectedVendors([]);

        // Refresh vendor list
        fetchVendors();
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
          <div className="vendor-select-header">
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
            className="vendor-row-checkbox"
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
          <span className="vendor-serial">{rowIndex + 1}</span>
        ),
      },

      // IMAGE
      {
        key: "image",
        label: "Image",
        width: "120px",
        sortable: false,
        render: (value, row) => (
          <div className="vendor-image-wrapper">
            <img src={value} alt={row.vendorName} className="vendor-image" />
          </div>
        ),
      },

      // VENDOR NAME
      {
        key: "vendorName",
        label: "Vendor Name",
        width: "100px",
        sortable: true,
        render: (value) => <span className="vendors-name">{value}</span>,
      },

      // SHOP NAME
      {
        key: "shopName",
        label: "Shop Name",
        width: "150px",
        sortable: true,
        render: (value) => <div className="vendor-shop-name">{value}</div>,
      },

      // CATEGORY
      {
        key: "category",
        label: "Category",
        width: "120px",
        sortable: true,
        render: (value) => <span className="vendor-category">{value}</span>,
      },

      // UPLOAD DOCUMENT
      {
        key: "uploadDoc",
        label: (
          <span className="vendor-upload-header">
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
            className="vendor-upload-btn"
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
                ? "vendor-kyc-approved"
                : "vendor-kyc-pending"
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
          <div className="vendor-actions">
            <button
              type="button"
              className="vendor-view-btn"
              onClick={() => handleViewDetail(row)}
            >
              <FaEye />
              <span>View Detail</span>
            </button>
            <button
              type="button"
              className="vendor-delete-btn"
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
    <div className="vendor-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="vendor-page-header">
        <div>
          <h2 className="vendor-page-title">Vendor List</h2>
          <div className="vendor-breadcrumb">
            <Link to="/home">Home</Link>
            <span>
              <IoIosArrowForward />
            </span>
            <span className="vendor-breadcrumb-active">Vendor List</span>
          </div>
        </div>
      </div>
      {/* =====================================================
          CONTENT CARD
      ===================================================== */}
      <div className="vendor-card">
        <div className="vendor-card-header">
          <h3>Vendor List</h3>
          <button
            type="button"
            className="vendor-add-btn"
            onClick={() => navigate("/vendor/add")}
          >
            <FaPlus />
            <span>Add Vender</span>
          </button>
        </div>

        {/* ===================================================
            COMMON DATATABLE
        =================================================== */}

        <div className="vendor-table-wrapper">
          {loading ? (
            <div className="vendor-loading">Loading vendors...</div>
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

      {selectedVendors.length > 0 && (
        <div className="vendor-selected-actions">
          <span className="vendor-selected-count">
            {selectedVendors.length} vendor
            {selectedVendors.length > 1 ? "s" : ""} selected
          </span>

          <button
            type="button"
            className="vendor-selected-delete-btn"
            onClick={handleDeleteSelected}
          >
            <FaTrash />({selectedVendors.length}) Delete Selected
          </button>
        </div>
      )}
      {/* =====================================================
          DELETE MODAL
      ===================================================== */}
      {deleteVendor && (
        <div className="vendor-modal-overlay">
          <div className="vendor-delete-modal">
            <div className="vendor-delete-icon">
              <FaTrash />
            </div>

            <h3>Are you sure?</h3>

            <p>
              You want to delete <strong>{deleteVendor.vendorName}</strong>?
            </p>

            <div className="vendor-modal-actions">
              <button
                type="button"
                className="vendor-confirm-delete"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>

              <button
                type="button"
                className="vendor-cancel-delete"
                onClick={() => setDeleteVendor(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {kycVendor && (
        <div className="vendor-kyc-modal-overlay">
          <div className="vendor-kyc-modal">
            <h3>Change KYC Status</h3>

            <p>
              Do you want to change KYC status for{" "}
              <strong>{kycVendor.name}</strong>?
            </p>

            <div className="vendor-kyc-modal-actions">
              <button
                type="button"
                className="vendor-kyc-cancel-btn"
                onClick={() => setKycVendor(null)}
                disabled={kycUpdating}
              >
                No
              </button>

              <button
                type="button"
                className="vendor-kyc-confirm-btn"
                onClick={confirmKycStatusChange}
                disabled={kycUpdating}
              >
                {kycUpdating ? "Updating..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorList;
