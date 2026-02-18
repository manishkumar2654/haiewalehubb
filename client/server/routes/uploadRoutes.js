const express = require("express");
const multer = require("multer");
const { cloudinary } = require("../config/cloudinary");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

// Configure multer for temporary storage
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory (no temp files)
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Authenticated route for uploads
router.post(
  "/",
  protect,
  restrictTo("admin"), // Only admins can upload
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Upload to Cloudinary
      cloudinary.uploader
        .upload_stream(
          {
            folder: "ecommerce-products",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              return res.status(500).json({ message: "Image upload failed" });
            }
            res.json({
              success: true,
              imageUrl: result.secure_url,
            });
          }
        )
        .end(req.file.buffer);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Server error during upload" });
    }
  }
);

module.exports = router;
