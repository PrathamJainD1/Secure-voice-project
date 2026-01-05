const mongoose = require("mongoose");

// ============================
// Report Schema
// ============================
const reportSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // optional for anonymous reports
    },

    // ✅ Expanded to include all categories your frontend may send
    category: {
      type: String,
      required: true,
      enum: [
        "cyberbullying",
        "harassment",
        "child abuse",
        "theft",
        "blackmail",
        "corruption",
        "discrimination",      
        "Safety Concerns / Threats",  
        "policy_violation",    
        "other",
      ],
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
    },

    // ✅ Required fields from backend validation errors
    incidentDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "Incident date cannot be in the future.",
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // ✅ Clearer, modernized set of possible report states
    status: {
      type: String,
      enum: ["pending", "under_review", "sent", "resolved", "closed"],
      default: "pending",
    },

    // Attachments / Evidence
    evidenceFiles: [
      {
        filename: String,
        path: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Authority updates or messages
    updates: [
      {
        message: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Authorities the report was sent to
    forwardedTo: {
      type: [String],
      default: [],
    },

    // Optional email confirmation tracking ID
    emailConfirmationId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt
  }
);

// ============================
// Auto-generate unique Case ID
// ============================
reportSchema.pre("save", async function (next) {
  if (!this.caseId) {
    let caseId;
    let exists = true;

    while (exists) {
      caseId =
        "CASE-" +
        Math.floor(Math.random() * 1_000_000)
          .toString()
          .padStart(6, "0");
      exists = await mongoose.model("Report").exists({ caseId });
    }

    this.caseId = caseId;
  }

  next();
});

module.exports = mongoose.model("Report", reportSchema);