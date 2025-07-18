const Queue = require("bull");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../config/db");
const redis = require("../config/redis");

const geminiQueue = new Queue("gemini-queue", {
  redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }
});

const genAI = new GoogleGenerativeAI("AIzaSyAhMMrS87vSMFGbpQed4DuDI8SLTgMglC4");

geminiQueue.process(async (job) => {
  const { chatroomId, userId, message } = job.data;
  try {
    const model = genAI.getGenerativeModel({ model: "gemma-3-4b-it" });
    const result = await model.generateContent(message);
    const response = result.response.text();
    await pool.query(
      "INSERT INTO messages (chatroom_id, user_id, content, is_user) VALUES ($1, $2, $3, $4)",
      [chatroomId, userId, response, false]
    );
  } catch (error) {
    console.error("Gemini API error:", error);
  }
});

const addToGeminiQueue = async (data) => {
  let job = await geminiQueue.add(data);
  return job;
};

module.exports = { addToGeminiQueue };
