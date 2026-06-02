const AsyncHandler = require('express-async-handler');
const Subcategory = require('./subcategory.model');
const SubSubcategory = require('../SubSubcategory/subSubcategory.model');
const Product = require('../Product/product.model');

/**
 * Create a new subcategory
 */
const createSubcategory = AsyncHandler(async (req, res) => {
    const { name, description, categoryId, isActive, order } = req.body;
    
    let image = '';
    if (req.file) {
        image = `/uploads/categories/${req.file.filename}`;
    } else if (req.body.image) {
        image = req.body.image;
    }

    if (!categoryId) {
        res.status(400);
        throw new Error('categoryId is required');
    }

    try {
        const subcategory = await Subcategory.create({
            name,
            description,
            image,
            categoryId,
            isActive: isActive === 'true' || isActive === true,
            order: Number(order) || 0,
        });

        return res.status(201).json({ success: true, 
            message: 'Subcategory created successfully',
            subcategory
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            throw new Error('Subcategory name or slug already exists');
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
 * Get all subcategories with pagination and sorting
 */
const getAllSubcategories = AsyncHandler(async (req, res) => {
    const { search, categoryId, page = 1, limit = 10, sort = 'order', order = 'asc' } = req.query;
    let filterQuery = {};

    if (categoryId) {
        filterQuery.categoryId = categoryId;
    }

    if (search) {
        filterQuery = {
            ...filterQuery,
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const totalCount = await Subcategory.countDocuments(filterQuery);
    const subcategories = await Subcategory.find(filterQuery)
        .populate('categoryId', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));

    return res.status(200).json({ success: true, 
        data: subcategories,
        totalCount
    });
});

/**
 * Get subcategory by ID
 */
const getSubcategoryById = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const subcategory = await Subcategory.findById(id).populate('categoryId', 'name slug');

    if (!subcategory) {
        res.status(404);
        throw new Error('Subcategory not found');
    }

    return res.status(200).json({ success: true, data: subcategory });
});

/**
 * Update subcategory
 */
const updateSubcategory = AsyncHandler(async (req, res) => {
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
        const subcategory = await Subcategory.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('categoryId', 'name slug');

        if (!subcategory) {
            res.status(404);
            throw new Error('Subcategory not found');
        }

        return res.status(200).json({ success: true, 
            message: 'Subcategory updated successfully',
            subcategory
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            throw new Error('Subcategory name or slug already exists');
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
 * Delete subcategory
 */
const deleteSubcategory = AsyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1. Delete the subcategory itself
    const subcategory = await Subcategory.findByIdAndDelete(id);

    if (!subcategory) {
        res.status(404);
        throw new Error('Subcategory not found');
    }

    // 2. Cascade delete: Sub-Subcategories
    await SubSubcategory.deleteMany({ subcategoryId: id });

    // 3. Cascade delete: Products
    await Product.deleteMany({ subcategory: id });

    return res.status(200).json({ success: true,  
        message: 'Subcategory and all related sub-subcategories and products deleted successfully' 
    });
});

module.exports = {
    createSubcategory,
    getAllSubcategories,
    getSubcategoryById,
    updateSubcategory,
    deleteSubcategory,
};
