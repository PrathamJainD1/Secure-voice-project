const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { body, validationResult } = require("express-validator");
const Report = require("../models/Report");
const { authMiddleware, optionalAuth } = require("../middleware/auth");
const { sendReportEmail } = require("../services/emailService"); // <- new service

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// --- POST /reports ---
router.post(
  "/",
  optionalAuth,
  upload.array("evidence", 5),
  [
    body("category").isIn([
      "cyberbullying",
      "harassment",
      "child abuse",
      "theft",
      "blackmail",
      "corruption",
      "other"
    ]).withMessage("Invalid category"),
    body("title")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Title must be at least 5 characters"),
    body("description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("incidentDate")
      .isISO8601()
      .custom(value => value <= new Date().toISOString())
      .withMessage("Incident date cannot be in the future"),
    body("location").trim().notEmpty().withMessage("Location is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ 
          error: "Validation failed", 
          details: errors.array() 
        });
      }

      const { category, title, description, incidentDate, location, isAnonymous } = req.body;

      const evidenceFiles = req.files?.map((file) => ({
        filename: file.originalname,
        path: file.path,
        uploadedAt: new Date(),
      })) || [];

      const report = new Report({
        userId: isAnonymous === "true" || !req.userId ? null : req.userId,
        category,
        title,
        description,
        incidentDate,
        location,
        isAnonymous: isAnonymous === "true",
        evidenceFiles,
        status: "sent", // Mark as sent
      });

      await report.save();

      // Send email to authorities using emailService.js
      const authorityEmails = process.env.AUTHORITY_EMAILS?.split(",") || [];
      if (authorityEmails.length) {
        const emailId = await sendReportEmail(report, authorityEmails);
        report.forwardedTo = authorityEmails;
        report.emailConfirmationId = emailId; // store message ID for tracking
        await report.save();
      }

      res.status(201).json({
        message: "✅ Report submitted successfully",
        report: { id: report._id, caseId: report.caseId, status: report.status },
      });
    } catch (error) {
      console.error("❌ Report creation error:", error);
      res.status(500).json({ error: "Failed to submit report" });
    }
  }
);

// --- GET /reports/my-reports ---
router.get("/my-reports", authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("-evidenceFiles");
    res.json({ reports });
  } catch (error) {
    console.error("❌ Fetch reports error:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// --- GET /reports/:id ---
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id });
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json({ report });
  } catch (error) {
    console.error("❌ Fetch single report error:", error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

module.exports = router;
