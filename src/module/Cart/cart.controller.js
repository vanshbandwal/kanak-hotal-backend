const AsyncHandler = require('express-async-handler');
const Cart = require('./cart.model'); // Use Capital C for Model
const Product = require('../Product/product.model');

const addToCart = AsyncHandler(async (req, res) => {
    // Get customerId securely from the authenticated user (auth middleware)
    const customerId = req.user._id;
    const { productId, quantity, couponId } = req.body;

    if (!productId) {
        res.status(400);
        throw new Error('Product ID is required');
    }

    // 1. Find if the customer already has an active cart
    let cart = await Cart.findOne({ customer: customerId });

    if (cart) {
        // --- CART EXISTS: Update the array ---
        // Check if product already exists in the cart
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            // Product exists, just update the quantity
            cart.items[itemIndex].qty += (quantity || 1);
        } else {
            // Product doesn't exist, push it to the array
            cart.items.push({ product: productId, qty: quantity || 1 });
        }

        // Update coupon if provided
        if (couponId) cart.appliedCoupon = couponId;

        await cart.save();
        res.status(200).json(cart);

    } else {
        // --- CART DOES NOT EXIST: Create a new one ---
        const newCart = await Cart.create({
            customer: customerId,
            items: [{
                product: productId,
                qty: quantity || 1
            }],
            appliedCoupon: couponId || null
        });

        res.status(201).json(newCart);
    }
});
const getUserCart = AsyncHandler(async (req, res) => {
    const customerId = req.user._id;

    const cart = await Cart.findOne({ customer: customerId })
        .populate('items.product', 'name price image'); // Customize if needed

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    res.status(200).json(cart);
});
const removeFromCart = AsyncHandler(async (req, res) => {
    const customerId = req.user._id;
    const { productId } = req.body;
    const cart = await Cart.findOne({ customer: customerId });


})
module.exports = {
    addToCart,
    getUserCart
};
