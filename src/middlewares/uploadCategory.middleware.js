const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the categories directory exists
const uploadDir = path.join(__dirname, "../../uploads/categories");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 📁 Storage config (categories folder)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName =
            "cat-" +
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

// 📂 Multer instance for categories
const uploadCategory = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max
    },
}).single("image"); // 👈 naming it "image" for category forms

module.exports = uploadCategory;
