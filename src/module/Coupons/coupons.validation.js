const Joi = require('joi');

const couponSchemas = {
    createCoupon: {
        body: Joi.object({
            code: Joi.string().required().messages({
                'string.empty': 'Coupon code is required',
                'any.required': 'Coupon code is required'
            }),
            description: Joi.string().optional(),
            discountType: Joi.string().valid('percentage', 'fixed').required().messages({
                'any.only': 'Discount type must be either percentage or fixed',
                'string.empty': 'Discount type is required',
                'any.required': 'Discount type is required'
            }),
            discountValue: Joi.number().min(0).required().messages({
                'number.base': 'Discount value must be a number',
                'number.min': 'Discount value cannot be negative',
                'any.required': 'Discount value is required'
            }),
            minPurchaseAmount: Joi.number().min(0).optional(),
            maxDiscountAmount: Joi.number().min(0).optional(),
            startDate: Joi.date().iso().required().messages({
                'date.base': 'Start date must be a valid date',
                'any.required': 'Start date is required'
            }),
            endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
                'date.base': 'End date must be a valid date',
                'date.greater': 'End date must be after start date',
                'any.required': 'End date is required'
            }),
            usageLimit: Joi.number().min(1).optional(),
            userCountLimit: Joi.number().min(1).optional()
        })
    },
    updateCoupon: {
        body: Joi.object({
            code: Joi.string().optional(),
            description: Joi.string().optional(),
            discountType: Joi.string().valid('percentage', 'fixed').optional(),
            discountValue: Joi.number().min(0).optional(),
            minPurchaseAmount: Joi.number().min(0).optional(),
            maxDiscountAmount: Joi.number().min(0).optional(),
            startDate: Joi.date().iso().optional(),
            endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
            usageLimit: Joi.number().min(1).optional(),
            userCountLimit: Joi.number().min(1).optional()
        }).min(1) // Ensure at least one field is being updated
    }
};

module.exports = couponSchemas;
