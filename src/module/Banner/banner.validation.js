const Joi = require('joi');

const bannerSchemas = {
    createBanner: {
        body: Joi.object({
            title: Joi.string().required().trim().messages({
                'string.empty': 'Title is required',
                'any.required': 'Title is required'
            }),
            subtitle: Joi.string().trim().optional().allow('', null),
            image: Joi.string().optional().allow('', null), // Image is uploaded via multer
            link: Joi.string().trim().optional().allow('', null),
            isActive: Joi.boolean().optional(),
            order: Joi.number().optional(),
            type: Joi.string().valid('hero', 'promotion', 'footer').optional()
        })
    },
    updateBanner: {
        body: Joi.object({
            title: Joi.string().trim().optional(),
            subtitle: Joi.string().trim().optional().allow('', null),
            image: Joi.string().optional().allow('', null),
            link: Joi.string().trim().optional().allow('', null),
            isActive: Joi.boolean().optional(),
            order: Joi.number().optional(),
            type: Joi.string().valid('hero', 'promotion', 'footer').optional()
        }).min(1) // Ensure at least one field is being updated
    }
};

module.exports = bannerSchemas;
