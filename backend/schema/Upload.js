const mongoose = require('mongoose')

const uploadSchema = new mongoose.Schema({
    uploadId: {
        type: String,
        required: true,
        unique: true
    },
    subsectionId: {
        type: String,
        required: true,
    },
    uploadedBy: {
        type: String,
        default: ''
    },
    presentStudents: {
        type: [{
            rollNumber: {type: String, required: true},
            alertState: {type: String, default: 'active'}              // two states active, passive 
        }],
        default: []
    },
    dateTime: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('Upload', uploadSchema)