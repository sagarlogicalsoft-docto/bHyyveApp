import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../../../config/api";
import "./editRestaurantItem.css";
import { useNavigate, useParams } from "react-router-dom";
import SuccessModal from "../../../../Components/common/modal/SuccessModal";
import { getImage } from "../../../../Components/utils/images";

/* ------------------------------------------------------------------ */
/* Icons                                                              */
/* ------------------------------------------------------------------ */

const ChevronLeft = (props) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const UtensilsCrossed = (props) => (
  <svg
    width={22}
    height={22}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
    <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3" />
    <path d="m2.1 21.8 6.4-6.3" />
    <path d="m19 15-6 6" />
  </svg>
);

const ClipboardList = (props) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="15" y2="16" />
    <line x1="9" y1="8" x2="11" y2="8" />
  </svg>
);

const Tags = (props) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L4 3a1 1 0 0 0-1 1l.24 5.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.34-4.34a2 2 0 0 0 .01-2.83Z" />
    <circle cx="7.5" cy="7.5" r="1.2" />
  </svg>
);

const ImagePlus = (props) => (
  <svg
    width={28}
    height={28}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
    <path d="M19 16v6" />
    <path d="M16 19h6" />
  </svg>
);

const Lock = (props) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UploadCloud = (props) => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 16l-4-4-4 4" />
    <path d="M12 12v9" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const X = (props) => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Loader2 = (props) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const PlusCircle = (props) => (
  <svg
    width={26}
    height={26}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const Plus = (props) => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const Pencil = (props) => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);

const Trash2 = (props) => (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const Layers = (props) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const SlidersHorizontal = (props) => (
  <svg
    width={26}
    height={26}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="21" y1="4" x2="14" y2="4" />
    <line x1="10" y1="4" x2="3" y2="4" />
    <line x1="21" y1="12" x2="12" y2="12" />
    <line x1="8" y1="12" x2="3" y2="12" />
    <line x1="21" y1="20" x2="16" y2="20" />
    <line x1="12" y1="20" x2="3" y2="20" />
    <circle cx="14" cy="4" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="16" cy="20" r="2" />
  </svg>
);

const ImageIcon = (props) => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* API service                                                        */
/* ------------------------------------------------------------------ */

const restaurantItemService = {
  getRestaurantItemDetails: (itemId) =>
    api.get(`/restaurant/products/${itemId}/edit`),

  getRestaurantItemAddons: (itemId) =>
    api.get(`/restaurant/products/${itemId}/addons`),

  updateRestaurantItem: (itemId, formData) =>
    api.patch(`/restaurant/products/${itemId}`, formData),

  saveAddonGroup: (formData) =>
    api.post("/restaurant/products/addon-group", formData),

  deleteAddonGroup: (groupId) =>
    api.delete(`/restaurant/products/addon-group/${groupId}`),

  updateAddon: (addonId, data) =>
    api.patch(`/restaurant/products/addon/${addonId}`, data),

  deleteAddon: (addonId) =>
    api.delete(`/restaurant/products/addon/${addonId}`, {
      data: { addon_id: addonId },
    }),
};

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const FIXED_CATEGORY = {
  id: 118,
  label: "Restaurants",
};

const ITEM_TYPES = [
  { id: "veg", name: "Veg" },
  { id: "non_veg", name: "Non Veg" },
];

const SELECTION_TYPES = [
  { id: "optional", name: "Optional" },
  { id: "required", name: "Required" },
];

const ADDON_TOPPING_TYPES = [
  {
    id: "addon",
    title: "Addon",
    hint: "e.g. Size, Extra Cheese",
    Icon: PlusCircle,
  },
  {
    id: "topping",
    title: "Topping",
    hint: "Name + Image + Price",
    Icon: null,
  },
];

const MAX_IMAGE_MB = 1;

const RECOMMENDED_RATIO = 2;
const RATIO_TOLERANCE = 0.05;

const ACCEPTED_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const INITIAL_FORM = {
  itemName: "",
  description: "",
  vendorId: "",
  subCategoryId: "",
  menuId: "",
  itemType: "",
  unitPrice: "",
  discountPrice: "",
};

let uidCounter = 0;
const makeId = (prefix) => {
  uidCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${uidCounter}`;
};

const emptyAddonOptionRow = () => ({
  rowId: makeId("opt"),
  id: null,
  name: "",
  price: "",
});

const emptyToppingRow = () => ({
  rowId: makeId("top"),
  id: null,
  name: "",
  price: "",
  imageFile: null,
  imagePreview: null,
  existingImageUrl: "",
  existingImage: "",
});

const emptyAddonForm = () => ({
  title: "",
  selection: "optional",
  options: [emptyAddonOptionRow()],
});

const emptyToppingForm = () => ({
  selection: "optional",
  toppings: [emptyToppingRow()],
});

export default function EditRestaurantItem({ onUpdated }) {
  const navigate = useNavigate();
  const { id: itemId } = useParams();

  const [formData, setFormData] = useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageWarning, setImageWarning] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const [vendors, setVendors] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [menus, setMenus] = useState([]);

  const [addonsToppings, setAddonsToppings] = useState([]);

  const [loadingPageData, setLoadingPageData] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState("type");
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [addonForm, setAddonForm] = useState(emptyAddonForm());
  const [toppingForm, setToppingForm] = useState(emptyToppingForm());
  const [modalErrors, setModalErrors] = useState({});

  const toppingFileInputRefs = useRef({});

  // const getImageUrl = useCallback((image) => {
  //   if (!image) return "";
  //   if (image.startsWith("http://") || image.startsWith("https://")) {
  //     return image;
  //   }
  //   const baseUrl = api.defaults?.baseURL
  //     ? api.defaults.baseURL.replace(/\/api\/?$/, "")
  //     : "";
  //   return `${baseUrl}/assets/images/${image}`;
  // }, []);

  /* ---------------------------------------------------------------- */
  /* Load Edit Restaurant Item Page Data                              */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    const loadPageData = async () => {
      setLoadingPageData(true);
      setLoadError("");

      try {
        const [itemResponse, addonsResponse] = await Promise.all([
          restaurantItemService.getRestaurantItemDetails(itemId),
          restaurantItemService.getRestaurantItemAddons(itemId),
        ]);

        if (!mounted) return;

        const data = itemResponse?.data?.data ?? itemResponse?.data ?? {};
        const item = data.item ?? {};

        setVendors(Array.isArray(data.vendors) ? data.vendors : []);
        setSubCategories(
          Array.isArray(data.sub_categories) ? data.sub_categories : [],
        );
        setMenus(Array.isArray(data.menus) ? data.menus : []);

        setFormData({
          itemName: item.name ?? "",
          description: item.description ?? "",
          vendorId: item.vendor_id ?? "",
          subCategoryId: item.sub_cat_id ?? "",
          menuId: item.menu_id ?? "",
          itemType: item.item_type ?? "",
          unitPrice: item.unit_price ?? "",
          discountPrice: item.discount_price ?? "",
        });

        if (item.item_image) {
          setExistingImageUrl(getImage(item.item_image));
        }

        const groups = addonsResponse?.data?.data ?? [];

        if (Array.isArray(groups)) {
          setAddonsToppings(
            groups.map((group) => ({
              entryId: makeId("entry"),
              groupId: group.id ?? group.group_id,
              type: group.type,
              title: group.title ?? "",
              selection:
                Number(group.is_required) === 1 ? "required" : "optional",
              options:
                group.type === "addon"
                  ? Array.isArray(group.options)
                    ? group.options.map((opt) => ({
                        rowId: makeId("opt"),
                        id: opt.id ?? null,
                        name: opt.name ?? "",
                        price: opt.price ?? "",
                      }))
                    : []
                  : [],
              toppings:
                group.type === "topping"
                  ? Array.isArray(group.options)
                    ? group.options.map((opt) => ({
                        rowId: makeId("top"),
                        id: opt.id ?? null,
                        name: opt.name ?? "",
                        price: opt.price ?? "",
                        imageFile: null,
                        imagePreview: null,
                        existingImageUrl: getImage(opt.image),
                        existingImage: opt.image ?? "",
                      }))
                    : []
                  : [],
            })),
          );
        } else {
          setAddonsToppings([]);
        }
      } catch (error) {
        if (!mounted) return;

        setLoadError(
          error?.response?.data?.msg || "Unable to load this restaurant item.",
        );
      } finally {
        if (mounted) {
          setLoadingPageData(false);
        }
      }
    };

    if (itemId) {
      loadPageData();
    }

    return () => {
      mounted = false;
    };
  }, [itemId, getImage]);

  /* ---------------------------------------------------------------- */
  /* Form change                                                      */
  /* ---------------------------------------------------------------- */

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, formData[field]),
    }));
  };

  /* ---------------------------------------------------------------- */
  /* Validation                                                       */
  /* ---------------------------------------------------------------- */

  const validateField = (field, value) => {
    switch (field) {
      case "itemName":
        return value.trim() ? "" : "Item name is required.";
      case "description":
        return value.trim() ? "" : "Description is required.";
      case "vendorId":
        return value ? "" : "Select a vendor.";
      case "subCategoryId":
        return value ? "" : "Select a sub-category.";
      case "menuId":
        return value ? "" : "Select a menu.";
      case "itemType":
        return value ? "" : "Select an item type.";
      case "unitPrice":
        return value !== "" && Number(value) > 0
          ? ""
          : "Enter a valid unit price.";
      case "discountPrice":
        return value === "" || Number(value) >= 0
          ? ""
          : "Enter a valid discount price.";
      default:
        return "";
    }
  };

  const validateAll = () => {
    const requiredFields = [
      "itemName",
      "description",
      "vendorId",
      "subCategoryId",
      "menuId",
      "itemType",
      "unitPrice",
    ];

    const nextErrors = {};

    requiredFields.forEach((field) => {
      const message = validateField(field, formData[field]);
      if (message) {
        nextErrors[field] = message;
      }
    });

    if (formData.discountPrice === "") {
      nextErrors.discountPrice = "Discount price is required.";
    }

    if (!imageFile && !existingImageUrl) {
      nextErrors.image = "Item image is required.";
    }

    setErrors(nextErrors);
    setTouched({
      itemName: true,
      description: true,
      vendorId: true,
      subCategoryId: true,
      menuId: true,
      itemType: true,
      unitPrice: true,
      discountPrice: true,
      image: true,
    });

    return Object.keys(nextErrors).length === 0;
  };

  /* ---------------------------------------------------------------- */
  /* Item image validation                                            */
  /* ---------------------------------------------------------------- */

  const validateImage = (file) =>
    new Promise((resolve) => {
      if (!ACCEPTED_MIME.includes(file.type)) {
        resolve({
          error: "Only JPG, JPEG, PNG, WEBP or GIF files are allowed.",
        });
        return;
      }

      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        resolve({
          error: `Image must be smaller than ${MAX_IMAGE_MB}MB.`,
        });
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const ratio = img.width / img.height;
        URL.revokeObjectURL(objectUrl);
        const offRatio = Math.abs(ratio - RECOMMENDED_RATIO) > RATIO_TOLERANCE;
        resolve({
          error: "",
          warning: offRatio
            ? "For best results, use an image with a 2:1 aspect ratio."
            : "",
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ error: "" });
      };

      img.src = objectUrl;
    });

  const applyImageFile = useCallback(async (file) => {
    if (!file) return;
    const { error, warning } = await validateImage(file);

    if (error) {
      setImageError(error);
      setImageWarning("");
      return;
    }

    setImageError("");
    setImageWarning(warning || "");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    applyImageFile(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    applyImageFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl("");
    setImageError("");
    setImageWarning("");
    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  };

  /* ---------------------------------------------------------------- */
  /* Addon / Topping modal — open / navigate / close                  */
  /* ---------------------------------------------------------------- */

  const openAddModal = () => {
    setEditingEntryId(null);
    setAddonForm(emptyAddonForm());
    setToppingForm(emptyToppingForm());
    setModalErrors({});
    setModalStep("type");
    setShowModal(true);
  };

  const openEditModal = (entry) => {
    setEditingEntryId(entry.entryId);
    setModalErrors({});

    if (entry.type === "addon") {
      setAddonForm({
        title: entry.title,
        selection: entry.selection,
        options:
          entry.options.length > 0
            ? entry.options.map((opt) => ({ ...opt }))
            : [emptyAddonOptionRow()],
      });
      setModalStep("addon-form");
    } else {
      setToppingForm({
        selection: entry.selection,
        toppings:
          entry.toppings.length > 0
            ? entry.toppings.map((top) => ({ ...top }))
            : [emptyToppingRow()],
      });
      setModalStep("topping-form");
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalStep("type");
    setEditingEntryId(null);
    setModalErrors({});
  };

  const selectAddonToppingType = (type) => {
    if (type === "addon") {
      setAddonForm(emptyAddonForm());
      setModalStep("addon-form");
    } else {
      setToppingForm(emptyToppingForm());
      setModalStep("topping-form");
    }
  };

  const goBackToTypeSelect = () => {
    setModalErrors({});
    setModalStep("type");
    setEditingEntryId(null);
  };

  const removeAddonToppingEntry = async (entryId) => {
    const entry = addonsToppings.find((item) => item.entryId === entryId);
    if (!entry) return;

    if (!entry.groupId) {
      setAddonsToppings((prev) => prev.filter((e) => e.entryId !== entryId));
      return;
    }

    try {
      const res = await restaurantItemService.deleteAddonGroup(entry.groupId);

      if (res?.data?.result) {
        setAddonsToppings((prev) => prev.filter((e) => e.entryId !== entryId));
      }
    } catch (error) {
      setSubmitError(
        error?.response?.data?.msg ||
          "Unable to remove this addon/topping group.",
      );
    }
  };

  /* ---------------------------------------------------------------- */
  /* Addon form                                                       */
  /* ---------------------------------------------------------------- */

  const handleAddonFieldChange = (field) => (e) => {
    const value = e.target.value;
    setAddonForm((prev) => ({ ...prev, [field]: value }));
    if (modalErrors[field]) {
      setModalErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddonOptionChange = (rowId, field) => (e) => {
    const value = e.target.value;
    setAddonForm((prev) => ({
      ...prev,
      options: prev.options.map((row) =>
        row.rowId === rowId ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const addAddonOptionRow = () => {
    setAddonForm((prev) => ({
      ...prev,
      options: [...prev.options, emptyAddonOptionRow()],
    }));
  };

  const removeAddonOptionRow = (rowId) => {
    setAddonForm((prev) => ({
      ...prev,
      options:
        prev.options.length > 1
          ? prev.options.filter((row) => row.rowId !== rowId)
          : prev.options,
    }));
  };

  const validateAddonForm = () => {
    const nextErrors = {};

    if (!addonForm.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    const hasValidRow = addonForm.options.some(
      (row) => row.name.trim() && row.price !== "",
    );

    if (!hasValidRow) {
      nextErrors.options = "Add at least one option with a name and price.";
    }

    setModalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveAddonEntry = async () => {
    if (!validateAddonForm()) return;

    const entry = editingEntryId
      ? addonsToppings.find((item) => item.entryId === editingEntryId)
      : null;

    const payload = new FormData();

    payload.append("vendor_id", formData.vendorId);
    payload.append("item_id", itemId);
    payload.append("sub_cat_id", formData.subCategoryId);
    payload.append("type", "addon");
    payload.append("title", addonForm.title.trim());
    payload.append(
      "is_required",
      addonForm.selection === "required" ? "1" : "0",
    );

    if (entry?.groupId) {
      payload.append("group_id", entry.groupId);
    }

    addonForm.options
      .filter((row) => row.name.trim() && row.price !== "")
      .forEach((row) => {
        payload.append("option_name[]", row.name.trim());
        payload.append("option_price[]", row.price);

        if (row.existingImage) {
          payload.append("existing_image[]", row.existingImage);
        } else {
          payload.append("existing_image[]", "");
        }
      });

    try {
      const res = await restaurantItemService.saveAddonGroup(payload);

      if (!res?.data?.result) {
        setModalErrors({
          submit: res?.data?.msg || "Unable to save this addon.",
        });
        return;
      }

      const group = res.data.data;

      const nextEntry = {
        entryId: entry?.entryId || makeId("entry"),
        groupId: group?.group_id ?? group?.id ?? entry?.groupId,
        type: "addon",
        title: group?.title ?? addonForm.title.trim(),
        selection:
          Number(group?.is_required) === 1 ? "required" : addonForm.selection,
        options: Array.isArray(group?.options)
          ? group.options.map((opt) => ({
              rowId: makeId("opt"),
              id: opt.id ?? null,
              name: opt.name ?? "",
              price: opt.price ?? "",
            }))
          : addonForm.options
              .filter((row) => row.name.trim() && row.price !== "")
              .map((row) => ({ ...row })),
        toppings: [],
      };

      setAddonsToppings((prev) =>
        entry
          ? prev.map((item) =>
              item.entryId === entry.entryId ? nextEntry : item,
            )
          : [...prev, nextEntry],
      );

      closeModal();
    } catch (error) {
      setModalErrors({
        submit: error?.response?.data?.msg || "Unable to save this addon.",
      });
    }
  };

  /* ---------------------------------------------------------------- */
  /* Topping form                                                     */
  /* ---------------------------------------------------------------- */

  const handleToppingSelectionChange = (e) => {
    const value = e.target.value;
    setToppingForm((prev) => ({ ...prev, selection: value }));
  };

  const handleToppingRowChange = (rowId, field) => (e) => {
    const value = e.target.value;
    setToppingForm((prev) => ({
      ...prev,
      toppings: prev.toppings.map((row) =>
        row.rowId === rowId ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const handleToppingImageChange = (rowId) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setToppingForm((prev) => ({
      ...prev,
      toppings: prev.toppings.map((row) =>
        row.rowId === rowId
          ? {
              ...row,
              imageFile: file,
              imagePreview: URL.createObjectURL(file),
            }
          : row,
      ),
    }));

    e.target.value = "";
  };

  const addToppingRow = () => {
    setToppingForm((prev) => ({
      ...prev,
      toppings: [...prev.toppings, emptyToppingRow()],
    }));
  };

  const removeToppingRow = (rowId) => {
    setToppingForm((prev) => ({
      ...prev,
      toppings:
        prev.toppings.length > 1
          ? prev.toppings.filter((row) => row.rowId !== rowId)
          : prev.toppings,
    }));
  };

  const validateToppingForm = () => {
    const nextErrors = {};

    const hasValidRow = toppingForm.toppings.some(
      (row) => row.name.trim() && row.price !== "",
    );

    if (!hasValidRow) {
      nextErrors.toppings = "Add at least one topping with a name and price.";
    }

    setModalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveToppingEntry = async () => {
    if (!validateToppingForm()) return;

    const entry = editingEntryId
      ? addonsToppings.find((item) => item.entryId === editingEntryId)
      : null;

    const payload = new FormData();

    payload.append("vendor_id", formData.vendorId);
    payload.append("item_id", itemId);
    payload.append("sub_cat_id", formData.subCategoryId);
    payload.append("type", "topping");
    payload.append("title", "Toppings");
    payload.append(
      "is_required",
      toppingForm.selection === "required" ? "1" : "0",
    );

    if (entry?.groupId) {
      payload.append("group_id", entry.groupId);
    }

    toppingForm.toppings
      .filter((row) => row.name.trim() && row.price !== "")
      .forEach((row, index) => {
        payload.append("option_name[]", row.name.trim());
        payload.append("option_price[]", row.price);
        payload.append("existing_image[]", row.existingImage || "");

        if (row.imageFile) {
          payload.append(`option_image_${index}`, row.imageFile);
        }
      });

    try {
      const res = await restaurantItemService.saveAddonGroup(payload);

      if (!res?.data?.result) {
        setModalErrors({
          submit: res?.data?.msg || "Unable to save this topping.",
        });
        return;
      }

      const group = res.data.data;

      const nextEntry = {
        entryId: entry?.entryId || makeId("entry"),
        groupId: group?.group_id ?? group?.id ?? entry?.groupId,
        type: "topping",
        title: group?.title ?? "Toppings",
        selection:
          Number(group?.is_required) === 1 ? "required" : toppingForm.selection,
        options: [],
        toppings: Array.isArray(group?.options)
          ? group.options.map((opt) => ({
              rowId: makeId("top"),
              id: opt.id ?? null,
              name: opt.name ?? "",
              price: opt.price ?? "",
              imageFile: null,
              imagePreview: null,
              existingImageUrl: getImage(opt.image),
              existingImage: opt.image ?? "",
            }))
          : toppingForm.toppings
              .filter((row) => row.name.trim() && row.price !== "")
              .map((row) => ({ ...row })),
      };

      setAddonsToppings((prev) =>
        entry
          ? prev.map((item) =>
              item.entryId === entry.entryId ? nextEntry : item,
            )
          : [...prev, nextEntry],
      );

      closeModal();
    } catch (error) {
      setModalErrors({
        submit: error?.response?.data?.msg || "Unable to save this topping.",
      });
    }
  };

  /* ---------------------------------------------------------------- */
  /* Submit                                                           */
  /* ---------------------------------------------------------------- */

  const buildPayload = () => {
    const payload = new FormData();

    payload.append("item_id", itemId);
    payload.append("vendor_id", formData.vendorId);
    payload.append("name", formData.itemName.trim());
    payload.append("description", formData.description.trim());
    payload.append("item_type", formData.itemType);
    payload.append("unit_price", formData.unitPrice);
    payload.append("discount_price", formData.discountPrice);
    payload.append("sub_cat_id", formData.subCategoryId);
    payload.append("menu_id", formData.menuId);
    payload.append("remove_image", imageFile ? "0" : "0");

    if (imageFile) {
      payload.append("item_image", imageFile);
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await restaurantItemService.updateRestaurantItem(
        itemId,
        buildPayload(),
      );

      if (res?.data?.result) {
        setSubmitSuccess(true);
        onUpdated?.(res.data.data);
      } else {
        setSubmitError(res?.data?.msg || "Unable to update this item.");
      }
    } catch (err) {
      setSubmitError(
        err?.response?.data?.msg ||
          "Something went wrong while saving this item. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldError = (field) =>
    touched[field] && errors[field] ? errors[field] : "";

  const displayImage = imagePreview || existingImageUrl;

  return (
    <div className="eri-page">
      <header className="eri-header">
        <h1 className="eri-title">
          <UtensilsCrossed size={22} strokeWidth={2} />
          Edit Restaurant Item
        </h1>

        <button
          type="button"
          className="eri-back-btn"
          onClick={() => navigate("/restaurant/product_list")}
          disabled={isSubmitting}
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          Back To List
        </button>
      </header>

      {loadError && (
        <div className="eri-banner eri-banner--error" role="alert">
          {loadError}
        </div>
      )}

      {submitError && (
        <div className="eri-banner eri-banner--error" role="alert">
          {submitError}
        </div>
      )}

      <form className="eri-form" onSubmit={handleSubmit} noValidate>
        <section className="eri-card">
          <div className="eri-card-header">
            <div className="eri-card-heading">
              <ClipboardList size={18} strokeWidth={2.25} />
              <h2>General Information</h2>
            </div>

            <p className="eri-card-subtext">
              Update the basic information of the item
            </p>
          </div>

          <div className="eri-card-body eri-general-grid">
            <div className="eri-fields-col">
              <div className="eri-field">
                <label htmlFor="itemName">
                  Item Name <span className="eri-required">*</span>
                </label>

                <input
                  id="itemName"
                  type="text"
                  placeholder="Enter item name"
                  value={formData.itemName}
                  onChange={handleChange("itemName")}
                  onBlur={handleBlur("itemName")}
                  disabled={loadingPageData}
                  className={
                    fieldError("itemName")
                      ? "eri-input eri-input--error"
                      : "eri-input"
                  }
                />

                {fieldError("itemName") && (
                  <span className="eri-error-text">
                    {fieldError("itemName")}
                  </span>
                )}
              </div>

              <div className="eri-field">
                <label htmlFor="description">
                  Description <span className="eri-required">*</span>
                </label>

                <textarea
                  id="description"
                  rows={5}
                  placeholder="Enter item description"
                  value={formData.description}
                  onChange={handleChange("description")}
                  onBlur={handleBlur("description")}
                  disabled={loadingPageData}
                  className={
                    fieldError("description")
                      ? "eri-input eri-input--error"
                      : "eri-input"
                  }
                />

                {fieldError("description") && (
                  <span className="eri-error-text">
                    {fieldError("description")}
                  </span>
                )}
              </div>
            </div>

            <div className="eri-field eri-image-field">
              <label>
                Item Image <span className="eri-required">*</span>
              </label>

              <p className="eri-image-hint">
                JPG, JPEG, PNG, WEBP or GIF less than 1MB (2:1 ratio
                recommended)
              </p>

              {displayImage ? (
                <div className="eri-image-preview">
                  <img src={displayImage} alt="Item preview" />

                  <button
                    type="button"
                    className="eri-image-remove"
                    onClick={handleRemoveImage}
                    aria-label="Remove image"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <div
                  className={
                    isDragging
                      ? "eri-dropzone eri-dropzone--active"
                      : "eri-dropzone"
                  }
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <ImagePlus
                    size={28}
                    strokeWidth={1.5}
                    className="eri-dropzone-icon"
                  />

                  <span className="eri-dropzone-link">
                    <UploadCloud size={14} strokeWidth={2} />
                    Click to upload
                  </span>

                  <span className="eri-dropzone-text">Or drag and drop</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleFileInputChange}
                hidden
              />

              {(imageError || fieldError("image")) && (
                <span className="eri-error-text">
                  {imageError || fieldError("image")}
                </span>
              )}

              {!imageError && imageWarning && (
                <span className="eri-warning-text">{imageWarning}</span>
              )}
            </div>
          </div>
        </section>

        <section className="eri-card">
          <div className="eri-card-header">
            <div className="eri-card-heading">
              <Tags size={18} strokeWidth={2.25} />
              <h2>Category &amp; Pricing</h2>
            </div>

            <p className="eri-card-subtext">
              Select category, sub-category and set pricing
            </p>
          </div>

          <div className="eri-card-body eri-fields-grid">
            <div className="eri-field">
              <label htmlFor="vendorId">
                Vendor <span className="eri-required">*</span>
              </label>

              <select
                id="vendorId"
                value={formData.vendorId}
                onChange={handleChange("vendorId")}
                onBlur={handleBlur("vendorId")}
                className={
                  fieldError("vendorId")
                    ? "eri-input eri-input--error"
                    : "eri-input"
                }
                disabled={loadingPageData}
              >
                <option value="">
                  {loadingPageData ? "Loading vendors..." : "Select vendor"}
                </option>

                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.business_name || vendor.name}
                  </option>
                ))}
              </select>

              {fieldError("vendorId") && (
                <span className="eri-error-text">{fieldError("vendorId")}</span>
              )}
            </div>

            <div className="eri-field">
              <label htmlFor="category">Category</label>
              <div
                className="eri-locked-select"
                id="category"
                data-category-id={FIXED_CATEGORY.id}
              >
                {FIXED_CATEGORY.label}
              </div>
              <span className="eri-lock-hint">
                <Lock size={12} strokeWidth={2.5} />
                Fixed category
              </span>
            </div>

            <div className="eri-field">
              <label htmlFor="subCategoryId">
                Sub-Category <span className="eri-required">*</span>
              </label>
              <select
                id="subCategoryId"
                value={formData.subCategoryId}
                onChange={handleChange("subCategoryId")}
                onBlur={handleBlur("subCategoryId")}
                className={
                  fieldError("subCategoryId")
                    ? "eri-input eri-input--error"
                    : "eri-input"
                }
                disabled={loadingPageData}
              >
                <option value="">
                  {loadingPageData ? "Loading..." : "Select sub-category"}
                </option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              {fieldError("subCategoryId") && (
                <span className="eri-error-text">
                  {fieldError("subCategoryId")}
                </span>
              )}
            </div>

            <div className="eri-field">
              <label htmlFor="menuId">
                Menu Name <span className="eri-required">*</span>
              </label>
              <select
                id="menuId"
                value={formData.menuId}
                onChange={handleChange("menuId")}
                onBlur={handleBlur("menuId")}
                className={
                  fieldError("menuId")
                    ? "eri-input eri-input--error"
                    : "eri-input"
                }
                disabled={loadingPageData}
              >
                <option value="">
                  {loadingPageData ? "Loading..." : "Select Menu"}
                </option>
                {menus.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
              </select>
              {fieldError("menuId") && (
                <span className="eri-error-text">{fieldError("menuId")}</span>
              )}
            </div>

            <div className="eri-field">
              <label htmlFor="itemType">
                Item Type <span className="eri-required">*</span>
              </label>
              <select
                id="itemType"
                value={formData.itemType}
                onChange={handleChange("itemType")}
                onBlur={handleBlur("itemType")}
                className={
                  fieldError("itemType")
                    ? "eri-input eri-input--error"
                    : "eri-input"
                }
              >
                <option value="">Select type</option>
                {ITEM_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {fieldError("itemType") && (
                <span className="eri-error-text">{fieldError("itemType")}</span>
              )}
            </div>

            <div className="eri-field">
              <label htmlFor="unitPrice">
                Unit Price <span className="eri-required">*</span>
              </label>
              <div
                className={
                  fieldError("unitPrice")
                    ? "eri-prefix-input eri-prefix-input--error"
                    : "eri-prefix-input"
                }
              >
                <span className="eri-prefix">$</span>
                <input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.unitPrice}
                  onChange={handleChange("unitPrice")}
                  onBlur={handleBlur("unitPrice")}
                />
              </div>
              {fieldError("unitPrice") && (
                <span className="eri-error-text">
                  {fieldError("unitPrice")}
                </span>
              )}
            </div>

            <div className="eri-field">
              <label htmlFor="discountPrice">
                Discount Price <span className="eri-required">*</span>
              </label>
              <div
                className={
                  fieldError("discountPrice")
                    ? "eri-prefix-input eri-prefix-input--error"
                    : "eri-prefix-input"
                }
              >
                <span className="eri-prefix">$</span>
                <input
                  id="discountPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={formData.discountPrice}
                  onChange={handleChange("discountPrice")}
                  onBlur={handleBlur("discountPrice")}
                />
              </div>

              {fieldError("discountPrice") && (
                <span className="eri-error-text">
                  {fieldError("discountPrice")}
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="eri-card">
          <div className="eri-card-header eri-addons-header">
            <div>
              <div className="eri-card-heading">
                <Layers size={18} strokeWidth={2.25} />
                <h2>Addons &amp; Toppings</h2>
              </div>

              <p className="eri-card-subtext">
                Manage addons and toppings for this item.
              </p>
            </div>

            <button
              type="button"
              className="eri-btn eri-btn--primary eri-add-addon-btn"
              onClick={openAddModal}
            >
              <Plus size={14} strokeWidth={2.5} />
              Add Addon / Topping
            </button>
          </div>

          <div className="eri-card-body">
            {addonsToppings.length === 0 ? (
              <p className="eri-empty-text">
                No addons or toppings have been added yet.
              </p>
            ) : (
              <div className="eri-addon-list">
                {addonsToppings.map((entry) => (
                  <div className="eri-addon-card" key={entry.entryId}>
                    <div className="eri-addon-card-header">
                      <div className="eri-addon-card-heading">
                        <h3 className="eri-addon-card-title">
                          {entry.type === "addon" ? entry.title : "Toppings"}
                        </h3>

                        <span
                          className={
                            entry.type === "addon"
                              ? "eri-type-badge eri-type-badge--addon"
                              : "eri-type-badge eri-type-badge--topping"
                          }
                        >
                          {entry.type === "addon" ? "Addon" : "Topping"}
                        </span>

                        <span
                          className={
                            entry.selection === "required"
                              ? "eri-selection-badge eri-selection-badge--required"
                              : "eri-selection-badge eri-selection-badge--optional"
                          }
                        >
                          {entry.selection === "required"
                            ? "Required"
                            : "Optional"}
                        </span>
                      </div>

                      <div className="eri-addon-card-actions">
                        <button
                          type="button"
                          className="eri-outline-btn eri-outline-btn--edit"
                          onClick={() => openEditModal(entry)}
                        >
                          <Pencil size={14} strokeWidth={2} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="eri-outline-btn eri-outline-btn--danger"
                          onClick={() => removeAddonToppingEntry(entry.entryId)}
                        >
                          <Trash2 size={14} strokeWidth={2} />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="eri-addon-card-body">
                      {entry.type === "addon"
                        ? entry.options.map((opt) => (
                            <div className="eri-addon-row" key={opt.rowId}>
                              <span className="eri-addon-row-name">
                                {opt.name}
                              </span>
                              <span className="eri-addon-row-price">
                                ${Number(opt.price || 0).toFixed(2)}
                              </span>
                            </div>
                          ))
                        : entry.toppings.map((top) => (
                            <div className="eri-addon-row" key={top.rowId}>
                              <span className="eri-addon-row-thumb">
                                {top.imagePreview || top.existingImageUrl ? (
                                  <img
                                    src={
                                      top.imagePreview || top.existingImageUrl
                                    }
                                    alt=""
                                  />
                                ) : (
                                  <ImageIcon size={13} strokeWidth={1.6} />
                                )}
                              </span>
                              <span className="eri-addon-row-name">
                                {top.name}
                              </span>
                              <span className="eri-addon-row-price">
                                ${Number(top.price || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="eri-actions">
          <button
            type="button"
            className="eri-btn eri-btn--ghost"
            onClick={() => navigate("/restaurant/product_list")}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="eri-btn eri-btn--primary"
            disabled={isSubmitting || loadingPageData}
          >
            {isSubmitting && <Loader2 size={16} className="eri-spin" />}
            {isSubmitting ? "Saving..." : "Update Item"}
          </button>
        </div>
      </form>

      {showModal && (
        <div className="eri-modal-overlay" onClick={closeModal}>
          <div
            className="eri-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {modalStep === "type" && (
              <>
                <div className="eri-modal-header">
                  <h3>Add Addon / Topping</h3>
                </div>

                <div className="eri-modal-body">
                  <p className="eri-modal-intro">Please select a type first:</p>

                  <div className="eri-type-grid">
                    <button
                      type="button"
                      className="eri-type-card"
                      onClick={() => selectAddonToppingType("addon")}
                    >
                      <PlusCircle size={26} strokeWidth={1.6} />
                      <span className="eri-type-card-title">Addon</span>
                      <span className="eri-type-card-hint">
                        e.g. Size, Extra Cheese
                      </span>
                    </button>

                    <button
                      type="button"
                      className="eri-type-card"
                      onClick={() => selectAddonToppingType("topping")}
                    >
                      <SlidersHorizontal size={26} strokeWidth={1.6} />
                      <span className="eri-type-card-title">Topping</span>
                      <span className="eri-type-card-hint">
                        Name + Image + Price
                      </span>
                    </button>
                  </div>
                </div>

                <div className="eri-modal-footer">
                  <button
                    type="button"
                    className="eri-btn eri-btn--ghost"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {modalStep === "addon-form" && (
              <>
                <div className="eri-modal-header">
                  <h3>{editingEntryId ? "Edit Addon" : "Add Addon"}</h3>
                </div>

                <div className="eri-modal-body">
                  <div className="eri-modal-row">
                    <div className="eri-field">
                      <label htmlFor="addonTitle">
                        Title <span className="eri-required">*</span>
                      </label>
                      <input
                        id="addonTitle"
                        type="text"
                        placeholder="e.g. Size / Extra Addons"
                        value={addonForm.title}
                        onChange={handleAddonFieldChange("title")}
                        className={
                          modalErrors.title
                            ? "eri-input eri-input--error"
                            : "eri-input"
                        }
                      />
                      {modalErrors.title && (
                        <span className="eri-error-text">
                          {modalErrors.title}
                        </span>
                      )}
                    </div>

                    <div className="eri-field">
                      <label htmlFor="addonSelection">Selection</label>
                      <select
                        id="addonSelection"
                        className="eri-input"
                        value={addonForm.selection}
                        onChange={handleAddonFieldChange("selection")}
                      >
                        {SELECTION_TYPES.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="eri-modal-divider" />

                  <div className="eri-modal-subheading">Addon Options</div>

                  <div className="eri-row-list">
                    {addonForm.options.map((row) => (
                      <div className="eri-row-item" key={row.rowId}>
                        <input
                          type="text"
                          className="eri-input"
                          placeholder="Option name"
                          value={row.name}
                          onChange={handleAddonOptionChange(row.rowId, "name")}
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="eri-input eri-row-price"
                          placeholder="Price"
                          value={row.price}
                          onChange={handleAddonOptionChange(row.rowId, "price")}
                        />
                        <button
                          type="button"
                          className="eri-row-remove"
                          onClick={() => removeAddonOptionRow(row.rowId)}
                          aria-label="Remove option"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {modalErrors.options && (
                    <span className="eri-error-text">
                      {modalErrors.options}
                    </span>
                  )}

                  {modalErrors.submit && (
                    <span className="eri-error-text">{modalErrors.submit}</span>
                  )}

                  <button
                    type="button"
                    className="eri-btn eri-btn--muted eri-add-row-btn"
                    onClick={addAddonOptionRow}
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    Add Row
                  </button>
                </div>

                <div className="eri-modal-footer">
                  <button
                    type="button"
                    className="eri-btn eri-btn--ghost"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="eri-btn eri-btn--muted"
                    onClick={goBackToTypeSelect}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="eri-btn eri-btn--primary"
                    onClick={saveAddonEntry}
                  >
                    {editingEntryId ? "Update" : "Save"}
                  </button>
                </div>
              </>
            )}

            {modalStep === "topping-form" && (
              <>
                <div className="eri-modal-header">
                  <h3>{editingEntryId ? "Edit Topping" : "Add Topping"}</h3>
                </div>

                <div className="eri-modal-body">
                  <div className="eri-field">
                    <label htmlFor="toppingSelection">Selection</label>
                    <select
                      id="toppingSelection"
                      className="eri-input"
                      value={toppingForm.selection}
                      onChange={handleToppingSelectionChange}
                    >
                      {SELECTION_TYPES.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="eri-modal-divider" />

                  <div className="eri-modal-subheading">Toppings</div>

                  <div className="eri-row-list">
                    {toppingForm.toppings.map((row) => (
                      <div
                        className="eri-row-item eri-row-item--topping"
                        key={row.rowId}
                      >
                        <input
                          type="text"
                          className="eri-input"
                          placeholder="Topping name"
                          value={row.name}
                          onChange={handleToppingRowChange(row.rowId, "name")}
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="eri-input eri-row-price"
                          placeholder="Price"
                          value={row.price}
                          onChange={handleToppingRowChange(row.rowId, "price")}
                        />

                        <label className="eri-file-chip">
                          {row.imagePreview || row.existingImageUrl ? (
                            <img
                              src={row.imagePreview || row.existingImageUrl}
                              alt=""
                              className="eri-file-chip-thumb"
                            />
                          ) : (
                            <ImageIcon size={16} strokeWidth={1.6} />
                          )}
                          <span className="eri-file-chip-text">
                            {row.imageFile
                              ? row.imageFile.name
                              : row.existingImageUrl
                                ? "Change image"
                                : "Choose File"}
                          </span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                            hidden
                            onChange={handleToppingImageChange(row.rowId)}
                          />
                        </label>

                        <button
                          type="button"
                          className="eri-row-remove"
                          onClick={() => removeToppingRow(row.rowId)}
                          aria-label="Remove topping"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {modalErrors.toppings && (
                    <span className="eri-error-text">
                      {modalErrors.toppings}
                    </span>
                  )}

                  {modalErrors.submit && (
                    <span className="eri-error-text">{modalErrors.submit}</span>
                  )}

                  <button
                    type="button"
                    className="eri-btn eri-btn--muted eri-add-row-btn"
                    onClick={addToppingRow}
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    Add Row
                  </button>
                </div>

                <div className="eri-modal-footer">
                  <button
                    type="button"
                    className="eri-btn eri-btn--ghost"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="eri-btn eri-btn--muted"
                    onClick={goBackToTypeSelect}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="eri-btn eri-btn--primary"
                    onClick={saveToppingEntry}
                  >
                    {editingEntryId ? "Update" : "Save"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <SuccessModal
        show={submitSuccess}
        title="Success"
        message="Restaurant item updated successfully."
        buttonText="OK"
        onClose={() => {
          setSubmitSuccess(false);
          navigate("/restaurant/product_list");
        }}
      />
    </div>
  );
}
