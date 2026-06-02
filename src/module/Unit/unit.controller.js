const AsyncHandler = require('express-async-handler');
const Unit = require('./unit.model');

/**
 * Create a new unit
 */
const createUnit = AsyncHandler(async (req, res) => {
    const { name, shorthand, description, isActive, baseUnit, conversionFactor } = req.body;

    try {
        const unit = await Unit.create({
            name,
            shorthand,
            description,
            isActive: isActive === 'true' || isActive === true,
            baseUnit: baseUnit || null,
            conversionFactor: Number(conversionFactor) || 1,
        });

        return res.status(201).json({ success: true, 
            message: 'Unit created successfully',
            data: unit
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            throw new Error('Unit name or shorthand already exists');
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
 * Get all units with search, sorting and pagination
 */
const getAllUnits = AsyncHandler(async (req, res) => {
    const { search, page = 1, limit = 10, sort = 'name', order = 'asc' } = req.query;
    let filterQuery = {};

    if (search) {
        filterQuery = {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { shorthand: { $regex: search, $options: 'i' } }
            ]
        };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const totalItems = await Unit.countDocuments(filterQuery);
    const units = await Unit.find(filterQuery)
        .populate('baseUnit', 'name shorthand')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));

    return res.status(200).json({ success: true, 
        data: units,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: Number(page),
            limit: Number(limit)
        }
    });
});

/**
 * Get unit by ID
 */
const getUnitById = AsyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id).populate('baseUnit', 'name shorthand');
    if (!unit) {
        res.status(404);
        throw new Error('Unit not found');
    }
    return res.status(200).json({ success: true,  data: unit });
});

/**
 * Update unit
 */
const updateUnit = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.isActive !== undefined) {
        updates.isActive = updates.isActive === 'true' || updates.isActive === true;
    }

    try {
        const unit = await Unit.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!unit) {
            res.status(404);
            throw new Error('Unit not found');
        }

        return res.status(200).json({ success: true, 
            message: 'Unit updated successfully',
            data: unit
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            res.status(400);
            throw new Error(messages.join(', '));
        }
        throw error;
    }
});

/**
 * Delete unit
 */
const deleteUnit = AsyncHandler(async (req, res) => {
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) {
        res.status(404);
        throw new Error('Unit not found');
    }
    return res.status(200).json({ success: true,  message: 'Unit deleted successfully' });
});

/**
 * Toggle Status
 */
const toggleUnitStatus = AsyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
        res.status(404);
        throw new Error('Unit not found');
    }
    unit.isActive = !unit.isActive;
    await unit.save();
    return res.status(200).json({ success: true,  
        message: `Unit is now ${unit.isActive ? 'Active' : 'Inactive'}`,
        data: unit 
    });
});

module.exports = {
    createUnit,
    getAllUnits,
    getUnitById,
    updateUnit,
    deleteUnit,
    toggleUnitStatus
};
