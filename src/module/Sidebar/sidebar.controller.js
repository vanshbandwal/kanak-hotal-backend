const Sidebar = require('./sidebar.model');
const Role = require('../Role/role.model');
const AdminRole = require('../Role/adminRole.model');
const RoleSidebar = require('../Role/roleSidebar.model');

/**
 * Get sidebar menu items based on user role
 */
const getSidebarMenu = async (req, res) => {
    try {
        const adminId = req.user.id;

        // 1. Get Admin Roles
        const adminRoles = await AdminRole.find({ adminId }).populate('roleId');

        if (adminRoles.length === 0) {
            return res.status(200).json([]);
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

        return res.status(200).json(menuItems);
    } catch (error) {
        console.error('Error fetching sidebar menu:', error);
        return res.status(500).json({ message: 'Internal server error while fetching sidebar' });
    }
};

/**
 * Get all sidebar items (for admin role creation)
 */
const getAllSidebarItems = async (req, res) => {
    try {
        const items = await Sidebar.find().sort({ order: 1 });
        return res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching all sidebar items:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getSidebarMenu,
    getAllSidebarItems,
};
