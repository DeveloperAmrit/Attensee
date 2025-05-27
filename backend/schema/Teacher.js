const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    teacherId: {
        type: String,
        required: true,
        unique: true
    },
    faceimageurl: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
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

module.exports = mongoose.model('Teacher', teacherSchema);
