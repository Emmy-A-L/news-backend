const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const fetchNews = require("./jobs/fetchNews");
const articleRoutes = require("./routes/articles");
const contactRoute = require("./routes/contactRoute")
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(morgan("combined")); // Production logging

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect to database
connectDB().catch(console.error);

// Routes
app.use("/api/articles", articleRoutes);
app.use("/api", contactRoute)

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

// Schedule news fetching every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  try {
    console.log("Running scheduled news fetch...");
    await fetchNews();
  } catch (error) {
    console.error("News fetch failed:", error);
  }
});

// Initial fetch on startup
fetchNews().catch(console.error);

// Unhandled rejection handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // In production, you might want to exit and let your process manager restart the app
  // process.exit(1);
});

// Uncaught exception handler
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // In production, you might want to exit and let your process manager restart the app
  // process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

module.exports = app;
