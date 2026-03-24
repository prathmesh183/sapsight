const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth");
const Dataset = require("../models/Dataset");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// Upload CSV
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const results = [];
    const filePath = path.join(__dirname, "../uploads", req.file.filename);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        const columns = results.length > 0 ? Object.keys(results[0]) : [];

        const dataset = new Dataset({
          userId: req.user.id,
          filename: req.file.filename,
          originalName: req.file.originalname,
          columns,
          rows: results
        });

        await dataset.save();
        fs.unlinkSync(filePath);

        res.json({ message: "File uploaded successfully", dataset });
      });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// Get all datasets for user
router.get("/", auth, async (req, res) => {
  try {
    const datasets = await Dataset.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
    res.json(datasets);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single dataset
router.get("/:id", auth, async (req, res) => {
  try {
    const dataset = await Dataset.findOne({ _id: req.params.id, userId: req.user.id });
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });
    res.json(dataset);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete dataset
router.delete("/:id", auth, async (req, res) => {
  try {
    await Dataset.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Dataset deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;