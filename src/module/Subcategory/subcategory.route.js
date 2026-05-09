const express = require('express');
const router = express.Router();
const subcategoryController = require('./subcategory.controller');
const uploadCategory = require('../../middlewares/uploadCategory.middleware');
const validate = require('../../middlewares/validate');
const subcategorySchemas = require('./subcategory.validation');

const authMiddleware = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middleware/rbac.middleware');

// Create Subcategory
router.post('/create', authMiddleware, checkPermission("CREATE_CATEGORY"), uploadCategory, validate(subcategorySchemas.createSubcategory), subcategoryController.createSubcategory);

// Get All Subcategories
router.get('/all', authMiddleware, checkPermission("VIEW_CATEGORY"), subcategoryController.getAllSubcategories);

// Get Subcategory by ID
router.get('/:id', authMiddleware, checkPermission("VIEW_CATEGORY"), validate(subcategorySchemas.subcategoryIdParam), subcategoryController.getSubcategoryById);

// Update Subcategory
router.put('/update/:id', authMiddleware, checkPermission("EDIT_CATEGORY"), uploadCategory, validate(subcategorySchemas.updateSubcategory), subcategoryController.updateSubcategory);
router.patch('/update/:id', authMiddleware, checkPermission("EDIT_CATEGORY"), uploadCategory, validate(subcategorySchemas.updateSubcategory), subcategoryController.updateSubcategory);

// Delete Subcategory
router.delete('/delete/:id', authMiddleware, checkPermission("DELETE_CATEGORY"), validate(subcategorySchemas.subcategoryIdParam), subcategoryController.deleteSubcategory);



module.exports = router;

