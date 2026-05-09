const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the products directory exists
const uploadDir = path.join(__dirname, "../../uploads/products");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 📁 Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const prefix = file.fieldname === "mainImage" ? "thumb-" : "prod-";
        const uniqueName =
            prefix +
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9);

        cb(null, uniqueName + path.extname(file.originalname));
    },
});

// 🧠 Allow only image types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, WEBP images allowed"), false);
    }
};

// 📂 Multer instance for Products
const uploadProduct = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max per file
    },
}).fields([
    { name: "mainImage", maxCount: 1 }, // Thumbnail image
    { name: "images", maxCount: 10 },    // Multiple product gallery images
]);

module.exports = uploadProduct;
