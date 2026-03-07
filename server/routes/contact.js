const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("mongo-sanitize");
const nodemailer = require("nodemailer");
const Inquiry = require("../models/Inquiry");

// Rate limiting: 5 inquiries per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { msg: "Too many inquiries from this IP, please try again after an hour." }
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @route   POST /api/contact
// @desc    Submit a contact inquiry
// @access  Public
router.post(
  "/",
  contactLimiter,
  [
    body("name", "Identity is required").not().isEmpty().trim().escape(),
    body("email", "Please include a valid electronic mail").isEmail().normalizeEmail(),
    body("message", "Inquiry context is required").not().isEmpty().trim().escape(),
    body("company").optional().trim().escape(),
    body("phone").optional().trim().escape(),
    body("subject").optional().trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Sanitize input
    const sanitizedData = mongoSanitize(req.body);
    const { name, email, company, phone, subject, message } = sanitizedData;

    try {
      // 1. Save to Database
      const newInquiry = new Inquiry({
        name,
        email,
        company,
        phone,
        subject,
        message
      });

      await newInquiry.save();

      // 2. Send Email Notification
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.COMPANY_EMAIL,
        subject: `New Business Inquiry: ${subject || "No Subject"}`,
        html: `
          <h3>New Inquiry from VR FASHIONS Portal</h3>
          <p><strong>Identity:</strong> ${name}</p>
          <p><strong>Electronic Mail:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company || "N/A"}</p>
          <p><strong>Phone:</strong> ${phone || "N/A"}</p>
          <p><strong>Subject:</strong> ${subject || "N/A"}</p>
          <p><strong>Context/Message:</strong></p>
          <p>${message}</p>
          <hr />
          <p>This inquiry has been logged in the system database at ${new Date().toLocaleString()}.</p>
        `
      };

      // We don't want to block the response for the email sending process, 
      // but we should handle its outcome for logging.
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email notification failed:", error);
        } else {
          console.log("Email notification sent:", info.response);
        }
      });

      res.status(201).json({ msg: "Your inquiry has been documented. Return communication expected within 24hr." });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server Protocol Error. Please try again later." });
    }
  }
);

module.exports = router;
