const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const imagesPath = path.join(__dirname, "../assets/images");

fs.mkdirSync(imagesPath, { recursive: true });

// =====================================================
// SERVICE SIDE
// =====================================================

// VENDOR DOCUMENT UPLOAD
const vendorDocumentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../assets/images"));
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(null, `vendor_${Date.now()}_${file.fieldname}${extension}`);
  },
});

const uploadVendorDocuments = multer({
  storage: vendorDocumentStorage,

  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];

    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG and PDF files are allowed."));
    }
  },
}).fields([
  { name: "contract_id", maxCount: 1 },
  { name: "trade_license", maxCount: 1 },
  { name: "owner_id", maxCount: 1 },
  { name: "registration_id", maxCount: 1 },
  { name: "price_list", maxCount: 1 },
  { name: "computer_card", maxCount: 1 },
  { name: "id_proof_1", maxCount: 1 },
  { name: "id_proof_2", maxCount: 1 },
]);

// VENDOR IMAGE AND ID-PROOF UPLOAD
const vendorStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(null, `vendor_${Date.now()}_${file.fieldname}${extension}`);
  },
});

const uploadVendorFiles = multer({
  storage: vendorStorage,
}).fields([
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "business_logo",
    maxCount: 1,
  },
  {
    name: "id_proof",
    maxCount: 1,
  },
  {
    name: "id_proof_two",
    maxCount: 1,
  },
]);

// EXPERT IMAGE UPLOAD
const expertStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../assets/images"));
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(null, `expert_${Date.now()}${extension}`);
  },
});

const uploadExpertImage = multer({
  storage: expertStorage,
}).single("image");

// NORMAL CATEGORY IMAGE UPLOAD
const normalCategoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(null, `category_${Date.now()}${extension}`);
  },
});

const uploadCategoryImage = multer({
  storage: normalCategoryStorage,
}).single("file");

// NORMAL SUBCATEGORY IMAGE UPLOAD
const normalSubCategoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(null, `sub_category_images_${Date.now()}${extension}`);
  },
});

const uploadSubCategoryImage = multer({
  storage: normalSubCategoryStorage,
}).single("file");


 // CATEGORY IMPORT — CSV / XLSX
const uploadCategoryImport = multer({
  storage: multer.memoryStorage(),

  fileFilter: (req, file, cb) => {
    const extension = file.originalname
      .toLowerCase()
      .split(".")
      .pop();

    if (extension === "csv" || extension === "xlsx") {
      cb(null, true);
    } else {
      cb(new Error("Only CSV and XLSX files are allowed."));
    }
  },
}).single("csv_file");

// CATEGORY KEYWORDS CSV IMPORT
const uploadCategoryKeywordsImport = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (extension === ".csv") {
      cb(null, true);
    } else {
      cb(new Error("Please upload a valid CSV file."));
    }
  },
}).single("csv_file");

// VENDOR IMAGE SLIDER UPLOAD
const vendorSliderImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(null, `category${Math.floor(Date.now() / 1000)}${extension}`);
  },
});

const uploadVendorSliderImage = multer({
  storage: vendorSliderImageStorage,
}).single("file");

// SERVICE SIDE CITIES EXCEL IMPORT
const uploadServiceSideCitiesExcel = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".xlsx", ".xls"];
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Only XLSX and XLS Excel files are allowed."));
    }
  },
}).single("file");

// =====================================================
// RESTAURANT SIDE
// =====================================================

// BANNER UPLOAD
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },

  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");

    cb(null, `${Date.now()}_${sanitizedName}`);
  },
});

const uploadBannerFile = multer({
  storage: bannerStorage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
}).single("image");

// DRIVER UPLOAD
const driverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, "_")}`,
    );
  },
});

const uploadDriverFiles = multer({
  storage: driverStorage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
}).fields([
  {
    name: "profile_image",
    maxCount: 1,
  },
  {
    name: "identity_image",
    maxCount: 1,
  },
]);

// PRODUCT UPLOAD
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    // restaurant_item_add()
    if (file.fieldname === "item_image") {
      cb(null, `item_${Math.floor(Date.now() / 1000)}${extension}`);
      return;
    }

    // vendor_restaurant_add_addon_group()
    if (file.fieldname.startsWith("option_image_")) {
      const index = file.fieldname.replace("option_image_", "");

      const uniqueId = crypto.randomBytes(8).toString("hex");

      cb(
        null,
        `${Math.floor(Date.now() / 1000)}_${index}_${uniqueId}${extension}`,
      );
      return;
    }

    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const productFileFilter = (req, file, cb) => {
  const allowedImages = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedImages.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPG, JPEG, PNG, WEBP and GIF files are allowed."),
      false,
    );
  }
};

const productUploadMiddleware = multer({
  storage: productStorage,
  fileFilter: productFileFilter,
  limits: {
    fileSize: 1024 * 1024,
  },
}).any();

// ADD RESTAURANT STORE UPLOAD
const restaurantStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const restaurantFileFilter = (req, file, cb) => {
  const allowedImages = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  const allowedDocuments = ["application/pdf"];

  if (
    allowedImages.includes(file.mimetype) ||
    allowedDocuments.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPG, JPEG, PNG, WEBP, GIF and PDF files are allowed."),
      false,
    );
  }
};

const uploadRestaurantFiles = multer({
  storage: restaurantStorage,
  fileFilter: restaurantFileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
}).fields([
  {
    name: "profilePhoto",
    maxCount: 1,
  },
  {
    name: "idProof",
    maxCount: 1,
  },
  {
    name: "businessLicense",
    maxCount: 1,
  },
  {
    name: "padFile",
    maxCount: 1,
  },
]);

// RESTAURANT CATEGORY UPLOAD
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(null, `category_${Math.floor(Date.now() / 1000)}${extension}`);
  },
});

const uploadRestaurantCategory = multer({
  storage: categoryStorage,
  fileFilter: restaurantFileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
}).single("file");

// RESTAURANT SUB CATEGORY UPLOAD
const subCategoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    cb(null, `subcategory_${Math.floor(Date.now() / 1000)}${extension}`);
  },
});

const uploadRestaurantSubCategory = multer({
  storage: subCategoryStorage,
  fileFilter: restaurantFileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
}).single("file");

module.exports = {
  //SERVICE SIDE
  uploadVendorDocuments,
  uploadVendorFiles,
  uploadExpertImage,
  uploadCategoryImage,
  uploadSubCategoryImage,
  uploadCategoryImport,
  uploadCategoryKeywordsImport,
  uploadVendorSliderImage,
  uploadServiceSideCitiesExcel,

  //RESTAURANT SIDE
  uploadBannerFile,
  uploadDriverFiles,
  productUploadMiddleware,
  uploadRestaurantFiles,
  uploadRestaurantCategory,
  uploadRestaurantSubCategory,
};
