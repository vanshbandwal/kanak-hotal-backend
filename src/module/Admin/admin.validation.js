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
        })
    },
    changePassword: {
        body: Joi.object({
            currentPassword: Joi.string().required(),
            newPassword: Joi.string().min(8).required().messages({
                'string.min': 'New password must be at least 8 characters long',
            }),
            otp: Joi.string().length(6).required().messages({
                'string.length': 'OTP must be exactly 6 digits long',
                'any.required': 'OTP is required to change password'
            }),
        })
    },
    requestPasswordOtp: {
        body: Joi.object({
            currentPassword: Joi.string().required(),
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
