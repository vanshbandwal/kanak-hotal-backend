const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
}, { _id: false }); // We don't need a separate ObjectId for every item in the cart array

const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true // A customer should only have ONE active cart at a time
  },
  items: [cartItemSchema], // Array of products added to cart
  
  // Optional: If they apply a coupon while in the cart, you can store it here
  // so it applies automatically when they check out
  appliedCoupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Cart', cartSchema);
