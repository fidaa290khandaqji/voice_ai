const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voice_ai';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Restaurant Model ---
const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});

// --- Order Model ---
const OrderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  customerPhone: String,
  items: Array,
  totalPrice: Number,
  status: { type: String, default: 'pending' },
  emotion: String,
  createdAt: { type: Date, default: Date.now }
});

// --- Call Model ---
const CallSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  sid: String,
  from: String,
  transcript: Array,
  emotionSummary: Object,
  createdAt: { type: Date, default: Date.now }
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
const Order = mongoose.model('Order', OrderSchema);
const Call = mongoose.model('Call', CallSchema);

module.exports = { Restaurant, Order, Call };
