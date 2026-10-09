import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import "./addServices.css";

const AddServices = () => {
  const navigate = useNavigate();

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    vendor: "",
    category: "",
    subCategory: "",
    serviceName: "",
    price: "",
    description: "",
    serviceType: "",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // =========================================================
  // VENDORS
  // =========================================================

  const vendors = [
    "Velvet Touch Cleaning Co.",
    "Elite Clean Group",
    "Happy Homes Cleaning Company",
    "TrueFresh Cleaning Systems",
    "KlarGlanz Detailing",
    "Maison de L’Auto",
    "The Auto Detailing Guild",
    "TidyTech Auto Detailing",
    "Velare",
    "Blossom & Blade",
    "Ritin Goel",
    "One More Bite",
    "bHyyve Marketplace",
    "ActiveAxis Physiotherapy",
    "Apex Dominion Combat Club",
    "Vanguard Scholars Consortium",
    "Premier Occasions Studio",
    "Nectar Financing Co.",
    "Anshin Moving Company",
    "SnowMow Pros",
    "Allstar Handyman Services",
    "Rigaudson Frederic",
    "Horace Morgan",
    "sdfds sdf",
    "wresfdzcx erafsdXAZ",
    "San A",
    "Aman Sharma",
    "Robin Christopher",
    "Robin Christopher",
    "shikha dev",
    "Test 1",
    "tt t",
    "hu Bubión",
    "Kaif Ali",
    "Kaif Ali",
    "Test Test",
    "Test Test",
    "Test Test",
    "Test Abc",
    "Dryvyn",
    "The Bloomery",
    "BingeLab",
    "Testing Developer",
    "Testing Data",
    "Rahul Developer",
    "Ravi Singh",
    "Michael Johnson",
    "The Grand Gift Co.",
    "Hailey Maki",
    "Jasmeet Mukar",
    "Sagar Malik",
    "Sagar Malik",
    "Ironhill Construction Company",
    "Oven to Market Co.",
    "Listing Lens Co.",
  ];

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = [
    "Cleaning",
    "Construction",
    "Real Estate",
    "Food & Beverage",
    "Retail",
    "Health & Wellness",
    "Fitness",
    "Automotive",
    "Technology",
    "Marketing & Advertising",
    "Consulting",
    "Education & Tutoring",
    "Event Planning",
    "Financial Services",
    "Legal Services",
    "Beauty & Personal Care",
    "Home Services",
    "Manufacturing",
    "Logistics & Transportation",
    "Hospitality & Tourism",
    "Agriculture",
    "Arts & Entertainment",
    "Pet Services",
    "Telecommunications",
    "Human Resources",
    "Security Services",
    "Waste Management",
    "Renewable Energy",
    "Insurance",
    "Software Development",
    "Gaming",
    "Medical & Healthcare",
    "Architecture & Design",
    "Photography & Videography",
    "Publishing & Printing",
    "Writing & Editing",
    "Rental Services",
    "Wholesale & Distribution",
    "Landscaping",
    "Property Management",
    "Moving",
    "Handy Man Services",
    "Streaming",
    "Gas Line Services",
    "Restaurants",
    "Car Rental",
    "Florist",
  ];

  // =========================================================
  // SUB CATEGORIES
  // =========================================================

  const subCategories = [
    "Property Management - Multi-unit",
    "Property Management - Apartment Building",
    "Property Management - Commercial",
    "Property Management - Single Family",
    "Cleaning Services",
    "Outdoor Christmas Light Installation, Hourly",
    "Outdoor Potlight Installation, Hourly",
    "Moving",
    "Renovation",
    "Grass Cutting",
    "Snow Removal",
    "Detailing",
    "Free quote",
    "Ceramic Coating",
    "Basic",
    "Residential Real Estate",
    "Bakery",
    "Cookies",
    "Cupcakes",
    "Electronics",
    "Physiotherapy",
    "Mixed Martial Arts",
    "Tutoring",
    "Corporate Event Planning",
    "Credit Cards",
    "bHyyve Wallet",
    "General, hourly",
    "Brownies",
    "Cakes",
    "TV",
    "Streaming Devices",
    "Streaming Services",
    "Streamify Bundle",
    "Warranty",
    "Recommended",
    "Sandwich & Burger",
    "Cakes & Pastries",
    "Luxury Car Rental",
    "Roses",
    "Bubble Tea",
    "Gifts",
    "Christmas Gifts",
    "Milk Tea",
    "Fruit Tea",
    "Smoothie",
    "Bakery",
    "Cookies",
    "Pizza",
    "Real Estate Photography",
  ];

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // IMAGE CHANGE
  // =========================================================

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const validFiles = [];
    const previews = [];

    selectedFiles.forEach((file) => {
      const maxSize = 2 * 1024 * 1024;

      if (file.size > maxSize) {
        alert(`${file.name} is larger than 2MB.`);
        return;
      }

      validFiles.push(file);

      previews.push({
        name: file.name,
        url: URL.createObjectURL(file),
      });
    });

    setImages(validFiles);
    setImagePreviews(previews);
  };

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  const handleRemoveImage = (index) => {
    setImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );

    setImagePreviews((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.vendor) {
      alert("Please select vendor.");
      return;
    }

    if (!formData.category) {
      alert("Please select category.");
      return;
    }

    if (!formData.subCategory) {
      alert("Please select sub category.");
      return;
    }

    if (!formData.serviceName.trim()) {
      alert("Please enter service name.");
      return;
    }

    if (!formData.price) {
      alert("Please enter price.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please enter description.");
      return;
    }

    if (!formData.serviceType) {
      alert("Please select service type.");
      return;
    }

    if (images.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    // =======================================================
    // BACKEND READY
    // =======================================================
    // Later API integration can use this FormData directly.
    //
    // const payload = new FormData();
    //
    // payload.append("vendor", formData.vendor);
    // payload.append("category", formData.category);
    // payload.append("subCategory", formData.subCategory);
    // payload.append("serviceName", formData.serviceName);
    // payload.append("price", formData.price);
    // payload.append("description", formData.description);
    // payload.append("serviceType", formData.serviceType);
    //
    // images.forEach((image) => {
    //   payload.append("images", image);
    // });
    //
    // await serviceApi.createService(payload);

    console.log("Service Data:", formData);
    console.log("Service Images:", images);

    alert("Service added successfully.");

    navigate("/services");
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    navigate("/services");
  };

  return (
    <div className="add-services-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="add-services-page-header">
        <div>
          <h2 className="add-services-page-title">
            Add New Services
          </h2>

          <div className="add-services-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <Link to="/services">
              All Services
            </Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="add-services-breadcrumb-active">
              Add New Services
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          FORM CARD
      ===================================================== */}

      <div className="add-services-card">

        <form onSubmit={handleSubmit}>

          <div className="add-services-form-grid">

            {/* VENDOR */}

            <div className="add-services-form-group">
              <label htmlFor="vendor">
                Select Vendor <span>*</span>
              </label>

              <select
                id="vendor"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
              >
                <option value="">
                  .. Select Vendor ..
                </option>

                <option value="all">
                  All Vendor
                </option>

                {vendors.map((vendor, index) => (
                  <option
                    key={`${vendor}-${index}`}
                    value={vendor}
                  >
                    {vendor}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}

            <div className="add-services-form-group">
              <label htmlFor="category">
                Select Category <span>*</span>
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">
                  .. Select Category ..
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* SUB CATEGORY */}

            <div className="add-services-form-group">
              <label htmlFor="subCategory">
                Select Sub Category <span>*</span>
              </label>

              <select
                id="subCategory"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
              >
                <option value="">
                  .. Select Sub Category ..
                </option>

                {subCategories.map((subCategory, index) => (
                  <option
                    key={`${subCategory}-${index}`}
                    value={subCategory}
                  >
                    {subCategory}
                  </option>
                ))}
              </select>
            </div>

            {/* SERVICE NAME */}

            <div className="add-services-form-group">
              <label htmlFor="serviceName">
                Service Name <span>*</span>
              </label>

              <input
                id="serviceName"
                type="text"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleChange}
                placeholder="Enter service name"
              />
            </div>

            {/* PRICE */}

            <div className="add-services-form-group">
              <label htmlFor="price">
                Price <span>*</span>
              </label>

              <input
                id="price"
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
              />
            </div>

            {/* SERVICE TYPE */}

            <div className="add-services-form-group">
              <label htmlFor="serviceType">
                Service Type <span>*</span>
              </label>

              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
              >
                <option value="">
                  Select Service Type
                </option>

                <option value="Home Service">
                  Home Service
                </option>

                <option value="Onsite Service">
                  Onsite Service
                </option>

                <option value="Both">
                  Both
                </option>
              </select>
            </div>

            {/* DESCRIPTION */}

            <div className="add-services-form-group add-services-full-width">
              <label htmlFor="description">
                Description <span>*</span>
              </label>

              <textarea
                id="description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter service description"
              />
            </div>

            {/* IMAGES */}

            <div className="add-services-form-group add-services-full-width">
              <label htmlFor="serviceImages">
                Images (Multiple) <span>*</span>
              </label>

              <div className="add-services-file-info">
                You can select multiple images (Max: 2MB each)
              </div>

              <input
                id="serviceImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />

              {/* IMAGE PREVIEWS */}

              {imagePreviews.length > 0 && (
                <div className="add-services-image-preview-container">

                  {imagePreviews.map((image, index) => (
                    <div
                      className="add-services-image-preview"
                      key={`${image.name}-${index}`}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="add-services-remove-image"
                      >
                        ×
                      </button>

                      <div className="add-services-image-name">
                        {image.name}
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>

          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="add-services-actions">

            <button
              type="submit"
              className="add-services-submit-btn"
            >
              Add Service
            </button>

            <button
              type="button"
              className="add-services-cancel-btn"
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

export default AddServices;