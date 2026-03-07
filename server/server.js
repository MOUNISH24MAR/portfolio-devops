const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

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

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/products", productRoutes);
app.use("/api/operational", operationalRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/updates", updateRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/dashboard", require("./routes/dashboard"));


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/garment-portfolio")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});