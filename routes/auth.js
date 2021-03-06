const express = require("express");
const router = express.Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const Profile = require("../models/Profile");

//Register
router.post("/register", async (req, res) => {
    const newUser = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_KEY
      ).toString(),
    });
    try {
      const user = await newUser.save();
      try {
        const newProfile  = new Profile({ user: user._id }).save()
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json(error);
      }
    } catch (error) {
      res.status(500).json(error);
    }
  });
  
//Login
router.post("/login", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      !user && res.status(401).json("Wrong password or username!");
  
      const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
      const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
  
      originalPassword !== req.body.password &&
        res.status(401).json("Wrong password or username!");
  
      const { password, ...info } = user._doc;
  
      res.status(200).json({ ...info });
    } catch (err) {
      console.log(err)
      res.status(500).json("This is an error");
    }
});

module.exports = router;
  