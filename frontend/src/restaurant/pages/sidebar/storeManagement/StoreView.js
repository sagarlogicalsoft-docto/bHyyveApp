import React, { useEffect, useState } from "react";
import StoreHeaderCommon from "./StoreHeaderCommon";
import {
  FaArrowLeft,
  FaStore,
  FaShoppingBag,
  FaBoxOpen,
  FaStar,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaClock,
  FaWallet,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaUtensils,
  FaLock,
  FaUser,
  FaFileAlt,
  FaEye,
  FaDownload,
} from "react-icons/fa";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { useNavigate, useParams } from "react-router-dom";
import { getImage } from "../../../../Components/utils/images";

import "./storeView.css";
import Breadcrumbs from "../../common/BreadCrumbs";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const defaultMapCenter = {
  lat: 43.130554,
  lng: -80.746666,
};

const StoreView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { isLoaded: isGoogleMapsLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // =========================================================
  // FETCH STORE BY ID
  // =========================================================

  useEffect(() => {
    const fetchStoreById = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error("Store ID is missing.");
        }

        const response = await fetch(`${API_BASE_URL}/restaurant/stores/${id}`);

        const result = await response.json();

        console.log("Store By ID API response:", result);

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to fetch store information.",
          );
        }

        if (!result.data) {
          throw new Error("Store information not found.");
        }

        //         console.log("Store keys:", Object.keys(result.data));
        // console.log("Full store data:", result.data);
        setStore(result.data);
      } catch (err) {
        console.error("Fetch store by ID error:", err);
        setError(err.message || "Unable to load store information.");
        setStore(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreById();
  }, [id]);

  // =========================================================
  // DOCUMENT ACTIONS (VIEW / DOWNLOAD)
  // =========================================================

  const handleViewDocument = (filePath) => {
    if (!filePath) return;

    const fileUrl = getImage(filePath);

    if (!fileUrl) return;

    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadDocument = async (filePath, title) => {
    if (!filePath) return;

    const fileUrl = getImage(filePath);

    if (!fileUrl) return;

    try {
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error("Failed to download document.");
      }

      const blob = await response.blob();
      const extension = String(filePath).split(".").pop();
      const safeTitle = (title || "document")
        .toString()
        .trim()
        .replace(/\s+/g, "_")
        .toLowerCase();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${safeTitle}.${extension}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Document download error:", err);
      // Fallback: open in a new tab if the download fetch fails (e.g. CORS)
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="store-view-page">
        <div className="store-view-loading">
          <FaStore />
          <h3>Loading store...</h3>
          <p>Please wait while we load the store information.</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR STATE
  // =========================================================

  if (error) {
    return (
      <div className="store-view-page">
        <div className="store-view-loading">
          <FaStore />
          <h3>Something went wrong</h3>
          <p>{error}</p>

          <button
            type="button"
            className="store-back-button"
            onClick={() => navigate("/restaurant/stores_list")}
          >
            <FaArrowLeft />
            <span>Back to List</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // API DATA MAPPING
  // =========================================================

  const storeName =
    store.business_name || store.store_name || store.name || "N/A";

  const storeId = store.id || id;

  const storeStatus =
    Number(store.is_kyc_approved) === 1 ? "Active" : "Inactive";

  const storeLogo = getImage(store.image);
  // const storeLogo = getImage(store.image);

console.log("IMAGE FROM API:", store.image);
console.log("FINAL IMAGE URL:", storeLogo);

  const storeHst = store.hst_number || store.hstNumber || "N/A";

  const storeDescription =
    store.description ||
    store.business_description ||
    "No business description available.";

  const storeCity = store.city_name || store.city || "N/A";

  const storeEmail = store.email_id || store.email || "N/A";

  const storePhone = store.mobile || store.phone || "N/A";

  const storeDeliveryTime =
    store.minimum_delivery_time && store.maximum_delivery_time
      ? `${store.minimum_delivery_time}-${store.maximum_delivery_time} ${
          store.delivery_time_type || "min"
        }`
      : "N/A";

  const storeAddress =
    store.restaurant_address || store.branch_address || "N/A";

  const storeLatitude = parseFloat(store.lat);
  const storeLongitude = parseFloat(store.long);

  const storeLocation =
    !Number.isNaN(storeLatitude) && !Number.isNaN(storeLongitude)
      ? {
          lat: storeLatitude,
          lng: storeLongitude,
        }
      : defaultMapCenter;

  const ownerName = store.owner_name || store.name || "N/A";

  const ownerEmail =
    store.owner_email || store.email_id || store.email || "N/A";

  const ownerPhone = store.owner_mobile || store.mobile || store.phone || "N/A";

  const ownerImage = getImage(
    store.image ||
      store.ownerImage ||
      store.owner_photo ||
      store.owner_pic ||
      store.owner_profile_image ||
      store.profile_image ||
      "",
  );

  console.log("Owner image filename:", store.image);
  console.log("Owner image URL:", ownerImage);
  const storePassword =
    store.password || store.store_password || store.owner_password || "";

  // =========================================================
  // DINING OPTIONS
  // =========================================================

  const diningOptions = store.dining_option
    ? store.dining_option
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  // =========================================================
  // DOCUMENTS
  // =========================================================

  const documents = [
    {
      title: "ID Proof",
      file: store.id_proof || store.idProof || "",
    },
    {
      title: "Business License",
      file:
        store.id_proof_two ||
        store.business_license ||
        store.businessLicense ||
        "",
    },
    {
      title: "PAD File",
      file: store.pad_file || store.padFile || "",
    },
  ];

  // =========================================================
  // SUMMARY CARDS
  // =========================================================

  const summaryCards = [
    {
      title: "Total Collection",
      value: "$ 0.00",
      icon: <FaMoneyBillWave />,
      className: "collection",
    },
    {
      title: "Pending Withdraw",
      value: "$ 0.00",
      icon: <FaClock />,
      className: "pending",
    },
    {
      title: "Total Withdrawal",
      value: "$ 0.00",
      icon: <FaWallet />,
      className: "withdrawal",
    },
    {
      title: "Total Earning",
      value: "$ 0.00",
      icon: <FaMoneyBillWave />,
      className: "earning",
    },
  ];

  // =========================================================
  // TABS
  // =========================================================

  const tabs = [
    {
      label: "Overview",
      icon: <FaStore />,
      path: `/restaurant/store/view_store/${id}`,
    },
    {
      label: "Orders",
      icon: <FaShoppingBag />,
      path: `/restaurant/store/orders/${id}`,
    },
    {
      label: "Items",
      icon: <FaBoxOpen />,
      path: `/restaurant/store/items/${id}`,
    },
    {
      label: "Reviews",
      icon: <FaStar />,
      path: `/restaurant/store/reviews/${id}`,
    },
    {
      label: "Discounts",
      icon: <FaMoneyBillWave />,
      path: `/restaurant/store/discounts/${id}`,
    },
    {
      label: "Transactions",
      icon: <FaExchangeAlt />,
      path: `/restaurant/store/transactions/${id}`,
    },
  ];

  return (
  <>
    <Breadcrumbs
      items={[
        {
          label: "Stores",
          path: "/restaurant/stores_list",
        },
        {
          label: storeName,
        },
      ]}
    />

    <div className="store-view-page">
      {/* =====================================================
          PAGE HEADER/ STORE TABS
      ===================================================== */}
      <StoreHeaderCommon
        storeName={storeName}
        storeId={storeId}
        storeStatus={storeStatus}
      />

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <section className="store-summary-grid">
        {summaryCards.map((card) => (
          <div
            className={`store-summary-card ${card.className}`}
            key={card.title}
          >
            <div className="store-summary-card-top">
              <span className="store-summary-icon">{card.icon}</span>
              <span className="store-summary-decoration">{card.icon}</span>
            </div>
            <div className="store-summary-title">{card.title}</div>
            <div className="store-summary-value">{card.value}</div>
          </div>
        ))}
      </section>

      {/* =====================================================
          STORE INFORMATION
      ===================================================== */}

      <section className="store-content-card">
        <div className="store-card-header">
          <div className="store-card-title">
            <span className="store-card-title-icon">
              <FaStore />
            </span>
            <h2>Store Info</h2>
          </div>
        </div>

        <div className="store-info-body">
          {/* STORE BASIC INFO */}

          <div className="store-basic-info">
            <div className="store-logo-wrapper">
              {storeLogo ? (
                <img
                  src={storeLogo}
                  alt={storeName}
                  className="store-logo-view"
                />
              ) : (
                <div className="store-logo-view">
                  <FaStore />
                </div>
              )}
            </div>

            <div className="store-basic-details">
              <h3>{storeName}</h3>
              <span className="store-hst">HST: {storeHst}</span>
            </div>
          </div>

          <div className="store-info-divider"></div>

          {/* BUSINESS DESCRIPTION */}

          <div className="store-info-row store-description-row">
            <div className="store-info-label">
              <span>
                <FaFileAlt />
              </span>
              <strong>Business Description</strong>
            </div>

            <div className="store-info-value description">
              {storeDescription}
            </div>
          </div>

          {/* CITY */}

          <div className="store-info-row">
            <div className="store-info-label">
              <span>
                <FaMapMarkerAlt />
              </span>
              <strong>City</strong>
            </div>

            <div className="store-info-value">{storeCity}</div>
          </div>

          {/* EMAIL */}

          <div className="store-info-row">
            <div className="store-info-label">
              <span>
                <FaEnvelope />
              </span>
              <strong>Email</strong>
            </div>

            <div className="store-info-value clickable-value">
              {storeEmail}
            </div>
          </div>

          {/* PHONE */}

          <div className="store-info-row">
            <div className="store-info-label">
              <span>
                <FaPhoneAlt />
              </span>
              <strong>Phone</strong>
            </div>

            <div className="store-info-value clickable-value">
              {storePhone}
            </div>
          </div>

          {/* DELIVERY TIME */}

          <div className="store-info-row">
            <div className="store-info-label">
              <span>
                <FaClock />
              </span>
              <strong>Delivery Time</strong>
            </div>

            <div className="store-info-value">{storeDeliveryTime}</div>
          </div>

          {/* DINING OPTIONS */}

          <div className="store-info-row">
            <div className="store-info-label">
              <span>
                <FaUtensils />
              </span>
              <strong>Dining Options</strong>
            </div>

            <div className="store-dining-options">
              {diningOptions.length > 0 ? (
                diningOptions.map((option) => (
                  <span key={option}>{option}</span>
                ))
              ) : (
                <span>N/A</span>
              )}
            </div>
          </div>

          {/* ADDRESS */}

          <div className="store-info-row store-address-row">
            <div className="store-info-label">
              <span>
                <FaMapMarkerAlt />
              </span>
              <strong>Address</strong>
            </div>

            <div className="store-info-value address-value">
              {storeAddress}
            </div>
          </div>

          {/* PASSWORD */}

          <div className="store-info-row">
            <div className="store-info-label">
              <span>
                <FaLock />
              </span>
              <strong>Password</strong>
            </div>

            <div className="store-password-value">
              <span>
                {showPassword
                  ? storePassword || "N/A"
                  : storePassword
                    ? "••••••••"
                    : "N/A"}
              </span>

              {storePassword && (
                <button
                  type="button"
                  title={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <FaLock />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BUSINESS LOCATION
      ===================================================== */}

      <section className="store-content-card location-card">
        <div className="store-card-header">
          <div className="store-card-title">
            <span className="store-card-title-icon">
              <FaMapMarkerAlt />
            </span>
            <h2>Business Location</h2>
          </div>
        </div>

        <div className="business-location-body">
          {/* ADDRESS */}

          <div className="business-location-address">
            <span className="location-address-icon">
              <FaMapMarkerAlt />
            </span>

            <div>
              <span className="location-address-label">Store Address</span>
              <strong>{storeAddress}</strong>
            </div>
          </div>

          {/* MAP */}

          <div className="store-map-wrapper">
            <div className="store-map">
              {isGoogleMapsLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={storeLocation}
                  zoom={15}
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
                  {!Number.isNaN(storeLatitude) &&
                    !Number.isNaN(storeLongitude) && (
                      <MarkerF
                        position={storeLocation}
                        title={storeName}
                      />
                    )}
                </GoogleMap>
              ) : (
                <div className="store-map-loading">
                  Loading Google Map...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          OWNER + DOCUMENTS
      ===================================================== */}

      <div className="store-bottom-grid">
        {/* OWNER INFO */}

        <section className="store-content-card owner-card">
          <div className="store-card-header">
            <div className="store-card-title">
              <span className="store-card-title-icon">
                <FaUser />
              </span>
              <h2>Owner Info</h2>
            </div>
          </div>

          <div className="owner-info-body">
            <div className="owner-image-wrapper">
              {ownerImage ? (
                <img src={ownerImage} alt={ownerName} />
              ) : (
                <div className="owner-placeholder">
                  <FaUser />
                </div>
              )}
            </div>

            <h3>{ownerName}</h3>

            <div className="owner-contact-item">
              <span>
                <FaEnvelope />
              </span>
              <span>{ownerEmail}</span>
            </div>

            <div className="owner-contact-item">
              <span>
                <FaPhoneAlt />
              </span>
              <span>{ownerPhone}</span>
            </div>
          </div>
        </section>

        {/* DOCUMENTS */}

        {documents.map((document) => {
          const isPdf =
            !!document.file &&
            String(document.file).toLowerCase().endsWith(".pdf");

          return (
            <section
              className="store-content-card document-card"
              key={document.title}
            >
              <div className="store-card-header">
                <div className="store-card-title">
                  <span className="store-card-title-icon">
                    <FaFileAlt />
                  </span>
                  <h2>{document.title}</h2>
                </div>
              </div>

              <div className="document-preview">
                {document.file ? (
                  isPdf ? (
                    <div className="document-pdf-preview">
                      <button
                        type="button"
                        className="document-pdf-view-button"
                        onClick={() =>
                          handleViewDocument(document.file)
                        }
                      >
                        <FaFileAlt />
                        <span>View {document.title}</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <img
                        src={getImage(document.file)}
                        alt={document.title}
                      />

                      <div className="document-overlay">
                        <button
                          type="button"
                          title="View document"
                          onClick={() =>
                            handleViewDocument(document.file)
                          }
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          title="Download document"
                          onClick={() =>
                            handleDownloadDocument(
                              document.file,
                              document.title,
                            )
                          }
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </>
                  )
                ) : (
                  <div className="document-no-preview">
                    <FaFileAlt />
                    <span>No document available</span>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* =====================================================
          FOOTER NOTE
      ===================================================== */}

      <div className="store-view-footer">
        <span>Store ID: {storeId}</span>
      </div>
    </div>
  </>
);
};

export default StoreView;
