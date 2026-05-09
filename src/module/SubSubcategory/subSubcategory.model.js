const mongoose = require('mongoose');

const subSubcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        trim: true,
    },
    image: {
        type: String, // URL/Path to sub-subcategory image
    },
    subcategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: true, // A sub-subcategory MUST belong to a Subcategory
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true, // A sub-subcategory MUST also belong to a Category
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Middleware to generate slug if not provided or name changes
subSubcategorySchema.pre('validate', function () {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }
});

const SubSubcategory = mongoose.model('SubSubcategory', subSubcategorySchema);

module.exports = SubSubcategory;
