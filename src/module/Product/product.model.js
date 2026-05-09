const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
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
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: false, // For branded items like Amul, Coke, etc.
    },
    unit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
        required: false,
    },
    
    // 🥗 RESTAURANT SPECIFIC FIELDS
    isVeg: {
        type: Boolean,
        default: true, // true = Veg, false = Non-Veg
        required: true
    },
    spicyLevel: {
        type: Number,
        enum: [0, 1, 2, 3], // 0: Mild, 3: Extra Spicy
        default: 0
    },
    prepTime: {
        type: Number, // In minutes
        default: 15
    },
    calories: {
        type: Number,
        default: 0
    },

    productType: { 
        type: String, 
        enum: ['single', 'variant', 'combo'], 
        default: 'single',
        required: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: false 
    },
    subSubcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubSubcategory',
        required: false 
    },

    // 💰 Pricing for 'Single' dishes
    price: { 
        type: Number,
        default: 0
    },
    salePrice: { 
        type: Number,
        default: 0
    },
    sku: { 
        type: String,
        unique: true,
        sparse: true 
    },

    // 🍽️ For 'Variant' dishes (Half Plate, Full Plate, etc.)
    variants: [{
        attributes: { 
            type: Map, 
            of: String 
        }, // e.g., { "portion": "Half Plate" }
        price: { type: Number, required: true },
        salePrice: { type: Number },
        sku: { type: String, required: true },
        image: { type: String }
    }],

    // 🍱 For 'Combo' meals
    comboItems: [{
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product' 
        },
        quantity: { 
            type: Number, 
            default: 1 
        }
    }],

    // Shared Media
    images: [{
        type: String 
    }],
    mainImage: {
        type: String
    },

    // 💸 TAX & FINANCIALS
    taxRule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tax',
        required: false 
    },
    taxStatus: {
        type: String,
        enum: ['taxable', 'none'],
        default: 'taxable'
    },
    priceIncludesTax: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    
    ratings: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

// Middleware to generate slug before validation
productSchema.pre('validate', function() {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
