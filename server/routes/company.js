const express = require("express");
const Company = require("../models/Company");
const Submission = require("../models/Submission");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const Activity = require("../models/Activity");

const router = express.Router();

// GET company info (Public: Approved only)
router.get("/", async (req, res) => {
  try {
    const company = await Company.findOne({ status: 'APPROVED' }).sort({ version: -1 });
    res.json(company || {});
  } catch (error) {
    res.status(500).json({ message: "Error fetching company data" });
  }
});

// GET all versions for manager
router.get("/all", auth, role(['MANAGER', 'ADMIN']), async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching company versions" });
  }
});

// POST company info (Manager/Admin)
router.post("/", auth, role(['MANAGER', 'ADMIN']), async (req, res) => {
  try {
    const { submit, ...formData } = req.body;

    // Check if there's already a PENDING submission
    const existingPending = await Company.findOne({ status: 'PENDING' });
    if (existingPending && submit) {
      return res.status(400).json({ message: "A submission is already pending admin approval." });
    }

    // Get the latest version number
    const latestVersion = await Company.findOne().sort({ version: -1 });
    const nextVersion = latestVersion ? latestVersion.version + (submit ? 1 : 0) : 1;

    // Create new version document
    const company = new Company({
      ...formData,
      submittedBy: req.user.id,
      status: submit ? 'PENDING' : 'DRAFT',
      version: nextVersion
    });

    await company.save();
    
    if (submit) {
      const submission = new Submission({
        managerId: req.user.id,
        entityType: 'Company',
        entityId: company._id,
        dataSnapshot: {
          name: company.name,
          description: company.description,
          establishedYear: company.establishedYear,
          location: company.location,
          version: company.version
        }
      });
      await submission.save();
    }

    const activity = new Activity({
      userId: req.user.id,
      action: submit ? 'Submitted' : 'Created',
      entityType: 'Company',
      entityId: company._id,
      details: `Company Profile: ${company.name} (v${company.version})`
    });
    await activity.save();

    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving company data" });
  }
});

module.exports = router;
