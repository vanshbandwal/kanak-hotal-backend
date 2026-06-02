const Admin = require("./admin.model");
const AdminRole = require("../Role/adminRole.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../../utils/generateToken");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../../utils/sendEmail");

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

        res.status(201).json({ success: true, 
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
    res.status(200).json({ success: true, data: staff });
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
        res.status(201).json({ success: true, 
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
        res.status(200).json({ success: true, 
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            token: generateToken({ id: admin._id, tokenVersion: admin.tokenVersion || 1 }),
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
    res.status(200).json({ success: true,  message: "Logged out successfully", token: null });
});

// @desc    Get admin profile
// @route   GET /api/admin/me
// @access  Private
exports.getAdminProfile = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.user.id);
    if (admin) {
        res.status(200).json({ success: true, 
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            phone: admin.phone || "",
            avatar: admin.avatar || "",
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
        admin.phone = req.body.phone !== undefined ? req.body.phone : admin.phone;
        
        if (req.file) {
            admin.avatar = req.file.path;
        }

        const updatedAdmin = await admin.save();

        res.status(200).json({ success: true, 
            _id: updatedAdmin._id,
            name: updatedAdmin.name,
            email: updatedAdmin.email,
            role: updatedAdmin.role,
            phone: updatedAdmin.phone || "",
            avatar: updatedAdmin.avatar || "",
        });
    } else {
        res.status(404);
        throw new Error("Admin not found");
    }
});

// @desc    Request password change OTP
// @route   POST /api/admin/request-password-otp
// @access  Private
exports.requestPasswordOtp = asyncHandler(async (req, res) => {
    const { currentPassword } = req.body;
    const admin = await Admin.findById(req.user.id).select("+password");

    if (!admin) {
        res.status(404);
        throw new Error("Admin not found");
    }

    // Verify current password first for security
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
        res.status(401);
        throw new Error("Invalid current password");
    }

    // Generate 6-digit secure OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    admin.passwordChangeOtp = otp;
    admin.passwordChangeOtpExpiry = otpExpiry;
    await admin.save();

    // Log the OTP securely and visually in console for development
    console.log(`\n🔑 [OTP SECURITY SERVICE] 🔑`);
    console.log(`---------------------------------`);
    console.log(`Admin Email: ${admin.email}`);
    console.log(`Action: Password Change Request`);
    console.log(`Generated OTP: \x1b[33m${otp}\x1b[0m`);
    console.log(`Expires At: ${otpExpiry.toISOString()}`);
    console.log(`---------------------------------\n`);

    // Dispatch secure email with verification code
    const emailResult = await sendEmail({
        to: admin.email,
        subject: "🔑 MGI Basket: Password Change Security Verification",
        text: `Dear System Admin, your secure verification code is ${otp}. This code is valid for 5 minutes. If you did not request this, please secure your credentials immediately.`,
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f0e0c; color: #ffffff; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #d4af37; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid rgba(212,175,55,0.1); padding-bottom: 20px;">
                <h1 style="color: #d4af37; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">MGI Basket Security Service</h1>
            </div>
            <div style="background-color: #1a1814; padding: 30px; border-radius: 8px; border: 1px solid rgba(212,175,55,0.2);">
                <h2 style="color: #ffffff; font-size: 18px; margin-top: 0; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;">Verification Code Requested</h2>
                <p style="color: #a4a4a4; font-size: 14px; line-height: 1.6; margin-top: 15px;">
                    A request was made to change your system owner account password. Use the secure verification code below to authorize this request:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 38px; font-weight: 900; color: #d4af37; letter-spacing: 8px; background-color: #000000; padding: 15px 35px; border-radius: 8px; border: 1px solid rgba(212,175,55,0.4); display: inline-block; text-shadow: 0 0 10px rgba(212,175,55,0.3);">
                        ${otp}
                    </span>
                </div>
                <p style="color: #8c8c8c; font-size: 13px; line-height: 1.5; margin-bottom: 0; background: rgba(255,0,0,0.05); padding: 12px; border-radius: 6px; border: 1px solid rgba(255,0,0,0.15);">
                    ⚠️ This code is valid for exactly <strong>5 minutes</strong>. If you did not make this request, please log in immediately and verify your active sessions.
                </p>
            </div>
            <div style="text-align: center; margin-top: 25px; color: #5a5a5a; font-size: 11px;">
                © 2026 kanak hotal Platform. All Rights Secured.
            </div>
        </div>
        `
    });

    res.status(200).json({ success: true, 
        message: emailResult.success 
            ? "Verification OTP sent to your admin email address successfully." 
            : `Verification OTP generated successfully. (SMTP Dispatch Alert: ${emailResult.error || 'Credentials mismatch'})`,
        otp, // Return in response during development for frictionless testing
    });
});

// @desc    Change admin password (verified by OTP)
// @route   PUT /api/admin/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, otp } = req.body;
    const admin = await Admin.findById(req.user.id).select("+password");

    if (!admin) {
        res.status(404);
        throw new Error("Admin not found");
    }

    // 1. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
        res.status(401);
        throw new Error("Invalid current password");
    }

    // 2. Verify OTP
    if (!admin.passwordChangeOtp || admin.passwordChangeOtp !== otp) {
        res.status(400);
        throw new Error("Invalid OTP");
    }

    // 3. Verify OTP expiry
    if (new Date() > admin.passwordChangeOtpExpiry) {
        res.status(400);
        throw new Error("OTP has expired. Please request a new one.");
    }

    // 4. Update Password
    admin.password = await bcrypt.hash(newPassword, 10);

    // 5. Invalidate ALL other sessions/devices by incrementing tokenVersion
    admin.tokenVersion = (admin.tokenVersion || 1) + 1;

    // 6. Clear OTP fields
    admin.passwordChangeOtp = undefined;
    admin.passwordChangeOtpExpiry = undefined;

    await admin.save();

    // 7. Issue a BRAND NEW token for the current device with the updated tokenVersion
    const newToken = generateToken({ id: admin._id, tokenVersion: admin.tokenVersion });

    res.status(200).json({ success: true, 
        message: "Password changed successfully. All other devices have been logged out.",
        token: newToken
    });
});

// @desc    Forgot password
// @route   POST /api/admin/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
    // Implementation for password reset email goes here
    res.status(501).json({ success: true,  message: "Not implemented yet" });
});

// @desc    Reset password
// @route   POST /api/admin/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
    // Implementation for resetting password from token goes here
    res.status(501).json({ success: true,  message: "Not implemented yet" });
});