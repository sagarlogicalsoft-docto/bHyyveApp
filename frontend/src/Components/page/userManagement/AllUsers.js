import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaTrash,
  FaWallet,
  FaCheck,
  FaTimes,
  FaInfo,
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";
import "./allUsers.css";

const AllUsers = () => {
  const navigate = useNavigate();

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [deleteUser, setDeleteUser] = useState(null);
  const [walletUser, setWalletUser] = useState(null);
  const [walletAmount, setWalletAmount] = useState("");

  // =========================================================
  // TEMPORARY USER DATA
  // Later API data will come here
  // =========================================================

  const userData = [
    {
      id: 1,
      photo: "https://i.pravatar.cc/80?img=12",
      name: "Keon Liu",
      phone: "2198261",
      email: "keonliu13@gmail.com",
      wallet: 0.0,
      date: "24 Jul 2026 04:52 AM",
      activity: "Never Login",
    },
    {
      id: 2,
      photo: "https://i.pravatar.cc/80?img=13",
      name: "Michael Martin",
      phone: "8210251824",
      email: "michael@gmail.com",
      wallet: 0.0,
      date: "13 Jul 2026 08:27 PM",
      activity: "1S ago",
    },
    {
      id: 3,
      photo: "https://i.pravatar.cc/80?img=14",
      name: "Sarah Young",
      phone: "8815687927",
      email: "sarah@gmail.com",
      wallet: 0.0,
      date: "01 Jul 2026 11:06 AM",
      activity: "just now",
    },
    {
      id: 4,
      photo: "https://i.pravatar.cc/80?img=15",
      name: "Indranie Hameraj",
      phone: "9876543210",
      email: "indranie@gmail.com",
      wallet: 100.0,
      date: "22 Jun 2026 02:18 AM",
      activity: "4D 21H 22MIN 25S ago",
    },
    {
      id: 5,
      photo: "https://i.pravatar.cc/80?img=16",
      name: "John Smith",
      phone: "9876541230",
      email: "johnsmith@gmail.com",
      wallet: 0.0,
      date: "09 Jun 2026 01:38 PM",
      activity: "just now",
    },
    {
      id: 6,
      photo: "https://i.pravatar.cc/80?img=17",
      name: "David Wilson",
      phone: "9876512340",
      email: "david@gmail.com",
      wallet: 0.0,
      date: "05 May 2026 06:07 PM",
      activity: "7S ago",
    },
    {
      id: 7,
      photo: "https://i.pravatar.cc/80?img=18",
      name: "Robert Taylor",
      phone: "9876501234",
      email: "robert@gmail.com",
      wallet: 0.0,
      date: "04 May 2026 07:04 PM",
      activity: "27S ago",
    },
    {
      id: 8,
      photo: "https://i.pravatar.cc/80?img=19",
      name: "James Anderson",
      phone: "9876543211",
      email: "james@gmail.com",
      wallet: 0.0,
      date: "01 May 2026 04:27 PM",
      activity: "23S ago",
    },
    {
      id: 9,
      photo: "https://i.pravatar.cc/80?img=20",
      name: "William Brown",
      phone: "9876543212",
      email: "william@gmail.com",
      wallet: 0.0,
      date: "30 Apr 2026 07:15 PM",
      activity: "7MIN 35S ago",
    },
    {
      id: 10,
      photo: "https://i.pravatar.cc/80?img=21",
      name: "Daniel Miller",
      phone: "9876543213",
      email: "daniel@gmail.com",
      wallet: 0.0,
      date: "30 Apr 2026 06:49 PM",
      activity: "11MIN 5S ago",
    },
    {
      id: 11,
      photo: "https://i.pravatar.cc/80?img=22",
      name: "Chris Davis",
      phone: "9876543214",
      email: "chris@gmail.com",
      wallet: 25.0,
      date: "28 Apr 2026 05:30 PM",
      activity: "2H ago",
    },
    {
      id: 12,
      photo: "https://i.pravatar.cc/80?img=23",
      name: "Matthew Garcia",
      phone: "9876543215",
      email: "matthew@gmail.com",
      wallet: 50.0,
      date: "26 Apr 2026 02:20 PM",
      activity: "1D ago",
    },
  ];

  // =========================================================
  // SELECT USER
  // =========================================================

  const handleSelectUser = (id) => {
    setSelectedUsers((previous) => {
      if (previous.includes(id)) {
        return previous.filter((userId) => userId !== id);
      }

      return [...previous, id];
    });
  };

  // =========================================================
  // SELECT ALL
  // =========================================================

  const allSelected =
    userData.length > 0 && selectedUsers.length === userData.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedUsers([]);
      return;
    }

    setSelectedUsers(userData.map((user) => user.id));
  };

  // =========================================================
  // VIEW DETAIL
  // =========================================================

  const handleViewDetail = (id) => {
    navigate(`/users/view/${id}`);
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = (user) => {
    setDeleteUser(user);
  };

  const confirmDelete = () => {
    if (!deleteUser) return;

    console.log("Delete User:", deleteUser.id);

    // API call later

    setDeleteUser(null);
  };

  // =========================================================
  // DELETE SELECTED
  // =========================================================

  const handleDeleteSelected = () => {
    if (selectedUsers.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedUsers.length} selected user(s)?`,
    );

    if (!confirmed) return;

    console.log("Delete selected users:", selectedUsers);

    // API call later

    setSelectedUsers([]);
  };

  // =========================================================
  // ADD WALLET
  // =========================================================

  const handleOpenWallet = (user) => {
    setWalletUser(user);
    setWalletAmount("");
  };

  const handleCloseWallet = () => {
    setWalletUser(null);
    setWalletAmount("");
  };

  const handleAddWallet = () => {
    if (!walletAmount || Number(walletAmount) < 1) {
      alert("Minimum amount is $1.00");
      return;
    }

    console.log("Add wallet amount:", {
      userId: walletUser.id,
      amount: Number(walletAmount),
    });

    // API call later

    handleCloseWallet();
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      // SELECT
      {
        key: "select",
        label: (
          <div className="allusers-select-header">
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
        width: "100px",
        sortable: false,

        render: (_, row) => (
          <input
            type="checkbox"
            className="allusers-row-checkbox"
            checked={selectedUsers.includes(row.id)}
            onChange={() => handleSelectUser(row.id)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },

      // SERIAL NUMBER
      {
        key: "serial",
        label: "Sr.No",
        width: "50px",
        sortable: false,

        render: (_, row, rowIndex) => (
          <span className="allusers-serial">
            {rowIndex + 1}
          </span>
        ),
      },

      // PHOTO
      {
        key: "photo",
        label: "Photo",
        width: "80px",
        sortable: false,

        render: (value, row) => (
          <div className="allusers-photo-wrapper">
            <img
              src={value}
              alt={row.name}
              className="allusers-photo"
            />
          </div>
        ),
      },

      // NAME
      {
        key: "name",
        label: "Name",
        width: "80px",
        sortable: true,

        render: (value) => (
          <span className="allusers-name">
            {value}
          </span>
        ),
      },

      // PHONE
      {
        key: "phone",
        label: "Phone",
        width: "50px",
        sortable: true,

        render: (value) => (
          <span className="allusers-phone">
            {value}
          </span>
        ),
      },

      // EMAIL
      {
        key: "email",
        label: "E-mail",
        width: "100px",
        sortable: true,

        render: (value) => (
          <span className="allusers-email">
            {value}
          </span>
        ),
      },

      // WALLET
      {
        key: "wallet",
        label: "Wallet/Reward",
        width: "50px",
        sortable: true,

        render: (value, row) => (
          <div className="allusers-wallet">
            <span className="allusers-wallet-amount">
              ${Number(value).toFixed(2)}
            </span>

            <button
              type="button"
              className="allusers-add-wallet-btn"
              onClick={() => handleOpenWallet(row)}
            >
              <FaWallet />
              <span>Add Wallet</span>
            </button>
          </div>
        ),
      },

      // DATE
      {
        key: "date",
        label: "Date",
        width: "100px",
        sortable: true,

        render: (value) => (
          <span className="allusers-date">
            {value}
          </span>
        ),
      },

      // LAST ACTIVITY
      {
        key: "activity",
        label: "Last/Activity",
        width: "190px",
        sortable: true,

        render: (value) => (
          <span className="allusers-activity">
            {value}
          </span>
        ),
      },

      // ACTION
      {
        key: "actions",
        label: "Action",
        width: "170px",
        sortable: false,

        render: (_, row) => (
          <div className="allusers-actions">
            <button
              type="button"
              className="allusers-view-btn"
              onClick={() => handleViewDetail(row.id)}
            >
              <FaEye />
              <span>View Detail</span>
            </button>

            <button
              type="button"
              className="allusers-delete-btn"
              onClick={() => handleDelete(row)}
            >
              <FaTrash />
              <span>Delete</span>
            </button>
          </div>
        ),
      },
    ],
    [selectedUsers, allSelected],
  );

  return (
    <div className="allusers-page">
      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="allusers-page-header">
        <div>
          <h2 className="allusers-page-title">
            All Users
          </h2>

          <div className="allusers-breadcrumb">
            <Link to="/home">
              Home
            </Link>

            <span className="allusers-breadcrumb-arrow">
              <IoIosArrowForward />
            </span>
            <span className="allusers-breadcrumb-active">
              All Users
            </span>
          </div>
        </div>
      </div>

      {/* =========================================
          CARD
      ========================================= */}

      <div className="allusers-card">
        <div className="allusers-card-header">
          <h3>All Users Data</h3>
        </div>

        {/* =========================================
            DATATABLE
        ========================================= */}

        <div className="allusers-table-wrapper">
          <DataTable
            columns={columns}
            data={userData}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />
        </div>

        {/* =========================================
            DELETE SELECTED
        ========================================= */}

        {selectedUsers.length > 0 && (
          <div className="allusers-selected-footer">
            <div className="allusers-selected-info">
              {selectedUsers.length} user
              {selectedUsers.length > 1 ? "s" : ""} selected
            </div>

            <button
              type="button"
              className="allusers-delete-selected-btn"
              onClick={handleDeleteSelected}
            >
              <FaTrash />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* =========================================
          DELETE MODAL
      ========================================= */}

      {deleteUser && (
        <div className="allusers-modal-overlay">
          <div className="allusers-delete-modal">
            <div className="allusers-delete-icon">
              <FaTrash />
            </div>

            <h3>Are you sure?</h3>

            <p>
              You want to delete{" "}
              <strong>{deleteUser.name}</strong>?
            </p>

            <div className="allusers-modal-actions">
              <button
                type="button"
                className="allusers-confirm-delete"
                onClick={confirmDelete}
              >
                <FaCheck />
                Yes, Delete
              </button>

              <button
                type="button"
                className="allusers-cancel-delete"
                onClick={() => setDeleteUser(null)}
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          ADD WALLET MODAL
      ========================================= */}

      {walletUser && (
        <div className="allusers-modal-overlay">
          <div className="allusers-wallet-modal">
            {/* TOP QUESTION ICON */}

            <div className="allusers-wallet-question">
              ?
            </div>

            {/* TITLE */}

            <h3 className="allusers-wallet-title">
              <FaWallet />
              Add Wallet Amount
            </h3>

            {/* USER INFORMATION */}

            <div className="allusers-wallet-user">
              <div className="allusers-wallet-user-icon">
                <img
                  src={walletUser.photo}
                  alt={walletUser.name}
                />
              </div>

              <div>
                <h4>{walletUser.name}</h4>

                <span>
                  User ID: {walletUser.id}
                </span>
              </div>
            </div>

            {/* CURRENT BALANCE */}

            <div className="allusers-current-balance">
              <div>
                <span>Current Balance</span>

                <strong>
                  ${Number(walletUser.wallet).toFixed(2)}
                </strong>
              </div>

              <span className="allusers-money-icon">
                💰
              </span>
            </div>

            {/* DIVIDER */}

            <div className="allusers-wallet-divider" />

            {/* AMOUNT */}

            <div className="allusers-wallet-field">
              <label htmlFor="walletAmount">
                <span>*</span> Enter Amount to Add
              </label>

              <div className="allusers-amount-wrapper">
                <span className="allusers-dollar">
                  $
                </span>

                <input
                  id="walletAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={walletAmount}
                  onChange={(event) =>
                    setWalletAmount(event.target.value)
                  }
                  placeholder="0.00"
                />
              </div>

              <small>
                Minimum amount: $1.00
              </small>
            </div>

            {/* INFORMATION */}

            <div className="allusers-wallet-info">
              <div className="allusers-info-icon">
                <FaInfo />
              </div>

              <span>
                The amount will be added immediately to the
                user's wallet balance.
              </span>
            </div>

            {/* DIVIDER */}

            <div className="allusers-wallet-divider" />

            {/* MODAL BUTTONS */}

            <div className="allusers-wallet-actions">
              <button
                type="button"
                className="allusers-add-funds-btn"
                onClick={handleAddWallet}
              >
                <FaCheck />
                Yes, Add Funds
              </button>

              <button
                type="button"
                className="allusers-wallet-cancel-btn"
                onClick={handleCloseWallet}
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;