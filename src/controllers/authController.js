const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { generateOTP } = require("../utils/otpGenerator");

const signup = async (req, res) => {
  const { mobile, name } = req.body;
  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE mobile = $1",
      [mobile]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash("default", 10); // Default password
    await pool.query(
      "INSERT INTO users (mobile, name, password, subscription_tier) VALUES ($1, $2, $3, $4)",
      [mobile, name, hashedPassword, "basic"]
    );
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const sendOTP = async (req, res) => {
  const { mobile } = req.body;
  const otp = generateOTP();
  try {
    await pool.query("UPDATE users SET otp = $1 WHERE mobile = $2", [
      otp,
      mobile
    ]);
    res.status(200).json({ otp }); 
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body;
  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE mobile = $1 AND otp = $2",
      [mobile, otp]
    );
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    const token = jwt.sign(
      { userId: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    await pool.query("UPDATE users SET otp = NULL WHERE mobile = $1", [mobile]);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { mobile } = req.body;
  const otp = generateOTP();
  try {
    await pool.query("UPDATE users SET otp = $1 WHERE mobile = $2", [
      otp,
      mobile
    ]);
    res.status(200).json({ otp });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const changePassword = async (req, res) => {
  const { password } = req.body;
  const userId = req.user.userId;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId
    ]);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getUser = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await pool.query(
      "SELECT id, mobile, name, subscription_tier FROM users WHERE id = $1",
      [userId]
    );
    res.status(200).json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  signup,
  sendOTP,
  verifyOTP,
  forgotPassword,
  changePassword,
  getUser
};
