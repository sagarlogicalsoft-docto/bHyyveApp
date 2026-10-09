import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaUpload,
  FaInfoCircle,
  FaRedo,
  FaSave,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaFileImage,
  FaMap,
} from "react-icons/fa";
import "./storeEdit.css";
import { getImage } from "../../../../Components/utils/images";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";
import {
  GoogleMap,
  MarkerF,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import Breadcrumbs from "../../common/BreadCrumbs";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const BACKEND_URL =
  process.env.REACT_APP_API_BASE_URL?.replace("/api", "") ||
  "http://localhost:5000";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: "100%",
  height: "600px",
};

const defaultMapCenter = {
  lat: 43.130554,
  lng: -80.746666,
};

const getFileUrl = (fileName) => {
  if (!fileName) return "";

  return `${BACKEND_URL}/uploads/${fileName}`;
};

const StoreEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // =========================================================
  // FORM STATE
  // =========================================================
  const [formData, setFormData] = useState({
    businessName: "Doughlicious Pizzeria",
    hstNumber: "RT123456789",
    category: "Restaurants",

    dineIn: false,
    takeAway: true,
    delivery: true,

    deliveryMin: "20",
    deliveryMax: "60",
    deliveryUnit: "Minutes",

    businessDescription:
      "Doughlicious Pizzeria serves up irresistible, hand-crafted pizzas made with fresh ingredients and perfectly stretched, hand-tossed dough. From timeless classics to bold specialty pies, every slice is baked to crispy, cheesy perfection. Whether you're grabbing a quick lunch slice or feeding the whole family, Doughlicious Pizzeria brings bold flavor and good vibes to every visit.",

    city: "",
    fullName: "Sagar Malik",
    email: "business+1@bhyvve.com",
    mobile: "9054958888",
    password: "Restaurant@123",

    address: "7700 Hurontario St, Brampton, ON L6Y 4M3, Canada",

    latitude: "43.659294",
    longitude: "-79.725695",
  });

  // =========================================================
  // IMAGE STATE
  // =========================================================
  const [documents, setDocuments] = useState({
    profilePhoto: null,
    idProof: null,
    businessLicense: null,
    padFile: null,
  });
  const [existingFiles, setExistingFiles] = useState({
    profilePhoto: "",
    idProof: "",
    businessLicense: "",
    padFile: "",
  });

  // =========================================================
  // PASSWORD VISIBILITY
  // =========================================================
  const [showPassword, setShowPassword] = useState(false);

  // =========================================================
  // MAP SEARCH
  // =========================================================
  const [mapSearch, setMapSearch] = useState("");
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultMapCenter);

  const { isLoaded: isGoogleMapsLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    const fetchStore = async () => {
      if (!id) {
        setError("Store ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/restaurant/stores/${id}`);

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to fetch store information.",
          );
        }

        const store = result.data;

        if (!store) {
          throw new Error("Store information not found.");
        }

        const storeLat = parseFloat(store.lat);
        const storeLng = parseFloat(store.long);

        if (!Number.isNaN(storeLat) && !Number.isNaN(storeLng)) {
          setMapCenter({
            lat: storeLat,
            lng: storeLng,
          });
        }

        setExistingFiles({
          profilePhoto: store.image || "",
          idProof: store.id_proof || "",
          businessLicense: store.id_proof_two || "",
          padFile: store.pad_file || "",
        });

        const diningOptions = String(store.dining_option || "")
          .split(",")
          .map((item) => item.trim().toLowerCase());

        setFormData({
          businessName: store.business_name || "",
          hstNumber: store.hst_number || "",
          category: String(store.cat_id || ""),

          dineIn: diningOptions.includes("dine_in"),
          takeAway: diningOptions.includes("take_away"),
          delivery: diningOptions.includes("delivery"),

          deliveryMin: String(store.minimum_delivery_time || ""),
          deliveryMax: String(store.maximum_delivery_time || ""),
          deliveryUnit: store.delivery_time_type || "Minutes",

          businessDescription: store.business_description || "",

          city: String(store.city_id || ""),
          fullName: store.name || "",
          email: store.email_id || "",
          mobile: store.mobile || "",
          password: store.password || "",

          address: store.restaurant_address || "",

          latitude: String(store.lat || ""),
          longitude: String(store.long || ""),
        });
      } catch (error) {
        console.error("Fetch Store Error:", error);
        setError(error.message || "Failed to load store.");
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [id]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/restaurant/stores/cities`,
        );

        const result = await response.json();

        console.log("Cities API Response:", result);

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch cities.");
        }

        setCities(result.data || []);
      } catch (error) {
        console.error("Fetch Cities Error:", error);
        setCities([]);
      }
    };

    fetchCities();
  }, []);
  // =========================================================
  // GOOGLE MAP HELPERS
  // =========================================================

  const getCurrentMapPosition = () => {
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return {
        lat,
        lng,
      };
    }

    return defaultMapCenter;
  };

  const updateMapLocation = (lat, lng, address = null) => {
    const newPosition = {
      lat,
      lng,
    };

    // Map + marker position
    setMapCenter(newPosition);

    // Form fields
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      ...(address !== null ? { address } : {}),
    }));

    // Map ko new location par le jao
    if (map) {
      map.panTo(newPosition);
    }
  };

  const reverseGeocode = (lat, lng) => {
    // Coordinates immediately update
    updateMapLocation(lat, lng);

    if (!window.google || !window.google.maps) {
      console.error("Google Maps is not loaded.");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      {
        location: {
          lat: lat,
          lng: lng,
        },
      },
      (results, status) => {
        console.log("========== REVERSE GEOCODE ==========");
        console.log("Latitude:", lat);
        console.log("Longitude:", lng);
        console.log("Status:", status);
        console.log("Results:", results);

        if (status === "OK" && results && results.length > 0) {
          const address = results[0].formatted_address;

          console.log("Address found:", address);

          updateMapLocation(lat, lng, address);
        } else {
          console.error("Google Geocoding failed:", status);
        }
      },
    );
  };

  const handleMapClick = (event) => {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    console.log("Map clicked:", {
      lat,
      lng,
    });

    reverseGeocode(lat, lng);
  };

  const handleMarkerDragEnd = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    reverseGeocode(lat, lng);
  };

  const handleAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const handlePlaceChanged = () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    const address = place.formatted_address || place.name || "";

    updateMapLocation(lat, lng, address);

    if (map) {
      map.panTo({
        lat,
        lng,
      });

      map.setZoom(16);
    }
  };

  const handleSearch = () => {
    const searchText = mapSearch.trim();

    if (!searchText) {
      return;
    }

    if (!window.google || !window.google.maps) {
      console.error("Google Maps is not loaded.");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      {
        address: searchText,
      },
      (results, status) => {
        console.log("========== SEARCH GEOCODE ==========");
        console.log("Search:", searchText);
        console.log("Status:", status);
        console.log("Results:", results);

        if (status === "OK" && results?.[0]) {
          const location = results[0].geometry.location;

          const lat = location.lat();
          const lng = location.lng();

          const address = results[0].formatted_address || searchText;

          updateMapLocation(lat, lng, address);

          // Search ke baad map zoom
          if (map) {
            map.panTo({
              lat,
              lng,
            });

            map.setZoom(16);
          }

          // Search input me actual resolved address
          setMapSearch(address);
        } else {
          console.error("Location search failed:", status);
          setError(`Unable to find this location. (${status})`);
        }
      },
    );
  };

  // =========================================================
  // HANDLE INPUT
  // =========================================================
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
    const file = event.target.files?.[0];
    if (!file) return;

    setDocuments((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  // =========================================================
  // RESET
  // =========================================================
  const handleReset = () => {
    setFormData({
      businessName: "Doughlicious Pizzeria",
      hstNumber: "RT123456789",
      category: "Restaurants",

      dineIn: false,
      takeAway: true,
      delivery: true,

      deliveryMin: "20",
      deliveryMax: "60",
      deliveryUnit: "Minutes",

      businessDescription:
        "Doughlicious Pizzeria serves up irresistible, hand-crafted pizzas made with fresh ingredients and perfectly stretched, hand-tossed dough. From timeless classics to bold specialty pies, every slice is baked to crispy, cheesy perfection. Whether you're grabbing a quick lunch slice or feeding the whole family, Doughlicious Pizzeria brings bold flavor and good vibes to every visit.",

      city: "",
      fullName: "Sagar Malik",
      email: "business+1@bhyvve.com",
      mobile: "9054958888",
      password: "Restaurant@123",

      address: "7700 Hurontario St, Brampton, ON L6Y 4M3, Canada",

      latitude: "43.659294",
      longitude: "-79.725695",
    });

    setDocuments({
      profilePhoto: null,
      idProof: null,
      businessLicense: null,
      padFile: null,
    });

    setMapSearch("");
  };

  // =========================================================
  // UPDATE STORE
  // =========================================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!id) {
      setError("Store ID is missing.");
      return;
    }

    try {
      setUpdateLoading(true);
      setError("");

      const diningOptions = [];

if (formData.dineIn) {
  diningOptions.push("dine_in");
}

if (formData.takeAway) {
  diningOptions.push("take_away");
}

if (formData.delivery) {
  diningOptions.push("delivery");
}

if (diningOptions.length === 0) {
  setError("Please select at least one dining option.");
  setUpdateLoading(false);
  return;
}

      // =========================================================
      // FORM DATA
      // =========================================================

    const formDataToSend = new FormData();

// Basic information
formDataToSend.append(
  "business_name",
  formData.businessName.trim()
);

formDataToSend.append(
  "hst_number",
  formData.hstNumber.trim()
);

formDataToSend.append(
  "cat_id",
  formData.category
);

// Dining options
formDataToSend.append(
  "dining_option",
  diningOptions.join(",")
);

// Delivery
formDataToSend.append(
  "minimum_delivery_time",
  formData.deliveryMin
);

formDataToSend.append(
  "maximum_delivery_time",
  formData.deliveryMax
);

formDataToSend.append(
  "delivery_time_type",
  formData.deliveryUnit
);

// Description
formDataToSend.append(
  "business_description",
  formData.businessDescription.trim()
);

      // City
      formDataToSend.append("city_id", formData.city);

      // Owner information
      formDataToSend.append("name", formData.fullName.trim());

      formDataToSend.append("email", formData.email.trim());

      formDataToSend.append("mobile", formData.mobile.trim());

      formDataToSend.append("password", formData.password);

      // Address
      formDataToSend.append("restaurant_address", formData.address.trim());

      // Coordinates
      formDataToSend.append("latitude", formData.latitude);

      formDataToSend.append("longitude", formData.longitude);

      // =========================================================
      // FILES
      // =========================================================

      if (documents.profilePhoto) {
        formDataToSend.append("profilePhoto", documents.profilePhoto);
      }

      if (documents.idProof) {
        formDataToSend.append("idProof", documents.idProof);
      }

      if (documents.businessLicense) {
        formDataToSend.append("businessLicense", documents.businessLicense);
      }

      if (documents.padFile) {
        formDataToSend.append("padFile", documents.padFile);
      }

      // =========================================================
      // API REQUEST
      // =========================================================

      const response = await fetch(`${API_BASE_URL}/restaurant/stores/${id}`, {
        method: "PATCH",
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update store.");
      }

      setSuccessMessage(
        result.message || "Store information updated successfully.",
      );

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Update Store Error:", error);

      setError(error.message || "Failed to update store.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // =========================================================
  // FILE UPLOAD COMPONENT
  // =========================================================
  const DocumentUpload = ({
    title,
    fieldName,
    existingFile,
    recommendedText,
  }) => {
    const selectedFile = documents[fieldName];

    const isPdf = (fileName = "") =>
      String(fileName).toLowerCase().endsWith(".pdf");

    const existingFileIsPdf = existingFile ? isPdf(existingFile) : false;

    const existingFileUrl = existingFile ? getImage(existingFile) : "";

    const selectedFileIsPdf = selectedFile
      ? selectedFile.type === "application/pdf" ||
        selectedFile.name.toLowerCase().endsWith(".pdf")
      : false;

    return (
      <div className="store-edit-document-field">
        <label className="store-edit-label">{title}</label>

        <div className="store-edit-file-input-wrapper">
          <input
            id={fieldName}
            type="file"
            accept="image/*,.pdf"
            onChange={(event) => handleFileChange(event, fieldName)}
          />

          <label htmlFor={fieldName} className="store-edit-file-label">
            <FaUpload />

            <span>{selectedFile ? selectedFile.name : "Choose File"}</span>
          </label>
        </div>

        <small className="store-edit-help-text">{recommendedText}</small>

        {/* NEW SELECTED FILE */}
        {selectedFile && (
          <div className="store-edit-selected-file">
            {selectedFileIsPdf ? (
              <>
                <FaFileImage />

                <a
                  href={URL.createObjectURL(selectedFile)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Selected PDF
                </a>
              </>
            ) : (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt={`${title} preview`}
                className="store-edit-document-preview"
              />
            )}
          </div>
        )}

        {/* EXISTING FILE */}
        {!selectedFile && existingFile && (
          <div className="store-edit-existing-preview">
            {existingFileIsPdf ? (
              <a
                href={existingFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="store-edit-view-file-button"
              >
                <FaFileImage />
                <span>View {title} (PDF)</span>
              </a>
            ) : (
              <img
                src={existingFileUrl}
                alt={`${title} preview`}
                className="store-edit-document-preview"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <> 
     <div className="breadcrumb-wrapper">
      <Breadcrumbs
        items={[
          {
            label: "Stores",
            path: "/restaurant/stores_list",
          },
          {
            label: "Edit Store",
          },
        ]}
      />
    </div>

    <div className="store-edit-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="store-edit-page-header">
        <div className="store-edit-header-left">

          <div className="store-edit-heading-row">
            <div className="store-edit-heading-icon">
              <FaBuilding />
            </div>
            <div>
              <h1>Edit Store</h1>
              <p>
                Update your store information, documents and business location.
              </p>
            </div>
          </div>
        </div>

        <Link to="/restaurant/stores_list" className="store-edit-back-button">
          <FaArrowLeft />
          Back to List
        </Link>
      </div>

      {/* =====================================================
          FORM
      ===================================================== */}
      <form className="store-edit-form" onSubmit={handleSubmit}>
        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}
        <section className="store-edit-card">
          <div className="store-edit-card-header">
            <div className="store-edit-card-title">
              <span className="store-edit-section-icon">
                <FaBuilding />
              </span>
              <div>
                <h2>Basic Information</h2>
                {/* <p>Basic details about your restaurant.</p> */}
              </div>
            </div>
          </div>

          <div className="store-edit-card-body">
            <div className="store-edit-grid store-edit-grid-2">
              {/* BUSINESS NAME */}
              <div className="store-edit-field">
                <label className="store-edit-label">
                  Business Name
                  <span>*</span>
                </label>
                <div className="store-edit-input-icon">
                  <FaBuilding />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Enter business name"
                    required
                  />
                </div>
              </div>

              {/* HST */}
              <div className="store-edit-field">
                <label className="store-edit-label">HST Number</label>
                <input
                  type="text"
                  name="hstNumber"
                  value={formData.hstNumber}
                  onChange={handleChange}
                  placeholder="HST number"
                />
              </div>

              {/* CATEGORY */}
              <div className="store-edit-field">
                <label className="store-edit-label">
                  Select Category
                  <span>*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="1">Restaurants</option>
                </select>
              </div>

              {/* DINING OPTIONS */}
              <div className="store-edit-field">
                <label className="store-edit-label">
                  Dining Option
                  <span>*</span>
                </label>
                <div className="store-edit-checkbox-group">
                  <label className="store-edit-checkbox">
                    <input
                      type="checkbox"
                      name="dineIn"
                      checked={formData.dineIn}
                      onChange={handleChange}
                    />
                    <span>Dine In</span>
                  </label>

                  <label className="store-edit-checkbox">
                    <input
                      type="checkbox"
                      name="takeAway"
                      checked={formData.takeAway}
                      onChange={handleChange}
                    />
                    <span>Take Away</span>
                  </label>

                  <label className="store-edit-checkbox">
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
            </div>

            {/* DELIVERY TIME */}
            <div className="store-edit-field store-edit-delivery-field">
              <label className="store-edit-label">
                Estimated Delivery Time
                <span>*</span>
              </label>
              <div className="store-edit-delivery-row">
                <input
                  type="number"
                  name="deliveryMin"
                  value={formData.deliveryMin}
                  onChange={handleChange}
                  min="0"
                  placeholder="Min"
                  required
                />
                <input
                  type="number"
                  name="deliveryMax"
                  value={formData.deliveryMax}
                  onChange={handleChange}
                  min="0"
                  placeholder="Max"
                  required
                />
                <select
                  name="deliveryUnit"
                  value={formData.deliveryUnit}
                  onChange={handleChange}
                >
                  <option value="Minutes">Minutes</option>
                  <option value="Hours">Hours</option>
                </select>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="store-edit-field">
              <label className="store-edit-label">
                Business Description
                <span>*</span>
              </label>
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                rows="5"
                placeholder="Describe your business..."
                required
              />
              <small className="store-edit-character-hint">
                Provide a clear description of your restaurant and services.
              </small>
            </div>
          </div>
        </section>

        {/* ===================================================
            GENERAL SETUP
        =================================================== */}
        <section className="store-edit-card">
          <div className="store-edit-card-header">
            <div className="store-edit-card-title">
              <span className="store-edit-section-icon">
                <FaUser />
              </span>
              <div>
                <h2>General Setup</h2>
                <p>Owner and account information.</p>
              </div>
            </div>
          </div>

          <div className="store-edit-card-body">
            <div className="store-edit-grid store-edit-grid-3">
              {/* CITY */}
              <div className="store-edit-field">
                <label className="store-edit-label">
                  City Operation
                  <span>*</span>
                </label>

                <div className="store-edit-select-wrapper">
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select City</option>

                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.city_name}
                      </option>
                    ))}
                  </select>

                  <span className="store-edit-select-city-icon">⌄</span>
                </div>
              </div>

              {/* FULL NAME */}
              <div className="store-edit-field">
                <label className="store-edit-label">
                  Full Name
                  <span>*</span>
                </label>
                <div className="store-edit-input-icon">
                  <FaUser />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full name"
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="store-edit-field">
                <label className="store-edit-label">
                  Email
                  <span>*</span>
                </label>
                <div className="store-edit-input-icon">
                  <FaEnvelope />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="owner@example.com"
                    required
                  />
                </div>
              </div>

              {/* MOBILE */}
              <div className="store-edit-field">
                <label className="store-edit-label">
                  Mobile
                  <span>*</span>
                </label>
                <div className="store-edit-input-icon">
                  <FaPhone />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="store-edit-field">
                <label className="store-edit-label">
                  Password
                  <span>*</span>
                </label>
                <div className="store-edit-password-wrapper">
                  <FaLock className="store-edit-password-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    className="store-edit-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* DOCUMENTS */}
            <div className="store-edit-documents-grid">
              <DocumentUpload
                title="Profile Photo"
                fieldName="profilePhoto"
                existingFile={existingFiles.profilePhoto}
                recommendedText="Leave blank to keep existing."
              />
              <DocumentUpload
                title="ID Proof"
                fieldName="idProof"
                existingFile={existingFiles.idProof}
                recommendedText="Leave blank to keep existing."
              />
              <DocumentUpload
                title="Business License"
                fieldName="businessLicense"
                existingFile={existingFiles.businessLicense}
                recommendedText="Allowed: PDF, JPG, JPEG, PNG. Leave blank to keep existing."
              />
              <DocumentUpload
                title="PAD File"
                fieldName="padFile"
                existingFile={existingFiles.padFile}
                recommendedText="Allowed: PDF, JPG, JPEG, PNG. Leave blank to keep existing."
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            BUSINESS LOCATION
        =================================================== */}
        <section className="store-edit-card store-edit-location-card">
          <div className="store-edit-card-header">
            <div className="store-edit-card-title">
              <span className="store-edit-section-icon">
                <FaMap />
              </span>
              <div>
                <h2>Set Business Location on Map</h2>
                <p>
                  Search for your address or click / drag the pin to update the
                  exact business location.
                </p>
              </div>
            </div>
          </div>

          <div className="store-edit-card-body">
            {/* ADDRESS */}
            <div className="store-edit-field">
              <label className="store-edit-label">
                Restaurant Address
                <span>*</span>
                <small>Auto-filled from map</small>
              </label>
              <textarea
                className="store-edit-address-input"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                required
              />
              <div className="store-edit-info-message">
                <FaInfoCircle />
                <span>
                  This address is auto-filled from the map pin. You can also
                  edit it manually.
                </span>
              </div>
            </div>

            {/* MAP */}
            <div className="store-edit-map-wrapper">
              <div className="store-edit-map-search">
                {isGoogleMapsLoaded ? (
                  <Autocomplete
                    onLoad={handleAutocompleteLoad}
                    onPlaceChanged={handlePlaceChanged}
                  >
                    <input
                      type="text"
                      value={mapSearch}
                      onChange={(event) => setMapSearch(event.target.value)}
                      placeholder="Search address..."
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    value={mapSearch}
                    onChange={(event) => setMapSearch(event.target.value)}
                    placeholder="Loading Google Maps..."
                    disabled
                  />
                )}

                <button
                  type="button"
                  title="Search location"
                  onClick={handleSearch}
                  disabled={!isGoogleMapsLoaded}
                >
                  <FaSearch />
                </button>
              </div>

              <div className="store-edit-map">
                {isGoogleMapsLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={15}
                    onLoad={(mapInstance) => setMap(mapInstance)}
                    onClick={handleMapClick}
                    options={{
                      mapTypeControl: false,
                      streetViewControl: false,
                      fullscreenControl: true,
                      zoomControl: true,
                      styles: [
                        {
                          featureType: "poi",
                          elementType: "labels",
                          stylers: [{ visibility: "off" }],
                        },
                      ],
                    }}
                  >
                    <MarkerF
                      position={mapCenter}
                      draggable={true}
                      onDragEnd={handleMarkerDragEnd}
                      title="Business location"
                    />
                  </GoogleMap>
                ) : (
                  <div className="store-edit-map-loading">
                    Loading Google Map...
                  </div>
                )}
              </div>
            </div>

            {/* LOCATION PREVIEW */}
            <div className="store-edit-location-preview">
              <FaMapMarkerAlt />
              <span>{formData.address}</span>
            </div>

            {/* COORDINATES */}
            <div className="store-edit-grid store-edit-grid-2">
              <div className="store-edit-field">
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                />
              </div>
              <div className="store-edit-field">
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                />
              </div>
            </div>

            <div className="store-edit-info-message">
              <FaInfoCircle />
              <span>
                Coordinates are automatically filled when you search or click on
                the map.
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================
            FORM ACTIONS
        =================================================== */}
        <div className="store-edit-actions">
          <button
            type="button"
            className="store-edit-reset-button"
            onClick={handleReset}
          >
            <FaRedo />
            Reset
          </button>

          <button
            type="submit"
            className="store-edit-submit-button"
            disabled={updateLoading || loading}
          >
            <FaSave />
            {updateLoading ? "Updating..." : "Update Information"}
          </button>
        </div>
      </form>

      {/* =====================================================
          FOOTER SPACE
      ===================================================== */}
      <div className="store-edit-bottom-space" />
      <SuccessModal
        show={showSuccessModal}
        title="Store Updated!"
        message={successMessage}
        buttonText="OK"
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/restaurant/stores_list");
        }}
      />
    </div>
    </>
  );
};

export default StoreEdit;
