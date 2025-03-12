const mongoose = require('mongoose');

const triggerServicesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    triggerEvent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TriggerEvent'
    }]
}, {
    timestamps: true
}
);

const TriggerServices = mongoose.model('TriggerServices', triggerServicesSchema);

module.exports = TriggerServices;

