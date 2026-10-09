import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../../../config/api";
import "./addBanner.css";
import { getImage } from "../../../../Components/utils/images";
// Adjust these two paths to wherever ConfirmModal / SuccessModal actually live.
import ConfirmModal from "../../../../Components/common/modal/ConfirmModal";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";

const PAGE_SIZE = 10;
const MAX_IMAGE_MB = 5;

const emptyForm = {
  id: null,
  title: "",
  vendorId: "",
  itemId: "",
};

const BannerAPI = {
  getBanners: ({ search = "", offset = 0 } = {}) =>
    api.get("/restaurant/banners", {
      params: {
        search,
        per_page: offset,
      },
    }),

  getBanner: (id) => api.get(`/restaurant/banners/${id}`),

  getItemsByVendor: (vendorId) =>
    api.get(`/restaurant/banners/items/${vendorId}`),

  createBanner: (formData) => api.post("/restaurant/banners", formData),

  updateBanner: (formData) => api.post("/restaurant/banners/update", formData),

  deleteBanner: (id) => api.delete(`/restaurant/banners/${id}`),

  updateBannerStatus: (bannerId, status) =>
    api.post("/restaurant/banners/status", {
      banner_id: bannerId,
      status,
    }),
};

export default function AddBanner() {
  // ---- form state (shared by the inline "add" card and the edit modal) ----
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const formTopRef = useRef(null);

  // form.id is set only while editing an existing banner, so it doubles
  // as the "is the edit modal open" flag.
  const isEditing = Boolean(form.id);

  // ---- list state ----
  const [banners, setBanners] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingRowId, setUpdatingRowId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ---- status change confirmation ----
  const [statusTarget, setStatusTarget] = useState(null); // the row pending activate/deactivate
  const [statusChanging, setStatusChanging] = useState(false);

  // ---- success popup (add / update / delete / status change) ----
  const [successModal, setSuccessModal] = useState(null); // { title, message }

  // ---- inline banner message (errors only, now that success has its own modal) ----
  const [message, setMessage] = useState(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });

    window.clearTimeout(showMessage._t);

    showMessage._t = window.setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  /* ---------------------------------------------------------------------
   * Load banner list
   * Vendors also come from this API response as fatch_vendor.
   * ------------------------------------------------------------------- */
  const loadBanners = useCallback(
    async ({ search = "", currentPage = 1 } = {}) => {
      setListLoading(true);

      try {
        const offset = (currentPage - 1) * PAGE_SIZE;

        const res = await BannerAPI.getBanners({
          search,
          offset,
        });

        const payload = res?.data || {};

        if (payload.status !== "success") {
          throw new Error(payload.message || "Couldn't load banners.");
        }

        setBanners(payload.banners || []);
        setTotalCount(Number(payload.total || 0));

        // PHP banner list returns restaurant vendors here
        setVendors(payload.fatch_vendor || []);
      } catch (err) {
        showMessage(
          "error",
          err?.response?.data?.message ||
            err?.message ||
            "Couldn't load banners. Please try again.",
        );
      } finally {
        setListLoading(false);
      }
    },
    [],
  );

  /* ---------------------------------------------------------------------
   * Load banners when page/search changes
   * ------------------------------------------------------------------- */
  useEffect(() => {
    const t = window.setTimeout(() => {
      loadBanners({
        search: searchTerm,
        currentPage: page,
      });
    }, 350);

    return () => window.clearTimeout(t);
  }, [searchTerm, page, loadBanners]);

  /* ---------------------------------------------------------------------
   * Reset page when search changes
   * ------------------------------------------------------------------- */
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  /* ---------------------------------------------------------------------
   * Load items whenever vendor changes
   * ------------------------------------------------------------------- */
  useEffect(() => {
    if (!form.vendorId) {
      setItems([]);
      return;
    }

    let cancelled = false;

    setItemsLoading(true);

    (async () => {
      try {
        const res = await BannerAPI.getItemsByVendor(form.vendorId);

        const payload = res?.data || {};

        if (payload.status !== "success") {
          throw new Error(payload.message || "Couldn't load items.");
        }

        if (!cancelled) {
          setItems(payload.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setItems([]);

          showMessage(
            "error",
            err?.response?.data?.message ||
              err?.message ||
              "Couldn't load items for that vendor.",
          );
        }
      } finally {
        if (!cancelled) {
          setItemsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form.vendorId]);

  /* ---------------------------------------------------------------------
   * Edit modal: lock page scroll while open, close on Escape
   * ------------------------------------------------------------------- */
  useEffect(() => {
    if (!isEditing) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) resetForm();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, submitting]);

  /* ---------------------------------------------------------------------
   * Form field helpers
   * ------------------------------------------------------------------- */
  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));
  };

  const handleVendorChange = (e) => {
    setField("vendorId", e.target.value);
    setField("itemId", "");
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFormErrors({});
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    setItems([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ---------------------------------------------------------------------
   * Image selection / validation
   * ------------------------------------------------------------------- */

  const validateAndSetImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({
        ...prev,
        image: "Please choose an image file.",
      }));
      return;
    }

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        image: `Image must be under ${MAX_IMAGE_MB}MB.`,
      }));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      setFormErrors((prev) => ({
        ...prev,
        image: undefined,
      }));

      setImageFile(file);
      setImagePreview(objectUrl);
      setExistingImageUrl(null);
    };

    img.onerror = () => {
      setFormErrors((prev) => ({
        ...prev,
        image: "That image couldn't be read.",
      }));

      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  const handleFileInput = (e) => {
    validateAndSetImage(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);

    validateAndSetImage(e.dataTransfer.files?.[0]);
  };

  const clearImage = (e) => {
    e.stopPropagation();

    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ---------------------------------------------------------------------
   * Validation
   * ------------------------------------------------------------------- */
  const validate = () => {
    const errs = {};

    if (!form.title.trim()) {
      errs.title = "Title is required.";
    }

    if (!form.vendorId) {
      errs.vendorId = "Please select a vendor.";
    }

    if (!form.itemId) {
      errs.itemId = "Please select an item.";
    }

    if (!imageFile && !existingImageUrl) {
      errs.image = "Banner image is required.";
    }

    setFormErrors(errs);

    return Object.keys(errs).length === 0;
  };

  /* ---------------------------------------------------------------------
   * Submit
   * ------------------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = new FormData();

    payload.append("title", form.title.trim());

    // PHP expects vendor_id
    payload.append("vendor_id", form.vendorId);

    // PHP expects item_id
    payload.append("item_id", form.itemId);

    if (form.id) {
      // PHP update requires banner_id
      payload.append("banner_id", form.id);
    }

    if (imageFile) {
      payload.append("image", imageFile);
    }

    setSubmitting(true);

    try {
      if (form.id) {
        const res = await BannerAPI.updateBanner(payload);

        if (res?.data?.status !== "success") {
          throw new Error(res?.data?.message || "Failed to update banner");
        }

        setSuccessModal({
          title: "Banner Updated",
          message: res.data.message || "Banner updated successfully.",
        });
      } else {
        const res = await BannerAPI.createBanner(payload);

        if (res?.data?.status !== "success") {
          throw new Error(res?.data?.message || "Failed to add banner");
        }

        setSuccessModal({
          title: "Banner Added",
          message: res.data.message || "Banner added successfully.",
        });
      }

      resetForm();

      await loadBanners({
        search: searchTerm,
        currentPage: page,
      });
    } catch (err) {
      showMessage(
        "error",
        err?.response?.data?.message ||
          err?.message ||
          "Couldn't save the banner.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------
   * Edit — opens the edit modal (form.id becomes truthy)
   * ------------------------------------------------------------------- */
  const handleEdit = async (row) => {
    try {
      const res = await BannerAPI.getBanner(row.id);

      const payload = res?.data || {};

      if (payload.status !== "success") {
        throw new Error(payload.message || "Banner not found");
      }

      const banner = payload.data;

      const vendorId = banner.vendor_id ?? "";
      const itemId = banner.item_id ?? "";

      setForm({
        id: banner.id,
        title: banner.title || "",
        vendorId,
        itemId: "",
      });

      setImageFile(null);
      setImagePreview(null);

      setExistingImageUrl(banner.image ? getImage(banner.image) : null);

      setFormErrors({});

      if (vendorId) {
        setItemsLoading(true);

        try {
          const itemsRes = await BannerAPI.getItemsByVendor(vendorId);

          const itemsPayload = itemsRes?.data || {};

          if (itemsPayload.status !== "success") {
            throw new Error(itemsPayload.message || "Couldn't load items.");
          }

          setItems(itemsPayload.data || []);
        } finally {
          setItemsLoading(false);
        }
      } else {
        setItems([]);
      }

      setForm((prev) => ({
        ...prev,
        itemId,
      }));
    } catch (err) {
      showMessage(
        "error",
        err?.response?.data?.message ||
          err?.message ||
          "Couldn't load banner details.",
      );
    }
  };

  /* ---------------------------------------------------------------------
   * Delete
   * ------------------------------------------------------------------- */
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const res = await BannerAPI.deleteBanner(deleteTarget.id);

      if (res?.data?.status !== "success") {
        throw new Error(res?.data?.message || "Failed to delete banner");
      }

      setSuccessModal({
        title: "Banner Deleted",
        message: res.data.message || "Banner deleted successfully.",
      });

      setDeleteTarget(null);

      const isLastRowOnPage = banners.length === 1 && page > 1;

      const nextPage = isLastRowOnPage ? page - 1 : page;

      if (isLastRowOnPage) {
        setPage(nextPage);
      }

      await loadBanners({
        search: searchTerm,
        currentPage: nextPage,
      });
    } catch (err) {
      showMessage(
        "error",
        err?.response?.data?.message ||
          err?.message ||
          "Couldn't delete that banner.",
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------------------------------------------------------------
   * Status — clicking the switch just asks for confirmation;
   * confirmStatusChange is what actually calls the API.
   * ------------------------------------------------------------------- */
  const handleToggleStatus = (row) => {
    setStatusTarget(row);
  };

  const confirmStatusChange = async () => {
    if (!statusTarget) return;

    const row = statusTarget;
    const currentStatus = Number(row.status);
    const nextStatus = currentStatus === 1 ? 0 : 1;

    setStatusChanging(true);
    setUpdatingRowId(row.id);

    setBanners((prev) =>
      prev.map((b) =>
        b.id === row.id
          ? {
              ...b,
              status: nextStatus,
            }
          : b,
      ),
    );

    try {
      const res = await BannerAPI.updateBannerStatus(row.id, nextStatus);

      if (res?.data?.status !== "success") {
        throw new Error(res?.data?.message || "Failed to update status");
      }

      setStatusTarget(null);

      setSuccessModal({
        title: nextStatus === 1 ? "Banner Activated" : "Banner Deactivated",
        message: res.data.message || "Banner status updated successfully.",
      });
    } catch (err) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === row.id
            ? {
                ...b,
                status: currentStatus,
              }
            : b,
        ),
      );

      setStatusTarget(null);

      showMessage(
        "error",
        err?.response?.data?.message ||
          err?.message ||
          "Couldn't update the status.",
      );
    } finally {
      setStatusChanging(false);
      setUpdatingRowId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const rangeEnd = Math.min(page * PAGE_SIZE, totalCount);

  // Shared field markup — used by the inline "add" card AND the edit modal,
  // so both stay driven by the exact same state and handlers above.
  const formFields = (
    <>
      <div className="ab-form-grid">
        <div>
          <div className="ab-field">
            <label htmlFor="ab-title">
              Title
              <span className="ab-required">*</span>
            </label>

            <input
              id="ab-title"
              className={`ab-input ${formErrors.title ? "ab-input-error" : ""}`}
              placeholder="New banner"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              maxLength={80}
            />

            {formErrors.title && (
              <div className="ab-error-text">{formErrors.title}</div>
            )}
          </div>

          <div className="ab-field">
            <label htmlFor="ab-vendor">
              Select Vendor
              <span className="ab-required">*</span>
            </label>

            <select
              id="ab-vendor"
              className={`ab-select ${
                formErrors.vendorId ? "ab-input-error" : ""
              }`}
              value={form.vendorId}
              onChange={handleVendorChange}
            >
              <option value="">-- Select Vendor --</option>

              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            {formErrors.vendorId && (
              <div className="ab-error-text">{formErrors.vendorId}</div>
            )}
          </div>

          <div className="ab-field">
            <label htmlFor="ab-item">
              Select Item
              <span className="ab-required">*</span>
            </label>

            <select
              id="ab-item"
              className={`ab-select ${
                formErrors.itemId ? "ab-input-error" : ""
              }`}
              value={form.itemId}
              onChange={(e) => setField("itemId", e.target.value)}
              disabled={!form.vendorId || itemsLoading}
            >
              <option value="">
                {!form.vendorId
                  ? "-- Select Vendor First --"
                  : itemsLoading
                    ? "Loading items…"
                    : "-- Select Item --"}
              </option>

              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name}
                </option>
              ))}
            </select>

            {formErrors.itemId && (
              <div className="ab-error-text">{formErrors.itemId}</div>
            )}
          </div>
        </div>

        <div>
          <div className="ab-field">
            <label>
              Banner image
              <span className="ab-required">*</span>{" "}
              <span className="ab-optional-tag">(Recommended ratio 3:1)</span>
            </label>

            <div
              className={`ab-dropzone ${
                isDragActive ? "ab-dropzone-active" : ""
              } ${formErrors.image ? "ab-dropzone-error" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
            >
              {imagePreview || existingImageUrl ? (
                <>
                  <img
                    className="ab-dropzone-preview"
                    src={imagePreview || existingImageUrl}
                    alt="Banner preview"
                  />

                  <button
                    type="button"
                    className="ab-dropzone-remove"
                    onClick={clearImage}
                    aria-label="Remove image"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="ab-dropzone-placeholder">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="16"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <circle cx="9" cy="10" r="1.6" fill="currentColor" />
                    <path
                      d="M4.5 17.5l5-5 3.5 3.5 3-3 3.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span>Drag &amp; drop an image, or click to browse</span>
                </div>
              )}
            </div>

            <div className="ab-file-row">
              <button
                type="button"
                className="ab-file-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </button>

              <span className="ab-file-name">
                {imageFile ? imageFile.name : "No file chosen"}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="ab-visually-hidden"
              onChange={handleFileInput}
            />

            {formErrors.image ? (
              <div className="ab-error-text">{formErrors.image}</div>
            ) : (
              <div className="ab-hint">
                PNG or JPG, up to {MAX_IMAGE_MB}MB. Recommended ratio: 3:1 (e.g.
                1200×400).
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ab-form-actions">
        <button
          type="button"
          className="ab-btn ab-btn-secondary"
          onClick={resetForm}
          disabled={submitting}
        >
          {isEditing ? "Cancel" : "Reset"}
        </button>

        <button
          type="submit"
          className="ab-btn ab-btn-primary"
          disabled={submitting}
        >
          {submitting && <span className="ab-spinner" />}

          {isEditing ? "Update" : "Submit"}
        </button>
      </div>
    </>
  );

  return (
    <div className="ab-page">
      <div className="ab-header" ref={formTopRef}>
        <span className="ab-header-icon">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="4"
              width="18"
              height="12"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M3 18h18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <h1>Add New Banner</h1>
      </div>

      {message && (
        <div
          className={`ab-alert ${
            message.type === "success" ? "ab-alert-success" : "ab-alert-error"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ---------------- Add form card (create only) ---------------- */}
      {!isEditing && (
        <form className="ab-card" onSubmit={handleSubmit} noValidate>
          {formFields}
        </form>
      )}

      {/* ---------------- List card ---------------- */}
      <div className="ab-card">
        <div className="ab-list-header">
          <div className="ab-list-title">
            Banner List
            <span className="ab-count-badge">{totalCount}</span>
          </div>

          <div className="ab-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M21 21l-4-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <input
              type="text"
              placeholder="Search by title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="ab-table-wrap">
          <table className="ab-table">
            <thead>
              <tr>
                <th>SR.No</th>
                <th>Title</th>
                <th>Vendor</th>
                <th>Item</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {listLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="ab-loading-row">
                    <td colSpan={6}>
                      <div
                        className="ab-skeleton"
                        style={{
                          width: `${70 - i * 10}%`,
                          margin: "0 auto",
                        }}
                      />
                    </td>
                  </tr>
                ))}

              {!listLoading && banners.length === 0 && (
                <tr className="ab-empty-row">
                  <td colSpan={6}>
                    <div className="ab-empty-state">
                      <strong>No banners found</strong>

                      <span>
                        {searchTerm
                          ? "Try a different search term."
                          : "Add your first banner above."}
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!listLoading &&
                banners.map((row, idx) => {
                  const isActive = Number(row.status) === 1;

                  return (
                    <tr
                      key={row.id}
                      className={
                        updatingRowId === row.id ? "ab-row-updating" : ""
                      }
                    >
                      <td>{rangeStart + idx}</td>

                      <td>
                        <div className="ab-title-cell">
                          <img
                            className="ab-thumb"
                            src={row.image ? getImage(row.image) : ""}
                            alt=""
                          />

                          <span className="ab-title-text">{row.title}</span>
                        </div>
                      </td>

                      <td>{row.vendor_name}</td>

                      <td>{row.item_name}</td>

                      <td>
                        <button
                          type="button"
                          className={`ab-switch ${
                            isActive ? "ab-switch-on" : ""
                          }`}
                          onClick={() => handleToggleStatus(row)}
                          disabled={updatingRowId === row.id}
                          aria-label={
                            isActive ? "Deactivate banner" : "Activate banner"
                          }
                        >
                          <span className="ab-switch-knob" />
                        </button>
                      </td>

                      <td>
                        <div className="ab-row-actions">
                          <button
                            type="button"
                            className="ab-icon-btn ab-icon-btn-edit"
                            onClick={() => handleEdit(row)}
                            aria-label="Edit banner"
                          >
                            <svg
                              width="80"
                              height="40"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M4 20l4.2-.9L19 8.3a1.5 1.5 0 000-2.1L17.8 5a1.5 1.5 0 00-2.1 0L5 15.8 4 20z"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          <button
                            type="button"
                            className="ab-icon-btn ab-icon-btn-delete"
                            onClick={() => setDeleteTarget(row)}
                            aria-label="Delete banner"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="ab-pagination">
          <span className="ab-pagination-info">
            {totalCount === 0
              ? "No entries"
              : `Showing ${rangeStart} to ${rangeEnd} of ${totalCount} entries`}
          </span>

          <div className="ab-pagination-controls">
            <button
              type="button"
              className="ab-page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>

            {Array.from({
              length: totalPages,
            }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`ab-page-btn ${
                  page === i + 1 ? "ab-page-btn-active" : ""
                }`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              type="button"
              className="ab-page-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Edit modal ---------------- */}
      {isEditing && (
        <div
          className="ab-modal-overlay"
          onClick={() => !submitting && resetForm()}
        >
          <div
            className="ab-modal ab-edit-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ab-edit-modal-title"
          >
            <div className="ab-modal-header">
              <h3 id="ab-edit-modal-title">Edit Banner</h3>

              <button
                type="button"
                className="ab-modal-close"
                onClick={resetForm}
                disabled={submitting}
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="ab-modal-body">
              {formFields}
            </form>
          </div>
        </div>
      )}

      {/* ---------------- Delete confirmation ---------------- */}
      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete banner?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed. This can't be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* ---------------- Status change confirmation ---------------- */}
      <ConfirmModal
        show={Boolean(statusTarget)}
        title={
          statusTarget && Number(statusTarget.status) === 1
            ? "Deactivate banner?"
            : "Activate banner?"
        }
        message={
          statusTarget
            ? Number(statusTarget.status) === 1
              ? `"${statusTarget.title}" will be hidden from the app.`
              : `"${statusTarget.title}" will be shown on the app.`
            : ""
        }
        confirmText={
          statusTarget && Number(statusTarget.status) === 1
            ? "Deactivate"
            : "Activate"
        }
        cancelText="Cancel"
        onConfirm={confirmStatusChange}
        onCancel={() => setStatusTarget(null)}
        loading={statusChanging}
      />

      {/* ---------------- Success popup (add / update / delete / status) ---------------- */}
      <SuccessModal
        show={Boolean(successModal)}
        title={successModal?.title}
        message={successModal?.message}
        onClose={() => setSuccessModal(null)}
      />
    </div>
  );
}
