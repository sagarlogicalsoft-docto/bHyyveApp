import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import "./editCategory.css";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

/**
 * Add new category
 * Same fields/logic as PHP Addcategory()
 */
const addCategory = async (payload) => {
  const formData = new FormData();

  formData.append("category", payload.category ?? "");
  formData.append("name", payload.categoryName ?? "");

  // PHP fields
  formData.append("hideHomeService", payload.hideHomeService ?? "");
  formData.append("hideOnSiteService", payload.hideOnSiteService ?? "");
  formData.append("showHomeService", payload.showHomeService ?? "");
  formData.append("showOnSiteService", payload.showOnSiteService ?? "");

  // PHP expects $_FILES['file']
  if (payload.categoryImage) {
    formData.append("file", payload.categoryImage);
  }

  const response = await fetch(`${BASE_URL}/admin/categories`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  console.log("ADD CATEGORY API RESPONSE:", result);

  if (!response.ok) {
    throw new Error(
      result?.message || `Failed to add category (${response.status})`,
    );
  }

  return result;
};

const AddCategory = () => {
  const navigate = useNavigate();

  // PHP: category = new_cat
  const [category] = useState("new_cat");

  const [categoryName, setCategoryName] = useState("");

  const [homeService, setHomeService] = useState(false);
  const [homeServiceDetail, setHomeServiceDetail] = useState("");

  const [onSiteService, setOnSiteService] = useState(false);
  const [onSiteServiceDetail, setOnSiteServiceDetail] = useState("");

  const [sortDescription, setSortDescription] = useState("");

  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // -----------------------------------------
  // IMAGE HANDLER
  // -----------------------------------------

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFileName("No file chosen");
      setCategoryImage(null);
      setImagePreview(null);
      return;
    }

    setCategoryImage(file);
    setFileName(file.name);
    setImagePreview(URL.createObjectURL(file));
  };

  // -----------------------------------------
  // SUBMIT
  // -----------------------------------------

  const handleAddCategory = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await addCategory({
        category,
        categoryName,

        // Same PHP logic
        hideHomeService: "",
        hideOnSiteService: "",

        showHomeService: homeService ? "1" : "0",
        showOnSiteService: onSiteService ? "1" : "0",

        categoryImage,
      });

      console.log("CATEGORY ADDED:", response);

      alert(response.message || "Category added successfully.");

      navigate("/category_list");
    } catch (err) {
      console.error("Add category error:", err);

      setError(err.message || "Failed to add category.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="edit-category-container">
      {/* ================================
          BREADCRUMB
        ================================= */}

      <div className="edit-category-breadcrumb">
        <Link to="/home">Home</Link>

        <IoIosArrowForward />

        <Link to="/category_list">Category List</Link>

        <IoIosArrowForward />

        <span>Add Category</span>
      </div>

      {/* ================================
          HEADER
        ================================= */}
      <div className="edit-category-card">
        <div className="edit-category-header">
          <h2>Add Category</h2>
        </div>

        <div className="edit-category-body">
          {error && <div className="edit-category-error">{error}</div>}

          {/* ================================
            ROW: NAME / HOME / ON SITE
          ================================= */}

          <div className="edit-category-row">
            {/* CATEGORY NAME */}

            <div className="edit-category-field">
              <label>Category Name</label>

              <input
                type="text"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                disabled={submitting}
              />
            </div>

            {/* HOME SERVICE */}

            <div className="edit-category-field">
              <label>Home Service</label>

              <div className="edit-category-check-row">
                <input
                  type="checkbox"
                  checked={homeService}
                  onChange={(event) => setHomeService(event.target.checked)}
                  disabled={submitting}
                />

                <input
                  type="text"
                  className="edit-category-detail-input"
                  placeholder="Enter home service detail"
                  value={homeServiceDetail}
                  onChange={(event) => setHomeServiceDetail(event.target.value)}
                  disabled={submitting || !homeService}
                />
              </div>
            </div>

            {/* ON SITE SERVICE */}

            <div className="edit-category-field">
              <label>On Site Service</label>

              <div className="edit-category-check-row">
                <input
                  type="checkbox"
                  checked={onSiteService}
                  onChange={(event) => setOnSiteService(event.target.checked)}
                  disabled={submitting}
                />

                <input
                  type="text"
                  className="edit-category-detail-input"
                  placeholder="Enter on site service detail"
                  value={onSiteServiceDetail}
                  onChange={(event) =>
                    setOnSiteServiceDetail(event.target.value)
                  }
                  disabled={submitting || !onSiteService}
                />
              </div>
            </div>
          </div>

          {/* ================================
            SORT DESCRIPTION
          ================================= */}

          <div className="edit-category-field edit-category-field-full">
            <label>Sort Description</label>

            <textarea
              placeholder="Enter sort description"
              value={sortDescription}
              onChange={(event) => setSortDescription(event.target.value)}
              disabled={submitting}
              rows={3}
            />
          </div>

          {/* ================================
            CATEGORY IMAGE
          ================================= */}

          <div className="edit-category-field edit-category-field-full">
            <label>Category Image</label>

            <div className="edit-category-file-row">
              <button
                type="button"
                className="edit-category-choose-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
              >
                Choose File
              </button>

              <span className="edit-category-file-name">{fileName}</span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>

            {imagePreview && (
              <div className="edit-category-image-preview">
                <img src={imagePreview} alt="Category preview" />
              </div>
            )}
          </div>
        </div>

        {/* ================================
          FOOTER
        ================================= */}

        <div className="edit-category-footer">
          <button
            type="button"
            className="edit-category-update-btn"
            onClick={handleAddCategory}
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
