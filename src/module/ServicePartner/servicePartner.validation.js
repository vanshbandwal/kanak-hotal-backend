const Joi = require('joi');

const servicePartnerSchemas = {
    sendOtp: {
        body: Joi.object({
            phone: Joi.string().required().trim()
        })
    },
    verifyOtp: {
        body: Joi.object({
            phone: Joi.string().required().trim(),
            otp: Joi.string().required()
        })
    },
    completeRegistration: {
        body: Joi.object({
            name: Joi.string().trim().required(),
            email: Joi.string().email().trim().optional(),
            vehicle: Joi.object({
                type: Joi.string().valid('Bicycle', 'Motorcycle', 'Car', 'Scooter').optional(),
                number: Joi.string().optional(),
                model: Joi.string().optional()
            }).optional()
        }).unknown(true)
    },
    updatePartner: {
        body: Joi.object({
            name: Joi.string().trim().optional(),
            email: Joi.string().email().trim().optional(),
            isActive: Joi.boolean().optional()
        }).unknown(true)
    },
    updateKycStatus: {
        body: Joi.object({
            kycStatus: Joi.string().valid('Pending', 'In Review', 'Verified', 'Rejected').required()
        })
    },
    toggleStatus: {
        body: Joi.object({
            isActive: Joi.boolean().required()
        })
    }
};

module.exports = servicePartnerSchemas;
