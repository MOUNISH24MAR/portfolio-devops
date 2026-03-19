const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const OperationalReport = require("../models/OperationalReport");
const Submission = require("../models/Submission");
const Activity = require("../models/Activity");

// @route   GET /api/reports
// @desc    Get reports
// @access  Private (Manager/Admin)
router.get("/", auth, role(["MANAGER", "ADMIN"]), async (req, res) => {
    try {
        const filter = req.user.role === "ADMIN" ? {} : { managerId: req.user.id };
        const reports = await OperationalReport.find(filter).populate("managerId", "username");
        res.json(reports);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   POST /api/reports
// @desc    Create/Save report draft
// @access  Private (Manager)
router.post("/", auth, role(["MANAGER"]), async (req, res) => {
    try {
        const submit = req.body.submit;
        const newReport = new OperationalReport({
            ...req.body,
            managerId: req.user.id,
            submissionStatus: submit ? 'PendingApproval' : 'Draft'
        });
        const report = await newReport.save();

        if (submit) {
            const submission = new Submission({
                managerId: req.user.id,
                entityType: 'OperationalReport',
                entityId: report._id,
                dataSnapshot: report.toObject()
            });
            await submission.save();
        }

        const activity = new Activity({
            userId: req.user.id,
            action: submit ? 'Submitted' : 'Created',
            entityType: 'OperationalReport',
            entityId: report._id,
            details: `Report: ${report.reportingPeriod}`
        });
        await activity.save();

        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   PUT /api/reports/:id
// @desc    Update report (save draft or submit)
// @access  Private (Manager)
router.put("/:id", auth, role(["MANAGER"]), async (req, res) => {
    try {
        let report = await OperationalReport.findById(req.params.id);
        if (!report) return res.status(404).json({ msg: "Report not found" });
        if (report.managerId.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" });

        if (report.submissionStatus === 'Approved' || report.submissionStatus === 'PendingApproval') {
            return res.status(400).json({ msg: "Report is already submitted and locked." });
        }

        const updates = { ...req.body };
        const submit = req.body.submit;
        if (submit) updates.submissionStatus = 'PendingApproval';

        // Capture previous data for rollback support
        const previousDataSnapshot = report.toObject();

        report = await OperationalReport.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });

        if (submit) {
            const submission = new Submission({
                managerId: req.user.id,
                entityType: 'OperationalReport',
                entityId: report._id,
                previousData: previousDataSnapshot,
                dataSnapshot: report.toObject()
            });
            await submission.save();
        }

        const activity = new Activity({
            userId: req.user.id,
            action: submit ? 'Submitted' : 'Updated',
            entityType: 'OperationalReport',
            entityId: report._id,
            details: `Report: ${report.reportingPeriod}`
        });
        await activity.save();

        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;
