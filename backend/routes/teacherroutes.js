const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {handleCreateTeacher, handleGetTeacher, handleGetAllTeachers, handleUploadTeachers, handleDeleteTeacher, handleGetByIds, handleGetTSections} = require("../controllers/handleTeacher");

const router = express.Router();

router.post("/createTeacher", authMiddleware(['admin']),handleCreateTeacher);
router.get("/getTeacher", authMiddleware(), handleGetTeacher );
router.get("/getAllTeachers", authMiddleware(), handleGetAllTeachers);
router.post("/uploadTeachers", authMiddleware(['admin']), handleUploadTeachers);
router.post("/deleteTeacher", authMiddleware(['admin']), handleDeleteTeacher);
router.post('/getTeachersByIds', authMiddleware(), handleGetByIds)
router.post('/getTSections', authMiddleware(['teacher']), handleGetTSections)

module.exports = router;
