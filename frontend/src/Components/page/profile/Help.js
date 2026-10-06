import React, { useState } from "react";
import {
  FaSearch,
  FaQuestionCircle,
  FaHeadset,
  FaTicketAlt,
  FaBookOpen,
  FaChevronDown,
  FaEnvelope,
  FaPhoneAlt,
  FaComments,
  FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import "./help.css";

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  const faqData = [
    {
      question: "How can I add a new vendor?",
      answer:
        "Go to the Vendor Management section from the sidebar and select Add Vendor. Fill in the required vendor information and submit the form.",
    },
    {
      question: "How can I create a coupon?",
      answer:
        "Open the Coupon section from the sidebar and select Add Coupon. You can configure the brand, vendor, category, discount, validity, usage limits, and customer eligibility.",
    },
    {
      question: "How can I change my account password?",
      answer:
        "Open Profile → Account Settings and use the Change Password section to update your current password.",
    },
    {
      question: "How can I update my profile information?",
      answer:
        "Go to Profile → My Profile. You can update your profile image, name, email, phone number, and other available information.",
    },
    {
      question: "How can I manage subscription packages?",
      answer:
        "Open the Advertisement or Subscription section from the sidebar. From there you can create, edit, manage, and monitor subscription packages.",
    },
    {
      question: "What should I do if I find an incorrect claim?",
      answer:
        "Open Warranty Claims and review the claim details. You can inspect the booking, customer, vendor, product, reason, and current status before taking action.",
    },
  ];

  const helpCategories = [
    {
      icon: <FaBookOpen />,
      title: "Getting Started",
      description:
        "Learn the basics of managing your admin dashboard.",
    },
    {
      icon: <FaQuestionCircle />,
      title: "FAQs",
      description:
        "Find quick answers to commonly asked questions.",
    },
    {
      icon: <FaTicketAlt />,
      title: "Support Tickets",
      description:
        "Create and track a support request with our team.",
    },
    {
      icon: <FaHeadset />,
      title: "Contact Support",
      description:
        "Need personal assistance? Our support team is here.",
    },
  ];

  const filteredFaqs = faqData.filter((faq) => {
    const search = searchTerm.toLowerCase();

    return (
      faq.question.toLowerCase().includes(search) ||
      faq.answer.toLowerCase().includes(search)
    );
  });

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="help-page">

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <div className="help-breadcrumb">
        <Link to="/home">Home</Link>

        <FaArrowRight className="breadcrumb-arrow" />

        <span>Help & Support</span>
      </div>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="help-header">

        <div>
          <h2>Help & Support</h2>

          <p>
            Find answers, explore helpful resources, or contact our
            support team whenever you need assistance.
          </p>
        </div>

        <div className="help-header-icon">
          <FaHeadset />
        </div>

      </div>

      {/* =====================================================
          SEARCH SECTION
      ===================================================== */}

      <div className="help-search-section">

        <div className="help-search-content">

          <span className="help-search-icon">
            <FaSearch />
          </span>

          <input
            type="text"
            placeholder="Search for help, FAQs, guides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearchTerm("")}
            >
              Clear
            </button>
          )}

        </div>

      </div>

      {/* =====================================================
          HELP CATEGORIES
      ===================================================== */}

      <div className="help-category-grid">

        {helpCategories.map((category, index) => (
          <div
            className="help-category-card"
            key={index}
          >

            <div className="help-category-icon">
              {category.icon}
            </div>

            <div className="help-category-content">

              <h4>{category.title}</h4>

              <p>{category.description}</p>

              <button type="button">
                Explore
                <FaArrowRight />
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="help-main-grid">

        {/* ===================================================
            FAQ SECTION
        =================================================== */}

        <div className="help-faq-card">

          <div className="help-section-heading">

            <div className="heading-icon">
              <FaQuestionCircle />
            </div>

            <div>
              <h3>Frequently Asked Questions</h3>

              <p>
                Quick answers to common questions.
              </p>
            </div>

          </div>

          <div className="faq-list">

            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div
                  className={`faq-item ${
                    activeFaq === index ? "active" : ""
                  }`}
                  key={index}
                >

                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                  >

                    <span>{faq.question}</span>

                    <FaChevronDown />

                  </button>

                  <div className="faq-answer">

                    <p>{faq.answer}</p>

                  </div>

                </div>
              ))
            ) : (
              <div className="no-faq-result">

                <FaSearch />

                <h4>No results found</h4>

                <p>
                  We couldn't find anything matching your search.
                  Try using different keywords.
                </p>

              </div>
            )}

          </div>

        </div>

        {/* ===================================================
            CONTACT SUPPORT
        =================================================== */}

        <div className="support-card">

          <div className="support-card-top">

            <div className="support-icon">
              <FaHeadset />
            </div>

            <span className="support-status">
              <span></span>
              Support Available
            </span>

          </div>

          <h3>Still need help?</h3>

          <p>
            Can't find the answer you're looking for? Our support
            team is ready to help you with any issue.
          </p>

          <button
            type="button"
            className="create-ticket-btn"
          >
            <FaTicketAlt />
            Create Support Ticket
          </button>

          <div className="support-divider">
            <span>OR</span>
          </div>

          <div className="support-contact-list">

            <div className="support-contact-item">

              <div className="contact-icon">
                <FaEnvelope />
              </div>

              <div>
                <span>Email Support</span>
                <strong>support@example.com</strong>
              </div>

            </div>

            <div className="support-contact-item">

              <div className="contact-icon">
                <FaPhoneAlt />
              </div>

              <div>
                <span>Phone Support</span>
                <strong>+91 1800 123 4567</strong>
              </div>

            </div>

            <div className="support-contact-item">

              <div className="contact-icon">
                <FaComments />
              </div>

              <div>
                <span>Live Chat</span>
                <strong>Chat with our team</strong>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          BOTTOM INFO
      ===================================================== */}

      <div className="help-bottom-card">

        <div className="bottom-card-icon">
          <FaBookOpen />
        </div>

        <div className="bottom-card-content">

          <h3>Need detailed documentation?</h3>

          <p>
            Explore our complete documentation to learn more about
            the dashboard, features, settings, and management tools.
          </p>

        </div>

        <button type="button" className="documentation-btn">
          View Documentation
          <FaArrowRight />
        </button>

      </div>

    </div>
  );
};

export default Help;