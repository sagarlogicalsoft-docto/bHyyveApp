import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  Circle,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";

import { Link, useNavigate } from "react-router-dom";

import {
  FaEye,
  FaEyeSlash,
  FaSave,
  FaMapMarkerAlt,
  FaCloudUploadAlt,
} from "react-icons/fa";

import { IoIosArrowForward } from "react-icons/io";

import api from "../../../config/api";

import "./addVendor.css";

const AddVendor = () => {
  const navigate = useNavigate();

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
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);

  // =========================================================
  // GET CATEGORIES
  // =========================================================

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const response = await api.get("/vendor/categories");

      if (response.data?.success) {
        setCategories(response.data.data || []);
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

      const response = await api.get("/vendor/cities");

      if (response.data?.success) {
        setCities(response.data.data || []);
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
  // FILE CHANGE
  // =========================================================

  const handleFileChange = (event) => {
    const { name, files } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: files?.[0] || null,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
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

      // -----------------------------------------------------
      // CREATE MULTIPART FORM DATA
      // -----------------------------------------------------

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

      // -----------------------------------------------------
      // CATEGORY ID
      // -----------------------------------------------------

      data.append("cat_id", formData.category);

      // -----------------------------------------------------
      // CITY ID
      // -----------------------------------------------------

      data.append("city_id", formData.city);

      // -----------------------------------------------------
      // LOCATION
      // -----------------------------------------------------

      data.append("address", formData.location);
      data.append("lat", formData.latitude);
      data.append("long", formData.longitude);

      // -----------------------------------------------------
      // FILES
      // -----------------------------------------------------

      if (formData.profileImage) {
        data.append("image", formData.profileImage);
      }

      if (formData.idProof) {
        data.append("id_proof", formData.idProof);
      }

      if (formData.idProofTwo) {
        data.append("id_proof_two", formData.idProofTwo);
      }

      // -----------------------------------------------------
      // DEBUG
      // -----------------------------------------------------

      console.log("Submitting Vendor:");

      for (const [key, value] of data.entries()) {
        console.log(key, value);
      }

      // -----------------------------------------------------
      // POST API
      // -----------------------------------------------------

      const response = await api.post("/vendor/vendors", data);

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      if (response.data?.success) {
        alert(response.data.message || "Vendor added successfully.");

        navigate("/vendor_list");
      } else {
        setApiError(response.data?.message || "Failed to add vendor.");
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
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    navigate("/vendor_list");
  };

  const { isLoaded: isGoogleMapsLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  return (
    <div className="add-vendor-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="add-vendor-page-header">
        <div>
          <h2 className="add-vendor-page-title">Add New Vendor</h2>

          <div className="add-vendor-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <Link to="/vendor_list">Vendor List</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="add-vendor-breadcrumb-active">Add Vendor</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          FORM CARD
      ===================================================== */}

      <div className="add-vendor-card">
        <form onSubmit={handleSubmit}>
          {/* =================================================
              CARD HEADER
          ================================================= */}

          <div className="add-vendor-card-header">
            <div>
              <h3>Add New Vendor</h3>

              <p>Enter vendor information and business details below.</p>
            </div>
          </div>

          {/* =================================================
              API ERROR
          ================================================= */}

          {apiError && (
            <div
              className="add-vendor-error"
              style={{
                margin: "12px 20px",
                display: "block",
              }}
            >
              {apiError}
            </div>
          )}

          {/* =================================================
              FORM BODY
          ================================================= */}

          <div className="add-vendor-form-body">
            {/* ===============================================
                ROW 1
            =============================================== */}

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

            {/* ===============================================
                ROW 2
            =============================================== */}

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

            {/* ===============================================
                ROW 3
            =============================================== */}

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

            {/* CATEGORY */}

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

            {/* CITY */}

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
                ROW 4 - FILES
            =============================================== */}

            <div className="add-vendor-form-group">
              <label htmlFor="profileImage">Profile Image</label>

              <div className="add-vendor-file-wrapper">
                <FaCloudUploadAlt />

                <input
                  id="profileImage"
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {formData.profileImage && (
                <small className="add-vendor-file-name">
                  {formData.profileImage.name}
                </small>
              )}
            </div>

            <div className="add-vendor-form-group">
              <label htmlFor="idProof">ID Proof</label>

              <div className="add-vendor-file-wrapper">
                <FaCloudUploadAlt />

                <input
                  id="idProof"
                  name="idProof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
              </div>

              {formData.idProof && (
                <small className="add-vendor-file-name">
                  {formData.idProof.name}
                </small>
              )}
            </div>

            <div className="add-vendor-form-group">
              <label htmlFor="idProofTwo">ID Proof Two</label>

              <div className="add-vendor-file-wrapper">
                <FaCloudUploadAlt />

                <input
                  id="idProofTwo"
                  name="idProofTwo"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
              </div>

              {formData.idProofTwo && (
                <small className="add-vendor-file-name">
                  {formData.idProofTwo.name}
                </small>
              )}
            </div>

            {/* ===============================================
                LOCATION
            =============================================== */}

            <div className="add-vendor-location-section">
              <label htmlFor="location">Location Highlight</label>

              <div className="add-vendor-location-input">
  <FaMapMarkerAlt />

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
</div>

              {/* =============================================
                  MAP
              ============================================= */}

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
                  <div>Loading map...</div>
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
              <FaSave />

              <span>{saving ? "Saving..." : "Save Vendor"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendor;
