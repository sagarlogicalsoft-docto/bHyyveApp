import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaTrash } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./contactUs.css";

const ContactUs = () => {
  // =========================================================
  // TEMPORARY CONTACT DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [contactData, setContactData] = useState([
    {
      id: 1,
      userName: "Sagar Malik",
      email: "sagar@example.com",
      mobile: "9876543210",
      title: "Service Inquiry",
      description:
        "I would like to know more about the services available on bHyyve.",
      status: "Pending",
    },
    {
      id: 2,
      userName: "Rahul Testing",
      email: "rahul@example.com",
      mobile: "9876543211",
      title: "Booking Issue",
      description:
        "I am facing an issue while trying to complete my service booking.",
      status: "Pending",
    },
    {
      id: 3,
      userName: "Amit Sharma",
      email: "amit@example.com",
      mobile: "9876543212",
      title: "Payment Question",
      description:
        "Please help me understand the payment process for my recent booking.",
      status: "Resolved",
    },
    {
      id: 4,
      userName: "Neha Verma",
      email: "neha@example.com",
      mobile: "9876543213",
      title: "Account Support",
      description:
        "I need help updating some information in my account profile.",
      status: "Pending",
    },
    {
      id: 5,
      userName: "Vikas Kumar",
      email: "vikas@example.com",
      mobile: "9876543214",
      title: "Vendor Related",
      description:
        "I would like to report an issue related to a service provider.",
      status: "Resolved",
    },
    {
      id: 6,
      userName: "Priya Singh",
      email: "priya@example.com",
      mobile: "9876543215",
      title: "General Question",
      description:
        "I have a general question regarding the bHyyve platform.",
      status: "Pending",
    },
    {
      id: 7,
      userName: "Rohit Patel",
      email: "rohit@example.com",
      mobile: "9876543216",
      title: "Cancellation Request",
      description:
        "I would like some information about cancelling my booking.",
      status: "Pending",
    },
  ]);

  // =========================================================
  // SELECTED CONTACTS
  // =========================================================

  const [selectedContacts, setSelectedContacts] = useState([]);

  // =========================================================
  // SELECT SINGLE
  // =========================================================

  const handleSelectContact = (id) => {
    setSelectedContacts((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });
  };

  // =========================================================
  // SELECT ALL
  // =========================================================

  const handleSelectAll = () => {
    if (
      contactData.length > 0 &&
      selectedContacts.length === contactData.length
    ) {
      setSelectedContacts([]);
      return;
    }

    setSelectedContacts(contactData.map((item) => item.id));
  };

  // =========================================================
  // DELETE SINGLE
  // =========================================================

  const handleDelete = (row) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact request?",
    );

    if (!confirmed) {
      return;
    }

    setContactData((previous) =>
      previous.filter((item) => item.id !== row.id),
    );

    setSelectedContacts((previous) =>
      previous.filter((id) => id !== row.id),
    );

    console.log("Delete Contact:", row);

    // =======================================================
    // DELETE API WILL COME HERE LATER
    // =======================================================
  };

  // =========================================================
  // DELETE SELECTED
  // =========================================================

  const handleDeleteSelected = () => {
    if (selectedContacts.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedContacts.length} selected contact request(s)?`,
    );

    if (!confirmed) {
      return;
    }

    setContactData((previous) =>
      previous.filter(
        (item) => !selectedContacts.includes(item.id),
      ),
    );

    console.log(
      "Delete Selected Contacts:",
      selectedContacts,
    );

    setSelectedContacts([]);

    // =======================================================
    // DELETE MULTIPLE API WILL COME HERE LATER
    // =======================================================
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      // =====================================================
      // SELECT
      // =====================================================

      {
        key: "select",
        label: (
          <div className="contact-us-select-header">
            <input
              type="checkbox"
              className="contact-us-checkbox"
              checked={
                contactData.length > 0 &&
                selectedContacts.length === contactData.length
              }
              onChange={handleSelectAll}
            />

            <span>All</span>
          </div>
        ),

        width: "80px",
        sortable: false,

        render: (_, row) => (
          <input
            type="checkbox"
            className="contact-us-checkbox"
            checked={selectedContacts.includes(row.id)}
            onChange={() => handleSelectContact(row.id)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },

      // =====================================================
      // SERIAL NUMBER
      // =====================================================

      {
        key: "serial",
        label: "Sr.No",
        width: "100px",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      // =====================================================
      // USER NAME
      // =====================================================

      {
        key: "userName",
        label: "UserName",
        width: "150px",
        sortable: true,

        render: (value) => (
          <div className="contact-us-user-name">
            {value}
          </div>
        ),
      },

      // =====================================================
      // EMAIL
      // =====================================================

      {
        key: "email",
        label: "Email",
        width: "240px",
        sortable: true,

        render: (value) => (
          <div className="contact-us-email">
            {value}
          </div>
        ),
      },

      // =====================================================
      // MOBILE
      // =====================================================

      {
        key: "mobile",
        label: "Mobile",
        width: "150px",
        sortable: true,

        render: (value) => (
          <div className="contact-us-mobile">
            {value}
          </div>
        ),
      },

      // =====================================================
      // TITLE
      // =====================================================

      {
        key: "title",
        label: "Title",
        width: "250px",
        sortable: true,

        render: (value) => (
          <div className="contact-us-title-cell">
            {value}
          </div>
        ),
      },

      // =====================================================
      // DESCRIPTION
      // =====================================================

      {
        key: "description",
        label: "Description",
        width: "360px",
        sortable: true,

        render: (value) => (
          <div className="contact-us-description">
            {value}
          </div>
        ),
      },

      // =====================================================
      // STATUS
      // =====================================================

      {
        key: "status",
        label: "Status",
        width: "140px",
        sortable: true,

        render: (value) => (
          <span
            className={`contact-us-status ${
              value.toLowerCase() === "resolved"
                ? "contact-us-status-resolved"
                : "contact-us-status-pending"
            }`}
          >
            {value}
          </span>
        ),
      },

      // =====================================================
      // ACTION
      // =====================================================

      {
        key: "actions",
        label: "Action",
        width: "120px",
        sortable: false,

        render: (_, row) => (
          <div className="contact-us-actions">
            <button
              type="button"
              className="contact-us-delete-btn"
              onClick={() => handleDelete(row)}
            >
              <FaTrash />
              <span>Delete</span>
            </button>
          </div>
        ),
      },
    ],
    [contactData, selectedContacts],
  );

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="contact-us-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="contact-us-page-header">

        <h2 className="contact-us-page-title">
          Contact Us
        </h2>

        {/* ===================================================
            BREADCRUMB
        =================================================== */}

        <div className="contact-us-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span className="contact-us-breadcrumb-arrow">
            <IoIosArrowForward />
          </span>

          <span className="contact-us-breadcrumb-active">
            Contact Us
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="contact-us-card">

        <div className="contact-us-card-header">

          <h3>
            All Contact Us Data
          </h3>

        </div>

        {/* ===================================================
            DATA TABLE
        =================================================== */}

        <div className="contact-us-table-wrapper">

          <DataTable
            columns={columns}
            data={contactData}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />

        </div>

        {/* ===================================================
            DELETE SELECTED
        =================================================== */}

        {selectedContacts.length > 0 && (
          <div className="contact-us-selected-footer">

            <button
              type="button"
              className="contact-us-delete-all-btn"
              onClick={handleDeleteSelected}
            >
              <FaTrash />

              <span>
                Delete All
              </span>

              <span>
                ({selectedContacts.length})
              </span>
            </button>

          </div>
        )}

      </div>

    </div>
  );
};

export default ContactUs;