const SubSubcategory = require('./subSubcategory.model');
const Product = require('../Product/product.model');

/**
 * Create a new sub-subcategory
 */
const createSubSubcategory = async (req, res) => {
    try {
        const { name, description, subcategoryId, categoryId, isActive, order } = req.body;
        
        let image = '';
        if (req.file) {
            image = `/uploads/categories/${req.file.filename}`;
        } else if (req.body.image) {
            image = req.body.image;
        }

        if (!subcategoryId) {
            return res.status(400).json({ message: 'subcategoryId is required' });
        }

        if (!categoryId) {
            return res.status(400).json({ message: 'categoryId is required' });
        }

        const subSubcategory = await SubSubcategory.create({
            name,
            description,
            image,
            subcategoryId,
            categoryId,
            isActive: isActive === 'true' || isActive === true,
            order: Number(order) || 0,
        });

        return res.status(201).json({
            message: 'Sub-subcategory created successfully',
            subSubcategory
        });
    } catch (error) {
        console.error('Error creating sub-subcategory:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Sub-subcategory name or slug already exists' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        return res.status(500).json({ 
            message: 'Internal server error while creating sub-subcategory',
            error: error.message 
        });
    }
};

/**
 * Get all sub-subcategories with pagination and sorting
 */
const getAllSubSubcategories = async (req, res) => {
    try {
        const { search, subcategoryId, categoryId, page = 1, limit = 10, sort = 'order', order = 'asc' } = req.query;
        let filterQuery = {};

        if (search) {
            filterQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (subcategoryId) {
            filterQuery.subcategoryId = subcategoryId;
        }

        if (categoryId) {
            filterQuery.categoryId = categoryId;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sortOptions = {};
        sortOptions[sort] = order === 'desc' ? -1 : 1;

        const totalCount = await SubSubcategory.countDocuments(filterQuery);
        const subSubcategories = await SubSubcategory.find(filterQuery)
            .populate('subcategoryId', 'name slug')
            .populate('categoryId', 'name slug')
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit));

        return res.status(200).json({
            data: subSubcategories,
            totalCount
        });
    } catch (error) {
        console.error('Error fetching sub-subcategories:', error);
        return res.status(500).json({ message: 'Internal server error while fetching sub-subcategories' });
    }
};

/**
 * Get sub-subcategory by ID
 */
const getSubSubcategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const subSubcategory = await SubSubcategory.findById(id)
            .populate('subcategoryId', 'name slug')
            .populate('categoryId', 'name slug');

        if (!subSubcategory) {
            return res.status(404).json({ message: 'Sub-subcategory not found' });
        }

        return res.status(200).json(subSubcategory);
    } catch (error) {
        console.error('Error fetching sub-subcategory details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Update sub-subcategory
 */
const updateSubSubcategory = async (req, res) => {
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

        const subSubcategory = await SubSubcategory.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
            .populate('subcategoryId', 'name slug')
            .populate('categoryId', 'name slug');

        if (!subSubcategory) {
            return res.status(404).json({ message: 'Sub-subcategory not found' });
        }

        return res.status(200).json({
            message: 'Sub-subcategory updated successfully',
            subSubcategory
        });
    } catch (error) {
        console.error('Error updating sub-subcategory:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Sub-subcategory name or slug already exists' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        return res.status(500).json({ 
            message: 'Internal server error while updating sub-subcategory',
            error: error.message 
        });
    }
};

/**
 * Delete sub-subcategory
 */
const deleteSubSubcategory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Delete the sub-subcategory itself
        const subSubcategory = await SubSubcategory.findByIdAndDelete(id);

        if (!subSubcategory) {
            return res.status(404).json({ message: 'Sub-subcategory not found' });
        }

        // 2. Cascade delete: Products
        await Product.deleteMany({ subSubcategory: id });

        return res.status(200).json({ 
            message: 'Sub-subcategory and all related products deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting sub-subcategory:', error);
        return res.status(500).json({ message: 'Internal server error while deleting sub-subcategory' });
    }
};

module.exports = {
    createSubSubcategory,
    getAllSubSubcategories,
    getSubSubcategoryById,
    updateSubSubcategory,
    deleteSubSubcategory,
};
