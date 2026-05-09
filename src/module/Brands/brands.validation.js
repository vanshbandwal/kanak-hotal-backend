const Joi = require('joi');

const brandSchemas = {
    // Schema for creating a brand
    createBrand: {
        body: Joi.object({
            name: Joi.string().required().min(2).max(100).trim().messages({
                'string.empty': 'Brand name is required',
                'string.min': 'Brand name must be at least 2 characters',
                'string.max': 'Brand name cannot exceed 100 characters',
            }),
            description: Joi.string().allow('', null).max(500).trim(),
            logo: Joi.string().allow('', null),
            website: Joi.string().uri().allow('', null).trim().messages({
                'string.uri': 'Please provide a valid website URL',
            }),
            isActive: Joi.boolean().default(true),
            order: Joi.number().integer().min(0).default(0),
        })
    },

    // Schema for updating a brand
    updateBrand: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Invalid brand ID format',
            })
        }),
        body: Joi.object({
            name: Joi.string().min(2).max(100).trim(),
            description: Joi.string().allow('', null).max(500).trim(),
            logo: Joi.string().allow('', null),
            website: Joi.string().uri().allow('', null).trim(),
            isActive: Joi.boolean(),
            order: Joi.number().integer().min(0),
        }).min(1) // At least one field must be provided for update
    },

    // Schema for ID params (e.g., delete, get by ID)
    brandIdParam: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Invalid brand ID format',
            })
        })
    }
};

module.exports = brandSchemas;
