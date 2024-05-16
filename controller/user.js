const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, mobile } = req.body;
    const formattedEmail = email.toLowerCase();
    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ errorMessage: "Bad request" });
    }
    const isExistingUser = await User.findOne({ email: formattedEmail });
    if (isExistingUser) {
      return res.status(409).json({ errorMessage: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = new User({
      name,
      email: formattedEmail,
      password: hashedPassword,
      mobile,
    });
    await userData.save();
    res.json({
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ errorMessage: "Bad request" });
    }
    const userDetails = await User.findOne({ email: email });
    if (!userDetails) {
      return res.status(409).json({ errorMessage: "User doesn't exist" });
    }
    const isPasswordMatch = await bcrypt.compare(
      password,
      userDetails.password
    );
    if (!isPasswordMatch) {
      return res.status(409).json({ errorMessage: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: userDetails._id },
      process.env.SECRET_KEY,
      {
        expiresIn: "60h",
      }
    );

    res.json({
      message: "User logged in",
      token: token,
      userId: userDetails._id,
      name: userDetails.name,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
