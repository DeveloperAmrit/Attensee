const Section = require('../schema/Section');
const Teacher = require('../schema/Teacher');
const Student = require('../schema/Student');
const SubSection = require('../schema/SubSection');
const Upload = require('../schema/Upload');

async function handleCreateSubSection(req, res) {
    const { sectionId, subsectionId, name } = req.body;

    const existing = await SubSection.findOne({ subsectionId: subsectionId });
    if (existing) return res.status(400).json({ message: 'Section exists', isCreated: false });
    try {
        const section = await Section.findOne({ sectionId: sectionId });
        const subsection = await SubSection.create({ sectionId, subsectionId, name });
        section.subsections.push({ id: subsectionId, name });
        await section.save();
        res.json({ message: 'Section created', subsection: subsection, isCreated: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error while creating section', isCreated: false });
    }
}

async function handleGetSubSection(req, res) {
    const { subsectionId } = req.body;
    try {
        const section = await SubSection.findOne({ subsectionId: subsectionId });
        if (!section) return res.status(404).json({ message: 'Section not found' });
        res.json({ message: 'Section found', subsection: section });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error while fetching section' });
    }
}

async function handleAddTeachersToSubSection(req, res) {
    const { subsectionId, teacherIds } = req.body;
    if (!subsectionId || !Array.isArray(teacherIds) || teacherIds.length === 0) {
        return res.status(400).json({ message: 'subsectionId and teacherIds (array) are required', isSuccess: false });
    }
    try {
        const subsection = await SubSection.findOne({ subsectionId: subsectionId });
        if (!subsection) {
            return res.status(404).json({ message: 'Subsection not found', isSuccess: false });
        }
        // Only add new teacher IDs
        const newTeacherIds = teacherIds.filter(id => !subsection.assignedTeachers.includes(id));
        if (newTeacherIds.length === 0) {
            return res.status(400).json({ message: 'No new teachers to add', isSuccess: false });
        }
        subsection.assignedTeachers.push(...newTeacherIds);
        // Ensure only unique teacher IDs are stored
        subsection.assignedTeachers = [...new Set(subsection.assignedTeachers)];
        await subsection.save();
        await Promise.all(
            newTeacherIds.map(async teacherId => {
                const teacher = await Teacher.findOne({ teacherId: teacherId })
                teacher.assignedSections.push(subsectionId)
                teacher.assignedSections = [...new Set(teacher.assignedSections)]
                await teacher.save()
            })
        )
        return res.json({ message: 'Teachers added', added: newTeacherIds, isSuccess: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error adding teachers', isSuccess: false });
    }
}

async function handleAddStudentsToSubSection(req, res) {
    const { subsectionId, studentRolls } = req.body;
    if (!subsectionId || !Array.isArray(studentRolls) || studentRolls.length === 0) {
        return res.status(400).json({ message: 'subsectionId and studentRolls (array) are required', isSuccess: false });
    }
    try {
        const subsection = await SubSection.findOne({ subsectionId: subsectionId });
        if (!subsection) {
            return res.status(404).json({ message: 'Subsection not found', isSuccess: false });
        }
        // Only add new student rolls
        const newStudentRolls = studentRolls.filter(roll => !subsection.studentRolls.includes(roll));
        if (newStudentRolls.length === 0) {
            return res.status(400).json({ message: 'No new students to add', isSuccess: false });
        }
        subsection.studentRolls.push(...newStudentRolls);
        // Ensure only unique student rolls are stored
        subsection.studentRolls = [...new Set(subsection.studentRolls)];
        await subsection.save();
        await Promise.all(
            newStudentRolls.map(async rollNumber => {
                const student = await Student.findOne({ rollNumber })
                student.assignedSections.push(subsectionId)
                student.assignedSections = [...new Set(student.assignedSections)]
                await student.save()
            })
        )
        return res.json({ message: 'Students added', added: newStudentRolls, isSuccess: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error adding students', isSuccess: false });
    }
}


async function handleGetAttendance(req, res) {
    console.log("Get attendence called")
    const { subsectionId, rollNumbers } = req.body;
    const result = {};

    try {
        // Fetch all uploads for the given subsection
        const totalClasses = await Upload.find({ subsectionId });

        const totalClassCount = totalClasses.length;

        // If no classes, mark 0% attendance for all
        if (totalClassCount === 0) {
            rollNumbers.forEach(roll => {
                result[roll] = 0;
            });
            return res.json(result);
        }

        // Iterate over each rollNumber to calculate attendance
        for (let rollNumber of rollNumbers) {
            let attendedCount = 0;

            for (let upload of totalClasses) {
                // Check if this rollNumber is in presentStudents with active alertState
                if (
                    upload.presentStudents.some(
                        student => student.rollNumber === rollNumber
                    )
                ) {
                    attendedCount++;
                }
            }

            result[rollNumber] = parseFloat(((attendedCount / totalClassCount) * 100).toFixed(2));
        }

        res.json({message: "Attendence fetched", attendence: result, totalClasses: totalClassCount});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching attendance" });
    }
}

module.exports = {
    handleCreateSubSection,
    handleGetSubSection,
    handleAddTeachersToSubSection,
    handleAddStudentsToSubSection,
    handleGetAttendance
};
