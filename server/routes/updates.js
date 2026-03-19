const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const Update = require("../models/Update");
const Submission = require("../models/Submission");
const Activity = require("../models/Activity");

// @route   GET api/updates
// @desc    Get approved updates
// @access  Public
router.get("/", async (req, res) => {
    try {
        const updates = await Update.find({ submissionStatus: 'Approved' }).sort({ date: -1 });
        res.json(updates);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// @route   GET api/updates/all
// @desc    Get all updates for managers
// @access  Private
router.get("/all", auth, role(['MANAGER', 'ADMIN']), async (req, res) => {
    try {
        const updates = await Update.find().sort({ date: -1 });
        res.json(updates);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// @route   POST api/updates
// @desc    Create new update
router.post("/", auth, role(['MANAGER', 'ADMIN']), async (req, res) => {
    try {
        const { title, content, category, date, submit } = req.body;
        const newUpdate = new Update({
            title, content, category, date,
            managerId: req.user.id,
            submissionStatus: submit ? 'PendingApproval' : 'Draft'
        });

        const savedUpdate = await newUpdate.save();

        if (submit) {
            const submission = new Submission({
                managerId: req.user.id,
                entityType: 'Update',
                entityId: savedUpdate._id,
                dataSnapshot: savedUpdate.toObject()
            });
            await submission.save();
        }

        const activity = new Activity({
            userId: req.user.id,
            action: submit ? 'Submitted' : 'Created',
            entityType: 'Update',
            entityId: savedUpdate._id,
            details: `Update: ${title}`
        });
        await activity.save();

        res.json(savedUpdate);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// @route   PUT api/updates/:id
// @desc    Update/Submit update
router.put("/:id", auth, role(['MANAGER', 'ADMIN']), async (req, res) => {
    try {
        const { submit } = req.body;
        let update = await Update.findById(req.params.id);
        if (!update) return res.status(404).json({ msg: "Update not found" });

        if (submit) {
            // Capture previous data for rollback support
            const previousDataSnapshot = update.toObject();

            update.submissionStatus = 'PendingApproval';
            await update.save();

            const submission = new Submission({
                managerId: req.user.id,
                entityType: 'Update',
                entityId: update._id,
                previousData: previousDataSnapshot,
                dataSnapshot: update.toObject()
            });
            await submission.save();

            const activity = new Activity({
                userId: req.user.id,
                action: 'Submitted',
                entityType: 'Update',
                entityId: update._id,
                details: `Update: ${update.title}`
            });
            await activity.save();
        } else {
            const { title, content, category, date } = req.body;
            if (title) update.title = title;
            if (content) update.content = content;
            if (category) update.category = category;
            if (date) update.date = date;
            await update.save();
        }

        res.json(update);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
