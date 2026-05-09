const Unit = require('./unit.model');

/**
 * Create a new unit
 */
const createUnit = async (req, res) => {
    try {
        const { name, shorthand, description, isActive, baseUnit, conversionFactor } = req.body;

        const unit = await Unit.create({
            name,
            shorthand,
            description,
            isActive: isActive === 'true' || isActive === true,
            baseUnit: baseUnit || null,
            conversionFactor: Number(conversionFactor) || 1,
        });

        return res.status(201).json({
            success: true,
            message: 'Unit created successfully',
            data: unit
        });
    } catch (error) {
        console.error('Error creating unit:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Unit name or shorthand already exists' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        return res.status(500).json({ success: false, message: 'Internal server error while creating unit', error: error.message });
    }
};

/**
 * Get all units with search, sorting and pagination
 */
const getAllUnits = async (req, res) => {
    try {
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

        return res.status(200).json({
            success: true,
            data: units,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: Number(page),
                limit: Number(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching units:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get unit by ID
 */
const getUnitById = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id).populate('baseUnit', 'name shorthand');
        if (!unit) {
            return res.status(404).json({ success: false, message: 'Unit not found' });
        }
        return res.status(200).json({ success: true, data: unit });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update unit
 */
const updateUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        if (updates.isActive !== undefined) {
            updates.isActive = updates.isActive === 'true' || updates.isActive === true;
        }

        const unit = await Unit.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!unit) {
            return res.status(404).json({ success: false, message: 'Unit not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Unit updated successfully',
            data: unit
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete unit
 */
const deleteUnit = async (req, res) => {
    try {
        const unit = await Unit.findByIdAndDelete(req.params.id);
        if (!unit) {
            return res.status(404).json({ success: false, message: 'Unit not found' });
        }
        return res.status(200).json({ success: true, message: 'Unit deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Toggle Status
 */
const toggleUnitStatus = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ success: false, message: 'Unit not found' });
        }
        unit.isActive = !unit.isActive;
        await unit.save();
        return res.status(200).json({ 
            success: true, 
            message: `Unit is now ${unit.isActive ? 'Active' : 'Inactive'}`,
            data: unit 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createUnit,
    getAllUnits,
    getUnitById,
    updateUnit,
    deleteUnit,
    toggleUnitStatus
};
