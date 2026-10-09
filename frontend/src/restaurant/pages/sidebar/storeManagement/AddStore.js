import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaStore,
  FaArrowLeft,
  FaSave,
  FaUndo,
  FaMapMarkerAlt,
  FaSearch,
  FaUpload,
  FaEye,
  FaClock,
  FaBuilding,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaLock,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";

import "./addStore.css";
import api from "../../../../config/api";
import Breadcrumbs from "../../common/BreadCrumbs";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";

const AddStore = () => {
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  const defaultCenter = {
    lat: 43.130554,
    lng: -80.746666,
  };

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(null);

  const { isLoaded: isGoogleMapsLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    businessName: "",
    hstNumber: "",
    category: "Restaurants",

    dineIn: false,
    takeAway: false,
    delivery: false,

    deliveryMin: "",
    deliveryMax: "",
    deliveryUnit: "Minutes",

    businessDescription: "",

    city: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",

    latitude: "",
    longitude: "",
    address: "",
  });

  // =========================================================
  // FILE STATE
  // =========================================================

  const [files, setFiles] = useState({
    profilePhoto: null,
    idProof: null,
    businessLicense: null,
    padFile: null,
  });

  // =========================================================
  // UI STATE
  // =========================================================

  const [showPassword, setShowPassword] = useState(false);
  const [mapSearch, setMapSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // =========================================================
  // FETCH CITIES
  // =========================================================

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setCitiesLoading(true);

        const response = await api.get("/restaurant/stores/cities");

        console.log("Cities API Response:", response.data);

        if (!response.data?.success) {
          throw new Error(response.data?.message || "Failed to fetch cities.");
        }

        setCities(response.data.data || []);
      } catch (error) {
        console.error("Fetch Cities Error:", error);
        setCities([]);
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, []);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const handleMapUnmount = () => {
    setMap(null);
  };

  const handleAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const handlePlaceChanged = () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();

    if (!place.geometry?.location) {
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    const address = place.formatted_address || place.name || "";

    const position = {
      lat,
      lng,
    };

    setMapCenter(position);
    setMarkerPosition(position);

    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
      address,
    }));

    if (map) {
      map.panTo(position);
      map.setZoom(16);
    }
  };

  const handleMapClick = (event) => {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    const position = {
      lat,
      lng,
    };

    setMapCenter(position);
    setMarkerPosition(position);

    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================================
  // HANDLE FILE
  // =========================================================

  const handleFileChange = (event, fieldName) => {
    const file = event.target.files?.[0] || null;

    setFiles((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const handleReset = () => {
    setFormData({
      businessName: "",
      hstNumber: "",
      category: "Restaurants",

      dineIn: false,
      takeAway: false,
      delivery: false,

      deliveryMin: "",
      deliveryMax: "",
      deliveryUnit: "Minutes",

      businessDescription: "",

      city: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",

      latitude: "",
      longitude: "",
      address: "",
    });

    setFiles({
      profilePhoto: null,
      idProof: null,
      businessLicense: null,
      padFile: null,
    });

    setMapSearch("");
  };

  // =========================================================
  // SAVE STORE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // At least one dining option required
    const diningOptions = [];

    if (formData.dineIn) diningOptions.push("dine_in");
    if (formData.takeAway) diningOptions.push("take_away");
    if (formData.delivery) diningOptions.push("delivery");

    if (diningOptions.length === 0) {
      alert("Please select at least one dining option.");
      return;
    }

    // Required files
    if (!files.profilePhoto) {
      alert("Please select Profile Photo.");
      return;
    }

    if (!files.idProof) {
      alert("Please select ID Proof.");
      return;
    }

    if (!files.businessLicense) {
      alert("Please select Business License.");
      return;
    }

    if (!files.padFile) {
      alert("Please select PAD File.");
      return;
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      alert(
        "Password must be at least 8 characters and contain uppercase, lowercase, number and special character.",
      );
      return;
    }

    setIsSaving(true);

    try {
      const data = new FormData();

      // ==============================
      // BASIC INFORMATION
      // ==============================

      data.append("business_name", formData.businessName);
      data.append("hst_number", formData.hstNumber);

      // Old PHP uses category ID 118
      data.append("cat_id", "118");

      // Send each dining option separately
      diningOptions.forEach((option) => {
        data.append("dining_option", option);
      });

      data.append("minimum_delivery_time", formData.deliveryMin);

      data.append("maximum_delivery_time", formData.deliveryMax);

      data.append("delivery_time_type", formData.deliveryUnit);

      data.append("business_description", formData.businessDescription);

      // ==============================
      // GENERAL SETUP
      // ==============================

      data.append("city_id", formData.city);

      data.append("first_name", formData.firstName);
      data.append("last_name", formData.lastName);
      data.append("email", formData.email);
      data.append("mobile", formData.phone);
      data.append("password", formData.password);

      // ==============================
      // LOCATION
      // ==============================

      data.append("latitude", formData.latitude);
      data.append("longitude", formData.longitude);
      data.append("restaurant_address", formData.address);

      // ==============================
      // FILES
      // ==============================

      data.append("profilePhoto", files.profilePhoto);

      data.append("idProof", files.idProof);

      data.append("businessLicense", files.businessLicense);

      data.append("padFile", files.padFile);

      // ==============================
      // API REQUEST
      // ==============================

      const response = await api.post("/restaurant/stores/add", data);

      console.log("Add Store Response:", response.data);

      if (response.data?.success) {
        setShowSuccessModal(true);
      } else {
        alert(response.data?.message || "Failed to add store.");
      }
    } catch (error) {
      console.error("Add Store API Error:", error);

      const message =
        error.response?.data?.message ||
        "Something went wrong while adding the store.";

      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================
  // MAP SEARCH
  // =========================================================

  const handleMapSearch = (event) => {
    event.preventDefault();

    if (!mapSearch.trim()) {
      return;
    }

    /*
      Google Maps / Mapbox API integration can be added here later.

      Example future flow:

      1. Search address
      2. Get latitude
      3. Get longitude
      4. Move map marker
      5. Auto-fill restaurant address
    */

    console.log("Map search:", mapSearch);
  };

  return (
    <>
      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={[
            {
              label: "Store Management",
            },
            {
              label: "Add Store",
            },
          ]}
        />
      </div>

      <div className="add-store-page">
        {/* =====================================================
          PAGE HEADER
      ===================================================== */}

        <div className="add-store-page-header">
          <div className="add-store-heading-wrapper">
            <div className="add-store-heading-icon">
              <FaStore />
            </div>

            <div>
              <h1>Add New Store</h1>

              <p>
                Create a new restaurant store and configure its business
                information.
              </p>
            </div>
          </div>

          <div className="add-store-header-actions">
            <button
              type="button"
              className="add-store-back-btn"
              onClick={() => navigate("/restaurant/stores_list")}
            >
              <FaArrowLeft />
              <span>Back to Stores</span>
            </button>
          </div>
        </div>

        {/* =====================================================
          FORM
      ===================================================== */}

        <form className="add-store-form" onSubmit={handleSubmit}>
          {/* ===================================================
            BASIC INFORMATION
        =================================================== */}

          <section className="add-store-section">
            <div className="add-store-section-header">
              <div className="section-header-icon">
                <FaBuilding />
              </div>

              <div>
                <h2>Basic Information</h2>

                <p>Enter the basic details of your restaurant business.</p>
              </div>
            </div>

            <div className="add-store-section-body">
              <div className="form-grid form-grid-two">
                {/* Business Name */}

                <div className="form-group">
                  <label htmlFor="businessName">
                    Business Name <span>*</span>
                  </label>

                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g. The Spice Garden"
                    required
                  />
                </div>

                {/* HST */}

                <div className="form-group">
                  <label htmlFor="hstNumber">HST Number</label>

                  <input
                    id="hstNumber"
                    name="hstNumber"
                    type="text"
                    value={formData.hstNumber}
                    onChange={handleChange}
                    placeholder="Enter HST number"
                  />
                </div>

                {/* Category */}

                <div className="form-group">
                  <label htmlFor="category">
                    Select Category <span>*</span>
                  </label>

                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="Restaurants">Restaurants</option>
                  </select>
                </div>

                {/* Dining Options */}

                <div className="form-group">
                  <label>
                    Dining Option <span>*</span>
                  </label>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="dineIn"
                        checked={formData.dineIn}
                        onChange={handleChange}
                      />

                      <span>Dine In</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="takeAway"
                        checked={formData.takeAway}
                        onChange={handleChange}
                      />

                      <span>Take Away</span>
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="delivery"
                        checked={formData.delivery}
                        onChange={handleChange}
                      />

                      <span>Delivery</span>
                    </label>
                  </div>
                </div>

                {/* Delivery Time */}

                <div className="form-group form-group-full">
                  <label>
                    <FaClock className="inline-label-icon" />
                    Estimated Delivery Time <span>*</span>
                  </label>

                  <div className="delivery-time-row">
                    <input
                      name="deliveryMin"
                      type="number"
                      min="0"
                      value={formData.deliveryMin}
                      onChange={handleChange}
                      placeholder="Min"
                    />

                    <input
                      name="deliveryMax"
                      type="number"
                      min="0"
                      value={formData.deliveryMax}
                      onChange={handleChange}
                      placeholder="Max"
                    />

                    <select
                      name="deliveryUnit"
                      value={formData.deliveryUnit}
                      onChange={handleChange}
                    >
                      <option value="Minutes">Minutes</option>
                    </select>
                  </div>
                </div>

                {/* Description */}

                <div className="form-group form-group-full">
                  <label htmlFor="businessDescription">
                    Business Description <span>*</span>
                  </label>

                  <textarea
                    id="businessDescription"
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleChange}
                    placeholder="Describe your restaurant business..."
                    rows="5"
                    required
                  />

                  <div className="field-helper">
                    <FaInfoCircle />
                    <span>
                      Add a short description that helps customers understand
                      your restaurant.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================
            GENERAL SETUP
        =================================================== */}

          <section className="add-store-section">
            <div className="add-store-section-header">
              <div className="section-header-icon">
                <FaUser />
              </div>

              <div>
                <h2>General Setup</h2>

                <p>Configure the restaurant owner and account information.</p>
              </div>
            </div>

            <div className="add-store-section-body">
              <div className="form-grid form-grid-three">
                {/* City */}

                <div className="form-group">
                  <label htmlFor="city">
                    City Operation <span>*</span>
                  </label>

                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    disabled={citiesLoading}
                  >
                    <option value="">
                      {citiesLoading ? "Loading cities..." : "Select City"}
                    </option>

                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.city_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* First Name */}

                <div className="form-group">
                  <label htmlFor="firstName">
                    First Name <span>*</span>
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                  />
                </div>

                {/* Last Name */}

                <div className="form-group">
                  <label htmlFor="lastName">
                    Last Name <span>*</span>
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    required
                  />
                </div>

                {/* Email */}

                <div className="form-group">
                  <label htmlFor="email">
                    <FaEnvelope className="inline-label-icon" />
                    Email <span>*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="owner@example.com"
                    required
                  />
                </div>

                {/* Phone */}

                <div className="form-group">
                  <label htmlFor="phone">
                    <FaPhoneAlt className="inline-label-icon" />
                    Phone <span>*</span>
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                {/* Password */}

                <div className="form-group">
                  <label htmlFor="password">
                    <FaLock className="inline-label-icon" />
                    Password <span>*</span>
                  </label>

                  <div className="password-input-wrapper">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter Password"
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>

                {/* Profile Photo */}

                <div className="form-group">
                  <label>
                    Profile Photo <span>*</span>
                  </label>

                  <label className="file-upload-box">
                    <FaUpload />

                    <span>
                      {files.profilePhoto
                        ? files.profilePhoto.name
                        : "Choose Profile Photo"}
                    </span>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(event) =>
                        handleFileChange(event, "profilePhoto")
                      }
                    />
                  </label>

                  <small>Recommended: 1200 × 400px</small>
                </div>

                {/* ID Proof */}

                <div className="form-group">
                  <label>
                    ID Proof <span>*</span>
                  </label>

                  <label className="file-upload-box">
                    <FaUpload />

                    <span>
                      {files.idProof ? files.idProof.name : "Choose ID Proof"}
                    </span>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(event) => handleFileChange(event, "idProof")}
                    />
                  </label>

                  <small>Allowed: PDF, JPG, JPEG, PNG</small>
                </div>

                {/* Business License */}

                <div className="form-group">
                  <label>
                    Business License <span>*</span>
                  </label>

                  <label className="file-upload-box">
                    <FaUpload />

                    <span>
                      {files.businessLicense
                        ? files.businessLicense.name
                        : "Choose Business License"}
                    </span>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(event) =>
                        handleFileChange(event, "businessLicense")
                      }
                    />
                  </label>

                  <small>Allowed: PDF, JPG, JPEG, PNG</small>
                </div>

                {/* PAD File */}

                <div className="form-group">
                  <label>
                    PAD File <span>*</span>
                  </label>

                  <label className="file-upload-box">
                    <FaUpload />

                    <span>
                      {files.padFile ? files.padFile.name : "Choose PAD File"}
                    </span>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(event) => handleFileChange(event, "padFile")}
                    />
                  </label>

                  <small>Allowed: PDF, JPG, JPEG, PNG</small>
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================
            LOCATION
        =================================================== */}

          <section className="add-store-section">
            <div className="add-store-section-header location-header">
              <div className="section-header-icon location-icon">
                <FaMapMarkerAlt />
              </div>

              <div>
                <h2>Set Business Location</h2>

                <p>
                  Search for your address or select a location directly on the
                  map.
                </p>
              </div>

              <div className="location-status">
                <FaCheckCircle />
                <span>Location ready</span>
              </div>
            </div>

            <div className="add-store-section-body">
              {/* Map Search */}

              <div className="map-search">
                {isGoogleMapsLoaded ? (
                  <Autocomplete
                    onLoad={handleAutocompleteLoad}
                    onPlaceChanged={handlePlaceChanged}
                  >
                    <div className="map-search-input">
                      <FaSearch />

                      <input
                        type="text"
                        value={mapSearch}
                        onChange={(event) => setMapSearch(event.target.value)}
                        placeholder="Search address, city, or landmark..."
                      />
                    </div>
                  </Autocomplete>
                ) : (
                  <div className="map-search-input">
                    <FaSearch />

                    <input
                      type="text"
                      value={mapSearch}
                      onChange={(event) => setMapSearch(event.target.value)}
                      placeholder="Loading Google Maps..."
                      disabled
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleMapSearch}
                  disabled={!isGoogleMapsLoaded}
                >
                  <FaSearch />
                  <span>Search</span>
                </button>
              </div>

              {/* Map Placeholder */}

              <div className="restaurant-map">
                {!isGoogleMapsLoaded ? (
                  <div className="map-loading">Loading Google Maps...</div>
                ) : (
                  <GoogleMap
                    mapContainerStyle={{
                      width: "100%",
                      height: "100%",
                    }}
                    center={mapCenter}
                    zoom={13}
                    onLoad={handleMapLoad}
                    onUnmount={handleMapUnmount}
                    onClick={handleMapClick}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: true,
                    }}
                  >
                    {markerPosition && <Marker position={markerPosition} />}
                  </GoogleMap>
                )}
              </div>

              <div className="map-helper-text">
                <FaInfoCircle />

                <span>
                  Map integration can be connected later with Google Maps.
                  Coordinates and address will be automatically filled when a
                  location is selected.
                </span>
              </div>

              {/* Coordinates */}

              <div className="form-grid form-grid-two location-fields">
                <div className="form-group">
                  <label htmlFor="latitude">Latitude</label>

                  <input
                    id="latitude"
                    name="latitude"
                    type="text"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="Auto-filled latitude"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="longitude">Longitude</label>

                  <input
                    id="longitude"
                    name="longitude"
                    type="text"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="Auto-filled longitude"
                  />
                </div>
              </div>

              {/* Address */}

              <div className="form-group">
                <label htmlFor="address">
                  Restaurant Address <span>*</span>
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full restaurant address will appear here..."
                  rows="4"
                  required
                />
              </div>
            </div>
          </section>

          {/* ===================================================
            FORM ACTIONS
        =================================================== */}

          <div className="add-store-form-actions">
            <button
              type="button"
              className="reset-store-btn"
              onClick={handleReset}
            >
              <FaUndo />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              className="save-store-btn"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="button-spinner"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Save Information</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <SuccessModal
        show={showSuccessModal}
        title="Store Added Successfully"
        message="The restaurant store has been added successfully."
        buttonText="OK"
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/restaurant/stores_list");
        }}
      />
    </>
  );
};

export default AddStore;
