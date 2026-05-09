const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        // 🔹 Basic Info
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false, // 🔥 hide by default
        },

        phone: {
            type: String,
        },

        avatar: {
            type: String, // image URL
        },

        // 🔐 Role & Access
        role: {
            type: String,
            enum: ["admin", "employee", "staff"],
            default: "admin",
        },

        // 🟢 Status
        isActive: {
            type: Boolean,
            default: true,
        },

        // 📊 Tracking
        lastLogin: {
            type: Date,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

module.exports = mongoose.model("Admin", adminSchema);