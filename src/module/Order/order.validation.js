const Joi = require('joi');

const orderSchemas = {
    createOrder: {
        body: Joi.object({
            shippingAddress: Joi.object({
                fullName: Joi.string().required().trim(),
                phone: Joi.string().required().trim(),
                addressLine1: Joi.string().required().trim(),
                city: Joi.string().required().trim(),
                state: Joi.string().required().trim(),
                postalCode: Joi.string().required().trim(),
                latitude: Joi.number().optional(),
                longitude: Joi.number().optional()
            }).required(),
            paymentMethod: Joi.string().valid('card', 'upi', 'cash_on_delivery').optional(),
            notes: Joi.string().allow('', null).optional()
        })
    },
    orderIdParam: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        })
    },
    updateOrderStatus: {
        params: Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        }),
        body: Joi.object({
            status: Joi.string().valid(
                'pending', 
                'accepted', 
                'assigned', 
                'out_for_delivery', 
                'delivered', 
                'rejected', 
                'cancelled', 
                'completed'
            ).required()
        })
    }
};

module.exports = orderSchemas;
