const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../../module/Admin/admin.model');
const Role = require('../../module/Role/role.model');
const AdminRole = require('../../module/Role/adminRole.model');
const RoleSidebar = require('../../module/Role/roleSidebar.model');
const config = require('../../config/config');

const seedManager = async () => {
    try {
        await mongoose.connect(config.mongoose.url);
        console.log('🚀 Connected to MongoDB');

        // 1. Create Manager Role
        let managerRole = await Role.findOne({ name: 'Manager' });
        if (!managerRole) {
            managerRole = await Role.create({
                name: 'Manager',
                label: 'Manager',
                description: 'User with zero sidebar access'
            });
            console.log('✅ Manager Role created');
        }

        // 2. Create Manager User
        const email = 'manager@g.com';
        const password = '123456';
        const hashedPassword = await bcrypt.hash(password, 10);

        let managerUser = await Admin.findOne({ email });
        if (!managerUser) {
            managerUser = await Admin.create({
                name: 'My Manager',
                email: email,
                password: hashedPassword,
                role: 'employee'
            });
            console.log(`✅ Manager User created: ${email}`);
        } else {
            console.log(`ℹ️ Manager User already exists: ${email}`);
        }

        // 3. Map Role to User
        await AdminRole.deleteMany({ adminId: managerUser._id });
        await AdminRole.create({
            adminId: managerUser._id,
            roleId: managerRole._id
        });
        console.log('✅ Manager User mapped to Manager Role');

        // 4. Ensure NO Sidebar Mappings
        await RoleSidebar.deleteMany({ roleId: managerRole._id });
        console.log('✅ 0 Sidebar items mapped to Manager Role');

        console.log('🏁 Manager seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Manager seeding failed:', error);
        process.exit(1);
    }
};

seedManager();
