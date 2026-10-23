import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";

import { useNavigate } from "react-router-dom";

import {
  FaEye,
  FaEyeSlash,
  FaSave,
  FaMapMarkerAlt,
  FaCloudUploadAlt,
  FaExclamationCircle,
  FaFilePdf,
  FaTimes,
} from "react-icons/fa";

import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";

import api from "../../../config/api";

import "./addVendor.css";

const MAX_FILE_SIZE_MB = 5;

// =========================================================
// API SERVICE LAYER (kept inline - move to a service file later)
// =========================================================

const fetchCategoriesApi = async () => {
  const response = await api.get("/admin/categories");
  return response.data;
};

const fetchCitiesApi = async () => {
  const response = await api.get("/admin/cities");
  return response.data;
};

const createVendorApi = async (formData) => {
  const data = new FormData();

  // Basic details
  data.append("name", formData.fullName);
  data.append("email", formData.email);
  data.append("password", formData.password);
  data.append("mobile", formData.mobile);

  // Business details
  data.append("business_name", formData.businessName);
  data.append("hst_number", formData.hstNo);
  data.append("facebook_ink", formData.facebookLink);

  // Category + city ids
  data.append("cat_id", formData.category);
  data.append("city_id", formData.city);

  // Location
  data.append("address", formData.location);
  data.append("lat", formData.latitude);
  data.append("long", formData.longitude);

  // Files
  if (formData.profileImage) {
    data.append("image", formData.profileImage);
  }

  if (formData.businessLogo) {
    data.append("business_logo", formData.businessLogo);
  }

  if (formData.idProof) {
    data.append("id_proof", formData.idProof);
  }

  if (formData.idProofTwo) {
    data.append("id_proof_two", formData.idProofTwo);
  }

  const response = await api.post("/admin/vendors", data);
  return response.data;
};

// =========================================================
// CONSTANTS + HELPERS
// =========================================================

const fileFields = [
  {
    name: "profileImage",
    label: "Profile Image",
    accept: "image/*",
    imageOnly: true,
  },
  {
    name: "businessLogo",
    label: "Business Logo",
    accept: "image/*",
    imageOnly: true,
  },
  { name: "idProof", label: "ID Proof", accept: "image/*,.pdf" },
  { name: "idProofTwo", label: "ID Proof Two", accept: "image/*,.pdf" },
];

const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AddVendor = () => {
  const navigate = useNavigate();

  const { isLoaded: isGoogleMapsLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobile: "",
    businessName: "",
    hstNo: "",
    facebookLink: "",
    category: "",
    city: "",
    location: "",
    latitude: "",
    longitude: "",
    profileImage: null,
    businessLogo: null,
    idProof: null,
    idProofTwo: null,
  });

  // =========================================================
  // API DATA
  // =========================================================

  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // OTHER STATES
  // =========================================================

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [previews, setPreviews] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);

  // =========================================================
  // GET CATEGORIES
  // =========================================================

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const data = await fetchCategoriesApi();

      if (data?.success) {
        setCategories(data.data || []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);

      setApiError(
        error.response?.data?.message || "Failed to load categories.",
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  // =========================================================
  // GET CITIES
  // =========================================================

  const fetchCities = async () => {
    try {
      setLoadingCities(true);

      const data = await fetchCitiesApi();

      if (data?.success) {
        setCities(data.data || []);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error("Fetch cities error:", error);

      setApiError(error.response?.data?.message || "Failed to load cities.");
    } finally {
      setLoadingCities(false);
    }
  };

  // =========================================================
  // LOAD DROPDOWN DATA
  // =========================================================

  useEffect(() => {
    fetchCategories();
    fetchCities();
  }, []);

  // =========================================================
  // IMAGE PREVIEW URLS (created per selected image, cleaned up)
  // =========================================================

  useEffect(() => {
    const urls = {};

    fileFields.forEach(({ name }) => {
      const file = formData[name];

      if (file && file.type.startsWith("image/")) {
        urls[name] = URL.createObjectURL(file);
      }
    });

    setPreviews(urls);

    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [
    formData.profileImage,
    formData.businessLogo,
    formData.idProof,
    formData.idProofTwo,
  ]);

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    if (apiError) {
      setApiError("");
    }
  };

  const handlePlaceChanged = () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setFormData((previous) => ({
      ...previous,
      location: place.formatted_address || place.name || "",
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const handleAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setFormData((previous) => ({
      ...previous,
      latitude: lat,
      longitude: lng,
    }));
  };

  // =========================================================
  // FILE CHANGE (type + size validation)
  // =========================================================

  const handleFileChange = (event, imageOnly) => {
    const { name, files } = event.target;
    const file = files?.[0];

    // allow choosing the same file again after removing it
    event.target.value = "";

    if (!file) {
      return;
    }

    let fileError = "";

    if (imageOnly && !file.type.startsWith("image/")) {
      fileError = "Please choose an image file.";
    } else if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      fileError = `File must be smaller than ${MAX_FILE_SIZE_MB} MB.`;
    }

    if (fileError) {
      setErrors((previous) => ({ ...previous, [name]: fileError }));
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: file,
    }));

    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handleFileRemove = (name) => {
    setFormData((previous) => ({
      ...previous,
      [name]: null,
    }));

    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const handlePreviewOpen = (name) => {
    if (previews[name]) {
      window.open(previews[name], "_blank");
    }
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email ID is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category.";
    }

    if (!formData.city) {
      newErrors.city = "Please select a city.";
    }

    setErrors(newErrors);

    // focus the first invalid field
    const firstInvalid = Object.keys(newErrors)[0];

    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // SAVE VENDOR
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setApiError("");

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const data = await createVendorApi(formData);

      if (data?.success) {
        setSuccessMessage(data.message || "Vendor added successfully.");
        setShowSuccess(true);
      } else {
        setApiError(data?.message || "Failed to add vendor.");
      }
    } catch (error) {
      console.error("Create vendor error:", error);

      setApiError(
        error.response?.data?.message ||
          error.message ||
          "Failed to add vendor.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CANCEL + SUCCESS CLOSE
  // =========================================================

  const handleCancel = () => {
    navigate("/vendor_list");
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/vendor_list");
  };

  return (
    <div className="add-vendor-page">
      {/* =====================================================
          PAGE HEADING + BREADCRUMBS
      ===================================================== */}

      <h2 className="add-vendor-page-title">Add New Vendor</h2>

      <ServiceBreadcrumbs
        className="add-vendor-breadcrumb"
        items={[
          { label: "Vendor List", to: "/vendor_list" },
          { label: "Add Vendor" },
        ]}
      />

      {/* =====================================================
          FORM CARD
      ===================================================== */}

      <div className="add-vendor-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="add-vendor-card-header">
            <h3>Vendor Information</h3>

            <p>Enter vendor information and business details below.</p>
          </div>

          {apiError && (
            <div className="add-vendor-alert" role="alert">
              <FaExclamationCircle />

              <span>{apiError}</span>

              <button
                type="button"
                className="add-vendor-alert-close"
                onClick={() => setApiError("")}
                aria-label="Dismiss message"
              >
                <FaTimes />
              </button>
            </div>
          )}

          <div className="add-vendor-form-body">
            {/* ===============================================
                ACCOUNT DETAILS
            =============================================== */}

            <h4 className="add-vendor-section-title">Account details</h4>

            <div className="add-vendor-form-group">
              <label htmlFor="fullName">
                Full Name <span>*</span>
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your Full Name"
                className={errors.fullName ? "input-error" : ""}
              />

              {errors.fullName && (
                <small className="add-vendor-error">{errors.fullName}</small>
              )}
            </div>

            <div className="add-vendor-form-group">
              <label htmlFor="email">
                Email ID <span>*</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Your Email"
                className={errors.email ? "input-error" : ""}
              />

              {errors.email && (
                <small className="add-vendor-error">{errors.email}</small>
              )}
            </div>

            <div className="add-vendor-form-group">
              <label htmlFor="password">
                Password <span>*</span>
              </label>

              <div className="add-vendor-password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  className={errors.password ? "input-error" : ""}
                />

                <button
                  type="button"
                  className="add-vendor-password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {errors.password && (
                <small className="add-vendor-error">{errors.password}</small>
              )}
            </div>

            <div className="add-vendor-form-group">
              <label htmlFor="mobile">Mobile</label>

              <input
                id="mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile no."
              />
            </div>

            {/* ===============================================
                BUSINESS DETAILS
            =============================================== */}

            <h4 className="add-vendor-section-title">Business details</h4>

            <div className="add-vendor-form-group">
              <label htmlFor="businessName">Business Name</label>

              <input
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Enter your Business Name"
              />
            </div>

            <div className="add-vendor-form-group">
              <label htmlFor="hstNo">HST No.</label>

              <input
                id="hstNo"
                name="hstNo"
                type="text"
                value={formData.hstNo}
                onChange={handleChange}
                placeholder="Enter your HST No."
              />
            </div>

            <div className="add-vendor-form-group">
              <label htmlFor="facebookLink">Facebook Link</label>

              <input
                id="facebookLink"
                name="facebookLink"
                type="url"
                value={formData.facebookLink}
                onChange={handleChange}
                placeholder="Enter your Facebook Link"
              />
            </div>

            <div className="add-vendor-form-group">
              <label htmlFor="category">
                Select Categories <span>*</span>
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? "input-error" : ""}
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories
                    ? "Loading categories..."
                    : "Nothing selected"}
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>

              {errors.category && (
                <small className="add-vendor-error">{errors.category}</small>
              )}
            </div>

            <div className="add-vendor-form-group">
              <label htmlFor="city">
                Select City <span>*</span>
              </label>

              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? "input-error" : ""}
                disabled={loadingCities}
              >
                <option value="">
                  {loadingCities ? "Loading cities..." : "Nothing selected"}
                </option>

                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.city_name || city.name || city.city || "-"}
                  </option>
                ))}
              </select>

              {errors.city && (
                <small className="add-vendor-error">{errors.city}</small>
              )}
            </div>

            {/* ===============================================
                DOCUMENTS (selected file shows below the field)
            =============================================== */}

            <h4 className="add-vendor-section-title">Images and documents</h4>

            {fileFields.map((field) => {
              const file = formData[field.name];
              const previewUrl = previews[field.name];

              return (
                <div className="add-vendor-form-group" key={field.name}>
                  <label htmlFor={field.name}>{field.label}</label>

                  <div
                    className={`add-vendor-file-wrapper ${
                      file ? "has-file" : ""
                    } ${errors[field.name] ? "input-error" : ""}`}
                  >
                    <input
                      id={field.name}
                      name={field.name}
                      type="file"
                      className="add-vendor-file-input"
                      accept={field.accept}
                      onChange={(event) =>
                        handleFileChange(event, field.imageOnly)
                      }
                    />

                    <label
                      htmlFor={field.name}
                      className="add-vendor-file-label"
                    >
                      <FaCloudUploadAlt />

                      <span>{file ? "Change file" : "Choose file"}</span>
                    </label>
                  </div>

                  {errors[field.name] && (
                    <small className="add-vendor-error">
                      {errors[field.name]}
                    </small>
                  )}

                  {file && (
                    <div className="add-vendor-file-preview">
                      {previewUrl ? (
                        <button
                          type="button"
                          className="add-vendor-file-thumb"
                          onClick={() => handlePreviewOpen(field.name)}
                          title="Open full size"
                        >
                          <img src={previewUrl} alt={`${field.label} preview`} />
                        </button>
                      ) : (
                        <span className="add-vendor-file-thumb add-vendor-file-thumb-pdf">
                          <FaFilePdf />
                        </span>
                      )}

                      <div className="add-vendor-file-info">
                        <span className="add-vendor-file-name">
                          {file.name}
                        </span>

                        <span className="add-vendor-file-size">
                          {formatFileSize(file.size)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="add-vendor-file-remove"
                        onClick={() => handleFileRemove(field.name)}
                        aria-label={`Remove ${field.label}`}
                        title="Remove"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ===============================================
                LOCATION
            =============================================== */}

            <div className="add-vendor-location-section">
              <h4 className="add-vendor-section-title">Location</h4>

              <label htmlFor="location">Location Highlight</label>

              <div className="add-vendor-location-input">
                <FaMapMarkerAlt />

                {isGoogleMapsLoaded ? (
                  <Autocomplete
                    onLoad={handleAutocompleteLoad}
                    onPlaceChanged={handlePlaceChanged}
                  >
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Type address..."
                    />
                  </Autocomplete>
                ) : (
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Loading address autocomplete..."
                  />
                )}
              </div>

              <p className="add-vendor-map-hint">
                Search an address or click on the map to drop a pin.
              </p>

              <div className="add-vendor-map-wrapper">
                {isGoogleMapsLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{
                      width: "100%",
                      height: "100%",
                    }}
                    center={{
                      lat: Number(formData.latitude) || 43.130554,
                      lng: Number(formData.longitude) || -80.746666,
                    }}
                    zoom={13}
                    onLoad={handleMapLoad}
                    onClick={handleMapClick}
                  >
                    {formData.latitude && formData.longitude && (
                      <Marker
                        position={{
                          lat: Number(formData.latitude),
                          lng: Number(formData.longitude),
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div className="add-vendor-map-loading">Loading map...</div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              FORM FOOTER
          ================================================= */}

          <div className="add-vendor-form-footer">
            <button
              type="button"
              className="add-vendor-cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-vendor-save-btn"
              disabled={saving}
            >
              {saving ? (
                <span className="add-vendor-spinner" aria-hidden="true" />
              ) : (
                <FaSave />
              )}

              <span>{saving ? "Saving..." : "Save Vendor"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* =====================================================
          SUCCESS MODAL
      ===================================================== */}

      <ServiceSuccessModal
        isOpen={showSuccess}
        title="Vendor added"
        message={successMessage}
        onClose={handleSuccessClose}
      />
    </div>
  );
};

export default AddVendor;