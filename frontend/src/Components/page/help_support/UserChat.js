import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import {
  FaPaperPlane,
  FaSearch,
  FaCheck,
  FaCheckDouble,
} from "react-icons/fa";

import "./userChat.css";

const UserChat = () => {
  // =========================================================
  // TEMPORARY USER DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [users] = useState([
    {
      id: 1,
      name: "Sagar Malik",
      image: "https://i.pravatar.cc/150?img=12",
      lastMessage: "Thank you for your help.",
      lastTime: "10:42 AM",
      unread: 2,
    },
    {
      id: 2,
      name: "Rahul Testing",
      image: "https://i.pravatar.cc/150?img=11",
      lastMessage: "I have completed the booking.",
      lastTime: "09:35 AM",
      unread: 0,
    },
    {
      id: 3,
      name: "John Developer",
      image: "https://i.pravatar.cc/150?img=13",
      lastMessage: "Can you check my order?",
      lastTime: "Yesterday",
      unread: 4,
    },
    {
      id: 4,
      name: "Michael Smith",
      image: "https://i.pravatar.cc/150?img=14",
      lastMessage: "Okay, that's fine.",
      lastTime: "Yesterday",
      unread: 0,
    },
    {
      id: 5,
      name: "David Wilson",
      image: "https://i.pravatar.cc/150?img=15",
      lastMessage: "I will send the details.",
      lastTime: "12 Aug",
      unread: 1,
    },
    {
      id: 6,
      name: "Emily Johnson",
      image: "https://i.pravatar.cc/150?img=16",
      lastMessage: "Thanks!",
      lastTime: "11 Aug",
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
        sender: "user",
        message: "Hello, I need some help with my booking.",
        time: "10:25 AM",
        date: "Today",
      },
      {
        id: 2,
        sender: "admin",
        message: "Hello Sagar, sure. How can I help you?",
        time: "10:27 AM",
        date: "Today",
        seen: true,
      },
      {
        id: 3,
        sender: "user",
        message:
          "My booking status has not been updated yet. Could you please check it?",
        time: "10:31 AM",
        date: "Today",
      },
      {
        id: 4,
        sender: "admin",
        message:
          "Sure. Please give me a moment while I check the booking details.",
        time: "10:34 AM",
        date: "Today",
        seen: true,
      },
      {
        id: 5,
        sender: "user",
        message: "Okay, thank you.",
        time: "10:38 AM",
        date: "Today",
      },
      {
        id: 6,
        sender: "admin",
        message: "Your booking is currently being processed.",
        time: "10:40 AM",
        date: "Today",
        seen: true,
      },
      {
        id: 7,
        sender: "user",
        message: "Thank you for your help.",
        time: "10:42 AM",
        date: "Today",
      },
    ],

    2: [
      {
        id: 1,
        sender: "user",
        message: "I have completed the booking.",
        time: "09:35 AM",
        date: "Today",
      },
      {
        id: 2,
        sender: "admin",
        message: "Great. Thank you for the update.",
        time: "09:38 AM",
        date: "Today",
        seen: true,
      },
    ],

    3: [
      {
        id: 1,
        sender: "user",
        message: "Can you check my order?",
        time: "04:15 PM",
        date: "Yesterday",
      },
      {
        id: 2,
        sender: "admin",
        message: "Yes, I will check it for you.",
        time: "04:18 PM",
        date: "Yesterday",
        seen: true,
      },
    ],

    4: [
      {
        id: 1,
        sender: "user",
        message: "Okay, that's fine.",
        time: "02:20 PM",
        date: "Yesterday",
      },
    ],

    5: [
      {
        id: 1,
        sender: "user",
        message: "I will send the details.",
        time: "11:20 AM",
        date: "12 Aug",
      },
    ],

    6: [
      {
        id: 1,
        sender: "user",
        message: "Thanks!",
        time: "03:40 PM",
        date: "11 Aug",
      },
    ],
  });

  // =========================================================
  // STATE
  // =========================================================

  const [selectedUserId, setSelectedUserId] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // =========================================================
  // SELECTED USER
  // =========================================================

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId),
    [users, selectedUserId],
  );

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [users, searchText]);

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
      [selectedUserId]: [
        ...(previous[selectedUserId] || []),
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
  // USER SELECT
  // =========================================================

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="user-chat-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="user-chat-header">

        <h2 className="user-chat-title">
          User Chat
        </h2>

        <div className="user-chat-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="user-chat-breadcrumb-active">
            Help & Center
          </span>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="user-chat-breadcrumb-active">
            User Chat
          </span>

        </div>

      </div>

      {/* =====================================================
          CHAT CARD
      ===================================================== */}

      <div className="user-chat-card">

        {/* ===================================================
            LEFT USER LIST
        =================================================== */}

        <div className="user-chat-sidebar">

          <div className="user-chat-sidebar-header">

            <h3>
              Users
            </h3>

            <span>
              {users.length}
            </span>

          </div>

          {/* SEARCH */}

          <div className="user-chat-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search users..."
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
            />

          </div>

          {/* USER LIST */}

          <div className="user-chat-user-list">

            {filteredUsers.length === 0 ? (

              <div className="user-chat-no-users">
                No users found
              </div>

            ) : (

              filteredUsers.map((user) => (

                <button
                  type="button"
                  key={user.id}
                  className={`user-chat-user-item ${
                    selectedUserId === user.id
                      ? "user-chat-user-item-active"
                      : ""
                  }`}
                  onClick={() => handleSelectUser(user.id)}
                >

                  <div className="user-chat-avatar-wrapper">

                    <img
                      src={user.image}
                      alt={user.name}
                      className="user-chat-user-avatar"
                    />

                    <span className="user-chat-online-dot" />

                  </div>

                  <div className="user-chat-user-content">

                    <div className="user-chat-user-top">

                      <strong>
                        {user.name}
                      </strong>

                      <span>
                        {user.lastTime}
                      </span>

                    </div>

                    <div className="user-chat-user-bottom">

                      <p>
                        {user.lastMessage}
                      </p>

                      {user.unread > 0 && (
                        <span className="user-chat-unread">
                          {user.unread}
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

        <div className="user-chat-main">

          {/* CHAT HEADER */}

          {selectedUser && (

            <div className="user-chat-main-header">

              <div className="user-chat-main-user">

                <div className="user-chat-main-avatar-wrapper">

                  <img
                    src={selectedUser.image}
                    alt={selectedUser.name}
                    className="user-chat-main-avatar"
                  />

                  <span className="user-chat-online-dot" />

                </div>

                <div>

                  <h3>
                    {selectedUser.name}
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

          <div className="user-chat-messages">

            {(messages[selectedUserId] || []).map(
              (message, index, messageArray) => {

                const previousMessage =
                  messageArray[index - 1];

                const showDate =
                  !previousMessage ||
                  previousMessage.date !== message.date;

                return (
                  <React.Fragment key={message.id}>

                    {showDate && (
                      <div className="user-chat-date">
                        <span>
                          {message.date}
                        </span>
                      </div>
                    )}

                    <div
                      className={`user-chat-message-row ${
                        message.sender === "admin"
                          ? "user-chat-message-row-sent"
                          : "user-chat-message-row-received"
                      }`}
                    >

                      <div
                        className={`user-chat-message-bubble ${
                          message.sender === "admin"
                            ? "user-chat-message-sent"
                            : "user-chat-message-received"
                        }`}
                      >

                        <p>
                          {message.message}
                        </p>

                        <div className="user-chat-message-meta">

                          <span>
                            {message.time}
                          </span>

                          {message.sender === "admin" && (
                            <span className="user-chat-message-status">
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

          <div className="user-chat-input-area">

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
              className="user-chat-send-btn"
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

export default UserChat;