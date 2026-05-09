const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Permission = require('../module/Permission/permission.model');
require('dotenv').config();

const permissions = [
    // 📦 PRODUCT
    { name: "CREATE_PRODUCT", module: "PRODUCT", action: "CREATE" },
    { name: "VIEW_PRODUCT",   module: "PRODUCT", action: "VIEW"   },
    { name: "EDIT_PRODUCT",   module: "PRODUCT", action: "EDIT"   },
    { name: "DELETE_PRODUCT", module: "PRODUCT", action: "DELETE" },

    // 📁 CATEGORY
    { name: "CREATE_CATEGORY", module: "CATEGORY", action: "CREATE" },
    { name: "VIEW_CATEGORY",   module: "CATEGORY", action: "VIEW"   },
    { name: "EDIT_CATEGORY",   module: "CATEGORY", action: "EDIT"   },
    { name: "DELETE_CATEGORY", module: "CATEGORY", action: "DELETE" },

    // 💰 TAX
    { name: "CREATE_TAX", module: "TAX", action: "CREATE" },
    { name: "VIEW_TAX",   module: "TAX", action: "VIEW"   },
    { name: "EDIT_TAX",   module: "TAX", action: "EDIT"   },
    { name: "DELETE_TAX", module: "TAX", action: "DELETE" },

    // 📏 UNIT
    { name: "CREATE_UNIT", module: "UNIT", action: "CREATE" },
    { name: "VIEW_UNIT",   module: "UNIT", action: "VIEW"   },
    { name: "EDIT_UNIT",   module: "UNIT", action: "EDIT"   },
    { name: "DELETE_UNIT", module: "UNIT", action: "DELETE" },

    // 🏷️ BRAND
    { name: "CREATE_BRAND", module: "BRAND", action: "CREATE" },
    { name: "VIEW_BRAND",   module: "BRAND", action: "VIEW"   },
    { name: "EDIT_BRAND",   module: "BRAND", action: "EDIT"   },
    { name: "DELETE_BRAND", module: "BRAND", action: "DELETE" },

    // 🔑 ROLE
    { name: "CREATE_ROLE", module: "ROLE", action: "CREATE" },
    { name: "VIEW_ROLE",   module: "ROLE", action: "VIEW"   },
    { name: "EDIT_ROLE",   module: "ROLE", action: "EDIT"   },
    { name: "DELETE_ROLE", module: "ROLE", action: "DELETE" },

    // 👥 ADMIN / STAFF
    { name: "CREATE_ADMIN", module: "ADMIN", action: "CREATE" },
    { name: "VIEW_ADMIN",   module: "ADMIN", action: "VIEW"   },

    // 👤 USER (Already exists, but included for completeness)
    { name: "CREATE_USER", module: "USER", action: "CREATE" },
    { name: "VIEW_USER",   module: "USER", action: "VIEW"   },
    { name: "EDIT_USER",   module: "USER", action: "EDIT"   },
    { name: "DELETE_USER", module: "USER", action: "DELETE" }
];

const seedPermissions = async () => {
    try {
        await connectDB();
        console.log("🌱 Starting Permission Seeding...");

        for (const p of permissions) {
            const exists = await Permission.findOne({ name: p.name });
            if (!exists) {
                await Permission.create(p);
                console.log(`✅ Created: ${p.name}`);
            } else {
                console.log(`⏩ Skipped (Already Exists): ${p.name}`);
            }
        }

        console.log("✨ Seeding Completed Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error during seeding:", error);
        process.exit(1);
    }
};

seedPermissions();
