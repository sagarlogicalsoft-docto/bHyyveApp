import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import {
  FaPaperPlane,
  FaSearch,
  FaCheck,
  FaCheckDouble,
} from "react-icons/fa";

import "./vendorChat.css";

const VendorChat = () => {
  // =========================================================
  // TEMPORARY VENDOR DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [vendors] = useState([
    {
      id: 1,
      name: "Virtual Home Photography",
      image: "https://i.pravatar.cc/150?img=33",
      lastMessage: "Thank you for the update.",
      lastTime: "10:45 AM",
      unread: 2,
    },
    {
      id: 2,
      name: "Rahul Developer",
      image: "https://i.pravatar.cc/150?img=32",
      lastMessage: "The service has been completed.",
      lastTime: "09:40 AM",
      unread: 0,
    },
    {
      id: 3,
      name: "ABC Home Services",
      image: "https://i.pravatar.cc/150?img=31",
      lastMessage: "Please check the booking.",
      lastTime: "08:55 AM",
      unread: 3,
    },
    {
      id: 4,
      name: "Premium Cleaning Services",
      image: "https://i.pravatar.cc/150?img=30",
      lastMessage: "Okay admin, understood.",
      lastTime: "Yesterday",
      unread: 0,
    },
    {
      id: 5,
      name: "Toronto Photography",
      image: "https://i.pravatar.cc/150?img=29",
      lastMessage: "I will send the details.",
      lastTime: "Yesterday",
      unread: 1,
    },
    {
      id: 6,
      name: "Best Repair Services",
      image: "https://i.pravatar.cc/150?img=28",
      lastMessage: "Thanks for your support.",
      lastTime: "12 Aug",
      unread: 0,
    },
  ]);

  // =========================================================
  // TEMPORARY CHAT DATA
  // =========================================================

  const [messages, setMessages] = useState({
    1: [
      {
        id: 1,
        sender: "vendor",
        message: "Hello Admin, I need some help with a booking.",
        time: "10:25 AM",
        date: "Today",
      },
      {
        id: 2,
        sender: "admin",
        message: "Hello, sure. Please tell me the booking issue.",
        time: "10:27 AM",
        date: "Today",
        seen: true,
      },
      {
        id: 3,
        sender: "vendor",
        message:
          "The customer has requested a change in the booking time.",
        time: "10:31 AM",
        date: "Today",
      },
      {
        id: 4,
        sender: "admin",
        message:
          "Okay. Please provide the updated booking time.",
        time: "10:34 AM",
        date: "Today",
        seen: true,
      },
      {
        id: 5,
        sender: "vendor",
        message: "The new time will be 5:30 PM.",
        time: "10:38 AM",
        date: "Today",
      },
      {
        id: 6,
        sender: "admin",
        message:
          "I have updated the booking information.",
        time: "10:41 AM",
        date: "Today",
        seen: true,
      },
      {
        id: 7,
        sender: "vendor",
        message: "Thank you for the update.",
        time: "10:45 AM",
        date: "Today",
      },
    ],

    2: [
      {
        id: 1,
        sender: "vendor",
        message: "The service has been completed.",
        time: "09:40 AM",
        date: "Today",
      },
      {
        id: 2,
        sender: "admin",
        message: "Thank you. We have received the update.",
        time: "09:43 AM",
        date: "Today",
        seen: true,
      },
    ],

    3: [
      {
        id: 1,
        sender: "vendor",
        message: "Please check the booking.",
        time: "08:55 AM",
        date: "Today",
      },
      {
        id: 2,
        sender: "admin",
        message: "Sure, I will check it now.",
        time: "09:00 AM",
        date: "Today",
        seen: true,
      },
    ],

    4: [
      {
        id: 1,
        sender: "vendor",
        message: "Okay admin, understood.",
        time: "02:20 PM",
        date: "Yesterday",
      },
    ],

    5: [
      {
        id: 1,
        sender: "vendor",
        message: "I will send the details.",
        time: "11:20 AM",
        date: "Yesterday",
      },
    ],

    6: [
      {
        id: 1,
        sender: "vendor",
        message: "Thanks for your support.",
        time: "03:40 PM",
        date: "12 Aug",
      },
    ],
  });

  // =========================================================
  // STATE
  // =========================================================

  const [selectedVendorId, setSelectedVendorId] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // =========================================================
  // SELECTED VENDOR
  // =========================================================

  const selectedVendor = useMemo(
    () =>
      vendors.find(
        (vendor) => vendor.id === selectedVendorId,
      ),
    [vendors, selectedVendorId],
  );

  // =========================================================
  // FILTER VENDORS
  // =========================================================

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) =>
      vendor.name
        .toLowerCase()
        .includes(searchText.toLowerCase()),
    );
  }, [vendors, searchText]);

  // =========================================================
  // SELECT VENDOR
  // =========================================================

  const handleSelectVendor = (vendorId) => {
    setSelectedVendorId(vendorId);
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSendMessage = () => {
    const trimmedMessage = newMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    const newChatMessage = {
      id: Date.now(),
      sender: "admin",
      message: trimmedMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: "Today",
      seen: false,
    };

    setMessages((previous) => ({
      ...previous,
      [selectedVendorId]: [
        ...(previous[selectedVendorId] || []),
        newChatMessage,
      ],
    }));

    setNewMessage("");

    // =======================================================
    // BACKEND API WILL COME HERE LATER
    // =======================================================
  };

  // =========================================================
  // ENTER TO SEND
  // =========================================================

  const handleMessageKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="vendor-chat-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="vendor-chat-header">

        <h2 className="vendor-chat-title">
          Vendor Chat
        </h2>

        <div className="vendor-chat-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="vendor-chat-breadcrumb-active">
            Help & Center
          </span>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="vendor-chat-breadcrumb-active">
            Vendor Chat
          </span>

        </div>

      </div>

      {/* =====================================================
          CHAT CARD
      ===================================================== */}

      <div className="vendor-chat-card">

        {/* ===================================================
            LEFT VENDOR LIST
        =================================================== */}

        <div className="vendor-chat-sidebar">

          <div className="vendor-chat-sidebar-header">

            <h3>
              Vendors
            </h3>

            <span>
              {vendors.length}
            </span>

          </div>

          {/* SEARCH */}

          <div className="vendor-chat-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search vendors..."
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
            />

          </div>

          {/* VENDOR LIST */}

          <div className="vendor-chat-vendor-list">

            {filteredVendors.length === 0 ? (

              <div className="vendor-chat-no-vendors">
                No vendors found
              </div>

            ) : (

              filteredVendors.map((vendor) => (

                <button
                  type="button"
                  key={vendor.id}
                  className={`vendor-chat-vendor-item ${
                    selectedVendorId === vendor.id
                      ? "vendor-chat-vendor-item-active"
                      : ""
                  }`}
                  onClick={() =>
                    handleSelectVendor(vendor.id)
                  }
                >

                  <div className="vendor-chat-avatar-wrapper">

                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      className="vendor-chat-vendor-avatar"
                    />

                    <span className="vendor-chat-online-dot" />

                  </div>

                  <div className="vendor-chat-vendor-content">

                    <div className="vendor-chat-vendor-top">

                      <strong>
                        {vendor.name}
                      </strong>

                      <span>
                        {vendor.lastTime}
                      </span>

                    </div>

                    <div className="vendor-chat-vendor-bottom">

                      <p>
                        {vendor.lastMessage}
                      </p>

                      {vendor.unread > 0 && (
                        <span className="vendor-chat-unread">
                          {vendor.unread}
                        </span>
                      )}

                    </div>

                  </div>

                </button>

              ))

            )}

          </div>

        </div>

        {/* ===================================================
            RIGHT CHAT AREA
        =================================================== */}

        <div className="vendor-chat-main">

          {/* CHAT HEADER */}

          {selectedVendor && (

            <div className="vendor-chat-main-header">

              <div className="vendor-chat-main-user">

                <div className="vendor-chat-main-avatar-wrapper">

                  <img
                    src={selectedVendor.image}
                    alt={selectedVendor.name}
                    className="vendor-chat-main-avatar"
                  />

                  <span className="vendor-chat-online-dot" />

                </div>

                <div>

                  <h3>
                    {selectedVendor.name}
                  </h3>

                  <span>
                    Online
                  </span>

                </div>

              </div>

            </div>

          )}

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div className="vendor-chat-messages">

            {(messages[selectedVendorId] || []).map(
              (message, index, messageArray) => {

                const previousMessage =
                  messageArray[index - 1];

                const showDate =
                  !previousMessage ||
                  previousMessage.date !== message.date;

                return (
                  <React.Fragment key={message.id}>

                    {showDate && (
                      <div className="vendor-chat-date">
                        <span>
                          {message.date}
                        </span>
                      </div>
                    )}

                    <div
                      className={`vendor-chat-message-row ${
                        message.sender === "admin"
                          ? "vendor-chat-message-row-sent"
                          : "vendor-chat-message-row-received"
                      }`}
                    >

                      <div
                        className={`vendor-chat-message-bubble ${
                          message.sender === "admin"
                            ? "vendor-chat-message-sent"
                            : "vendor-chat-message-received"
                        }`}
                      >

                        <p>
                          {message.message}
                        </p>

                        <div className="vendor-chat-message-meta">

                          <span>
                            {message.time}
                          </span>

                          {message.sender === "admin" && (
                            <span className="vendor-chat-message-status">

                              {message.seen ? (
                                <FaCheckDouble />
                              ) : (
                                <FaCheck />
                              )}

                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                  </React.Fragment>
                );
              },
            )}

          </div>

          {/* =================================================
              MESSAGE INPUT
          ================================================= */}

          <div className="vendor-chat-input-area">

            <textarea
              value={newMessage}
              placeholder="Type a message..."
              rows="1"
              onChange={(event) =>
                setNewMessage(event.target.value)
              }
              onKeyDown={handleMessageKeyDown}
            />

            <button
              type="button"
              className="vendor-chat-send-btn"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <FaPaperPlane />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default VendorChat;