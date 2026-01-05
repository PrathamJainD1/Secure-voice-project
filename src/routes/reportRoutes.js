// routes/reportRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const reportController = require("../controllers/reportController");

/* ======================================================
   ✅ Ensure Upload Directory Exists
   ------------------------------------------------------ */
const uploadDir = path.join(__dirname, "../uploads/evidence");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created uploads directory:", uploadDir);
}

/* ======================================================
   ✅ Multer Storage Configuration
   ------------------------------------------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10MB per file
  },
});

/* ======================================================
   ✅ ROUTES
   ------------------------------------------------------ */

/**
 * ✅ POST /api/reports
 * Submit a new report with optional evidence files
 */
router.post(
  "/",
  upload.array("evidenceFiles", 5), // Accept max 5 files
  reportController.createReport
);

/**
 * ✅ GET /api/reports
 * Fetch all reports created by a user (userId in query)
 */
router.get("/", reportController.getUserReports);

/**
 * ✅ GET /api/reports/:caseId
 * Track a specific report using its unique case ID
 */
router.get("/:caseId", reportController.trackReport);

module.exports = router;
/**
 * ✅ GET /api/reports/authority/:caseId
 * Authority view - Get report and auto-update status to "under_review"
 */
router.get("/authority/:caseId", reportController.getAuthorityReport);

/**
 * ✅ PATCH /api/reports/:caseId/status
 * Update report status (for authorities)
 */
router.patch("/:caseId/status", reportController.updateReportStatus);