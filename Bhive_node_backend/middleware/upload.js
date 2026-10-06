const multer = require("multer");
const path = require("path");
const fs = require("fs");

const imagePath = path.join(__dirname, "../assets/images");
const videoPath = path.join(__dirname, "../assets/videos");

// Ensure both directories exist
[imagePath, videoPath].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("video/")) {
      cb(null, videoPath);
    } else if (file.mimetype.startsWith("image/")) {
      cb(null, imagePath);
    } else {
      // fallback (agar koi aur type file aayi)
      cb(null, imagePath);
    }
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + "_" + Math.round(Math.random() * 1e9) + ext;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file
  },
});

module.exports = upload;
