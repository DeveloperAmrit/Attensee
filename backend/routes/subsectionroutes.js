const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const {handleCreateSubSection, handleGetSubSection, handleAddTeachersToSubSection, handleAddStudentsToSubSection, handleGetAttendance,handleGetAllRolls, handleGetPresentStudentsByUploadId, handleUpdateAttendence} = require("../controllers/handleSubSection");

router.post("/createsubsection", authMiddleware(['admin']), handleCreateSubSection);
router.post("/getsubsection", authMiddleware(), handleGetSubSection)
router.post("/addTeachers", authMiddleware(['admin']), handleAddTeachersToSubSection)
router.post("/addStudents", authMiddleware(['admin']), handleAddStudentsToSubSection)
router.post("/getAttendance", authMiddleware(['admin','teacher']), handleGetAttendance)
router.post("/getAllRollNumbers", authMiddleware(), handleGetAllRolls)
router.post("/getPresentStudentsByUploadId", authMiddleware(), handleGetPresentStudentsByUploadId)
router.post("/updateAttendence",authMiddleware(), handleUpdateAttendence)

module.exports = router;