const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../schema/User");
const authMiddleware = require("../middleware/authMiddleware");

const { handleCreateUser, handleLogin,handleChangePassword, handleGetUser, handleGetAllUsers, handleGetMe} = require("../controllers/handleUser");

const router = express.Router();

router.post("/create-admin", async (req, res) => {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const user = await User.create({
    userId: "admin_user_id",
    username: "admin",
    password: hashedPassword,
    role: "admin"
  });

  res.json(user);
});

router.post("/createUser", authMiddleware(['admin']), handleCreateUser);
router.post("/login", handleLogin);
router.post("/change-password", authMiddleware(), handleChangePassword);
router.get("/getUser", authMiddleware(), handleGetUser);
router.get("/getAllUsers", authMiddleware(), handleGetAllUsers);
router.get('/me', authMiddleware(), handleGetMe);


module.exports = router;