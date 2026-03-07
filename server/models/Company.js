const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    establishedYear: Number,
    location: String,

    status: {
        type: String,
        enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
        default: "DRAFT"
    },

    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    approvedAt: Date,

    version: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

// Performance Indexes for Analytics
companySchema.index({ status: 1 });
companySchema.index({ createdAt: 1 });

const Company = mongoose.models.Company || mongoose.model("Company", companySchema);
module.exports = Company;