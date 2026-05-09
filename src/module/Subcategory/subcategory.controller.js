const Subcategory = require('./subcategory.model');
const SubSubcategory = require('../SubSubcategory/subSubcategory.model');
const Product = require('../Product/product.model');

/**
 * Create a new subcategory
 */
const createSubcategory = async (req, res) => {
    try {
        const { name, description, categoryId, isActive, order } = req.body;
        
        let image = '';
        if (req.file) {
            image = `/uploads/categories/${req.file.filename}`;
        } else if (req.body.image) {
            image = req.body.image;
        }

        if (!categoryId) {
            return res.status(400).json({ message: 'categoryId is required' });
        }

        const subcategory = await Subcategory.create({
            name,
            description,
            image,
            categoryId,
            isActive: isActive === 'true' || isActive === true,
            order: Number(order) || 0,
        });

        return res.status(201).json({
            message: 'Subcategory created successfully',
            subcategory
        });
    } catch (error) {
        console.error('Error creating subcategory:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Subcategory name or slug already exists' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        return res.status(500).json({ 
            message: 'Internal server error while creating subcategory',
            error: error.message 
        });
    }
};

/**
 * Get all subcategories with pagination and sorting
 */
const getAllSubcategories = async (req, res) => {
    try {
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

        return res.status(200).json({
            data: subcategories,
            totalCount
        });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return res.status(500).json({ message: 'Internal server error while fetching subcategories' });
    }
};

/**
 * Get subcategory by ID
 */
const getSubcategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const subcategory = await Subcategory.findById(id).populate('categoryId', 'name slug');

        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        return res.status(200).json(subcategory);
    } catch (error) {
        console.error('Error fetching subcategory details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Update subcategory
 */
const updateSubcategory = async (req, res) => {
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

        const subcategory = await Subcategory.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('categoryId', 'name slug');

        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        return res.status(200).json({
            message: 'Subcategory updated successfully',
            subcategory
        });
    } catch (error) {
        console.error('Error updating subcategory:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Subcategory name or slug already exists' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        return res.status(500).json({ 
            message: 'Internal server error while updating subcategory',
            error: error.message 
        });
    }
};

/**
 * Delete subcategory
 */
const deleteSubcategory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Delete the subcategory itself
        const subcategory = await Subcategory.findByIdAndDelete(id);

        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        // 2. Cascade delete: Sub-Subcategories
        await SubSubcategory.deleteMany({ subcategoryId: id });

        // 3. Cascade delete: Products
        await Product.deleteMany({ subcategory: id });

        return res.status(200).json({ 
            message: 'Subcategory and all related sub-subcategories and products deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        return res.status(500).json({ message: 'Internal server error while deleting subcategory' });
    }
};

module.exports = {
    createSubcategory,
    getAllSubcategories,
    getSubcategoryById,
    updateSubcategory,
    deleteSubcategory,
};
