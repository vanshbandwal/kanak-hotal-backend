const Joi = require('joi');

const customerSchemas = {
    sendOtp: {
        body: Joi.object({
            phone: Joi.string().required().trim().messages({
                'any.required': 'Phone number is required'
            })
        })
    },
    verifyOtp: {
        body: Joi.object({
            phone: Joi.string().required().trim(),
            otp: Joi.string().required()
        })
    },
    completeProfile: {
        body: Joi.object({
            name: Joi.string().trim().required(),
            email: Joi.string().email().trim().optional()
        }).unknown(true)
    },
    updateCustomer: {
        body: Joi.object({
            name: Joi.string().trim().optional(),
            email: Joi.string().email().trim().optional(),
            phone: Joi.string().trim().optional(),
            isActive: Joi.boolean().optional(),
            isVerified: Joi.boolean().optional()
        }).unknown(true)
    },
    toggleStatus: {
        body: Joi.object({
            isActive: Joi.boolean().required()
        })
    }
};

module.exports = customerSchemas;
