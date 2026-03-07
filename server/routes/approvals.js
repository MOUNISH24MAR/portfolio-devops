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
        const pendingCompanies = await Company.find({ status: "PENDING" })
            .populate("submittedBy", "username name")
            .sort({ createdAt: -1 });
        res.json(pendingCompanies);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   GET /api/approvals
// @desc    Get all pending general submissions (from Submission model)
// @access  Private (Admin)
router.get("/", auth, role(["ADMIN"]), async (req, res) => {
    try {
        const submissions = await Submission.find({ status: "Pending" })
            .populate("managerId", "username")
            .sort({ submittedAt: -1 });

        const pendingCompanies = await Company.find({ status: "PENDING" })
            .populate("submittedBy", "username")
            .sort({ createdAt: -1 });

        const formattedCompanies = pendingCompanies.map(comp => ({
            _id: comp._id,
            managerId: comp.submittedBy,
            entityType: 'Company',
            submittedAt: comp.createdAt,
            status: 'Pending',
            isCompany: true,
            dataSnapshot: {
                name: comp.name,
                description: comp.description,
                establishedYear: comp.establishedYear,
                location: comp.location,
                version: comp.version
            }
        }));

        const combined = [...submissions, ...formattedCompanies].sort((a, b) => {
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
        const { action, comments, isCompany } = req.body; // action: 'APPROVED' or 'REJECTED' or 'Approved' or 'Rejected'

        if (isCompany) {
            const company = await Company.findById(req.params.id);
            if (!company) return res.status(404).json({ msg: "Company submission not found" });

            company.status = action.toUpperCase(); // Ensure it matches 'APPROVED' or 'REJECTED'
            if (company.status === 'APPROVED') {
                company.approvedBy = req.user.id;
                company.approvedAt = Date.now();
            }
            await company.save();

            const activity = new Activity({
                userId: req.user.id,
                action: company.status,
                entityType: 'Company',
                entityId: company._id,
                details: `Admin ${company.status.toLowerCase()} company profile v${company.version}`
            });
            await activity.save();

            return res.json({ msg: `Company profile ${company.status}` });
        }

        // Handle regular Submissions
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ msg: "Submission not found" });

        submission.status = action;
        await submission.save();

        const approval = new Approval({
            submissionId: submission._id,
            adminId: req.user.id,
            action,
            comments
        });
        await approval.save();

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

module.exports = router;
