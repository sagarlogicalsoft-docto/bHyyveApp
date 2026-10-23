import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaCheck,
  FaChevronDown,
  FaCloudUploadAlt,
  FaImage,
  FaTimes,
  FaUndo,
} from "react-icons/fa";

import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../../Components/common/modal/serviceModal/ServiceSuccessModal";
import api from "../../../config/api";
import { getImage } from "../../utils/images";

import "./editSubCategory.css";

const SUB_CATEGORY_LIST_PATH = "/sub_category_list";

async function request(config) {
  try {
    const response = await api.request(config);
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        err?.message ||
        `Request failed (${err?.response?.status || "network error"})`,
    );
  }
}

async function fetchCategories() {
  const result = await request({ method: "GET", url: "/admin/categories" });

  if (result?.success === false) {
    throw new Error(result.message || "Failed to fetch categories.");
  }

  return result?.data || [];
}

async function fetchSubCategoryById(id) {
  const result = await request({
    method: "GET",
    url: `/admin/sub-categories/${id}`,
  });

  if (!result?.success) {
    throw new Error(result?.message || "Failed to fetch sub category.");
  }

  return result.data;
}

async function updateSubCategory(id, payload) {
  const formData = new FormData();

  // PHP update_sub_category() expects these exact fields
  formData.append("cat_id", payload.cat_id);
  formData.append("name", payload.name);
  formData.append("description", payload.description || "");

  // Image is optional on update
  if (payload.file) {
    formData.append("file", payload.file);
  }

  const result = await request({
    method: "PUT",
    url: `/admin/sub-categories/${id}`,
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });

  // backend alag-alag success format bhej sakta hai
  const isSuccess =
    result?.success === true ||
    result?.success === 1 ||
    result?.success === "1" ||
    result?.status === true ||
    result?.status === 1 ||
    result?.status === "success" ||
    /success/i.test(result?.message || "");

  if (!isSuccess) {
    throw new Error(result?.message || "Failed to update sub category.");
  }

  return result;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function EditSubCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const blobUrlRef = useRef(null);
  const dropdownRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [catId, setCatId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [savedImageUrl, setSavedImageUrl] = useState(""); // image already on server
  const [imageFile, setImageFile] = useState(null); // newly chosen image
  const [imagePreview, setImagePreview] = useState("");
  const [fileLabel, setFileLabel] = useState("No file chosen");
  const [savedFileLabel, setSavedFileLabel] = useState("No file chosen");
  const [isDragging, setIsDragging] = useState(false);
  const [savedCategoryName, setSavedCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // success modal: { message } | null
  const [successInfo, setSuccessInfo] = useState(null);

  const busy = loading || saving;

  /* ---------------------------------------------------------
     LOAD CATEGORIES + SUB CATEGORY
  --------------------------------------------------------- */

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [categoryList, subCategory] = await Promise.all([
          fetchCategories(),
          fetchSubCategoryById(id),
        ]);

        if (!isMounted) return;

        const list = Array.isArray(categoryList)
          ? categoryList
          : categoryList?.data || [];

        // debug: browser console mein dekho API kya bhej raha hai
        console.log("subCategory API:", subCategory);
        console.log("categories API:", list);
        console.log(
          "SubCategory full data:",
          JSON.stringify(subCategory, null, 2),
        );
        console.log(
          "First category full data:",
          JSON.stringify(list[0], null, 2),
        );

        // saved category id (alag-alag field names try karta hai)
        const rawCatId =
          subCategory.cat_id ??
          subCategory.category_id ??
          subCategory.category ??
          subCategory.parent_id ??
          "";

        const apiCategoryName =
          subCategory.category_name || subCategory.cat_name || "";

        // 1) id se match, 2) na mile to name se match
        let matched = list.find((c) => String(c.id) === String(rawCatId));

        if (!matched && apiCategoryName) {
          matched = list.find(
            (c) =>
              String(c.category_name).trim().toLowerCase() ===
              String(apiCategoryName).trim().toLowerCase(),
          );
        }

        setCategories(list);
        setCatId(String(matched ? matched.id : rawCatId));
        setSavedCategoryName(apiCategoryName);
        setName(subCategory.name || "");
        setDescription(
          subCategory.description || subCategory.sort_description || "",
        );

        if (subCategory.image) {
          const url = getImage(subCategory.image);
          setSavedImageUrl(url);
          setImagePreview(url);
          setFileLabel(subCategory.image);
          setSavedFileLabel(subCategory.image);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load sub category.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // free the temporary preview URL when leaving the page
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  // close the category dropdown when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /* ---------------------------------------------------------
     CATEGORY DROPDOWN
  --------------------------------------------------------- */

  const selectedCategory = categories.find(
    (cat) => String(cat.id) === String(catId),
  );

  const toggleDropdown = () => {
    if (!busy) setDropdownOpen((open) => !open);
  };

  const chooseCategory = (value) => {
    setCatId(String(value));
    setDropdownOpen(false);
  };

  /* ---------------------------------------------------------
     IMAGE HANDLERS
  --------------------------------------------------------- */

  // drop the newly chosen file and go back to the saved image
  const revertImage = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    setImageFile(null);
    setImagePreview(savedImageUrl);
    setFileLabel(savedFileLabel);
  }, [savedImageUrl, savedFileLabel]);

  const selectImageFile = useCallback((file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    setError("");

    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = URL.createObjectURL(file);

    setImageFile(file);
    setFileLabel(file.name);
    setImagePreview(blobUrlRef.current);
  }, []);

  const handleImageChange = (event) => {
    selectImageFile(event.target.files?.[0]);
    // allow choosing the same file again
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (busy) return;
    selectImageFile(event.dataTransfer.files?.[0]);
  };

  const openFilePicker = () => {
    if (!busy) fileInputRef.current?.click();
  };

  /* ---------------------------------------------------------
     CANCEL / SUBMIT
  --------------------------------------------------------- */

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!catId) {
      setError("Please select a category.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter the sub category name.");
      return;
    }

    setSaving(true);

    try {
      const result = await updateSubCategory(id, {
        cat_id: catId,
        name: name.trim(),
        description,
        file: imageFile,
      });

      setSuccessInfo({
        message:
          result.message || "The sub category has been updated successfully.",
      });
    } catch (err) {
      console.error("Update sub category error:", err);
      setError(err.message || "Failed to update sub category.");
    } finally {
      setSaving(false);
    }
  };

  const closeSuccess = useCallback(() => {
    setSuccessInfo(null);
    navigate(SUB_CATEGORY_LIST_PATH);
  }, [navigate]);

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <div className="edsc-page">
      {/* PAGE HEADER */}
      <div className="edsc-page-header">
        <h2 className="edsc-page-title">Edit Sub Category</h2>
        <ServiceBreadcrumbs
          items={[
            { label: "Sub Category List", to: SUB_CATEGORY_LIST_PATH },
            { label: "Edit Sub Category" },
          ]}
        />
      </div>

      {/* MAIN CARD */}
      <form className="edsc-card" onSubmit={handleSubmit}>
        <div className="edsc-card-header">
          <h3>Update Sub Category</h3>
          <p>Change the details below and save to update this sub category.</p>
        </div>

        <div className="edsc-card-body">
          {error && (
            <div className="edsc-alert" role="alert">
              <span>{error}</span>
              <button
                type="button"
                className="edsc-alert-close"
                aria-label="Dismiss"
                onClick={() => setError("")}
              >
                <FaTimes />
              </button>
            </div>
          )}

          {loading ? (
            <div className="edsc-state">
              <span className="edsc-spinner" aria-hidden="true" />
              Loading sub category...
            </div>
          ) : (
            <div className="edsc-layout">
              {/* LEFT: DETAILS */}
              <div className="edsc-details">
                {/* CATEGORY DROPDOWN */}
                <div className="edsc-field">
                  <label id="edsc-category-label">
                    Category <span className="edsc-required">*</span>
                  </label>

                  <div className="edsc-dropdown" ref={dropdownRef}>
                    <button
                      type="button"
                      className={`edsc-dropdown-box ${
                        dropdownOpen ? "edsc-dropdown-box-open" : ""
                      }`}
                      onClick={toggleDropdown}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") setDropdownOpen(false);
                      }}
                      disabled={busy}
                      aria-haspopup="listbox"
                      aria-expanded={dropdownOpen}
                      aria-labelledby="edsc-category-label"
                    >
                      <span
                        className={
                          selectedCategory || savedCategoryName
                            ? ""
                            : "edsc-dropdown-placeholder"
                        }
                      >
                        {selectedCategory
                          ? selectedCategory.category_name
                          : savedCategoryName || ".. Select Category Name .."}
                      </span>
                      <FaChevronDown className="edsc-dropdown-arrow" />
                    </button>

                    {dropdownOpen && (
                      <ul
                        className="edsc-dropdown-list"
                        role="listbox"
                        aria-labelledby="edsc-category-label"
                      >
                        {categories.length === 0 && (
                          <li className="edsc-dropdown-empty">
                            No categories found
                          </li>
                        )}

                        {categories.map((cat) => {
                          const isSelected = String(cat.id) === String(catId);

                          return (
                            <li
                              key={cat.id}
                              role="option"
                              aria-selected={isSelected}
                              className={`edsc-dropdown-item ${
                                isSelected ? "edsc-dropdown-item-active" : ""
                              }`}
                              onClick={() => chooseCategory(cat.id)}
                            >
                              <span>{cat.category_name}</span>
                              {isSelected && <FaCheck />}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="edsc-field">
                  <label htmlFor="edsc-name">
                    Sub Category Name <span className="edsc-required">*</span>
                  </label>
                  <input
                    id="edsc-name"
                    type="text"
                    placeholder="Enter sub category name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={busy}
                  />
                </div>

                <div className="edsc-field">
                  <label htmlFor="edsc-description">Sort Description</label>
                  <textarea
                    id="edsc-description"
                    placeholder="Enter sort description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    disabled={busy}
                    rows={4}
                  />
                </div>
              </div>

              {/* RIGHT: IMAGE */}
              <div className="edsc-image-panel">
                <span className="edsc-image-label">Sub Category Image</span>

                <div className="edsc-preview">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Sub category preview" />
                      <span
                        className={`edsc-preview-badge ${
                          imageFile ? "edsc-preview-badge-new" : ""
                        }`}
                      >
                        {imageFile ? "New image" : "Current image"}
                      </span>
                    </>
                  ) : (
                    <div className="edsc-preview-empty">
                      <FaImage />
                      <span>No image selected</span>
                    </div>
                  )}
                </div>

                <div
                  className={`edsc-dropzone ${
                    isDragging ? "edsc-dropzone-active" : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={openFilePicker}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openFilePicker();
                    }
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <FaCloudUploadAlt className="edsc-dropzone-icon" />
                  <strong>Click to choose</strong>
                  <span>or drag and drop an image here</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="edsc-hidden-file"
                />

                <div className="edsc-file-row">
                  <span className="edsc-file-name" title={fileLabel}>
                    {fileLabel}
                  </span>

                  {imageFile && (
                    <button
                      type="button"
                      className="edsc-undo-btn"
                      onClick={revertImage}
                      disabled={saving}
                    >
                      <FaUndo />
                      Undo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="edsc-card-footer">
          <button
            type="button"
            className="edsc-cancel-btn"
            onClick={handleCancel}
            disabled={saving}
          >
            <FaTimes />
            Cancel
          </button>

          <button type="submit" className="edsc-update-btn" disabled={busy}>
            {saving ? (
              <span className="edsc-btn-spinner" aria-hidden="true" />
            ) : (
              <FaCheck />
            )}
            {saving ? "Updating..." : "Update"}
          </button>
        </div>
      </form>

      {/* SUCCESS MODAL */}
      <ServiceSuccessModal
        isOpen={Boolean(successInfo)}
        title="Sub Category Updated"
        message={successInfo?.message}
        onClose={closeSuccess}
      />
    </div>
  );
}
