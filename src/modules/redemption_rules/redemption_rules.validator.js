const Joi = require("joi");

const redemptionRulesSchema = Joi.object({
    minimum_points_required: Joi.number().min(1).required()
        .description("Minimum points required to redeem")
        .example(100),

    maximum_points_per_day: Joi.number().min(1).required()
        .description("Maximum points that can be redeemed per day")
        .example(1000),

    app_type: Joi.string().required()
        .description("App type")
        .example("Khedmah Delivery"),

    tier_multipliers: Joi.array().items(
        Joi.object({
            tier_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
                .description("ID of the tier")
                .example("67cc562cf71f32d55006efab"),
            multiplier: Joi.number().min(0).required()
                .description("Multiplier for the tier")
                .example(1.5)
        })
    ).description("Array of tier multipliers"),



    
});

module.exports = { redemptionRulesSchema };
