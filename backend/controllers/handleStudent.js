const Student = require('../schema/Student.js');
const User = require('../schema/User');
const Section = require('../schema/Section.js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const axios = require('axios');
const { validateImageUrl } = require('../utils/validateURL.js');
const Upload = require('../schema/Upload.js');
const SubSection = require('../schema/SubSection.js');

async function handleCreateStudent(req, res) {
    const { userId, name, email, department, year, faceimageurl, admissionYear, rollNumber, username, password } = req.body;

    const existing = await Student.findOne({ userId: userId });
    if (existing) return res.status(400).json({ msg: 'Student exists', isCreated: false });

    const existingUser = await User.findOne({ username: username });
    if (existingUser) return res.status(400).json({ message: "Username already exists", isCreated: false });

    try {

        const isValidURL = validateImageUrl(faceimageurl);
        if (!isValidURL) {
            return res.status(500).json({ message: "Invalid face image url", isCreated: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const student = await Student.create({ userId, name, email, department, year, faceimageurl, admissionYear, rollNumber });
        const user = await User.create({ username, password: hashedPassword, userId, role: "student" });

        try {
            await registerStudentFace(rollNumber, faceimageurl);
            return res.json({ msg: 'Student created', student: student, isCreated: true });
        } catch (err) {
            console.error("Face registration failed:", err);
            // Cleanup: Delete student and user if face registration fails
            await Student.findByIdAndDelete(student._id);
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({ message: "Error registering student face", isCreated: false });
        }

    } catch (err) {
        console.error("Error creating student/user:", err);
        return res.status(500).json({ message: 'Error while creating student', isCreated: false });
    }
}


async function handleGetStudent(req, res) {
    const { userId, rollNumber } = req.body;
    const query = {};
    if (userId) query.userId = userId;
    else if (rollNumber) query.rollNumber = rollNumber;

    try {
        const student = await Student.findOne(query);
        res.status(200).json({ student: student, message: 'Student fetched successfully', isSuccess: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error while fetching Student', isSuccess: false });
    }
}

async function handleGetAllStudents(req, res) {
    try {
        const students = await Student.find();
        res.status(200).json({ students: students, message: 'Students fetched successfully', isSuccess: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error fetching Students', isSuccess: false });
    }
}


async function handleUploadStudents(req, res) {
    console.log("Upload Students called");
    try {
        const students = req.body.data;
        const existingUsers = await User.find();
        const existingUsernames = existingUsers.map(user => user.username);

        const newStudents = students.filter(student => !existingUsernames.includes(student.username));
        const fails = [];

        for (const student of newStudents) {
            const hashedPassword = await bcrypt.hash(student.password, 10);
            const userId = crypto.randomUUID();

            const studentData = {
                userId,
                name: student.name,
                rollNumber: student.rollNumber,
                email: student.email,
                department: student.department,
                year: student.year,
                faceimageurl: student.faceimageurl,
                admissionYear: student.admissionYear,
                username: student.username,
                password: hashedPassword,
            };

            const userData = {
                username: student.username,
                password: hashedPassword,
                userId,
                role: "student",
            };

            try {
                const rollNumber = student.rollNumber
                const faceimageurl = student.faceimageurl
                const isValidURL = validateImageUrl(faceimageurl);
                if (!isValidURL) {
                    throw new Error("Invalid face image url")
                }
                const createdStudent = await Student.create(studentData);
                await registerStudentFace(rollNumber, faceimageurl);
                try {
                    await User.create(userData);
                } catch (userErr) {
                    // Roll back student if user creation fails
                    await Student.deleteOne({ _id: createdStudent._id });
                    fails.push(student); // Push original object
                    console.log("Error creating user:", userErr);
                }
            } catch (studentErr) {
                fails.push(student); // Push original object
                console.log("Error creating student:", studentErr);
            }
        }

        res.status(200).json({
            message: "Upload process completed",
            failedUploads: fails,
            isSuccess: fails.length === 0,
        });

    } catch (err) {
        console.error("Error in upload process:", err);
        res.status(500).json({
            message: err.message,
            isSuccess: false,
        });
    }
}

async function handleDeleteStudent(req, res) {
    const { rollNumber } = req.body;
    try {
        const student = await Student.findOneAndDelete({ rollNumber: rollNumber });
        if (!student) return res.status(404).json({ message: 'Student not found', isDeleted: false });
        await User.deleteOne({ userId: student.userId });
        res.status(200).json({ message: 'Student deleted successfully', isDeleted: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error while deleting student', isDeleted: false });
    }
}

async function handleGetByRolls(req, res) {
    try {
        const { rollNumbers } = req.body;

        if (!Array.isArray(rollNumbers) || rollNumbers.length === 0) {
            return res.status(400).json({ error: 'rollNumbers must be a non-empty array.' });
        }

        const students = await Student.find({ rollNumber: { $in: rollNumbers } });

        res.status(200).json({ students });
    } catch (error) {
        console.error('Error fetching students by roll numbers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function registerStudentFace(rollNumber, faceimageurl) {
    try {
        const response = await axios.post('http://127.0.0.1:5001/register_face', {
            rollNumber: rollNumber,
            image_url: faceimageurl
        });

        console.log(response.data);
        return response.data;
    } catch (err) {
        console.error("Face registration failed:", err.response?.data || err.message);
        throw err;
    }
}

async function handleGetStudentSections(req, res) {
    try {
        const { username } = req.body;

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find the student
        const student = await Student.findOne({ userId: user.userId });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        const assignedSubsections = student.assignedSections;

        // Get sections that contain at least one matching subsection
        const sections = await Section.find({
            subsections: {
                $elemMatch: {
                    id: { $in: assignedSubsections }
                }
            }
        });

        // Filter subsections in each section to only include assigned ones
        const filteredSections = sections.map(section => {
            const filteredSubsections = section.subsections.filter(sub =>
                assignedSubsections.includes(sub.id)
            );
            return {
                ...section.toObject(),
                subsections: filteredSubsections
            };
        });

        res.status(200).json({ sections: filteredSections });
    } catch (err) {
        console.error("Error fetching sections for student", err);
        res.status(500).json({ error: 'Internal server error while fetching sections' });
    }
}


async function handleGetAttendance(req, res) {
    console.log("Student attendance called")
    const { subsectionId, username } = req.body;

    try {

        const user = await User.findOne({ username: username })
        if (!user) {
            return res.status(404).json({ message: "No user found" })
        }

        const student = await Student.findOne({ userId: user.userId })
        if (!student) {
            return res.status(404).json({ message: "No student found" })
        }

        const rollNumber = student.rollNumber;

        const attendedClasses = await Upload.find({
            subsectionId,
            presentStudents: {
                $elemMatch: { rollNumber }
            }
        });

        // Fetch all uploads for the given subsection
        const totalClasses = await Upload.find({ subsectionId });

        const totalClassCount = totalClasses.length;

        // If no classes, mark 0% attendance for all
        if (totalClassCount === 0) {
            return res.json({ message: "No classes happend", attendence: { "percent": 0, "attended": 0, "total": 0 } });
        }

        const percent = (attendedClasses.length / totalClassCount) * 100



        return res.json({
            message: "Attendance calculated",
            attendance: {
                percent: Number(percent.toFixed(2)), // Optional: round to 2 decimal places
                attended: attendedClasses.length,
                total: totalClassCount
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching attendance" });
    }
}
module.exports = { handleCreateStudent, handleGetStudent, handleGetAllStudents, handleUploadStudents, handleDeleteStudent, handleGetByRolls, handleGetStudentSections, handleGetAttendance };