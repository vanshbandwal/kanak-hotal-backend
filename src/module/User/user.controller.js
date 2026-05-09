const generateToken = require('../../utils/generateToken')
const User = require('./user.model')
const asyncHandler = require('express-async-handler')

// @desc    Register a new user
// @route   POST /api/user/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, phone, countryCode } = req.body

  if (!name || !phone) {
    res.status(400)
    throw new Error("All fields are required")
  }

  // Check for existing user with same phone AND country code
  const existingUser = await User.findOne({ phone, countryCode: countryCode || "+91" })
  if (existingUser) {
    res.status(400)
    throw new Error("User already exists with this phone number")
  }

  const user = await User.create({
    name,
    phone,
    countryCode: countryCode || "+91"
  })

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user
  })
})

// @desc    Login user (check if exists)
// @route   POST /api/user/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { phone, countryCode } = req.body

  if (!phone) {
    res.status(400)
    throw new Error("Phone number is required")
  }

  const user = await User.findOne({ phone, countryCode: countryCode || "+91" })

  if (!user) {
    res.status(404)
    throw new Error("User not found. Please sign up first.")
  }

  res.status(200).json({
    success: true,
    message: "User found successfully",
    user
  })
})

// @desc    Send OTP to user
// @route   POST /api/user/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
  const { phone, countryCode } = req.body

  if (!phone) {
    res.status(400)
    throw new Error("Phone number is required")
  }

  const user = await User.findOne({ phone, countryCode: countryCode || "+91" })

  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  // 🔢 Generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString()

  // ⏳ Expiry (5 min)
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)

  user.otp = otp
  user.otpExpiry = otpExpiry

  await user.save()

  // ⚠️ Never send OTP in production
  res.status(200).json({
    success: true,
    message: "OTP sent successfully",
    otp // remove this in production
  })
})

// @desc    Verify OTP and return token
// @route   POST /api/user/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, countryCode, otp } = req.body

  if (!phone || !otp) {
    res.status(400)
    throw new Error("Phone number and OTP are required")
  }

  const user = await User.findOne({ phone, countryCode: countryCode || "+91" })

  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  if (user.otp !== otp) {
    res.status(400)
    throw new Error("Invalid OTP")
  }

  if (user.otpExpiry < new Date()) {
    user.otp = null
    user.otpExpiry = null
    await user.save()
    res.status(400)
    throw new Error("OTP has expired")
  }

  user.isVerified = true
  user.otp = null
  user.otpExpiry = null

  await user.save()

  const token = generateToken({ id: user._id })

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    token,
    user
  })
})

// @desc    Logout user
// @route   POST /api/user/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  const user = req.user
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }
  // Since we don't store tokens in the DB yet, we just return success
  // or we could add a token field to the schema later.
  res.status(200).json({ success: true, message: "User logged out successfully" })
})

// @desc    Get user profile
// @route   GET /api/user/me
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }
  res.status(200).json({ success: true, user })
})

// @desc    Update user profile
// @route   PUT /api/user/update-profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }
  const { name, email } = req.body
  if (name) user.name = name
  if (email) user.email = email

  await user.save()
  res.status(200).json({ success: true, user })
})

// @desc    Upload user avatar
// @route   POST /api/user/upload-avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }
  if (!req.file) {
    res.status(400)
    throw new Error("No file uploaded")
  }
  user.avatar = req.file.path
  await user.save()
  res.status(200).json({ success: true, user })
})

// @desc    Add address
// @route   POST /api/user/address
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }
  const { fullName, phone, addressLine1, city, state, country, postalCode, latitude, longitude } = req.body
  if (!fullName || !phone || !addressLine1 || !city || !state || !country || !postalCode || !latitude || !longitude) {
    res.status(400)
    throw new Error("All fields are required")
  }
  user.addresses.push({ fullName, phone, addressLine1, city, state, country, postalCode, latitude, longitude })
  await user.save()
  res.status(200).json({ success: true, user })
})

// @desc    Update address
// @route   PUT /api/user/address/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }
  const { id } = req.params
  const { fullName, phone, addressLine1, city, state, country, postalCode, latitude, longitude } = req.body

  const address = user.addresses.id(id)
  if (!address) {
    res.status(404)
    throw new Error("Address not found")
  }

  if (fullName) address.fullName = fullName
  if (phone) address.phone = phone
  if (addressLine1) address.addressLine1 = addressLine1
  if (city) address.city = city
  if (state) address.state = state
  if (country) address.country = country
  if (postalCode) address.postalCode = postalCode
  if (latitude) address.latitude = latitude
  if (longitude) address.longitude = longitude

  await user.save()
  res.status(200).json({ success: true, user })
})

// @desc    Get all addresses
// @route   GET /api/user/address
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }
  res.status(200).json({ success: true, addresses: user.addresses })
})

// @desc    Delete address
// @route   DELETE /api/user/address/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }
  const { id } = req.params
  user.addresses = user.addresses.filter(address => address._id.toString() !== id)
  await user.save()
  res.status(200).json({ success: true, user })
})

// @desc    Set default address
// @route   PUT /api/user/address/:id/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }
  const { id } = req.params
  const address = user.addresses.id(id)
  if (!address) {
    res.status(404)
    throw new Error("Address not found")
  }
  user.addresses = user.addresses.map(addr => {
    addr.isDefault = (addr._id.toString() === id)
    return addr
  })
  await user.save()
  res.status(200).json({ success: true, user })
})

module.exports = {
  signup,
  login,
  sendOtp,
  verifyOtp,
  logout,
  getProfile,
  updateProfile,
  uploadAvatar,
  addAddress,
  updateAddress,
  getAddresses,
  deleteAddress,
  setDefaultAddress
}