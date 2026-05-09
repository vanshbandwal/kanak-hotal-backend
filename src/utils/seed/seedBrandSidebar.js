const mongoose = require('mongoose');
const Sidebar = require('./src/module/Sidebar/sidebar.model');
const config = require('./src/config/config');

const mongoUri = config.mongoose.url;

const seedBrandSidebar = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Check if Products exists
        const productsMenu = await Sidebar.findOne({ name: 'Products' });

        if (productsMenu) {
            // Check if Brands already in subItems
            const brandExists = productsMenu.subItems.some(sub => sub.name === 'Brand Management');
            
            if (!brandExists) {
                productsMenu.subItems.push({
                    name: 'Brand Management',
                    path: '/products' // In this project, seems everything is under /products screen but with different tabs?
                });
                // Wait, let's look at ProductsScreen.tsx to see how it handles tabs.
                await productsMenu.save();
                console.log('Added Brand Management to Products sub-items');
            } else {
                console.log('Brand Management already exists in sidebar');
            }
        } else {
            console.log('Products menu not found, creating a new top-level Brands menu');
            await Sidebar.create({
                name: 'Brands',
                path: '/brands',
                icon: '🏷️',
                order: 3,
                subItems: []
            });
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Seeding error:', error);
    }
};

seedBrandSidebar();
