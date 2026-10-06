import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./editCategory.css";
import { getImage } from "../../utils/images";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

/**
 * Fetch a single category by id
 * @param {string|number} categoryId
 * @returns {Promise<Object>}
 */
const getCategoryById = async (categoryId) => {
  const response = await fetch(`${BASE_URL}/admin/categories/${categoryId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  console.log("GET CATEGORY RESULT:", result);

  if (!response.ok) {
    throw new Error(
      result?.message || `Failed to fetch category (${response.status})`,
    );
  }

  return result;
};
/**
 * Update a category. Uses FormData since an image file may be attached.
 * @param {string|number} categoryId
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
const updateCategory = async (categoryId, payload) => {
  const formData = new FormData();

  formData.append("cat_id", categoryId);
  formData.append("name", payload.categoryName ?? "");

  formData.append("showHomeService", payload.showHomeService ?? "");

  formData.append("showOnSiteService", payload.showOnSiteService ?? "");

  if (payload.categoryImage) {
    formData.append("file", payload.categoryImage);
  }

  const response = await fetch(`${BASE_URL}/admin/categories/${categoryId}`, {
    method: "PUT",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || `Failed to update category (${response.status})`,
    );
  }

  return result;
};

const EditCategory = () => {
  const { id: categoryId } = useParams();
  const [categoryName, setCategoryName] = useState("");

  const [homeService, setHomeService] = useState(false);
  const [homeServiceDetail, setHomeServiceDetail] = useState("");

  const [onSiteService, setOnSiteService] = useState(false);
  const [onSiteServiceDetail, setOnSiteServiceDetail] = useState("");

  const [sortDescription, setSortDescription] = useState("");

  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // -----------------------------------------
  // LOAD EXISTING CATEGORY
  // -----------------------------------------

  useEffect(() => {
    if (!categoryId) return;

    const fetchCategory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getCategoryById(categoryId);

        console.log("CATEGORY API RESPONSE:", response);

        const data = response.data;

        console.log("CATEGORY DATA:", data);

        // CATEGORY NAME
        setCategoryName(data.category_name || "");

        // HOME SERVICE
        setHomeService(
          data.showHomeService === "1" || data.showHomeService === 1,
        );

        // ON SITE SERVICE
        setOnSiteService(
          data.showOnSiteService === "1" || data.showOnSiteService === 1,
        );

        // CATEGORY IMAGE
        if (data.category_image) {
          setFileName(data.category_image);

          const image = getImage(data.category_image);

          console.log("CATEGORY IMAGE NAME:", data.category_image);
          console.log("CATEGORY IMAGE PATH:", image);

          setImagePreview(image);
        }
      } catch (err) {
        console.error("Get category error:", err);
        setError(err.message || "Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  // -----------------------------------------
  // IMAGE HANDLER
  // -----------------------------------------

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("No file chosen");
      return;
    }
    setCategoryImage(file);
    setFileName(file.name);
    setImagePreview(URL.createObjectURL(file));
  };

  // -----------------------------------------
  // SUBMIT
  // -----------------------------------------

const handleUpdate = async () => {
  setSubmitting(true);
  setError(null);

  try {
    const response = await updateCategory(categoryId, {
      categoryName,

      // PHP expects these values
      showHomeService: homeService ? "1" : "0",
      showOnSiteService: onSiteService ? "1" : "0",

      // Optional new image
      categoryImage,
    });

    console.log("UPDATE CATEGORY RESPONSE:", response);

    alert("Category updated successfully.");
  } catch (err) {
    console.error("Update category error:", err);
    setError(err.message || "Failed to update category");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="edit-category-container">
      <div className="edit-category-card">
        {/* ================================
          HEADER
        ================================= */}

        <div className="edit-category-header">
          <h2>update Category</h2>
        </div>

        <div className="edit-category-body">
          {error && <div className="edit-category-error">{error}</div>}

          {/* ================================
            ROW: NAME / HOME / ON SITE
          ================================= */}

          <div className="edit-category-row">
            <div className="edit-category-field">
              <label>Category Name</label>
              <input
                type="text"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                disabled={loading}
              />
            </div>

            <div className="edit-category-field">
              <label>Home Service</label>
              <div className="edit-category-check-row">
                <input
                  type="checkbox"
                  checked={homeService}
                  onChange={(event) => setHomeService(event.target.checked)}
                  disabled={loading}
                />
                <input
                  type="text"
                  className="edit-category-detail-input"
                  placeholder="Enter home service detail"
                  value={homeServiceDetail}
                  onChange={(event) => setHomeServiceDetail(event.target.value)}
                  disabled={loading || !homeService}
                />
              </div>
            </div>

            <div className="edit-category-field">
              <label>On Site Service</label>
              <div className="edit-category-check-row">
                <input
                  type="checkbox"
                  checked={onSiteService}
                  onChange={(event) => setOnSiteService(event.target.checked)}
                  disabled={loading}
                />
                <input
                  type="text"
                  className="edit-category-detail-input"
                  placeholder="Enter on site service detail"
                  value={onSiteServiceDetail}
                  onChange={(event) =>
                    setOnSiteServiceDetail(event.target.value)
                  }
                  disabled={loading || !onSiteService}
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
              disabled={loading}
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
                disabled={loading}
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
            onClick={handleUpdate}
            disabled={loading || submitting}
          >
            {submitting ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCategory;
