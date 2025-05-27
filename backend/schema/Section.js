const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  sectionId: {
    type: String,
    required: true,
    unique: true
  },
  year: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  subsections: {
    type: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true }
      }
    ],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Section', sectionSchema);
