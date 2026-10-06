import React, { useMemo, useState } from "react";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./claimReason.css";

const ClaimReason = () => {
  // =========================================================
  // TEMPORARY CLAIM REASON DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [claimReasons, setClaimReasons] = useState([
    {
      id: 1,
      reason: "Service not completed",
      status: "Active",
      createdDate: "30 Apr 2026",
    },
    {
      id: 2,
      reason: "Poor service quality",
      status: "Active",
      createdDate: "28 Apr 2026",
    },
    {
      id: 3,
      reason: "Wrong service provided",
      status: "Inactive",
      createdDate: "25 Apr 2026",
    },
  ]);

  // =========================================================
  // MODAL
  // =========================================================

  const [showModal, setShowModal] = useState(false);

  const [modalType, setModalType] = useState("");

  const [selectedReason, setSelectedReason] = useState(null);

  const [reasonValue, setReasonValue] = useState("");

  const [statusValue, setStatusValue] = useState("Active");

  // =========================================================
  // OPEN ADD / EDIT MODAL
  // =========================================================

  const handleOpenAdd = () => {
    setModalType("add");
    setSelectedReason(null);
    setReasonValue("");
    setStatusValue("Active");
    setShowModal(true);
  };

  const handleOpenEdit = (row) => {
    setModalType("edit");
    setSelectedReason(row);
    setReasonValue(row.reason);
    setStatusValue(row.status);
    setShowModal(true);
  };

  // =========================================================
  // OPEN STATUS MODAL
  // =========================================================

  const handleOpenStatus = (row) => {
    setModalType("status");
    setSelectedReason(row);
    setStatusValue(row.status);
    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType("");
    setSelectedReason(null);
    setReasonValue("");
    setStatusValue("Active");
  };

  // =========================================================
  // SAVE CLAIM REASON
  // =========================================================

  const handleSaveReason = () => {
    if (!reasonValue.trim()) {
      alert("Please enter claim reason.");
      return;
    }

    if (modalType === "add") {
      const newReason = {
        id: Date.now(),
        reason: reasonValue.trim(),
        status: statusValue,
        createdDate: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };

      setClaimReasons((previous) => [
        ...previous,
        newReason,
      ]);

      console.log("Add Claim Reason:", newReason);
    }

    if (modalType === "edit") {
      setClaimReasons((previous) =>
        previous.map((item) =>
          item.id === selectedReason.id
            ? {
                ...item,
                reason: reasonValue.trim(),
                status: statusValue,
              }
            : item,
        ),
      );

      console.log("Edit Claim Reason:", {
        id: selectedReason.id,
        reason: reasonValue.trim(),
        status: statusValue,
      });
    }

    // API CALL WILL BE CONNECTED HERE LATER

    handleCloseModal();
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleUpdateStatus = () => {
    if (!selectedReason) {
      return;
    }

    setClaimReasons((previous) =>
      previous.map((item) =>
        item.id === selectedReason.id
          ? {
              ...item,
              status: statusValue,
            }
          : item,
      ),
    );

    console.log("Update Claim Reason Status:", {
      id: selectedReason.id,
      status: statusValue,
    });

    // API CALL WILL BE CONNECTED HERE LATER

    handleCloseModal();
  };

  // =========================================================
  // DELETE CLAIM REASON
  // =========================================================

  const handleDelete = (row) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this claim reason?",
    );

    if (!confirmed) {
      return;
    }

    setClaimReasons((previous) =>
      previous.filter((item) => item.id !== row.id),
    );

    console.log("Delete Claim Reason:", row);

    // API DELETE CALL WILL BE CONNECTED HERE LATER
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "Sr.No",
        width: "90px",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      {
        key: "reason",
        label: "Reason",
        width: "350px",
        sortable: true,

        render: (value) => (
          <div className="claim-reason-text">
            {value}
          </div>
        ),
      },

      {
        key: "status",
        label: "Status",
        width: "130px",
        sortable: true,

        render: (value) => (
          <span
            className={`claim-reason-status ${
              value.toLowerCase() === "active"
                ? "claim-reason-status-active"
                : "claim-reason-status-inactive"
            }`}
          >
            {value}
          </span>
        ),
      },

      {
        key: "createdDate",
        label: "Created Date",
        width: "160px",
        sortable: true,
      },

      {
        key: "actions",
        label: "Actions",
        width: "210px",
        sortable: false,

        render: (_, row) => (
          <div className="claim-reason-actions">

            <button
              type="button"
              className="claim-reason-btn claim-reason-status-btn"
              onClick={() => handleOpenStatus(row)}
              title="Change Status"
            >
              {row.status === "Active" ? (
                <FaToggleOn />
              ) : (
                <FaToggleOff />
              )}

              <span>Status</span>
            </button>

            <button
              type="button"
              className="claim-reason-btn claim-reason-edit-btn"
              onClick={() => handleOpenEdit(row)}
              title="Edit"
            >
              <FaEdit />

              <span>Edit</span>
            </button>

            <button
              type="button"
              className="claim-reason-btn claim-reason-delete-btn"
              onClick={() => handleDelete(row)}
              title="Delete"
            >
              <FaTrash />

              <span>Delete</span>
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
    <div className="claim-reason-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="claim-reason-header">

        <div className="claim-reason-breadcrumb">
          <span className="claim-reason-breadcrumb-active">
            Claim Reason
          </span>
        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="claim-reason-card">

        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="claim-reason-card-header">

          <h2>
            All Claim Reasons
          </h2>

          <button
            type="button"
            className="claim-reason-add-btn"
            onClick={handleOpenAdd}
          >
            Add Claim Reason
          </button>

        </div>

        {/* ===================================================
            DATA TABLE
        =================================================== */}

        <div className="claim-reason-table-wrapper">

          <DataTable
            columns={columns}
            data={claimReasons}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />

        </div>

      </div>

      {/* =====================================================
          ADD / EDIT / STATUS MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="claim-reason-modal-overlay"
          onClick={handleCloseModal}
        >

          <div
            className="claim-reason-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="claim-reason-modal-header">

              <h3>
                {modalType === "add" &&
                  "Add Claim Reason"}

                {modalType === "edit" &&
                  "Edit Claim Reason"}

                {modalType === "status" &&
                  "Change Claim Reason Status"}
              </h3>

              <button
                type="button"
                className="claim-reason-modal-close"
                onClick={handleCloseModal}
              >
                ×
              </button>

            </div>

            {/* =================================================
                MODAL BODY
            ================================================= */}

            <div className="claim-reason-modal-body">

              {modalType === "status" ? (
                <>
                  <div className="claim-reason-detail-row">

                    <strong>
                      Reason:
                    </strong>

                    <span>
                      {selectedReason?.reason}
                    </span>

                  </div>

                  <div className="claim-reason-input-group">

                    <label htmlFor="claimReasonStatus">
                      Status
                    </label>

                    <select
                      id="claimReasonStatus"
                      value={statusValue}
                      onChange={(event) =>
                        setStatusValue(
                          event.target.value,
                        )
                      }
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>

                  </div>
                </>
              ) : (
                <>
                  <div className="claim-reason-input-group">

                    <label htmlFor="claimReason">
                      Claim Reason
                    </label>

                    <textarea
                      id="claimReason"
                      rows="4"
                      placeholder="Enter claim reason"
                      value={reasonValue}
                      onChange={(event) =>
                        setReasonValue(
                          event.target.value,
                        )
                      }
                    />

                  </div>

                  <div className="claim-reason-input-group">

                    <label htmlFor="claimReasonStatus">
                      Status
                    </label>

                    <select
                      id="claimReasonStatus"
                      value={statusValue}
                      onChange={(event) =>
                        setStatusValue(
                          event.target.value,
                        )
                      }
                    >
                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>
                    </select>

                  </div>
                </>
              )}

            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div className="claim-reason-modal-footer">

              <button
                type="button"
                className="claim-reason-cancel-btn"
                onClick={handleCloseModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="claim-reason-save-btn"
                onClick={
                  modalType === "status"
                    ? handleUpdateStatus
                    : handleSaveReason
                }
              >
                {modalType === "status"
                  ? "Update Status"
                  : modalType === "edit"
                    ? "Update"
                    : "Add"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default ClaimReason;