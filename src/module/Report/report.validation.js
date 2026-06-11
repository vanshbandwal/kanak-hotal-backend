const Joi = require('joi');

const reportSchemas = {
    getOverview: {
        query: Joi.object({
            range: Joi.string()
                .valid('today', 'last_7_days', 'last_30_days', 'this_month', 'this_year', 'custom')
                .default('last_30_days')
                .messages({
                    'any.only': 'Range must be one of: today, last_7_days, last_30_days, this_month, this_year, custom'
                }),
            startDate: Joi.date().when('range', {
                is: 'custom',
                then: Joi.required(),
                otherwise: Joi.optional()
            }),
            endDate: Joi.date().when('range', {
                is: 'custom',
                then: Joi.required(),
                otherwise: Joi.optional()
            })
        })
    }
};

module.exports = reportSchemas;
