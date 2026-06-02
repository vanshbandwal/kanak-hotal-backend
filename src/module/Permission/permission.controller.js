const AsyncHandler = require('express-async-handler');
const Permission = require('./permission.model');

/**
 * Get all permissions grouped by module
 */
const getAllPermissions = AsyncHandler(async (req, res) => {
    const permissions = await Permission.find();
    return res.status(200).json({ success: true, data: permissions });
});

module.exports = {
    getAllPermissions,
};
