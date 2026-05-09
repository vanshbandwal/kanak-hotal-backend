const Role = require('./role.model');
const RolePermission = require('./rolePermission.model');
const RoleSidebar = require('./roleSidebar.model');

/**
 * Create a new role with permissions and sidebar mapping
 */
const createRole = async (req, res) => {
    try {
        const { name, label, description, permissionIds, sidebarIds } = req.body;

        // 1. Create the Role
        const role = await Role.create({ name, label, description });

        // 2. Map Permissions
        if (permissionIds && permissionIds.length > 0) {
            const rolePermissions = permissionIds.map(pId => ({
                roleId: role._id,
                permissionId: pId
            }));
            await RolePermission.insertMany(rolePermissions);
        }

        // 3. Map Sidebar Items
        if (sidebarIds && sidebarIds.length > 0) {
            const roleSidebars = sidebarIds.map(sId => ({
                roleId: role._id,
                sidebarId: sId
            }));
            await RoleSidebar.insertMany(roleSidebars);
        }

        return res.status(201).json({ message: 'Role created successfully', role });
    } catch (error) {
        console.error('Error creating role:', error);
        return res.status(500).json({ message: 'Internal server error while creating role' });
    }
};

/**
 * Get all roles
 */
const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find().lean();

        const rolesWithCounts = await Promise.all(roles.map(async (role) => {
            const [permissionCount, sidebarCount] = await Promise.all([
                RolePermission.countDocuments({ roleId: role._id }),
                RoleSidebar.countDocuments({ roleId: role._id })
            ]);
            return {
                ...role,
                permissionCount,
                sidebarCount
            };
        }));

        return res.status(200).json(rolesWithCounts);
    } catch (error) {
        console.error('Error fetching roles:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get role by ID with populated permissions and sidebar
 */
const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findById(id).lean();
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        const [permissions, sidebars] = await Promise.all([
            RolePermission.find({ roleId: id }).select('permissionId'),
            RoleSidebar.find({ roleId: id }).select('sidebarId')
        ]);

        return res.status(200).json({
            ...role,
            permissionIds: permissions.map(p => p.permissionId),
            sidebarIds: sidebars.map(s => s.sidebarId)
        });
    } catch (error) {
        console.error('Error fetching role details:', error);
        return res.status(500).json({ message: 'Internal server error while fetching role details' });
    }
};

/**
 * Update role
 */
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, label, description, permissionIds, sidebarIds } = req.body;

        // 1. Update Role
        const role = await Role.findByIdAndUpdate(id, { name, label, description }, { new: true });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // 2. Update Permissions Mapping
        if (permissionIds) {
            await RolePermission.deleteMany({ roleId: id });
            if (permissionIds.length > 0) {
                const rolePermissions = permissionIds.map(pId => ({
                    roleId: id,
                    permissionId: pId
                }));
                await RolePermission.insertMany(rolePermissions);
            }
        }

        // 3. Update Sidebar Mapping
        if (sidebarIds) {
            await RoleSidebar.deleteMany({ roleId: id });
            if (sidebarIds.length > 0) {
                const roleSidebars = sidebarIds.map(sId => ({
                    roleId: id,
                    sidebarId: sId
                }));
                await RoleSidebar.insertMany(roleSidebars);
            }
        }

        return res.status(200).json({ message: 'Role updated successfully', role });
    } catch (error) {
        console.error('Error updating role:', error);
        return res.status(500).json({ message: 'Internal server error while updating role' });
    }
};

/**
 * Delete role
 */
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Delete associated permissions and sidebar mappings
        await Promise.all([
            RolePermission.deleteMany({ roleId: id }),
            RoleSidebar.deleteMany({ roleId: id })
        ]);

        // 2. Delete Role
        const role = await Role.findByIdAndDelete(id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        return res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Error deleting role:', error);
        return res.status(500).json({ message: 'Internal server error while deleting role' });
    }
};

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
};
