import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaEdit,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaToggleOn,
  FaToggleOff,
  FaTrash,
  FaSave,
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";
import "./viewDetails.css";

const ViewDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("customer");
  const [accountActive, setAccountActive] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // =========================================================
  // TEMPORARY CUSTOMER DATA
  // Later API data will come here
  // =========================================================

  const customer = {
    id: id || 159,
    registeredDate: "12 Jan 2024",
    status: accountActive ? "Active" : "Inactive",
    totalBookings: 24,
    completedBookings: 20,
    incompleteBookings: 4,
  };

  // =========================================================
  // CUSTOMER EDITABLE FORM STATE
  // =========================================================

  const [customerForm, setCustomerForm] = useState({
    name: "Dheeraj Kumar",
    email: "dheeraj@example.com",
    phone: "+91 98765 43210",
    gender: "Male",
    dateOfBirth: "15 Aug 1995",
    address:
      "Flat No. 204, Green Residency, MG Road, New Delhi, Delhi - 110001",
  });

  const handleCustomerFieldChange = (field, value) => {
    setCustomerForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCustomerUpdate = () => {
    console.log("Update customer:", customer.id, customerForm);

    // API call later
  };

  // =========================================================
  // TEMPORARY BOOKING DATA
  // =========================================================

  const bookingData = [
    {
      id: 1001,
      customerName: customerForm.name,
      bookingAddress: "Flat No. 204, Green Residency, MG Road, New Delhi",
      paidAmount: "₹1,250",
      transaction: "TXN-2024-00125",
      bookedDateTime: "12 Jan 2024, 10:30 AM",
      status: "Pending",
    },
    {
      id: 1002,
      customerName: customerForm.name,
      bookingAddress: "House No. 45, Sector 18, Noida, Uttar Pradesh",
      paidAmount: "₹2,500",
      transaction: "TXN-2024-00256",
      bookedDateTime: "18 Jan 2024, 02:15 PM",
      status: "Pending",
    },
    {
      id: 1003,
      customerName: customerForm.name,
      bookingAddress: "Plot No. 12, Main Market, Gurugram, Haryana",
      paidAmount: "₹1,800",
      transaction: "TXN-2024-00345",
      bookedDateTime: "25 Jan 2024, 06:20 PM",
      status: "Completed",
    },
    {
      id: 1004,
      customerName: customerForm.name,
      bookingAddress: "Sector 62, Near Metro Station, Noida, Uttar Pradesh",
      paidAmount: "₹950",
      transaction: "TXN-2024-00421",
      bookedDateTime: "02 Feb 2024, 11:10 AM",
      status: "Completed",
    },
    {
      id: 1005,
      customerName: customerForm.name,
      bookingAddress: "Rajouri Garden, New Delhi, Delhi - 110027",
      paidAmount: "₹3,200",
      transaction: "TXN-2024-00589",
      bookedDateTime: "10 Feb 2024, 04:45 PM",
      status: "Completed",
    },
  ];

  // =========================================================
  // BOOKING ADDRESS DATA (now stateful & editable)
  // =========================================================

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      address:
        "Flat No. 204, Green Residency, MG Road, New Delhi, Delhi - 110001",
    },
    {
      id: 2,
      address: "House No. 45, Sector 18, Noida, Uttar Pradesh - 201301",
    },
    {
      id: 3,
      address: "Plot No. 12, Main Market, Gurugram, Haryana - 122001",
    },
  ]);

  const handleAddressFieldChange = (addressId, value) => {
    setAddresses((previous) =>
      previous.map((item) =>
        item.id === addressId ? { ...item, address: value } : item,
      ),
    );
  };

  const handleAddressDelete = (addressId) => {
    setAddresses((previous) =>
      previous.filter((item) => item.id !== addressId),
    );

    console.log("Delete address:", addressId);

    // API call later
  };

 const handleAddressUpdate = (row) => {
  console.log("Update address:", row.id, row.address);

  // API call later
};

  // =========================================================
  // ACCOUNT STATUS
  // =========================================================

  const handleAccountStatus = () => {
    setAccountActive((previous) => !previous);
    setShowAccountModal(false);

    // API call later
    console.log(
      accountActive ? "Deactivate account" : "Activate account",
      customer.id,
    );
  };

  // =========================================================
  // BOOKING ACTION
  // =========================================================

  const handleBookingAction = (booking) => {
    console.log("Booking action:", booking.id);

    // View booking / API action later
  };

  // =========================================================
  // BOOKING TABLE COLUMNS
  // =========================================================

  const bookingColumns = useMemo(
    () => [
      {
        key: "serial",
        label: "Sr.No",
        width: "80px",
        sortable: false,

        render: (_, row, rowIndex) => (
          <span className="viewdetail-serial">{rowIndex + 1}</span>
        ),
      },

      {
        key: "id",
        label: "Booked ID",
        width: "120px",
        sortable: true,
      },

      {
        key: "customerName",
        label: "Customer Name",
        width: "180px",
        sortable: true,
      },

      {
        key: "bookingAddress",
        label: "Booking Address",
        width: "300px",
        sortable: true,

        render: (value) => (
          <div className="viewdetail-address-cell">
            <FaMapMarkerAlt />
            <span>{value}</span>
          </div>
        ),
      },

      {
        key: "paidAmount",
        label: "Paid Amount",
        width: "130px",
        sortable: true,
      },

      {
        key: "transaction",
        label: "Transaction",
        width: "180px",
        sortable: true,
      },

      {
        key: "bookedDateTime",
        label: "Booked DateTime",
        width: "190px",
        sortable: true,
      },

      {
        key: "status",
        label: "Status",
        width: "120px",
        sortable: true,

        render: (value) => (
          <span
            className={
              value === "Completed"
                ? "viewdetail-status completed"
                : "viewdetail-status pending"
            }
          >
            {value}
          </span>
        ),
      },

      {
        key: "actions",
        label: "Action",
        width: "120px",
        sortable: false,

        render: (_, row) => (
          <button
            type="button"
            className="viewdetail-action-btn"
            onClick={() => handleBookingAction(row)}
          >
            View
          </button>
        ),
      },
    ],
    [],
  );

  // =========================================================
  // ADDRESS TABLE COLUMNS (address is now an editable input)
  // =========================================================

 const addressColumns = useMemo(
  () => [
    {
      key: "serial",
      label: "Sr.No",
      width: "10px",
      sortable: false,

      render: (_, row, rowIndex) => (
        <span className="viewdetail-serial">{rowIndex + 1}</span>
      ),
    },

    {
      key: "address",
      label: "Address",
      width: "300px",
      sortable: true,
      className: "viewdetail-address-td",

      render: (value, row) => (
        <div className="viewdetail-address-cell">
          <FaMapMarkerAlt />
          <textarea
            className="viewdetail-address-input"
            value={row.address}
            rows={1}
            onChange={(event) =>
              handleAddressFieldChange(row.id, event.target.value)
            }
          />
        </div>
      ),
    },

    {
      key: "actions",
      label: "Action",
      width: "150px",
      sortable: false,
      className: "viewdetail-address-td",

      render: (_, row) => (
        <div className="viewdetail-address-actions">
          <button
            type="button"
            className="viewdetail-row-update-btn"
            onClick={() => handleAddressUpdate(row)}
            title="Update Address"
          >
            <FaSave />
            Update
          </button>

          <button
            type="button"
            className="viewdetail-row-delete-btn"
            onClick={() => handleAddressDelete(row.id)}
            title="Delete Address"
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

  // =========================================================
  // CUSTOMER TAB
  // =========================================================

  const renderCustomer = () => {
    return (
      <div className="viewdetail-customer">
        {/* PROFILE */}
        <div className="viewdetail-profile-section">
          <div className="viewdetail-profile-avatar">
            <FaUser />
          </div>

          <div className="viewdetail-profile-content">
            <h3>{customerForm.name}</h3>

            <p>
              Customer ID: <strong>#{customer.id}</strong>
            </p>

            <span
              className={
                accountActive
                  ? "viewdetail-account-badge active"
                  : "viewdetail-account-badge inactive"
              }
            >
              <FaCheckCircle />
              {accountActive ? "Active Account" : "Inactive Account"}
            </span>
          </div>
        </div>

        {/* DETAILS */}
        <div className="viewdetail-section">
          <div className="viewdetail-section-title">
            <h4>Customer Information</h4>
          </div>

          <div className="viewdetail-details-grid">
            <div className="viewdetail-detail-item">
              <label>Customer Name</label>
              <input
                type="text"
                className="viewdetail-input"
                value={customerForm.name}
                onChange={(event) =>
                  handleCustomerFieldChange("name", event.target.value)
                }
              />
            </div>

            <div className="viewdetail-detail-item">
              <label>Email Address</label>
              <div className="viewdetail-input-with-icon">
                <FaEnvelope />
                <input
                  type="email"
                  className="viewdetail-input"
                  value={customerForm.email}
                  onChange={(event) =>
                    handleCustomerFieldChange("email", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="viewdetail-detail-item">
              <label>Phone Number</label>
              <div className="viewdetail-input-with-icon">
                <FaPhone />
                <input
                  type="text"
                  className="viewdetail-input"
                  value={customerForm.phone}
                  onChange={(event) =>
                    handleCustomerFieldChange("phone", event.target.value)
                  }
                />
              </div>
            </div>

            {/* <div className="viewdetail-detail-item">
              <label>Gender</label>
              <select
                className="viewdetail-input"
                value={customerForm.gender}
                onChange={(event) =>
                  handleCustomerFieldChange("gender", event.target.value)
                }
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div> */}

            {/* <div className="viewdetail-detail-item">
              <label>Date of Birth</label>
              <input
                type="text"
                className="viewdetail-input"
                value={customerForm.dateOfBirth}
                onChange={(event) =>
                  handleCustomerFieldChange(
                    "dateOfBirth",
                    event.target.value,
                  )
                }
              />
            </div> */}

            {/* <div className="viewdetail-detail-item">
              <label>Registered Date</label>
              <p>{customer.registeredDate}</p>
            </div> */}

            <div className="viewdetail-detail-item viewdetail-full-width">
              <label>Address</label>

              <div className="viewdetail-input-with-icon">
                <FaMapMarkerAlt />
                <input
                  type="text"
                  className="viewdetail-input"
                  value={customerForm.address}
                  onChange={(event) =>
                    handleCustomerFieldChange("address", event.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="viewdetail-tab-footer">
            <button
              type="button"
              className="viewdetail-update-btn"
              onClick={handleCustomerUpdate}
            >
              <FaSave />
              Update Now
            </button>
          </div>
        </div>

        {/* BOOKING SUMMARY */}
        <div className="viewdetail-section">
          <div className="viewdetail-section-title">
            <h4>Booking Summary</h4>
          </div>

          <div className="viewdetail-summary-grid">
            <div className="viewdetail-summary-card">
              <span>Total Bookings</span>
              <strong>{customer.totalBookings}</strong>
            </div>

            <div className="viewdetail-summary-card">
              <span>Completed Bookings</span>
              <strong>{customer.completedBookings}</strong>
            </div>

            <div className="viewdetail-summary-card">
              <span>Incomplete Bookings</span>
              <strong>{customer.incompleteBookings}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================
  // INCOMPLETE BOOKING
  // =========================================================

  const renderIncompleteBooking = () => {
    const incompleteBookings = bookingData.filter(
      (booking) => booking.status !== "Completed",
    );

    return (
      <div className="viewdetail-tab-content">
        <div className="viewdetail-tab-heading">
          <div>
            <h3>Incomplete Booking</h3>
            <p>All incomplete and pending bookings of this customer.</p>
          </div>
        </div>

        <DataTable
          columns={bookingColumns}
          data={incompleteBookings}
          entriesPerPageOptions={[10, 25, 50, 100]}
          defaultEntriesPerPage={10}
          searchable={true}
          sortable={true}
        />
      </div>
    );
  };

  // =========================================================
  // BOOKING HISTORY
  // =========================================================

  const renderBookingHistory = () => {
    const completedBookings = bookingData.filter(
      (booking) => booking.status === "Completed",
    );

    return (
      <div className="viewdetail-tab-content">
        <div className="viewdetail-tab-heading">
          <div>
            <h3>Booking History</h3>
            <p>Complete booking history of this customer.</p>
          </div>
        </div>

        <DataTable
          columns={bookingColumns}
          data={completedBookings}
          entriesPerPageOptions={[10, 25, 50, 100]}
          defaultEntriesPerPage={10}
          searchable={true}
          sortable={true}
        />
      </div>
    );
  };

  // =========================================================
  // BOOKING ADDRESSES
  // =========================================================

 const renderBookingAddresses = () => {
  return (
    <div className="viewdetail-tab-content">
      <div className="viewdetail-tab-heading">
        <div>
          <h3>Booking Addresses</h3>
          <p>Addresses saved by this customer for bookings.</p>
        </div>
      </div>

      <DataTable
        columns={addressColumns}
        data={addresses}
        entriesPerPageOptions={[10, 25, 50, 100]}
        defaultEntriesPerPage={10}
        searchable={true}
        sortable={true}
      />
    </div>
  );
};

  // =========================================================
  // TAB CONTENT
  // =========================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case "customer":
        return renderCustomer();

      case "incomplete":
        return renderIncompleteBooking();

      case "history":
        return renderBookingHistory();

      case "addresses":
        return renderBookingAddresses();

      default:
        return renderCustomer();
    }
  };

  return (
    <div className="viewdetail-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="viewdetail-page-header">
        <div>
          <h2 className="viewdetail-page-title">Customer Detail</h2>

          <div className="viewdetail-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <Link to="/users">All Users</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="viewdetail-breadcrumb-active">
              Customer Detail
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="viewdetail-card">
        {/* CARD HEADER */}

        <div className="viewdetail-card-header">
          <div>
            <h3>Customer Details</h3>
            <p>View complete information about this customer.</p>
          </div>

          <div className="viewdetail-account-control">
            <span>Account:</span>

            <button
              type="button"
              className={
                accountActive
                  ? "viewdetail-account-btn active"
                  : "viewdetail-account-btn inactive"
              }
              onClick={() => setShowAccountModal(true)}
            >
              {accountActive ? <FaToggleOn /> : <FaToggleOff />}

              {accountActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>

        {/* ===================================================
            HORIZONTAL TABS
        =================================================== */}

        <div className="viewdetail-tabs">
          <button
            type="button"
            className={
              activeTab === "customer"
                ? "viewdetail-tab active"
                : "viewdetail-tab"
            }
            onClick={() => setActiveTab("customer")}
          >
            Customer
          </button>

          <button
            type="button"
            className={
              activeTab === "incomplete"
                ? "viewdetail-tab active"
                : "viewdetail-tab"
            }
            onClick={() => setActiveTab("incomplete")}
          >
            Incomplete Booking
          </button>

          <button
            type="button"
            className={
              activeTab === "history"
                ? "viewdetail-tab active"
                : "viewdetail-tab"
            }
            onClick={() => setActiveTab("history")}
          >
            Booking History
          </button>

          <button
            type="button"
            className={
              activeTab === "addresses"
                ? "viewdetail-tab active"
                : "viewdetail-tab"
            }
            onClick={() => setActiveTab("addresses")}
          >
            Booking Addresses
          </button>
        </div>

        {/* ===================================================
            TAB CONTENT
        =================================================== */}

        <div className="viewdetail-content">{renderTabContent()}</div>
      </div>

      {/* =====================================================
          ACCOUNT STATUS MODAL
      ===================================================== */}

      {showAccountModal && (
        <div className="viewdetail-modal-overlay">
          <div className="viewdetail-account-modal">
            <div className="viewdetail-modal-icon">
              {accountActive ? <FaToggleOff /> : <FaToggleOn />}
            </div>

            <h3>Are you sure?</h3>

            <p>
              You want to{" "}
              <strong>{accountActive ? "deactivate" : "activate"}</strong>{" "}
              this customer account?
            </p>

            <div className="viewdetail-modal-actions">
              <button
                type="button"
                className="viewdetail-confirm-btn"
                onClick={handleAccountStatus}
              >
                Yes, {accountActive ? "Deactivate" : "Activate"}
              </button>

              <button
                type="button"
                className="viewdetail-cancel-btn"
                onClick={() => setShowAccountModal(false)}
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

export default ViewDetail;