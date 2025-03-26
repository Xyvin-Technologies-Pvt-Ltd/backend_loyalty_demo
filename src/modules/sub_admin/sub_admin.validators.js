const Joi = require('joi');

const createSubAdmin = Joi.object({
    name: Joi.string().required().trim().min(2).max(50),
    email: Joi.string().email().required().trim().lowercase(),
    phoneNumber: Joi.string().trim().pattern(/^\+?[1-9]\d{1,14}$/),
    password: Joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    roleId: Joi.string().required(),
});

const updateSubAdmin = Joi.object({
    name: Joi.string().trim().min(2).max(50),
    phoneNumber: Joi.string().trim().pattern(/^\+?[1-9]\d{1,14}$/),
    roleId: Joi.string(),
    isActive: Joi.boolean()
});

const resetPassword = Joi.object({
    email: Joi.string().email().required().trim().lowercase()
});

module.exports = {
    createSubAdmin,
    updateSubAdmin,
    resetPassword
}; 