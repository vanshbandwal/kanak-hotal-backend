const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const { checkPermission } = require("../../middleware/rbac.middleware");
const uploadPartnerDocs = require("../../middlewares/uploadServicePartner.middleware");
const validate = require("../../middlewares/validate");
const servicePartnerSchemas = require("./servicePartner.validation");

const {
  adminSendOtp,
  adminVerifyOtp,
  adminCompleteRegistration,
  adminGetAllPartners,
  adminUpdateKycStatus,
  adminTogglePartnerStatus,
  adminGetPartnerById,
  adminUpdatePartner,
  adminDeletePartner,
} = require("./servicePartner.controller");

// ==========================================
// 🛡️ ADMIN PRIVATE ROUTES
// ==========================================

// Step-wise Registration
router.post("/send-otp", authMiddleware, checkPermission("CREATE_PARTNER"), validate(servicePartnerSchemas.sendOtp), adminSendOtp);
router.post("/verify-otp", authMiddleware, checkPermission("CREATE_PARTNER"), validate(servicePartnerSchemas.verifyOtp), adminVerifyOtp);
router.post("/complete-registration", authMiddleware, checkPermission("CREATE_PARTNER"), uploadPartnerDocs, validate(servicePartnerSchemas.completeRegistration), adminCompleteRegistration);

router.get("/", authMiddleware, checkPermission("VIEW_PARTNER"), adminGetAllPartners);

// Details & Management
router.get("/:id", authMiddleware, checkPermission("VIEW_PARTNER"), adminGetPartnerById);
router.patch("/:id", authMiddleware, checkPermission("UPDATE_PARTNER"), uploadPartnerDocs, validate(servicePartnerSchemas.updatePartner), adminUpdatePartner);
router.delete("/:id", authMiddleware, checkPermission("DELETE_PARTNER"), adminDeletePartner);
router.patch("/:id/kyc", authMiddleware, checkPermission("UPDATE_PARTNER"), validate(servicePartnerSchemas.updateKycStatus), adminUpdateKycStatus);
router.patch("/:id/status", authMiddleware, checkPermission("UPDATE_PARTNER"), validate(servicePartnerSchemas.toggleStatus), adminTogglePartnerStatus);

module.exports = router;
