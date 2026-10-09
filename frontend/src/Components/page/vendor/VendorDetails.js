import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaEye,
  FaUpload,
  FaStore,
  FaFileAlt,
  FaBriefcase,
  FaCalendarAlt,
  FaTimes,
  FaCheck,
  FaDownload,
  FaExternalLinkAlt,
} from "react-icons/fa";
import api from "../../../config/api";
import { getImage } from "../../utils/images";

import "./vendorDetails.css";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

const VendorDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState(location.state?.vendor || null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vendor");
  const [showPassword, setShowPassword] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [cities, setCities] = useState([]);

  const { id } = useParams();
  const vendor = {
    ...(location.state?.vendor || {}),
    ...(vendorData || {}),
    id: vendorData?.id ?? location.state?.vendor?.id ?? id,
    vendorName: vendorData?.name || location.state?.vendor?.vendorName || "",
    image: vendorData?.image || location.state?.vendor?.image || "",
  };

  const [accountStatus, setAccountStatus] = useState(vendor.status || "Active");
  const [vendorDetails, setVendorDetails] = useState({
    vendorName: vendor.vendorName || "",
    email: vendor.email || "",
    mobile: vendor.mobile || "",
    password: vendor.password || "",
    city: vendor.city || "",
    about: vendor.about || "",
  });

  useEffect(() => {
    const fetchVendorDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await api.get(`/vendor/vendors/${id}`);

        console.log("Vendor Detail API Response:", response.data);
        if (response.data.success) {
          setVendorData(response.data.data);
        } else {
          console.error(
            response.data.message || "Failed to fetch vendor details.",
          );
        }
      } catch (error) {
        console.error(
          "Vendor Detail API Error:",
          error.response?.data || error,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchVendorDetails();
  }, [id]);

  useEffect(() => {
    if (!vendorData) {
      return;
    }

    console.log("Mapping Vendor API Data:", vendorData);

    // Vendor / Personal Details
    setVendorDetails({
      vendorName: vendorData.name || "",
      email: vendorData.email_id || "",
      mobile: vendorData.mobile || "",
      password: vendorData.password || "",
      city: vendorData.city_id || "",
      about: vendorData.about || "",
    });

    // Shop Details
    setShopDetails({
      category: vendorData.category_name || "",
      shopName: vendorData.shop_name || "",
      hstNumber: vendorData.hst_number || "",
    });

    // Bank Details
    setBankDetails({
      accHolderName: vendorData.acc_holder_name || "",
      transitNumber: vendorData.tansit_number || "",
      accountNumber: vendorData.account_number || "",
      branchName: vendorData.branch_name || "",
      branchAddress: vendorData.branch_address || "",
      institutionNumber: vendorData.institution_number || "",
    });

    // Account Status
    setAccountStatus(Number(vendorData.status) === 1 ? "Active" : "Deactive");
  }, [vendorData]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/vendor/cities");
        const result = await response.json();

        if (result.success) {
          setCities(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
    };

    fetchCities();
  }, []);
  /* =========================================
     SHOP DETAILS
  ========================================= */

  const [shopDetails, setShopDetails] = useState({
    category: vendor.category || "",
    shopName: vendor.shopName || "",
    hstNumber: vendor.hstNumber || "",
  });

  /* =========================================
     BANK DETAILS
  ========================================= */

  const [bankDetails, setBankDetails] = useState({
    accHolderName: vendor.accHolderName || "",
    transitNumber: vendor.transitNumber || "",
    accountNumber: vendor.accountNumber || "",
    branchName: vendor.branchName || "",
    branchAddress: vendor.branchAddress || "",
    institutionNumber: vendor.institutionNumber || "",
  });

  /* =========================================
     DOCUMENTS
     
     These can later come directly from API.
     
     Example:
     vendor.documents.contractId = {
       submitted: true,
       url: "..."
     }
  ========================================= */

  const documents = {
    contractId: vendorData?.contract_id || null,
    tradeLicence: vendorData?.trade_license || null,
    ownerId: vendorData?.owner_id || null,
    registrationId: vendorData?.registration_id || null,
    computerCard: vendorData?.computer_card || null,
    priceList: vendorData?.price_list || null,
    idProof: vendorData?.id_proof || null,
    businessLicence: null,
    padForm: vendorData?.pad_file || null,
  };

  const bookingData = [
    {
      id: 101,
      customerName: "John Smith",
      address: "Toronto, Ontario",
      paidAmount: "$250.00",
      transaction: "TXN10245",
      bookedDate: "20 Aug 2026, 10:30 AM",
      status: "Confirmed",
    },
    {
      id: 102,
      customerName: "Michael Brown",
      address: "Brampton, Ontario",
      paidAmount: "$180.00",
      transaction: "TXN10246",
      bookedDate: "21 Aug 2026, 12:15 PM",
      status: "Pending",
    },
    {
      id: 103,
      customerName: "David Wilson",
      address: "Mississauga, Ontario",
      paidAmount: "$320.00",
      transaction: "TXN10247",
      bookedDate: "22 Aug 2026, 03:45 PM",
      status: "Confirmed",
    },
  ];

  const completedBookings = [
    {
      id: 91,
      customerName: "Robert Johnson",
      address: "Brampton, Ontario",
      paidAmount: "$200.00",
      transaction: "TXN10101",
      bookedDate: "10 Aug 2026, 11:20 AM",
      status: "Completed",
    },
    {
      id: 92,
      customerName: "James Anderson",
      address: "Toronto, Ontario",
      paidAmount: "$150.00",
      transaction: "TXN10102",
      bookedDate: "12 Aug 2026, 02:10 PM",
      status: "Completed",
    },
  ];

  const handleVendorChange = (event) => {
    const { name, value } = event.target;
    setVendorDetails((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleShopChange = (event) => {
    const { name, value } = event.target;
    setShopDetails((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleBankChange = (event) => {
    const { name, value } = event.target;
    setBankDetails((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAccountStatusClick = () => {
    setShowStatusModal(true);
  };

  const confirmAccountStatus = () => {
    const newStatus = accountStatus === "Active" ? "Deactive" : "Active";
    setAccountStatus(newStatus);
    setShowStatusModal(false);
    console.log("Vendor account status changed:", newStatus);
  };

  /* =========================================
     CANCEL STATUS
  ========================================= */

  const cancelAccountStatus = () => {
    setShowStatusModal(false);
  };

  /* =========================================
     UPLOAD DOCUMENT PAGE
  ========================================= */

  const handleUploadDocuments = () => {
    navigate(`/vendor/upload_documents/${vendor.id}`, {
      state: {
        vendor,
      },
    });
  };

  /* =========================================
     SERVICES PAGE
  ========================================= */

  const handleServices = () => {
    navigate(`/vendor/services/${id}`, {
      state: {
        vendor,
      },
    });
  };

  /* =========================================
     UPDATE VENDOR
  ========================================= */

  const handleVendorUpdate = () => {
    const updatedVendor = {
      ...vendor,
      ...vendorDetails,
    };
    console.log("Updated vendor:", updatedVendor);
    alert("Vendor details updated successfully.");
  };

  /* =========================================
     UPDATE SHOP
  ========================================= */

  const handleShopUpdate = () => {
    const updatedVendor = {
      ...vendor,
      ...shopDetails,
    };
    console.log("Updated shop:", updatedVendor);
    alert("Shop details updated successfully.");
  };

  /* =========================================
     UPDATE BANK
  ========================================= */

  const handleBankUpdate = () => {
    const updatedVendor = {
      ...vendor,
      ...bankDetails,
    };
    console.log("Updated bank details:", updatedVendor);
    alert("Bank details updated successfully.");
  };

  /* =========================================
     DOCUMENT STATUS
  ========================================= */

  const isDocumentSubmitted = (document) => {
    if (!document) {
      return false;
    }
    if (typeof document === "string") {
      return document.trim() !== "";
    }
    return document.submitted === true || !!document.url;
  };

  /* =========================================
     DOCUMENT ACTION
  ========================================= */

  const handleDocumentAction = (document) => {
    if (!document) {
      return;
    }
    const documentUrl = typeof document === "string" ? document : document.url;
    if (documentUrl) {
      window.open(documentUrl, "_blank");
    } else {
      alert("Document is available but no file URL is attached yet.");
    }
  };

  /* =========================================
     BOOKING TABLE
  ========================================= */

  const renderBookingTable = (data) => {
    return (
      <div className="vendor-table-wrapper">
        <table className="vendor-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Booked ID</th>
              <th>Customer Name</th>
              <th>Booking Address</th>
              <th>Paid Amount</th>
              <th>Transaction</th>
              <th>Booked Date Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((booking, index) => (
                <tr key={booking.id}>
                  <td>{index + 1}</td>
                  <td>{booking.id}</td>
                  <td>{booking.customerName}</td>
                  <td>{booking.address}</td>
                  <td>{booking.paidAmount}</td>
                  <td>{booking.transaction}</td>
                  <td>{booking.bookedDate}</td>

                  <td>
                    <span
                      className={`booking-status ${booking.status.toLowerCase()}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="vendor-action-button"
                      title="View Booking"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="vendor-empty-row">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  /* =========================================
     DOCUMENT ROW
  ========================================= */

  const renderDocumentRow = (label, document) => {
    const submitted = isDocumentSubmitted(document);

    return (
      <div className="document-row">
        <div className="document-name">
          <FaFileAlt />
          <span>{label}</span>
        </div>
        <div className="document-status">
          {submitted ? (
            <button
              type="button"
              className="document-view-button"
              onClick={() => handleDocumentAction(document)}
            >
              {document?.download ? (
                <>
                  <FaDownload />
                  Download
                </>
              ) : (
                <>
                  <FaEye />
                  View
                </>
              )}
            </button>
          ) : (
            <span className="document-not-submitted">Not Submitted</span>
          )}
        </div>
      </div>
    );
  };

  /* =========================================
     VENDOR TAB
  ========================================= */

  const renderVendorTab = () => {
    return (
      <>
        {/* LOGO */}

        <div className="vendor-logo-wrapper">
          {vendor.image ? (
            <img
              src={getImage(vendor.image)}
              alt={vendor.vendorName || "Vendor"}
              className="vendor-logo-image"
            />
          ) : (
            <div className="vendor-logo-placeholder">
              <FaStore />
            </div>
          )}
        </div>

        {/* PERSONAL DETAILS */}

        <div className="vendor-section">
          <div className="vendor-section-title">
            <h3>Personal Detail</h3>
          </div>
          <div className="vendor-section-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="vendor-label">Full Name</label>
                <input
                  type="text"
                  name="vendorName"
                  className="form-control vendor-input"
                  value={vendorDetails.vendorName}
                  onChange={handleVendorChange}
                />
              </div>

              <div className="col-md-6">
                <label className="vendor-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control vendor-input"
                  value={vendorDetails.email}
                  onChange={handleVendorChange}
                />
              </div>

              <div className="col-md-6">
                <label className="vendor-label">Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  className="form-control vendor-input"
                  value={vendorDetails.mobile}
                  onChange={handleVendorChange}
                />
              </div>

              <div className="col-md-6">
                <label className="vendor-label">Password</label>

                <div className="vendor-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control vendor-input"
                    value={vendorDetails.password}
                    onChange={handleVendorChange}
                  />
                  <button
                    type="button"
                    className="vendor-password-button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FaEye />
                  </button>
                </div>
              </div>

              <div className="col-sm-6 form-group">
                <label>City</label>

                <select
                  name="city"
                  className="form-control vendor-input"
                  value={vendorDetails.city}
                  onChange={handleVendorChange}
                >
                  <option value="">Select City</option>

                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.city_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="vendor-label">About</label>
                <textarea
                  name="about"
                  className="form-control vendor-input vendor-textarea"
                  value={vendorDetails.about}
                  onChange={handleVendorChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BANK DETAILS */}

        <div className="vendor-section">
          <div className="vendor-section-title">
            <h3>Bank Detail</h3>
          </div>

          <div className="vendor-section-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="vendor-label">Acc Holder Name</label>
                <input
                  type="text"
                  name="accHolderName"
                  className="form-control vendor-input"
                  value={bankDetails.accHolderName}
                  onChange={handleBankChange}
                />
              </div>

              <div className="col-md-6">
                <label className="vendor-label">Transit Number</label>
                <input
                  type="text"
                  name="transitNumber"
                  className="form-control vendor-input"
                  value={bankDetails.transitNumber}
                  onChange={handleBankChange}
                />
              </div>

              <div className="col-md-6">
                <label className="vendor-label">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  className="form-control vendor-input"
                  value={bankDetails.accountNumber}
                  onChange={handleBankChange}
                />
              </div>

              <div className="col-md-6">
                <label className="vendor-label">Branch Name</label>
                <input
                  type="text"
                  name="branchName"
                  className="form-control vendor-input"
                  value={bankDetails.branchName}
                  onChange={handleBankChange}
                />
              </div>

              <div className="col-md-6">
                <label className="vendor-label">Branch Address</label>
                <input
                  type="text"
                  name="branchAddress"
                  className="form-control vendor-input"
                  value={bankDetails.branchAddress}
                  onChange={handleBankChange}
                />
              </div>
              <div className="col-md-6">
                <label className="vendor-label">Institution Number</label>
                <input
                  type="text"
                  name="institutionNumber"
                  className="form-control vendor-input"
                  value={bankDetails.institutionNumber}
                  onChange={handleBankChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="vendor-update-wrapper">
          <button
            type="button"
            className="vendor-update-button"
            onClick={handleVendorUpdate}
          >
            Update Now
          </button>
        </div>
      </>
    );
  };

  /* =========================================
     SHOP TAB
  ========================================= */

  const renderShopTab = () => {
    return (
      <div className="vendor-tab-content">
        <div className="vendor-content-heading">
          <div>
            <h3>Shop Details</h3>
            <p>Manage shop information for this vendor.</p>
          </div>
          <FaStore />
        </div>

        <div className="vendor-form-card">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="vendor-label">
                Category <span>*</span>
              </label>

              <select
                className="form-select vendor-input"
                name="category"
                value={shopDetails.category}
                onChange={handleShopChange}
              >
                <option value="">Select Category</option>
                <option value="Photography & Videography">
                  Photography & Videography
                </option>
                <option value="Restaurant">Restaurant</option>
                <option value="Beauty & Salon">Beauty & Salon</option>
                <option value="Event Services">Event Services</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="vendor-label">
                Shop Name <span>*</span>
              </label>
              <input
                type="text"
                name="shopName"
                className="form-control vendor-input"
                value={shopDetails.shopName}
                onChange={handleShopChange}
              />
            </div>
            <div className="col-md-6">
              <label className="vendor-label">
                HST Number <span>*</span>
              </label>
              <input
                type="text"
                name="hstNumber"
                className="form-control vendor-input"
                value={shopDetails.hstNumber}
                onChange={handleShopChange}
              />
            </div>
          </div>
          <div className="shop-save-wrapper">
            <button
              type="button"
              className="vendor-update-button"
              onClick={handleShopUpdate}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* =========================================
     INPROCESS BOOKING
  ========================================= */

  const renderInProcessBookingTab = () => {
    return (
      <div className="vendor-tab-content">
        <div className="vendor-content-heading">
          <div>
            <h3>Inprocess Booking</h3>
            <p>Bookings currently in process.</p>
          </div>
          <FaCalendarAlt />
        </div>
        {renderBookingTable(bookingData)}
      </div>
    );
  };

  /* =========================================
     COMPLETED BOOKING
  ========================================= */

  const renderCompletedBookingTab = () => {
    return (
      <div className="vendor-tab-content">
        <div className="vendor-content-heading">
          <div>
            <h3>Completed Bookings</h3>
            <p>Previously completed vendor bookings.</p>
          </div>
          <FaCalendarAlt />
        </div>
        {renderBookingTable(completedBookings)}
      </div>
    );
  };

  /* =========================================
     DOCUMENTS
  ========================================= */

  const renderDocumentsTab = () => {
    return (
      <div className="vendor-tab-content">
        <div className="vendor-content-heading">
          <div>
            <h3>Documents Detail</h3>
            <p>View documents submitted by this vendor.</p>
          </div>
          <FaFileAlt />
        </div>

        <div className="documents-card">
          {renderDocumentRow("Contract ID", documents.contractId)}
          {renderDocumentRow("Trade Licence", documents.tradeLicence)}
          {renderDocumentRow("Owner Id", documents.ownerId)}
          {renderDocumentRow("Registration Id", documents.registrationId)}
          {renderDocumentRow("Computer Card", documents.computerCard)}
          {renderDocumentRow("Price list", documents.priceList)}
          {renderDocumentRow("Id Proof", documents.idProof)}
          {renderDocumentRow("Business Licence", documents.businessLicence)}
          {renderDocumentRow("PAD Form", documents.padForm)}
        </div>
        <div className="documents-bottom-action">
          <button
            type="button"
            className="vendor-upload-button"
            onClick={handleUploadDocuments}
          >
            <FaUpload />
            Manage Documents
          </button>
        </div>
      </div>
    );
  };

  /* =========================================
     SERVICES
  ========================================= */

  const renderServicesTab = () => {
    return (
      <div className="vendor-tab-content">
        <div className="vendor-content-heading">
          <div>
            <h3>Services</h3>
            <p>View the services provided by this vendor.</p>
          </div>
          <FaBriefcase />
        </div>
        <div className="services-card">
          <div className="services-icon">
            <FaBriefcase />
          </div>
          <h4>Vendor Services</h4>
          <p>
            Services provided by this vendor are managed on the services page.
          </p>
          <button
            type="button"
            className="services-page-button"
            onClick={handleServices}
          >
            <FaExternalLinkAlt />
            View Services
          </button>
        </div>
      </div>
    );
  };

  /* =========================================
     TABS
  ========================================= */

  const tabs = [
    {
      id: "vendor",
      label: "Vendor",
    },
    {
      id: "shop",
      label: "Shop",
    },
    {
      id: "inprocess",
      label: "Inprocess Booking",
    },
    {
      id: "completed",
      label: "Completed Booking",
    },
    {
      id: "documents",
      label: "Documents",
    },
    {
      id: "services",
      label: "Services",
    },
  ];

  /* =========================================
     ACTIVE TAB
  ========================================= */

  const renderActiveTab = () => {
    switch (activeTab) {
      case "shop":
        return renderShopTab();
      case "inprocess":
        return renderInProcessBookingTab();
      case "completed":
        return renderCompletedBookingTab();
      case "documents":
        return renderDocumentsTab();
      case "services":
        return renderServicesTab();
      default:
        return renderVendorTab();
    }
  };

  return (
    <div className="vendor-details-page">
      {/* Breadcrumb */}
      <div className="vendor-breadcrumb">
        <Link to="/home" className="vendor-breadcrumb-link">
          Home
        </Link>
        <IoIosArrowForward className="vendor-breadcrumb-icon" />
        <Link to="/vendor_list" className="vendor-breadcrumb-link">
          Vendors List
        </Link>
        <IoIosArrowForward className="vendor-breadcrumb-icon" />
        <span className="vendor-breadcrumb-active">View Vendor</span>
      </div>
      <div className="vendor-details-card">
        {/* your existing ViewVendor content */}
      </div>
      <div className="vendor-details-card">
        {/* =====================================
            HEADER
        ====================================== */}

        <div className="vendor-top-header">
          <div className="vendor-detail-name">
            Vendor: <strong>{vendor.vendorName || "Vendor Details"}</strong>
          </div>

          <div className="vendor-account-actions">
            <span className="vendor-account-label">Account:</span>

            <button
              type="button"
              className={`vendor-status-button ${
                accountStatus === "Active" ? "active" : "inactive"
              }`}
              onClick={handleAccountStatusClick}
            >
              {accountStatus === "Active" ? "Deactivate" : "Activate"}
            </button>

            <button
              type="button"
              className="vendor-upload-button"
              onClick={handleUploadDocuments}
            >
              <FaUpload />
              Upload Documents
            </button>
          </div>
        </div>

        {/* =====================================
            TABS
        ====================================== */}

        <div className="vendor-tabs-wrapper">
          <div className="vendor-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`vendor-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* =====================================
            CONTENT
        ====================================== */}

        <div className="vendor-content">{renderActiveTab()}</div>
      </div>

      {/* =======================================
          ACTIVATE / DEACTIVATE MODAL
      ======================================== */}

      {showStatusModal && (
        <div className="vendor-modal-overlay">
          <div className="vendor-confirm-modal">
            <button
              type="button"
              className="vendor-modal-close"
              onClick={cancelAccountStatus}
            >
              <FaTimes />
            </button>

            <div className="vendor-modal-icon">
              {accountStatus === "Active" ? <FaTimes /> : <FaCheck />}
            </div>

            <h3>
              {accountStatus === "Active"
                ? "Deactivate Vendor?"
                : "Activate Vendor?"}
            </h3>

            <p>
              {accountStatus === "Active"
                ? "Are you sure you want to deactivate this vendor account?"
                : "Are you sure you want to activate this vendor account?"}
            </p>

            <div className="vendor-modal-actions">
              <button
                type="button"
                className="vendor-cancel-button"
                onClick={cancelAccountStatus}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`vendor-confirm-button ${
                  accountStatus === "Active" ? "deactivate" : "activate"
                }`}
                onClick={confirmAccountStatus}
              >
                {accountStatus === "Active"
                  ? "Yes, Deactivate"
                  : "Yes, Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDetails;
