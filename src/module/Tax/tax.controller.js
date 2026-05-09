const Tax = require('./tax.model');

/**
 * Create a new Tax Rule
 */
const createTax = async (req, res) => {
    try {
        const { name, rate, type, taxType, isActive, description } = req.body;

        const tax = await Tax.create({
            name,
            rate,
            type,
            taxType,
            isActive,
            description
        });

        res.status(201).json({
            message: 'Tax rule created successfully',
            tax
        });
    } catch (error) {
        console.error('Error creating tax:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Tax rule name already exists' });
        }
        res.status(500).json({ message: 'Internal server error while creating tax', error: error.message });
    }
};

/**
 * Get all Tax Rules
 */
const getAllTaxes = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const taxes = await Tax.find(query).sort({ createdAt: -1 });
        res.status(200).json(taxes);
    } catch (error) {
        console.error('Error fetching taxes:', error);
        res.status(500).json({ message: 'Internal server error while fetching taxes' });
    }
};

/**
 * Get Tax Rule by ID
 */
const getTaxById = async (req, res) => {
    try {
        const { id } = req.params;
        const tax = await Tax.findById(id);

        if (!tax) {
            return res.status(404).json({ message: 'Tax rule not found' });
        }

        res.status(200).json(tax);
    } catch (error) {
        console.error('Error fetching tax details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Update Tax Rule
 */
const updateTax = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const tax = await Tax.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!tax) {
            return res.status(404).json({ message: 'Tax rule not found' });
        }

        res.status(200).json({
            message: 'Tax rule updated successfully',
            tax
        });
    } catch (error) {
        console.error('Error updating tax:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Tax rule name already exists' });
        }
        res.status(500).json({ message: 'Internal server error while updating tax', error: error.message });
    }
};

/**
 * Delete Tax Rule
 */
const deleteTax = async (req, res) => {
    try {
        const { id } = req.params;

        const tax = await Tax.findByIdAndDelete(id);

        if (!tax) {
            return res.status(404).json({ message: 'Tax rule not found' });
        }

        res.status(200).json({ message: 'Tax rule deleted successfully' });
    } catch (error) {
        console.error('Error deleting tax:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createTax,
    getAllTaxes,
    getTaxById,
    updateTax,
    deleteTax
};
