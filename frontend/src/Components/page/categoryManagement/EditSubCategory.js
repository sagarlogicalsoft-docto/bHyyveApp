import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./editSubCategory.css";
import { getImage } from "../../utils/images";

// API base URL
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";


// ---------------------------------------------------------------------------
// GET CATEGORIES
// ---------------------------------------------------------------------------
async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/admin/categories`);

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(
      result.message || "Failed to fetch categories."
    );
  }

  return result.data || [];
}


// ---------------------------------------------------------------------------
// GET SUB CATEGORY BY ID
// ---------------------------------------------------------------------------
async function fetchSubCategoryById(id) {
  const res = await fetch(
    `${API_BASE_URL}/admin/sub-categories/${id}`
  );

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(
      result.message || "Failed to fetch sub category."
    );
  }

  return result.data;
}


// ---------------------------------------------------------------------------
// UPDATE SUB CATEGORY
// ---------------------------------------------------------------------------
async function updateSubCategory(id, payload) {
  const formData = new FormData();

  // PHP update_sub_category() expects these exact fields
  formData.append("cat_id", payload.cat_id);
  formData.append("name", payload.name);

  // Image is optional
  if (payload.file) {
    formData.append("file", payload.file);
  }

  const res = await fetch(
    `${API_BASE_URL}/admin/sub-categories/${id}`,
    {
      method: "PUT",
      body: formData,
    }
  );

  const result = await res.json();

  if (!res.ok || !result.success) {
    throw new Error(
      result.message || "Failed to update sub category."
    );
  }

  return result;
}


// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
export default function EditSubCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [catId, setCatId] = useState("");
  const [name, setName] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [fileLabel, setFileLabel] = useState("No file chosen");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // -------------------------------------------------------------------------
  // LOAD CATEGORY LIST + SUB CATEGORY
  // -------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [categoryList, subCategory] = await Promise.all([
          fetchCategories(),
          fetchSubCategoryById(id),
        ]);

        if (!isMounted) return;

        setCategories(categoryList);

        // API response:
        // {
        //   id: 90,
        //   cat_id: 57,
        //   name: "Real Estate Photography",
        //   image: "category1786406919.png"
        // }

        setCatId(String(subCategory.cat_id || ""));
        setName(subCategory.name || "");

        if (subCategory.image) {
          setImagePreview(getImage(subCategory.image));
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || "Failed to load sub category."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);


  // -------------------------------------------------------------------------
  // IMAGE CHANGE
  // -------------------------------------------------------------------------
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setImageFile(file);
    setFileLabel(file.name);
    setImagePreview(URL.createObjectURL(file));
  };


  // -------------------------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!catId || !name) {
        setError("Please fill all the required fields.");
        return;
      }

      const result = await updateSubCategory(id, {
        cat_id: catId,
        name: name,
        file: imageFile,
      });

      console.log(result.message);

      // PHP redirects to sub_categoryList after successful update.
      // React equivalent:
      navigate("/sub_category");
    } catch (err) {
      console.error("Update sub category error:", err);

      setError(
        err.message || "Failed to update sub category."
      );
    } finally {
      setSaving(false);
    }
  };


  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------
  return (
    <div className="esc-page">

      <h1 className="esc-page-title">
        Admin Dashboard
      </h1>

      <div className="esc-breadcrumb">
        <span className="esc-crumb esc-crumb-muted">
          Home
        </span>

        <span className="esc-crumb-sep">
          &gt;
        </span>

        <span className="esc-crumb">
          Admin
        </span>

        <span className="esc-crumb-sep">
          &gt;
        </span>

        <span className="esc-crumb">
          Update Sub Category
        </span>
      </div>


      <div className="esc-card">

        <h2 className="esc-card-title">
          Update Sub Category
        </h2>


        <form
          className="esc-form"
          onSubmit={handleSubmit}
        >

          <div className="esc-form-body">

            {error && (
              <div className="esc-error">
                {error}
              </div>
            )}


            <div className="esc-row">

              {/* CATEGORY */}
              <div className="esc-field">

                <label
                  className="esc-label"
                  htmlFor="esc-category"
                >
                  Select Category
                </label>

                <select
                  id="esc-category"
                  className="esc-select"
                  value={catId}
                  onChange={(e) =>
                    setCatId(e.target.value)
                  }
                  disabled={loading || saving}
                >

                  <option value="">
                    Select Category
                  </option>

                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                    >
                      {cat.category_name}
                    </option>
                  ))}

                </select>

              </div>


              {/* NAME */}
              <div className="esc-field">

                <label
                  className="esc-label"
                  htmlFor="esc-name"
                >
                  Sub Category Name
                </label>

                <input
                  id="esc-name"
                  type="text"
                  className="esc-input"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  disabled={loading || saving}
                />

              </div>


              {/* IMAGE */}
              <div className="esc-field">

                <label
                  className="esc-label"
                  htmlFor="esc-image"
                >
                  Sub Category Image
                </label>

                <div className="esc-file-row">

                  <label
                    htmlFor="esc-image"
                    className="esc-file-btn"
                  >
                    Choose File
                  </label>

                  <span className="esc-file-name">
                    {fileLabel}
                  </span>

                  <input
                    id="esc-image"
                    type="file"
                    accept="image/*"
                    className="esc-file-input"
                    onChange={handleImageChange}
                    disabled={loading || saving}
                  />

                </div>


                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Sub category preview"
                    className="esc-image-preview"
                  />
                )}

              </div>

            </div>

          </div>


          {/* FOOTER */}
          <div className="esc-form-footer">

            <button
              type="submit"
              className="esc-update-btn"
              disabled={loading || saving}
            >
              {saving
                ? "Updating..."
                : "Update"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}