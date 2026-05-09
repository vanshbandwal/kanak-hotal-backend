const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const uploadCategory = require('../../middlewares/uploadCategory.middleware');
const validate = require('../../middlewares/validate');
const categorySchemas = require('./category.validation');

const authMiddleware = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middleware/rbac.middleware');

// Create Category
router.post('/create', authMiddleware, checkPermission("CREATE_CATEGORY"), uploadCategory, validate(categorySchemas.createCategory), categoryController.createCategory);

// Get All Categories
router.get('/all', authMiddleware, checkPermission("VIEW_CATEGORY"), categoryController.getAllCategories);

// Get Category by ID
router.get('/:id', authMiddleware, checkPermission("VIEW_CATEGORY"), validate(categorySchemas.categoryIdParam), categoryController.getCategoryById);

// Update Category
router.put('/update/:id', authMiddleware, checkPermission("EDIT_CATEGORY"), uploadCategory, validate(categorySchemas.updateCategory), categoryController.updateCategory);
router.patch('/update/:id', authMiddleware, checkPermission("EDIT_CATEGORY"), uploadCategory, validate(categorySchemas.updateCategory), categoryController.updateCategory);

// Delete Category
router.delete('/delete/:id', authMiddleware, checkPermission("DELETE_CATEGORY"), validate(categorySchemas.categoryIdParam), categoryController.deleteCategory);



module.exports = router;

