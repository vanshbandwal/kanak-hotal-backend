const Query = require("./query.model");
const asyncHandler = require("express-async-handler");

// ==========================================
// 🌍 PUBLIC ROUTES (CUSTOMER APP)
// ==========================================

/**
 * @desc    Submit a new query
 * @route   POST /api/v2/public/query
 * @access  Private (Customer)
 */
const createQuery = asyncHandler(async (req, res) => {
  const { subject, message, category, priority, attachments } = req.body;

  if (!subject || !message) {
    res.status(400);
    throw new Error("Subject and message are required");
  }

  const query = await Query.create({
    customerId: req.user.id,
    subject,
    message,
    category,
    priority,
    attachments,
  });

  res.status(201).json({
    success: true,
    message: "Query submitted successfully",
    query,
  });
});

/**
 * @desc    Get customer's own queries
 * @route   GET /api/v2/public/query/my-queries
 * @access  Private (Customer)
 */
const getMyQueries = asyncHandler(async (req, res) => {
  const queries = await Query.find({ customerId: req.user.id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    queries,
  });
});

/**
 * @desc    Add a reply to a query (Customer)
 * @route   POST /api/v2/public/query/:id/reply
 * @access  Private (Customer)
 */
const customerReply = asyncHandler(async (req, res) => {
  const query = await Query.findOne({
    _id: req.params.id,
    customerId: req.user.id,
  });

  if (!query) {
    res.status(404);
    throw new Error("Query not found");
  }

  const { message, attachments } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("Message is required");
  }

  query.replies.push({
    senderId: req.user.id,
    senderModel: "Customer",
    message,
    attachments,
  });

  // Re-open if closed
  if (query.status === "Closed" || query.status === "Resolved") {
    query.status = "Pending";
  }

  await query.save();

  res.status(200).json({
    success: true,
    message: "Reply sent successfully",
    replies: query.replies,
  });
});

// ==========================================
// 🛡️ PRIVATE ROUTES (ADMIN PANEL)
// ==========================================

/**
 * @desc    Get all queries with pagination and filters
 * @route   GET /api/v1/private/query
 * @access  Private (Admin)
 */
const adminGetAllQueries = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;

  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.priority) filters.priority = req.query.priority;
  if (req.query.category) filters.category = req.query.category;

  if (req.query.keyword) {
    filters.$or = [
      { subject: { $regex: req.query.keyword, $options: "i" } },
      { ticketId: { $regex: req.query.keyword, $options: "i" } },
    ];
  }

  const count = await Query.countDocuments(filters);
  const queries = await Query.find(filters)
    .populate("customerId", "name phone email")
    .populate("assignedTo", "name email")
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    queries,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

/**
 * @desc    Get query by ID with details
 * @route   GET /api/v1/private/query/:id
 * @access  Private (Admin)
 */
const adminGetQueryById = asyncHandler(async (req, res) => {
  const query = await Query.findById(req.params.id)
    .populate("customerId", "name phone email avatar")
    .populate("assignedTo", "name email")
    .populate("replies.senderId", "name email avatar");

  if (!query) {
    res.status(404);
    throw new Error("Query not found");
  }

  res.status(200).json({
    success: true,
    query,
  });
});

/**
 * @desc    Update query status
 * @route   PATCH /api/v1/private/query/:id/status
 * @access  Private (Admin)
 */
const adminUpdateStatus = asyncHandler(async (req, res) => {
  const query = await Query.findById(req.params.id);

  if (!query) {
    res.status(404);
    throw new Error("Query not found");
  }

  const { status } = req.body;
  if (!["Open", "Pending", "Resolved", "Closed"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  query.status = status;
  await query.save();

  res.status(200).json({
    success: true,
    message: `Query status updated to ${status}`,
    status: query.status,
  });
});

/**
 * @desc    Assign query to staff
 * @route   PATCH /api/v1/private/query/:id/assign
 * @access  Private (Admin)
 */
const adminAssignQuery = asyncHandler(async (req, res) => {
  const query = await Query.findById(req.params.id);

  if (!query) {
    res.status(404);
    throw new Error("Query not found");
  }

  query.assignedTo = req.body.assignedTo;
  await query.save();

  res.status(200).json({
    success: true,
    message: "Query assigned successfully",
    assignedTo: query.assignedTo,
  });
});

/**
 * @desc    Admin reply to query
 * @route   POST /api/v1/private/query/:id/reply
 * @access  Private (Admin)
 */
const adminReply = asyncHandler(async (req, res) => {
  const query = await Query.findById(req.params.id);

  if (!query) {
    res.status(404);
    throw new Error("Query not found");
  }

  const { message, attachments } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("Message is required");
  }

  query.replies.push({
    senderId: req.user.id,
    senderModel: "User",
    message,
    attachments,
  });

  query.status = "Pending"; // Mark as pending when admin replies
  await query.save();

  res.status(200).json({
    success: true,
    message: "Reply sent successfully",
    replies: query.replies,
  });
});

/**
 * @desc    Delete query
 * @route   DELETE /api/v1/private/query/:id
 * @access  Private (Admin)
 */
const adminDeleteQuery = asyncHandler(async (req, res) => {
  const query = await Query.findById(req.params.id);
  if (!query) {
    res.status(404);
    throw new Error("Query not found");
  }
  await query.deleteOne();
  res.status(200).json({
    success: true,
    message: "Query deleted successfully",
  });
});

module.exports = {
  createQuery,
  getMyQueries,
  customerReply,
  adminGetAllQueries,
  adminGetQueryById,
  adminUpdateStatus,
  adminAssignQuery,
  adminReply,
  adminDeleteQuery,
};
