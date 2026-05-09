const Joi = require('joi');

const taxSchemas = {
    createTax: {
        body: Joi.object({
            name: Joi.string().required().min(1).max(50).trim(),
            rate: Joi.number().required().min(0),
            type: Joi.string().valid('percentage', 'fixed').default('percentage'),
            taxType: Joi.string().valid('inclusive', 'exclusive').required(),
            isActive: Joi.boolean().default(true),
            description: Joi.string().allow('', null).trim(),
        })
    },
    updateTax: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        }),
        body: Joi.object({
            name: Joi.string().min(1).max(50).trim(),
            rate: Joi.number().min(0),
            type: Joi.string().valid('percentage', 'fixed'),
            taxType: Joi.string().valid('inclusive', 'exclusive'),
            isActive: Joi.boolean(),
            description: Joi.string().allow('', null).trim(),
        }).min(1)
    },
    taxIdParam: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        })
    }
};

module.exports = taxSchemas;
