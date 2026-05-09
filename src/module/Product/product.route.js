const express = require("express");
const router = express.Router();
const uploadProduct = require("../../middlewares/uploadProduct.middleware");
const validate = require("../../middlewares/validate");
const productSchemas = require("./product.validation");
const { 
    createProduct, 
    getAllProducts, 
    getProductById, 
    updateProduct, 
    deleteProduct,
    toggleProductStatus 
} = require("./product.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const { checkPermission } = require("../../middleware/rbac.middleware");

// ➕ CREATE
router.post("/create", authMiddleware, checkPermission("CREATE_PRODUCT"), uploadProduct, validate(productSchemas.createProduct), createProduct);

// 📖 READ ALL
router.get("/", authMiddleware, checkPermission("VIEW_PRODUCT"), getAllProducts);

// 🔎 READ ONE
router.get("/:id", authMiddleware, checkPermission("VIEW_PRODUCT"), validate(productSchemas.productIdParam), getProductById);

// 🖊️ UPDATE
router.put("/update/:id", authMiddleware, checkPermission("EDIT_PRODUCT"), uploadProduct, validate(productSchemas.updateProduct), updateProduct);

// 🗑️ DELETE
router.delete("/delete/:id", authMiddleware, checkPermission("DELETE_PRODUCT"), validate(productSchemas.productIdParam), deleteProduct);

// 🔘 PATCH (Toggle Status)
router.patch("/toggle-status/:id", authMiddleware, checkPermission("EDIT_PRODUCT"), validate(productSchemas.productIdParam), toggleProductStatus);

module.exports = router;
