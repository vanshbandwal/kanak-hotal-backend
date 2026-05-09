const mongoose = require('mongoose');
const config = require('../../config/config');
const seedPermissions = require('./seedPermissions');
const seedSidebar = require('./seedSidebar');
const seedRoles = require('./seedRoles');

const runSeeder = async () => {
    try {
        await mongoose.connect(config.mongoose.url);
        console.log('🚀 Connected to MongoDB for seeding');

        await seedPermissions();
        await seedSidebar();
        await seedRoles();

        console.log('✅ Base data ready');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

runSeeder();