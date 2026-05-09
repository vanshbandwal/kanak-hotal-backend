const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    countryCode: {
      type: String,
      default: "+91",
    },
    password: {
      type: String,
      minlength: 6,
    },
    otp: {
      type: String,
      minlength: 4,
      maxlength: 4,
    },
    otpExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    addresses: [
      {
        fullName: String,
        phone: String,
        addressLine1: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,

        // 📍 Add this
        latitude: {
          type: Number,
        },
        longitude: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;