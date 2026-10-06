import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import "./updateTimeSlots.css";

const UpdateTimeSlots = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Existing time slot data coming from AllTimeSlots
  const existingTimeSlot = location.state?.timeSlot || "";

  const [timeSlot, setTimeSlot] = useState(existingTimeSlot);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    setTimeSlot(event.target.value);
  };

  // =========================================================
  // UPDATE TIME SLOT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!timeSlot.trim()) {
      return;
    }

    setLoading(true);

    try {
      // =====================================================
      // BACKEND API WILL COME HERE
      // =====================================================

      /*
      Example later:

      const response = await fetch(
        `/api/time-slots/${location.state?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timeSlot: timeSlot.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update time slot");
      }
      */

      console.log("Update Time Slot:", {
        id: location.state?.id,
        timeSlot: timeSlot.trim(),
      });

      // Temporary navigation
      navigate("/time_slots");
    } catch (error) {
      console.error("Update Time Slot Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-time-slot-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="update-time-slot-page-header">
        <h2 className="update-time-slot-page-title">
          Update Time Slot
        </h2>

        {/* ===================================================
            BREADCRUMB
        =================================================== */}

        <div className="update-time-slot-breadcrumb">
          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <Link to="/time_slots">
            Manage Time Slots
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="update-time-slot-breadcrumb-active">
            Update Time Slot
          </span>
        </div>
      </div>

      {/* =====================================================
          CARD
      ===================================================== */}

      <div className="update-time-slot-card">

        <div className="update-time-slot-card-header">
          <h3>Update Time Slot</h3>
        </div>

        {/* ===================================================
            FORM
        =================================================== */}

        <form
          className="update-time-slot-form"
          onSubmit={handleSubmit}
        >

          {/* INPUT */}

          <div className="update-time-slot-form-group">

            <label htmlFor="timeSlot">
              Time Slot
            </label>

            <input
              id="timeSlot"
              type="text"
              value={timeSlot}
              onChange={handleChange}
              placeholder="Enter time slot"
              autoComplete="off"
            />

          </div>

          {/* BUTTON */}

          <div className="update-time-slot-form-actions">

            <button
              type="button"
              className="update-time-slot-cancel-btn"
              onClick={() => navigate("/time_slots")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="update-time-slot-btn"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Time Slot"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default UpdateTimeSlots;