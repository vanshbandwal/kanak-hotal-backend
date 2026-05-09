const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    module: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
