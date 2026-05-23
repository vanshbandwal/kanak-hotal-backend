const express = require("express");
const uploadAvatar = require("../../middlewares/upload.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate");
const userSchemas = require("./user.validation");
const userController = require("./user.controller");
const router = express.Router();

// =========================
// 🧾 AUTH ROUTES
// =========================

// Signup
router.post("/signup", validate(userSchemas.signup), userController.signup);

// Login
router.post("/login", validate(userSchemas.login), userController.login);


// Send OTP
router.post("/send-otp", validate(userSchemas.sendOtp), userController.sendOtp);

// Verify OTP
router.post("/verify-otp", validate(userSchemas.verifyOtp), userController.verifyOtp);

// Logout
router.post("/logout", authMiddleware, userController.logout);



// =========================
// 👤 PROFILE ROUTES
// =========================

// Get Profile
router.get("/me", authMiddleware, userController.getProfile);

// Update Profile
router.put("/update", authMiddleware, validate(userSchemas.updateProfile), userController.updateProfile);

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
router.post("/address", authMiddleware, validate(userSchemas.address), userController.addAddress);

// Get All Addresses
router.get("/address", authMiddleware, userController.getAddresses);

// Update Address
router.put(
  "/address/:id",
  authMiddleware,
  validate(userSchemas.updateAddress),
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