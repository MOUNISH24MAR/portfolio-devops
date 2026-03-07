const express = require("express");
const Product = require("../models/Product");
const Submission = require("../models/Submission");
const Activity = require("../models/Activity");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

// @route   GET /api/products
// @desc    Get approved products for public portfolio
// @access  Public
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ submissionStatus: 'Approved' }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// @route   GET /api/products/all
// @desc    Get all products for managers/admins
// @access  Private
router.get("/all", auth, role(['MANAGER', 'ADMIN']), async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all products" });
  }
});

// @route   POST /api/products
// @desc    Add a product (Manager/Admin)
// @access  Private
router.post("/", auth, role(["MANAGER", "ADMIN"]), async (req, res) => {
  try {
    const { name, category, description, image, submit } = req.body;
    
    // If admin, default to Approved. If manager, default based on submit flag.
    const status = req.user.role === 'ADMIN' ? 'Approved' : (submit ? 'PendingApproval' : 'Draft');

    const product = new Product({
      name, category, description, image,
      managerId: req.user.id,
      submissionStatus: status
    });

    await product.save();

    if (status === 'PendingApproval') {
      const submission = new Submission({
        managerId: req.user.id,
        entityType: 'Product',
        entityId: product._id,
        dataSnapshot: product.toObject()
      });
      await submission.save();
    }

    const activity = new Activity({
      userId: req.user.id,
      action: status === 'PendingApproval' ? 'Submitted' : (status === 'Approved' ? 'Created' : 'Drafted'),
      entityType: 'Product',
      entityId: product._id,
      details: `Product: ${name}`
    });
    await activity.save();

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving product" });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (Protected: Admin)
// @access  Private (Admin)
router.delete("/:id", auth, role(["ADMIN"]), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    await Product.findByIdAndDelete(req.params.id);

    const activity = new Activity({
      userId: req.user.id,
      action: 'Deleted',
      entityType: 'Product',
      entityId: product._id,
      details: `Product: ${product.name}`
    });
    await activity.save();

    res.json({ msg: "Product removed from portfolio" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;