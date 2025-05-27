const mongoose = require('mongoose');

const subsectionSchema = new mongoose.Schema({
  subsectionId: {
    type: String,
    required: true,
    unique: true
  },
  sectionId: {
    type: String,  // match Section.sectionId
    required: true
  },
  assignedTeachers: {
    type: [String], // assuming they reference Teacher documents
    default: []
  },
  name: {
    type: String,
    required: true
  },
  studentRolls: {
    type: [String], // assuming roll numbers are stored as strings
    default: []
  },
}, { timestamps: true });

module.exports = mongoose.model('SubSection', subsectionSchema);
