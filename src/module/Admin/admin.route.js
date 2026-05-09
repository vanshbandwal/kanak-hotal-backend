const express = require("express");
const router = express.Router();
const validate = require("../../middlewares/validate");
const adminSchemas = require("./admin.validation");

// Controllers
const {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken,
  deleteAdmin,
  createStaffMember,
  getAllStaff
} = require("./admin.controller");

// Middleware
const authMiddleware = require("../../middlewares/auth.middleware");
const { checkPermission } = require("../../middleware/rbac.middleware");

// Routes
router.post("/register", validate(adminSchemas.register), registerAdmin);
router.post("/login", validate(adminSchemas.login), loginAdmin);
router.post("/logout", authMiddleware, logoutAdmin);

router.get("/me", authMiddleware, getAdminProfile);
router.put("/update-profile", authMiddleware, validate(adminSchemas.updateProfile), updateAdminProfile);
router.put("/change-password", authMiddleware, validate(adminSchemas.changePassword), changePassword);
router.post("/create-staff", authMiddleware, checkPermission("CREATE_ADMIN"), validate(adminSchemas.createStaff), createStaffMember);
router.get("/all-staff", authMiddleware, checkPermission("VIEW_ADMIN"), getAllStaff);


router.post("/forgot-password", validate(adminSchemas.forgotPassword), forgotPassword);
router.post("/reset-password", validate(adminSchemas.resetPassword), resetPassword);

module.exports = router;