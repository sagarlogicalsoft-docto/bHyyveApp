import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/styles";
import "./addDriver.css";
import api from "../../../../config/api";

const IDENTITY_TYPES = [
  { value: "driving_license", label: "Driving license" },
  { value: "passport", label: "Passport" },
  { value: "nid", label: "National ID" },
];

const DEFAULT_MAP_CENTER = { lat: 23.2599, lng: 77.4126 };

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+91",
  phone: "",
  profileImage: null,
  identityType: "driving_license",
  identityNumber: "",
  identityImage: null,
  address: "",
  location: DEFAULT_MAP_CENTER,
};

const MAX_IMAGE_BYTES = 1024 * 1024;

function validate(form) {
  const errors = {};

  if (!form.firstName.trim()) errors.firstName = "First name is required";
  if (!form.lastName.trim()) errors.lastName = "Last name is required";

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!form.phone.trim()) errors.phone = "Phone number is required";
  if (!form.identityNumber.trim())
    errors.identityNumber = "Identity number is required";
  if (!form.identityImage) errors.identityImage = "Identity image is required";
  if (!form.address.trim()) errors.address = "Address is required";

  return errors;
}

function buildDriverFormData(form, iti) {
  const body = new FormData();
  const country = iti?.getSelectedCountry();

  body.append("first_name", form.firstName);
  body.append("last_name", form.lastName);
  body.append("email", form.email);

  body.append("phone", form.phone);

  body.append(
    "full_phone",
    iti?.getNumber() || `${form.countryCode}${form.phone}`,
  );

  body.append(
    "country_code",
    country?.dialCode ? `+${country.dialCode}` : form.countryCode,
  );

  body.append("identity_type", form.identityType);
  body.append("identity_number", form.identityNumber);
  body.append("latitude", form.location.lat);
  body.append("longitude", form.location.lng);
  body.append("address", form.address);

  if (form.profileImage) body.append("profile_image", form.profileImage);

  if (form.identityImage) body.append("identity_image", form.identityImage);

  return body;
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageDropzone({
  label,
  hint,
  preview,
  error,
  onSelect,
  aspectClass,
  inputId,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file) onSelect(file);
  };

  return (
    <div className="ad-field-group">
      <span className="ad-field-label">{label}</span>
      <p className="ad-field-hint">{hint}</p>

      <div
        className={[
          "ad-dropzone",
          aspectClass,
          isDragging ? "ad-dropzone--active" : "",
          error ? "ad-dropzone--error" : "",
          preview ? "ad-dropzone--filled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt={`${label} preview`}
            className="ad-dropzone-preview"
          />
        ) : (
          <>
            <svg
              className="ad-dropzone-icon"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5M12 3v12m0-12 4 4m-4-4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="ad-dropzone-cta">Click to upload</span>
            <span className="ad-dropzone-sub">Or drag and drop</span>
          </>
        )}

        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          className="ad-dropzone-input"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <span className="ad-field-error">{error}</span>}
    </div>
  );
}

function loadGoogleMaps() {
  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (window.__googleMapsPromise) {
    return window.__googleMapsPromise;
  }

  window.__googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById("google-maps-script");

    if (existingScript) {
      existingScript.addEventListener("load", resolve);
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");

    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;

    script.async = true;
    script.defer = true;

    script.onload = resolve;
    script.onerror = reject;

    document.head.appendChild(script);
  });

  return window.__googleMapsPromise;
}

export default function AddDriver({ onCreated }) {
  const navigate = useNavigate();
  const phoneRef = useRef(null);
  const itiRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const autocompleteRef = useRef(null);
  const addressInputRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);

  const [previews, setPreviews] = useState({
    profileImage: null,
    identityImage: null,
  });

  const [errors, setErrors] = useState({});
  const [mapView, setMapView] = useState("map");
  const [addressQuery, setAddressQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  /* --------------------------- ITI --------------------------- */

  useEffect(() => {
    if (!phoneRef.current) return;

    const iti = intlTelInput(phoneRef.current, {
      initialCountry: "in",
      countrySelectorMode: "dropdown",
      separateDialCode: true,
      loadUtils: () => import("intl-tel-input/utils"),
    });

    itiRef.current = iti;

    const handleCountryChange = () => {
      const country = iti.getSelectedCountry();

      setForm((prev) => ({
        ...prev,
        countryCode: country?.dialCode ? `+${country.dialCode}` : "+91",
      }));
    };

    phoneRef.current.addEventListener("countrychange", handleCountryChange);

    handleCountryChange();

    return () => {
      phoneRef.current?.removeEventListener(
        "countrychange",
        handleCountryChange,
      );

      iti.destroy();
      itiRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current || mapInstanceRef.current) {
          return;
        }

        const center = {
          lat: form.location.lat,
          lng: form.location.lng,
        };

        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 13,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        const marker = new window.google.maps.Marker({
          position: center,
          map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        });

        const geocoder = new window.google.maps.Geocoder();

        mapInstanceRef.current = map;
        markerRef.current = marker;
        geocoderRef.current = geocoder;

        marker.addListener("dragend", () => {
          const position = marker.getPosition();

          const lat = position.lat();
          const lng = position.lng();

          setForm((prev) => ({
            ...prev,
            location: {
              lat,
              lng,
            },
          }));

          geocoder.geocode(
            {
              location: {
                lat,
                lng,
              },
            },
            (results, status) => {
              if (status === "OK" && results[0]) {
                const address = results[0].formatted_address;

                setForm((prev) => ({
                  ...prev,
                  address,
                  location: {
                    lat,
                    lng,
                  },
                }));

                setAddressQuery(address);
              }
            },
          );
        });

        if (addressInputRef.current) {
          const autocomplete = new window.google.maps.places.Autocomplete(
            addressInputRef.current,
          );

          autocomplete.bindTo("bounds", map);

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();

            if (!place.geometry) {
              return;
            }

            const location = place.geometry.location;

            const lat = location.lat();
            const lng = location.lng();

            map.setCenter(location);
            map.setZoom(15);
            marker.setPosition(location);

            const address = place.formatted_address || "";

            setForm((prev) => ({
              ...prev,
              address,
              location: {
                lat,
                lng,
              },
            }));

            setAddressQuery(address);
          });

          autocompleteRef.current = autocomplete;
        }
      })
      .catch((error) => {
        console.error("Google Maps loading failed:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.setMapTypeId(
      mapView === "satellite"
        ? window.google.maps.MapTypeId.SATELLITE
        : window.google.maps.MapTypeId.ROADMAP,
    );
  }, [mapView]);

  /* --------------------------- Helpers --------------------------- */

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    setForm((prev) => ({
      ...prev,
      phone: value,
    }));

    setErrors((prev) => ({
      ...prev,
      phone: undefined,
    }));
  };

  const handleImageSelect = useCallback(async (key, file) => {
    if (!/^image\/(jpeg|jpg|png)$/.test(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [key]: "Only JPG, JPEG or PNG files are allowed",
      }));
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        [key]: "File must be smaller than 1MB",
      }));
      return;
    }

    const dataUrl = await readImageFile(file);

    setPreviews((prev) => ({
      ...prev,
      [key]: dataUrl,
    }));

    updateField(key, file);
  }, []);

  const handleAddressSearch = () => {
    const query = addressQuery.trim();

    if (!query || !geocoderRef.current) {
      return;
    }

    setIsSearching(true);

    geocoderRef.current.geocode(
      {
        address: query,
      },
      (results, status) => {
        setIsSearching(false);

        if (status !== "OK" || !results || !results[0]) {
          setSubmitError("Address not found.");
          return;
        }

        const result = results[0];

        const location = result.geometry.location;

        const lat = location.lat();
        const lng = location.lng();

        mapInstanceRef.current?.setCenter(location);

        mapInstanceRef.current?.setZoom(15);

        markerRef.current?.setPosition(location);

        const address = result.formatted_address || query;

        setAddressQuery(address);

        setForm((prev) => ({
          ...prev,
          address,
          location: {
            lat,
            lng,
          },
        }));
      },
    );
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);

    setPreviews({
      profileImage: null,
      identityImage: null,
    });

    setErrors({});
    setAddressQuery("");
    setSubmitError(null);

    if (itiRef.current) {
      itiRef.current.setSelectedCountry("in");
      phoneRef.current.value = "";
    }
  };

  /* --------------------------- Submit --------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const currentPhone = phoneRef.current?.value?.replace(/\D/g, "") || "";

    const formForValidation = {
      ...form,
      phone: currentPhone,
    };

    const validationErrors = validate(formForValidation);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = buildDriverFormData(formForValidation, itiRef.current);

      const response = await api.post("/restaurant/drivers", payload);

      onCreated?.(response.data);
      handleReset();
    } catch (error) {
      const responseData = error.response?.data;

      if (responseData?.errors) {
        setErrors((prev) => ({
          ...prev,
          ...responseData.errors,
        }));
      }

      setSubmitError(
        responseData?.message ||
          error.message ||
          "Something went wrong while saving this driver.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ad-add-driver">
      {/* ---------------- Header ---------------- */}

      <header className="ad-add-driver-header">
        <div className="ad-add-driver-title">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            className="ad-add-driver-title-icon"
          >
            <path
              d="M3 13.5 4.6 9a1.5 1.5 0 0 1 1.42-1h8.96a1.5 1.5 0 0 1 1.42 1l1.6 4.5M3 13.5V17a1 1 0 0 0 1 1h1.2M3 13.5h18M19.8 18H21a1 1 0 0 0 1-1v-3.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle
              cx="7.5"
              cy="18"
              r="1.6"
              stroke="currentColor"
              strokeWidth="1.6"
            />

            <circle
              cx="16.5"
              cy="18"
              r="1.6"
              stroke="currentColor"
              strokeWidth="1.6"
            />

            <circle
              cx="18"
              cy="6"
              r="3.4"
              fill="var(--color-surface)"
              stroke="currentColor"
              strokeWidth="1.3"
            />

            <path
              d="M18 4.7v2.6M16.8 6h2.4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>

          <h1>Add New Driver</h1>
        </div>

        <button
          type="button"
          className="ad-btn ad-btn--ghost"
          onClick={() => navigate("/restaurant/driver_list")}
        >
          <span
            aria-hidden="true"
            style={{ fontSize: "22px", marginBottom: "5px" }}
          >
            ‹
          </span>{" "}
          Back To List
        </button>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        {/* ---------------- User Info ---------------- */}

        <section className="ad-card">
          <h2 className="ad-card-title">User Info</h2>

          <div className="ad-card-body ad-user-info-grid">
            <div className="ad-user-info-fields">
              <div className="ad-field-group">
                <label className="ad-field-label">
                  First name <span className="ad-required">*</span>
                </label>

                <input
                  className={`ad-text-input ${
                    errors.firstName ? "ad-text-input--error" : ""
                  }`}
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                />

                {errors.firstName && (
                  <span className="ad-field-error">{errors.firstName}</span>
                )}
              </div>

              <div className="ad-field-group">
                <label className="ad-field-label">
                  Last name <span className="ad-required">*</span>
                </label>

                <input
                  className={`ad-text-input ${
                    errors.lastName ? "ad-text-input--error" : ""
                  }`}
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                />

                {errors.lastName && (
                  <span className="ad-field-error">{errors.lastName}</span>
                )}
              </div>

              <div className="ad-field-group">
                <label className="ad-field-label">
                  Email <span className="ad-required">*</span>
                </label>

                <input
                  type="email"
                  className={`ad-text-input ${
                    errors.email ? "ad-text-input--error" : ""
                  }`}
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />

                {errors.email && (
                  <span className="ad-field-error">{errors.email}</span>
                )}
              </div>

              {/* ---------------- ITI Phone ---------------- */}

              <div className="ad-field-group">
                <label className="ad-field-label">
                  Phone <span className="ad-required">*</span>
                </label>

                <div
                  className={`ad-phone-input ${
                    errors.phone ? "ad-phone-input--error" : ""
                  }`}
                >
                  <input
                    ref={phoneRef}
                    id="phone"
                    type="tel"
                    className="ad-phone-number"
                    placeholder="Phone number"
                    defaultValue=""
                    onChange={handlePhoneChange}
                  />
                </div>

                {errors.phone && (
                  <span className="ad-field-error">{errors.phone}</span>
                )}
              </div>
            </div>

            <ImageDropzone
              inputId="profileImage"
              label="Profile Image"
              hint="JPG, JPEG, PNG < 1MB (1:1)"
              preview={previews.profileImage}
              error={errors.profileImage}
              onSelect={(file) => handleImageSelect("profileImage", file)}
              aspectClass="ad-dropzone--square"
            />
          </div>
        </section>

        {/* ---------------- Identity Info ---------------- */}

        <section className="ad-card">
          <h2 className="ad-card-title">Identity Info</h2>

          <div className="ad-card-body">
            <div className="ad-identity-grid">
              <div className="ad-field-group">
                <label className="ad-field-label">
                  Identity Type <span className="ad-required">*</span>
                </label>

                <select
                  className="ad-text-input"
                  value={form.identityType}
                  onChange={(e) => updateField("identityType", e.target.value)}
                >
                  {IDENTITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ad-field-group">
                <label className="ad-field-label">
                  Identity Number <span className="ad-required">*</span>
                </label>

                <input
                  className={`ad-text-input ${
                    errors.identityNumber ? "ad-text-input--error" : ""
                  }`}
                  placeholder="Ex: 123654789512364"
                  value={form.identityNumber}
                  onChange={(e) =>
                    updateField("identityNumber", e.target.value)
                  }
                />

                {errors.identityNumber && (
                  <span className="ad-field-error">
                    {errors.identityNumber}
                  </span>
                )}
              </div>
            </div>

            <ImageDropzone
              inputId="identityImage"
              label="Identity Image"
              hint="JPG, JPEG, PNG < 1MB (2:1)"
              preview={previews.identityImage}
              error={errors.identityImage}
              onSelect={(file) => handleImageSelect("identityImage", file)}
              aspectClass="ad-dropzone--wide"
            />
          </div>
        </section>

        {/* ---------------- Address & Location ---------------- */}

        <section className="ad-card">
          <div className="ad-card-title-row">
            <h2 className="ad-card-title">Address &amp; Location</h2>

            <span className="ad-card-title-hint">
              Search address or drag marker to set location
            </span>
          </div>

          <div className="ad-card-body">
            <div className="ad-field-group">
              <label className="ad-field-label">Search Address</label>

              <div className="ad-address-search">
                <input
                  ref={addressInputRef}
                  className="ad-text-input"
                  placeholder="Type address to search..."
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddressSearch();
                    }
                  }}
                />

                <button
                  type="button"
                  className="ad-btn ad-btn--primary"
                  onClick={handleAddressSearch}
                  disabled={isSearching}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="2"
                    />

                    <path
                      d="m20 20-3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>

                  {isSearching ? "Searching…" : "Search"}
                </button>
              </div>

              {errors.address && (
                <span className="ad-field-error">{errors.address}</span>
              )}
            </div>

            {/* ---------------- Map ---------------- */}

            <div className="ad-map-frame">
              <div className="ad-map-toggle">
                <button
                  type="button"
                  className={`ad-map-toggle-btn ${
                    mapView === "map" ? "ad-is-active" : ""
                  }`}
                  onClick={() => setMapView("map")}
                >
                  Map
                </button>

                <button
                  type="button"
                  className={`ad-map-toggle-btn ${
                    mapView === "satellite" ? "ad-is-active" : ""
                  }`}
                  onClick={() => setMapView("satellite")}
                >
                  Satellite
                </button>
              </div>

              <div ref={mapRef} className="ad-map-canvas" />
            </div>

            {form.address && (
              <div className="ad-selected-location">
                <div className="ad-selected-location-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21s-7-7.2-7-12a7 7 0 1 1 14 0c0 4.8-7 12-7 12Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="9"
                      r="2.4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                  <span>Selected Location:</span>
                </div>

                <p className="ad-selected-location-address">{form.address}</p>

                <div className="ad-selected-location-coords">
                  <span>
                    <strong>Latitude:</strong> {form.location.lat}
                  </span>
                  <span>
                    <strong>Longitude:</strong> {form.location.lng}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {submitError && <p className="ad-submit-error">{submitError}</p>}

        {/* ---------------- Actions ---------------- */}

        <div className="ad-form-actions">
          <button
            type="button"
            className="ad-btn ad-btn--secondary"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset
          </button>

          <button
            type="submit"
            className="ad-btn ad-btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
