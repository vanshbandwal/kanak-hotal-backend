const ServicePartner = require("./servicePartner.model");
const asyncHandler = require("express-async-handler");

/**
 * @desc    Step 1: Admin sends OTP to Partner's phone
 * @route   POST /api/v1/private/service-partner/send-otp
 * @access  Private (Admin)
 */
const adminSendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    res.status(400);
    throw new Error("Phone number is required");
  }

  const existingPartner = await ServicePartner.findOne({ phone });
  if (existingPartner && existingPartner.isVerified) {
    res.status(400);
    throw new Error("Partner with this phone number is already registered and verified");
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  
  // If partner exists but not verified, update them. Otherwise create a temporary record.
  let partner = existingPartner;
  if (!partner) {
    partner = new ServicePartner({ phone });
  }

  partner.otp = otp;
  partner.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  await partner.save();

  res.status(200).json({
    success: true,
    message: "OTP sent successfully",
    otp, // In production, send via SMS
  });
});

/**
 * @desc    Step 2: Admin verifies the OTP
 * @route   POST /api/v1/private/service-partner/verify-otp
 * @access  Private (Admin)
 */
const adminVerifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  const partner = await ServicePartner.findOne({ phone });

  if (!partner || partner.otp !== otp) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  if (partner.otpExpiry < new Date()) {
    res.status(400);
    throw new Error("OTP has expired");
  }

  partner.isVerified = true;
  partner.otp = undefined;
  partner.otpExpiry = undefined;
  await partner.save();

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    partnerId: partner._id
  });
});

/**
 * @desc    Step 3: Complete registration with profile details
 * @route   POST /api/v1/private/service-partner/complete-registration
 * @access  Private (Admin)
 */
const adminCompleteRegistration = asyncHandler(async (req, res) => {
  const { partnerId, name, email, vehicleType, vehicleNumber } = req.body;

  const partner = await ServicePartner.findById(partnerId);

  if (!partner) {
    res.status(404);
    throw new Error("Partner not found");
  }

  if (!partner.isVerified) {
    res.status(400);
    throw new Error("Phone number must be verified before completing profile");
  }

  partner.name = name;
  partner.email = email;
  partner.vehicle = {
    type: vehicleType,
    number: vehicleNumber
  };
  partner.kycStatus = "Pending";
  await partner.save();

  res.status(200).json({
    success: true,
    message: "Service Partner registration completed successfully",
    partner
  });
});

/**
 * @desc    Get all service partners with pagination and search
 * @route   GET /api/v1/private/service-partner
 * @access  Private (Admin)
 */
const adminGetAllPartners = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: "i" } },
          { phone: { $regex: req.query.keyword, $options: "i" } },
          { "vehicle.number": { $regex: req.query.keyword, $options: "i" } },
        ],
      }
    : {};

  const statusFilter = req.query.kycStatus ? { kycStatus: req.query.kycStatus } : {};

  const count = await ServicePartner.countDocuments({ ...keyword, ...statusFilter });
  const partners = await ServicePartner.find({ ...keyword, ...statusFilter })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    partners,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

/**
 * @desc    Update partner KYC document status
 * @route   PATCH /api/v1/private/service-partner/:id/kyc
 * @access  Private (Admin)
 */
const adminUpdateKycStatus = asyncHandler(async (req, res) => {
  const { docType, status, reason } = req.body;
  const partner = await ServicePartner.findById(req.params.id);

  if (!partner) {
    res.status(404);
    throw new Error("Partner not found");
  }

  if (partner.documents[docType]) {
    partner.documents[docType].status = status;
    // You could also store a rejection reason if status is 'Rejected'
  }

  // Auto-update master kycStatus
  const docs = partner.documents;
  const allVerified =
    docs.aadhaar.status === "Approved" &&
    docs.pan.status === "Approved" &&
    docs.drivingLicense.status === "Approved";

  const anyRejected =
    docs.aadhaar.status === "Rejected" ||
    docs.pan.status === "Rejected" ||
    docs.drivingLicense.status === "Rejected";

  if (allVerified) partner.kycStatus = "Verified";
  else if (anyRejected) partner.kycStatus = "Rejected";
  else partner.kycStatus = "In Review";

  await partner.save();

  res.status(200).json({
    success: true,
    message: `Document ${docType} updated to ${status}`,
    partner,
  });
});

/**
 * @desc    Toggle partner active status
 * @route   PATCH /api/v1/private/service-partner/:id/status
 * @access  Private (Admin)
 */
const adminTogglePartnerStatus = asyncHandler(async (req, res) => {
  const partner = await ServicePartner.findById(req.params.id);

  if (!partner) {
    res.status(404);
    throw new Error("Partner not found");
  }

  partner.isActive = !partner.isActive;
  await partner.save();

  res.status(200).json({
    success: true,
    message: `Partner ${partner.isActive ? "activated" : "deactivated"}`,
    isActive: partner.isActive,
  });
});

/**
 * @desc    Get partner by ID
 * @route   GET /api/v1/private/service-partner/:id
 * @access  Private (Admin)
 */
const adminGetPartnerById = asyncHandler(async (req, res) => {
  const partner = await ServicePartner.findById(req.params.id);
  if (!partner) {
    res.status(404);
    throw new Error("Partner not found");
  }
  res.status(200).json({ success: true, partner });
});

/**
 * @desc    Update service partner details
 * @route   PATCH /api/v1/private/service-partner/:id
 * @access  Private (Admin)
 */
const adminUpdatePartner = asyncHandler(async (req, res) => {
  const { name, email, vehicleType, vehicleNumber } = req.body;
  const partner = await ServicePartner.findById(req.params.id);

  if (!partner) {
    res.status(404);
    throw new Error("Partner not found");
  }

  partner.name = name || partner.name;
  partner.email = email || partner.email;
  
  if (vehicleType || vehicleNumber) {
    partner.vehicle = {
      type: vehicleType || partner.vehicle.type,
      number: vehicleNumber || partner.vehicle.number,
    };
  }

  await partner.save();

  res.status(200).json({
    success: true,
    message: "Partner updated successfully",
    partner,
  });
});

/**
 * @desc    Delete service partner
 * @route   DELETE /api/v1/private/service-partner/:id
 * @access  Private (Admin)
 */
const adminDeletePartner = asyncHandler(async (req, res) => {
  const partner = await ServicePartner.findById(req.params.id);

  if (!partner) {
    res.status(404);
    throw new Error("Partner not found");
  }

  await partner.deleteOne();

  res.status(200).json({
    success: true,
    message: "Partner removed successfully",
  });
});

module.exports = {
  adminSendOtp,
  adminVerifyOtp,
  adminCompleteRegistration,
  adminGetAllPartners,
  adminUpdateKycStatus,
  adminTogglePartnerStatus,
  adminGetPartnerById,
  adminUpdatePartner,
  adminDeletePartner,
};
