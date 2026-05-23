const express = require('express');
const { createCoupon, getAllCoupons, updateCoupon, patchCoupon, deleteCoupon } = require('./coupons.controller');
const validate = require('../../middlewares/validate');
const couponSchemas = require('./coupons.validation');

const authMiddleware = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middleware/rbac.middleware');

const router = express.Router();

router.post('/create-coupon', authMiddleware, checkPermission('CREATE_COUPON'), validate(couponSchemas.createCoupon), createCoupon);
router.get('/all-coupons', authMiddleware, checkPermission('VIEW_COUPON'), getAllCoupons);
router.put('/update-coupon/:id', authMiddleware, checkPermission('UPDATE_COUPON'), validate(couponSchemas.updateCoupon), updateCoupon);
router.patch('/patch-coupon/:id', authMiddleware, checkPermission('UPDATE_COUPON'), validate(couponSchemas.updateCoupon), patchCoupon);
router.delete('/delete-coupon/:id', authMiddleware, checkPermission('DELETE_COUPON'), deleteCoupon);

module.exports = router;
