import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaPlus } from "react-icons/fa";

import "./addTimeSlots.css";

const AddTimeSlots = () => {
  const navigate = useNavigate();

  const [timeSlot, setTimeSlot] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!timeSlot.trim()) {
      alert("Please enter time slot.");
      return;
    }

    // =====================================================
    // API CALL WILL COME HERE LATER
    // Example:
    //
    // await addTimeSlot({
    //   timeSlot: timeSlot.trim(),
    // });
    // =====================================================

    console.log("Add Time Slot:", {
      timeSlot: timeSlot.trim(),
    });

    // After successful API response
    navigate("/time_slots");
  };

  const handleCancel = () => {
    navigate("/time_slots");
  };

  return (
    <div className="add-time-slot-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="add-time-slot-page-header">

        <h2 className="add-time-slot-page-title">
          Add Time Slot
        </h2>

        <div className="add-time-slot-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span>
            Manage Time Slots
          </span>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="add-time-slot-breadcrumb-active">
            Add Time Slot
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="add-time-slot-card">

        <div className="add-time-slot-card-header">
          <h3>
            Add Time Slot
          </h3>
        </div>

        {/* ===================================================
            FORM
        =================================================== */}

        <form
          className="add-time-slot-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              TIME SLOT INPUT
          ================================================= */}

          <div className="add-time-slot-form-group">

            <label htmlFor="timeSlot">
              Time Slot
              <span className="add-time-slot-required">
                *
              </span>
            </label>

            <input
              id="timeSlot"
              type="text"
              value={timeSlot}
              onChange={(event) =>
                setTimeSlot(event.target.value)
              }
              placeholder="Enter time slot"
              autoComplete="off"
            />

          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="add-time-slot-form-actions">

            <button
              type="button"
              className="add-time-slot-cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-time-slot-submit-btn"
            >
              <FaPlus />

              <span>
                Add Time Slot
              </span>
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default AddTimeSlots;