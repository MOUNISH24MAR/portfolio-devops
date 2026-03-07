const mongoose = require("mongoose");

const financialSchema = new mongoose.Schema({
    revenueRange: { type: String, required: true },
    profitRange: { type: String, required: true },
    revenue: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    growthIndicator: { type: Number }, // percentage
    costCategories: [
        {
            name: { type: String },
            amount: { type: Number }
        }
    ],
    year: { type: Number, required: true },
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
financialSchema.index({ submissionStatus: 1 });
financialSchema.index({ createdAt: 1 });

const Financial = mongoose.models.Financial || mongoose.model("Financial", financialSchema);
module.exports = Financial;
