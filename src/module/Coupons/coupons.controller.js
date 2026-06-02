const coupons = require('./coupons.model');
const asyncHandler = require('express-async-handler');

// ==========================================
// 🌍 ADMIN ROUTES (COUPON MANAGEMENT)
// ==========================================

/**
 * @desc    Create a new coupon
 * @route   POST /api/v1/admin/coupons  
 * @access  Private (Admin)
 */
const createCoupon = asyncHandler(async (req, res) => {
    const { code, description, discountType, discountValue, minPurchaseAmount, maxDiscountAmount, startDate, endDate, usageLimit, userCountLimit } = req.body;

    // Validate required fields
    if (!code || !discountType || !discountValue || !startDate || !endDate) {
        res.status(400);
        throw new Error('Please provide all required fields.');
    }

    // Check for existing coupon code
    const existingcoupon = await coupons.findOne({ code });
    if (existingcoupon) {
        res.status(400);
        throw new Error('Coupon code already exists.');
    }

    const newcoupon = await coupons.create({
        code,
        description,
        discountType,
        discountValue,
        minPurchaseAmount,
        maxDiscountAmount,
        startDate,
        endDate,
        usageLimit,
        userCountLimit
    });

    res.status(201).json({ success: true, data: newcoupon });
});

const getAllCoupons = asyncHandler(async (req, res) => {
    const allcoupons = await coupons.find();
    res.status(200).json({ success: true, data: allcoupons })
})
const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { code, description, discountType, discountValue, minPurchaseAmount, maxDiscountAmount,
        startDate, endDate, usageLimit, userCountLimit } = req.body;

    let coupon = await coupons.findById(id);
    if (!coupon) {
        res.status(404);
        throw new Error('Coupon not found.');
    }

    coupon = await coupons.findByIdAndUpdate(
        id,
        {
            code, description, discountType, discountValue, minPurchaseAmount, maxDiscountAmount, startDate, endDate, usageLimit, userCountLimit
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const coupon = await coupons.findById(id);
    if (!coupon) {
        res.status(404);
        throw new Error('Coupon not found.');
    }

    await coupons.findByIdAndDelete(id);
    res.status(200).json({ success: true,  message: 'Coupon deleted successfully.' });
});

const patchCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;

    let coupon = await coupons.findById(id);
    if (!coupon) {
        res.status(404);
        throw new Error('Coupon not found.');
    }

    const allowedUpdates = [
        'code', 'description', 'discountType', 'discountValue',
        'minPurchaseAmount', 'maxDiscountAmount', 'startDate',
        'endDate', 'usageLimit', 'userCountLimit'
    ];

    const updateData = {};
    Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
            updateData[key] = req.body[key];
        }
    });

    coupon = await coupons.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: coupon });
});

module.exports = {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    patchCoupon,
    deleteCoupon
};