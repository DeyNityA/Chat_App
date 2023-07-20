const express = require("express");
const router = new express.Router();
const User = require("../model/userCollection");
const { createToken } = require("../service/auth");
const { getUser } = require("../service/auth");
const Message= require('../model/messageCollection')
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username: username });
    const emailCheck = await User.findOne({ email: email });
    if (usernameCheck) {
      return res
        .status(400)
        .json({ message: "Username already exists", status: false });
    } else if (emailCheck) {
      return res
        .status(400)
        .json({ message: "Email already exists", status: false });
    }

    const user = await User.create({ username, email, password });
    return res.status(200).json({ status: true, user: user });
  } catch (err) {
    if (err) {
      return res.json({ status: false, message: "Internal server error" });
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const token = await createToken(user);
    return res.json({ status: true, token: token });
  } catch (err) {
    if (err) {
      return res.json({ status: false, msg: "Internal server error" });
    }
  }
});

router.post("/userauth", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.send({ status: false });
    const user = await getUser(token);
    if (!user) return res.send({ status: false });
    const dbuser = await User.findOne({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
    if (!dbuser) return res.send({ status: false });
    return res.send({ status: true, user: user });
  } catch (err) {
    if (err) {
      return res.json({ status: false, msg: "Internal server error" });
    }
  }
});
router.post("/setAvatar/:id", async (req, res) => {
  try {
    const userid = req.params?.id;
    const { img } = req.body;
    const userData = await User.findByIdAndUpdate(
      { _id: userid },
      {
        $set: {
          isAvatarImageSet: true,
          avatarImage: img,
        },
      }
    );
    if (!userData) return res.send({ isSet: false });
    else return res.send({ isSet: true });
  } catch (err) {
    if (err) {
      return res.json({ isSet: false, msg: "Internal server error" });
    }
  }
});

router.get("/allusers/:id", async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
      "isOnline"
    ]);
    if (!users) return res.send({ isSet: false });
    else return res.send({ status: true, users: users });
  } catch (err) {
    if (err) {
      return res.json({ status: false, msg: "Internal server error" });
    }
  }
});

router.post('/setmsg',async (req,res)=>{
  try{
    const {msg,sendTo,sendBy} = req.body;
    const mssg=await Message.create({
      msg:msg,
      sendTo:sendTo,
      sendBy:sendBy
    })
    res.send({status:true});
   }catch(err){
    if (err) {
      return res.json({ status: false, msg: "Internal server error" });
    }
  }
})
router.post('/getmsg',async (req,res)=>{
  try{
    const {user,oppuser} = req.body;
    const messages=await Message.find({$or:[{sendBy:user,sendTo:oppuser},{sendBy:oppuser,sendTo:user}]}).sort({createdAt:1})

    const projectMessages= messages.map((mssg)=>{
      return {
        fromSelf : mssg.sendBy == user ? true : false,
        message: mssg.msg
      }
    })
    res.send({status:true,projectMessages:projectMessages});
   }catch(err){
    if (err) {
      return res.json({ status: false, msg: "Internal server error" });
    }
  }
})



module.exports = router;
