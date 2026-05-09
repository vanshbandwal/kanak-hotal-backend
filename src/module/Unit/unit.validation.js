const Joi = require('joi');

const unitSchemas = {
    createUnit: {
        body: Joi.object({
            name: Joi.string().required().min(1).max(50).trim(),
            shorthand: Joi.string().required().min(1).max(10).trim(),
            description: Joi.string().allow('', null).max(250).trim(),
            isActive: Joi.boolean().default(true),
        })
    },
    updateUnit: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        }),
        body: Joi.object({
            name: Joi.string().min(1).max(50).trim(),
            shorthand: Joi.string().min(1).max(10).trim(),
            description: Joi.string().allow('', null).max(250).trim(),
            isActive: Joi.boolean(),
        }).min(1)
    },
    unitIdParam: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        })
    }
};

module.exports = unitSchemas;
