const AsyncHandler = require('express-async-handler');
const Category = require('./category.model');
const Subcategory = require('../Subcategory/subcategory.model');
const SubSubcategory = require('../SubSubcategory/subSubcategory.model');
const Product = require('../Product/product.model');

/**
 * Create a new category
 */
const createCategory = AsyncHandler(async (req, res) => {
    const { name, description, isActive, order } = req.body;
    
    let image = '';
    if (req.file) {
        image = `/uploads/categories/${req.file.filename}`;
    } else if (req.body.image) {
        image = req.body.image;
    }

    try {
        const category = await Category.create({
            name,
            description,
            image,
            isActive: isActive === 'true' || isActive === true,
            order: Number(order) || 0,
        });

        return res.status(201).json({ success: true, 
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            throw new Error('Category name or slug already exists');
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            res.status(400);
            throw new Error(messages.join(', '));
        }
        throw error;
    }
});

/**
 * Get all categories with pagination and sorting
 */
const getAllCategories = AsyncHandler(async (req, res) => {
    const { search, page = 1, limit = 10, sort = 'order', order = 'asc' } = req.query;
    let filterQuery = {};

    if (search) {
        filterQuery = {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const totalCount = await Category.countDocuments(filterQuery);
    const categories = await Category.find(filterQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));

    return res.status(200).json({ success: true, 
        data: categories,
        totalCount
    });
});

/**
 * Get category by ID
 */
const getCategoryById = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    return res.status(200).json({ success: true, data: category });
});

/**
 * Update category
 */
const updateCategory = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
        updates.image = `/uploads/categories/${req.file.filename}`;
    }

    // Explicitly cast fields from FormData strings
    if (updates.isActive !== undefined) {
        updates.isActive = updates.isActive === 'true' || updates.isActive === true;
    }
    if (updates.order !== undefined) {
        updates.order = Number(updates.order) || 0;
    }

    try {
        const category = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!category) {
            res.status(404);
            throw new Error('Category not found');
        }

        return res.status(200).json({ success: true, 
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            throw new Error('Category name or slug already exists');
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            res.status(400);
            throw new Error(messages.join(', '));
        }
        throw error;
    }
});

/**
 * Delete category
 */
const deleteCategory = AsyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1. Delete the category itself
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    // 2. Cascade delete: Subcategories
    await Subcategory.deleteMany({ categoryId: id });

    // 3. Cascade delete: Sub-Subcategories
    await SubSubcategory.deleteMany({ categoryId: id });

    // 4. Cascade delete: Products
    await Product.deleteMany({ category: id });

    return res.status(200).json({ success: true,  
        message: 'Category and all related subcategories, sub-subcategories, and products deleted successfully' 
    });
});

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
