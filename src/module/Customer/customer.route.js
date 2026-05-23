const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middleware/rbac.middleware');
const validate = require('../../middlewares/validate');
const customerSchemas = require('./customer.validation');

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
router.post('/send-otp', validate(customerSchemas.sendOtp), sendOtp);
router.post('/verify-otp', validate(customerSchemas.verifyOtp), verifyOtp);
router.put('/complete-profile', authMiddleware, validate(customerSchemas.completeProfile), completeProfile);

// ==========================================
// 🛡️ ADMIN PANEL ROUTES (Private)
// ==========================================
// CRUD Flow
router.post('/admin/send-otp', authMiddleware, checkPermission('CREATE_CUSTOMER'), validate(customerSchemas.sendOtp), adminSendOtp);
router.post('/admin/verify-otp', authMiddleware, checkPermission('CREATE_CUSTOMER'), validate(customerSchemas.verifyOtp), adminVerifyOtp);
router.put('/admin/complete-profile/:id', authMiddleware, checkPermission('CREATE_CUSTOMER'), validate(customerSchemas.completeProfile), adminCompleteProfile);
router.get('/admin/all', authMiddleware, checkPermission('VIEW_CUSTOMER'), adminGetAllCustomers);
router.get('/admin/:id', authMiddleware, checkPermission('VIEW_CUSTOMER'), adminGetCustomerById);
router.put('/admin/:id', authMiddleware, checkPermission('UPDATE_CUSTOMER'), validate(customerSchemas.updateCustomer), adminUpdateCustomer);
router.delete('/admin/:id', authMiddleware, checkPermission('DELETE_CUSTOMER'), adminDeleteCustomer);
router.patch('/admin/:id/status', authMiddleware, checkPermission('UPDATE_CUSTOMER'), validate(customerSchemas.toggleStatus), adminToggleStatus);

module.exports = router;
