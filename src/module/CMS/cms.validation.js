const Joi = require('joi');

const updateCmsPage = {
    body: Joi.object().keys({
        title: Joi.string().required().trim(),
        content: Joi.string().required().allow(''), // Allow empty string just in case they wipe it
        isActive: Joi.boolean()
    }),
    params: Joi.object().keys({
        pageKey: Joi.string().valid('terms_conditions', 'privacy_policy', 'about_us', 'contact_us').required()
    })
};

const createFaq = {
    body: Joi.object().keys({
        question: Joi.string().required().trim(),
        answer: Joi.string().required(),
        order: Joi.number().integer().min(0),
        isActive: Joi.boolean()
    })
};

const updateFaq = {
    params: Joi.object().keys({
        id: Joi.string().required() // usually a Mongo ObjectId, but standard string is fine for Joi
    }),
    body: Joi.object().keys({
        question: Joi.string().trim(),
        answer: Joi.string(),
        order: Joi.number().integer().min(0),
        isActive: Joi.boolean()
    }).min(1) // at least one field must be updated
};

const faqIdParam = {
    params: Joi.object().keys({
        id: Joi.string().required()
    })
};

module.exports = {
    updateCmsPage,
    createFaq,
    updateFaq,
    faqIdParam
};
