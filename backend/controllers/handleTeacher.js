const Teacher = require("../schema/Teacher.js");
const User = require('../schema/User');
const Section = require('../schema/Section.js');
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { validateImageUrl } = require('../utils/validateURL.js');

async function handleCreateTeacher(req, res) {
    const { userId, teacherId, name, email, faceimageurl, username, password } = req.body;

    const existing = await Teacher.findOne({ userId: userId });
    if (existing) return res.status(400).json({ message: "Teacher exists", isCreated: false });

    const existingUser = await User.findOne({ username: username });
    if (existingUser) return res.status(400).json({ message: "Username already exists", isCreated: false });


    try {
        const isValidURL = validateImageUrl(faceimageurl);
        if (!isValidURL) {
            res.status(500).json({ message: "Inavlid face image url", isCreated: false })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const teacher = await Teacher.create({ userId, teacherId, name, email, faceimageurl });
        await User.create({ username, password: hashedPassword, userId, role: "teacher" });
        res.json({ message: "Teacher created", teacher: teacher, isCreated: true });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error while creating teacher", isCreated: false })
    }
}

async function handleGetTeacher(req, res) {
    const { userId, teacherId } = req.body;
    const query = {};
    if (userId) query.userId = userId;
    else if (teacherId) query.teacherId = teacherId;

    try {
        const teacher = await Teacher.findOne(query);
        res.status(200).json({ teacher: teacher, message: "Teacher fetched successfullly", isSuccess: true })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error while fetchinh teacher", isSuccess: false })
    }
}

async function handleGetAllTeachers(req, res) {
    try {
        const teachers = await Teacher.find();
        res.status(200).json({ teachers: teachers, message: "Teachers fetched successfullly", isSuccess: true })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error while fetchinh teacher", isSuccess: false })
    }
}

async function handleUploadTeachers(req, res) {
    console.log("Upload Teachers called");
    try {
        const teachers = req.body.data;
        const existingUsers = await User.find();
        const existingUsernames = existingUsers.map(user => user.username);

        const newTeachers = teachers.filter(teacher => !existingUsernames.includes(teacher.username));
        const fails = [];

        for (const teacher of newTeachers) {
            const hashedPassword = await bcrypt.hash(teacher.password, 10);
            const userId = crypto.randomUUID();

            const teacherData = {
                userId,
                teacherId: teacher.teacherId,
                name: teacher.name,
                email: teacher.email,
                faceimageurl: teacher.faceimageurl,
                username: teacher.username,
                password: hashedPassword,
            };

            const userData = {
                username: teacher.username,
                password: hashedPassword,
                userId,
                role: "teacher",
            };

            try {
                const faceimageurl = teacher.faceimageurl
                const isValidURL = validateImageUrl(faceimageurl);
                if (!isValidURL) {
                    throw new Error("Invalid face image url")
                }
                const createdTeacher = await Teacher.create(teacherData);
                try {
                    await User.create(userData);
                } catch (userErr) {
                    // Roll back teacher if user creation fails
                    await Teacher.deleteOne({ _id: createdTeacher._id });
                    fails.push(teacher); // Push original object
                }
            } catch (teacherErr) {
                fails.push(teacher); // Push original object
            }
        }
        res.status(200).json({ message: "Upload process completed", failedUploads: fails, isSuccess: fails.length === 0 });

    } catch (err) {
        console.error("Error in upload process:", err);
        res.status(500).json({ message: err.message, isSuccess: false });
    }
}

async function handleDeleteTeacher(req, res) {
    const { teacherId } = req.body;
    try {
        const teacher = await Teacher.findOneAndDelete({ teacherId: teacherId });
        if (!teacher) return res.status(404).json({ message: "Teacher not found", isDeleted: false });
        await User.deleteOne({ userId: teacher.userId });
        res.status(200).json({ message: "Teacher deleted successfully", isDeleted: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error while deleting teacher", isDeleted: false });
    }
}

async function handleGetByIds(req, res) {
    try {
        const { teacherIds } = req.body;

        if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
            return res.status(400).json({ error: 'teacherIds must be a non-empty array.' });
        }

        const teachers = await Teacher.find({ teacherId: { $in: teacherIds } });

        res.status(200).json({ teachers: teachers });
    } catch (error) {
        console.error('Error fetching teachers by IDs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleGetTSections(req, res) {
    try {
        const { username } = req.body;

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find the teacher
        const teacher = await Teacher.findOne({ userId: user.userId });
        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        const assignedSubsections = teacher.assignedSections;

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
        console.error("Error fetching sections for teacher", err);
        res.status(500).json({ error: 'Internal server error while fetching sections' });
    }
}



module.exports = { handleCreateTeacher, handleGetTeacher, handleGetAllTeachers, handleUploadTeachers, handleDeleteTeacher, handleGetByIds, handleGetTSections }