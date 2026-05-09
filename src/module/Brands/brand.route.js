const express = require('express');
const router = express.Router();
const uploadBrand = require('../../middlewares/uploadBrand.middleware');
const validate = require('../../middlewares/validate');
const brandSchemas = require('./brands.validation');
const {
    createBrand,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    toggleBrandStatus
} = require('./brand.controller');

const authMiddleware = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middleware/rbac.middleware');

router.post('/create', authMiddleware, checkPermission("CREATE_BRAND"), uploadBrand, validate(brandSchemas.createBrand), createBrand);
router.get('/', authMiddleware, checkPermission("VIEW_BRAND"), getAllBrands);
router.get('/:id', authMiddleware, checkPermission("VIEW_BRAND"), validate(brandSchemas.brandIdParam), getBrandById);
router.put('/update/:id', authMiddleware, checkPermission("EDIT_BRAND"), uploadBrand, validate(brandSchemas.updateBrand), updateBrand);
router.delete('/delete/:id', authMiddleware, checkPermission("DELETE_BRAND"), validate(brandSchemas.brandIdParam), deleteBrand);
router.patch('/toggle-status/:id', authMiddleware, checkPermission("EDIT_BRAND"), validate(brandSchemas.brandIdParam), toggleBrandStatus);



module.exports = router;

