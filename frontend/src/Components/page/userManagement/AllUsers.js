import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaTrash,
  FaWallet,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaUsers,
  FaCheckSquare,
  FaExclamationTriangle,
  FaRedo,
} from "react-icons/fa";

import DataTable from "../../common/DataTable";
import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceConfirmModal from "../../common/modal/serviceModal/ServiceConfirmModal";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";
import api from "../../../config/api";
import "./allUsers.css";

const ENDPOINTS = {
  list: "/admin/users",
  remove: (id) => `/admin/users/${id}`,
  removeMany: "/admin/users/bulk-delete",
  addWallet: (id) => `/admin/users/${id}/wallet`,
};

const formatUserDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Toronto",
  })
    .format(date)
    .replace(",", "");
};

const normalizeUser = (user) => ({
  id: user.id ?? user.user_id,
  photo: user.image ?? user.profile_image ?? "",
  name: [user.fname, user.lname].filter(Boolean).join(" "),
  phone: user.mobile ?? "",
  email: user.email ?? "",
  wallet: Number(user.wallet ?? 0),
  date: formatUserDate(user.create_date),
  activity: user.last_login_time_difference ?? "",
});

const userService = {
  getAll: async () => {
    const response = await api.get(ENDPOINTS.list);
    const body = response.data;

    const list = Array.isArray(body)
      ? body
      : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.users)
          ? body.users
          : [];

    return list.map(normalizeUser);
  },

  remove: (id) => api.delete(ENDPOINTS.remove(id)),

  removeMany: (ids) => api.post(ENDPOINTS.removeMany, { ids }),

  addWallet: (id, amount) => api.post(ENDPOINTS.addWallet(id), { amount }),
};

// =========================================================
// HELPERS
// =========================================================

const formatMoney = (value) => `$${Number(value).toFixed(2)}`;

const AVATAR_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='#dbe6f3'/><circle cx='20' cy='15' r='7' fill='#062f5c'/><path d='M6 38c2-9 9-12 14-12s12 3 14 12' fill='#062f5c'/></svg>`,
  );

const getActivityTone = (text = "") => {
  const value = text.toLowerCase();
  if (value.includes("never")) return "never";
  if (value.includes("just now") || /^\d+s ago$/.test(value)) return "online";
  return "recent";
};

// =========================================================
// COMPONENT
// =========================================================

const AllUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedUsers, setSelectedUsers] = useState([]);

  // confirm: { type: "single", user } | { type: "bulk" }
  const [confirm, setConfirm] = useState(null);
  const [confirmError, setConfirmError] = useState("");

  const [walletUser, setWalletUser] = useState(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletError, setWalletError] = useState("");
  const [walletBusy, setWalletBusy] = useState(false);

  const [success, setSuccess] = useState(null); // { title, message }

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async () => {
    setLoading(true);
    setLoadError("");

    try {
      setUsers(await userService.getAll());
    } catch (error) {
      setLoadError(error.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================================================
  // SELECTION
  // =========================================================

  const allSelected = users.length > 0 && selectedUsers.length === users.length;

  const handleSelectUser = (id) => {
    setSelectedUsers((previous) =>
      previous.includes(id)
        ? previous.filter((userId) => userId !== id)
        : [...previous, id],
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(allSelected ? [] : users.map((user) => user.id));
  };

  // =========================================================
  // DELETE (single + selected share ServiceConfirmModal)
  // =========================================================

  const closeConfirm = useCallback(() => {
    setConfirm(null);
    setConfirmError("");
  }, []);

  const closeSuccess = useCallback(() => setSuccess(null), []);

  const handleConfirmDelete = async () => {
    if (!confirm) return;

    const ids = confirm.type === "bulk" ? selectedUsers : [confirm.user.id];

    try {
      if (ids.length === 1) {
        await userService.remove(ids[0]);
      } else {
        await userService.removeMany(ids);
      }

      setUsers((previous) => previous.filter((user) => !ids.includes(user.id)));
      setSelectedUsers((previous) =>
        previous.filter((id) => !ids.includes(id)),
      );

      setSuccess({
        title: ids.length === 1 ? "User deleted" : "Users deleted",
        message:
          ids.length === 1
            ? `${confirm.user.name} has been removed.`
            : `${ids.length} users have been removed.`,
      });

      closeConfirm();
    } catch (error) {
      // keep the modal open and show the reason inside it
      setConfirmError(
        error.message || "Something went wrong. Please try again.",
      );
    }
  };

  // =========================================================
  // ADD WALLET (page-specific form modal)
  // =========================================================

  const walletValue = Number(walletAmount);
  const walletInvalid = walletAmount !== "" && walletValue < 1;

  const closeWallet = useCallback(() => {
    if (walletBusy) return;
    setWalletUser(null);
    setWalletAmount("");
    setWalletError("");
  }, [walletBusy]);

  useEffect(() => {
    if (!walletUser) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeWallet();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [walletUser, closeWallet]);

  const handleAddWallet = async () => {
    if (!walletUser) return;

    if (!walletAmount || walletValue < 1) {
      setWalletError("Minimum amount is $1.00");
      return;
    }

    setWalletBusy(true);
    setWalletError("");

    try {
      await userService.addWallet(walletUser.id, walletValue);
      await loadUsers();

      setSuccess({
        title: "Funds added",
        message: `${formatMoney(walletValue)} was added to ${walletUser.name}'s wallet.`,
      });

      setWalletUser(null);
      setWalletAmount("");
    } catch (error) {
      setWalletError(
        error.message || "Something went wrong. Please try again.",
      );
    } finally {
      setWalletBusy(false);
    }
  };

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalWallet = useMemo(
    () => users.reduce((sum, user) => sum + Number(user.wallet || 0), 0),
    [users],
  );

  const stats = [
    { label: "Total users", value: users.length, icon: <FaUsers /> },
    { label: "Selected", value: selectedUsers.length, icon: <FaCheckSquare /> },
    {
      label: "Total wallet balance",
      value: formatMoney(totalWallet),
      icon: <FaWallet />,
    },
  ];

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: (
          <div className="allusers-select-header">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              onClick={(event) => event.stopPropagation()}
              aria-label="Select all users"
            />
            <span>All</span>
          </div>
        ),
        width: "70px",
        sortable: false,
        render: (_, row) => (
          <input
            type="checkbox"
            className="allusers-row-checkbox"
            checked={selectedUsers.includes(row.id)}
            onChange={() => handleSelectUser(row.id)}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Select ${row.name}`}
          />
        ),
      },
      {
        key: "serial",
        label: "Sr.No",
        width: "60px",
        sortable: false,
        render: (_, row, rowIndex) => (
          <span className="allusers-text">{rowIndex + 1}</span>
        ),
      },
      {
        key: "photo",
        label: "Photo",
        width: "70px",
        sortable: false,
        render: (value, row) => (
          <img
            src={value || AVATAR_FALLBACK}
            alt={row.name}
            className="allusers-photo"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = AVATAR_FALLBACK;
            }}
          />
        ),
      },
      {
        key: "name",
        label: "Name",
        width: "150px",
        sortable: true,
        render: (value) => <span className="allusers-name">{value}</span>,
      },
      {
        key: "phone",
        label: "Phone",
        width: "110px",
        sortable: true,
        render: (value) => <span className="allusers-text">{value}</span>,
      },
      {
        key: "email",
        label: "E-mail",
        width: "190px",
        sortable: true,
        render: (value) => <span className="allusers-text">{value}</span>,
      },
      {
        key: "wallet",
        label: "Wallet/Reward",
        width: "130px",
        sortable: true,
        render: (value, row) => (
          <div className="allusers-wallet">
            <span className="allusers-wallet-amount">{formatMoney(value)}</span>

            <button
              type="button"
              className="allusers-add-wallet-btn"
              onClick={() => {
                setWalletUser(row);
                setWalletAmount("");
                setWalletError("");
              }}
            >
              <FaWallet />
              <span>Add Wallet</span>
            </button>
          </div>
        ),
      },
      {
        key: "date",
        label: "Date",
        width: "150px",
        sortable: true,
        render: (value) => <span className="allusers-text">{value}</span>,
      },
      {
        key: "activity",
        label: "Last/Activity",
        width: "170px",
        sortable: true,
        render: (value) => (
          <span
            className={`allusers-activity allusers-activity-${getActivityTone(value)}`}
          >
            {value}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Action",
        width: "130px",
        sortable: false,
        render: (_, row) => (
          <div className="allusers-actions">
            <button
              type="button"
              className="allusers-view-btn"
              onClick={() => navigate(`/users/view/${row.id}`)}
            >
              <FaEye />
              <span>View Detail</span>
            </button>

            <button
              type="button"
              className="allusers-delete-btn"
              onClick={() => {
                setConfirm({ type: "single", user: row });
                setConfirmError("");
              }}
            >
              <FaTrash />
              <span>Delete</span>
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, selectedUsers, allSelected],
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="allusers-page">
      {/* PAGE HEADER */}
      <div className="allusers-page-header">
        <h2 className="allusers-page-title">All Users</h2>

        <ServiceBreadcrumbs
          className="allusers-breadcrumb-spacing"
          items={[{ label: "All Users" }]}
        />
      </div>

      {/* SUMMARY */}
      <div className="allusers-stats">
        {stats.map((stat) => (
          <div className="allusers-stat" key={stat.label}>
            <span className="allusers-stat-icon">{stat.icon}</span>
            <div>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CARD */}
      <div className="allusers-card">
        <div className="allusers-card-header">
          <h3>All Users Data</h3>
        </div>

        <div className="allusers-table-wrapper">
          {loading && (
            <div className="allusers-state" role="status">
              <span className="allusers-spinner" />
              Loading users…
            </div>
          )}

          {!loading && loadError && (
            <div className="allusers-state allusers-state-error" role="alert">
              <FaExclamationTriangle />
              <span>{loadError}</span>
              <button
                type="button"
                className="allusers-retry-btn"
                onClick={loadUsers}
              >
                <FaRedo />
                Try again
              </button>
            </div>
          )}

          {!loading && !loadError && users.length === 0 && (
            <div className="allusers-state">No users found.</div>
          )}

          {!loading && !loadError && users.length > 0 && (
            <DataTable
              columns={columns}
              data={users}
              entriesPerPageOptions={[10, 25, 50, 100]}
              defaultEntriesPerPage={10}
              searchable={true}
              sortable={true}
            />
          )}
        </div>

        {selectedUsers.length > 0 && (
          <div className="allusers-selected-footer">
            <div className="allusers-selected-info">
              {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}{" "}
              selected
            </div>

            <div className="allusers-footer-actions">
              <button
                type="button"
                className="allusers-clear-btn"
                onClick={() => setSelectedUsers([])}
              >
                Clear selection
              </button>

              <button
                type="button"
                className="allusers-delete-selected-btn"
                onClick={() => {
                  setConfirm({ type: "bulk" });
                  setConfirmError("");
                }}
              >
                <FaTrash />
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE CONFIRM (shared modal) */}
      <ServiceConfirmModal
        isOpen={Boolean(confirm)}
        variant="danger"
        title={
          confirm?.type === "bulk"
            ? "Delete selected users?"
            : "Delete this user?"
        }
        message={
          <>
            {confirm?.type === "bulk"
              ? `You are about to delete ${selectedUsers.length} selected user${
                  selectedUsers.length > 1 ? "s" : ""
                }. This can't be undone.`
              : `${confirm?.user?.name ?? "This user"} will be permanently removed. This can't be undone.`}
            {confirmError && (
              <span className="allusers-confirm-error" role="alert">
                {confirmError}
              </span>
            )}
          </>
        }
        confirmText="Yes, delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirm}
      />

      {/* SUCCESS (shared modal) */}
      <ServiceSuccessModal
        isOpen={Boolean(success)}
        title={success?.title}
        message={success?.message}
        onClose={closeSuccess}
      />

      {/* ADD WALLET MODAL (page-specific form) */}
      {walletUser && (
        <div
          className="allusers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeWallet();
          }}
        >
          <div
            className="allusers-wallet-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="allusers-wallet-title"
          >
            <h3 className="allusers-wallet-title" id="allusers-wallet-title">
              <FaWallet />
              Add Wallet Amount
            </h3>

            <div className="allusers-wallet-user">
              <div className="allusers-wallet-user-icon">
                <img
                  src={walletUser.photo || AVATAR_FALLBACK}
                  alt={walletUser.name}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = AVATAR_FALLBACK;
                  }}
                />
              </div>

              <div>
                <h4>{walletUser.name}</h4>
                <span>User ID: {walletUser.id}</span>
              </div>
            </div>

            <div className="allusers-current-balance">
              <div>
                <span>Current balance</span>
                <strong>{formatMoney(walletUser.wallet)}</strong>
              </div>

              {walletValue >= 1 && (
                <div className="allusers-new-balance">
                  <span>After adding</span>
                  <strong>
                    {formatMoney(Number(walletUser.wallet) + walletValue)}
                  </strong>
                </div>
              )}
            </div>

            <div className="allusers-wallet-field">
              <label htmlFor="walletAmount">
                Amount to add <span>*</span>
              </label>

              <div
                className={`allusers-amount-wrapper ${
                  walletInvalid || walletError ? "allusers-amount-invalid" : ""
                }`}
              >
                <span className="allusers-dollar">$</span>

                <input
                  id="walletAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  autoFocus
                  value={walletAmount}
                  aria-invalid={walletInvalid || Boolean(walletError)}
                  onChange={(event) => {
                    setWalletAmount(event.target.value);
                    setWalletError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !walletBusy) handleAddWallet();
                  }}
                  placeholder="0.00"
                />
              </div>

              <small
                className={
                  walletInvalid || walletError ? "allusers-field-error" : ""
                }
              >
                {walletError || "Minimum amount: $1.00"}
              </small>
            </div>

            <div className="allusers-wallet-info">
              <FaInfoCircle />
              <span>The amount is added to the user's wallet immediately.</span>
            </div>

            <div className="allusers-wallet-actions">
              <button
                type="button"
                className="allusers-btn allusers-btn-primary"
                onClick={handleAddWallet}
                disabled={walletBusy}
              >
                {walletBusy ? (
                  <span className="allusers-spinner allusers-spinner-light" />
                ) : (
                  <FaCheck />
                )}
                {walletBusy ? "Adding…" : "Yes, add funds"}
              </button>

              <button
                type="button"
                className="allusers-btn allusers-btn-ghost"
                onClick={closeWallet}
                disabled={walletBusy}
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
