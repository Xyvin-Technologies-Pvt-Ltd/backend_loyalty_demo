const PaymentMethod = require("../../models/payment_method");

const getPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = await PaymentMethod.find();
        res.status(200).json(paymentMethods);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPaymentMethod = async (req, res) => {
    try {
        const paymentMethod = await PaymentMethod.create(req.body);
        res.status(201).json(paymentMethod);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePaymentMethod = async (req, res) => {
    try {
        const paymentMethod = await PaymentMethod.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(paymentMethod);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};  

const deletePaymentMethod = async (req, res) => {
    try {
        const paymentMethod = await PaymentMethod.findByIdAndDelete(req.params.id);
        res.status(200).json(paymentMethod);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPaymentMethodById = async (req, res) => {
    try {
        const paymentMethod = await PaymentMethod.findById(req.params.id);
        res.status(200).json(paymentMethod);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    getPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getPaymentMethodById    
};


