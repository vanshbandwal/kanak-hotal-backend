const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const validate = require('../../middlewares/validate');
const orderSchemas = require('./order.validation');
const authMiddleware = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middleware/rbac.middleware');

// Customer Routes
router.post('/create', authMiddleware, validate(orderSchemas.createOrder), orderController.createOrder);
router.get('/myorders', authMiddleware, orderController.getMyOrders);
router.put('/:id/cancel', authMiddleware, validate(orderSchemas.orderIdParam), orderController.cancelOrder);

// Shared Route (Admin & Customer)
router.get('/:id', authMiddleware, validate(orderSchemas.orderIdParam), orderController.getOrderById);

// Admin / Service Partner Routes
router.get('/', authMiddleware, checkPermission("VIEW_ORDER"), orderController.getAllOrders);
router.put('/:id/status', authMiddleware, checkPermission("EDIT_ORDER"), validate(orderSchemas.updateOrderStatus), orderController.updateOrderStatus);

module.exports = router;
