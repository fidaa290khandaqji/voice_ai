const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voice_ai';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const OrderSchema = new mongoose.Schema({
  customerPhone: String,
  items: Array,
  totalPrice: Number,
  status: { type: String, default: 'pending' },
  emotion: String,
  createdAt: { type: Date, default: Date.now }
});

const CallSchema = new mongoose.Schema({
  sid: String,
  from: String,
  transcript: Array,
  emotionSummary: Object,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);
const Call = mongoose.model('Call', CallSchema);

module.exports = { Order, Call };
