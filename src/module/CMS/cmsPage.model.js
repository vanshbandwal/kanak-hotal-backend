const mongoose = require('mongoose');

const cmsPageSchema = new mongoose.Schema({
    pageKey: {
        type: String,
        required: true,
        unique: true,
        enum: ['terms_conditions', 'privacy_policy', 'about_us', 'contact_us'],
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CmsPage', cmsPageSchema);
