const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerPhone: String,
  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalPrice: Number,
  status: {
    type: String,
    enum: ['pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  emotion: String, // Emotion detected during order
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
