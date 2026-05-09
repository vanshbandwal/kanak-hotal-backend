const express = require('express');
const router = express.Router();
const permissionController = require('./permission.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const { checkPermission } = require('../../middleware/rbac.middleware');

router.get('/all', authMiddleware, checkPermission("VIEW_ROLE"), permissionController.getAllPermissions);


module.exports = router;
