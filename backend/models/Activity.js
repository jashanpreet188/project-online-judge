const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['login', 'logout', 'problem_view', 'submission', 'profile_update'],
    required: true 
  },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  details: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);