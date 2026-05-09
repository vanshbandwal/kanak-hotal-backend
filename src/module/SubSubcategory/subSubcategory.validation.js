const Joi = require('joi');

const subSubcategorySchemas = {
    createSubSubcategory: {
        body: Joi.object({
            name: Joi.string().required().min(2).max(100).trim(),
            subcategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
            categoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
            description: Joi.string().allow('', null).max(500).trim(),
            image: Joi.string().allow('', null),
            isActive: Joi.boolean().default(true),
            order: Joi.number().integer().min(0).default(0),
        })
    },
    updateSubSubcategory: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        }),
        body: Joi.object({
            name: Joi.string().min(2).max(100).trim(),
            subcategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
            categoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
            description: Joi.string().allow('', null).max(500).trim(),
            image: Joi.string().allow('', null),
            isActive: Joi.boolean(),
            order: Joi.number().integer().min(0),
        }).min(1)
    },
    subSubcategoryIdParam: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        })
    }
};

module.exports = subSubcategorySchemas;
