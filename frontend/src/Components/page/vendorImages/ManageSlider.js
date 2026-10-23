import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaPlus, FaEdit, FaPlay, FaTimes } from "react-icons/fa";
import api from "../../../config/api";
import DataTable from "../../common/DataTable";
import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceConfirmModal from "../../common/modal/serviceModal/ServiceConfirmModal";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";
import { getImage } from "../../utils/images";

import "./manageSlider.css";

// =========================================================
// ROUTES (update to match your router)
// =========================================================

const ROUTES = {
  home: "/home",
  add: "/add_vendor_image",
  edit: (id) => `/edit_ven_images/${id}`,
};

// =========================================================
// SERVICE LAYER (API calls - easy to move to a service file later)
// =========================================================

const sliderService = {
  getAll: async () => {
    const response = await api.get("/admin/vendor-images");
    const result = response.data;

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch vendor images");
    }

    return result;
  },

  remove: async (id) => {
    const response = await api.delete(`/admin/vendor-images/${id}`);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.message || "Failed to delete vendor image");
    }

    return result;
  },

  removeSelected: async (ids) => {
    const response = await api.delete("/admin/vendor-images/selected", {
      data: { home_id: ids },
    });
    const result = response.data;

    if (!result.success) {
      throw new Error(result.message || "Failed to delete selected sliders");
    }

    return result;
  },
};

// =========================================================
// HELPERS
// =========================================================

const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "ogv", "mov", "m4v", "mkv"];

const isVideoFile = (fileName = "") => {
  const cleanName = String(fileName).split("?")[0];
  const extension = cleanName.split(".").pop().toLowerCase();
  return VIDEO_EXTENSIONS.includes(extension);
};

const getErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.message || fallback;

const CONFIRM_CLOSED = { open: false, type: "single", id: null };
const SUCCESS_CLOSED = { open: false, message: "" };

// =========================================================
// COMPONENT
// =========================================================

const ManageSlider = () => {
  const [sliderData, setSliderData] = useState([]);
  const [selectedSliders, setSelectedSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirm, setConfirm] = useState(CONFIRM_CLOSED);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(SUCCESS_CLOSED);
  const [preview, setPreview] = useState(null);

  // =========================================================
  // FETCH
  // =========================================================

  const fetchVendorImages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await sliderService.getAll();

      const formattedData = (result.data || []).map((item) => ({
        id: item.id,
        vendorName: item.vendor_name || "",
        title: item.title || "",
        description: item.description || "",
        media: item.image ? getImage(item.image) : "",
        isVideo: isVideoFile(item.image),
      }));

      setSliderData(formattedData);
    } catch (err) {
      console.error("Fetch vendor images error:", err);
      setError(getErrorMessage(err, "Failed to fetch vendor images"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendorImages();
  }, [fetchVendorImages]);

  // Close media preview with Escape (confirm/success modals handle their own)
  useEffect(() => {
    if (!preview) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setPreview(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preview]);

  // =========================================================
  // SELECTION
  // =========================================================

  const handleSelectSlider = (id) => {
    setSelectedSliders((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedSliders.length === sliderData.length) {
      setSelectedSliders([]);
      return;
    }

    setSelectedSliders(sliderData.map((item) => item.id));
  };

  // =========================================================
  // DELETE (confirm modal -> success modal)
  // =========================================================

  const openConfirm = (type, id = null) => {
    setConfirm({ open: true, type, id });
  };

  const closeConfirm = useCallback(() => setConfirm(CONFIRM_CLOSED), []);

  const closeSuccess = useCallback(() => setSuccess(SUCCESS_CLOSED), []);

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setError("");

      let message;

      if (confirm.type === "bulk") {
        const result = await sliderService.removeSelected(selectedSliders);

        setSliderData((previous) =>
          previous.filter((slider) => !selectedSliders.includes(slider.id)),
        );
        setSelectedSliders([]);
        message = result.message || "Selected sliders deleted successfully.";
      } else {
        const result = await sliderService.remove(confirm.id);

        setSliderData((previous) =>
          previous.filter((slider) => slider.id !== confirm.id),
        );
        setSelectedSliders((previous) =>
          previous.filter((sliderId) => sliderId !== confirm.id),
        );
        message = result.message || "Slider deleted successfully.";
      }

      closeConfirm();
      setSuccess({ open: true, message });
    } catch (err) {
      console.error("Delete vendor image error:", err);
      closeConfirm();
      setError(getErrorMessage(err, "Failed to delete. Try again."));
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // TABLE COLUMNS (same as the PHP view)
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
        width: "95px",
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
      { key: "serial", label: "Id", width: "45px", sortable: false },
      { key: "vendorName", label: "Vendor Name", width: "130px", sortable: true },
      { key: "title", label: "Title", width: "130px", sortable: true },
      {
        key: "description",
        label: "Description",
        width: "200px",
        sortable: true,
        render: (value) => (
          <span className="slider-description" title={value}>
            {value || "-"}
          </span>
        ),
      },
      {
        key: "media",
        label: "Media",
        width: "120px",
        sortable: false,
        render: (value, row) => {
          if (!value) {
            return <span className="slider-no-media">No media</span>;
          }

          return (
            <button
              type="button"
              className={`slider-media ${row.isVideo ? "slider-media-video" : ""}`}
              onClick={(event) => {
                event.stopPropagation();
                setPreview({ src: value, isVideo: row.isVideo, title: row.title });
              }}
              title={row.isVideo ? "Play video" : "View image"}
            >
              {row.isVideo ? (
                <>
                  <video
                    className="slider-media-item"
                    src={value}
                    muted
                    preload="metadata"
                    playsInline
                  />
                  <span className="slider-media-play">
                    <FaPlay />
                  </span>
                </>
              ) : (
                <img
                  src={value}
                  alt={row.title || "Slider"}
                  className="slider-media-item"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.parentElement.classList.add(
                      "slider-media-error",
                    );
                  }}
                />
              )}
            </button>
          );
        },
      },
      {
        key: "actions",
        label: "Action",
        width: "170px",
        sortable: false,
        render: (_, row) => (
          <div className="slider-actions">
            <Link to={ROUTES.edit(row.id)} className="slider-edit-btn">
              <FaEdit />
              <span>Edit</span>
            </Link>

            <button
              type="button"
              className="slider-delete-btn"
              onClick={() => openConfirm("single", row.id)}
            >
              <FaTrash />
              <span>Delete</span>
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSliders, sliderData],
  );

  const confirmCount = confirm.type === "bulk" ? selectedSliders.length : 1;

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="slider-page">
      {/* PAGE HEADER */}
      <div className="slider-page-header">
        <h2 className="slider-page-title">Home Slider</h2>

        <ServiceBreadcrumbs items={[{ label: "All Home Slider" }]} />
      </div>

      {/* MAIN CARD */}
      <div className="slider-card">
        <div className="slider-card-header">
          <div className="slider-card-title">
            <h3>All Home Slider Data</h3>

            {!loading && (
              <span
                className="slider-count-pill"
                title={`${sliderData.length} total sliders`}
              >
                {sliderData.length} {sliderData.length === 1 ? "Slider" : "Sliders"}
              </span>
            )}
          </div>

          <Link to={ROUTES.add} className="slider-add-btn">
            <FaPlus />
            <span>Add New</span>
          </Link>
        </div>

        {error && (
          <div className="slider-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={fetchVendorImages}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="slider-loading">
            <span className="slider-spinner" />
            Loading vendor images...
          </div>
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

        {/* FLOATING SELECTED ACTION BAR */}
        {selectedSliders.length > 0 && (
          <div className="slider-selected-actions">
            <span className="slider-selected-count">
              {selectedSliders.length} selected
            </span>

            <div className="slider-selected-buttons">
              <button
                type="button"
                className="slider-selected-cancel-btn"
                onClick={() => setSelectedSliders([])}
              >
                Cancel
              </button>

              <button
                type="button"
                className="slider-selected-delete-btn"
                onClick={() => openConfirm("bulk")}
              >
                <FaTrash />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRM MODAL */}
      <ServiceConfirmModal
        isOpen={confirm.open}
        variant="danger"
        title={
          confirm.type === "bulk"
            ? `Delete ${confirmCount} sliders?`
            : "Delete this slider?"
        }
        message={
          confirm.type === "bulk"
            ? "The selected sliders will be removed permanently. This can't be undone."
            : "This slider will be removed permanently. This can't be undone."
        }
        confirmText="Yes, delete"
        cancelText="Cancel"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirm}
      />

      {/* SUCCESS MODAL */}
      <ServiceSuccessModal
        isOpen={success.open}
        title="Deleted"
        message={success.message}
        buttonText="Done"
        autoCloseMs={2000}
        onClose={closeSuccess}
      />

      {/* MEDIA PREVIEW MODAL */}
      {preview && (
        <div
          className="slider-modal-overlay slider-preview-overlay"
          onClick={() => setPreview(null)}
        >
          <div
            className="slider-preview"
            role="dialog"
            aria-modal="true"
            aria-label="Media preview"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="slider-preview-close"
              onClick={() => setPreview(null)}
              aria-label="Close preview"
            >
              <FaTimes />
            </button>

            {preview.isVideo ? (
              <video src={preview.src} controls autoPlay playsInline />
            ) : (
              <img src={preview.src} alt={preview.title || "Slider"} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSlider;