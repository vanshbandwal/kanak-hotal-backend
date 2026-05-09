const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the brands directory exists
const uploadDir = path.join(__dirname, "../../uploads/brands");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 📁 Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName =
            "brand-" +
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9);

        cb(null, uniqueName + path.extname(file.originalname));
    },
});

// 🧠 Allow only image types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/svg+xml"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, WEBP, SVG images allowed"), false);
    }
};

const uploadBrand = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max
    },
}).single("logo");

module.exports = uploadBrand;
