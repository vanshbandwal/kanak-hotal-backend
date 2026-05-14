const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const { checkPermission } = require("../../middleware/rbac.middleware");
const {
  createQuery,
  getMyQueries,
  customerReply,
  adminGetAllQueries,
  adminGetQueryById,
  adminUpdateStatus,
  adminAssignQuery,
  adminReply,
  adminDeleteQuery,
} = require("./query.controller");

// ==========================================
// 🌍 PUBLIC ROUTES (Customer Facing)
// ==========================================
router.post("/", authMiddleware, createQuery);
router.get("/my-queries", authMiddleware, getMyQueries);
router.post("/:id/reply", authMiddleware, customerReply);

// ==========================================
// 🛡️ PRIVATE ROUTES (Admin Panel)
// ==========================================
router.get("/", authMiddleware, checkPermission("VIEW_QUERY"), adminGetAllQueries);
router.get("/:id", authMiddleware, checkPermission("VIEW_QUERY"), adminGetQueryById);
router.patch("/:id/status", authMiddleware, checkPermission("UPDATE_QUERY"), adminUpdateStatus);
router.patch("/:id/assign", authMiddleware, checkPermission("UPDATE_QUERY"), adminAssignQuery);
router.post("/:id/admin-reply", authMiddleware, checkPermission("UPDATE_QUERY"), adminReply);
router.delete("/:id", authMiddleware, checkPermission("DELETE_QUERY"), adminDeleteQuery);

module.exports = router;
