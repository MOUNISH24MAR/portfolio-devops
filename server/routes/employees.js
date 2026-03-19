const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const Employee = require("../models/Employee");
const Submission = require("../models/Submission");
const Activity = require("../models/Activity");

// @route   GET /api/employees
// @desc    Get all employees for the logged-in manager
// @access  Private (Manager/Admin)
router.get("/", auth, role(["MANAGER", "ADMIN"]), async (req, res) => {
    try {
        const filter = req.user.role === "ADMIN" ? {} : { managerId: req.user.id };
        const employees = await Employee.find(filter).populate("assignedProjects");
        res.json(employees);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   POST /api/employees
// @desc    Create a new employee
// @access  Private (Manager/Admin)
router.post("/", auth, role(["MANAGER", "ADMIN"]), async (req, res) => {
    try {
        const submit = req.body.submit;
        const newEmployee = new Employee({
            ...req.body,
            managerId: req.user.role === "ADMIN" ? req.body.managerId || req.user.id : req.user.id,
            submissionStatus: submit ? 'PendingApproval' : 'Draft'
        });
        const employee = await newEmployee.save();

        if (submit) {
            const submission = new Submission({
                managerId: req.user.id,
                entityType: 'Employee',
                entityId: employee._id,
                dataSnapshot: employee.toObject()
            });
            await submission.save();
        }

        const activity = new Activity({
            userId: req.user.id,
            action: (submit || req.body.submit) ? 'Submitted' : 'Created',
            entityType: 'Employee',
            entityId: employee._id,
            details: `Employee: ${employee.fullName}`
        });
        await activity.save();

        res.json(employee);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) return res.status(400).json({ msg: "Employee ID or Email already exists" });
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private (Manager/Admin)
router.put("/:id", auth, role(["MANAGER", "ADMIN"]), async (req, res) => {
    try {
        let employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ msg: "Employee not found" });

        // Check ownership
        if (req.user.role !== "ADMIN" && employee.managerId.toString() !== req.user.id) {
            return res.status(401).json({ msg: "Not authorized" });
        }

        // Lock if pending or approved
        if (req.user.role !== 'ADMIN' && (employee.submissionStatus === 'Approved' || employee.submissionStatus === 'PendingApproval')) {
            return res.status(400).json({ msg: "Employee is locked for approval." });
        }

        const submit = req.body.submit;
        const updates = { ...req.body };
        if (submit) updates.submissionStatus = 'PendingApproval';

        // Capture previous data for rollback support
        const previousDataSnapshot = employee.toObject();

        employee = await Employee.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });

        if (submit) {
            const submission = new Submission({
                managerId: req.user.id,
                entityType: 'Employee',
                entityId: employee._id,
                previousData: previousDataSnapshot,
                dataSnapshot: employee.toObject()
            });
            await submission.save();
        }


        const activity = new Activity({
            userId: req.user.id,
            action: (submit || req.body.submit) ? 'Submitted' : 'Updated',
            entityType: 'Employee',
            entityId: employee._id,
            details: `Employee: ${employee.fullName}`
        });
        await activity.save();

        res.json(employee);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;
