const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Route Imports
const companyRoutes = require("./routes/company");
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const operationalRoutes = require("./routes/operational");
const employeeRoutes = require("./routes/employees");
const projectRoutes = require("./routes/projects");
const reportRoutes = require("./routes/reports");
const approvalRoutes = require("./routes/approvals");
const adminRoutes = require("./routes/admin");
const mediaRoutes = require("./routes/media");
const updateRoutes = require("./routes/updates");
const contactRoutes = require("./routes/contact");
const mlRoutes = require("./routes/ml");

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://garment-portfolio.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Debug Log for Route Registration
console.log("-----------------------------------------");
console.log("Initializing Intelligent Backend Core...");
console.log("-----------------------------------------");

// API Route Registration
app.use("/api/auth", authRoutes);
console.log("✅ Authenticator Core: /api/auth");

app.use("/api/company", companyRoutes);
console.log("✅ Corporate Registry: /api/company");

app.use("/api/products", productRoutes);
console.log("✅ Inventory Protocol: /api/products");

app.use("/api/operational", operationalRoutes);
console.log("✅ Operation Stream: /api/operational");

app.use("/api/employees", employeeRoutes);
console.log("✅ Personnel Matrix: /api/employees");

app.use("/api/projects", projectRoutes);
console.log("✅ Project Registry: /api/projects");

app.use("/api/reports", reportRoutes);
console.log("✅ Analytics Engine: /api/reports");

app.use("/api/approvals", approvalRoutes);
console.log("✅ Consensus Center: /api/approvals");

app.use("/api/admin", adminRoutes);
console.log("✅ Executioner Shell: /api/admin");

app.use("/api/media", mediaRoutes);
console.log("✅ Digital Assets: /api/media");

app.use("/api/updates", updateRoutes);
console.log("✅ Intelligence Feed: /api/updates");

app.use("/api/contact", contactRoutes);
console.log("✅ External Nexus: /api/contact");

app.use("/api/ml", mlRoutes);
console.log("✅ Machine Intelligence Proxy: /api/ml");

app.use("/api/dashboard", require("./routes/dashboard"));
console.log("✅ Dashboard Hub: /api/dashboard");

console.log("-----------------------------------------");
console.log("All systems online and routing clear.");
console.log("-----------------------------------------");

// ✅ Robust MongoDB Connection for Production
(async () => {
    try {
        console.log("-----------------------------------------");
        console.log("Attempting database synchronization...");
        
        // Hide sensitive password in logs but show the target
        const maskedUri = (process.env.MONGODB_URI || "").replace(/:([^@]+)@/, ":****@");
        console.log(`Connection target identifies as: ${maskedUri}`);

        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB Connected ✅ (Status: 1/1 Online)");
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("MongoDB Connection Failed ❌ (Critical Fault)");
        console.error("Error Blueprint:", err.message);
        console.log("-----------------------------------------");
        // process.exit(1); // Optional: Stop server if DB is essential
    }
})();

// Test route
app.get("/", (req, res) => {
  res.send("Intelligent Portfolio Backend: Production Service v2.4 Active");
});

// JSON 404 Handler for undefined routes
app.use((req, res) => {
  console.warn(`404: Route detection failure at: ${req.originalUrl}`);
  res.status(404).json({ 
    error: "Resource not found at this node.",
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server successfully listening on port ${PORT}`);
});