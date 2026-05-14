const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middleware/rbac.middleware');

const {
    sendOtp,
    verifyOtp,
    completeProfile,
    adminSendOtp,
    adminVerifyOtp,
    adminCompleteProfile,
    adminGetAllCustomers,
    adminGetCustomerById,
    adminUpdateCustomer,
    adminDeleteCustomer,
    adminToggleStatus
} = require('./customer.controller');

// ==========================================
// 🌍 PUBLIC AUTH ROUTES (for App/Website)
// ==========================================
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.put('/complete-profile', authMiddleware, completeProfile);

// ==========================================
// 🛡️ ADMIN PANEL ROUTES (Private)
// ==========================================
// CRUD Flow
router.post('/admin/send-otp', authMiddleware, checkPermission('CREATE_CUSTOMER'), adminSendOtp);
router.post('/admin/verify-otp', authMiddleware, checkPermission('CREATE_CUSTOMER'), adminVerifyOtp);
router.put('/admin/complete-profile/:id', authMiddleware, checkPermission('CREATE_CUSTOMER'), adminCompleteProfile);
router.get('/admin/all', authMiddleware, checkPermission('VIEW_CUSTOMER'), adminGetAllCustomers);
router.get('/admin/:id', authMiddleware, checkPermission('VIEW_CUSTOMER'), adminGetCustomerById);
router.put('/admin/:id', authMiddleware, checkPermission('UPDATE_CUSTOMER'), adminUpdateCustomer);
router.delete('/admin/:id', authMiddleware, checkPermission('DELETE_CUSTOMER'), adminDeleteCustomer);
router.patch('/admin/:id/status', authMiddleware, checkPermission('UPDATE_CUSTOMER'), adminToggleStatus);

module.exports = router;
