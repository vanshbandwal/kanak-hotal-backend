const Joi = require('joi');

const productSchemas = {
    createProduct: {
        body: Joi.object({
            name: Joi.string().required().min(2).max(200).trim(),
            description: Joi.string().allow('', null).trim(),
            brand: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow('', null),
            unit: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow('', null),
            
            // Food Specific
            isVeg: Joi.boolean().default(true).required(),
            spicyLevel: Joi.number().valid(0, 1, 2, 3).default(0),
            prepTime: Joi.number().integer().min(1).default(15),
            calories: Joi.number().integer().min(0).allow(null, 0),

            productType: Joi.string().valid('single', 'variant', 'combo').required(),
            category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
            subcategory: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow('', null),

            // Pricing
            price: Joi.number().min(0).when('productType', { is: 'single', then: Joi.required() }),
            salePrice: Joi.number().min(0).allow(null, 0),
            sku: Joi.string().allow('', null),

            // For Variant (Portions)
            variants: Joi.array().items(Joi.object({
                attributes: Joi.object().pattern(Joi.string(), Joi.string()),
                price: Joi.number().min(0).required(),
                salePrice: Joi.number().min(0).allow(null, 0),
                sku: Joi.string().required(),
                image: Joi.string().allow('', null),
            })).when('productType', { is: 'variant', then: Joi.required() }),

            // For Combo
            comboItems: Joi.array().items(Joi.object({
                product: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
                quantity: Joi.number().integer().min(1).default(1),
            })).when('productType', { is: 'combo', then: Joi.required() }),

            images: Joi.array().items(Joi.string()),
            mainImage: Joi.string().allow('', null),
            taxRule: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow('', null),
            taxStatus: Joi.string().valid('taxable', 'none').default('taxable'),
            priceIncludesTax: Joi.boolean().default(false),
            isActive: Joi.boolean().default(true),
            isFeatured: Joi.boolean().default(false),
        })
    },
    updateProduct: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        }),
        body: Joi.object({
            name: Joi.string().min(2).max(200).trim(),
            description: Joi.string().allow('', null).trim(),
            brand: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow('', null),
            unit: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow('', null),
            isVeg: Joi.boolean(),
            spicyLevel: Joi.number().valid(0, 1, 2, 3),
            prepTime: Joi.number().integer().min(1),
            calories: Joi.number().integer().min(0),
            productType: Joi.string().valid('single', 'variant', 'combo'),
            category: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
            subcategory: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow('', null),
            price: Joi.number().min(0),
            salePrice: Joi.number().min(0).allow(null, 0),
            sku: Joi.string().allow('', null),
            variants: Joi.array().items(Joi.object({
                attributes: Joi.object().pattern(Joi.string(), Joi.string()),
                price: Joi.number().min(0).required(),
                salePrice: Joi.number().min(0).allow(null, 0),
                sku: Joi.string().required(),
                image: Joi.string().allow('', null),
            })),
            comboItems: Joi.array().items(Joi.object({
                product: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
                quantity: Joi.number().integer().min(1).default(1),
            })),
            images: Joi.array().items(Joi.string()),
            mainImage: Joi.string().allow('', null),
            taxRule: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow('', null),
            taxStatus: Joi.string().valid('taxable', 'none'),
            priceIncludesTax: Joi.boolean(),
            isActive: Joi.boolean(),
            isFeatured: Joi.boolean(),
        }).min(1)
    },
    productIdParam: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        })
    }
};

module.exports = productSchemas;
