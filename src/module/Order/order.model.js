const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },

    // Support for multiple products in one order
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            required: false
        },
        variantName: {
            type: String, // E.g., "Half Plate". Hardcoded to lock it in.
            required: false
        },
        qty: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        } // Lock in the price at the time of order
    }],

    // Order Status Lifecycle
    orderStatus: {
        type: String,
        enum: ['pending', 'accepted', 'assigned', 'out_for_delivery', 'delivered', 'rejected', 'cancelled', 'completed'],
        default: 'pending'
    },

    // Pricing & Financials
    subTotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    // Applied Coupon Reference
    appliedCoupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null
    },
    // Payment Tracking
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String, // e.g., 'card', 'upi', 'cash_on_delivery'
    },
    transactionId: {
        type: String
    },
    // Delivery / Shipping Address (Saved snapshot)
    shippingAddress: {
        fullName: String,
        phone: String,
        addressLine1: String,
        city: String,
        state: String,
        postalCode: String,
        latitude: Number,
        longitude: Number
    },
    // Delivery Assignment
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServicePartner',
        default: null
    },

    // Optional notes from customer
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // Automatically manages createdAt and updatedAt
});
module.exports = mongoose.model('Order', orderSchema);