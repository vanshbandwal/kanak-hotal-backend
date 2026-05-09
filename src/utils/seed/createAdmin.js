const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../../module/Admin/admin.model');
const config = require('../../config/config');

const createAdmin = async () => {
    try {
        await mongoose.connect(config.mongoose.url);
        console.log('🚀 Connected to MongoDB');

        const email = 'admin@g.com';
        const password = '123456';
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            adminExists.password = hashedPassword;
            await adminExists.save();
            console.log(`✅ Admin updated: ${email}`);
        } else {
            await Admin.create({
                name: 'Admin',
                email: email,
                password: hashedPassword,
                role: 'admin'
            });
            console.log(`✅ Admin created: ${email}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
