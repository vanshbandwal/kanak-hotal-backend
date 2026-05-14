const mongoose = require("mongoose");

const servicePartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    avatar: {
      type: String,
    },
    // 🏷️ VEHICLE INFORMATION
    vehicle: {
      type: {
        type: String,
        enum: ["Bicycle", "Motorcycle", "Car", "Scooter"],
      },
      number: String,
      model: String,
    },
    // 🛡️ KYC & VERIFICATION
    kycStatus: {
      type: String,
      enum: ["Pending", "In Review", "Verified", "Rejected"],
      default: "Pending",
    },
    documents: {
      aadhaar: {
        number: String,
        frontImage: String,
        backImage: String,
        status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
      },
      pan: {
        number: String,
        image: String,
        status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
      },
      drivingLicense: {
        number: String,
        image: String,
        expiryDate: Date,
        status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
      },
    },
    // 💰 WALLET & EARNINGS
    walletBalance: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    // 📍 OPERATIONAL STATE
    isOnline: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    // 🔢 AUTHENTICATION
    otp: String,
    otpExpiry: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for geo-spatial queries (radius search)
servicePartnerSchema.index({ currentLocation: "2dsphere" });

const ServicePartner = mongoose.model("ServicePartner", servicePartnerSchema);
module.exports = ServicePartner;
