const express = require('express');
const router = express.Router();
const { 
    createBanner, 
    getAllBanners, 
    getBannerById, 
    updateBanner, 
    deleteBanner 
} = require('./banner.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middleware/rbac.middleware');
const uploadBanner = require('../../middlewares/uploadBanner.middleware');
const validate = require('../../middlewares/validate');
const bannerSchemas = require('./banner.validation');

// Public routes (Access is controlled at the mount point in private.js vs public.js)
router.get('/', getAllBanners);
router.get('/:id', getBannerById);

// Protected routes (Only for Admins with specific permissions)
router.post('/create', authMiddleware, checkPermission('ADD_BANNER'), uploadBanner, validate(bannerSchemas.createBanner), createBanner);
router.put('/update/:id', authMiddleware, checkPermission('EDIT_BANNER'), uploadBanner, validate(bannerSchemas.updateBanner), updateBanner);
router.delete('/delete/:id', authMiddleware, checkPermission('DELETE_BANNER'), deleteBanner);

module.exports = router;
