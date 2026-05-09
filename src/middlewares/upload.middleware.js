const multer = require("multer");
const path = require("path");

// 📁 Storage config (avatar folder only)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/avatars");
    },
    filename: function (req, file, cb) {
        const uniqueName =
            "avatar-" +
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9);

        cb(null, uniqueName + path.extname(file.originalname));
    },
});

// 🧠 Allow only image types (strict)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, WEBP images allowed"), false);
    }
};

// 🚫 File size limit (important)
const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max
    },
}).single("avatar"); // 👈 only one file with field name "avatar"

module.exports = uploadAvatar;