const User = require("../schema/User.js");
const bcrypt =  require("bcrypt");
const jwt = require("jsonwebtoken");

async function handleCreateUser(req,res){
    const {userId, username, password, role } = req.body;

    const existing = await User.findOne({ username: username });
    if (existing) return res.status(400).json({ message: "User exists", isCreated: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ userId, username, password: hashedPassword, role });
    res.json({ message: "User created", user:user, isCreated: true });
}

async function handleLogin(req,res){
    const { username, password } = req.body;
    const user = await User.findOne({   username: username });
    if (!user) return res.status(400).json({ message: "User does not exist", isSuccess: false });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials", isSuccess: false });
    const token = jwt.sign({ userId: user.userId, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token: token, user: { userId: user.userId, username: user.username, role: user.role }, message: "Login successful", isSuccess: true });
}

async function handleChangePassword(req,res){
    console.log("Change password called");
    const { oldPassword, newPassword } = req.body;
    const user = await User.findOne({ userId: req.user.userId });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password", isSuccess: false });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password changed successfully", isSuccess: true });
}

async function handleGetUser(req,res){
    const {userId} = req.body;
    try{
        const user = await User.findOne({userId:userId});
        const { password, ...userWithoutPassword } = user;
        res.status(200).json({user: userWithoutPassword , message: "User fetched successfullly" ,isSuccess: true})
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "Error while fetchinh user" , isSuccess: false})
    }
}

async function handleGetAllUsers(req,res){
    try{
        const users = await User.find();
        const usersWithoutPasswords = users.map(({ password, ...user }) => user);
        res.status(200).json({users: usersWithoutPasswords , message: "Users fetched successfullly" ,isSuccess: true})
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "Error while fetchinh user" , isSuccess: false})
    }
}

async function handleGetMe(req,res){
    console.log("Get me called");
    const {userId} = req.user;
    try{
        const user = await User.findOne({userId:userId}).lean();
        const { password, ...userWithoutPassword } = user;
        res.status(200).json({user: userWithoutPassword , message: "User fetched successfullly" ,isSuccess: true})
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: "Error while fetchinh user" , isSuccess: false})
    }
}

module.exports = {handleCreateUser,handleLogin, handleChangePassword, handleGetUser, handleGetAllUsers, handleGetMe}