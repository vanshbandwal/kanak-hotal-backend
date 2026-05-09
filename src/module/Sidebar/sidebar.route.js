const express = require('express');
const router = express.Router();
const sidebarController = require('./sidebar.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const { checkPermission } = require('../../middleware/rbac.middleware');

router.get('/', authMiddleware, sidebarController.getSidebarMenu);
router.get('/all', authMiddleware, checkPermission("VIEW_ROLE"), sidebarController.getAllSidebarItems);


module.exports = router;
