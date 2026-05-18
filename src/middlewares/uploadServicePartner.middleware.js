const multer = require("multer");
const path = require("path");

// 📁 Storage config (service partner documents folder)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/partners");
    },
    filename: function (req, file, cb) {
        const uniqueName =
            file.fieldname +
            "-" +
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

// 🚫 File size limit
const uploadPartnerDocs = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
}).fields([
    { name: "avatar", maxCount: 1 },
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
    { name: "panImage", maxCount: 1 },
    { name: "dlImage", maxCount: 1 }
]);

module.exports = uploadPartnerDocs;
