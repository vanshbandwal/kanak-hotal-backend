const express = require("express");
const router = express.Router();
const validate = require("../../middlewares/validate");
const reviewSchemas = require("./review.validation");
const { 
    createReview, 
    getAllReviews, 
    replyToReview, 
    deleteReview 
} = require("./review.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const { checkPermission } = require("../../middleware/rbac.middleware");

// ➕ CREATE (Customer)
router.post(
    "/create", 
    authMiddleware, 
    validate(reviewSchemas.createReview), 
    createReview
);

// 📖 READ ALL (Admin)
router.get(
    "/", 
    authMiddleware, 
    checkPermission("VIEW_REVIEW"), 
    getAllReviews
);

// 🖊️ REPLY (Admin)
router.put(
    "/reply/:id", 
    authMiddleware, 
    checkPermission("EDIT_REVIEW"), 
    validate(reviewSchemas.reviewIdParam), // assuming we validate params
    validate(reviewSchemas.replyReview), // assuming we validate body
    replyToReview
);

// 🗑️ DELETE (Admin)
router.delete(
    "/delete/:id", 
    authMiddleware, 
    checkPermission("DELETE_REVIEW"), 
    validate(reviewSchemas.reviewIdParam), 
    deleteReview
);

module.exports = router;
