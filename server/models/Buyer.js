const mongoose = require("mongoose");

const buyerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    region: { type: String, required: true },
    country: { type: String, required: true },
    industry: { type: String, required: true },
    relationshipDuration: { type: String },
    orderFrequency: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    submissionStatus: {
        type: String,
        enum: ['Draft', 'PendingApproval', 'Approved', 'Rejected'],
        default: 'Draft'
    },
    verificationMetadata: {
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: { type: Date },
        rejectionReason: { type: String }
    }
}, { timestamps: true });

// Performance Indexes for Analytics
buyerSchema.index({ submissionStatus: 1, region: 1 });
buyerSchema.index({ createdAt: 1 });

const Buyer = mongoose.models.Buyer || mongoose.model("Buyer", buyerSchema);
module.exports = Buyer;
