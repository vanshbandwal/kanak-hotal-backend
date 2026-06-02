const AsyncHandler = require('express-async-handler');
const Brand = require('./brand.model');

/**
 * Create a new brand
 */
const createBrand = AsyncHandler(async (req, res) => {
    const { name, description, website, isActive, order } = req.body;
    
    let logo = '';
    if (req.file) {
        logo = `/uploads/brands/${req.file.filename}`;
    }

    try {
        const brand = await Brand.create({
            name,
            description,
            logo,
            website,
            isActive: isActive === 'true' || isActive === true,
            order: Number(order) || 0,
        });

        return res.status(201).json({ success: true, 
            message: 'Brand created successfully',
            data: brand
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            throw new Error('Brand name already exists');
        }
        throw error;
    }
});

/**
 * Get all brands with search, sorting and pagination
 */
const getAllBrands = AsyncHandler(async (req, res) => {
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

    return res.status(200).json({ success: true, 
        data: brands,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: Number(page),
            limit: Number(limit)
        }
    });
});

/**
 * Get brand by ID
 */
const getBrandById = AsyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
        res.status(404);
        throw new Error('Brand not found');
    }
    return res.status(200).json({ success: true,  data: brand });
});

/**
 * Update brand
 */
const updateBrand = AsyncHandler(async (req, res) => {
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
        res.status(404);
        throw new Error('Brand not found');
    }

    return res.status(200).json({ success: true, 
        message: 'Brand updated successfully',
        data: brand
    });
});

/**
 * Delete brand
 */
const deleteBrand = AsyncHandler(async (req, res) => {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
        res.status(404);
        throw new Error('Brand not found');
    }
    return res.status(200).json({ success: true,  message: 'Brand deleted successfully' });
});

/**
 * Toggle Status
 */
const toggleBrandStatus = AsyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
        res.status(404);
        throw new Error('Brand not found');
    }
    brand.isActive = !brand.isActive;
    await brand.save();
    return res.status(200).json({ success: true,  
        message: `Brand is now ${brand.isActive ? 'Active' : 'Inactive'}`,
        data: brand 
    });
});

module.exports = {
    createBrand,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    toggleBrandStatus
};
