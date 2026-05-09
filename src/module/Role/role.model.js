const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    label: {
        type: String,
    },
    description: {
        type: String,
    },
}, {
    timestamps: true,
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
