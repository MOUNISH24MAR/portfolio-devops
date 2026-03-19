const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const Project = require("../models/Project");
const Submission = require("../models/Submission");
const Activity = require("../models/Activity");

// @route   GET /api/projects
// @desc    Get all projects for the logged-in manager
// @access  Private (Manager/Admin)
router.get("/", auth, role(["MANAGER", "ADMIN"]), async (req, res) => {
    try {
        const filter = req.user.role === "ADMIN" ? {} : { managerId: req.user.id };
        const projects = await Project.find(filter).populate("assignedEmployees");
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private (Manager/Admin)
router.post("/", auth, role(["MANAGER", "ADMIN"]), async (req, res) => {
    try {
        const submit = req.body.submit;
        const newProject = new Project({
            ...req.body,
            managerId: req.user.role === "ADMIN" ? req.body.managerId || req.user.id : req.user.id,
            submissionStatus: submit ? 'PendingApproval' : 'Draft'
        });
        const project = await newProject.save();

        if (submit) {
            const submission = new Submission({
                managerId: req.user.id,
                entityType: 'Project',
                entityId: project._id,
                dataSnapshot: project.toObject()
            });
            await submission.save();
        }

        const activity = new Activity({
            userId: req.user.id,
            action: submit ? 'Submitted' : 'Created',
            entityType: 'Project',
            entityId: project._id,
            details: `Project: ${project.name}`
        });
        await activity.save();

        res.json(project);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) return res.status(400).json({ msg: "Project ID already exists" });
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Manager/Admin)
router.put("/:id", auth, role(["MANAGER", "ADMIN"]), async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: "Project not found" });

        if (req.user.role !== "ADMIN" && project.managerId.toString() !== req.user.id) {
            return res.status(401).json({ msg: "Not authorized" });
        }

        // Lock if pending or approved
        if (req.user.role !== 'ADMIN' && (project.submissionStatus === 'Approved' || project.submissionStatus === 'PendingApproval')) {
            return res.status(400).json({ msg: "Project is locked for approval." });
        }

        const submit = req.body.submit;
        const updates = { ...req.body };
        if (submit) updates.submissionStatus = 'PendingApproval';

        // Capture previous data for rollback support
        const previousDataSnapshot = project.toObject();

        project = await Project.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });

        if (submit) {
            const submission = new Submission({
                managerId: req.user.id,
                entityType: 'Project',
                entityId: project._id,
                previousData: previousDataSnapshot,
                dataSnapshot: project.toObject()
            });
            await submission.save();
        }

        const activity = new Activity({
            userId: req.user.id,
            action: submit ? 'Submitted' : 'Updated',
            entityType: 'Project',
            entityId: project._id,
            details: `Project: ${project.name}`
        });
        await activity.save();

        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;
