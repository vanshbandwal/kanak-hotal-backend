const express = require('express');
const router = express.Router();
const taxController = require('./tax.controller');
const validate = require('../../middlewares/validate');
const taxSchemas = require('./tax.validation');

const authMiddleware = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middleware/rbac.middleware');

router.post('/create', authMiddleware, checkPermission("CREATE_TAX"), validate(taxSchemas.createTax), taxController.createTax);
router.get('/all', authMiddleware, checkPermission("VIEW_TAX"), taxController.getAllTaxes);
router.get('/:id', authMiddleware, checkPermission("VIEW_TAX"), validate(taxSchemas.taxIdParam), taxController.getTaxById);
router.put('/:id', authMiddleware, checkPermission("EDIT_TAX"), validate(taxSchemas.updateTax), taxController.updateTax);
router.delete('/:id', authMiddleware, checkPermission("DELETE_TAX"), validate(taxSchemas.taxIdParam), taxController.deleteTax);



module.exports = router;

