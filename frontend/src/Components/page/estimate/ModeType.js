import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaCheck,
  FaTimes,
  FaSave,
} from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";
import "./modeType.css";

const ModeType = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [modeTypes, setModeTypes] = useState([
    {
      id: 1,
      mode: "Wallet",
      status: "Active",
      createdDate: "01-04-2026 08:58",
    },
    {
      id: 2,
      mode: "Net Banking",
      status: "Active",
      createdDate: "01-04-2026 08:58",
    },
    {
      id: 3,
      mode: "Credit Card",
      status: "Active",
      createdDate: "01-04-2026 08:58",
    },
    {
      id: 4,
      mode: "Debit Card",
      status: "Active",
      createdDate: "01-04-2026 08:58",
    },
    {
      id: 5,
      mode: "Cheque",
      status: "Active",
      createdDate: "01-04-2026 08:58",
    },
    {
      id: 6,
      mode: "UPI",
      status: "Active",
      createdDate: "01-04-2026 08:58",
    },
    {
      id: 7,
      mode: "Bank Transfer",
      status: "Active",
      createdDate: "01-04-2026 08:58",
    },
    {
      id: 8,
      mode: "Cash",
      status: "Inactive",
      createdDate: "01-04-2026 08:58",
    },
    {
      id: 9,
      mode: "PayPal",
      status: "Active",
      createdDate: "01-04-2026 08:58",
    },
    {
      id: 10,
      mode: "Other",
      status: "Inactive",
      createdDate: "01-04-2026 08:58",
    },
  ]);

  // Controls Add/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // "add" or "edit"
  const [modalMode, setModalMode] = useState("add");

  // Currently editing record
  const [editingModeType, setEditingModeType] = useState(null);

  // Form value
  const [modeName, setModeName] = useState("");

  // Validation
  const [formError, setFormError] = useState("");

  // Status confirmation
  const [statusModeType, setStatusModeType] = useState(null);

  // Delete confirmation
  const [deleteModeType, setDeleteModeType] = useState(null);

  // =========================================================
  // BACKEND/API SECTION
  // =========================================================
  //
  // Later, these local operations can be replaced with API
  // calls without changing the table or modal UI.
  //
  // Example:
  //
  // const response = await axios.get("/api/mode-types");
  // const response = await axios.post("/api/mode-types", payload);
  //
  // =========================================================


  // -----------------------------------------
  // GET MODE TYPES
  // -----------------------------------------

  const fetchModeTypes = async () => {
    /*
      BACKEND LATER:

      const response = await axios.get("/api/mode-types");

      setModeTypes(response.data.data);
    */

    console.log("Fetch Mode Types API will be connected here.");
  };


  // -----------------------------------------
  // CREATE MODE TYPE
  // -----------------------------------------

  const createModeType = async (payload) => {
    /*
      BACKEND LATER:

      const response = await axios.post(
        "/api/mode-types",
        payload
      );

      return response.data;
    */

    const newModeType = {
      id:
        modeTypes.length > 0
          ? Math.max(...modeTypes.map((item) => item.id)) + 1
          : 1,

      mode: payload.mode,

      status: "Active",

      createdDate: getCurrentDateTime(),
    };

    setModeTypes((previous) => [...previous, newModeType]);

    return newModeType;
  };


  // -----------------------------------------
  // UPDATE MODE TYPE
  // -----------------------------------------

  const updateModeType = async (id, payload) => {
    /*
      BACKEND LATER:

      const response = await axios.put(
        `/api/mode-types/${id}`,
        payload
      );

      return response.data;
    */

    setModeTypes((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              mode: payload.mode,
            }
          : item,
      ),
    );
  };


  // -----------------------------------------
  // DELETE MODE TYPE
  // -----------------------------------------

  


  // -----------------------------------------
  // CHANGE STATUS
  // -----------------------------------------

  const updateModeTypeStatus = async (id, status) => {
    /*
      BACKEND LATER:

      await axios.patch(
        `/api/mode-types/${id}/status`,
        {
          status,
        }
      );
    */

    setModeTypes((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
            }
          : item,
      ),
    );
  };


  // =========================================================
  // DATE
  // =========================================================

  const getCurrentDateTime = () => {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, "0");

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, "0");

    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };


  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const handleOpenAdd = () => {
    setModalMode("add");

    setEditingModeType(null);

    setModeName("");

    setFormError("");

    setIsModalOpen(true);
  };


  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const handleOpenEdit = (row) => {
    setModalMode("edit");

    setEditingModeType(row);

    setModeName(row.mode);

    setFormError("");

    setIsModalOpen(true);
  };


  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleCloseModal = () => {
    setIsModalOpen(false);

    setModalMode("add");

    setEditingModeType(null);

    setModeName("");

    setFormError("");
  };


  // =========================================================
  // SUBMIT ADD / EDIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanedModeName = modeName.trim();

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!cleanedModeName) {
      setFormError("Please enter mode type.");

      return;
    }

    if (cleanedModeName.length < 2) {
      setFormError("Mode type must contain at least 2 characters.");

      return;
    }

    // Prevent duplicate mode names
    const duplicateMode = modeTypes.some(
      (item) =>
        item.mode.toLowerCase() === cleanedModeName.toLowerCase() &&
        item.id !== editingModeType?.id,
    );

    if (duplicateMode) {
      setFormError("This mode type already exists.");

      return;
    }

    try {
      // -----------------------------------------
      // EDIT
      // -----------------------------------------

      if (modalMode === "edit" && editingModeType) {
        await updateModeType(editingModeType.id, {
          mode: cleanedModeName,
        });
      }

      // -----------------------------------------
      // ADD
      // -----------------------------------------

      else {
        await createModeType({
          mode: cleanedModeName,
        });
      }

      handleCloseModal();
    } catch (error) {
      console.error("Mode Type save error:", error);

      setFormError(
        "Something went wrong. Please try again.",
      );
    }
  };


  // =========================================================
  // STATUS
  // =========================================================

  const handleStatusClick = (row) => {
    setStatusModeType(row);
  };


  const handleStatusConfirm = async () => {
    if (!statusModeType) {
      return;
    }

    const newStatus =
      statusModeType.status === "Active"
        ? "Inactive"
        : "Active";

    try {
      await updateModeTypeStatus(
        statusModeType.id,
        newStatus,
      );

      setStatusModeType(null);
    } catch (error) {
      console.error("Status update error:", error);
    }
  };


  // =========================================================
  // DELETE
  // =========================================================

  const handleDeleteClick = (row) => {
    setDeleteModeType(row);
  };


  const handleDeleteConfirm = async () => {
    if (!deleteModeType) {
      return;
    }

    try {
      await deleteModeType(deleteModeType.id);

      setDeleteModeType(null);
    } catch (error) {
      console.error("Delete Mode Type error:", error);
    }
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
        sortable: false,

        render: (_, row, rowIndex) => rowIndex + 1,
      },

      {
        key: "mode",
        label: "Mode",
        width: "180px",
        sortable: true,
      },

      {
        key: "status",
        label: "Status",
        width: "150px",
        sortable: true,

        render: (value, row) => (
          <span
            className={`mode-status ${
              value === "Active"
                ? "mode-status-active"
                : "mode-status-inactive"
            }`}
          >
            <span className="mode-status-icon">
              {value === "Active" ? (
                <FaCheck />
              ) : (
                <FaTimes />
              )}
            </span>

            {value}
          </span>
        ),
      },

      {
        key: "createdDate",
        label: "Created Date",
        width: "180px",
        sortable: true,

        render: (value) => {
          const parts = value.split(" ");

          return (
            <div className="mode-created-date">
              <span>{parts[0]}</span>

              <span>{parts[1]}</span>
            </div>
          );
        },
      },

      {
        key: "actions",
        label: "Actions",
        width: "260px",
        sortable: false,

        render: (_, row) => (
          <div className="mode-action-buttons">

            {/* STATUS */}

            <button
              type="button"
              className="mode-action-btn mode-status-btn"
              onClick={() => handleStatusClick(row)}
              title="Change Status"
            >
              <FaSyncAlt />

              <span>Status</span>
            </button>


            {/* EDIT */}

            <button
              type="button"
              className="mode-action-btn mode-edit-btn"
              onClick={() => handleOpenEdit(row)}
              title="Edit"
            >
              <FaEdit />

              <span>Edit</span>
            </button>


            {/* DELETE */}

            <button
              type="button"
              className="mode-action-btn mode-delete-btn"
              onClick={() => handleDeleteClick(row)}
              title="Delete"
            >
              <FaTrash />

              <span>Delete</span>
            </button>

          </div>
        ),
      },
    ],
    [modeTypes],
  );


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="mode-type-page">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="mode-type-page-header">

        <div>
          <h2 className="mode-type-page-title">
            Mode Type List
          </h2>

          <div className="mode-type-breadcrumb-wrapper">

            <Link to="/home">
              Home
            </Link>

            <span className="mode-type-breadcrumb-arrow">
              <IoIosArrowForward />
            </span>

            <span className="mode-type-breadcrumb-active">
              Mode Type List
            </span>

          </div>
        </div>

      </div>


      {/* =========================================
          CARD
      ========================================= */}

      <div className="mode-type-card">

        <div className="mode-type-card-header">

          <h3>
            Mode Type List
          </h3>
          <button
          type="button"
          className="mode-type-add-btn"
          onClick={handleOpenAdd}
        >
          <FaPlus />

          <span>
            Add Mode Type
          </span>
        </button>

        </div>


        {/* =========================================
            DATA TABLE
        ========================================= */}

        <div className="mode-type-table-wrapper">

          <DataTable
            columns={columns}
            data={modeTypes}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />

        </div>

      </div>


      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {isModalOpen && (
        <div
          className="mode-type-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              handleCloseModal();
            }
          }}
        >

          <div className="mode-type-modal">

            {/* MODAL HEADER */}

            <div className="mode-type-modal-header">

              <h3>
                {modalMode === "edit"
                  ? "Edit Mode Type"
                  : "Add Mode Type"}
              </h3>

            </div>


            {/* FORM */}

            <form
              className="mode-type-form"
              onSubmit={handleSubmit}
            >

              <div className="mode-type-form-group">

                <label htmlFor="modeType">
                  <span className="mode-type-label-icon">
                    <FaSave />
                  </span>

                  Mode Type
                </label>


                <input
                  id="modeType"
                  type="text"
                  value={modeName}
                  onChange={(event) => {
                    setModeName(event.target.value);

                    if (formError) {
                      setFormError("");
                    }
                  }}
                  placeholder="Enter mode type"
                  autoFocus
                  maxLength={100}
                />


                {formError && (
                  <span className="mode-type-form-error">
                    {formError}
                  </span>
                )}

              </div>


              {/* MODAL BUTTONS */}

              <div className="mode-type-modal-actions">

                <button
                  type="submit"
                  className="mode-type-update-btn"
                >
                  <FaCheck />

                  <span>
                    {modalMode === "edit"
                      ? "Update"
                      : "Add"}
                  </span>
                </button>


                <button
                  type="button"
                  className="mode-type-cancel-btn"
                  onClick={handleCloseModal}
                >
                  <FaTimes />

                  <span>
                    Cancel
                  </span>
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =====================================================
          STATUS CONFIRMATION MODAL
      ===================================================== */}

      {statusModeType && (
        <div className="mode-type-modal-overlay">

          <div className="mode-type-confirm-modal">

            <div className="mode-type-confirm-icon">
              !
            </div>


            <h3>
              Are you sure?
            </h3>


            <p>
              You want to{" "}
              {statusModeType.status === "Active"
                ? "deactivate"
                : "activate"}{" "}
              this mode type!
            </p>


            <div className="mode-type-confirm-actions">

              <button
                type="button"
                className="mode-type-confirm-btn"
                onClick={handleStatusConfirm}
              >
                Yes,{" "}
                {statusModeType.status === "Active"
                  ? "deactivate"
                  : "activate"}{" "}
                it!
              </button>


              <button
                type="button"
                className="mode-type-confirm-cancel-btn"
                onClick={() =>
                  setStatusModeType(null)
                }
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deleteModeType && (
        <div className="mode-type-modal-overlay">

          <div className="mode-type-confirm-modal">

            <div className="mode-type-delete-icon">
              <FaTrash />
            </div>


            <h3>
              Delete Mode Type?
            </h3>


            <p>
              Are you sure you want to delete{" "}
              <strong>
                {deleteModeType.mode}
              </strong>
              ?
            </p>


            <div className="mode-type-confirm-actions">

              <button
                type="button"
                className="mode-type-delete-confirm-btn"
                onClick={handleDeleteConfirm}
              >
                <FaTrash />

                Yes, Delete
              </button>


              <button
                type="button"
                className="mode-type-confirm-cancel-btn"
                onClick={() =>
                  setDeleteModeType(null)
                }
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

export default ModeType;