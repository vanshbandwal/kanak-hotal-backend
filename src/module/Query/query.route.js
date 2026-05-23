const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const { checkPermission } = require("../../middleware/rbac.middleware");
const validate = require("../../middlewares/validate");
const querySchemas = require("./query.validation");

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
router.post("/", authMiddleware, validate(querySchemas.createQuery), createQuery);
router.get("/my-queries", authMiddleware, getMyQueries);
router.post("/:id/reply", authMiddleware, validate(querySchemas.reply), customerReply);

// ==========================================
// 🛡️ PRIVATE ROUTES (Admin Panel)
// ==========================================
router.get("/", authMiddleware, checkPermission("VIEW_QUERY"), adminGetAllQueries);
router.get("/:id", authMiddleware, checkPermission("VIEW_QUERY"), adminGetQueryById);
router.patch("/:id/status", authMiddleware, checkPermission("UPDATE_QUERY"), validate(querySchemas.updateStatus), adminUpdateStatus);
router.patch("/:id/assign", authMiddleware, checkPermission("UPDATE_QUERY"), validate(querySchemas.assignQuery), adminAssignQuery);
router.post("/:id/admin-reply", authMiddleware, checkPermission("UPDATE_QUERY"), validate(querySchemas.reply), adminReply);
router.delete("/:id", authMiddleware, checkPermission("DELETE_QUERY"), adminDeleteQuery);

module.exports = router;
