// controllers/reportController.js

const Report = require("../models/Report");
const { sendComplaintEmail, sendConfirmationEmail } = require("../services/sendEmail");

// ✅ Create new report
exports.createReport = async (req, res) => {
  try {
    const {
      userId,
      category,
      title,
      description,
      incidentDate,
      location,
      isAnonymous,
      name,
      email,
      phone,
    } = req.body;

    // ✅ Validate required fields
    if (!category || !title || !description || !incidentDate || !location) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    // ✅ Safely convert isAnonymous into boolean
    const anonymousStatus =
      isAnonymous === "true" || isAnonymous === true ? true : false;

    // ✅ Handle uploaded evidence files
    const evidenceFiles = Array.isArray(req.files)
      ? req.files.map((file) => ({
          filename: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
        }))
      : [];

    // ✅ Create new report document
    const newReport = new Report({
      userId: anonymousStatus ? null : userId || null,
      category,
      title,
      description,
      incidentDate,
      location,
      isAnonymous: anonymousStatus,
      evidenceFiles,
    });

    // ✅ Save report
    await newReport.save();

    console.log(`✅ Report saved to database - Case ID: ${newReport.caseId}`);

    // ✅ Send email notification to authorities
    let emailSentToAuthorities = false;
    let emailSentToReporter = false;

    try {
      const complaintData = {
        name: anonymousStatus ? "Anonymous Reporter" : (name || "Not provided"),
        email: email || "Not provided",
        phone: phone || "Not provided",
        complaintType: category,
        description: `${title}\n\n${description}`,
        location,
        incidentDate,
        files: evidenceFiles,
      };

      // Send to authorities with caseId
      console.log("📧 Attempting to send email to authorities...");
      const emailSent = await sendComplaintEmail(complaintData, newReport.caseId);

      if (emailSent) {
        console.log("✅ Report email sent to authorities");
        emailSentToAuthorities = true;

        // Send confirmation email to reporter (if email provided and not anonymous)
        if (email && !anonymousStatus) {
          try {
            console.log("📧 Attempting to send confirmation email to reporter...");
            await sendConfirmationEmail(email, complaintData);
            console.log("✅ Confirmation email sent to reporter");
            emailSentToReporter = true;
          } catch (confirmError) {
            console.error("⚠️ Failed to send confirmation email:", confirmError.message);
          }
        }
      } else {
        console.error("⚠️ Failed to send email to authorities - check email configuration");
      }
    } catch (emailError) {
      console.error("❌ Email error:", emailError.message);
      console.error("❌ Email stack:", emailError.stack);
    }

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully!",
      caseId: newReport.caseId,
      emailSent: emailSentToAuthorities,
    });
  } catch (error) {
    console.error("❌ Error creating report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit report. Please try again later.",
      error: error.message,
    });
  }
};

// ✅ Fetch all reports by a specific user (or all if no userId)
exports.getUserReports = async (req, res) => {
  try {
    const { userId } = req.query;

    const filter = userId ? { userId } : {};
    const reports = await Report.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("❌ Error fetching reports:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching reports",
      error: error.message,
    });
  }
};

// ✅ Track report by caseId
exports.trackReport = async (req, res) => {
  try {
    const { caseId } = req.params;

    if (!caseId) {
      return res.status(400).json({
        success: false,
        message: "Case ID is required",
      });
    }

    const report = await Report.findOne({ caseId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("❌ Error tracking report:", error);
    return res.status(500).json({
      success: false,
      message: "Error tracking report",
      error: error.message,
    });
  }
};

// ✅ Get all reports (for admin/authority view)
exports.getAllReports = async (req, res) => {
  try {
    const { status, category, limit = 50 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("❌ Error fetching all reports:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching reports",
      error: error.message,
    });
  }
};

// ✅ Authority view - Get report and auto-update to "under_review"
exports.getAuthorityReport = async (req, res) => {
  try {
    const { caseId } = req.params;

    if (!caseId) {
      return res.status(400).json({
        success: false,
        message: "Case ID is required",
      });
    }

    // Find the report
    const report = await Report.findOne({ caseId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // ✅ Auto-update status to "under_review" if it's still "pending"
    if (report.status === "pending") {
      report.status = "under_review";
      await report.save();
      console.log(`✅ Report ${caseId} status updated to "under_review"`);
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("❌ Error fetching authority report:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching report",
      error: error.message,
    });
  }
};

// ✅ Update report status (for authorities)
exports.updateReportStatus = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status, notes } = req.body;

    if (!caseId || !status) {
      return res.status(400).json({
        success: false,
        message: "Case ID and status are required",
      });
    }

    const validStatuses = ["pending", "under_review", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const updateData = { status };
    if (notes) {
      updateData.$push = { updates: { message: notes } };
    }

    const report = await Report.findOneAndUpdate(
      { caseId },
      updateData,
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    console.log(`✅ Report ${caseId} status updated to "${status}"`);

    return res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      report,
    });
  } catch (error) {
    console.error("❌ Error updating report status:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating report status",
      error: error.message,
    });
  }
};