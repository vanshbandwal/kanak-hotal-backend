const Permission = require('./permission.model');

/**
 * Get all permissions grouped by module
 */
const getAllPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find();

        return res.status(200).json(permissions);

    } catch (error) {
        console.error('Error fetching permissions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllPermissions,
};
