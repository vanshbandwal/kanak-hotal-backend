const Brand = require('./brand.model');

/**
 * Create a new brand
 */
const createBrand = async (req, res) => {
    try {
        const { name, description, website, isActive, order } = req.body;
        
        let logo = '';
        if (req.file) {
            logo = `/uploads/brands/${req.file.filename}`;
        }

        const brand = await Brand.create({
            name,
            description,
            logo,
            website,
            isActive: isActive === 'true' || isActive === true,
            order: Number(order) || 0,
        });

        return res.status(201).json({
            success: true,
            message: 'Brand created successfully',
            data: brand
        });
    } catch (error) {
        console.error('Error creating brand:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Brand name already exists' });
        }
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error while creating brand',
            error: error.message 
        });
    }
};

/**
 * Get all brands with search, sorting and pagination
 */
const getAllBrands = async (req, res) => {
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

        const totalItems = await Brand.countDocuments(filterQuery);
        const brands = await Brand.find(filterQuery)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit));

        return res.status(200).json({
            success: true,
            data: brands,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: Number(page),
                limit: Number(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching brands:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get brand by ID
 */
const getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        return res.status(200).json({ success: true, data: brand });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update brand
 */
const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        if (req.file) {
            updates.logo = `/uploads/brands/${req.file.filename}`;
        }

        if (updates.isActive !== undefined) {
            updates.isActive = updates.isActive === 'true' || updates.isActive === true;
        }
        if (updates.order !== undefined) {
            updates.order = Number(updates.order) || 0;
        }

        const brand = await Brand.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Brand updated successfully',
            data: brand
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete brand
 */
const deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        return res.status(200).json({ success: true, message: 'Brand deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Toggle Status
 */
const toggleBrandStatus = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        brand.isActive = !brand.isActive;
        await brand.save();
        return res.status(200).json({ 
            success: true, 
            message: `Brand is now ${brand.isActive ? 'Active' : 'Inactive'}`,
            data: brand 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createBrand,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    toggleBrandStatus
};
