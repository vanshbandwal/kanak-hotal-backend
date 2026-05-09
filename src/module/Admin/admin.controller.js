const Admin = require("./admin.model");
const AdminRole = require("../Role/adminRole.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../../utils/generateToken");
const asyncHandler = require("express-async-handler");

/**
 * @desc    Admin creates a new staff member with Role mapping
 * @route   POST /api/admin/create-staff
 * @access  Private (Admin)
 */
exports.createStaffMember = asyncHandler(async (req, res) => {
    const { name, email, password, roleId } = req.body;

    if (!name || !email || !password || !roleId) {
        res.status(400);
        throw new Error("Please fill all the required fields");
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
        res.status(400);
        throw new Error("Staff already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
        name,
        email,
        password: hashedPassword,
        role: "staff", // Default internal role, mapping handles the RBAC
    });

    if (admin) {
        // Create Role Mapping
        await AdminRole.create({
            adminId: admin._id,
            roleId: roleId
        });

        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            message: "Staff member created successfully"
        });
    } else {
        res.status(400);
        throw new Error("Invalid staff data");
    }
});

/**
 * @desc    Get all staff members
 * @route   GET /api/admin/all-staff
 * @access  Private (Admin)
 */
exports.getAllStaff = asyncHandler(async (req, res) => {
    const staff = await Admin.find().select("-password");
    res.status(200).json(staff);
});

// @desc    Register a new admin
// @route   POST /api/admin/register
// @access  Public
exports.registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill all the required fields");
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
        res.status(400);
        throw new Error("Admin already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
        name,
        email,
        password: hashedPassword,
        role: role || "admin",
    });

    if (admin) {
        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        });
    } else {
        res.status(400);
        throw new Error("Invalid admin data");
    }
});

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
exports.loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Please provide email and password");
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (admin && (await bcrypt.compare(password, admin.password))) {
        res.status(200).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            token: generateToken({ id: admin._id }),
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

// @desc    Logout admin
// @route   POST /api/admin/logout
// @access  Private
exports.logoutAdmin = asyncHandler(async (req, res) => {
    // Session-less JWT logout is handled on client side by removing token
    res.status(200).json({ success: true, message: "Logged out successfully", token: null });
});

// @desc    Get admin profile
// @route   GET /api/admin/me
// @access  Private
exports.getAdminProfile = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.user.id);
    if (admin) {
        res.status(200).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        });
    } else {
        res.status(404);
        throw new Error("Admin not found");
    }
});

// @desc    Update admin profile
// @route   PUT /api/admin/update-profile
// @access  Private
exports.updateAdminProfile = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.user.id);

    if (admin) {
        admin.name = req.body.name || admin.name;
        admin.email = req.body.email || admin.email;
        admin.phone = req.body.phone || admin.phone;
        admin.avatar = req.body.avatar || admin.avatar;

        const updatedAdmin = await admin.save();

        res.status(200).json({
            _id: updatedAdmin._id,
            name: updatedAdmin.name,
            email: updatedAdmin.email,
            role: updatedAdmin.role,
            phone: updatedAdmin.phone,
            avatar: updatedAdmin.avatar,
        });
    } else {
        res.status(404);
        throw new Error("Admin not found");
    }
});

// @desc    Change admin password
// @route   PUT /api/admin/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user.id).select("+password");

    if (admin && (await bcrypt.compare(currentPassword, admin.password))) {
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();
        res.status(200).json({ success: true, message: "Password updated successfully" });
    } else {
        res.status(401);
        throw new Error("Invalid current password");
    }
});

// @desc    Forgot password
// @route   POST /api/admin/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
    // Implementation for password reset email goes here
    res.status(501).json({ message: "Not implemented yet" });
});

// @desc    Reset password
// @route   POST /api/admin/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
    // Implementation for resetting password from token goes here
    res.status(501).json({ message: "Not implemented yet" });
});