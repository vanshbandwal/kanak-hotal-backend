const AsyncHandler = require('express-async-handler');
const Sidebar = require('./sidebar.model');
const Role = require('../Role/role.model');
const AdminRole = require('../Role/adminRole.model');
const RoleSidebar = require('../Role/roleSidebar.model');

/**
 * Get sidebar menu items based on user role
 */
const getSidebarMenu = AsyncHandler(async (req, res) => {
    const adminId = req.user.id;

    // 1. Get Admin Roles
    const adminRoles = await AdminRole.find({ adminId }).populate('roleId');

    if (adminRoles.length === 0) {
        return res.status(200).json({ success: true, data: [] });
    }

    // 2. Check for Super Admin
    const isSuperAdmin = adminRoles.some(ar => ar.roleId.name === 'Admin');

    let menuItems;
    if (isSuperAdmin) {
        // Super Admin gets everything
        menuItems = await Sidebar.find().sort({ order: 1 });
    } else {
        // For other roles, fetch mapped items
        const roleIds = adminRoles.map(ar => ar.roleId._id);
        const roleSidebarItems = await RoleSidebar.find({
            roleId: { $in: roleIds }
        }).populate('sidebarId');

        // Extract unique sidebar items and sort them
        const uniqueItemsMap = new Map();
        roleSidebarItems.forEach(item => {
            if (item.sidebarId) {
                uniqueItemsMap.set(item.sidebarId._id.toString(), item.sidebarId);
            }
        });

        menuItems = Array.from(uniqueItemsMap.values())
            .sort((a, b) => a.order - b.order);
    }

    return res.status(200).json({ success: true, data: menuItems });
});

/**
 * Get all sidebar items (for admin role creation)
 */
const getAllSidebarItems = AsyncHandler(async (req, res) => {
    const items = await Sidebar.find().sort({ order: 1 });
    return res.status(200).json({ success: true, data: items });
});

module.exports = {
    getSidebarMenu,
    getAllSidebarItems,
};
