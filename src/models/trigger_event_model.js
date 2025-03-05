const mongoose = require('mongoose');

const triggerEventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
   
}, {
    timestamps: true
});

const TriggerEvent = mongoose.model('TriggerEvent', triggerEventSchema);

module.exports = TriggerEvent;
