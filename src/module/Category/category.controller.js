const Category = require('./category.model');
const Subcategory = require('../Subcategory/subcategory.model');
const SubSubcategory = require('../SubSubcategory/subSubcategory.model');
const Product = require('../Product/product.model');

/**
 * Create a new category
 */
const createCategory = async (req, res) => {
    try {
        const { name, description, isActive, order } = req.body;
        
        let image = '';
        if (req.file) {
            image = `/uploads/categories/${req.file.filename}`;
        } else if (req.body.image) {
            image = req.body.image;
        }

        const category = await Category.create({
            name,
            description,
            image,
            isActive: isActive === 'true' || isActive === true,
            order: Number(order) || 0,
        });

        return res.status(201).json({
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        console.error('Error creating category:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category name or slug already exists' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        return res.status(500).json({ 
            message: 'Internal server error while creating category',
            error: error.message 
        });
    }
};

/**
 * Get all categories with pagination and sorting
 */
const getAllCategories = async (req, res) => {
    try {
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

        return res.status(200).json({
            data: categories,
            totalCount
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({ message: 'Internal server error while fetching categories' });
    }
};

/**
 * Get category by ID
 */
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.status(200).json(category);
    } catch (error) {
        console.error('Error fetching category details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Update category
 */
const updateCategory = async (req, res) => {
    try {
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

        const category = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.status(200).json({
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        console.error('Error updating category:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category name or slug already exists' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        return res.status(500).json({ 
            message: 'Internal server error while updating category',
            error: error.message 
        });
    }
};

/**
 * Delete category
 */
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Delete the category itself
        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // 2. Cascade delete: Subcategories
        await Subcategory.deleteMany({ categoryId: id });

        // 3. Cascade delete: Sub-Subcategories
        await SubSubcategory.deleteMany({ categoryId: id });

        // 4. Cascade delete: Products
        await Product.deleteMany({ category: id });

        return res.status(200).json({ 
            message: 'Category and all related subcategories, sub-subcategories, and products deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({ message: 'Internal server error while deleting category' });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
