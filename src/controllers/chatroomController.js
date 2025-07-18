const pool = require("../config/db");
const redis = require("../config/redis");
const { addToGeminiQueue } = require("../queues/geminiQueue");

const createChatroom = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;
  try {
    const chatroom = await pool.query(
      "INSERT INTO chatrooms (name, user_id) VALUES ($1, $2) RETURNING *",
      [name, userId]
    );
    await redis.del(`chatrooms:${userId}`);
    res.status(201).json(chatroom.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getChatrooms = async (req, res) => {
  const userId = req.user.userId;
  try {
    const cached = await redis.get(`chatrooms:${userId}`);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }
    const chatrooms = await pool.query(
      "SELECT * FROM chatrooms WHERE user_id = $1",
      [userId]
    );
    await redis.set(
      `chatrooms:${userId}`,
      JSON.stringify(chatrooms.rows),
      "EX",
      600
    ); 
    res.status(200).json(chatrooms.rows);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const getChatroom = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  try {
    const chatroom = await pool.query(
      "SELECT * FROM chatrooms WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (chatroom.rows.length === 0) {
      return res.status(404).json({ error: "Chatroom not found" });
    }
    res.status(200).json(chatroom.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const sendMessage = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.user.userId;
  try {
    const user = await pool.query(
      "SELECT subscription_tier, message_count, last_message_date FROM users WHERE id = $1",
      [userId]
    );
    if (
      user.rows[0].subscription_tier === "basic" &&
      user.rows[0].message_count >= 50
    ) {
      const lastMessageDate = new Date(user.rows[0].last_message_date);
      const today = new Date();
      if (lastMessageDate.toDateString() === today.toDateString()) {
        return res.status(429).json({ error: "Daily message limit reached" });
      } else {
        await pool.query("UPDATE users SET message_count = 0 WHERE id = $1", [
          userId
        ]);
      }
    }
    await pool.query(
      "INSERT INTO messages (chatroom_id, user_id, content, is_user) VALUES ($1, $2, $3, $4)",
      [id, userId, message, true]
    );
    await pool.query(
      "UPDATE users SET message_count = message_count + 1, last_message_date = $1 WHERE id = $2",
      [new Date(), userId]
    );
    console.log(`Message sent to chatroom ${id} by user ${userId}`);
    let response = await addToGeminiQueue({ chatroomId: id, userId, message });
    console.log("Response from Gemini API:", response);
    console.log(`Message added to Gemini queue for chatroom ${id}`);
    res.status(200).json({ message: "Message sent, processing response" });
    
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createChatroom, getChatrooms, getChatroom, sendMessage };
