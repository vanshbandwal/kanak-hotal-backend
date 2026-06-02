const AsyncHandler = require('express-async-handler');
const Tax = require('./tax.model');

/**
 * Create a new Tax Rule
 */
const createTax = AsyncHandler(async (req, res) => {
    const { name, rate, type, taxType, isActive, description } = req.body;

    try {
        const tax = await Tax.create({
            name,
            rate,
            type,
            taxType,
            isActive,
            description
        });

        res.status(201).json({ success: true, 
            message: 'Tax rule created successfully',
            tax
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            throw new Error('Tax rule name already exists');
        }
        throw error;
    }
});

/**
 * Get all Tax Rules
 */
const getAllTaxes = AsyncHandler(async (req, res) => {
    const { search } = req.query;
    let query = {};
    
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    const taxes = await Tax.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: taxes });
});

/**
 * Get Tax Rule by ID
 */
const getTaxById = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const tax = await Tax.findById(id);

    if (!tax) {
        res.status(404);
        throw new Error('Tax rule not found');
    }

    res.status(200).json({ success: true, data: tax });
});

/**
 * Update Tax Rule
 */
const updateTax = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const tax = await Tax.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!tax) {
            res.status(404);
            throw new Error('Tax rule not found');
        }

        res.status(200).json({ success: true, 
            message: 'Tax rule updated successfully',
            tax
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400);
            throw new Error('Tax rule name already exists');
        }
        throw error;
    }
});

/**
 * Delete Tax Rule
 */
const deleteTax = AsyncHandler(async (req, res) => {
    const { id } = req.params;

    const tax = await Tax.findByIdAndDelete(id);

    if (!tax) {
        res.status(404);
        throw new Error('Tax rule not found');
    }

    res.status(200).json({ success: true,  message: 'Tax rule deleted successfully' });
});

module.exports = {
    createTax,
    getAllTaxes,
    getTaxById,
    updateTax,
    deleteTax
};
