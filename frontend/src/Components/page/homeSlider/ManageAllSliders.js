import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaTrash } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./manageAllSliders.css";

const ManageAllSliders = () => {
  // =========================================================
  // TEMPORARY SLIDER DATA
  // API DATA WILL COME HERE LATER
  // =========================================================

  const [sliderData, setSliderData] = useState([
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800",
    },
    {
      id: 7,
      image:
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
    },
  ]);

  // =========================================================
  // SELECTED SLIDERS
  // =========================================================

  const [selectedSliders, setSelectedSliders] = useState([]);

  // =========================================================
  // SELECT / UNSELECT SINGLE SLIDER
  // =========================================================

  const handleSelectSlider = (id) => {
    setSelectedSliders((previous) => {
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
    if (
      sliderData.length > 0 &&
      selectedSliders.length === sliderData.length
    ) {
      setSelectedSliders([]);
      return;
    }

    setSelectedSliders(sliderData.map((slider) => slider.id));
  };

  // =========================================================
  // DELETE SINGLE SLIDER
  // =========================================================

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this slider?",
    );

    if (!confirmed) {
      return;
    }

    setSliderData((previous) =>
      previous.filter((slider) => slider.id !== id),
    );

    setSelectedSliders((previous) =>
      previous.filter((sliderId) => sliderId !== id),
    );

    console.log("Delete Slider:", id);

    // =======================================================
    // API DELETE CALL WILL COME HERE LATER
    // =======================================================
  };

  // =========================================================
  // DELETE SELECTED SLIDERS
  // =========================================================

  const handleDeleteSelected = () => {
    if (selectedSliders.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedSliders.length} selected slider(s)?`,
    );

    if (!confirmed) {
      return;
    }

    setSliderData((previous) =>
      previous.filter(
        (slider) => !selectedSliders.includes(slider.id),
      ),
    );

    console.log("Delete Selected Sliders:", selectedSliders);

    setSelectedSliders([]);

    // =======================================================
    // API DELETE CALL WILL COME HERE LATER
    // =======================================================
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      // =====================================================
      // SELECT
      // =====================================================

      {
        key: "select",

        label: (
          <div className="manage-all-sliders-select-header">
            <input
              type="checkbox"
              className="manage-all-sliders-checkbox"
              checked={
                sliderData.length > 0 &&
                selectedSliders.length === sliderData.length
              }
              onChange={handleSelectAll}
            />

            <span>All Select</span>
          </div>
        ),

        width: "80px",

        sortable: false,

        render: (_, row) => (
          <input
            type="checkbox"
            className="manage-all-sliders-checkbox"
            checked={selectedSliders.includes(row.id)}
            onChange={() => handleSelectSlider(row.id)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },

      // =====================================================
      // SERIAL NUMBER
      // =====================================================

      {
        key: "id",

        label: "Sr.No",

        width: "60px",

        sortable: true,
      },

      // =====================================================
      // SLIDER IMAGE
      // =====================================================

      {
        key: "image",

        label: "Slider",

        width: "100px",

        sortable: false,

        render: (value) => (
          <div className="manage-all-sliders-image-wrapper">
            <img
              src={value}
              alt="Slider"
              className="manage-all-sliders-image"
              onError={(event) => {
                event.currentTarget.style.display = "none";

                event.currentTarget.parentElement.classList.add(
                  "manage-all-sliders-image-error",
                );
              }}
            />
          </div>
        ),
      },

      // =====================================================
      // ACTION
      // =====================================================

      {
        key: "actions",

        label: "Action",

        width: "80px",

        sortable: false,

        render: (_, row) => (
          <button
            type="button"
            className="manage-all-sliders-delete-btn"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
        ),
      },
    ],
    [sliderData, selectedSliders],
  );

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="manage-all-sliders-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="manage-all-sliders-page-header">

        <h2 className="manage-all-sliders-page-title">
          Manage All Sliders
        </h2>

        <div className="manage-all-sliders-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="manage-all-sliders-breadcrumb-active">
            Manage All Sliders
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="manage-all-sliders-card">

        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="manage-all-sliders-card-header">

          <h3>
            All Slider Data
          </h3>

        </div>

        {/* ===================================================
            DATA TABLE
        =================================================== */}

        <div className="manage-all-sliders-table-wrapper">

          <DataTable
            columns={columns}
            data={sliderData}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />

        </div>

        {/* ===================================================
            DELETE SELECTED
            ONLY SHOW WHEN SOMETHING IS SELECTED
        =================================================== */}

        {selectedSliders.length > 0 && (
          <div className="manage-all-sliders-selected-footer">

            <button
              type="button"
              className="manage-all-sliders-delete-selected-btn"
              onClick={handleDeleteSelected}
            >
              <FaTrash />

              <span>
                Delete All
              </span>

              <span>
                ({selectedSliders.length})
              </span>
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default ManageAllSliders;