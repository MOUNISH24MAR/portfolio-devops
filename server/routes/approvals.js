const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const Submission = require("../models/Submission");
const Approval = require("../models/Approval");
const Employee = require("../models/Employee");
const Project = require("../models/Project");
const OperationalReport = require("../models/OperationalReport");
const Export = require("../models/Export");
const RawMaterial = require("../models/RawMaterial");
const Buyer = require("../models/Buyer");
const Financial = require("../models/Financial");
const Media = require("../models/Media");
const Update = require("../models/Update");
const Company = require("../models/Company");
const Activity = require("../models/Activity");
const Product = require("../models/Product");

// @route   GET /api/approvals/company
// @desc    Get pending company profile submissions
// @access  Private (Admin)
router.get("/company", auth, role(["ADMIN"]), async (req, res) => {
    try {
        const pendingSubmissions = await Submission.find({ 
            entityType: 'Company',
            status: 'Pending' 
        })
        .populate("managerId", "username name")
        .sort({ submittedAt: -1 });
        
        res.json(pendingSubmissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   GET /api/approvals
// @desc    Get all pending and revokable submissions
// @access  Private (Admin)
router.get("/", auth, role(["ADMIN"]), async (req, res) => {
    try {
        // Find Pending OR Approved but within 24h revoke window
        const submissions = await Submission.find({
            $or: [
                { status: "Pending" },
                { status: "Approved", approvalDeadline: { $gt: new Date() } }
            ]
        })
            .populate("managerId", "username")
            .sort({ submittedAt: -1 });

        const combined = submissions.sort((a, b) => {
            const dateA = a.submittedAt || a.createdAt;
            const dateB = b.submittedAt || b.createdAt;
            return new Date(dateB) - new Date(dateA);
        });

        res.json(combined);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   POST /api/approvals/:id
// @desc    Approve or Reject a submission (Generic + Company)
// @access  Private (Admin)
router.post("/:id", auth, role(["ADMIN"]), async (req, res) => {
    try {
        const { action, comments } = req.body; 

        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ msg: "Submission not found" });

        const Model = {
            'Employee': Employee,
            'Project': Project,
            'OperationalReport': OperationalReport,
            'Export': Export,
            'RawMaterial': RawMaterial,
            'Buyer': Buyer,
            'Financial': Financial,
            'Media': Media,
            'Update': Update,
            'Company': Company,
            'Product': Product
        }[submission.entityType];

        if (!Model) return res.status(400).json({ msg: "Invalid entity type for approval logic" });

        // Capture previous state for rollback if approving (but don't overwrite if manager already captured it)
        if (action === 'Approved' || action === 'APPROVED') {
            if (!submission.previousData) {
                const currentEntity = await Model.findById(submission.entityId);
                if (currentEntity) {
                    submission.previousData = currentEntity.toObject();
                }
            }
            submission.approvalDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h window
        }

        submission.status = action;
        await submission.save();

        const approval = new Approval({
            submissionId: submission._id,
            adminId: req.user.id,
            action,
            comments
        });
        await approval.save();

        if (Model) {
            const entityStatus = (action === 'Approved' || action === 'APPROVED') ? 'Approved' : 'Rejected';
            const updateField = submission.entityType === 'Company' ? { status: entityStatus.toUpperCase() } : { submissionStatus: entityStatus };

            await Model.findByIdAndUpdate(submission.entityId, {
                $set: {
                    ...updateField,
                    verificationMetadata: {
                        verifiedBy: req.user.id,
                        verifiedAt: Date.now(),
                        rejectionReason: (action === 'Rejected' || action === 'REJECTED') ? comments : ""
                    }
                }
            });
        }

        const activity = new Activity({
            userId: req.user.id,
            action,
            entityType: submission.entityType,
            entityId: submission.entityId,
            details: `Admin decision on ${submission.entityType}`
        });
        await activity.save();

        res.json({ msg: `Submission ${action}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   POST /api/approvals/:id/revoke
// @desc    Revoke an approved submission within 24 hours
// @access  Private (Admin)
router.post("/:id/revoke", auth, role(["ADMIN"]), async (req, res) => {
    try {
        const { reason } = req.body;
        const submission = await Submission.findById(req.params.id);

        if (!submission) return res.status(404).json({ msg: "Submission not found" });

        if (submission.status !== 'Approved') {
            return res.status(400).json({ msg: "Only approved submissions can be revoked." });
        }

        if (submission.approvalDeadline && new Date() > submission.approvalDeadline) {
            return res.status(400).json({ msg: "Revoke window (24h) has expired." });
        }

        if (!submission.previousData) {
            return res.status(400).json({ msg: "No rollback data available for this submission." });
        }

        const Model = {
            'Employee': Employee,
            'Project': Project,
            'OperationalReport': OperationalReport,
            'Export': Export,
            'RawMaterial': RawMaterial,
            'Buyer': Buyer,
            'Financial': Financial,
            'Media': Media,
            'Update': Update,
            'Company': Company,
            'Product': Product
        }[submission.entityType];

        if (Model) {
            // Restore previous state
            const rollbackData = { ...submission.previousData };
            // Ensure status is reset or maintained as per logic (usually 'PendingApproval' again)
            if (submission.entityType === 'Company') {
                rollbackData.status = 'PENDING';
            } else {
                rollbackData.submissionStatus = 'PendingApproval';
            }

            await Model.findByIdAndUpdate(submission.entityId, rollbackData, { overwrite: true });
        }

        // Update submission status
        submission.status = 'Revoked';
        submission.revokedBy = req.user.id;
        submission.revokedAt = Date.now();
        submission.revokeReason = reason || "Accidental approval";
        await submission.save();

        // Log activity
        const activity = new Activity({
            userId: req.user.id,
            action: 'REVOKED',
            entityType: submission.entityType,
            entityId: submission.entityId,
            details: `Admin revoked approval for ${submission.entityType}`
        });
        await activity.save();

        res.json({ msg: "Approval successfully revoked and data rolled back." });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;
