const mongoose = require('mongoose');

const weekSchema = new mongoose.Schema({
  week: { type: String, required: true }, // e.g., 'Week 1'
  topics: { type: [String], default: [] },
  resources: { type: [String], default: [] },
  tasks: { type: [String], default: [] },
  miniProjects: { type: [String], default: [] },
});

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeAnalysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResumeAnalysis',
      required: true,
    },
    missingSkills: {
      type: [String],
      required: true,
    },
    weeks: [weekSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
