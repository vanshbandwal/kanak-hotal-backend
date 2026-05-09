const express = require("express");
const uploadAvatar = require("../../middlewares/upload.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const userController = require("./user.controller");
const router = express.Router();

// Controllers (you
// =========================
// 🧾 AUTH ROUTES
// =========================

// Signup
router.post("/signup", userController.signup);

// Login
router.post("/login", userController.login);


// Send OTP
router.post("/send-otp", userController.sendOtp);

// Verify OTP
router.post("/verify-otp", userController.verifyOtp);

// Logout
router.post("/logout", authMiddleware, userController.logout);



// =========================
// 👤 PROFILE ROUTES
// =========================

// Get Profile
router.get("/me", authMiddleware, userController.getProfile);

// Update Profile
router.put("/update", authMiddleware, userController.updateProfile);

// Upload Avatar
router.post(
  "/upload-avatar",
  authMiddleware,
  uploadAvatar,
  userController.uploadAvatar
);



// =========================
// 📍 ADDRESS ROUTES
// =========================

// Add Address
router.post("/address", authMiddleware, userController.addAddress);

// Get All Addresses
router.get("/address", authMiddleware, userController.getAddresses);

// Update Address
router.put(
  "/address/:id",
  authMiddleware,
  userController.updateAddress
);

// Delete Address
router.delete(
  "/address/:id",
  authMiddleware,
  userController.deleteAddress
);

// Set Default Address
router.patch(
  "/address/default/:id",
  authMiddleware,
  userController.setDefaultAddress
);



module.exports = router;