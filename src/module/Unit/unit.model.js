const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Unit name is required'],
        unique: true,
        trim: true,
    },
    shorthand: {
        type: String,
        required: [true, 'Unit shorthand is required (e.g. kg, pcs, ltr)'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    description: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    baseUnit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
        default: null,
    },
    conversionFactor: {
        type: Number,
        default: 1, // 1 base unit = conversionFactor * this unit
    }
}, {
    timestamps: true,
});

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;
