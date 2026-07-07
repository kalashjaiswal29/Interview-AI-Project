const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['question', 'answer'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  jobRole: { type: String, required: true },
  messages: [messageSchema],
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  questionCount: { type: Number, default: 0 },
  feedback: {
    score: Number,
    strengths: [String],
    improvements: [String],
    summary: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
