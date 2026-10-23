import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheck,
  FaChevronDown,
  FaCloudUploadAlt,
  FaImage,
  FaPlus,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../../Components/common/modal/serviceModal/ServiceSuccessModal";
import api from "../../../config/api";

import "./addSubCategory.css";

// Change this if your sub category list route is different
const SUB_CATEGORY_LIST_PATH = "/sub_category_list";

/* =========================================================
   API / SERVICE LAYER (kept inline, easy to move later)
   Uses the shared `api` instance, so the base URL comes
   from config/api.
========================================================= */

async function request(config) {
  try {
    const response = await api.request(config);
    return response.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.message ||
        err?.message ||
        `Request failed (${err?.response?.status || "network error"})`
    );
  }
}

function fetchCategories() {
  return request({ method: "GET", url: "/admin/categories" });
}

async function createSubCategory(payload) {
  const formData = new FormData();

  formData.append("category", payload.category);
  formData.append("name", payload.name);
  formData.append("description", payload.description || "");

  if (payload.image) {
    formData.append("file", payload.image);
  }

  const data = await request({
    method: "POST",
    url: "/admin/sub-categories/add-category",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!data?.success) {
    throw new Error(data?.message || "Failed to add sub category");
  }

  return data;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AddSubCategory() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const blobUrlRef = useRef(null);
  const dropdownRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [fileLabel, setFileLabel] = useState("No file chosen");
  const [isDragging, setIsDragging] = useState(false);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // success modal: { message } | null
  const [successInfo, setSuccessInfo] = useState(null);

  /* ---------------------------------------------------------
     LOAD CATEGORIES
  --------------------------------------------------------- */

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      setLoadingCategories(true);
      setError("");

      try {
        const categoryList = await fetchCategories();

        if (isMounted) {
          setCategories(categoryList.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load categories");
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const dropdownDisabled = loadingCategories || saving;

  const selectedCategory = categories.find(
    (cat) => String(cat.id) === String(category)
  );

  const toggleDropdown = () => {
    if (!dropdownDisabled) setDropdownOpen((open) => !open);
  };

  const chooseCategory = (value) => {
    setCategory(String(value));
    setDropdownOpen(false);
  };

  /* ---------------------------------------------------------
     IMAGE HANDLERS
  --------------------------------------------------------- */

  const clearImage = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    setImageFile(null);
    setImagePreview("");
    setFileLabel("No file chosen");
  }, []);

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

    if (saving) return;
    selectImageFile(event.dataTransfer.files?.[0]);
  };

  const openFilePicker = () => {
    if (!saving) fileInputRef.current?.click();
  };

  /* ---------------------------------------------------------
     RESET / CANCEL
  --------------------------------------------------------- */

  const resetForm = () => {
    setCategory("");
    setName("");
    setDescription("");
    setDropdownOpen(false);
    clearImage();
  };

  const handleCancel = () => {
    navigate(-1);
  };

  /* ---------------------------------------------------------
     SUBMIT
  --------------------------------------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter the sub category name.");
      return;
    }

    if (!imageFile) {
      setError("Please select an image.");
      return;
    }

    setSaving(true);

    try {
      const response = await createSubCategory({
        category,
        name: name.trim(),
        description,
        image: imageFile,
      });

      setSuccessInfo({
        message:
          response.message || "The sub category has been added successfully.",
      });

      resetForm();
    } catch (err) {
      console.error("Add sub category error:", err);
      setError(err.message || "Failed to add sub category");
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
    <div className="adsc-page">
      {/* PAGE HEADER */}
      <div className="adsc-page-header">
        <h2 className="adsc-page-title">Add Sub Category</h2>
        <ServiceBreadcrumbs
          items={[
            { label: "Sub Category List", to: SUB_CATEGORY_LIST_PATH },
            { label: "Add Sub Category" },
          ]}
        />
      </div>

      {/* MAIN CARD */}
      <form className="adsc-card" onSubmit={handleSubmit}>
        <div className="adsc-card-header">
          <h3>New Sub Category</h3>
          <p>Choose a category and fill in the details to add a sub category.</p>
        </div>

        <div className="adsc-card-body">
          {error && (
            <div className="adsc-alert" role="alert">
              <span>{error}</span>
              <button
                type="button"
                className="adsc-alert-close"
                aria-label="Dismiss"
                onClick={() => setError("")}
              >
                <FaTimes />
              </button>
            </div>
          )}

          <div className="adsc-layout">
            {/* LEFT: DETAILS */}
            <div className="adsc-details">
              {/* CATEGORY DROPDOWN */}
              <div className="adsc-field">
                <label id="adsc-category-label">
                  Category <span className="adsc-required">*</span>
                </label>

                <div className="adsc-dropdown" ref={dropdownRef}>
                  <button
                    type="button"
                    className={`adsc-dropdown-box ${
                      dropdownOpen ? "adsc-dropdown-box-open" : ""
                    }`}
                    onClick={toggleDropdown}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setDropdownOpen(false);
                    }}
                    disabled={dropdownDisabled}
                    aria-haspopup="listbox"
                    aria-expanded={dropdownOpen}
                    aria-labelledby="adsc-category-label"
                  >
                    <span
                      className={
                        selectedCategory ? "" : "adsc-dropdown-placeholder"
                      }
                    >
                      {selectedCategory
                        ? selectedCategory.category_name
                        : loadingCategories
                        ? "Loading categories..."
                        : ".. Select Category Name .."}
                    </span>
                    <FaChevronDown className="adsc-dropdown-arrow" />
                  </button>

                  {dropdownOpen && (
                    <ul
                      className="adsc-dropdown-list"
                      role="listbox"
                      aria-labelledby="adsc-category-label"
                    >
                      {categories.length === 0 && (
                        <li className="adsc-dropdown-empty">
                          No categories found
                        </li>
                      )}

                      {categories.map((cat) => {
                        const isSelected = String(cat.id) === String(category);

                        return (
                          <li
                            key={cat.id}
                            role="option"
                            aria-selected={isSelected}
                            className={`adsc-dropdown-item ${
                              isSelected ? "adsc-dropdown-item-active" : ""
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

              <div className="adsc-field">
                <label htmlFor="adsc-name">
                  Sub Category Name <span className="adsc-required">*</span>
                </label>
                <input
                  id="adsc-name"
                  type="text"
                  placeholder="Enter sub category name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="adsc-field">
                <label htmlFor="adsc-description">Sort Description</label>
                <textarea
                  id="adsc-description"
                  placeholder="Enter sort description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={saving}
                  rows={4}
                />
              </div>
            </div>

            {/* RIGHT: IMAGE */}
            <div className="adsc-image-panel">
              <span className="adsc-image-label">
                Sub Category Image <span className="adsc-required">*</span>
              </span>

              <div className="adsc-preview">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Sub category preview" />
                    <span className="adsc-preview-badge">Selected image</span>
                  </>
                ) : (
                  <div className="adsc-preview-empty">
                    <FaImage />
                    <span>Image preview will appear here</span>
                  </div>
                )}
              </div>

              <div
                className={`adsc-dropzone ${
                  isDragging ? "adsc-dropzone-active" : ""
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
                <FaCloudUploadAlt className="adsc-dropzone-icon" />
                <strong>Click to choose</strong>
                <span>or drag and drop an image here</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="adsc-hidden-file"
              />

              <div className="adsc-file-row">
                <span className="adsc-file-name" title={fileLabel}>
                  {fileLabel}
                </span>

                {imageFile && (
                  <button
                    type="button"
                    className="adsc-remove-btn"
                    onClick={clearImage}
                    disabled={saving}
                  >
                    <FaTrash />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="adsc-card-footer">
          <button
            type="button"
            className="adsc-cancel-btn"
            onClick={handleCancel}
            disabled={saving}
          >
            <FaTimes />
            Cancel
          </button>

          <button type="submit" className="adsc-add-btn" disabled={saving}>
            {saving ? (
              <span className="adsc-btn-spinner" aria-hidden="true" />
            ) : (
              <FaPlus />
            )}
            {saving ? "Adding..." : "Add Sub Category"}
          </button>
        </div>
      </form>

      {/* SUCCESS MODAL */}
      <ServiceSuccessModal
        isOpen={Boolean(successInfo)}
        title="Sub Category Added"
        message={successInfo?.message}
        onClose={closeSuccess}
      />
    </div>
  );
}