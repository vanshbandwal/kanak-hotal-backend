const Role = require('../../module/Role/role.model');
const Permission = require('../../module/Permission/permission.model');
const Sidebar = require('../../module/Sidebar/sidebar.model');
const RolePermission = require('../../module/Role/rolePermission.model');
const RoleSidebar = require('../../module/Role/roleSidebar.model');
const Admin = require('../../module/Admin/admin.model');
const AdminRole = require('../../module/Role/adminRole.model');

const seedRoles = async () => {
    try {
        // 1. Create Super Admin Role
        let superAdminRole = await Role.findOne({ name: 'Admin' });
        if (!superAdminRole) {
            superAdminRole = await Role.create({
                name: 'Admin',
                description: 'Full access to all system features'
            });
            console.log('✅ Super Admin Role created');
        }

        // 2. Map all Permissions to Super Admin
        const allPermissions = await Permission.find();
        const permissionMappings = allPermissions.map(p => ({
            roleId: superAdminRole._id,
            permissionId: p._id
        }));

        await RolePermission.deleteMany({ roleId: superAdminRole._id });
        await RolePermission.insertMany(permissionMappings);
        console.log(`✅ ${permissionMappings.length} Permissions mapped to Admin`);

        // 3. Map all Sidebar Items to Admin
        const allSidebarItems = await Sidebar.find();
        const sidebarMappings = allSidebarItems.map(s => ({
            roleId: superAdminRole._id,
            sidebarId: s._id
        }));

        await RoleSidebar.deleteMany({ roleId: superAdminRole._id });
        await RoleSidebar.insertMany(sidebarMappings);
        console.log(`✅ ${sidebarMappings.length} Sidebar items mapped to Admin`);

        // 4. Assign Admin Role to the first Admin user
        const firstAdmin = await Admin.findOne();
        if (firstAdmin) {
            await AdminRole.deleteMany({ adminId: firstAdmin._id });
            await AdminRole.create({
                adminId: firstAdmin._id,
                roleId: superAdminRole._id
            });
            console.log(`✅ Admin Role assigned to admin: ${firstAdmin.email}`);
        } else {
            console.warn('⚠️ No Admin user found to assign role');
        }

    } catch (error) {
        console.error('❌ Role seeding failed:', error);
        throw error;
    }
};

module.exports = seedRoles;
