const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  resetPasswordToken: {
    type: String,
    default: null
  },

  resetPasswordExpire: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);