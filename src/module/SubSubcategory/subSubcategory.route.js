const express = require('express');
const router = express.Router();
const subSubcategoryController = require('./subSubcategory.controller');
const uploadCategory = require('../../middlewares/uploadCategory.middleware');
const validate = require('../../middlewares/validate');
const subSubcategorySchemas = require('./subSubcategory.validation');

const authMiddleware = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middleware/rbac.middleware');

// Create Sub-subcategory
router.post('/create', authMiddleware, checkPermission("CREATE_CATEGORY"), uploadCategory, validate(subSubcategorySchemas.createSubSubcategory), subSubcategoryController.createSubSubcategory);

// Get All Sub-subcategories
router.get('/all', authMiddleware, checkPermission("VIEW_CATEGORY"), subSubcategoryController.getAllSubSubcategories);

// Get Sub-subcategory by ID
router.get('/:id', authMiddleware, checkPermission("VIEW_CATEGORY"), validate(subSubcategorySchemas.subSubcategoryIdParam), subSubcategoryController.getSubSubcategoryById);

// Update Sub-subcategory
router.put('/update/:id', authMiddleware, checkPermission("EDIT_CATEGORY"), uploadCategory, validate(subSubcategorySchemas.updateSubSubcategory), subSubcategoryController.updateSubSubcategory);
router.patch('/update/:id', authMiddleware, checkPermission("EDIT_CATEGORY"), uploadCategory, validate(subSubcategorySchemas.updateSubSubcategory), subSubcategoryController.updateSubSubcategory);

// Delete Sub-subcategory
router.delete('/delete/:id', authMiddleware, checkPermission("DELETE_CATEGORY"), validate(subSubcategorySchemas.subSubcategoryIdParam), subSubcategoryController.deleteSubSubcategory);



module.exports = router;

