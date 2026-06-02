const AsyncHandler = require('express-async-handler');
const Role = require('./role.model');
const RolePermission = require('./rolePermission.model');
const RoleSidebar = require('./roleSidebar.model');

/**
 * Create a new role with permissions and sidebar mapping
 */
const createRole = AsyncHandler(async (req, res) => {
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

    return res.status(201).json({ success: true,  message: 'Role created successfully', role });
});

/**
 * Get all roles
 */
const getAllRoles = AsyncHandler(async (req, res) => {
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

    return res.status(200).json({ success: true, data: rolesWithCounts });
});

/**
 * Get role by ID with populated permissions and sidebar
 */
const getRoleById = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const role = await Role.findById(id).lean();
    if (!role) {
        res.status(404);
        throw new Error('Role not found');
    }

    const [permissions, sidebars] = await Promise.all([
        RolePermission.find({ roleId: id }).select('permissionId'),
        RoleSidebar.find({ roleId: id }).select('sidebarId')
    ]);

    return res.status(200).json({ success: true, 
        ...role,
        permissionIds: permissions.map(p => p.permissionId),
        sidebarIds: sidebars.map(s => s.sidebarId)
    });
});

/**
 * Update role
 */
const updateRole = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, label, description, permissionIds, sidebarIds } = req.body;

    // 1. Update Role
    const role = await Role.findByIdAndUpdate(id, { name, label, description }, { new: true });
    if (!role) {
        res.status(404);
        throw new Error('Role not found');
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

    return res.status(200).json({ success: true,  message: 'Role updated successfully', role });
});

/**
 * Delete role
 */
const deleteRole = AsyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1. Delete associated permissions and sidebar mappings
    await Promise.all([
        RolePermission.deleteMany({ roleId: id }),
        RoleSidebar.deleteMany({ roleId: id })
    ]);

    // 2. Delete Role
    const role = await Role.findByIdAndDelete(id);
    if (!role) {
        res.status(404);
        throw new Error('Role not found');
    }

    return res.status(200).json({ success: true,  message: 'Role deleted successfully' });
});

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
};
