const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "Pending", "Resolved", "Closed"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    category: {
      type: String,
      enum: ["General", "Technical", "Billing", "Feedback", "Other"],
      default: "General",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming staff are in User model
    },
    replies: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        senderModel: {
          type: String,
          required: true,
          enum: ["Customer", "User"],
        },
        message: {
          type: String,
          required: true,
        },
        attachments: [String],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [String],
  },
  { timestamps: true }
);

// Auto-generate ticket ID before saving if not present
querySchema.pre("validate", async function (next) {
  if (!this.ticketId) {
    const date = new Date();
    const prefix = "QRY";
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);
    this.ticketId = `${prefix}-${year}${month}-${random}`;
  }
  next();
});

const Query = mongoose.model("Query", querySchema);
module.exports = Query;
