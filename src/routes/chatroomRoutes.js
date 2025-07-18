const express = require("express");
const router = express.Router();
const {
  createChatroom,
  getChatrooms,
  getChatroom,
  sendMessage,
  getMessagesByChatroom
} = require("../controllers/chatroomController");
const authMiddleware = require("../middleware/authMiddleware");
const rateLimitMiddleware = require("../middleware/rateLimitMiddleware");
const validate = require("../middleware/validationMiddleware");
const {
  createChatroomSchema,
  sendMessageSchema
} = require("../validators/chatroomValidators");

router.post(
  "/",
  authMiddleware,
  validate(createChatroomSchema),
  createChatroom
);
router.get("/", authMiddleware, getChatrooms);
router.get("/:id", authMiddleware, getChatroom);
router.get("/:id/messages", authMiddleware, getMessagesByChatroom);
router.post(
  "/:id/message",
  authMiddleware,
  validate(sendMessageSchema),
  rateLimitMiddleware,
  sendMessage
);

module.exports = router;

