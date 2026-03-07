const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const Employee = require("../models/Employee");
const Project = require("../models/Project");
const Submission = require("../models/Submission");
const User = require("../models/User");
const Activity = require("../models/Activity");
const Export = require("../models/Export");
const RawMaterial = require("../models/RawMaterial");
const Financial = require("../models/Financial");
const Buyer = require("../models/Buyer");
const Company = require("../models/Company");
const Inquiry = require("../models/Inquiry");
const mongoose = require("mongoose");
const { getDashboardStats } = require("../services/adminAnalytics/analyticsService");
const { generateOperationalReport } = require("../services/adminAnalytics/reportService");

router.get("/stats", auth, role(["ADMIN"]), async (req, res) => {
    try {
        const forceRefresh = req.query.refresh === 'true';
        const stats = await getDashboardStats(forceRefresh);
        res.json(stats);
    } catch (err) {
        console.error("Dashboard Stats Error:", err.message);
        res.status(500).json({ msg: "Administrative Intelligence Core reported an aggregation failure." });
    }
});

// @route   GET /api/admin/report
// @desc    Get human-readable operational performance report
// @access  Private (Admin)
router.get("/report", auth, role(["ADMIN"]), async (req, res) => {
    try {
        const report = await generateOperationalReport();
        res.json(report);
    } catch (err) {
        console.error("Report Generation Error:", err.message);
        res.status(500).json({ msg: "Administrative Intelligence failed to generate report." });
    }
});

// @route   POST /api/admin/analyze-graph
// @desc    Analyze graph data and return AI-driven insights
// @access  Private (Admin)
router.post("/analyze-graph", auth, role(["ADMIN"]), async (req, res) => {
    try {
        const { chartType, data, title } = req.body;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ msg: "Insufficient data for real-time analysis." });
        }

        let report = {
            status: "Stable",
            currentStatus: "",
            observedTrend: "",
            criticalSignals: null,
            whyHappening: "",
            actions: [],
            formalAudit: ""
        };

        const prev = data[data.length - 2];
        const curr = data[data.length - 1];

        switch (chartType) {
            case 'financial': {
                const revenueChange = prev ? curr.revenue - prev.revenue : 0;
                const expenseChange = prev ? curr.expenses - prev.expenses : 0;
                const gap = curr.revenue - curr.expenses;
                const revenueDir = revenueChange >= 0 ? "Growth" : "Decline";

                report.status = (expenseChange > revenueChange) ? "Warning" : "Positive";
                report.currentStatus = `Revenue is currently ${gap > 0 ? "higher" : "lower"} than expenses ($${curr.revenue} vs $${curr.expenses}). The profit gap is ${gap > 0 ? "positive" : "negative"}.`;
                report.observedTrend = prev ? `Revenue has ${revenueChange >= 0 ? 'increased' : 'decreased'} compared to the previous period. Expenses moved ${expenseChange >= 0 ? 'up' : 'down'} by $${Math.abs(expenseChange)}.` : "Initial baseline established. Awaiting next cycle for trend analysis.";

                if (expenseChange > revenueChange && prev) {
                    report.criticalSignals = "Expenses are currently rising faster than revenue. Profit margins are narrowing.";
                }

                report.whyHappening = `Current pattern suggests ${report.status === 'Positive' ? 'efficient cost management during production' : 'a surge in operational costs that outpaces current billing'}.`;
                report.actions = [
                    report.status === "Positive" ? "Maintain current cost controls." : "Audit recent expense spikes immediately.",
                    "Monitor next cycle for margin stabilization."
                ];
                break;
            }

            case 'submissions': {
                const pending = data.find(d => d.name === 'Pending')?.value || 0;
                const total = data.reduce((acc, curr) => acc + curr.value, 0);
                const pendingRatio = (pending / total) * 100;

                report.status = pendingRatio > 30 ? "Critical" : (pendingRatio > 15 ? "Warning" : "Positive");
                report.currentStatus = `Currently ${pending} submissions are awaiting verification out of ${total} total records.`;
                report.observedTrend = `Pending items represent ${pendingRatio.toFixed(1)}% of the total queue. ${pendingRatio > 20 ? 'Queue density is increasing.' : 'Workflow is moving at standard speed.'}`;

                if (pendingRatio > 30) {
                    report.criticalSignals = "BOTTLENECK: The approval queue has exceeded the safe operational threshold of 30%.";
                }

                report.whyHappening = "Variation in management activity levels or a sudden spike in operational reporting.";
                report.actions = [
                    report.status === 'Critical' ? "Clear the backlog immediately to prevent project stalls." : "Continue routine verification.",
                    "Identify if specific departments are causing the delay."
                ];
                break;
            }

            case 'inventory': {
                const lowStock = data.filter(d => d.quantity < 20);
                const criticalCount = lowStock.length;

                report.status = criticalCount > 0 ? "Critical" : "Positive";
                report.currentStatus = `${criticalCount} material nodes are currently resting below safety buffers.`;
                report.observedTrend = `Total inventory coverage is ${criticalCount > 0 ? 'narrowing' : 'stable'}. Consumption is tracking ${criticalCount > 0 ? 'faster' : 'within'} replenishment cycles.`;

                if (criticalCount > 0) {
                    report.criticalSignals = `CRITICAL STOCK: ${lowStock.map(l => l.name).join(', ')} are in the danger zone (< 20 units).`;
                }

                report.whyHappening = "Recent high-volume projects combined with potential procurement latency.";
                report.actions = [
                    criticalCount > 0 ? "Initiate immediate reorder protocol for critical items." : "Monitor consumption rates.",
                    "Verify lead times with primary suppliers."
                ];
                break;
            }

            case 'exports': {
                const change = prev ? ((curr.value - prev.value) / prev.value) * 100 : 0;
                report.status = change > 5 ? "Positive" : (change < -5 ? "Warning" : "Stable");
                report.currentStatus = `Latest export valuation stands at ${curr.value}.`;
                report.observedTrend = prev ? `Market valuation has ${change > 0 ? 'surged' : 'varied'} by ${Math.abs(change).toFixed(1)}% compared to the previous cycle.` : "Establishing initial performance baseline.";

                if (change < -10) {
                    report.criticalSignals = "SHARP DROP: Export valuation has decreased significantly this cycle.";
                }

                report.whyHappening = "Successful fulfillment of major garment batches or seasonal territory shifts.";
                report.actions = [
                    "Lock in shipping capacity for the next cycle.",
                    "Diversify buyer regions to spread risk."
                ];
                break;
            }

            case 'staffing':
            case 'regions':
            case 'buyers': {
                const maxNode = data.reduce((prev, current) => (prev.value > current.value) ? prev : current);
                const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0);
                const concentration = ((maxNode.value / total) * 100).toFixed(1);

                report.status = "Stable";
                report.currentStatus = `Primary sector detected: ${maxNode.name} with a value of ${maxNode.value}.`;
                report.observedTrend = `This node represents ${concentration}% of the total distribution. Resource allocation remains ${concentration > 50 ? 'heavily concentrated' : 'well-distributed'}.`;

                if (concentration > 60) {
                    report.criticalSignals = `HIGH CONCENTRATION: Over 60% of resources are localized in ${maxNode.name}. Suggests potential dependency or single-node risk.`;
                }

                report.whyHappening = "Historical department scaling and established regional trade routes.";
                report.actions = [
                    "Audit secondary nodes for growth potential.",
                    "Ensure backup protocols exist for high-dependency sectors."
                ];
                break;
            }

            default: {
                const total = data.reduce((acc, curr) => acc + (curr.value || curr.count || 0), 0);
                report.currentStatus = `Operating at a total volume of ${total} units in this sector.`;
                report.observedTrend = "Metrics are tracking within established historical parameters.";
                report.whyHappening = "Standard operational workflows and steady demand.";
                report.actions = ["Maintain current monitoring rhythm."];
            }
        }

        // Generate the final report string
        const detailedReport = `
SECTION:CURRENT_STATUS
${report.currentStatus}

SECTION:OBSERVED_TREND
${report.observedTrend}

${report.criticalSignals ? `SECTION:CRITICAL_SIGNALS\n${report.criticalSignals}\n` : ''}
SECTION:WHY_HAPPENING
${report.whyHappening}

SECTION:ADMIN_ACTIONS
${report.actions.map(a => `- ${a}`).join('\n')}
        `.trim();

        const downloadReport = `
ADMIN PERFORMANCE AUDIT: ${title ? title.toUpperCase() : 'SYSTEM'}
--------------------------------------------------
CURRENT STATE: ${report.status.toUpperCase()}
SNAPSHOT: ${report.currentStatus}
TREND: ${report.observedTrend}

${report.criticalSignals ? `WARNINGS:\n${report.criticalSignals}\n` : ''}
DATA INTERPRETATION:
${report.whyHappening}

RECOMMENDED PROTOCOLS:
${report.actions.map(a => `- ${a}`).join('\n')}
--------------------------------------------------
Generated by intelligence Core v2.4
        `.trim();

        res.json({
            status: report.status,
            summary: [report.currentStatus, report.observedTrend, report.actions[0]],
            detailedReport,
            downloadReport
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Analysis failure in Intelligence Core." });
    }
});


// @route   GET /api/admin/users
// @desc    Get all system users and approved employees
// @access  Private (Admin)
router.get("/users", auth, role(["ADMIN"]), async (req, res) => {
    try {
        const users = await User.find().select("-password");
        const employees = await Employee.find({ submissionStatus: 'Approved' });

        // Map employees to a format compatible with the UI if they aren't already system users
        const mappedEmployees = employees.map(emp => ({
            _id: emp._id,
            username: emp.employeeId, // Use employee ID as "USER ID"
            name: emp.fullName,
            email: emp.email,
            role: emp.role,
            status: 'VERIFIED',
            isEmployee: true
        }));

        const mappedUsers = users.map(user => ({
            ...user.toObject(),
            isEmployee: false
        }));

        const combined = [...mappedUsers, ...mappedEmployees].sort((a, b) => {
            const dateA = a.submittedAt || a.createdAt; // Assuming users/employees might have these fields for sorting
            const dateB = b.submittedAt || b.createdAt;
            // Fallback to a default date if neither exists, or handle cases where these fields might not be present
            // For now, assuming they might exist or will be undefined, leading to new Date(undefined) which is 'Invalid Date'
            // This sort might need refinement based on actual data structure of users/employees
            return new Date(dateB) - new Date(dateA);
        });

        res.json(combined);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   POST /api/admin/users
// @desc    Create a new system user (Manager/Admin)
// @access  Private (Admin)
router.post("/users", auth, role(["ADMIN"]), async (req, res) => {
    const { username, password, email, name, role } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        user = new User({
            username,
            password, // Note: In a real app, hash this!
            email,
            name,
            role: role || 'MANAGER',
            status: 'VERIFIED'
        });

        await user.save();

        // Log activity
        const activity = new Activity({
            userId: req.user.id,
            action: 'CREATE_USER',
            details: `Created new user: ${username} (${role})`,
            entityType: 'User',
            entityId: user._id
        });
        await activity.save();

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user
// @access  Private (Admin)
router.put("/users/:id", auth, role(["ADMIN"]), async (req, res) => {
    const { name, email, role, status } = req.body;

    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.status = status || user.status;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin)
router.delete("/users/:id", auth, role(["ADMIN"]), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: "User deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   GET /api/admin/contact-inquiries
// @desc    Get all contact inquiries
// @access  Private (Admin)
router.get("/contact-inquiries", auth, role(["ADMIN"]), async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   PATCH /api/admin/contact-inquiries/:id
// @desc    Update inquiry status (Mark as responded)
// @access  Private (Admin)
router.patch("/contact-inquiries/:id", auth, role(["ADMIN"]), async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ msg: "Inquiry not found" });
        }

        inquiry.status = inquiry.status === "new" ? "responded" : "new";
        await inquiry.save();
        res.json(inquiry);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   DELETE /api/admin/contact-inquiries/:id
// @desc    Delete an inquiry (Spam control)
// @access  Private (Admin)
router.delete("/contact-inquiries/:id", auth, role(["ADMIN"]), async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({ msg: "Inquiry not found" });
        }

        await Inquiry.findByIdAndDelete(req.params.id);
        res.json({ msg: "Inquiry purged from system" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;
