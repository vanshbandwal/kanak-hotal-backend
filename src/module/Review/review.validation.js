const Joi = require('joi');

const createReview = {
    body: Joi.object({
        productId: Joi.string().hex().length(24).required().messages({
            "string.base": "Product ID must be a string",
            "string.empty": "Product ID cannot be empty",
            "string.hex": "Product ID must be a valid ObjectId",
            "string.length": "Product ID must be exactly 24 characters long",
            "any.required": "Product ID is required"
        }),
        rating: Joi.number().min(1).max(5).required().messages({
            "number.base": "Rating must be a number",
            "number.min": "Rating must be at least 1",
            "number.max": "Rating must be at most 5",
            "any.required": "Rating is required"
        }),
        comment: Joi.string().trim().min(2).max(1000).required().messages({
            "string.base": "Comment must be a string",
            "string.empty": "Comment cannot be empty",
            "string.min": "Comment must be at least 2 characters long",
            "string.max": "Comment must be at most 1000 characters long",
            "any.required": "Comment is required"
        })
    })
};

const replyReview = {
    body: Joi.object({
        reply: Joi.string().trim().min(2).max(1000).required().messages({
            "string.base": "Reply must be a string",
            "string.empty": "Reply cannot be empty",
            "string.min": "Reply must be at least 2 characters long",
            "string.max": "Reply must be at most 1000 characters long",
            "any.required": "Reply is required"
        })
    })
};

const reviewIdParam = {
    params: Joi.object({
        id: Joi.string().hex().length(24).required().messages({
            "string.base": "Review ID must be a string",
            "string.empty": "Review ID cannot be empty",
            "string.hex": "Review ID must be a valid ObjectId",
            "string.length": "Review ID must be exactly 24 characters long",
            "any.required": "Review ID is required in params"
        })
    })
};

module.exports = {
    createReview,
    replyReview,
    reviewIdParam
};
