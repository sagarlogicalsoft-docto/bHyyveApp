import React, { useMemo, useState } from "react";
import {
  FaSearch,
  FaStar,
  FaRegStar,
  FaTrash,
  FaEnvelope,
  FaEnvelopeOpen,
  FaReply,
  FaArrowLeft,
  FaInbox,
  FaPaperPlane,
  FaExclamationCircle,
} from "react-icons/fa";

import "./messages.css";

const Messages = () => {
  // =========================================================
  // SAMPLE MESSAGES
  // =========================================================

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "John Smith",
      email: "john@example.com",
      subject: "New booking confirmation",
      message:
        "Hello Admin, I would like to confirm my recent booking. Please let me know if everything is confirmed from your side. Thank you.",
      date: "Today, 10:32 AM",
      unread: true,
      starred: true,
    },

    {
      id: 2,
      sender: "Sarah Williams",
      email: "sarah@example.com",
      subject: "Warranty claim inquiry",
      message:
        "Hello, I have submitted a warranty claim and wanted to know the current status of my request. Please let me know if you require any additional information from me.",
      date: "Today, 09:15 AM",
      unread: true,
      starred: false,
    },

    {
      id: 3,
      sender: "Michael Brown",
      email: "michael@example.com",
      subject: "Payment issue",
      message:
        "There seems to be an issue with my recent payment. Could you please check the transaction and assist me with resolving this issue?",
      date: "Yesterday, 05:40 PM",
      unread: false,
      starred: false,
    },

    {
      id: 4,
      sender: "David Wilson",
      email: "david@example.com",
      subject: "Vendor registration",
      message:
        "I have completed my vendor registration and submitted all the required information. Please review my application and let me know if anything else is required.",
      date: "Yesterday, 02:20 PM",
      unread: false,
      starred: true,
    },

    {
      id: 5,
      sender: "Emma Davis",
      email: "emma@example.com",
      subject: "Account assistance",
      message:
        "Hello Admin, I need some assistance regarding my account settings. Please guide me through the process.",
      date: "12 Aug 2026",
      unread: false,
      starred: false,
    },

    {
      id: 6,
      sender: "Robert Johnson",
      email: "robert@example.com",
      subject: "Service inquiry",
      message:
        "I would like to know more about the services available on the platform. Could you please provide some additional information?",
      date: "11 Aug 2026",
      unread: false,
      starred: false,
    },
  ]);

  // =========================================================
  // STATES
  // =========================================================

  const [selectedMessage, setSelectedMessage] = useState(null);

  const [search, setSearch] = useState("");

  const [activeFolder, setActiveFolder] = useState("inbox");

  // =========================================================
  // FILTER MESSAGES
  // =========================================================

  const filteredMessages = useMemo(() => {
    let result = [...messages];

    // Folder filter

    if (activeFolder === "starred") {
      result = result.filter(
        (message) => message.starred
      );
    }

    if (activeFolder === "unread") {
      result = result.filter(
        (message) => message.unread
      );
    }

    // Search filter

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      result = result.filter(
        (message) =>
          message.sender
            .toLowerCase()
            .includes(searchValue) ||
          message.email
            .toLowerCase()
            .includes(searchValue) ||
          message.subject
            .toLowerCase()
            .includes(searchValue) ||
          message.message
            .toLowerCase()
            .includes(searchValue)
      );
    }

    return result;
  }, [messages, search, activeFolder]);

  // =========================================================
  // OPEN MESSAGE
  // =========================================================

  const handleOpenMessage = (message) => {
    setSelectedMessage(message);

    // Mark as read

    setMessages((prev) =>
      prev.map((item) =>
        item.id === message.id
          ? {
              ...item,
              unread: false,
            }
          : item
      )
    );
  };

  // =========================================================
  // STAR MESSAGE
  // =========================================================

  const handleStarMessage = (id) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id
          ? {
              ...message,
              starred: !message.starred,
            }
          : message
      )
    );

    // Update selected message as well

    if (selectedMessage?.id === id) {
      setSelectedMessage((prev) => ({
        ...prev,
        starred: !prev.starred,
      }));
    }
  };

  // =========================================================
  // DELETE MESSAGE
  // =========================================================

  const handleDeleteMessage = (id) => {
    setMessages((prev) =>
      prev.filter(
        (message) => message.id !== id
      )
    );

    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
  };

  // =========================================================
  // BACK TO MESSAGE LIST
  // =========================================================

  const handleBack = () => {
    setSelectedMessage(null);
  };

  // =========================================================
  // COUNTS
  // =========================================================

  const unreadCount = messages.filter(
    (message) => message.unread
  ).length;

  const starredCount = messages.filter(
    (message) => message.starred
  ).length;

  // =========================================================
  // GET CURRENT FOLDER TITLE
  // =========================================================

  const getFolderTitle = () => {
    if (activeFolder === "starred") {
      return "Starred Messages";
    }

    if (activeFolder === "unread") {
      return "Unread Messages";
    }

    return "Inbox";
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="messages-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="messages-page-header">

        <div>

          <div className="messages-breadcrumb">

            <span>Dashboard</span>

            <span>/</span>

            <strong>Messages</strong>

          </div>

          <h2>Messages</h2>

          <p>
            Manage and respond to messages received
            from users.
          </p>

        </div>

      </div>

      {/* =====================================================
          MESSAGE CARD
      ===================================================== */}

      <div className="messages-card">

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="messages-sidebar">

          {/* INBOX */}

          <button
            type="button"
            className={`messages-folder ${
              activeFolder === "inbox"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveFolder("inbox");
              setSelectedMessage(null);
            }}
          >

            <span>

              <FaInbox />

              Inbox

            </span>

            <strong>
              {messages.length}
            </strong>

          </button>

          {/* UNREAD */}

          <button
            type="button"
            className={`messages-folder ${
              activeFolder === "unread"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveFolder("unread");
              setSelectedMessage(null);
            }}
          >

            <span>

              <FaEnvelope />

              Unread

            </span>

            <strong>
              {unreadCount}
            </strong>

          </button>

          {/* STARRED */}

          <button
            type="button"
            className={`messages-folder ${
              activeFolder === "starred"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveFolder("starred");
              setSelectedMessage(null);
            }}
          >

            <span>

              <FaStar />

              Starred

            </span>

            <strong>
              {starredCount}
            </strong>

          </button>

          <div className="messages-sidebar-divider" />

          {/* SIDEBAR INFO */}

          <div className="messages-sidebar-info">

            <FaExclamationCircle />

            <span>
              Manage all incoming user
              messages from this section.
            </span>

          </div>

        </aside>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <section className="messages-content">

          {!selectedMessage ? (

            <>
              {/* =============================================
                  TOOLBAR
              ============================================= */}

              <div className="messages-toolbar">

                <div className="messages-toolbar-left">

                  <h3>
                    {getFolderTitle()}
                  </h3>

                  <span>
                    {filteredMessages.length}
                    {" "}
                    {filteredMessages.length === 1
                      ? "message"
                      : "messages"}
                  </span>

                </div>

                {/* SEARCH */}

                <div className="messages-search">

                  <FaSearch />

                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />

                </div>

              </div>

              {/* =============================================
                  MESSAGE LIST
              ============================================= */}

              <div className="messages-list">

                {filteredMessages.length > 0 ? (

                  filteredMessages.map(
                    (message) => (

                      <div
                        key={message.id}
                        className={`message-row ${
                          message.unread
                            ? "message-unread"
                            : ""
                        }`}
                        onClick={() =>
                          handleOpenMessage(
                            message
                          )
                        }
                      >

                        {/* STATUS */}

                        <div className="message-status">

                          {message.unread ? (
                            <FaEnvelope />
                          ) : (
                            <FaEnvelopeOpen />
                          )}

                        </div>

                        {/* SENDER */}

                        <div className="message-sender">

                          <strong>
                            {message.sender}
                          </strong>

                          <span>
                            {message.email}
                          </span>

                        </div>

                        {/* MESSAGE PREVIEW */}

                        <div className="message-preview">

                          <strong>
                            {message.subject}
                          </strong>

                          <span>
                            {" - "}
                            {message.message}
                          </span>

                        </div>

                        {/* DATE */}

                        <div className="message-date">

                          {message.date}

                        </div>

                        {/* STAR */}

                        <button
                          type="button"
                          className={`message-star ${
                            message.starred
                              ? "starred"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();

                            handleStarMessage(
                              message.id
                            );
                          }}
                        >

                          {message.starred ? (
                            <FaStar />
                          ) : (
                            <FaRegStar />
                          )}

                        </button>

                      </div>

                    )
                  )

                ) : (

                  /* EMPTY STATE */

                  <div className="messages-empty">

                    <div className="messages-empty-icon">

                      <FaEnvelopeOpen />

                    </div>

                    <h3>
                      No messages found
                    </h3>

                    <p>
                      There are no messages matching
                      your current selection.
                    </p>

                  </div>

                )}

              </div>

            </>

          ) : (

            /* =================================================
               MESSAGE DETAIL
            ================================================= */

            <div className="message-detail">

              {/* DETAIL HEADER */}

              <div className="message-detail-header">

                <button
                  type="button"
                  className="message-back-button"
                  onClick={handleBack}
                >

                  <FaArrowLeft />

                  <span>
                    Back to Messages
                  </span>

                </button>

                <div className="message-detail-actions">

                  {/* STAR */}

                  <button
                    type="button"
                    title="Star message"
                    className={`message-action-button ${
                      selectedMessage.starred
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleStarMessage(
                        selectedMessage.id
                      )
                    }
                  >

                    {selectedMessage.starred ? (
                      <FaStar />
                    ) : (
                      <FaRegStar />
                    )}

                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    title="Delete message"
                    className="message-action-button delete"
                    onClick={() =>
                      handleDeleteMessage(
                        selectedMessage.id
                      )
                    }
                  >

                    <FaTrash />

                  </button>

                </div>

              </div>

              {/* SUBJECT */}

              <div className="message-detail-subject">

                <h2>
                  {selectedMessage.subject}
                </h2>

              </div>

              {/* SENDER */}

              <div className="message-detail-sender">

                <div className="sender-avatar">

                  {selectedMessage.sender
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div className="sender-info">

                  <strong>
                    {selectedMessage.sender}
                  </strong>

                  <span>
                    {selectedMessage.email}
                  </span>

                </div>

                <div className="sender-date">

                  {selectedMessage.date}

                </div>

              </div>

              {/* MESSAGE BODY */}

              <div className="message-detail-body">

                <p>
                  {selectedMessage.message}
                </p>

                <p>
                  Thank you for contacting us.
                  Our administration team will
                  review your request and get back
                  to you shortly.
                </p>

                <p>
                  Regards,
                  <br />
                  Admin Team
                </p>

              </div>

              {/* REPLY */}

              <div className="message-detail-footer">

                <button
                  type="button"
                  className="message-reply-button"
                  onClick={() =>
                    alert(
                      "Reply functionality will be connected to the API later."
                    )
                  }
                >

                  <FaReply />

                  Reply

                </button>

              </div>

            </div>

          )}

        </section>

      </div>

    </div>
  );
};

export default Messages;