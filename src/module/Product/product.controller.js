const AsyncHandler = require('express-async-handler');
const Product = require('./product.model');

// ➕ Create Product (Dish)
const createProduct = AsyncHandler(async (req, res) => {
    const bodyData = { ...req.body };

    // 1️⃣ Handle Image Uploads
    if (req.files && req.files.mainImage && req.files.mainImage[0]) {
        bodyData.mainImage = req.files.mainImage[0].path;
    }

    if (req.files && req.files.images) {
        bodyData.images = req.files.images.map(file => file.path);
    }

    // 2️⃣ Parse JSON strings from form-data
    if (typeof bodyData.variants === 'string') {
        try { bodyData.variants = JSON.parse(bodyData.variants); } catch (err) { bodyData.variants = []; }
    }
    if (typeof bodyData.comboItems === 'string') {
        try { bodyData.comboItems = JSON.parse(bodyData.comboItems); } catch (err) { bodyData.comboItems = []; }
    }

    // 3️⃣ Sanitize Optional ObjectId Fields (Prevent CastError on empty strings)
    ['brand', 'unit', 'subcategory', 'subSubcategory', 'taxRule'].forEach(field => {
        if (bodyData[field] === "" || bodyData[field] === "null" || bodyData[field] === "undefined") {
            delete bodyData[field];
        }
    });

    // 4️⃣ Apply Type-Specific Logic
    switch (bodyData.productType) {
        case 'single':
            bodyData.variants = [];
            bodyData.comboItems = [];
            if (!bodyData.price || bodyData.price <= 0) {
                res.status(400);
                throw new Error("A valid price is required for single dishes");
            }
            break;

        case 'variant':
            bodyData.price = 0;
            bodyData.salePrice = 0;
            bodyData.sku = undefined;
            bodyData.comboItems = [];
            if (!bodyData.variants || bodyData.variants.length === 0) {
                res.status(400);
                throw new Error("At least one portion size must be defined");
            }
            break;

        case 'combo':
            bodyData.variants = [];
            if (!bodyData.comboItems || bodyData.comboItems.length === 0) {
                res.status(400);
                throw new Error("A combo meal must contain at least one item");
            }
            break;

        default:
            res.status(400);
            throw new Error("Invalid dish type provided");
    }

    try {
        // 4️⃣ Create and Save
        const newProduct = new Product(bodyData);
        await newProduct.save();

        res.status(201).json({ success: true, 
            message: `Dish (${bodyData.productType}) created successfully`,
            data: newProduct
        });

    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            res.status(400);
            throw new Error(`Duplicate value error: A dish with this ${field} already exists.`);
        }
        throw error;
    }
});

// 📖 Get All Products
const getAllProducts = AsyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        search = "", 
        category, 
        isVeg,
        productType, 
        isActive,
        sort = 'createdAt',
        order = 'desc'
    } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (isVeg !== undefined) query.isVeg = isVeg === "true";
    if (productType) query.productType = productType;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const products = await Product.find(query)
        .populate('category', 'name')
        .populate('subcategory', 'name')
        .populate('subSubcategory', 'name')
        .populate('brand', 'name logo')
        .populate('unit', 'name shorthand')
        .populate('taxRule', 'name rate')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

    const totalItems = await Product.countDocuments(query);

    res.status(200).json({ success: true, 
        data: products,
        pagination: { totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: parseInt(page), limit: parseInt(limit) }
    });
});

// 🔎 Get Single Product
const getProductById = AsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category')
        .populate('subcategory')
        .populate('subSubcategory')
        .populate('brand')
        .populate('unit')
        .populate('taxRule');

    if (!product) {
        res.status(404);
        throw new Error("Dish not found");
    }

    res.status(200).json({ success: true,  data: product });
});

// 🖊️ Update Product
const updateProduct = AsyncHandler(async (req, res) => {
    const bodyData = { ...req.body };
    const productId = req.params.id;

    if (req.files && req.files.mainImage && req.files.mainImage[0]) {
        bodyData.mainImage = req.files.mainImage[0].path;
    }

    if (req.files && req.files.images) {
        bodyData.images = req.files.images.map(file => file.path);
    }

    if (typeof bodyData.variants === 'string') {
        try { bodyData.variants = JSON.parse(bodyData.variants); } catch (err) {}
    }
    if (typeof bodyData.comboItems === 'string') {
        try { bodyData.comboItems = JSON.parse(bodyData.comboItems); } catch (err) {}
    }

    // Sanitize Optional ObjectId Fields
    ['brand', 'unit', 'subcategory', 'subSubcategory', 'taxRule'].forEach(field => {
        if (bodyData[field] === "" || bodyData[field] === "null" || bodyData[field] === "undefined") {
            bodyData[field] = null; // Use null for updates to clear the field
        }
    });

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: bodyData },
        { new: true, runValidators: true }
    );

    if (!updatedProduct) {
        res.status(404);
        throw new Error("Dish not found");
    }

    res.status(200).json({ success: true,  message: "Dish updated successfully", data: updatedProduct });
});

// 🗑️ Delete Product
const deleteProduct = AsyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error("Dish not found");
    }
    res.status(200).json({ success: true,  message: "Dish deleted successfully" });
});

// 🔘 Toggle Active Status
const toggleProductStatus = AsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error("Dish not found");
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({ success: true,  message: `Dish is now ${product.isActive ? 'Active' : 'Inactive'}`, data: product });
});

module.exports = { 
    createProduct, 
    getAllProducts, 
    getProductById, 
    updateProduct, 
    deleteProduct,
    toggleProductStatus
};
