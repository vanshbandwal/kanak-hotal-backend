const Joi = require('joi');

const userSchemas = {
    signup: {
        body: Joi.object({
            name: Joi.string().required().trim(),
            email: Joi.string().email().optional(),
            phone: Joi.string().optional(),
            password: Joi.string().min(6).required(),
            countryCode: Joi.string().optional()
        }).unknown(true)
    },
    login: {
        body: Joi.object({
            email: Joi.string().email().optional(),
            phone: Joi.string().optional(),
            password: Joi.string().required()
        }).or('email', 'phone')
    },
    sendOtp: {
        body: Joi.object({
            phone: Joi.string().required()
        })
    },
    verifyOtp: {
        body: Joi.object({
            phone: Joi.string().required(),
            otp: Joi.string().required()
        })
    },
    updateProfile: {
        body: Joi.object({
            name: Joi.string().optional().trim(),
            email: Joi.string().email().optional()
        }).unknown(true)
    },
    address: {
        body: Joi.object({
            fullName: Joi.string().required(),
            phone: Joi.string().required(),
            addressLine1: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            country: Joi.string().required(),
            postalCode: Joi.string().required(),
            latitude: Joi.number().optional(),
            longitude: Joi.number().optional()
        }).unknown(true)
    },
    updateAddress: {
        body: Joi.object({
            fullName: Joi.string().optional(),
            phone: Joi.string().optional(),
            addressLine1: Joi.string().optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            country: Joi.string().optional(),
            postalCode: Joi.string().optional(),
            latitude: Joi.number().optional(),
            longitude: Joi.number().optional()
        }).unknown(true)
    }
};

module.exports = userSchemas;
