const AsyncHandler = require('express-async-handler');
const Order = require('./order.model');
const Cart = require('../Cart/cart.model');
const Coupon = require('../Coupons/coupons.model'); // Ensure we can access Coupon logic
const Tax = require('../Tax/tax.model'); // Just in case, though we populate it

/**
 * @desc    Create a new order from the user's cart
 * @route   POST /api/order/create
 * @access  Private
 */
const createOrder = AsyncHandler(async (req, res) => {
    const customerId = req.user._id;
    const { shippingAddress, paymentMethod, notes } = req.body;

    // 1. Fetch the user's cart and populate product (with its taxRule) and appliedCoupon
    const cart = await Cart.findOne({ customer: customerId })
        .populate({
            path: 'items.product',
            populate: { path: 'taxRule' }
        })
        .populate('appliedCoupon');

    if (!cart || cart.items.length === 0) {
        res.status(400);
        throw new Error("Your cart is empty. Please add items before checking out.");
    }

    if (!shippingAddress) {
        res.status(400);
        throw new Error("Shipping address is required to place an order.");
    }

    // 2. Calculate the order totals securely on the server
    let subTotal = 0;
    let taxAmount = 0;
    const orderItems = [];

    cart.items.forEach(item => {
        let productPrice = 0;
        let variantName = undefined;

        // Calculate actual price taking variant into account
        if (item.product.productType === 'variant') {
            if (!item.variant) {
                res.status(400);
                throw new Error(`Product "${item.product.name}" requires a variant selection.`);
            }
            
            const selectedVariant = item.product.variants.id(item.variant);
            if (!selectedVariant) {
                res.status(400);
                throw new Error(`Selected variant for "${item.product.name}" is invalid or no longer exists.`);
            }

            productPrice = selectedVariant.salePrice > 0 ? selectedVariant.salePrice : selectedVariant.price;
            
            // Build a display name like "Half Plate, Extra Spicy"
            if (selectedVariant.attributes) {
                // If it's a Map, use Array.from. If it's a plain object, use Object.values
                if (selectedVariant.attributes instanceof Map) {
                    variantName = Array.from(selectedVariant.attributes.values()).join(', ');
                } else {
                    variantName = Object.values(selectedVariant.attributes).join(', ');
                }
            }
        } else {
            // Pricing for 'single' or 'combo' items
            productPrice = item.product.salePrice > 0 ? item.product.salePrice : item.product.price;
        }

        subTotal += (productPrice * item.qty);

        // --- TAX CALCULATION LOGIC ---
        if (item.product.taxStatus === 'taxable' && item.product.taxRule && item.product.taxRule.isActive) {
            const rule = item.product.taxRule;
            let itemTax = 0;

            if (rule.type === 'percentage') {
                itemTax = (productPrice * rule.rate / 100) * item.qty;
            } else if (rule.type === 'fixed') {
                itemTax = rule.rate * item.qty;
            }

            // Only add to taxAmount (which is added to grandTotal) if it's exclusive
            if (rule.taxType === 'exclusive') {
                taxAmount += itemTax;
            }
        }

        // Map it to the Order's item schema, locking in the price
        orderItems.push({
            product: item.product._id,
            variant: item.variant || undefined,
            variantName: variantName,
            qty: item.qty,
            price: productPrice
        });
    });

    // --- COUPON/DISCOUNT CALCULATION LOGIC ---
    let discountAmount = 0;
    const now = new Date();

    if (cart.appliedCoupon && cart.appliedCoupon.isActive) {
        const coupon = cart.appliedCoupon;
        
        // Verify Coupon Constraints
        const isValidDate = now >= coupon.startDate && now <= coupon.endDate;
        const meetsMinPurchase = subTotal >= (coupon.minPurchaseAmount || 0);

        if (isValidDate && meetsMinPurchase) {
            if (coupon.discountType === 'percentage') {
                let calculatedDiscount = (subTotal * coupon.discountValue) / 100;
                // Cap the discount if maxDiscountAmount is specified
                if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
                    calculatedDiscount = Math.min(calculatedDiscount, coupon.maxDiscountAmount);
                }
                discountAmount = calculatedDiscount;
            } else if (coupon.discountType === 'fixed') {
                discountAmount = coupon.discountValue;
            }
        } else {
            // Optional: You could throw an error here, but typically we just ignore invalid coupons or notify user.
            // For strict security, let's keep discount at 0 if invalid.
            discountAmount = 0;
        }
    }

    // Ensure we don't discount more than the subtotal
    discountAmount = Math.min(discountAmount, subTotal);

    // Final Grand Total
    const grandTotal = subTotal + taxAmount - discountAmount;

    // 3. Create the Order document
    const order = await Order.create({
        customer: customerId,
        items: orderItems,
        subTotal,
        taxAmount,
        discountAmount,
        grandTotal,
        shippingAddress,
        paymentMethod: paymentMethod || 'cash_on_delivery',
        notes: notes || '',
        appliedCoupon: cart.appliedCoupon ? cart.appliedCoupon._id : null
    });

    // 4. Empty the Cart now that the order is successfully placed
    cart.items = [];
    cart.appliedCoupon = null;
    await cart.save();

    // 5. Send success response
    res.status(201).json({ 
        success: true, 
        message: "Order placed successfully!", 
        data: order 
    });
});

/**
 * @desc    Get logged in user's orders
 * @route   GET /api/order/myorders
 * @access  Private (Customer)
 */
const getMyOrders = AsyncHandler(async (req, res) => {
    const customerId = req.user._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({ customer: customerId });
    const orders = await Order.find({ customer: customerId })
        .populate('items.product', 'name mainImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        data: orders,
        pagination: {
            page,
            limit,
            totalOrders,
            totalPages: Math.ceil(totalOrders / limit)
        }
    });
});

/**
 * @desc    Get all orders (Admin Panel)
 * @route   GET /api/order
 * @access  Private (Admin)
 */
const getAllOrders = AsyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Optional filtering
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.customerId) filter.customer = req.query.customerId;

    const totalOrders = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        data: orders,
        pagination: {
            page,
            limit,
            totalOrders,
            totalPages: Math.ceil(totalOrders / limit)
        }
    });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/order/:id
 * @access  Private (Customer & Admin)
 */
const getOrderById = AsyncHandler(async (req, res) => {
    const orderId = req.params.id;
    
    const order = await Order.findById(orderId)
        .populate('customer', 'name email phone')
        .populate('items.product', 'name mainImage productType');

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // Security Check: If the user is a customer, they can only view THEIR OWN order.
    // (Assuming req.user.role exists and 'customer' is the role. If you don't use roles, checking the ID is safe enough)
    const isAdmin = req.user.role && (req.user.role === 'admin' || req.user.role === 'super_admin');
    
    if (!isAdmin && order.customer._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Forbidden: You are not authorized to view this order.");
    }

    res.status(200).json({ success: true, data: order });
});

/**
 * @desc    Update order status
 * @route   PUT /api/order/:id/status
 * @access  Private (Admin)
 */
const updateOrderStatus = AsyncHandler(async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    const validStatuses = ['pending', 'accepted', 'assigned', 'out_for_delivery', 'delivered', 'rejected', 'cancelled', 'completed'];
    
    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error(`Invalid status. Valid statuses are: ${validStatuses.join(', ')}`);
    }

    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // Basic state machine logic preventing illogical jumps
    if (order.orderStatus === 'delivered' || order.orderStatus === 'completed' || order.orderStatus === 'cancelled') {
        res.status(400);
        throw new Error(`Order is already ${order.orderStatus}. Status cannot be changed.`);
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: order
    });
});

/**
 * @desc    Cancel an order
 * @route   PUT /api/order/:id/cancel
 * @access  Private (Customer)
 */
const cancelOrder = AsyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // Ensure they own the order
    if (order.customer.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Forbidden: You can only cancel your own orders.");
    }

    // An order can only be cancelled if it hasn't progressed too far
    if (order.orderStatus !== 'pending' && order.orderStatus !== 'accepted') {
        res.status(400);
        throw new Error(`You cannot cancel this order because it is already ${order.orderStatus}. Please contact support.`);
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.status(200).json({
        success: true,
        message: "Your order has been cancelled successfully.",
        data: order
    });
});

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
};
