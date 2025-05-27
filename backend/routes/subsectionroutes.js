const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const {handleCreateSubSection, handleGetSubSection, handleAddTeachersToSubSection, handleAddStudentsToSubSection, handleGetAttendance} = require("../controllers/handleSubSection");

router.post("/createsubsection", authMiddleware(['admin']), handleCreateSubSection);
router.post("/getsubsection", authMiddleware(), handleGetSubSection)
router.post("/addTeachers", authMiddleware(['admin']), handleAddTeachersToSubSection)
router.post("/addStudents", authMiddleware(['admin']), handleAddStudentsToSubSection)
router.post("/getAttendance", authMiddleware(['admin','teacher']), handleGetAttendance)

module.exports = router;