const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const {handleCreateSection, handleGetSection, handleGetAllSections } = require("../controllers/handleSection");

router.post("/createsection", authMiddleware(['admin']), handleCreateSection);
router.get("/getsection", authMiddleware(), handleGetSection)
router.get("/getallsections", authMiddleware(), handleGetAllSections)

module.exports = router;