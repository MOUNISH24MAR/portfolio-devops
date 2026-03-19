const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const Export = require("../models/Export");
const RawMaterial = require("../models/RawMaterial");
const Buyer = require("../models/Buyer");
const Financial = require("../models/Financial");

const Submission = require("../models/Submission");
const Activity = require("../models/Activity");

// Helper to get model by domain name
const getModel = (domain) => {
    switch (domain) {
        case 'exports': return Export;
        case 'raw-materials': return RawMaterial;
        case 'buyers': return Buyer;
        case 'financials': return Financial;
        default: return null;
    }
};

const getEntityType = (domain) => {
    switch (domain) {
        case 'exports': return 'Export';
        case 'raw-materials': return 'RawMaterial';
        case 'buyers': return 'Buyer';
        case 'financials': return 'Financial';
        default: return null;
    }
};

// @route   GET api/operational/activity
// @desc    Get recent activity for logged-in user
// @access  Private
router.get("/activity", auth, async (req, res) => {
    try {
        const activity = await Activity.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(activity);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// @route   GET api/operational/:domain
// @desc    Get data for a specific domain based on role
// @access  Public / Manager / Admin
router.get("/:domain", async (req, res) => {
    const { domain } = req.params;
    const Model = getModel(domain);
    if (!Model) return res.status(404).json({ msg: "Domain not found" });

    try {
        const data = await Model.find({ submissionStatus: 'Approved' }).sort({ year: -1, createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// @route   GET api/operational/:domain/all
// @desc    Get all data (including drafts) for managers and admins
// @access  Private (Manager / Admin)
router.get("/:domain/all", auth, role(['MANAGER', 'ADMIN']), async (req, res) => {
    const { domain } = req.params;
    const Model = getModel(domain);
    if (!Model) return res.status(404).json({ msg: "Domain not found" });

    try {
        const data = await Model.find().sort({ year: -1, createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// @route   POST api/operational/:domain
// @desc    Create new record
// @access  Private (Manager / Admin)
router.post("/:domain", auth, role(['MANAGER', 'ADMIN']), async (req, res) => {
    const { domain } = req.params;
    const Model = getModel(domain);
    if (!Model) return res.status(404).json({ msg: "Domain not found" });

    try {
        const { submit, ...formData } = req.body;
        const newRecord = new Model({
            ...formData,
            managerId: req.user.id,
            submissionStatus: submit ? 'PendingApproval' : 'Draft'
        });

        const savedRecord = await newRecord.save();

        if (submit) {
            const submission = new Submission({
                managerId: req.user.id,
                entityType: getEntityType(domain),
                entityId: savedRecord._id,
                dataSnapshot: savedRecord.toObject()
            });
            await submission.save();
        }

        const activity = new Activity({
            userId: req.user.id,
            action: submit ? 'Submitted' : 'Created',
            entityType: getEntityType(domain),
            entityId: savedRecord._id,
            details: `Operational Data: ${domain}`
        });
        await activity.save();

        res.json(savedRecord);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// @route   PUT api/operational/:domain/:id
// @desc    Update record
// @access  Private (Manager / Admin)
router.put("/:domain/:id", auth, role(['MANAGER', 'ADMIN']), async (req, res) => {
    const { domain, id } = req.params;
    const Model = getModel(domain);
    if (!Model) return res.status(404).json({ msg: "Domain not found" });

    try {
        const { submit, ...updateData } = req.body;
        let record = await Model.findById(id);
        if (!record) return res.status(404).json({ msg: "Record not found" });

        if (submit) {
            updateData.submissionStatus = 'PendingApproval';
        }

        // Capture previous data for rollback support
        const previousDataSnapshot = record.toObject();

        const updatedRecord = await Model.findByIdAndUpdate(id, { $set: updateData }, { new: true });

        if (submit) {
            const submission = new Submission({
                managerId: req.user.id,
                entityType: getEntityType(domain),
                entityId: updatedRecord._id,
                previousData: previousDataSnapshot,
                dataSnapshot: updatedRecord.toObject()
            });
            await submission.save();
        }

        const activity = new Activity({
            userId: req.user.id,
            action: submit ? 'Submitted' : 'Updated',
            entityType: getEntityType(domain),
            entityId: updatedRecord._id,
            details: `Operational Data: ${domain}`
        });
        await activity.save();

        res.json(updatedRecord);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
