const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subtitle: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    link: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        enum: ['hero', 'promotion', 'footer'],
        default: 'hero'
    }
}, {
    timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
