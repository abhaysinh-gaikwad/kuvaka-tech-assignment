const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routes/authRoutes");
const chatroomRoutes = require("./routes/chatroomRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const rateLimitMiddleware = require("./middleware/rateLimitMiddleware");
const pool = require("./config/db");

const app = express();

app.use(cors());

app.use((req, res, next) => {
  if (req.originalUrl === "/webhook/stripe") {
    console.log("Applying express.raw for /webhook/stripe");
    return express.raw({ type: "application/json" })(req, res, next);
  }
  express.json()(req, res, next);
});

app.use(async (req, res, next) => {
  if (req.path.startsWith("/auth") || req.path === "/webhook/stripe") {
    console.log("Skipping rate limit for", req.path);
    return next();
  }
  console.log("Rate Limit Middleware Triggered for", req.path);
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await pool.query(
      "SELECT subscription_tier FROM users WHERE id = $1",
      [decoded.userId]
    );
    if (user.rows[0]?.subscription_tier === "basic") {
      req.user = decoded;
      return rateLimitMiddleware(req, res, next);
    }
    next();
  } catch (error) {
    console.error("Rate limit middleware error:", error.message);
    next();
  }
});

app.use("/auth", authRoutes);
app.use("/", stripeRoutes);
app.use("/chatroom", authMiddleware, chatroomRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;
