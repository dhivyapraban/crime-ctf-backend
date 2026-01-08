const mongoose = require('mongoose');

const hintSchema = new mongoose.Schema({
  text: { type: String, required: true },
  pointDeduction: { type: Number, required: true },
  released: { type: Boolean, default: false }
});

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, required: true },
  points: { type: Number, required: true },
  flag: { type: String, required: true },
  hints: [hintSchema],
  attachmentType: { type: String, enum: ['file', 'link'] },
  attachmentName: String,
  attachmentUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Case', caseSchema);
