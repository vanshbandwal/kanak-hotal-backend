const mongoose = require('mongoose');

const adminRoleSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
    },
}, {
    timestamps: true,
});

adminRoleSchema.index({ adminId: 1, roleId: 1 }, { unique: true });

const AdminRole = mongoose.model('AdminRole', adminRoleSchema);

module.exports = AdminRole;
