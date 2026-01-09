const express = require("express");
const path = require("path");
const cors = require("cors");
const compression = require("compression"); // Added compression
const rateLimit = require("express-rate-limit");
const connectDb = require("./config/db");

const app = express();

// Database connection
connectDb();
app.set("trust proxy", 1);
// Global middleware
app.use(cors());
app.use(express.json());
app.use(compression()); // Enable compression globally (JS/CSS/HTML will be smaller)

// Global rate limiter (moderate limits)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // allow up to 500 requests per IP per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many auth attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for order/payment routes
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many order requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Serve static files with caching for 1 year
app.use(
  express.static(path.join(__dirname, "dist"), {
    maxAge: "1y",
    etag: true,
  })
);

// PDFs (optional caching, shorter period maybe)
/*app.use(
  "/pdfs",
  express.static(path.join(__dirname, "pdfs"), {
    maxAge: "30d", // cache PDFs for 30 days
    etag: true,
  })
);*/

// Import route modules
const authRoutes = require("./routes/authRoutes");
const billRoutes = require("./routes/billRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productCategoryRoutes = require("./routes/productCategoryRoutes");
const subcategoryRoutes = require("./routes/subCategoryRoutes");
const addressRoutes = require("./routes/addressRoutes");
const employeeRoleRoutes = require("./routes/employeeRoleRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const branchTypeRoutes = require("./routes/branchTypeRoutes");
const seatRoutes = require("./routes/seatRoutes");
// Routes
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/orders", orderLimiter, orderRoutes);
app.use("/api/v1/branch-types", branchTypeRoutes);
app.use("/api/v1/seats", seatRoutes);
// Other API routes
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/product-categories", productCategoryRoutes);
app.use("/api/v1/subcategories", subcategoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/walkins", require("./routes/walkinRoutes"));
// Admin routes
app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/admin/categories", require("./routes/admin/categories"));
app.use("/api/v1/admin/services", require("./routes/admin/services"));
app.use("/api/v1/admin/rooms", require("./routes/admin/rooms"));
app.use("/api/v1/admin/branches", require("./routes/admin/branchRoutes"));
app.use("/api/v1/admin/employee-roles", employeeRoleRoutes);

// Bills route
app.use("/api/v1/bills", billRoutes);

// SPA routing fallback
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
