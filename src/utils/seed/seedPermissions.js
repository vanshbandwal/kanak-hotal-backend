const Permission = require('../../module/Permission/permission.model');

const permissions = [
    // USER
    { name: 'CREATE_USER', module: 'USER', action: 'CREATE' },
    { name: 'EDIT_USER', module: 'USER', action: 'EDIT' },
    { name: 'DELETE_USER', module: 'USER', action: 'DELETE' },
    { name: 'VIEW_USER', module: 'USER', action: 'VIEW' },

    // PRODUCT
    { name: 'CREATE_PRODUCT', module: 'PRODUCT', action: 'CREATE' },
    { name: 'EDIT_PRODUCT', module: 'PRODUCT', action: 'EDIT' },
    { name: 'DELETE_PRODUCT', module: 'PRODUCT', action: 'DELETE' },
    { name: 'VIEW_PRODUCT', module: 'PRODUCT', action: 'VIEW' },

    // ORDER
    { name: 'VIEW_ORDER', module: 'ORDER', action: 'VIEW' },
    { name: 'UPDATE_ORDER', module: 'ORDER', action: 'UPDATE' },

    // CMS
    { name: 'CREATE_CMS', module: 'CMS', action: 'CREATE' },
    { name: 'EDIT_CMS', module: 'CMS', action: 'EDIT' },
    { name: 'DELETE_CMS', module: 'CMS', action: 'DELETE' },
    { name: 'VIEW_CMS', module: 'CMS', action: 'VIEW' },

    // ROLE
    { name: 'CREATE_ROLE', module: 'ROLE', action: 'CREATE' },
    { name: 'EDIT_ROLE', module: 'ROLE', action: 'EDIT' },
    { name: 'DELETE_ROLE', module: 'ROLE', action: 'DELETE' },
    { name: 'VIEW_ROLE', module: 'ROLE', action: 'VIEW' },

    // COUPON
    { name: 'CREATE_COUPON', module: 'COUPON', action: 'CREATE' },
    { name: 'EDIT_COUPON', module: 'COUPON', action: 'EDIT' },
    { name: 'DELETE_COUPON', module: 'COUPON', action: 'DELETE' },
    { name: 'VIEW_COUPON', module: 'COUPON', action: 'VIEW' },

    // BANNER
    { name: 'CREATE_BANNER', module: 'BANNER', action: 'CREATE' },
    { name: 'EDIT_BANNER', module: 'BANNER', action: 'EDIT' },
    { name: 'DELETE_BANNER', module: 'BANNER', action: 'DELETE' },
    { name: 'VIEW_BANNER', module: 'BANNER', action: 'VIEW' },

    // REVIEW
    { name: 'CREATE_REVIEW', module: 'REVIEW', action: 'CREATE' },
    { name: 'EDIT_REVIEW', module: 'REVIEW', action: 'EDIT' },
    { name: 'DELETE_REVIEW', module: 'REVIEW', action: 'DELETE' },
    { name: 'VIEW_REVIEW', module: 'REVIEW', action: 'VIEW' },

    // QUERY
    { name: 'CREATE_QUERY', module: 'QUERY', action: 'CREATE' },
    { name: 'EDIT_QUERY', module: 'QUERY', action: 'EDIT' },
    { name: 'DELETE_QUERY', module: 'QUERY', action: 'DELETE' },
    { name: 'VIEW_QUERY', module: 'QUERY', action: 'VIEW' },

    // REPORT
    { name: 'VIEW_REPORT', module: 'REPORT', action: 'VIEW' },
    { name: 'GENERATE_REPORT', module: 'REPORT', action: 'GENERATE' },
];

const seedPermissions = async () => {
    await Permission.deleteMany();
    const data = await Permission.insertMany(permissions);
    console.log('✅ Permissions seeded');
    return data;
};

module.exports = seedPermissions;