const mongoose = require('mongoose');

const roleSidebarSchema = new mongoose.Schema({
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
    },
    sidebarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sidebar',
        required: true,
    },
}, {
    timestamps: true,
});

roleSidebarSchema.index({ roleId: 1, sidebarId: 1 }, { unique: true });

const RoleSidebar = mongoose.model('RoleSidebar', roleSidebarSchema);

module.exports = RoleSidebar;
