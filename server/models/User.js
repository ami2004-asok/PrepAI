const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Guest User',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      default: `guest_${Date.now()}@example.com`,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
