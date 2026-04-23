const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema({
  sid: String,
  from: String,
  transcript: [
    {
      role: String, // 'customer' or 'ai'
      text: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  emotionSummary: {
    happy: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 }
  },
  duration: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Call', CallSchema);
