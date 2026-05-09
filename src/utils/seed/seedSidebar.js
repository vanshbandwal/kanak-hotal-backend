const Sidebar = require('../../module/Sidebar/sidebar.model');

const menus = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', order: 1 },
    { name: 'Products', path: '/products', icon: '🛍️', order: 2 },
    { name: 'Orders', path: '/orders', icon: '📋', order: 3 },
    { name: 'Customers', path: '/customers', icon: '👤', order: 4 },
    { name: 'Coupon/Discount', path: '/coupons', icon: '🎫', order: 5 },
    { name: 'Banner', path: '/banners', icon: '🖼️', order: 6 },
    { name: 'Review & Rating', path: '/reviews', icon: '⭐', order: 7 },
    { name: 'CMS', path: '/cms', icon: '📝', order: 8 },
    { name: 'Query', path: '/queries', icon: '❓', order: 9 },
    { name: 'Report', path: '/reports', icon: '📉', order: 10 },
    {
        name: 'Role',
        path: '/roles',
        icon: '🛡️',
        order: 11,
        subItems: [
            { name: 'Add New Role', path: '/roles/add' },
            { name: 'Add Staff', path: '/roles/add-staff' },
            { name: 'List', path: '/roles/list' },
        ]
    },
];

const seedSidebar = async () => {
    await Sidebar.deleteMany();
    const data = await Sidebar.insertMany(menus);
    console.log('✅ Sidebar seeded');
    return data;
};

module.exports = seedSidebar;