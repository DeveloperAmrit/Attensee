const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true        // assuming student email is not mandatory
    },
    department: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    faceimageurl: {
        type: String,
        required: true
    },
    admissionYear: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    assignedSections: {
        type: [String], // Assuming it's an array of section IDs or names
        default: []
    },
    encoding: {
        type: [Number],
        default: []
    }
});

module.exports = mongoose.model('Student', studentSchema);
