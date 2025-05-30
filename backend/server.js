const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const userRoutes = require('./routes/userroutes.js');
const teacherRoutes = require('./routes/teacherroutes.js');
const studentRoutes = require('./routes/studentroutes.js');
const sectionRoutes = require('./routes/sectionroutes.js');
const subsectionRoutes = require('./routes/subsectionroutes.js');

// Load environment variables
dotenv.config();

// Create the Express app
const app = express();

// Middleware
app.use(cors());  // For Cross-Origin Resource Sharing
app.use(express.json());  // To parse JSON bodies
mongoose.set('debug',true);


// Database connection

const URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.PASSWORD}@cluster0.myzmy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
// 127.0.0.1 instead of localhost to force ipv4
try{
    mongoose.connect(URI);
    console.log("Connected to MongoDB")
}
catch(err){
    console.log(err);
}
// Routes
app.use('/api/user', userRoutes);        // User management routes
app.use('/api/teacher', teacherRoutes);  // Teacher management routes
app.use('/api/student', studentRoutes);  // Student management routes
app.use('/api/section', sectionRoutes);  // Section management routes
app.use('/api/subsection', subsectionRoutes)


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
