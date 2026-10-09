const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const imagesPath = path.join(__dirname, "../assets/images");


fs.mkdirSync(imagesPath, { recursive: true });

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

    cb(
      null,
      `category_${Math.floor(Date.now() / 1000)}${extension}`,
    );
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

    cb(
      null,
      `subcategory_${Math.floor(Date.now() / 1000)}${extension}`,
    );
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
  uploadBannerFile,
  uploadDriverFiles,
  productUploadMiddleware,
  uploadRestaurantFiles,
  uploadRestaurantCategory,
  uploadRestaurantSubCategory,
};
