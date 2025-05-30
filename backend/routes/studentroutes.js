const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const { handleCreateStudent, handleGetStudent, handleGetAllStudents, handleUploadStudents, handleDeleteStudent, handleGetByRolls, handleGetStudentSections, handleGetAttendance, handleGetAllRolls } = require("../controllers/handleStudent");

router.post("/createStudent", authMiddleware(['admin']), handleCreateStudent);
router.get("/getStudent", authMiddleware(), handleGetStudent)
router.get("/getAllStudents",authMiddleware() ,handleGetAllStudents);
router.post("/uploadStudents", authMiddleware(['admin']), handleUploadStudents);
router.post("/deleteStudent", authMiddleware(['admin']), handleDeleteStudent);
router.post('/getStudentsByRolls', authMiddleware(), handleGetByRolls);
router.post("/getStudentSections", authMiddleware(), handleGetStudentSections)
router.post("/getStudentAttendance", authMiddleware(), handleGetAttendance)


module.exports = router;