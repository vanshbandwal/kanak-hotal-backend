const express = require('express');
const router = express.Router();
const roleController = require('./role.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middleware/rbac.middleware');

// ➕ CREATE
router.post('/', authMiddleware, checkPermission("CREATE_ROLE"), roleController.createRole);

// 📖 READ ALL
router.get('/all', authMiddleware, checkPermission("VIEW_ROLE"), roleController.getAllRoles);

// 🔎 READ ONE
router.get('/:id', authMiddleware, checkPermission("VIEW_ROLE"), roleController.getRoleById);

// 🖊️ UPDATE
router.put('/:id', authMiddleware, checkPermission("EDIT_ROLE"), roleController.updateRole);

// 🗑️ DELETE
router.delete('/:id', authMiddleware, checkPermission("DELETE_ROLE"), roleController.deleteRole);



module.exports = router;
