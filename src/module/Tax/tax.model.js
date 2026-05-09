const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    rate: {
        type: Number,
        required: true,
        default: 0
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    taxType: {
        type: String,
        enum: ['inclusive', 'exclusive'],
        default: 'exclusive',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Tax = mongoose.model('Tax', taxSchema);

module.exports = Tax;
