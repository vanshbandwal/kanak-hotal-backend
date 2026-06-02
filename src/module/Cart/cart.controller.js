const AsyncHandler = require('express-async-handler');
const Cart = require('./cart.model'); // Use Capital C for Model
const Product = require('../Product/product.model');

const addToCart = AsyncHandler(async (req, res) => {
    // Get customerId securely from the authenticated user (auth middleware)
    const customerId = req.user._id;
    const { productId, variantId, quantity, couponId } = req.body;

    if (!productId) {
        res.status(400);
        throw new Error('Product ID is required');
    }

    // 1. Find if the customer already has an active cart
    let cart = await Cart.findOne({ customer: customerId });

    if (cart) {
        // --- CART EXISTS: Update the array ---
        // Check if product AND variant already exist in the cart
        const itemIndex = cart.items.findIndex(item => {
            const productMatch = item.product.toString() === productId;
            const variantMatch = (item.variant && variantId) ? item.variant.toString() === variantId : (!item.variant && !variantId);
            return productMatch && variantMatch;
        });

        if (itemIndex > -1) {
            // Product+Variant exists, just update the quantity
            cart.items[itemIndex].qty += (quantity || 1);
        } else {
            // Product doesn't exist, push it to the array
            cart.items.push({ 
                product: productId, 
                variant: variantId || undefined,
                qty: quantity || 1 
            });
        }

        // Update coupon if provided
        if (couponId) cart.appliedCoupon = couponId;

        await cart.save();
        res.status(200).json({ success: true, data: cart });

    } else {
        // --- CART DOES NOT EXIST: Create a new one ---
        const newCart = await Cart.create({
            customer: customerId,
            items: [{
                product: productId,
                variant: variantId || undefined,
                qty: quantity || 1
            }],
            appliedCoupon: couponId || null
        });

        res.status(201).json({ success: true, data: newCart });
    }
});
const getUserCart = AsyncHandler(async (req, res) => {
    const customerId = req.user._id;

    const cart = await Cart.findOne({ customer: customerId })
        .populate('items.product', 'name price image productType variants'); // Populate variants too so we can display them

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    res.status(200).json({ success: true, data: cart });
});
const removeFromCart = AsyncHandler(async (req, res) => {
    const customerId = req.user._id;
    const { productId, variantId } = req.body;
    
    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
        res.status(404);
        throw new Error("Cart not found")
    }
    
    const indexIndex = cart.items.findIndex(item => {
        const productMatch = item.product.toString() === productId;
        const variantMatch = (item.variant && variantId) ? item.variant.toString() === variantId : (!item.variant && !variantId);
        return productMatch && variantMatch;
    });

    if (indexIndex > -1) {
        cart.items.splice(indexIndex, 1);
        await cart.save();
        res.status(200).json({ success: true, data: cart });
    } else {
        res.status(404);
        throw new Error("Product not found in cart")
    }
})
const RemoveallItem = AsyncHandler(async (req, res) => {
    const customerId = req.user._id;
    const cart = await Cart.findOne({ customer: customerId })
    if (!cart) {
        res.status(404);
        throw new Error("Cart not Found")
    }
    cart.items = [];
    await cart.save();
    res.status(200).json({ success: true, data: "Cart is empty now" })
})
module.exports = {
    addToCart,
    getUserCart,
    removeFromCart,
    RemoveallItem
};
