import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTimes, FaImage, FaInfoCircle } from "react-icons/fa";
import "./editService.css";

/*
|--------------------------------------------------------------------------
| Temporary Service Data
|--------------------------------------------------------------------------
| Replace this later with API data.
*/
const serviceData = [
  {
    id: 1,
    vendor: "Virtual Home Photography",
    category: "Photography & Videography",
    subCategory: "Real Estate Photography",
    serviceName: "Listing Showcase",
    price: "450",
    description:
      "A complete visual marketing package built to showcase premium listings up to 4,000 sq. ft. Building on everything in Listing Pro, this tier adds a professional HD video walkthrough, aerial drone video, 2D floor plan, along with an AI cinematic walkthrough and an agent.",
    serviceType: "Home Service",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=400",
    ],
  },
];

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vendor: "",
    category: "",
    subCategory: "",
    serviceName: "",
    price: "",
    description: "",
    serviceType: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | Dropdown Options
  |--------------------------------------------------------------------------
  */

  const vendors = [
    "Virtual Home Photography",
    "Listing Lens Co.",
    "Oven to Market Co.",
  ];

  const categories = [
    "Photography & Videography",
    "Food & Restaurant",
    "Home Services",
    "Marketing Services",
  ];

  const subCategories = [
    "Real Estate Photography",
    "Commercial Photography",
    "Event Photography",
    "Video Production",
  ];

  const serviceTypes = [
    "Home Service",
    "Professional Service",
    "Business Service",
    "Online Service",
  ];

  /*
  |--------------------------------------------------------------------------
  | Load Service
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const service = serviceData.find(
      (item) => String(item.id) === String(id)
    );

    if (service) {
      setFormData({
        vendor: service.vendor,
        category: service.category,
        subCategory: service.subCategory,
        serviceName: service.serviceName,
        price: service.price,
        description: service.description,
        serviceType: service.serviceType,
      });

      setExistingImages(service.images);
    }
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Input Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Remove Existing Image
  |--------------------------------------------------------------------------
  */

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | New Image Selection
  |--------------------------------------------------------------------------
  */

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files || []);

    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    const imageObjects = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...imageObjects]);
  };

  /*
  |--------------------------------------------------------------------------
  | Remove New Image
  |--------------------------------------------------------------------------
  */

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => {
      const imageToRemove = prev[index];

      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return prev.filter((_, imageIndex) => imageIndex !== index);
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Update Service
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Updated Service:", {
      id,
      formData,
      existingImages,
      newImages,
    });

    alert("Service updated successfully.");

    navigate(`/vendor/services/${id}`);
  };

  /*
  |--------------------------------------------------------------------------
  | Cancel
  |--------------------------------------------------------------------------
  */

  const handleCancel = () => {
    navigate(`/vendor/services/${id}`);
  };

  return (
    <div className="edit-service-page">
      <div className="edit-service-card">
        {/* =========================================================
            PAGE TITLE
        ========================================================= */}

        <h1 className="edit-service-title">Add New Services</h1>

        {/* =========================================================
            FORM
        ========================================================= */}

        <form onSubmit={handleSubmit}>
          <div className="edit-service-grid">
            {/* Vendor */}

            <div className="edit-service-field">
              <label>
                Select Vendor <span>*</span>
              </label>

              <select
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                required
              >
                <option value="">Select Vendor</option>

                {vendors.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}

            <div className="edit-service-field">
              <label>
                Select Category <span>*</span>
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Category */}

            <div className="edit-service-field">
              <label>
                Select Sub Category <span>*</span>
              </label>

              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                required
              >
                <option value="">Select Sub Category</option>

                {subCategories.map((subCategory) => (
                  <option key={subCategory} value={subCategory}>
                    {subCategory}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Name */}

            <div className="edit-service-field">
              <label>
                Service Name <span>*</span>
              </label>

              <input
                type="text"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleChange}
                placeholder="Enter service name"
                required
              />
            </div>

            {/* Price */}

            <div className="edit-service-field">
              <label>
                Price <span>*</span>
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                min="0"
                required
              />
            </div>
          </div>

          {/* =========================================================
              DESCRIPTION
          ========================================================= */}

          <div className="edit-service-field edit-service-description">
            <label>
              Description <span>*</span>
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* =========================================================
              SERVICE TYPE
          ========================================================= */}

          <div className="edit-service-field edit-service-service-type">
            <label>
              Service Type <span>*</span>
            </label>

            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
            >
              <option value="">Select Service Type</option>

              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* =========================================================
              EXISTING IMAGES
          ========================================================= */}

          <div className="image-section">
            <div className="image-section-title">
              <span>Existing Images</span>

              <span className="image-count">
                {existingImages.length} images
              </span>
            </div>

            <div className="existing-images-box">
              {existingImages.length > 0 ? (
                existingImages.map((image, index) => (
                  <div className="existing-image-item" key={image + index}>
                    <div className="existing-image-wrapper">
                      <img
                        src={image}
                        alt={`Existing ${index + 1}`}
                      />

                      <button
                        type="button"
                        className="remove-existing-image"
                        onClick={() =>
                          handleRemoveExistingImage(index)
                        }
                      >
                        <FaTimes />
                      </button>
                    </div>

                    <span>Image {index + 1}</span>
                  </div>
                ))
              ) : (
                <div className="no-existing-images">
                  No existing images
                </div>
              )}

              <FaImage className="existing-image-icon" />
            </div>
          </div>

          {/* =========================================================
              ADD NEW IMAGES
          ========================================================= */}

          <div className="image-section new-image-section">
            <div className="image-section-title">
              <span>Add New Images</span>
            </div>

            <div className="new-image-input-wrapper">
              <input
                id="service-new-images"
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                multiple
                onChange={handleNewImages}
              />

              <FaInfoCircle className="new-image-info-icon" />
            </div>

            <p className="image-help-text">
              You can select multiple images (Max 2MB each).
              Supported formats: JPG, JPEG, PNG, GIF WEBP
            </p>

            {/* New Image Preview Area */}

            <div className="new-images-preview-area">
              {newImages.length > 0 &&
                newImages.map((image, index) => (
                  <div
                    className="new-image-preview"
                    key={`${image.file.name}-${index}`}
                  >
                    <img
                      src={image.preview}
                      alt={`New ${index + 1}`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveNewImage(index)
                      }
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* =========================================================
              BUTTONS
          ========================================================= */}

          <div className="edit-service-actions">
            <button
              type="submit"
              className="update-service-button"
            >
              Update Service
            </button>

            <button
              type="button"
              className="cancel-service-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditService;