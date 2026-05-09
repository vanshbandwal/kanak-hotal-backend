const mongoose = require('mongoose');

const sidebarSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        required: true,
    },
    subItems: [
        {
            name: { type: String },
            path: { type: String },
        }
    ],
}, {
    timestamps: true,
});

const Sidebar = mongoose.model('Sidebar', sidebarSchema);

module.exports = Sidebar;
