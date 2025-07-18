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
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }
    const hashedPassword = await bcrypt.hash("default", 10);
    await pool.query(
      "INSERT INTO users (mobile, name, password, subscription_tier) VALUES ($1, $2, $3, $4)",
      [mobile, name, hashedPassword, "basic"]
    );
    res.status(201).json({
      success: true,
      data: {},
      message: "User registered successfully"
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during signup"
    });
  }
};

const sendOTP = async (req, res) => {
  const { mobile } = req.body;
  const otp = generateOTP();
  try {
    const user = await pool.query("SELECT * FROM users WHERE mobile = $1", [
      mobile
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }
    await pool.query("UPDATE users SET otp = $1 WHERE mobile = $2", [
      otp,
      mobile
    ]);
    res.status(200).json({
      success: true,
      data: { otp },
      message: "OTP sent successfully"
    });
  } catch (error) {
    console.error("Send OTP error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during OTP generation"
    });
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
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }
    const token = jwt.sign(
      { userId: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    await pool.query("UPDATE users SET otp = NULL WHERE mobile = $1", [mobile]);
    res.status(200).json({
      success: true,
      data: { token },
      message: "OTP verified successfully"
    });
  } catch (error) {
    console.error("Verify OTP error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during OTP verification"
    });
  }
};

const forgotPassword = async (req, res) => {
  const { mobile } = req.body;
  const otp = generateOTP();
  try {
    const user = await pool.query("SELECT * FROM users WHERE mobile = $1", [
      mobile
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }
    await pool.query("UPDATE users SET otp = $1 WHERE mobile = $2", [
      otp,
      mobile
    ]);
    res.status(200).json({
      success: true,
      data: { otp },
      message: "OTP sent for password reset"
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during password reset OTP generation"
    });
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
    res.status(200).json({
      success: true,
      data: {},
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during password change"
    });
  }
};

const getUser = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await pool.query(
      "SELECT id, mobile, name, subscription_tier FROM users WHERE id = $1",
      [userId]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      data: user.rows[0],
      message: "User details retrieved successfully"
    });
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error retrieving user details"
    });
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
