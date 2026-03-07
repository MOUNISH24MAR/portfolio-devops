const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    entityType: {
        type: String,
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    details: {
        type: String
    },
    actionType: {
        type: String,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'VERIFY', 'REJECT', 'LOGIN', 'OTHER'],
        default: 'OTHER'
    },
    changeSummary: {
        type: String
    }
}, { timestamps: true });

// Performance Indexes for Analytics
ActivitySchema.index({ createdAt: 1 });
ActivitySchema.index({ actionType: 1 });

const Activity = mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);
module.exports = Activity;
