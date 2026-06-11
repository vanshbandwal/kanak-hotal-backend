const AsyncHandler = require('express-async-handler');
const Review = require('./review.model');
const Product = require('../Product/product.model');

// Helper function to update product rating
const updateProductRating = async (productId) => {
    const stats = await Review.aggregate([
        {
            $match: { product: productId, isApproved: true }
        },
        {
            $group: {
                _id: '$product',
                numReviews: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            ratings: Math.round(stats[0].avgRating * 10) / 10,
            numReviews: stats[0].numReviews
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            ratings: 0,
            numReviews: 0
        });
    }
};

/**
 * @desc    Create new review
 * @route   POST /v1/review/create
 * @access  Private (Customer)
 */
const createReview = AsyncHandler(async (req, res) => {
    const { productId, rating, comment } = req.body;
    const customerId = req.user.id || req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // Check if customer already reviewed this product
    const alreadyReviewed = await Review.findOne({ customer: customerId, product: productId });
    if (alreadyReviewed) {
        res.status(400);
        throw new Error("You have already reviewed this product");
    }

    const review = await Review.create({
        customer: customerId,
        product: productId,
        rating: Number(rating),
        comment,
        isApproved: true // Auto-approve by default as per plan
    });

    await updateProductRating(productId);

    res.status(201).json({
        success: true,
        message: "Review added successfully",
        data: review
    });
});

/**
 * @desc    Get all reviews (Admin)
 * @route   GET /v1/review
 * @access  Private (Admin)
 */
const getAllReviews = AsyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Review.countDocuments();
    const reviews = await Review.find()
        .populate('customer', 'name email avatar')
        .populate('product', 'name mainImage')
        .sort({ createdAt: -1 })
        .skip(startIndex)
        .limit(limit);

    res.status(200).json({
        success: true,
        count: reviews.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: reviews
    });
});

/**
 * @desc    Reply to review
 * @route   PUT /v1/review/reply/:id
 * @access  Private (Admin)
 */
const replyToReview = AsyncHandler(async (req, res) => {
    const reviewId = req.params.id;
    const { reply } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
        res.status(404);
        throw new Error("Review not found");
    }

    review.reply = reply;
    await review.save();

    res.status(200).json({
        success: true,
        message: "Reply added successfully",
        data: review
    });
});

/**
 * @desc    Delete review
 * @route   DELETE /v1/review/delete/:id
 * @access  Private (Admin)
 */
const deleteReview = AsyncHandler(async (req, res) => {
    const reviewId = req.params.id;
    
    const review = await Review.findById(reviewId);
    if (!review) {
        res.status(404);
        throw new Error("Review not found");
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalculate rating
    await updateProductRating(productId);

    res.status(200).json({
        success: true,
        message: "Review deleted successfully"
    });
});

module.exports = {
    createReview,
    getAllReviews,
    replyToReview,
    deleteReview
};
