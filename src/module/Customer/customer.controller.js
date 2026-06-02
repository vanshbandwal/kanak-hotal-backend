const Customer = require('./customer.model');
const asyncHandler = require('express-async-handler');
const generateToken = require('../../utils/generateToken');

// ==========================================
// 🌍 PUBLIC ROUTES (CUSTOMER AUTH)
// ==========================================

/**
 * @desc    Send 4-digit OTP to customer phone
 * @route   POST /api/v2/public/customer/send-otp
 * @access  Public
 */
const sendOtp = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        res.status(400);
        throw new Error("Phone number is required");
    }

    let customer = await Customer.findOne({ phone });

    // If customer doesn't exist, create a partial record
    if (!customer) {
        customer = await Customer.create({
            phone,
            isVerified: false,
            isProfileCompleted: false
        });
    }

    // 🔢 Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    customer.otp = otp;
    customer.otpExpiry = otpExpiry;
    await customer.save();

    // ⚠️ In production, send via SMS gateway. For now, return in response.
    res.status(200).json({ success: true, 
        message: "OTP sent successfully",
        otp, // Remove in production
        isNewUser: !customer.isProfileCompleted
    });
});

/**
 * @desc    Verify OTP and return JWT
 * @route   POST /api/v2/public/customer/verify-otp
 * @access  Public
 */
const verifyOtp = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        res.status(400);
        throw new Error("Phone and OTP are required");
    }

    const customer = await Customer.findOne({ phone });

    if (!customer) {
        res.status(404);
        throw new Error("Customer not found");
    }

    if (customer.otp !== otp) {
        res.status(400);
        throw new Error("Invalid OTP");
    }

    if (customer.otpExpiry < new Date()) {
        res.status(400);
        throw new Error("OTP has expired");
    }

    customer.isVerified = true;
    customer.otp = undefined;
    customer.otpExpiry = undefined;
    await customer.save();

    const token = generateToken({ id: customer._id });

    res.status(200).json({ success: true, 
        message: "Logged in successfully",
        token,
        customer: {
            _id: customer._id,
            phone: customer.phone,
            isProfileCompleted: customer.isProfileCompleted,
            name: customer.name,
            email: customer.email
        }
    });
});

/**
 * @desc    Complete customer profile after first login
 * @route   PUT /api/v2/public/customer/complete-profile
 * @access  Private (Customer)
 */
const completeProfile = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.user.id);

    if (!customer) {
        res.status(404);
        throw new Error("Customer not found");
    }

    const { name, email } = req.body;

    if (!name) {
        res.status(400);
        throw new Error("Name is required");
    }

    customer.name = name;
    customer.email = email;
    customer.isProfileCompleted = true;
    await customer.save();

    res.status(200).json({ success: true, 
        message: "Profile completed successfully",
        customer
    });
});

// ==========================================
// 🛡️ PRIVATE ROUTES (ADMIN PANEL OTP FLOW)
// ==========================================

/**
 * @desc    Admin initiates customer creation by sending OTP
 * @route   POST /api/v1/private/customer/admin/send-otp
 * @access  Private (Admin)
 */
const adminSendOtp = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        res.status(400);
        throw new Error("Phone number is required");
    }

    let customer = await Customer.findOne({ phone });

    if (!customer) {
        customer = await Customer.create({
            phone,
            isVerified: false,
            isProfileCompleted: false
        });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    customer.otp = otp;
    customer.otpExpiry = otpExpiry;
    await customer.save();

    res.status(200).json({ success: true, 
        message: "OTP sent to customer successfully",
        otp, // In production, this would be sent via SMS
        customerId: customer._id
    });
});

/**
 * @desc    Admin verifies OTP on behalf of customer
 * @route   POST /api/v1/private/customer/admin/verify-otp
 * @access  Private (Admin)
 */
const adminVerifyOtp = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        res.status(400);
        throw new Error("Phone and OTP are required");
    }

    const customer = await Customer.findOne({ phone });

    if (!customer) {
        res.status(404);
        throw new Error("Customer not found");
    }

    if (customer.otp !== otp) {
        res.status(400);
        throw new Error("Invalid OTP");
    }

    if (customer.otpExpiry < new Date()) {
        res.status(400);
        throw new Error("OTP has expired");
    }

    customer.isVerified = true;
    customer.otp = undefined;
    customer.otpExpiry = undefined;
    await customer.save();

    res.status(200).json({ success: true, 
        message: "OTP verified successfully",
        customerId: customer._id
    });
});

/**
 * @desc    Admin completes customer profile
 * @route   PUT /api/v1/private/customer/admin/complete-profile/:id
 * @access  Private (Admin)
 */
const adminCompleteProfile = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
        res.status(404);
        throw new Error("Customer not found");
    }

    const { name, email } = req.body;

    if (!name) {
        res.status(400);
        throw new Error("Name is required");
    }

    customer.name = name;
    customer.email = email;
    customer.isProfileCompleted = true;
    await customer.save();

    res.status(200).json({ success: true, 
        message: "Customer profile completed by admin",
        customer
    });
});

/**
 * @desc    Get all customers with pagination and search
 * @route   GET /api/v1/private/customer
 * @access  Private (Admin)
 */
const adminGetAllCustomers = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword ? {
        $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { phone: { $regex: req.query.keyword, $options: 'i' } },
            { email: { $regex: req.query.keyword, $options: 'i' } },
        ]
    } : {};

    const count = await Customer.countDocuments({ ...keyword });
    const customers = await Customer.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, 
        customers,
        page,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

/**
 * @desc    Get customer by ID
 * @route   GET /api/v1/private/customer/:id
 * @access  Private (Admin)
 */
const adminGetCustomerById = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
        res.status(404);
        throw new Error("Customer not found");
    }
    res.status(200).json({ success: true,  customer });
});

/**
 * @desc    Update customer details by admin
 * @route   PUT /api/v1/private/customer/:id
 * @access  Private (Admin)
 */
const adminUpdateCustomer = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
        res.status(404);
        throw new Error("Customer not found");
    }

    const { name, phone, email, isActive } = req.body;

    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.email = email || customer.email;
    if (isActive !== undefined) customer.isActive = isActive;

    await customer.save();

    res.status(200).json({ success: true, 
        message: "Customer updated successfully",
        customer
    });
});

/**
 * @desc    Delete customer
 * @route   DELETE /api/v1/private/customer/:id
 * @access  Private (Admin)
 */
const adminDeleteCustomer = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
        res.status(404);
        throw new Error("Customer not found");
    }
    await customer.deleteOne();
    res.status(200).json({ success: true,  message: "Customer deleted successfully" });
});

/**
 * @desc    Toggle customer active status
 * @route   PATCH /api/v1/private/customer/:id/status
 * @access  Private (Admin)
 */
const adminToggleStatus = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
        res.status(404);
        throw new Error("Customer not found");
    }
    customer.isActive = !customer.isActive;
    await customer.save();
    res.status(200).json({ success: true,  message: `Customer ${customer.isActive ? 'activated' : 'deactivated'}`, isActive: customer.isActive });
});

module.exports = {
    sendOtp,
    verifyOtp,
    completeProfile,
    adminSendOtp,
    adminVerifyOtp,
    adminCompleteProfile,
    adminGetAllCustomers,
    adminGetCustomerById,
    adminUpdateCustomer,
    adminDeleteCustomer,
    adminToggleStatus
};
