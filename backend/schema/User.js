const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true // Ensures no duplicate clientId
  },
  username: {
    type: String,
    required: true,
    trim: true, // Removes extra spaces
    unique: true
  },
  password: {
    type: String,
    required: true,
    trim: true // Removes extra spaces
  },
  role: {
    type: String,
    required: true,
    trim: true 
  },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});


module.exports = mongoose.model('User', userSchema);