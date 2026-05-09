const Joi = require('joi');

const adminSchemas = {
    register: {
        body: Joi.object({
            name: Joi.string().required().min(2).max(50).trim(),
            email: Joi.string().email().required().trim().lowercase(),
            password: Joi.string().min(8).required().messages({
                'string.min': 'Password must be at least 8 characters long',
            }),
            role: Joi.string().allow('', null),
        })
    },
    login: {
        body: Joi.object({
            email: Joi.string().email().required().trim().lowercase(),
            password: Joi.string().required(),
        })
    },
    updateProfile: {
        body: Joi.object({
            name: Joi.string().min(2).max(50).trim(),
            email: Joi.string().email().trim().lowercase(),
            phone: Joi.string().allow('', null),
        }).min(1)
    },
    changePassword: {
        body: Joi.object({
            currentPassword: Joi.string().required(),
            newPassword: Joi.string().min(8).required().messages({
                'string.min': 'New password must be at least 8 characters long',
            }),
        })
    },
    forgotPassword: {
        body: Joi.object({
            email: Joi.string().email().required().trim().lowercase(),
        })
    },
    resetPassword: {
        body: Joi.object({
            token: Joi.string().required(),
            password: Joi.string().min(8).required(),
        })
    },
    createStaff: {
        body: Joi.object({
            name: Joi.string().required().min(2).max(50).trim(),
            email: Joi.string().email().required().trim().lowercase(),
            password: Joi.string().min(8).required(),
            role: Joi.string().required(),
        })
    }
};

module.exports = adminSchemas;
