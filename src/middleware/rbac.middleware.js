const AdminRole = require('../module/Role/adminRole.model');
const RolePermission = require('../module/Role/rolePermission.model');
const Permission = require('../module/Permission/permission.model');

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            // 🛑 SAFETY CHECK: Ensure authMiddleware was called first
            if (!req.user) {
                return res.status(401).json({ message: 'Authentication context missing' });
            }

            const adminId = req.user.id || req.user._id;

            // 2. Get user roles
            const adminRoles = await AdminRole.find({ adminId }).populate('roleId');

            if (!adminRoles || adminRoles.length === 0) {
                return res.status(403).json({ message: 'No roles assigned to this user' });
            }

            // 🔥 ADMIN BYPASS: If any role is Admin, grant everything
            // Added safety check ar.roleId? to prevent crash if role is missing
            const isAdmin = adminRoles.some(ar => ar.roleId?.name === 'Admin');
            if (isAdmin) {
                return next();
            }

            const roleIds = adminRoles.map(ar => ar.roleId?._id).filter(id => id);

            // 3. Get permissions for these roles
            const rolePermissions = await RolePermission.find({
                roleId: { $in: roleIds }
            }).populate('permissionId');

            // 4. Check if required permission exists
            // Added safety check rp.permissionId? to prevent crash if permission is missing
            const hasPermission = rolePermissions.some(rp => rp.permissionId?.name === requiredPermission);

            if (hasPermission) {
                return next();
            }

            return res.status(403).json({ message: `Permission denied: ${requiredPermission}` });
        } catch (error) {
            console.error('RBAC Error:', error);
            return res.status(500).json({ message: 'Internal server error in access control' });
        }
    };
};


module.exports = { checkPermission };
