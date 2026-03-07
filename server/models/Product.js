const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: String,
  description: String,
  image: String,
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submissionStatus: {
    type: String,
    enum: ['Draft', 'PendingApproval', 'Approved', 'Rejected'],
    default: 'Approved' // Existing products default to approved to not break current UI
  },
  verificationMetadata: {
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);