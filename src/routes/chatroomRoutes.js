const express = require("express");
const router = express.Router();
const {
  createChatroom,
  getChatrooms,
  getChatroom,
  sendMessage
} = require("../controllers/chatroomController");
const authMiddleware = require("../middleware/authMiddleware");
const rateLimitMiddleware = require("../middleware/rateLimitMiddleware");

router.post("/", authMiddleware, createChatroom);
router.get("/", authMiddleware, getChatrooms);
router.get("/:id", authMiddleware, getChatroom);
router.post("/:id/message", authMiddleware, rateLimitMiddleware, sendMessage);

module.exports = router;
