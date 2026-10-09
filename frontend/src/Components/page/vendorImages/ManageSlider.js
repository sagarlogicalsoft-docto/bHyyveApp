import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaTrash } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./manageSlider.css";
import { getImage } from "../../utils/images";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const ManageSlider = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [sliderData, setSliderData] = useState([]);
  const [selectedSliders, setSelectedSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // GET ALL VENDOR IMAGES
  // =========================================================

  const fetchVendorImages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${BASE_URL}/admin/vendor-images`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      console.log("VENDOR IMAGES API RESPONSE:", result);

      if (!response.ok || !result.success) {
        throw new Error(result?.message || "Failed to fetch vendor images");
      }

      // Convert backend response to frontend table format
      const formattedData = (result.data || []).map((item) => {
        console.log("IMAGE FROM API:", item.image);
        console.log("IMAGE FROM getImage:", getImage(item.image));

        return {
          id: item.id,
          vendorName: item.vendor_name,
          title: item.title || "",
          description: item.description || "",
          image: getImage(item.image),
        };
      });

      setSliderData(formattedData);
    } catch (err) {
      console.error("Fetch vendor images error:", err);
      setError(err.message || "Failed to fetch vendor images");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    fetchVendorImages();
  }, []);

  // =========================================================
  // SELECT / UNSELECT
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
    if (selectedSliders.length === sliderData.length) {
      setSelectedSliders([]);
      return;
    }

    setSelectedSliders(sliderData.map((item) => item.id));
  };

  // =========================================================
  // DELETE SINGLE
  // =========================================================

const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this slider?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${BASE_URL}/admin/vendor-images/${id}`,
      {
        method: "DELETE",
      }
    );

    const result = await response.json();

    console.log("DELETE VENDOR IMAGE API RESPONSE:", result);

    if (!response.ok || !result.success) {
      throw new Error(
        result?.message || "Failed to delete vendor image"
      );
    }

    // Remove deleted slider from UI
    setSliderData((previous) =>
      previous.filter((slider) => slider.id !== id)
    );

    // Remove it from selected sliders also
    setSelectedSliders((previous) =>
      previous.filter((sliderId) => sliderId !== id)
    );

    alert(result.message || "Deleted Successfully");
  } catch (error) {
    console.error("Delete vendor image error:", error);

    alert(error.message || "Failed to delete vendor image.");
  }
};

  // =========================================================
  // DELETE SELECTED
  // =========================================================

const handleSelectedDelete = async () => {
  if (selectedSliders.length === 0) {
    alert("Please select at least one slider.");
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete ${selectedSliders.length} selected slider(s)?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${BASE_URL}/admin/vendor-images-selected`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          home_id: selectedSliders,
        }),
      }
    );

    const result = await response.json();

    console.log(
      "DELETE SELECTED VENDOR IMAGES API RESPONSE:",
      result
    );

    if (!response.ok || !result.success) {
      throw new Error(
        result?.message || "Failed to delete selected sliders"
      );
    }

    setSliderData((previous) =>
      previous.filter(
        (slider) => !selectedSliders.includes(slider.id)
      )
    );

    setSelectedSliders([]);

    alert(result.message || "Selected sliders deleted successfully.");
  } catch (error) {
    console.error(
      "Delete selected vendor images error:",
      error
    );

    alert(
      error.message || "Failed to delete selected sliders."
    );
  }
};

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: (
          <div className="slider-select-header">
            <input
              type="checkbox"
              className="slider-checkbox"
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
            className="slider-checkbox"
            checked={selectedSliders.includes(row.id)}
            onChange={() => handleSelectSlider(row.id)}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },

      {
        key: "serial",
        label: "S.No",
        width: "50px",
        sortable: false,
      },

      {
        key: "vendorName",
        label: "Vendor Name",
        width: "150px",
        sortable: true,
      },

      {
        key: "title",
        label: "Title",
        width: "150px",
        sortable: true,
      },

      {
        key: "description",
        label: "Description",
        width: "150px",
        sortable: true,
      },

      {
        key: "image",
        label: "Image",
        width: "150px",
        sortable: false,

        render: (value) => (
          <div className="slider-image-wrapper">
            {value ? (
              <img
                src={value}
                alt="Slider"
                className="slider-image"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  event.currentTarget.parentElement.classList.add(
                    "slider-image-error",
                  );
                }}
              />
            ) : (
              <span>No Image</span>
            )}
          </div>
        ),
      },

      {
        key: "actions",
        label: "Action",
        width: "100px",
        sortable: false,

        render: (_, row) => (
          <button
            type="button"
            className="slider-delete-btn"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
        ),
      },
    ],
    [selectedSliders, sliderData],
  );

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="slider-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="slider-page-header">
        <div>
          <h2 className="slider-page-title">Manage Slider</h2>

          <div className="slider-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="slider-breadcrumb-active">Manage Slider</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="slider-card">
        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="slider-card-header">
          <h3>All Home Slider Data</h3>
        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && <div className="slider-error">{error}</div>}

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading ? (
          <div className="slider-loading">Loading vendor images...</div>
        ) : (
          <div className="slider-table-wrapper">
            <DataTable
              columns={columns}
              data={sliderData}
              entriesPerPageOptions={[10, 25, 50, 100]}
              defaultEntriesPerPage={10}
              searchable={true}
              sortable={true}
            />
          </div>
        )}

        {/* ===================================================
            DELETE SELECTED
        =================================================== */}

        {selectedSliders.length > 0 && (
          <div className="slider-selected-footer">
            <button
              type="button"
              className="slider-delete-selected-btn"
              onClick={handleSelectedDelete}
            >
              <FaTrash />

              <span>Delete All</span>

              <span>({selectedSliders.length})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSlider;
