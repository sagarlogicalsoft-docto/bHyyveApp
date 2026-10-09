import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./addSubCategory.css";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";


const fetchCategories = async () => {
  const response = await fetch(`${BASE_URL}/admin/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  console.log("CATEGORIES API RESPONSE:", result);

  if (!response.ok) {
    throw new Error(result?.message || "Failed to fetch categories");
  }

  return result;
};

async function createSubCategory(payload) {
  const formData = new FormData();

  formData.append("category", payload.category);
  formData.append("name", payload.name);
  formData.append("description", payload.description || "");

  if (payload.image) {
    formData.append("file", payload.image);
  }

  const res = await fetch(
  `${BASE_URL}/admin/sub-categories/add-category`,
  {
    method: "POST",
    body: formData,
  }
);

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to add sub category");
  }

  return data;
}

export default function AddSubCategory() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [fileLabel, setFileLabel] = useState("No file chosen");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];

    if (!file) {
      setFileLabel("No file chosen");
      setImageFile(null);
      setImagePreview("");
      return;
    }

    setImageFile(file);
    setFileLabel(file.name);
    setImagePreview(URL.createObjectURL(file));
  };

  // -------------------------------------------------------------------------
  // Reset Form
  // -------------------------------------------------------------------------
  const resetForm = () => {
    setCategory("");
    setName("");
    setDescription("");
    setImageFile(null);
    setImagePreview("");
    setFileLabel("No file chosen");
  };

  // -------------------------------------------------------------------------
  // Cancel
  // -------------------------------------------------------------------------
  const handleCancel = () => {
    navigate(-1);
  };

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validate category
    if (!category) {
      setError("Please Select Category");
      return;
    }

    // Validate name
    if (!name.trim()) {
      setError("Please Enter Sub Category Name");
      return;
    }

    // Validate image
    if (!imageFile) {
      setError("Please Select File");
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

      setSuccess(response.message || "Sub category Added Successfully");

      resetForm();
    } catch (err) {
      setError(err.message || "Failed to add sub category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="asc-page">
      <h1 className="asc-page-title">Admin Dashboard</h1>

      <div className="asc-breadcrumb">
        <span className="asc-crumb asc-crumb-muted">Home</span>

        <span className="asc-crumb-sep">&gt;</span>

        <span className="asc-crumb">Admin</span>

        <span className="asc-crumb-sep">&gt;</span>

        <span className="asc-crumb">Admin</span>
      </div>

      <div className="asc-card">
        <h2 className="asc-card-title">Add New Sub Category</h2>

        <form className="asc-form" onSubmit={handleSubmit}>
          <div className="asc-form-body">
            {/* Error */}
            {error && <div className="asc-error">{error}</div>}

            {/* Success */}
            {success && <div className="asc-success">{success}</div>}

            <div className="asc-row">
              {/* Sub Category Name */}
              <div className="asc-field">
                <label className="asc-label" htmlFor="asc-name">
                  Sub Category Name
                </label>

                <input
                  id="asc-name"
                  type="text"
                  className="asc-input"
                  placeholder="Enter Sub category name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Category Dropdown */}
              <div className="asc-field">
                <label className="asc-label" htmlFor="asc-category">
                  .. Select Category Name ..
                </label>

                <select
                  id="asc-category"
                  className="asc-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loadingCategories}
                >
                  <option value="">.. Select Category Name ..</option>

                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="asc-field asc-field-full">
              <label className="asc-label" htmlFor="asc-description">
                Sort Description
              </label>

              <textarea
                id="asc-description"
                className="asc-textarea"
                placeholder="Enter sort description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Image */}
            <div className="asc-row asc-row-image">
              <div className="asc-field">
                <label className="asc-label" htmlFor="asc-image">
                  Sub Category Image
                </label>

                <div className="asc-file-row">
                  <label htmlFor="asc-image" className="asc-file-btn">
                    Choose File
                  </label>

                  <span className="asc-file-name">{fileLabel}</span>

                  <input
                    id="asc-image"
                    type="file"
                    accept="image/*"
                    className="asc-file-input"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="asc-field">
                  <img
                    src={imagePreview}
                    alt="Sub category preview"
                    className="asc-image-preview"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="asc-form-footer">
            <button
              type="button"
              className="asc-cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button type="submit" className="asc-add-btn" disabled={saving}>
              {saving ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
