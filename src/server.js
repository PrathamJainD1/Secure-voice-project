// --- Imports ---
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { default: open } = require("open");
const connectDB = require("./config/db");

// --- Load environment variables ---
dotenv.config();

// --- Validate Email Environment Variables ---
const requiredEmailVars = ['EMAIL_USER', 'EMAIL_PASS', 'SECURE_VOICE_EMAIL'];
const missingEmailVars = requiredEmailVars.filter(varName => !process.env[varName]);

if (missingEmailVars.length > 0) {
  console.warn('⚠️  WARNING: Email functionality may not work. Missing environment variables:', missingEmailVars.join(', '));
  console.warn('📧 Please set EMAIL_USER, EMAIL_PASS, and SECURE_VOICE_EMAIL in your .env file');
} else {
  console.log('✅ Email environment variables are configured');
}

// --- Initialize Express ---
const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- MongoDB Connection ---
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/secure-voice";

connectDB(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// --- Import Routes ---
const authRoutes = require("./routes/auth");
const resourceRoutes = require("./routes/resources");
const reportRoutes = require("./routes/reportRoutes"); // ✅ updated to new route file

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/reports", reportRoutes); // ✅ now uses controller-based logic

// --- Health Check (for debugging) ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// --- Serve Frontend Files ---
const frontendPath = path.join(__dirname, "../public");
app.use(express.static(frontendPath));

// --- Serve index.html for root ---
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --- ✅ Catch-All Route (for SPA routing) ---
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ message: "API endpoint not found" });
  } else {
    res.sendFile(path.join(frontendPath, "index.html"));
  }
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// --- ✅ Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Health Check → http://localhost:${PORT}/api/health`);
  console.log(`🏠 Frontend served from → ${frontendPath}`);

  try {
    await open(`http://localhost:${PORT}`);
    console.log("🌍 Browser opened automatically");
  } catch (err) {
    console.error("⚠️ Could not open browser automatically:", err.message);
  }
});
