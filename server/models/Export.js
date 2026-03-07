const mongoose = require("mongoose");

const exportSchema = new mongoose.Schema({
    region: { type: String, required: true },
    country: { type: String, required: true },
    category: { type: String, required: true },
    volume: { type: Number, required: true },
    value: { type: Number },
    year: { type: Number, required: true },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Buyer'
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
exportSchema.index({ submissionStatus: 1, region: 1 });
exportSchema.index({ buyerId: 1 });
exportSchema.index({ createdAt: 1 });

const Export = mongoose.models.Export || mongoose.model("Export", exportSchema);
module.exports = Export;
