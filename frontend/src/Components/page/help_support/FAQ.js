import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaEdit, FaPlus } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./faq.css";

const FAQ = () => {
  const navigate = useNavigate();

  // =========================================================
  // TEMPORARY FAQ DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [faqData] = useState([
    {
      id: 1,
      type: "General",
      question: "What is bHyyve?",
      answer:
        "bHyyve is a service technology platform that connects customers with trusted businesses and service providers.",
    },
    {
      id: 2,
      type: "User",
      question: "How can I book a service?",
      answer:
        "You can search for a service, select a service provider, choose the available option and complete your booking through the platform.",
    },
    {
      id: 3,
      type: "Booking",
      question: "Can I cancel my booking?",
      answer:
        "Yes, booking cancellation may be available depending on the booking status and applicable cancellation policy.",
    },
    {
      id: 4,
      type: "Payment",
      question: "How can I make a payment?",
      answer:
        "Payments can be made through the supported payment methods available during the booking process.",
    },
    {
      id: 5,
      type: "Vendor",
      question: "How can a business join bHyyve?",
      answer:
        "Businesses can register as service providers and submit their business information through the platform.",
    },
    {
      id: 6,
      type: "Account",
      question: "How can I update my account information?",
      answer:
        "You can update your profile and account information from your account settings.",
    },
    {
      id: 7,
      type: "Support",
      question: "How can I contact support?",
      answer:
        "You can contact the bHyyve support team through the available support and help options.",
    },
  ]);

  // =========================================================
  // ADD FAQ
  // =========================================================

  const handleAddFAQ = () => {
    navigate("/faq/add");
  };

  // =========================================================
  // EDIT FAQ
  // =========================================================

  const handleEditFAQ = (row) => {
    navigate(`/faq/edit/${row.id}`, {
      state: {
        faq: row,
      },
    });
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "Sr.No",
        width: "80px",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      {
        key: "type",
        label: "Type",
        width: "130px",
        sortable: true,

        render: (value) => (
          <div className="faq-type">
            {value}
          </div>
        ),
      },

      {
        key: "question",
        label: "Question",
        width: "300px",
        sortable: true,

        render: (value) => (
          <div className="faq-question">
            {value}
          </div>
        ),
      },

      {
        key: "answer",
        label: "Answer",
        width: "430px",
        sortable: true,

        render: (value) => (
          <div className="faq-answer">
            {value}
          </div>
        ),
      },

      {
        key: "actions",
        label: "Action",
        width: "100px",
        sortable: false,

        render: (_, row) => (
          <div className="faq-actions">
            <button
              type="button"
              className="faq-edit-btn"
              onClick={() => handleEditFAQ(row)}
            >
              <FaEdit />
              <span>Edit</span>
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="faq-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="faq-page-header">

        <h2 className="faq-page-title">
          FAQ
        </h2>

        {/* ===================================================
            BREADCRUMB
        =================================================== */}

        <div className="faq-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span className="faq-breadcrumb-arrow">
            <IoIosArrowForward />
          </span>

          <span className="faq-breadcrumb-active">
            FAQ
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="faq-card">

        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="faq-card-header">

          <h3>
            All FAQ
          </h3>

          <button
            type="button"
            className="faq-add-btn"
            onClick={handleAddFAQ}
          >
            <FaPlus />
            <span>Add FAQ</span>
          </button>

        </div>

        {/* ===================================================
            DATA TABLE
        =================================================== */}

        <div className="faq-table-wrapper">

          <DataTable
            columns={columns}
            data={faqData}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />

        </div>

      </div>

    </div>
  );
};

export default FAQ;