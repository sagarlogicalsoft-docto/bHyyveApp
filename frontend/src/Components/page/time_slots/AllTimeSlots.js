import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./allTimeSlots.css";

const AllTimeSlots = () => {
  const navigate = useNavigate();

  // =========================================================
  // TEMPORARY DATA
  // Later API data will come here
  // =========================================================

  const [timeSlots, setTimeSlots] = useState([
    {
      id: 1,
      timeSlot: "09:00 AM - 10:00 AM",
    },
    {
      id: 2,
      timeSlot: "10:00 AM - 11:00 AM",
    },
    {
      id: 3,
      timeSlot: "11:00 AM - 12:00 PM",
    },
    {
      id: 4,
      timeSlot: "12:00 PM - 01:00 PM",
    },
    {
      id: 5,
      timeSlot: "01:00 PM - 02:00 PM",
    },
    {
      id: 6,
      timeSlot: "02:00 PM - 03:00 PM",
    },
    {
      id: 7,
      timeSlot: "03:00 PM - 04:00 PM",
    },
    {
      id: 8,
      timeSlot: "04:00 PM - 05:00 PM",
    },
  ]);

  const [selectedSlots, setSelectedSlots] = useState([]);

  // =========================================================
  // SELECT / UNSELECT
  // =========================================================

  const handleSelectSlot = (id) => {
    setSelectedSlots((previous) => {
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
    if (selectedSlots.length === timeSlots.length) {
      setSelectedSlots([]);
      return;
    }

    setSelectedSlots(timeSlots.map((item) => item.id));
  };

  // =========================================================
  // DELETE SINGLE
  // =========================================================

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this time slot?",
    );

    if (!confirmed) return;

    setTimeSlots((previous) =>
      previous.filter((slot) => slot.id !== id),
    );

    setSelectedSlots((previous) =>
      previous.filter((slotId) => slotId !== id),
    );

    console.log("Delete Time Slot:", id);

    // API call later
  };

  // =========================================================
  // DELETE SELECTED
  // =========================================================

  const handleDeleteSelected = () => {
    if (selectedSlots.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedSlots.length} selected time slot(s)?`,
    );

    if (!confirmed) return;

    setTimeSlots((previous) =>
      previous.filter(
        (slot) => !selectedSlots.includes(slot.id),
      ),
    );

    console.log("Delete Selected Time Slots:", selectedSlots);

    setSelectedSlots([]);

    // API call later
  };

  // =========================================================
  // ADD TIME SLOT
  // =========================================================

  const handleAdd = () => {
    navigate("/time_slots/add");
  };

  // =========================================================
  // EDIT TIME SLOT
  // =========================================================

  const handleEdit = (id) => {
    navigate(`/time_slots/update/${id}`);
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: (
          <div className="time-slot-select-header">
            <input
              type="checkbox"
              className="time-slot-checkbox"
              checked={
                timeSlots.length > 0 &&
                selectedSlots.length === timeSlots.length
              }
              onChange={handleSelectAll}
            />

            <span>All Select</span>
          </div>
        ),
        width: "50px",
        sortable: false,

        render: (_, row) => (
          <input
            type="checkbox"
            className="time-slot-checkbox"
            checked={selectedSlots.includes(row.id)}
            onChange={() => handleSelectSlot(row.id)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },

      {
        key: "id",
        label: "Sr. No",
        width: "80px",
        sortable: true,
      },

      {
        key: "timeSlot",
        label: "Time Slote",
        width: "130px",
        sortable: true,
      },

      {
        key: "actions",
        label: "Action",
        width: "90px",
        sortable: false,

        render: (_, row) => (
          <div className="time-slot-actions">
            <button
              type="button"
              className="time-slot-edit-btn"
              onClick={() => handleEdit(row.id)}
              title="Edit"
            >
              <FaEdit />
              <span>Edit</span>
            </button>

            <button
              type="button"
              className="time-slot-delete-btn"
              onClick={() => handleDelete(row.id)}
              title="Delete"
            >
              <FaTrash />
              <span>Delete</span>
            </button>
          </div>
        ),
      },
    ],
    [selectedSlots, timeSlots],
  );

  return (
    <div className="time-slot-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="time-slot-page-header">
        <div>
          <h2 className="time-slot-page-title">
            All Time Slots
          </h2>

          <div className="time-slot-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span>
              Manage Time Slots
            </span>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="time-slot-breadcrumb-active">
              All Time Slots
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="time-slot-card">

        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="time-slot-card-header">

          <h3>All Time Slots</h3>

          <button
            type="button"
            className="time-slot-add-btn"
            onClick={handleAdd}
          >
            <FaPlus />

            <span>Add Time Slot</span>
          </button>

        </div>

        {/* ===================================================
            DATATABLE
        =================================================== */}

        <div className="time-slot-table-wrapper">
          <DataTable
            columns={columns}
            data={timeSlots}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />
        </div>

        {/* ===================================================
            DELETE SELECTED
        =================================================== */}

        {selectedSlots.length > 0 && (
          <div className="time-slot-selected-footer">

            <button
              type="button"
              className="time-slot-delete-selected-btn"
              onClick={handleDeleteSelected}
            >
              <FaTrash />

              <span>Delete All</span>

              <span>
                ({selectedSlots.length})
              </span>
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default AllTimeSlots;