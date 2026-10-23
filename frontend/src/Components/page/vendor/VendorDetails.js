import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaDownload,
  FaEye,
  FaEdit,
  FaEyeSlash,
  FaExclamationCircle,
  FaExternalLinkAlt,
  FaFileAlt,
  FaMapMarkerAlt,
  FaPlus,
  FaSave,
  FaSearch,
  FaStore,
  FaSyncAlt,
  FaTimes,
  FaTrashAlt,
  FaUpload,
} from "react-icons/fa";

import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceConfirmModal from "../../common/modal/serviceModal/ServiceConfirmModal";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";

import api from "../../../config/api";
import { getImage } from "../../utils/images";

import "./vendorDetails.css";

// =========================================================
// CONFIG
// NOTE: set this to the base URL where uploaded files are served
// (PHP used  uploads/Ids/<file>  and  assets/images/<file>)
// =========================================================

const FILE_BASE_URL =
  process.env.REACT_APP_FILE_BASE_URL || "http://localhost:6010";

// Add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file
// (needs the "Maps JavaScript API" + "Places API" + "Geocoding API" enabled)
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

// Map opens here until an address is picked (Woodstock, ON) - change if needed
const DEFAULT_MAP_CENTER = { lat: 43.1315, lng: -80.7467 };

const SAVED_MARKER_ICON =
  "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";

const DOCUMENT_FOLDERS = {
  ids: "assets/images",
  images: "assets/images",
};

const PAGE_SIZE = 10;

const getVendorApi = async (id) => {
  const response = await api.get(`/admin/vendors/${id}`);
  return response.data;
};

const getCitiesApi = async () => {
  const response = await api.get("/admin/cities");
  return response.data;
};

const getCategoriesApi = async () => {
  const response = await api.get("/admin/vendors-categories");
  return response.data;
};

// Existing backend route: POST /admin/vendors/update-details
const updateVendorDetailApi = async (payload) => {
  const response = await api.post("/admin/vendors/update-details", payload);
  return response.data;
};

// Existing backend route requires category_id.
const getVendorKeywordsApi = async (id, categoryId) => {
  const response = await api.get(`/admin/vendors/${id}/keywords`, {
    params: { category_id: categoryId },
  });

  return response.data;
};

// Existing backend expects vendor_id in the body.
const saveVendorKeywordsApi = async (vendorId, keywordIds) => {
  const response = await api.post("/admin/vendors/keywords", {
    vendor_id: vendorId,
    keyword_ids: keywordIds,
  });

  return response.data;
};

// Existing shop-details endpoint includes booking data.
// This does not introduce a new backend route.
const getVendorBookingsApi = async (id) => {
  const response = await api.get(`/admin/vendors/${id}/shop-details`);

  const result = response.data;

  return {
    success: result?.success,
    message: result?.message,
    data: Array.isArray(result?.data?.pending_booking)
      ? result.data.pending_booking
      : [],
  };
};

const updateVendorStatusApi = async (id, status) => {
  const response = await api.put(`/admin/vendors/${id}/status`, { status });

  return response.data;
};

const getVendorAddressesApi = async (id) => {
  const response = await api.get(`/admin/vendors/${id}/addresses`);
  const result = response.data;

  return {
    success: Number(result?.status) === 1,
    message: result?.message,
    data: Array.isArray(result?.data)
      ? result.data.map((item) => ({
          id: item.id,
          address: item.address || "",
          lat: item.lat ?? "",
          lng: item.long ?? item.lng ?? item.longitude ?? "",
        }))
      : [],
  };
};

const addVendorAddressApi = async (payload) => {
  const response = await api.post("/admin/vendors/addresses", payload);
  const result = response.data;

  return {
    ...result,
    success: Number(result?.status) === 1,
  };
};

const deleteVendorAddressApi = async (vendorId, addressId) => {
  const response = await api.delete(`/admin/vendors/addresses/${addressId}`, {
    data: { vendor_id: vendorId },
  });

  const result = response.data;

  return {
    ...result,
    success: Number(result?.status) === 1,
  };
};

// loads the Google Maps script once for the whole app
let googleMapsPromise = null;

const loadGoogleMaps = () => {
  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY) {
      googleMapsPromise = null;
      reject(new Error("Google Maps API key is missing."));
      return;
    }

    const script = document.createElement("script");

    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;

    script.onload = () => {
      if (window.google?.maps?.places) {
        resolve(window.google);
      } else {
        googleMapsPromise = null;
        reject(new Error("Google Maps failed to initialise."));
      }
    };

    script.onerror = () => {
      googleMapsPromise = null;
      script.remove();
      reject(new Error("Could not load Google Maps."));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// =========================================================
// CONSTANTS + HELPERS
// =========================================================

const tabs = [
  { id: "vendor", label: "Vendor" },
  { id: "shop", label: "Shop" },
  { id: "inprocess", label: "Inprocess Booking" },
  { id: "completed", label: "Completed Booking" },
  { id: "documents", label: "Documents" },
  { id: "services", label: "Services" },
  { id: "keywords", label: "Keywords" },
];

const documentConfig = [
  { key: "contract_id", label: "Contract ID", folder: "ids" },
  { key: "trade_license", label: "Trade Licence", folder: "ids" },
  { key: "owner_id", label: "Owner ID", folder: "ids" },
  { key: "registration_id", label: "Registration ID", folder: "ids" },
  { key: "computer_card", label: "Computer Card", folder: "ids" },
  { key: "price_list", label: "Price List", folder: "ids" },
  { key: "id_proof", label: "ID Proof", folder: "images" },
  { key: "id_proof_two", label: "Business Licence", folder: "images" },
  { key: "pad_file", label: "PAD Form", folder: "images" },
];

const getDocumentUrl = (fileName, folder) =>
  `${FILE_BASE_URL}/${DOCUMENT_FOLDERS[folder]}/${fileName}`;

const emptyForm = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  city: "",
  about: "",
  accHolderName: "",
  transitNumber: "",
  accountNumber: "",
  branchName: "",
  branchAddress: "",
  institutionNumber: "",
  category: "",
  shopName: "",
  hstNumber: "",
};

const emptyAddressDraft = {
  addressId: 0,
  search: "",
  selected: "",
  lat: "",
  lng: "",
};

const mapVendorToForm = (vendor) => ({
  name: vendor.name || "",
  email: vendor.email_id || "",
  mobile: vendor.mobile || "",
  password: vendor.password || "",
  city: vendor.city_id ? String(vendor.city_id) : "",
  about: vendor.about || "",
  accHolderName: vendor.acc_holder_name || "",
  transitNumber: vendor.tansit_number || "",
  accountNumber: vendor.account_number || "",
  branchName: vendor.branch_name || "",
  branchAddress: vendor.branch_address || "",
  institutionNumber: vendor.institution_number || "",
  category: vendor.cat_id ? String(vendor.cat_id) : "",
  shopName: vendor.shop_name || vendor.business_name || "",
  hstNumber: vendor.hst_number || "",
});

// highlights the searched part of a keyword (no dangerouslySetInnerHTML)
const renderHighlighted = (text, term) => {
  if (!term) {
    return text;
  }

  const index = text.toLowerCase().indexOf(term.toLowerCase());

  if (index < 0) {
    return text;
  }

  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + term.length)}</mark>
      {text.slice(index + term.length)}
    </>
  );
};

const formatAmount = (value) => {
  const amount = Number(value);
  return Number.isNaN(amount) ? "-" : `$ ${amount.toFixed(2)}`;
};

const formatCoordinate = (value) => {
  const number = Number(value);
  return value === "" || value === null || Number.isNaN(number)
    ? "-"
    : number.toFixed(6);
};

const VendorDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // =========================================================
  // STATE
  // =========================================================

  const [vendorData, setVendorData] = useState(location.state?.vendor || null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [activeTab, setActiveTab] = useState("vendor");

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [savingSection, setSavingSection] = useState(""); // "vendor" | "shop"
  const [isActive, setIsActive] = useState(true);

  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [tableState, setTableState] = useState({
    inprocess: { search: "", page: 1 },
    completed: { search: "", page: 1 },
  });

  const [keywords, setKeywords] = useState([]);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState([]);
  const [keywordsLoaded, setKeywordsLoaded] = useState(false);
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [keywordsError, setKeywordsError] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");

  // vendor addresses (Shop tab)
  const [addresses, setAddresses] = useState([]);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState("");
  const [addressDraft, setAddressDraft] = useState(emptyAddressDraft);
  const [addressFormError, setAddressFormError] = useState("");
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapStatus, setMapStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [mapError, setMapError] = useState("");

  const mapContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const draftMarkerRef = useRef(null);

  const [confirmType, setConfirmType] = useState(null); // "status" | "keywords" | "address"
  const [success, setSuccess] = useState({
    open: false,
    title: "",
    message: "",
  });

  const vendorId = vendorData?.id ?? id;
  const vendorName = form.name || vendorData?.name || "";

  // =========================================================
  // LOAD VENDOR + DROPDOWNS
  // =========================================================

  useEffect(() => {
    const fetchVendorDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setPageError("");

        const data = await getVendorApi(id);

        // Handle an explicit API failure.
        if (data?.success === false) {
          setPageError(data.message || "Failed to fetch vendor details.");
          return;
        }

        // Support both the current raw response and the wrapped response.
        const vendor = data?.success === true ? data.data : data;

        if (vendor && vendor.id != null) {
          setVendorData(vendor);
          setPageError("");
        } else {
          setPageError(data?.message || "Failed to fetch vendor details.");
        }
      } catch (error) {
        console.error("Vendor detail error:", error.response?.data || error);

        setPageError(
          error.response?.data?.message || "Failed to fetch vendor details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [id]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [cityData, categoryData] = await Promise.all([
          getCitiesApi(),
          getCategoriesApi(),
        ]);

        if (cityData?.success) {
          setCities(cityData.data || []);
        }

        if (categoryData?.success) {
          setCategories(categoryData.data || []);
        }
      } catch (error) {
        console.error("Dropdown data error:", error);
      }
    };

    fetchDropdowns();
  }, []);

  // map API data to the form
  useEffect(() => {
    if (!vendorData) {
      return;
    }

    setForm(mapVendorToForm(vendorData));
    setIsActive(Number(vendorData.status) === 1);
  }, [vendorData]);

  // if the API only sent category_name, match it to a category id
  useEffect(() => {
    if (form.category || !vendorData?.category_name || !categories.length) {
      return;
    }

    const match = categories.find(
      (category) => category.category_name === vendorData.category_name,
    );

    if (match) {
      setForm((previous) => ({ ...previous, category: String(match.id) }));
    }
  }, [categories, vendorData, form.category]);

  // =========================================================
  // LAZY LOAD: BOOKINGS + KEYWORDS + ADDRESSES
  // =========================================================

  const loadBookings = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError("");

      const data = await getVendorBookingsApi(vendorId);

      if (data?.success) {
        setBookings(data.data || []);
        setBookingsLoaded(true);
      } else {
        setBookingsError(data?.message || "Failed to load bookings.");
      }
    } catch (error) {
      console.error("Bookings error:", error);

      setBookingsError(
        error.response?.data?.message || "Failed to load bookings.",
      );
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadKeywords = async () => {
    try {
      setKeywordsLoading(true);
      setKeywordsError("");

      const categoryId = vendorData?.cat_id || form.category;

      if (!categoryId) {
        setKeywordsError("Vendor category is required to load keywords.");
        return;
      }

      const data = await getVendorKeywordsApi(vendorId, categoryId);

      if (data?.success) {
        setKeywords(data.data?.categoryKeywords || []);
        setSelectedKeywordIds((data.data?.vendorKeywordIds || []).map(String));
        setKeywordsLoaded(true);
      } else {
        setKeywordsError(data?.message || "Failed to load keywords.");
      }
    } catch (error) {
      console.error("Keywords error:", error.response?.data || error);

      setKeywordsError(
        error.response?.data?.message || "Failed to load keywords.",
      );
    } finally {
      setKeywordsLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      setAddressesLoading(true);
      setAddressesError("");

      const data = await getVendorAddressesApi(vendorId);

      if (data?.success) {
        setAddresses(data.data || []);
        setAddressesLoaded(true);
      } else {
        setAddressesError(data?.message || "Failed to load addresses.");
      }
    } catch (error) {
      console.error("Addresses error:", error.response?.data || error);

      setAddressesError(
        error.response?.data?.message || "Failed to load addresses.",
      );
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (!vendorId) {
      return;
    }

    const isBookingTab = activeTab === "inprocess" || activeTab === "completed";

    if (isBookingTab && !bookingsLoaded && !bookingsLoading) {
      loadBookings();
    }

    if (activeTab === "keywords" && !keywordsLoaded && !keywordsLoading) {
      loadKeywords();
    }

    if (activeTab === "shop" && !addressesLoaded && !addressesLoading) {
      loadAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, vendorId]);

  // =========================================================
  // GOOGLE MAP + PLACES SEARCH (only while the Shop tab is open)
  // =========================================================

  useEffect(() => {
    if (activeTab !== "shop") {
      return undefined;
    }

    let cancelled = false;
    const instances = [];

    setMapStatus("loading");
    setMapError("");

    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !mapContainerRef.current) {
          return;
        }

        const { maps } = google;

        const map = new maps.Map(mapContainerRef.current, {
          center: DEFAULT_MAP_CENTER,
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        const geocoder = new maps.Geocoder();

        const marker = new maps.Marker({
          map,
          draggable: true,
          visible: false,
        });

        draftMarkerRef.current = marker;
        instances.push(map, marker);

        // put the draft marker on a point and fill the form
        const applyLocation = (position, knownAddress) => {
          const lat =
            typeof position.lat === "function" ? position.lat() : position.lat;
          const lng =
            typeof position.lng === "function" ? position.lng() : position.lng;

          marker.setPosition({ lat, lng });
          marker.setVisible(true);

          setAddressFormError("");
          setAddressDraft((previous) => ({
            ...previous,
            search: knownAddress || previous.search,
            selected: knownAddress || "",
            lat: lat.toFixed(6),
            lng: lng.toFixed(6),
          }));

          if (knownAddress) {
            return;
          }

          // map click / marker drag -> find the address for this point
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (cancelled) {
              return;
            }

            if (status === "OK" && results?.[0]) {
              const found = results[0].formatted_address;

              setAddressDraft((previous) => ({
                ...previous,
                search: found,
                selected: found,
              }));
            } else {
              setAddressFormError(
                "No address found for this point. Type the address in the Selected Address box.",
              );
            }
          });
        };

        map.addListener("click", (event) => applyLocation(event.latLng));
        marker.addListener("dragend", (event) => applyLocation(event.latLng));

        if (searchInputRef.current) {
          const autocomplete = new maps.places.Autocomplete(
            searchInputRef.current,
            { fields: ["formatted_address", "name", "geometry"] },
          );

          autocomplete.bindTo("bounds", map);
          instances.push(autocomplete);

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();

            if (!place?.geometry?.location) {
              return;
            }

            if (place.geometry.viewport) {
              map.fitBounds(place.geometry.viewport);
            } else {
              map.setCenter(place.geometry.location);
              map.setZoom(17);
            }

            applyLocation(
              place.geometry.location,
              place.formatted_address || place.name || "",
            );
          });
        }

        setMapInstance(map);
        setMapStatus("ready");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("Google Maps error:", error);

        setMapError(error.message || "Could not load Google Maps.");
        setMapStatus("error");
      });

    return () => {
      cancelled = true;

      if (window.google?.maps) {
        instances.forEach((instance) =>
          window.google.maps.event.clearInstanceListeners(instance),
        );
      }

      draftMarkerRef.current = null;
    };
  }, [activeTab]);

  // blue markers for the addresses that are already saved
  useEffect(() => {
    if (!mapInstance || !window.google?.maps) {
      return undefined;
    }

    const { maps } = window.google;

    const savedMarkers = addresses
      .filter(
        (item) =>
          item.lat !== "" &&
          item.lng !== "" &&
          !Number.isNaN(Number(item.lat)) &&
          !Number.isNaN(Number(item.lng)),
      )
      .map(
        (item) =>
          new maps.Marker({
            map: mapInstance,
            position: { lat: Number(item.lat), lng: Number(item.lng) },
            title: item.address,
            icon: SAVED_MARKER_ICON,
          }),
      );

    if (savedMarkers.length > 1) {
      const bounds = new maps.LatLngBounds();

      savedMarkers.forEach((item) => bounds.extend(item.getPosition()));
      mapInstance.fitBounds(bounds);
    } else if (savedMarkers.length === 1) {
      mapInstance.setCenter(savedMarkers[0].getPosition());
      mapInstance.setZoom(15);
    }

    return () => {
      savedMarkers.forEach((item) => item.setMap(null));
    };
  }, [mapInstance, addresses]);

  // =========================================================
  // FORM HANDLERS
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((previous) => ({ ...previous, [name]: "" }));
    }

    if (pageError) {
      setPageError("");
    }
  };

  const validateVendorForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Full name is required.";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email address.";
    }

    setFormErrors(errors);

    if (errors.name) {
      document.getElementById("name")?.focus();
    } else if (errors.email) {
      document.getElementById("email")?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  // each tab updates only its own data
  const buildPayload = (section) => {
    if (section === "shop") {
      return {
        vid: vendorId,
        cat_id: form.category,
        shopname: form.shopName,
        hst_no: form.hstNumber,
      };
    }

    return {
      vid: vendorId,
      name: form.name,
      email_id: form.email,
      mobile: form.mobile,
      password: form.password,
      city_id: form.city,
      about: form.about,
      acc_holder_name: form.accHolderName,
      tansit_number: form.transitNumber,
      account_number: form.accountNumber,
      branch_name: form.branchName,
      branch_address: form.branchAddress,
      institution_number: form.institutionNumber,
    };
  };

  const handleSaveDetails = async (section) => {
    setPageError("");

    if (section === "vendor" && !validateVendorForm()) {
      return;
    }

    try {
      setSavingSection(section);

      const data = await updateVendorDetailApi(buildPayload(section));

      if (data?.success) {
        setSuccess({
          open: true,
          title: section === "shop" ? "Shop updated" : "Vendor updated",
          message:
            data.message ||
            (section === "shop"
              ? "Shop details updated successfully."
              : "Vendor details updated successfully."),
        });
      } else {
        setPageError(data?.message || "Failed to update details.");
      }
    } catch (error) {
      console.error("Update vendor error:", error.response?.data || error);

      setPageError(
        error.response?.data?.message || "Failed to update details.",
      );
    } finally {
      setSavingSection("");
    }
  };

  // =========================================================
  // ADDRESS HANDLERS
  // =========================================================

  const handleAddressDraftChange = (event) => {
    const { name, value } = event.target;

    setAddressDraft((previous) => ({ ...previous, [name]: value }));

    if (addressFormError) {
      setAddressFormError("");
    }
  };

  const handleEditAddress = (item) => {
    setAddressDraft({
      addressId: Number(item.id),
      search: item.address || "",
      selected: item.address || "",
      lat: String(item.lat ?? ""),
      lng: String(item.lng ?? ""),
    });

    setAddressFormError("");

    if (mapInstance) {
      const position = {
        lat: Number(item.lat),
        lng: Number(item.lng),
      };

      mapInstance.panTo(position);
      mapInstance.setZoom(16);

      if (draftMarkerRef.current) {
        draftMarkerRef.current.setPosition(position);
        draftMarkerRef.current.setVisible(true);
      }
    }
  };

  const handleAddAddress = async () => {
    const lat = Number(addressDraft.lat);
    const lng = Number(addressDraft.lng);

    const hasPoint =
      addressDraft.lat !== "" &&
      addressDraft.lng !== "" &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180;

    if (!hasPoint) {
      setAddressFormError(
        "Search for an address or click on the map to pick a location first.",
      );
      return;
    }

    if (!addressDraft.selected.trim()) {
      setAddressFormError("Selected address is required.");
      return;
    }

    try {
      setAddingAddress(true);
      setAddressFormError("");
      setPageError("");

      const data = await addVendorAddressApi({
        vendor_id: vendorId,
        address_id: Number(addressDraft.addressId) || 0,
        address: addressDraft.selected.trim(),
        lat,
        long: lng,
      });

      if (data?.success) {
        setAddressDraft(emptyAddressDraft);
        draftMarkerRef.current?.setVisible(false);

        await loadAddresses();
        const isEditing = Number(addressDraft.addressId) > 0;
        setSuccess({
          open: true,
          title: isEditing ? "Address updated" : "Address added",
          message: data.message || "Vendor address added successfully.",
        });
      } else {
        setAddressFormError(data?.message || "Failed to add address.");
      }
    } catch (error) {
      console.error("Add address error:", error.response?.data || error);

      setAddressFormError(
        error.response?.data?.message || "Failed to add address.",
      );
    } finally {
      setAddingAddress(false);
    }
  };

  const handleLocateAddress = (item) => {
    if (!mapInstance) {
      return;
    }

    mapInstance.panTo({ lat: Number(item.lat), lng: Number(item.lng) });
    mapInstance.setZoom(16);

    mapContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  const handleDeleteAddressClick = (item) => {
    setAddressToDelete(item);
    setConfirmType("address");
  };

  // =========================================================
  // CONFIRM ACTIONS (status + keywords + address)
  // =========================================================

  const handleStatusConfirm = async () => {
    const newStatus = isActive ? 0 : 1;

    try {
      const data = await updateVendorStatusApi(vendorId, newStatus);

      setConfirmType(null);

      if (data?.success) {
        setIsActive(newStatus === 1);
        setSuccess({
          open: true,
          title: newStatus === 1 ? "Vendor activated" : "Vendor deactivated",
          message:
            data.message ||
            `Vendor account ${
              newStatus === 1 ? "activated" : "deactivated"
            } successfully.`,
        });
      } else {
        setPageError(data?.message || "Failed to change account status.");
      }
    } catch (error) {
      console.error("Status error:", error.response?.data || error);

      setConfirmType(null);
      setPageError(
        error.response?.data?.message || "Failed to change account status.",
      );
    }
  };

  const handleKeywordsConfirm = async () => {
    try {
      const data = await saveVendorKeywordsApi(vendorId, selectedKeywordIds);

      setConfirmType(null);

      if (data?.success) {
        setSuccess({
          open: true,
          title: "Keywords updated",
          message: data.message || "Vendor keywords updated successfully.",
        });
      } else {
        setPageError(data?.message || "Failed to update keywords.");
      }
    } catch (error) {
      console.error("Keywords save error:", error.response?.data || error);

      setConfirmType(null);
      setPageError(
        error.response?.data?.message || "Failed to update keywords.",
      );
    }
  };

  const handleAddressDeleteConfirm = async () => {
    if (!addressToDelete) {
      setConfirmType(null);
      return;
    }

    try {
      const data = await deleteVendorAddressApi(vendorId, addressToDelete.id);

      setConfirmType(null);

      if (data?.success) {
        setAddresses((previous) =>
          previous.filter(
            (item) => String(item.id) !== String(addressToDelete.id),
          ),
        );

        setAddressToDelete(null);

        setSuccess({
          open: true,
          title: "Address removed",
          message: data.message || "Vendor address removed successfully.",
        });

        // Refresh the list from the backend after deletion.
        await loadAddresses();
      } else {
        setPageError(data?.message || "Failed to remove address.");
      }
    } catch (error) {
      console.error("Address delete error:", error.response?.data || error);

      setConfirmType(null);

      setPageError(
        error.response?.data?.message || "Failed to remove address.",
      );
    }
  };

  const confirmConfigs = {
    status: {
      title: isActive ? "Deactivate vendor?" : "Activate vendor?",
      message: isActive
        ? "Are you sure you want to deactivate this vendor account?"
        : "Are you sure you want to activate this vendor account?",
      confirmText: isActive ? "Yes, Deactivate" : "Yes, Activate",
      variant: isActive ? "danger" : "primary",
      onConfirm: handleStatusConfirm,
    },
    keywords: {
      title: "Update keywords?",
      message: `${selectedKeywordIds.length} keyword(s) are selected for this vendor.`,
      confirmText: "Yes, Update",
      variant: "primary",
      onConfirm: handleKeywordsConfirm,
    },
    address: {
      title: "Remove address?",
      message: addressToDelete?.address
        ? `Are you sure you want to remove "${addressToDelete.address}"?`
        : "Are you sure you want to remove this address?",
      confirmText: "Yes, Remove",
      variant: "danger",
      onConfirm: handleAddressDeleteConfirm,
    },
  };

  const confirmConfig = confirmConfigs[confirmType] || confirmConfigs.keywords;

  // =========================================================
  // KEYWORDS
  // =========================================================

  const toggleKeyword = (keywordId) => {
    const key = String(keywordId);

    setSelectedKeywordIds((previous) =>
      previous.includes(key)
        ? previous.filter((item) => item !== key)
        : [...previous, key],
    );
  };

  const searchTerm = keywordSearch.trim();

  const filteredKeywords = keywords.filter((item) =>
    item.keyword.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // =========================================================
  // BOOKINGS TABLE HELPERS
  // =========================================================

  const inProcessBookings = bookings.filter(
    (booking) => Number(booking.current_status) === 0,
  );

  const completedBookings = bookings.filter(
    (booking) => Number(booking.current_status) === 2,
  );

  const updateTable = (key, changes) => {
    setTableState((previous) => ({
      ...previous,
      [key]: { ...previous[key], ...changes },
    }));
  };

  const handleViewBooking = (booking) => {
    navigate(
      `/booking_detail?booking_id=${booking.Booking_id}&vendor_id=${
        booking.vendor_id || vendorId
      }`,
    );
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleUploadDocuments = () => {
    navigate(`/vendor/upload_documents/${vendorId}`, {
      state: { vendor: vendorData },
    });
  };

  const handleTabClick = (tabId) => {
    // Services is its own page (same as the PHP link)
    if (tabId === "services") {
      navigate(`/vendor/services/${vendorId}`, {
        state: { vendor: vendorData },
      });
      return;
    }

    setActiveTab(tabId);
  };

  // =========================================================
  // RENDER: BOOKING TABLE
  // =========================================================

  const renderBookingTable = (key, rows, title, description) => {
    const { search, page } = tableState[key];
    const term = search.trim().toLowerCase();

    const filtered = rows.filter((booking) =>
      [
        booking.Booking_id_string,
        booking.customer_name,
        booking.booking_address,
        booking.transaction,
        booking.status_in_string,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE);

    return (
      <div className="vendet-vd-tab-panel">
        <div className="vendet-vd-panel-heading">
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>

          <div className="vendet-vd-table-search">
            <FaSearch />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                updateTable(key, { search: event.target.value, page: 1 })
              }
              placeholder="Search bookings..."
              aria-label="Search bookings"
            />
          </div>
        </div>

        {bookingsError && (
          <div className="vendet-vd-alert" role="alert">
            <FaExclamationCircle />
            <span>{bookingsError}</span>
            <button
              type="button"
              className="vendet-vd-link-button"
              onClick={loadBookings}
            >
              Retry
            </button>
          </div>
        )}

        <div className="vendet-vd-table-wrapper">
          <table className="vendet-vd-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Booked ID</th>
                <th>Customer Name</th>
                <th>Booking Address</th>
                <th>Paid Amount</th>
                <th>Transaction</th>
                <th>Booked Date Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {bookingsLoading && (
                <tr>
                  <td colSpan="9" className="vendet-vd-empty-row">
                    Loading bookings...
                  </td>
                </tr>
              )}

              {!bookingsLoading && pageRows.length === 0 && (
                <tr>
                  <td colSpan="9" className="vendet-vd-empty-row">
                    {term
                      ? "No bookings match your search."
                      : "No bookings yet."}
                  </td>
                </tr>
              )}

              {!bookingsLoading &&
                pageRows.map((booking, index) => (
                  <tr key={booking.Booking_id || booking.Booking_id_string}>
                    <td>{startIndex + index + 1}</td>
                    <td>{booking.Booking_id_string}</td>
                    <td>{booking.customer_name}</td>
                    <td>{booking.booking_address}</td>
                    <td>{formatAmount(booking.grand_total)}</td>
                    <td>{booking.transaction}</td>
                    <td>
                      {booking.booked_date}{" "}
                      {String(booking.booked_time || "").replace(/\s/g, "")}
                    </td>
                    <td>
                      <span
                        className={`vendet-vd-booking-status vendet-${String(
                          booking.status_in_string || "",
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {booking.status_in_string}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="vendet-vd-icon-button"
                        title="View booking"
                        aria-label="View booking"
                        onClick={() => handleViewBooking(booking)}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="vendet-vd-pagination">
            <span>
              Showing {startIndex + 1}-{startIndex + pageRows.length} of{" "}
              {filtered.length}
            </span>

            <div className="vendet-vd-pagination-buttons">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => updateTable(key, { page: currentPage - 1 })}
              >
                Previous
              </button>

              <span className="vendet-vd-page-indicator">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => updateTable(key, { page: currentPage + 1 })}
              >
                Next
              </button>
            </div>
          </div>
        )}

        <div className="vendet-vd-actions">
          <button
            type="button"
            className="vendet-vd-primary-button"
            onClick={loadBookings}
            disabled={bookingsLoading}
          >
            {bookingsLoading ? (
              <span className="vendet-vd-spinner" aria-hidden="true" />
            ) : (
              <FaSyncAlt />
            )}

            {bookingsLoading ? "Refreshing..." : "Refresh Bookings"}
          </button>
        </div>
      </div>
    );
  };

  // =========================================================
  // RENDER: VENDOR TAB
  // =========================================================

  const renderVendorTab = () => (
    <div className="vendet-vd-tab-panel">
      <div className="vendet-vd-section">
        <h3 className="vendet-vd-section-title">Personal Detail</h3>

        <div className="vendet-vd-form-grid">
          <div className="vendet-vd-field">
            <label htmlFor="name">
              Full Name <span>*</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              className={`vendet-vd-input ${formErrors.name ? "vendet-has-error" : ""}`}
              value={form.name}
              onChange={handleChange}
            />

            {formErrors.name && (
              <small className="vendet-vd-error">{formErrors.name}</small>
            )}
          </div>

          <div className="vendet-vd-field">
            <label htmlFor="email">
              Email <span>*</span>
            </label>

            <input
              id="email"
              name="email"
              type="email"
              className={`vendet-vd-input ${formErrors.email ? "vendet-has-error" : ""}`}
              value={form.email}
              onChange={handleChange}
            />

            {formErrors.email && (
              <small className="vendet-vd-error">{formErrors.email}</small>
            )}
          </div>

          <div className="vendet-vd-field">
            <label htmlFor="mobile">Mobile</label>

            <input
              id="mobile"
              name="mobile"
              type="tel"
              className="vendet-vd-input"
              value={form.mobile}
              onChange={handleChange}
            />
          </div>

          <div className="vendet-vd-field">
            <label htmlFor="password">Password</label>

            <div className="vendet-vd-password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="vendet-vd-input"
                value={form.password}
                onChange={handleChange}
              />

              <button
                type="button"
                className="vendet-vd-password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="vendet-vd-field">
            <label htmlFor="city">City</label>

            <select
              id="city"
              name="city"
              className="vendet-vd-input"
              value={form.city}
              onChange={handleChange}
            >
              <option value="">Select City</option>

              {cities.map((city) => (
                <option key={city.id} value={String(city.id)}>
                  {city.city_name}
                </option>
              ))}
            </select>
          </div>

          <div className="vendet-vd-field vendet-vd-field-full">
            <label htmlFor="about">About</label>

            <textarea
              id="about"
              name="about"
              className="vendet-vd-input vendet-vd-textarea"
              value={form.about}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="vendet-vd-section">
        <h3 className="vendet-vd-section-title">Bank Detail</h3>

        <div className="vendet-vd-form-grid">
          <div className="vendet-vd-field">
            <label htmlFor="accHolderName">Acc Holder Name</label>

            <input
              id="accHolderName"
              name="accHolderName"
              type="text"
              className="vendet-vd-input"
              value={form.accHolderName}
              onChange={handleChange}
            />
          </div>

          <div className="vendet-vd-field">
            <label htmlFor="transitNumber">Transit Number</label>

            <input
              id="transitNumber"
              name="transitNumber"
              type="text"
              className="vendet-vd-input"
              value={form.transitNumber}
              onChange={handleChange}
            />
          </div>

          <div className="vendet-vd-field">
            <label htmlFor="accountNumber">Account Number</label>

            <input
              id="accountNumber"
              name="accountNumber"
              type="text"
              className="vendet-vd-input"
              value={form.accountNumber}
              onChange={handleChange}
            />
          </div>

          <div className="vendet-vd-field">
            <label htmlFor="branchName">Branch Name</label>

            <input
              id="branchName"
              name="branchName"
              type="text"
              className="vendet-vd-input"
              value={form.branchName}
              onChange={handleChange}
            />
          </div>

          <div className="vendet-vd-field">
            <label htmlFor="branchAddress">Branch Address</label>

            <input
              id="branchAddress"
              name="branchAddress"
              type="text"
              className="vendet-vd-input"
              value={form.branchAddress}
              onChange={handleChange}
            />
          </div>

          <div className="vendet-vd-field">
            <label htmlFor="institutionNumber">Institution Number</label>

            <input
              id="institutionNumber"
              name="institutionNumber"
              type="text"
              className="vendet-vd-input"
              value={form.institutionNumber}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="vendet-vd-actions">
        <button
          type="button"
          className="vendet-vd-primary-button"
          onClick={() => handleSaveDetails("vendor")}
          disabled={Boolean(savingSection)}
        >
          {savingSection === "vendor" ? (
            <span className="vendet-vd-spinner" aria-hidden="true" />
          ) : (
            <FaSave />
          )}

          {savingSection === "vendor" ? "Saving..." : "Update Vendor Details"}
        </button>
      </div>
    </div>
  );

  // =========================================================
  // RENDER: SHOP TAB
  // =========================================================

  const renderShopTab = () => (
    <div className="vendet-vd-tab-panel">
      <div className="vendet-vd-panel-heading">
        <div>
          <h3>Shop Details</h3>
          <p>Manage shop information for this vendor.</p>
        </div>

        <FaStore />
      </div>

      <div className="vendet-vd-section">
        <div className="vendet-vd-form-grid">
          <div className="vendet-vd-field">
            <label htmlFor="category">Category</label>

            <select
              id="category"
              name="category"
              className="vendet-vd-input"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="vendet-vd-field">
            <label htmlFor="shopName">Shop Name</label>

            <input
              id="shopName"
              name="shopName"
              type="text"
              className="vendet-vd-input"
              value={form.shopName}
              onChange={handleChange}
            />
          </div>

          <div className="vendet-vd-field">
            <label htmlFor="hstNumber">HST Number</label>

            <input
              id="hstNumber"
              name="hstNumber"
              type="text"
              className="vendet-vd-input"
              value={form.hstNumber}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          VENDOR ADDRESSES
      ===================================================== */}

      <div className="vendet-vd-section">
        <h3 className="vendet-vd-section-title">
          Vendor Addresses
          <span className="vendet-vd-count-badge vendet-vd-title-badge">
            {addresses.length} saved
          </span>
        </h3>

        {addressesError && (
          <div className="vendet-vd-alert" role="alert">
            <FaExclamationCircle />
            <span>{addressesError}</span>
            <button
              type="button"
              className="vendet-vd-link-button"
              onClick={loadAddresses}
            >
              Retry
            </button>
          </div>
        )}

        <div className="vendet-vd-address-layout">
          <div className="vendet-vd-address-form">
            <div className="vendet-vd-field">
              <label htmlFor="addressSearch">Search Address</label>

              <input
                id="addressSearch"
                name="search"
                type="text"
                ref={searchInputRef}
                className="vendet-vd-input"
                placeholder="Start typing an address..."
                autoComplete="off"
                value={addressDraft.search}
                onChange={handleAddressDraftChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                  }
                }}
              />
            </div>

            <div className="vendet-vd-field">
              <label htmlFor="addressSelected">Selected Address</label>

              <textarea
                id="addressSelected"
                name="selected"
                className={`vendet-vd-input vendet-vd-textarea vendet-vd-address-textarea ${
                  addressFormError ? "vendet-has-error" : ""
                }`}
                placeholder="Search or click on the map to select an address"
                value={addressDraft.selected}
                onChange={handleAddressDraftChange}
              />

              {addressFormError && (
                <small className="vendet-vd-error" role="alert">
                  {addressFormError}
                </small>
              )}
            </div>

            <div className="vendet-vd-coordinates">
              <div className="vendet-vd-field">
                <label htmlFor="addressLat">Latitude</label>

                <input
                  id="addressLat"
                  type="text"
                  className="vendet-vd-input"
                  value={addressDraft.lat}
                  placeholder="-"
                  readOnly
                />
              </div>

              <div className="vendet-vd-field">
                <label htmlFor="addressLng">Longitude</label>

                <input
                  id="addressLng"
                  type="text"
                  className="vendet-vd-input"
                  value={addressDraft.lng}
                  placeholder="-"
                  readOnly
                />
              </div>
            </div>

            <div className="vendet-vd-address-submit">
              <button
                type="button"
                className="vendet-vd-primary-button"
                onClick={handleAddAddress}
                disabled={addingAddress}
              >
                {addingAddress ? (
                  <span className="vendet-vd-spinner" aria-hidden="true" />
                ) : Number(addressDraft.addressId) > 0 ? (
                  <FaSave />
                ) : (
                  <FaPlus />
                )}

                {addingAddress
                  ? "Saving..."
                  : Number(addressDraft.addressId) > 0
                    ? "Update Address"
                    : "Add Address"}

                {addingAddress ? "Adding..." : "Add Address"}
              </button>
            </div>

            <p className="vendet-vd-address-tip">
              Tip: click on the map or drag the marker and the address fills in
              automatically. Addresses are saved as soon as you add or remove
              them.
            </p>
          </div>

          <div className="vendet-vd-map-wrapper">
            <div ref={mapContainerRef} className="vendet-vd-map" />

            {mapStatus !== "ready" && (
              <div className="vendet-vd-map-message" role="status">
                {mapStatus === "loading" ? (
                  <>
                    <span
                      className="vendet-vd-spinner vendet-vd-spinner-dark"
                      aria-hidden="true"
                    />
                    Loading map...
                  </>
                ) : (
                  <>
                    <FaExclamationCircle />
                    {mapError}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="vendet-vd-table-wrapper vendet-vd-address-table-wrapper">
          <table className="vendet-vd-table vendet-vd-address-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Address</th>
                <th>Lat</th>
                <th>Long</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {addressesLoading && (
                <tr>
                  <td colSpan="5" className="vendet-vd-empty-row">
                    Loading addresses...
                  </td>
                </tr>
              )}

              {!addressesLoading && addresses.length === 0 && (
                <tr>
                  <td colSpan="5" className="vendet-vd-empty-row">
                    No address has been added yet.
                  </td>
                </tr>
              )}

              {!addressesLoading &&
                addresses.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td>{index + 1}</td>
                    <td className="vendet-vd-address-cell">{item.address}</td>
                    <td>{formatCoordinate(item.lat)}</td>
                    <td>{formatCoordinate(item.lng)}</td>
                    <td>
                      <div className="vendet-vd-row-actions">
                        <button
                          type="button"
                          className="vendet-vd-icon-button"
                          title="Edit address"
                          aria-label="Edit address"
                          onClick={() => handleEditAddress(item)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          className="vendet-vd-icon-button"
                          title="Show on map"
                          aria-label="Show on map"
                          onClick={() => handleLocateAddress(item)}
                          disabled={!mapInstance}
                        >
                          <FaMapMarkerAlt />
                        </button>

                        <button
                          type="button"
                          className="vendet-vd-icon-button vendet-vd-icon-button-danger"
                          title="Remove address"
                          aria-label="Remove address"
                          onClick={() => handleDeleteAddressClick(item)}
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="vendet-vd-actions">
        <button
          type="button"
          className="vendet-vd-primary-button"
          onClick={() => handleSaveDetails("shop")}
          disabled={Boolean(savingSection)}
        >
          {savingSection === "shop" ? (
            <span className="vendet-vd-spinner" aria-hidden="true" />
          ) : (
            <FaSave />
          )}

          {savingSection === "shop" ? "Saving..." : "Update Shop Details"}
        </button>
      </div>
    </div>
  );

  // =========================================================
  // RENDER: DOCUMENTS TAB
  // =========================================================

  const submittedCount = documentConfig.filter((doc) =>
    Boolean(vendorData?.[doc.key]),
  ).length;

  const renderDocumentsTab = () => (
    <div className="vendet-vd-tab-panel">
      <div className="vendet-vd-panel-heading">
        <div>
          <h3>Documents Detail</h3>
          <p>
            {submittedCount} of {documentConfig.length} documents submitted by
            this vendor.
          </p>
        </div>
      </div>

      <div className="vendet-vd-documents">
        {documentConfig.map((doc) => {
          const fileName = vendorData?.[doc.key];
          const url = fileName ? getDocumentUrl(fileName, doc.folder) : "";

          return (
            <div className="vendet-vd-document-row" key={doc.key}>
              <div className="vendet-vd-document-name">
                <FaFileAlt />
                <span>{doc.label}</span>
              </div>

              {fileName ? (
                <div className="vendet-vd-document-actions">
                  <a
                    className="vendet-vd-document-button"
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaEye />
                    View
                  </a>

                  <a
                    className="vendet-vd-document-button vendet-vd-document-button-outline"
                    href={url}
                    download
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaDownload />
                    Download
                  </a>
                </div>
              ) : (
                <span className="vendet-vd-not-submitted">Not Submitted</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="vendet-vd-actions">
        <button
          type="button"
          className="vendet-vd-primary-button"
          onClick={handleUploadDocuments}
        >
          <FaUpload />
          Update Documents
        </button>
      </div>
    </div>
  );

  // =========================================================
  // RENDER: KEYWORDS TAB
  // =========================================================

  const renderKeywordsTab = () => (
    <div className="vendet-vd-tab-panel">
      <div className="vendet-vd-panel-heading">
        <div>
          <h3>Keywords</h3>
          <p>Choose the keywords that apply to this vendor's category.</p>
        </div>

        <span className="vendet-vd-count-badge">
          {selectedKeywordIds.length} selected
        </span>
      </div>

      {keywordsError && (
        <div className="vendet-vd-alert" role="alert">
          <FaExclamationCircle />
          <span>{keywordsError}</span>
          <button
            type="button"
            className="vendet-vd-link-button"
            onClick={loadKeywords}
          >
            Retry
          </button>
        </div>
      )}

      <div className="vendet-vd-keyword-search">
        <FaSearch />

        <input
          type="text"
          value={keywordSearch}
          onChange={(event) => setKeywordSearch(event.target.value)}
          placeholder="Search keywords..."
          aria-label="Search keywords"
        />

        {keywordSearch && (
          <button
            type="button"
            className="vendet-vd-keyword-clear"
            onClick={() => setKeywordSearch("")}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>

      <div className="vendet-vd-keyword-meta">
        {filteredKeywords.length} keyword(s)
      </div>

      <div className="vendet-vd-keyword-list">
        {keywordsLoading && (
          <div className="vendet-vd-empty-row">Loading keywords...</div>
        )}

        {!keywordsLoading && keywords.length === 0 && !keywordsError && (
          <div className="vendet-vd-empty-row">
            There are no keywords for this category yet.
          </div>
        )}

        {!keywordsLoading &&
          keywords.length > 0 &&
          filteredKeywords.length === 0 && (
            <div className="vendet-vd-empty-row">No keyword found.</div>
          )}

        {!keywordsLoading &&
          filteredKeywords.map((item) => {
            const checked = selectedKeywordIds.includes(String(item.id));

            return (
              <label
                className={`vendet-vd-keyword-row ${checked ? "vendet-checked" : ""}`}
                key={item.id}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleKeyword(item.id)}
                />

                <span>{renderHighlighted(item.keyword, searchTerm)}</span>
              </label>
            );
          })}
      </div>

      <div className="vendet-vd-actions">
        <button
          type="button"
          className="vendet-vd-primary-button"
          onClick={() => setConfirmType("keywords")}
          disabled={keywordsLoading || !keywordsLoaded}
        >
          <FaSave />
          Update Keywords
        </button>
      </div>
    </div>
  );

  // =========================================================
  // ACTIVE TAB
  // =========================================================

  const renderActiveTab = () => {
    switch (activeTab) {
      case "shop":
        return renderShopTab();
      case "inprocess":
        return renderBookingTable(
          "inprocess",
          inProcessBookings,
          "Inprocess Booking",
          "Bookings currently in process.",
        );
      case "completed":
        return renderBookingTable(
          "completed",
          completedBookings,
          "Completed Bookings",
          "Previously completed vendor bookings.",
        );
      case "documents":
        return renderDocumentsTab();
      case "keywords":
        return renderKeywordsTab();
      default:
        return renderVendorTab();
    }
  };

  const tabCounts = {
    inprocess: bookingsLoaded ? inProcessBookings.length : null,
    completed: bookingsLoaded ? completedBookings.length : null,
    documents: `${submittedCount}/${documentConfig.length}`,
  };

  // =========================================================
  // PAGE
  // =========================================================

  if (loading && !vendorData) {
    return (
      <div className="vendet-vendor-details-page">
        <h2 className="vendet-vd-page-title">Vendor Details</h2>

        <div className="vendet-vd-card vendet-vd-loading">
          <span
            className="vendet-vd-spinner vendet-vd-spinner-dark"
            aria-hidden="true"
          />
          Loading vendor details...
        </div>
      </div>
    );
  }

  return (
    <div className="vendet-vendor-details-page">
      {/* =====================================================
          PAGE HEADING + BREADCRUMBS
      ===================================================== */}

      <h2 className="vendet-vd-page-title">Vendor Details</h2>

      <ServiceBreadcrumbs
        className="vendet-vd-breadcrumb"
        items={[
          { label: "Vendor List", to: "/vendor_list" },
          { label: "View Vendor" },
        ]}
      />

      {pageError && (
        <div className="vendet-vd-alert" role="alert">
          <FaExclamationCircle />

          <span>{pageError}</span>

          <button
            type="button"
            className="vendet-vd-alert-close"
            onClick={() => setPageError("")}
            aria-label="Dismiss message"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* =====================================================
          VENDOR SUMMARY
      ===================================================== */}

      <div className="vendet-vd-card vendet-vd-summary">
        <div className="vendet-vd-summary-info">
          {vendorData?.image ? (
            <img
              src={getImage(vendorData.image)}
              alt={vendorName || "Vendor"}
              className="vendet-vd-avatar"
            />
          ) : (
            <div className="vendet-vd-avatar vendet-vd-avatar-placeholder">
              <FaStore />
            </div>
          )}

          <div>
            <h3 className="vendet-vd-summary-name">{vendorName || "Vendor"}</h3>

            <div className="vendet-vd-summary-meta">
              <span>ID: #{vendorId}</span>

              {/* <span
                className={`vendet-vd-status-badge ${isActive ? "vendet-active" : "vendet-inactive"}`}
              >
                {isActive ? "Active" : "Inactive"}
              </span> */}
              <span className="vendet-vd-status-badge vendet-active">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="vendet-vd-summary-actions">
          <button
            type="button"
            className={`vendet-vd-status-button ${isActive ? "vendet-deactivate" : "vendet-activate"}`}
            onClick={() => setConfirmType("status")}
          >
            {isActive ? "Deactivate" : "Activate"}
          </button>

          <button
            type="button"
            className="vendet-vd-secondary-button"
            onClick={handleUploadDocuments}
          >
            <FaUpload />
            Upload Documents
          </button>
        </div>
      </div>

      {/* =====================================================
          TABS + CONTENT
      ===================================================== */}

      <div className="vendet-vd-card vendet-vd-main">
        <div className="vendet-vd-tabs-wrapper">
          <div className="vendet-vd-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`vendet-vd-tab ${activeTab === tab.id ? "vendet-active" : ""}`}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.label}

                {tabCounts[tab.id] !== undefined &&
                  tabCounts[tab.id] !== null && (
                    <span className="vendet-vd-tab-count">
                      {tabCounts[tab.id]}
                    </span>
                  )}

                {tab.id === "services" && <FaExternalLinkAlt />}
              </button>
            ))}
          </div>
        </div>

        <div className="vendet-vd-content" role="tabpanel">
          {renderActiveTab()}
        </div>
      </div>

      {/* =====================================================
          CONFIRM + SUCCESS MODALS
      ===================================================== */}

      <ServiceConfirmModal
        isOpen={Boolean(confirmType)}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmType(null)}
      />

      <ServiceSuccessModal
        isOpen={success.open}
        title={success.title}
        message={success.message}
        onClose={() => setSuccess((previous) => ({ ...previous, open: false }))}
      />
    </div>
  );
};

export default VendorDetails;
