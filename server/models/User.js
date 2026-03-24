const mongoose = require("mongoose");

const DatasetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  columns: [String],
  rows: [mongoose.Schema.Types.Mixed],
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Dataset || mongoose.model("Dataset", DatasetSchema);