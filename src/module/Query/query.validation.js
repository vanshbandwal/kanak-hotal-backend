const Joi = require('joi');

const querySchemas = {
    createQuery: {
        body: Joi.object({
            subject: Joi.string().required().trim(),
            message: Joi.string().required(),
            priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent').optional(),
            category: Joi.string().valid('General', 'Technical', 'Billing', 'Feedback', 'Other').optional(),
            attachments: Joi.array().items(Joi.string()).optional()
        }).unknown(true)
    },
    reply: {
        body: Joi.object({
            message: Joi.string().required(),
            attachments: Joi.array().items(Joi.string()).optional()
        })
    },
    updateStatus: {
        body: Joi.object({
            status: Joi.string().valid('Open', 'Pending', 'Resolved', 'Closed').required()
        })
    },
    assignQuery: {
        body: Joi.object({
            assignedTo: Joi.string().required()
        })
    }
};

module.exports = querySchemas;
